<?php
/**
 * Plugin Name: Matmoora — WP-CLI Helpers
 * Description: Operational commands. Currently provides `wp matmoora doctor`,
 *              which verifies the WP side of the integration is wired up
 *              correctly (TECH_SPEC §7-§12).
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('WP_CLI') || !WP_CLI) {
    return;
}

class Matmoora_CLI {

    /**
     * Sanity-check the integration: constants set, plugins active, GraphQL
     * reachable, Meilisearch reachable. Returns a non-zero exit code if any
     * check fails.
     *
     * ## EXAMPLES
     *
     *     wp matmoora doctor
     *
     * @when after_wp_load
     */
    public function doctor($args, $assoc_args) {
        $errors = 0;

        WP_CLI::log('Checking required constants…');
        foreach (['MATMOORA_REVALIDATE_URL', 'MATMOORA_REVALIDATE_SECRET',
                  'MATMOORA_MEILI_HOST', 'MATMOORA_MEILI_ADMIN_KEY'] as $const) {
            if (defined($const) && constant($const)) {
                WP_CLI::log("  ✓ $const");
            } else {
                WP_CLI::warning("  ✗ $const not defined");
                $errors++;
            }
        }

        WP_CLI::log('Checking required plugins…');
        $needed = [
            'wp-graphql/wp-graphql.php',
            'wordpress-seo/wp-seo.php',
            'akismet/akismet.php',
        ];
        $active = get_option('active_plugins', []);
        foreach ($needed as $plugin) {
            if (in_array($plugin, $active, true)) {
                WP_CLI::log("  ✓ $plugin");
            } else {
                WP_CLI::warning("  ✗ $plugin not active");
                $errors++;
            }
        }

        WP_CLI::log('Checking WPGraphQL endpoint…');
        $graphql_url = home_url('/graphql');
        $response = wp_remote_post($graphql_url, [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => wp_json_encode(['query' => '{ __typename }']),
            'timeout' => 5,
        ]);
        if (is_wp_error($response)) {
            WP_CLI::warning('  ✗ GraphQL request failed: ' . $response->get_error_message());
            $errors++;
        } elseif (wp_remote_retrieve_response_code($response) === 200) {
            WP_CLI::log("  ✓ $graphql_url responds 200");
        } else {
            WP_CLI::warning('  ✗ GraphQL returned ' . wp_remote_retrieve_response_code($response));
            $errors++;
        }

        if (defined('MATMOORA_MEILI_HOST') && MATMOORA_MEILI_HOST) {
            WP_CLI::log('Checking Meilisearch…');
            $meili_health = rtrim(MATMOORA_MEILI_HOST, '/') . '/health';
            $response = wp_remote_get($meili_health, ['timeout' => 5]);
            if (is_wp_error($response)) {
                WP_CLI::warning('  ✗ ' . $response->get_error_message());
                $errors++;
            } elseif (wp_remote_retrieve_response_code($response) === 200) {
                WP_CLI::log("  ✓ $meili_health responds 200");
            } else {
                WP_CLI::warning('  ✗ Meili returned ' . wp_remote_retrieve_response_code($response));
                $errors++;
            }
        }

        if ($errors === 0) {
            WP_CLI::success('All checks passed.');
        } else {
            WP_CLI::error("{$errors} check(s) failed.");
        }
    }
}

WP_CLI::add_command('matmoora', 'Matmoora_CLI');
