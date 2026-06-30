<?php
// Project identity — change per client.
if(!defined('THEME_NAME')){
	define('THEME_NAME', '{THEME_NAME}');
}

// Per-developer CSS mapping (optional).
// Used by the tailwind-theme-loader mu-plugin to serve per-dev compiled CSS.
// Map WordPress user IDs to Tailwind output keys.
//
// define('DEV_CSS_MAP', [
//     1 => 'alice',  // loads assets/css/style.alice.generated.css
//     2 => 'bob',
// ]);

require_once(get_stylesheet_directory() . '/inc/enqueue-assets.php');
require_once(get_stylesheet_directory() . '/inc/auto-include-components.php');
px_auto_include_components(['helpers']);

register_nav_menus([
	'main_menu' => __('Main Menu', '{TEXT_DOMAIN}'),
]);
