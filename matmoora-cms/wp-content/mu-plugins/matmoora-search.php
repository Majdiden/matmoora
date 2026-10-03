<?php
/**
 * Plugin Name: Matmoora Search
 * Description: Indexes Matmoora content into Meilisearch on save/delete. Configures Arabic tokenization and archive-page facets (TECH_SPEC §12).
 * Version: 1.0.0
 * Author: Matmoora
 */

if (!defined('ABSPATH')) exit;

const MM_INDEXED_TYPES = ['investigation', 'article', 'story', 'publication', 'video', 'audio'];
const MM_INDEX_NAME    = 'matmoora_content';

function mm_meili_settings(): array {
    return [
        'searchableAttributes' => ['title', 'excerpt', 'body', 'contributors'],
        'filterableAttributes' => ['type', 'location', 'year', 'themes', 'language'],
        'sortableAttributes'   => ['publication_ts', 'event_ts'],
        'displayedAttributes'  => ['id', 'slug', 'type', 'title', 'excerpt', 'location', 'year', 'themes', 'language', 'contributors', 'publication_ts', 'event_ts', 'investigation_slug', 'url'],
        'separatorTokens'      => ['؟', '،', '؛', '«', '»', '…'],
        'nonSeparatorTokens'   => [],
    ];
}

add_action('save_post', function ($post_id, $post) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) return;
    if (!in_array($post->post_type, MM_INDEXED_TYPES, true)) return;
    if ($post->post_status !== 'publish') { mm_meili_delete($post_id); return; }
    mm_meili_upsert($post);
}, 10, 2);

add_action('before_delete_post', function ($post_id) {
    $post = get_post($post_id);
    if (!$post || !in_array($post->post_type, MM_INDEXED_TYPES, true)) return;
    mm_meili_delete($post_id);
});

function mm_meili_upsert(WP_Post $post): void {
    $doc = mm_doc_from_post($post);
    if (!$doc) return;
    mm_meili_request('POST', '/indexes/' . MM_INDEX_NAME . '/documents', [$doc]);
}

function mm_meili_delete(int $post_id): void {
    mm_meili_request('DELETE', '/indexes/' . MM_INDEX_NAME . '/documents/' . $post_id);
}

function mm_doc_from_post(WP_Post $post): ?array {
    $type = $post->post_type;
    $tf = fn(string $tax) => wp_get_post_terms($post->ID, $tax, ['fields' => 'names']) ?: [];
    $locations = $tf('mm_location');
    $themes    = array_merge($tf('mm_theme'), $tf('mm_violation'));
    $years     = $tf('mm_year');
    $partners  = $tf('mm_partner');
    $event_ts  = null;
    $language  = 'ar';

    if (function_exists('get_field')) {
        if ($type === 'investigation') {
            $start = get_field('event_start', $post->ID);
            $event_ts = $start ? strtotime($start) : null;
        } else {
            $when = get_field('event_date', $post->ID);
            $event_ts = $when ? strtotime($when) : null;
            $language = (string) (get_field('language', $post->ID) ?: 'ar');
        }
    }

    return [
        'id'                 => (int) $post->ID,
        'slug'               => $post->post_name,
        'type'               => $type,
        'title'              => wp_strip_all_tags($post->post_title),
        'excerpt'            => wp_strip_all_tags($post->post_excerpt),
        'body'               => wp_strip_all_tags(strip_shortcodes($post->post_content)),
        'contributors'       => function_exists('get_field') ? (string) (get_field('contributors', $post->ID) ?? '') : '',
        'location'           => $locations,
        'themes'             => $themes,
        'year'               => count($years) ? $years : ($event_ts ? [date('Y', $event_ts)] : []),
        'partners'           => $partners,
        'language'           => $language,
        'publication_ts'     => get_post_time('U', true, $post),
        'event_ts'           => $event_ts,
        'investigation_slug' => function_exists('get_field') ? mm_investigation_slug($post) : '',
        'url'                => str_replace(home_url(), '', get_permalink($post)),
    ];
}

function mm_investigation_slug(WP_Post $post): string {
    $ref = get_field('investigation_ref', $post->ID);
    if (is_numeric($ref)) {
        $ref_post = get_post((int) $ref);
        return $ref_post ? $ref_post->post_name : '';
    }
    if ($ref instanceof WP_Post) return $ref->post_name;
    return '';
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('matmoora search:settings', function () {
        $res = mm_meili_request('PATCH', '/indexes/' . MM_INDEX_NAME . '/settings', mm_meili_settings());
        WP_CLI::success('Settings pushed. Task id: ' . ($res['taskUid'] ?? '?'));
    });

    WP_CLI::add_command('matmoora search:reindex', function () {
        mm_meili_request('DELETE', '/indexes/' . MM_INDEX_NAME . '/documents');
        foreach (MM_INDEXED_TYPES as $t) {
            $q = new WP_Query(['post_type' => $t, 'post_status' => 'publish', 'posts_per_page' => -1, 'fields' => 'ids']);
            foreach ($q->posts as $id) {
                $post = get_post($id);
                if ($post) mm_meili_upsert($post);
            }
            WP_CLI::log("Reindexed {$t}: {$q->post_count} docs.");
        }
        WP_CLI::success('Reindex complete.');
    });
}

/**
 * Minimal HTTP client. Reads MEILI_HOST + MEILI_MASTER_KEY from env, so the
 * same mu-plugin works on Docker Compose (via docker secrets) and on Railway
 * (via plain environment variables) without changes.
 */
function mm_meili_request(string $method, string $path, $body = null): array {
    $host = getenv('MEILI_HOST') ?: 'http://meili:7700';
    $key  = getenv('MEILI_MASTER_KEY') ?: '';
    $args = [
        'method'  => $method,
        'timeout' => 5,
        'headers' => array_filter([
            'Content-Type'  => 'application/json',
            'Authorization' => $key ? 'Bearer ' . $key : '',
        ]),
    ];
    if ($body !== null) $args['body'] = wp_json_encode($body);
    $resp = wp_remote_request(rtrim($host, '/') . $path, $args);
    if (is_wp_error($resp)) {
        error_log('[matmoora-search] ' . $resp->get_error_message());
        return [];
    }
    return json_decode(wp_remote_retrieve_body($resp), true) ?: [];
}
