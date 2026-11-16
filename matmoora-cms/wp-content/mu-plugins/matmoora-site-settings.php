<?php
/**
 * Plugin Name: Matmoora Site Settings
 * Description: Site-wide settings editors can change from the WordPress dashboard. Exposes a `matmooraSettings` root field via WPGraphQL so the Next.js layer can read the live values on every request. Settings → Matmoora.
 * Version: 1.0.0
 * Author: Matmoora
 */

if (!defined('ABSPATH')) exit;

/**
 * The single source of truth for the available settings. Add new keys
 * here with their default + list of allowed values and the admin UI,
 * sanitiser, and GraphQL field all pick them up.
 */
function matmoora_site_settings_schema(): array {
    return [
        'theme' => [
            'label'   => __('Theme', 'matmoora'),
            'desc'    => __('Site-wide palette. "Day" is the default navy background; "Dusk" swaps the palette so dark orange is the background.', 'matmoora'),
            'type'    => 'select',
            'default' => 'day',
            'choices' => [
                'day'  => __('Day (navy background, default)', 'matmoora'),
                'dusk' => __('Dusk (dark orange background)', 'matmoora'),
            ],
        ],
    ];
}

/**
 * Current value for a setting: the stored option, or the schema default.
 */
function matmoora_site_setting(string $key): string {
    $schema = matmoora_site_settings_schema();
    if (!isset($schema[$key])) return '';
    $value = get_option("matmoora_{$key}", $schema[$key]['default']);
    return array_key_exists($value, $schema[$key]['choices']) ? $value : $schema[$key]['default'];
}

// ----------------------------------------------------------------------
// Admin: Settings → Matmoora
// ----------------------------------------------------------------------

add_action('admin_menu', function () {
    add_options_page(
        __('Matmoora site settings', 'matmoora'),
        __('Matmoora', 'matmoora'),
        'manage_options',
        'matmoora-site-settings',
        'matmoora_site_settings_render_page'
    );
});

add_action('admin_init', function () {
    foreach (matmoora_site_settings_schema() as $key => $cfg) {
        register_setting(
            'matmoora_site_settings',
            "matmoora_{$key}",
            [
                'type'              => 'string',
                'default'           => $cfg['default'],
                'sanitize_callback' => function ($value) use ($cfg) {
                    return array_key_exists($value, $cfg['choices']) ? $value : $cfg['default'];
                },
                'show_in_rest'      => false, // we expose via WPGraphQL, not REST
            ]
        );
    }
});

function matmoora_site_settings_render_page(): void {
    if (!current_user_can('manage_options')) return;
    $schema = matmoora_site_settings_schema();
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Matmoora site settings', 'matmoora'); ?></h1>
        <p><?php esc_html_e('These values are read by the public site on every request via WPGraphQL. Changes go live within a minute of saving (and immediately after a Next.js revalidation).', 'matmoora'); ?></p>
        <form method="post" action="options.php">
            <?php settings_fields('matmoora_site_settings'); ?>
            <table class="form-table" role="presentation">
                <?php foreach ($schema as $key => $cfg): ?>
                    <?php $value = matmoora_site_setting($key); ?>
                    <tr>
                        <th scope="row">
                            <label for="matmoora_<?php echo esc_attr($key); ?>"><?php echo esc_html($cfg['label']); ?></label>
                        </th>
                        <td>
                            <?php if ($cfg['type'] === 'select'): ?>
                                <select
                                    id="matmoora_<?php echo esc_attr($key); ?>"
                                    name="matmoora_<?php echo esc_attr($key); ?>"
                                >
                                    <?php foreach ($cfg['choices'] as $choice => $label): ?>
                                        <option
                                            value="<?php echo esc_attr($choice); ?>"
                                            <?php selected($value, $choice); ?>
                                        >
                                            <?php echo esc_html($label); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                                <p class="description"><?php echo esc_html($cfg['desc']); ?></p>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// ----------------------------------------------------------------------
// WPGraphQL: root query `matmooraSettings { theme }`
// ----------------------------------------------------------------------

add_action('graphql_register_types', function () {
    if (!function_exists('register_graphql_object_type')) return;

    register_graphql_object_type('MatmooraSettings', [
        'description' => __('Site-wide settings editors control from Settings → Matmoora.', 'matmoora'),
        'fields'      => [
            'theme' => [
                'type'        => 'String',
                'description' => __('Active palette: "day" (navy background) or "dusk" (dark orange background).', 'matmoora'),
                'resolve'     => fn() => matmoora_site_setting('theme'),
            ],
        ],
    ]);

    register_graphql_field('RootQuery', 'matmooraSettings', [
        'type'        => 'MatmooraSettings',
        'description' => __('Site-wide settings for the Matmoora public site.', 'matmoora'),
        'resolve'     => fn() => (object) [], // fields resolve independently
    ]);
});

// ----------------------------------------------------------------------
// Revalidate the Next.js front-end on save.
// ----------------------------------------------------------------------

add_action('update_option_matmoora_theme', 'matmoora_site_settings_revalidate', 10, 0);
add_action('add_option_matmoora_theme',    'matmoora_site_settings_revalidate', 10, 0);

function matmoora_site_settings_revalidate(): void {
    $public = rtrim((string) getenv('MATMOORA_PUBLIC_URL') ?: 'https://matmoora.org', '/');
    $secret = (string) getenv('MATMOORA_REVALIDATE_SECRET');
    if (!$secret) return; // not wired yet → no-op, next-intl will catch up on the natural ISR cycle.
    wp_remote_post("{$public}/api/revalidate", [
        'timeout'  => 4,
        'blocking' => false,
        'headers'  => [
            'Content-Type'   => 'application/json',
            'X-Matmoora-Key' => $secret,
        ],
        'body'     => wp_json_encode(['tag' => 'wp']),
    ]);
}
