<?php
/**
 * Matmoora Stub theme — headless. No public rendering happens here; the site
 * is served by Next.js. See TECH_SPEC §2.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Redirect any front-end (non-admin, non-API) request to the public frontend.
add_action('template_redirect', function () {
    if (is_admin() || (defined('REST_REQUEST') && REST_REQUEST)) {
        return;
    }
    if (defined('GRAPHQL_HTTP_REQUEST') && GRAPHQL_HTTP_REQUEST) {
        return;
    }

    $frontend = getenv('MATMOORA_FRONTEND_URL');
    if ($frontend) {
        wp_redirect($frontend, 302);
        exit;
    }
});
