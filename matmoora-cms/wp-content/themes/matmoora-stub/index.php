<?php
/**
 * Matmoora stub theme — the public site is Next.js. Any direct request to
 * the WordPress frontend is redirected to the configured public URL.
 */
$public = getenv('MATMOORA_PUBLIC_URL') ?: 'https://matmoora.org';
wp_redirect($public . ($_SERVER['REQUEST_URI'] ?? '/'), 302);
exit;
