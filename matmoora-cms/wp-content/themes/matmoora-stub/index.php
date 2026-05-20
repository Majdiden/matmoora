<?php
/**
 * Headless stub. The public site is rendered by Next.js — this file only runs
 * if the template_redirect in functions.php has nothing to redirect to.
 */

if (!defined('ABSPATH')) {
    exit;
}

http_response_code(200);
echo 'Matmoora CMS — headless. Public site is served by the Next.js frontend.';
