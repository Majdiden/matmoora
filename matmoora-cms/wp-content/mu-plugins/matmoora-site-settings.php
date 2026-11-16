<?php
/**
 * Plugin Name: Matmoora Site Settings
 * Description: Site-wide settings editors control from the WordPress dashboard. Settings → Matmoora. Exposes `matmooraSettings { theme, palettes }` via WPGraphQL so the Next.js layer can read live values on every request.
 * Version: 1.1.0
 * Author: Matmoora
 */

if (!defined('ABSPATH')) exit;

/**
 * Palette token roles. Each preset (day, dusk) edits four colors:
 *   bg      → page background      (maps to --color-navy on the frontend)
 *   surface → card/panel background (maps to --color-cream)
 *   accent  → interactive accent    (maps to --color-orange)
 *   ink     → body text on surface  (maps to --color-ink)
 *
 * The role → CSS-variable mapping is kept on the Next.js side so the two
 * repos can deviate in naming if we ever want to.
 */
function matmoora_palette_tokens(): array {
    return [
        'bg'      => __('Background', 'matmoora'),
        'surface' => __('Surface (cards, panels)', 'matmoora'),
        'accent'  => __('Accent (buttons, links)', 'matmoora'),
        'ink'     => __('Ink (text on surface)', 'matmoora'),
    ];
}

/**
 * Hex defaults per preset. These match the hard-coded values the site
 * shipped with, so a fresh install with an empty options table renders
 * identically to the pre-settings site.
 */
function matmoora_palette_defaults(): array {
    return [
        'day' => [
            'bg'      => '#20234f',
            'surface' => '#f7e6d2',
            'accent'  => '#e46427',
            'ink'     => '#0d0d0d',
        ],
        'dusk' => [
            'bg'      => '#9e3a11',
            'surface' => '#f7e6d2',
            'accent'  => '#20234f',
            'ink'     => '#0d0d0d',
        ],
    ];
}

function matmoora_theme_choices(): array {
    return [
        'day'  => __('Day (navy background, default)', 'matmoora'),
        'dusk' => __('Dusk (dark orange background)', 'matmoora'),
    ];
}

/**
 * Strict hex sanitiser. Accepts #RRGGBB and #RGB; anything else is
 * replaced with the default. This is the only path a palette value
 * takes into both the admin UI and the GraphQL response, so untrusted
 * input never reaches the inline <style> tag the Next.js layer emits.
 */
function matmoora_sanitize_hex($value, string $fallback): string {
    $value = is_string($value) ? trim($value) : '';
    return preg_match('/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $value) ? strtolower($value) : $fallback;
}

/**
 * Current value for a palette token: stored option, or the preset's
 * default. Always a valid hex.
 */
function matmoora_palette_value(string $preset, string $token): string {
    $defaults = matmoora_palette_defaults();
    if (!isset($defaults[$preset][$token])) return '#000000';
    $stored = get_option("matmoora_palette_{$preset}_{$token}", $defaults[$preset][$token]);
    return matmoora_sanitize_hex($stored, $defaults[$preset][$token]);
}

/**
 * Active theme preset ('day' | 'dusk').
 */
function matmoora_active_theme(): string {
    $choices = matmoora_theme_choices();
    $stored  = get_option('matmoora_theme', 'day');
    return array_key_exists($stored, $choices) ? $stored : 'day';
}

/**
 * The full palette set a GraphQL consumer sees.
 */
function matmoora_palette_set(): array {
    $out = [];
    foreach (matmoora_palette_defaults() as $preset => $tokens) {
        foreach ($tokens as $token => $_) {
            $out[$preset][$token] = matmoora_palette_value($preset, $token);
        }
    }
    return $out;
}

// ----------------------------------------------------------------------
// Admin page: Settings → Matmoora
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
    register_setting('matmoora_site_settings', 'matmoora_theme', [
        'type'              => 'string',
        'default'           => 'day',
        'sanitize_callback' => function ($value) {
            $choices = matmoora_theme_choices();
            return array_key_exists($value, $choices) ? $value : 'day';
        },
        'show_in_rest'      => false,
    ]);

    $defaults = matmoora_palette_defaults();
    foreach ($defaults as $preset => $tokens) {
        foreach ($tokens as $token => $default) {
            register_setting('matmoora_site_settings', "matmoora_palette_{$preset}_{$token}", [
                'type'              => 'string',
                'default'           => $default,
                'sanitize_callback' => fn($v) => matmoora_sanitize_hex($v, $default),
                'show_in_rest'      => false,
            ]);
        }
    }
});

