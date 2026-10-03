<?php
// Stub theme — hide the admin menus a headless deploy doesn't need.
add_action('admin_menu', function () {
    remove_menu_page('themes.php');
    remove_menu_page('edit-comments.php');
}, 999);
