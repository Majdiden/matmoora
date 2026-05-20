<?php
/**
 * Plugin Name: Matmoora — On-demand Revalidation
 * Description: Notifies the Next.js frontend to revalidate a page when content
 *              is published or unpublished. See TECH_SPEC §7.4.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('transition_post_status', function ($new, $old, $post) {
    // Only react when a post enters or leaves the published state.
    if ($new !== 'publish' && $old !== 'publish') {
        return;
    }
    if (wp_is_post_revision($post) || wp_is_post_autosave($post)) {
        return;
    }
    if (!defined('MATMOORA_REVALIDATE_URL') || !MATMOORA_REVALIDATE_URL) {
        return;
    }

    $lang_details = apply_filters('wpml_post_language_details', null, $post->ID);
    $lang = is_array($lang_details) && !empty($lang_details['language_code'])
        ? $lang_details['language_code']
        : 'ar';

    wp_remote_post(MATMOORA_REVALIDATE_URL, [
        'headers'  => ['x-revalidate-secret' => MATMOORA_REVALIDATE_SECRET],
        'body'     => wp_json_encode([
            'post_type' => $post->post_type,
            'slug'      => $post->post_name,
            'lang'      => $lang,
        ]),
        'timeout'  => 5,
        'blocking' => false,
    ]);
}, 10, 3);
