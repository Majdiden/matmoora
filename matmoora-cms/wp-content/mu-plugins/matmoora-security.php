<?php
/**
 * Plugin Name: Matmoora — Security Hardening
 * Description: Locks down a handful of WordPress surfaces that headless sites
 *              don't need. Belt-and-braces with what's already enforced at the
 *              reverse proxy / host level. See TECH_SPEC §17.2.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Disable XML-RPC outright — never used by the headless frontend.
add_filter('xmlrpc_enabled', '__return_false');
add_filter('xmlrpc_methods', function () {
    return [];
});
add_filter('wp_headers', function ($headers) {
    unset($headers['X-Pingback']);
    return $headers;
});

// Drop the REST `users` endpoint for unauthenticated requests — the frontend
// doesn't expose user lists, and the default endpoint leaks usernames.
add_filter('rest_endpoints', function ($endpoints) {
    if (is_user_logged_in()) {
        return $endpoints;
    }
    foreach (array_keys($endpoints) as $route) {
        if (strpos($route, '/wp/v2/users') === 0) {
            unset($endpoints[$route]);
        }
    }
    return $endpoints;
});

// Strip the generator meta + RSD/WLW link tags from any HTML WP still emits
// (relevant for wp-login.php and similar) — TECH_SPEC §17.2.
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
