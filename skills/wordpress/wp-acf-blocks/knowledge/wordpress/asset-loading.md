# WordPress Asset Loading

## Enqueue pattern

All assets go through `inc/enqueue-assets.php`. Always use `filemtime()` for cache busting and load JS in the footer:

```php
function theme_enqueue_assets(): void {
    wp_enqueue_style(
        'theme-style',
        get_stylesheet_directory_uri() . '/assets/css/style.generated.css',
        [],
        filemtime(get_stylesheet_directory() . '/assets/css/style.generated.css')
    );

    wp_enqueue_script(
        'theme-main',
        get_stylesheet_directory_uri() . '/assets/js/main.js',
        [],
        filemtime(get_stylesheet_directory() . '/assets/js/main.js'),
        true  // load in footer
    );
}
add_action('wp_enqueue_scripts', 'theme_enqueue_assets');
```

## Auto-loaded vs on-demand JS

- **Auto-loaded** — add `wp_enqueue_script()` to `theme_enqueue_assets()` in `inc/enqueue-assets.php`
- **On-demand** — register only via `wp_register_script()`, then declare as a dependency in the block's `block.json` viewScript array

On-demand is preferred for block-specific JS — WordPress only loads it on pages that use the block.

## mu-plugins

Standalone PHP files in `mu-plugins/` — loaded automatically by WordPress, no activation needed. All block-system plugins are available at [phucbm/wp-mu-plugins](https://github.com/phucbm/wp-mu-plugins).

### Required for block workflow

**[`acf-local-json-router.php`](https://github.com/phucbm/wp-mu-plugins/blob/main/acf-local-json-router.php)** — Routes ACF field group JSON saves per-block to `blocks/{slug}/fields.json`, all other groups to `acf-json/`. Required for the per-block `fields.json` workflow.

**[`wp-blocks-loader.php`](https://github.com/phucbm/wp-mu-plugins/blob/main/wp-blocks-loader.php)** — Reads `blocks.json` and calls `register_block_type()` for each block. Adds a project block category in the Gutenberg inserter (label from `THEME_NAME` constant). Also fixes the WP 6.3+ defer strategy so `viewScript` files load in the footer without race conditions.

**[`tailwind-theme-loader.php`](https://github.com/phucbm/wp-mu-plugins/blob/main/tailwind-theme-loader.php)** — Enqueues Tailwind-built CSS on the frontend and inside the Gutenberg editor iframe. Handles per-developer CSS files by reading the logged-in user's ID and mapping it to a CSS key via `DEV_CSS_MAP`.

## Block registration

`wp-blocks-loader.php` reads `blocks.json` at the theme root and registers each block:

```json
{ "blocks": ["hero", "cta", "team-grid"] }
```

Keep the list in alphabetical order. Each entry must match a folder under `blocks/` containing a `block.json`.
