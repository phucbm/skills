<?php
if(!defined('ABSPATH')){
	exit;
}

/**
 * Core scripts — auto-load on every page (order matters).
 */
const JS_ENQUEUE_ASSETS = [
	'theme-index' => [
		'path' => '/assets/js/index.js',
		'deps' => [],
	],
];

/**
 * Library scripts — register only, blocks declare as viewScript dependencies.
 */
const JS_REGISTER_ASSETS = [];

/**
 * Core styles — auto-load on every page.
 */
const CSS_ENQUEUE_ASSETS = [];

/**
 * Library styles — register only, enqueue when needed.
 */
const CSS_REGISTER_ASSETS = [];

/**
 * Register and enqueue theme assets.
 * Runs at priority 5 so blocks can depend on these handles (blocks register at 10).
 */
function theme_register_assets(): void{
	$theme_url  = get_stylesheet_directory_uri();
	$theme_path = get_stylesheet_directory();

	global $theme_core_scripts;
	$theme_core_scripts = [];

	foreach(JS_ENQUEUE_ASSETS as $handle => $config){
		$file = $theme_path . $config['path'];
		if(!file_exists($file)){
			continue;
		}
		wp_register_script($handle, $theme_url . $config['path'], $config['deps'], filemtime($file), true);
		wp_enqueue_script($handle);
		$theme_core_scripts[] = $handle;
	}

	foreach(JS_REGISTER_ASSETS as $handle => $config){
		$file = $theme_path . $config['path'];
		if(!file_exists($file)){
			continue;
		}
		wp_register_script($handle, $theme_url . $config['path'], $config['deps'], filemtime($file), true);
	}

	foreach(CSS_ENQUEUE_ASSETS as $handle => $config){
		$file = $theme_path . $config['path'];
		if(!file_exists($file)){
			continue;
		}
		wp_register_style($handle, $theme_url . $config['path'], $config['deps'], filemtime($file));
		wp_enqueue_style($handle);
	}

	foreach(CSS_REGISTER_ASSETS as $handle => $config){
		$file = $theme_path . $config['path'];
		if(!file_exists($file)){
			continue;
		}
		wp_register_style($handle, $theme_url . $config['path'], $config['deps'], filemtime($file));
	}
}
add_action('init', 'theme_register_assets', 5);

/**
 * Enforce core scripts load before block scripts.
 */
function theme_enforce_script_load_order(): void{
	global $wp_scripts, $theme_core_scripts;

	if(!$wp_scripts || !isset($wp_scripts->queue) || empty($theme_core_scripts)){
		return;
	}

	$core   = [];
	$others = [];

	foreach($wp_scripts->queue as $handle){
		if(in_array($handle, $theme_core_scripts)){
			$core[] = $handle;
		}else{
			$others[] = $handle;
		}
	}

	$wp_scripts->queue = array_merge($core, $others);
}
add_action('wp_print_footer_scripts', 'theme_enforce_script_load_order', 1);
