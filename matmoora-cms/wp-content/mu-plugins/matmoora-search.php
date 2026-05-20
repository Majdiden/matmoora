<?php
/**
 * Plugin Name: Matmoora — Meilisearch Indexing
 * Description: Keeps Meilisearch in sync with WordPress content. Indexes on
 *              publish, removes on unpublish/delete, and provides a full
 *              rebuild via `wp matmoora reindex`. See TECH_SPEC §12.
 *
 * Index naming is `<post_type>_<language>` (e.g. publications_ar).
 *
 * The search document is intentionally generic until the Phase 1 content
 * model is locked — extend matmoora_build_search_document() with per-type
 * ACF fields, tags, and topics at that point (TECH_SPEC §12.1).
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Send a request to the Meilisearch HTTP API with the admin key.
 *
 * @return array|WP_Error
 */
function matmoora_meili_request($method, $path, $body = null) {
    if (!defined('MATMOORA_MEILI_HOST') || !MATMOORA_MEILI_HOST) {
        return new WP_Error('matmoora_meili', 'MATMOORA_MEILI_HOST not defined');
    }

    $args = [
        'method'  => $method,
        'headers' => [
            'Authorization' => 'Bearer ' . MATMOORA_MEILI_ADMIN_KEY,
            'Content-Type'  => 'application/json',
        ],
        'timeout' => 10,
    ];
    if ($body !== null) {
        $args['body'] = wp_json_encode($body);
    }

    return wp_remote_request(rtrim(MATMOORA_MEILI_HOST, '/') . $path, $args);
}

/** Resolve the WPML language code for a post, defaulting to Arabic. */
function matmoora_post_language($post_id) {
    $details = apply_filters('wpml_post_language_details', null, $post_id);
    return is_array($details) && !empty($details['language_code'])
        ? $details['language_code']
        : 'ar';
}

/** Meilisearch index uid for a post. */
function matmoora_index_name($post) {
    return $post->post_type . '_' . matmoora_post_language($post->ID);
}

/** Build the search document pushed to Meilisearch for a post. */
function matmoora_build_search_document($post) {
    return [
        'id'           => (int) $post->ID,
        'title'        => get_the_title($post),
        'slug'         => $post->post_name,
        'excerpt'      => wp_strip_all_tags(get_the_excerpt($post)),
        'body_text'    => wp_strip_all_tags(strip_shortcodes($post->post_content)),
        'post_type'    => $post->post_type,
        'language'     => matmoora_post_language($post->ID),
        'url'          => get_permalink($post),
        'published_at' => get_post_time('c', true, $post),
    ];
}

/** Index a single post (add or replace). */
function matmoora_index_post($post) {
    $index = matmoora_index_name($post);
    matmoora_meili_request(
        'POST',
        "/indexes/{$index}/documents",
        [matmoora_build_search_document($post)]
    );
}

/** Remove a single post from its index. */
function matmoora_deindex_post($post) {
    $index = matmoora_index_name($post);
    matmoora_meili_request('DELETE', "/indexes/{$index}/documents/" . (int) $post->ID);
}

add_action('transition_post_status', function ($new, $old, $post) {
    if ($new === $old) {
        return;
    }
    if (wp_is_post_revision($post) || wp_is_post_autosave($post)) {
        return;
    }

    if ($new === 'publish') {
        matmoora_index_post($post);
    } elseif ($old === 'publish') {
        matmoora_deindex_post($post);
    }
}, 20, 3);

add_action('before_delete_post', function ($post_id, $post) {
    if ($post instanceof WP_Post) {
        matmoora_deindex_post($post);
    }
}, 10, 2);

/**
 * WP-CLI: `wp matmoora reindex` — full rebuild from scratch (first-run and
 * recovery). TECH_SPEC §12.2.
 */
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('matmoora reindex', function () {
        $post_types = get_post_types(['public' => true], 'names');
        $total = 0;

        foreach ($post_types as $post_type) {
            $query = new WP_Query([
                'post_type'      => $post_type,
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'no_found_rows'  => true,
            ]);

            foreach ($query->posts as $post) {
                matmoora_index_post($post);
                $total++;
            }
        }

        WP_CLI::success("Reindexed {$total} posts.");
    });
}
