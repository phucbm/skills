# ACF Block Conventions

Every block lives in `blocks/{block-name}/`:

```
blocks/{block-name}/
├── block.json          Required — metadata, ACF mode, viewScript
├── fields.json         Required if any PHP uses get_field() with 1 param
├── render.php          Required — frontend PHP template
├── render-admin.php    Optional — editor preview (interactive blocks only)
├── preview.png         Optional — thumbnail shown in block inserter
└── view.entry.ts       Optional — frontend JS, compiled to view.js by tsup
```

## block.json

Minimum required fields:

```json
{
  "$schema": "https://raw.githubusercontent.com/AdvancedCustomFields/schemas/refs/heads/main/json/block.json",
  "apiVersion": 3,
  "name": "{namespace}/{block-name}",
  "title": "Human Readable Title",
  "description": "One sentence describing what this block does.",
  "category": "{namespace}",
  "icon": "block-default",
  "acf": {
    "mode": "preview",
    "renderTemplate": "render.php"
  },
  "attributes": {
    "previewImage": {
      "type": "string",
      "default": "preview.png"
    }
  },
  "supports": {
    "multiple": false,
    "align": false,
    "alignWide": false,
    "anchor": false,
    "html": false
  }
}
```

- `{namespace}` matches the theme's registered block category slug (e.g. `mytheme`). Use the same value for both `name` and `category`.
- `title` and `description` must never be empty or placeholder values
- If the block has frontend JS: add `"viewScript": ["file:./view.js"]`
- If the block depends on a registered library: `"viewScript": ["library-handle", "file:./view.js"]`

## preview.png — inserter thumbnail

Place `preview.png` at block root. Gutenberg shows it in the block inserter when block has no content yet.

Requires two things:
1. **`preview.png` file** at `blocks/{block-name}/preview.png`
2. **`attributes.previewImage` in `block.json`** (see above) — tells Gutenberg which filename to look for

This is standard Gutenberg behavior. No custom code needed.

### Quick inserter preview (optional)

Gutenberg's native `previewImage` only works in the **full inserter sidebar**. It does NOT work in the **quick inserter** (slash commands `/hero`, `+` button).

To bridge this gap, copy `[@ref/inserter-preview.js](ref/inserter-preview.js)` to `assets/js/inserter-preview.js` and update the `NAMESPACE` constant to match your block prefix (e.g. `acf`, `clientName`).

Enqueue it conditionally in `functions.php`:
```php
add_action('enqueue_block_editor_assets', function(){
    wp_enqueue_script('inserter-preview', get_template_directory_uri() . '/assets/js/inserter-preview.js', [], filemtime(get_template_directory() . '/assets/js/inserter-preview.js'), true);
});
```

## render.php

### Wrapper

The outermost element must always use `get_block_wrapper_attributes()`:

```php
<div <?php echo get_block_wrapper_attributes(['class' => 'wp-block-{block-name}']); ?>>
```

- Use `<section>` for top-level page sections; `<div>` for utility/widget blocks.
- If the theme provides a custom wrapper helper (e.g. `px_get_block_wrapper_attributes()`), use it instead — it typically injects the block slug as a CSS class and adds theme-specific attributes. Check with the project before scaffolding.

### Early return for admin

If the block has a `render-admin.php`, bail early:

```php
if(is_admin()){
    include __DIR__ . '/render-admin.php';
    return;
}
```

### No empty states on the frontend

If a block has no content, render nothing. Never show placeholder messages to visitors.

## render-admin.php

### When to create it

Only for blocks where the frontend cannot be previewed accurately in the editor:
- Video sliders or carousels (autoplay, JS-dependent)
- Animated or scroll-triggered elements
- Content loaded via AJAX
- Blocks visually empty until JS initializes

Static layout blocks (text, images, grids) do not need `render-admin.php`.

### Required content

Always show a visible placeholder with `pointer-events:none` to prevent accidental interaction:

```php
<div style="pointer-events:none; padding:2rem; background:#f0f0f0; text-align:center;">
    <p><strong>Block Name</strong> — preview not available in editor</p>
</div>
```

If the theme provides a wrapper helper (e.g. `px_get_block_wrapper_attributes()`), check whether it already injects `pointer-events:none` — if so, do **not** add it inline.

## view.entry.ts

- Compiled to `view.js` by tsup (strips `.entry` from filename)
- Scope selectors to the block wrapper class to avoid conflicts
- Declare compiled `view.js` in `block.json` viewScript — do not enqueue manually

## Reading ACF fields

### Simple fields

```php
$heading     = get_field('heading');      // text / textarea → string
$show_title  = get_field('show_title');   // true_false → bool (0|1)
$video_url   = get_field('video_url');    // url / file (return_format: url) → string
```

### Image fields

Set `return_format: "id"` in fields.json. The field returns an attachment ID.

```php
$image_id = get_field('image');           // int|null
// Convert to <img> tag:
echo wp_get_attachment_image($image_id, 'large');
// Or with a theme helper if available:
// echo px_get_image_tag($image_id, 600);
```

### Link fields

Set `return_format: "array"` in fields.json. The field returns an associative array.

```php
$link   = get_field('cta_link');
$url    = $link['url']    ?? '';
$title  = $link['title']  ?? '';
$target = !empty($link['target']) ? $link['target'] : '_self';
```

### Repeater fields

`get_field()` returns an array of rows. Loop with `foreach`:

```php
$slides = get_field('slides') ?: [];

foreach($slides as $index => $slide){
    // Safe subfield access — use null-coalescing or a helper:
    $title    = $slide['title']  ?? '';
    $image_id = $slide['image']  ?? 0;
}
```

Avoid `have_rows()` / `the_row()` unless iterating a deeply nested repeater; the array approach is simpler and more readable.

### Subfield access pattern

Prefer `?? ''` (or `?? 0` for IDs) over direct array access to avoid PHP notices when a row is missing a key:

```php
$title = $slide['title'] ?? '';
$count = $data['count']  ?? 0;
```

If the theme provides `px_array_key_exists($key, $array, $default)`, use it — it handles null, false, and empty-string as the default.

### Relationship fields

Set `return_format: "object"` to get WP_Post objects:

```php
$members = get_field('team_members') ?: [];

foreach($members as $member){
    $id    = $member->ID;
    $name  = get_the_title($id);
    $field = get_field('custom_field', $id);  // 2nd param = post ID
}
```

## Block registration

Blocks are registered by adding the slug to `blocks.json` at the theme root:

```json
{ "blocks": ["about", "hero", "services"] }
```

Keep the list in alphabetical order. The `wp-blocks-loader.php` mu-plugin reads this and calls `register_block_type()` for each entry.
