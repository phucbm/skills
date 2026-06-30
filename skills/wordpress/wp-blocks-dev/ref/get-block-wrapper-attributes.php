<?php
/**
 * Perxel block wrapper attributes helper.
 *
 * WordPress API docs:
 * - get_block_wrapper_attributes(): https://developer.wordpress.org/reference/functions/get_block_wrapper_attributes/
 */

if(!function_exists('px_get_block_wrapper_attributes')){
	/**
	 * Build wrapper attributes for block templates with Perxel conventions.
	 *
	 * Minimal usage:
	 *   echo px_get_block_wrapper_attributes(['slug' => 'sample-block', 'block' => $block, 'class' => '']);
	 *
	 * @param array $args  {
	 *
	 * @type string $slug  Required. Block slug used for BEM + data hook.
	 * @type mixed  $block Optional. ACF block array (preferred) or WP_Block-like.
	 * @type string $class Optional. Extra classes to append.
	 * @type array  $attrs Optional. Extra attributes to merge into wrapper attributes.
	 *                     }
	 *
	 * @return string
	 * @version 1.0.0
	 */
	function px_get_block_wrapper_attributes(array $args = []): string{
		$slug  = isset($args['slug']) ? (string) $args['slug'] : '';
		$block = $args['block'] ?? null;
		
		$extra_class = isset($args['class']) ? (string) $args['class'] : '';
		$extra_attrs = isset($args['attrs']) && is_array($args['attrs']) ? $args['attrs'] : [];
		
		// ACF block render templates typically pass `$block` as an array.
		$anchor = is_array($block) ? (string) ($block['anchor'] ?? '') : '';
		
		// Sanitize only base px-block classes
		$base_classes = ['px-block'];
		if($slug !== ''){
			$base_classes[] = 'px-block--' . $slug;
		}
		$base_classes = array_map('sanitize_html_class', $base_classes);
		
		// Keep extra classes as-is (for Tailwind modifiers)
		$extra_classes = [];
		if($extra_class !== ''){
			$extra_classes = array_merge($extra_classes, preg_split('/\s+/', trim($extra_class)));
		}
		
		// In block editor only: disable all <a> and <button> interactions
		// to prevent accidental clicks while editing.
		if(is_admin()){
			$extra_classes[] = 'is-editor-avoid-interact';
			$extra_classes[] = 'pointer-events-none';
		}
		
		$classes = array_values(array_unique(array_filter(array_merge($base_classes, $extra_classes))));
		
		$attrs = array_merge(
			$extra_attrs,
			[
				'class' => implode(' ', $classes),
			]
		);
		
		if($slug !== ''){
			$attrs['data-px-block'] = $slug;
		}
		if($anchor !== ''){
			$attrs['id'] = $anchor;
		}
		
		return get_block_wrapper_attributes($attrs);
	}
}