function matmoora_site_settings_render_page(): void {
    if (!current_user_can('manage_options')) return;
    $theme   = matmoora_active_theme();
    $tokens  = matmoora_palette_tokens();
    $set     = matmoora_palette_set();
    $choices = matmoora_theme_choices();
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Matmoora site settings', 'matmoora'); ?></h1>
        <p><?php esc_html_e('These values are read by the public site on every request via WPGraphQL. A save fires a Next.js revalidation so the change is live within seconds.', 'matmoora'); ?></p>
        <form method="post" action="options.php">
            <?php settings_fields('matmoora_site_settings'); ?>

            <h2><?php esc_html_e('Active theme', 'matmoora'); ?></h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="matmoora_theme"><?php esc_html_e('Theme preset', 'matmoora'); ?></label>
                    </th>
                    <td>
                        <select id="matmoora_theme" name="matmoora_theme">
                            <?php foreach ($choices as $value => $label): ?>
                                <option value="<?php echo esc_attr($value); ?>" <?php selected($theme, $value); ?>>
                                    <?php echo esc_html($label); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php esc_html_e('The palette the public site uses right now. Editors can preview the other preset from the cog on the live site before switching the saved default here.', 'matmoora'); ?></p>
                    </td>
                </tr>
            </table>

            <?php foreach ($choices as $preset => $label): ?>
                <h2><?php echo esc_html(sprintf(__('%s palette', 'matmoora'), $label)); ?></h2>
                <table class="form-table" role="presentation">
                    <?php foreach ($tokens as $token => $tokenLabel): ?>
                        <?php $value = $set[$preset][$token]; ?>
                        <tr>
                            <th scope="row">
                                <label for="matmoora_palette_<?php echo esc_attr($preset . '_' . $token); ?>">
                                    <?php echo esc_html($tokenLabel); ?>
                                </label>
                            </th>
                            <td>
                                <input
                                    type="color"
                                    id="matmoora_palette_<?php echo esc_attr($preset . '_' . $token); ?>"
                                    name="matmoora_palette_<?php echo esc_attr($preset . '_' . $token); ?>"
                                    value="<?php echo esc_attr($value); ?>"
                                    style="vertical-align: middle; width: 48px; height: 32px; padding: 0; border: 1px solid #ccc; border-radius: 4px;"
                                />
                                <code style="margin-inline-start: 8px;"><?php echo esc_html($value); ?></code>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </table>
            <?php endforeach; ?>

            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// ----------------------------------------------------------------------
// WPGraphQL types: matmooraSettings { theme, palettes { day, dusk } }
// ----------------------------------------------------------------------

add_action('graphql_register_types', function () {
    if (!function_exists('register_graphql_object_type')) return;

    register_graphql_object_type('MatmooraPalette', [
        'description' => __('A four-token palette: background, surface, accent, and ink.', 'matmoora'),
        'fields'      => [
            'bg'      => ['type' => 'String', 'description' => 'Page background (maps to --color-navy).'],
            'surface' => ['type' => 'String', 'description' => 'Card/panel background (maps to --color-cream).'],
            'accent'  => ['type' => 'String', 'description' => 'Accent / highlight (maps to --color-orange).'],
            'ink'     => ['type' => 'String', 'description' => 'Body text on surface (maps to --color-ink).'],
        ],
    ]);

    register_graphql_object_type('MatmooraPalettes', [
        'description' => __('Palette set. The frontend emits inline CSS for both so the cog can live-preview the inactive one.', 'matmoora'),
        'fields'      => [
            'day'  => ['type' => 'MatmooraPalette'],
            'dusk' => ['type' => 'MatmooraPalette'],
        ],
    ]);

    register_graphql_object_type('MatmooraSettings', [
        'description' => __('Site-wide settings editors control from Settings → Matmoora.', 'matmoora'),
        'fields'      => [
            'theme'    => [
                'type'        => 'String',
                'description' => __('Active palette preset: "day" or "dusk".', 'matmoora'),
                'resolve'     => fn() => matmoora_active_theme(),
            ],
            'palettes' => [
                'type'        => 'MatmooraPalettes',
                'description' => __('Both palettes in their current form.', 'matmoora'),
                'resolve'     => fn() => matmoora_palette_set(),
            ],
        ],
    ]);

    register_graphql_field('RootQuery', 'matmooraSettings', [
        'type'        => 'MatmooraSettings',
        'description' => __('Site-wide settings for the Matmoora public site.', 'matmoora'),
        'resolve'     => fn() => (object) [],
    ]);
});

// ----------------------------------------------------------------------
// Revalidate the Next.js front-end whenever anything the site reads
// changes. Any `update_option_matmoora_*` is a settings write.
// ----------------------------------------------------------------------

add_action('updated_option', function (string $option) {
    if (str_starts_with($option, 'matmoora_')) matmoora_site_settings_revalidate();
}, 10, 1);

add_action('added_option', function (string $option) {
    if (str_starts_with($option, 'matmoora_')) matmoora_site_settings_revalidate();
}, 10, 1);

function matmoora_site_settings_revalidate(): void {
    $public = rtrim((string) getenv('MATMOORA_PUBLIC_URL') ?: 'https://matmoora.org', '/');
    $secret = (string) getenv('MATMOORA_REVALIDATE_SECRET');
    if (!$secret) return; // ISR cycle will catch up naturally.
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
