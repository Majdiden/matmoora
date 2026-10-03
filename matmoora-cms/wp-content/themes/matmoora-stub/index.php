<?php
/**
 * Matmoora stub theme — the public site is Next.js. Any direct request to
 * the WordPress frontend (actual content pages) is redirected to the
 * configured public URL. API endpoints and wp-admin surfaces are left
 * alone so headless clients + the admin UI still work.
 *
 * This file only runs after WordPress has decided no plugin, no admin
 * controller, and no REST/GraphQL handler claimed the request — i.e.
 * only for genuine theme-rendering frontend hits.
 */

$uri = $_SERVER['REQUEST_URI'] ?? '/';

// Anything that looks like an API, cron, or admin surface should NOT be
// redirected. If we reach the theme for one of these, it means that
// surface's plugin isn't activated or permalinks weren't flushed — return
// 404 so the operator can see what's missing instead of being bounced to
// the public site.
$api_prefixes = [
    '/graphql',
    '/wp-json',
    '/wp-admin',
    '/wp-login.php',
    '/wp-cron.php',
    '/xmlrpc.php',
    '/wp-signup.php',
    '/wp-trackback.php',
];
foreach ($api_prefixes as $prefix) {
    if (str_starts_with($uri, $prefix)) {
        status_header(404);
        echo "<!doctype html><title>404</title><h1>Not found</h1>";
        echo "<p>No handler claimed <code>" . htmlspecialchars($uri) . "</code>. ";
        echo "If this looks like an API endpoint, the plugin that owns it may not be active, ";
        echo "or permalinks need to be flushed (<code>wp rewrite flush</code>).</p>";
        exit;
    }
}

// Everything else is a public-content hit → bounce to Next.js.
$public = rtrim(getenv('MATMOORA_PUBLIC_URL') ?: 'https://matmoora.org', '/');
wp_redirect($public . $uri, 302);
exit;
