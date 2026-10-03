<?php
/**
 * Plugin Name: Matmoora Content Model
 * Description: Registers the CPTs, taxonomies and WPGraphQL fields for the Matmoora content model (TECH_SPEC §5, requirements doc §3).
 * Version: 1.0.0
 * Author: Matmoora
 */

if (!defined('ABSPATH')) exit;

add_action('init', function () {

    $types = [
        'investigation' => [ 'labels' => ['name' => 'Investigations', 'singular_name' => 'Investigation'], 'rewrite' => ['slug' => 'investigations'], 'graphql_single' => 'investigation', 'graphql_plural' => 'investigations', 'menu_icon' => 'dashicons-search' ],
        'article'       => [ 'labels' => ['name' => 'Articles', 'singular_name' => 'Article'], 'rewrite' => ['slug' => 'articles'], 'graphql_single' => 'article', 'graphql_plural' => 'articles', 'menu_icon' => 'dashicons-media-text' ],
        'story'         => [ 'labels' => ['name' => 'Stories', 'singular_name' => 'Story'], 'rewrite' => ['slug' => 'stories'], 'graphql_single' => 'story', 'graphql_plural' => 'stories', 'menu_icon' => 'dashicons-format-quote' ],
        'publication'   => [ 'labels' => ['name' => 'Publications', 'singular_name' => 'Publication'], 'rewrite' => ['slug' => 'publications'], 'graphql_single' => 'publication', 'graphql_plural' => 'publications', 'menu_icon' => 'dashicons-book' ],
        'video'         => [ 'labels' => ['name' => 'Videos', 'singular_name' => 'Video'], 'rewrite' => ['slug' => 'videos'], 'graphql_single' => 'video', 'graphql_plural' => 'videos', 'menu_icon' => 'dashicons-video-alt3' ],
        'audio'         => [ 'labels' => ['name' => 'Audios', 'singular_name' => 'Audio'], 'rewrite' => ['slug' => 'audios'], 'graphql_single' => 'audio', 'graphql_plural' => 'audios', 'menu_icon' => 'dashicons-format-audio' ],
        'activity'      => [ 'labels' => ['name' => 'Activities', 'singular_name' => 'Activity'], 'rewrite' => ['slug' => 'activities'], 'graphql_single' => 'activity', 'graphql_plural' => 'activities', 'menu_icon' => 'dashicons-calendar-alt' ],
    ];

    foreach ($types as $slug => $cfg) {
        register_post_type($slug, [
            'label'               => $cfg['labels']['name'],
            'labels'              => $cfg['labels'],
            'public'              => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => $cfg['graphql_single'],
            'graphql_plural_name' => $cfg['graphql_plural'],
            'hierarchical'        => false,
            'has_archive'         => false,
            'rewrite'             => $cfg['rewrite'],
            'menu_icon'           => $cfg['menu_icon'],
            'supports'            => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
        ]);
    }

    $shared = array_keys($types);

    foreach ([
        ['mm_location',  'Locations',       'location',  'locations',  true],
        ['mm_theme',     'Themes',          'theme',     'themes',     false],
        ['mm_violation', 'Violation types', 'violation', 'violations', false],
        ['mm_year',      'Years',           'year',      'years',      false],
        ['mm_partner',   'Partners',        'partner',   'partners',   false],
    ] as [$tax, $label, $gsingle, $gplural, $hier]) {
        register_taxonomy($tax, $shared, [
            'label'               => $label,
            'public'              => true,
            'hierarchical'        => $hier,
            'show_ui'             => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => $gsingle,
            'graphql_plural_name' => $gplural,
            'rewrite'             => ['slug' => $gplural],
        ]);
    }
});

/**
 * Point ACF at the repo-tracked JSON directory.
 */
add_filter('acf/settings/save_json', function () {
    return WP_CONTENT_DIR . '/../acf-json';
});
add_filter('acf/settings/load_json', function () {
    return [WP_CONTENT_DIR . '/../acf-json'];
});
