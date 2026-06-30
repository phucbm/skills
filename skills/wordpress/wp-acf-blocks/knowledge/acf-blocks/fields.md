# ACF fields.json

ACF field groups are exported as JSON and stored per-block in `fields.json`.

## When fields.json is required

Only required if any `.php` file in the block calls `get_field()` with **1 parameter**:

```php
get_field('key')           // 1 param = block-owned field = needs fields.json
get_field('key', $post_id) // 2 params = external field = no fields.json needed
```

## Format

```json
{
    "key": "group_<unique_hash>",
    "title": "Block Title",
    "fields": [],
    "location": [[{ "param": "block", "operator": "==", "value": "{namespace}/{block-name}" }]],
    "menu_order": 0,
    "position": "normal",
    "style": "default",
    "label_placement": "top",
    "instruction_placement": "label",
    "hide_on_screen": "",
    "active": true,
    "description": "",
    "show_in_rest": 0,
    "display_title": "",
    "modified": 1700000000
}
```

- Format is a **plain JSON object**, NOT an array. ACF per-block exports are single objects.
- `{namespace}` must match the `name` in `block.json` (e.g. `mytheme/info-accordion` → location value is `mytheme/info-accordion`).
- `key` must be a unique hash (e.g. `group_6a3f2b1c4d`). Never use a human-readable slug — ACF uses it as the primary identifier and requires global uniqueness.

## Key generation rules

When generating `fields.json`:
- Group key format: `group_<8-char hex>` — e.g. `group_9d4e8a2f`
- Field key format: `field_<8-char hex>` — e.g. `field_3a7f2c1b`
- Every key must be globally unique — generate independently for each field
- `modified` must be set to the current Unix timestamp: run `date +%s`
- Repeater sub-fields must include `"parent_repeater": "<repeater-field-key>"`

## Common field type snippets

Use these as starting points when writing fields directly in `fields.json`.

**Text / Textarea**
```json
{ "key": "field_<hash>", "label": "Heading", "name": "heading", "type": "text" }
{ "key": "field_<hash>", "label": "Description", "name": "description", "type": "textarea" }
```

**Image** — always use `return_format: "id"`; pass the ID to `wp_get_attachment_image()` or a theme helper
```json
{ "key": "field_<hash>", "label": "Image", "name": "image", "type": "image", "return_format": "id", "preview_size": "medium" }
```

**File / Video** — use `return_format: "url"` to get the URL directly
```json
{ "key": "field_<hash>", "label": "Video", "name": "video", "type": "file", "return_format": "url", "mime_types": "mp4" }
```

**Link** — always use `return_format: "array"`; destructure `url`, `title`, `target`
```json
{ "key": "field_<hash>", "label": "Button", "name": "button", "type": "link", "return_format": "array" }
```

**True / False**
```json
{ "key": "field_<hash>", "label": "Show Title", "name": "show_title", "type": "true_false", "default_value": 1, "ui": 1 }
```

**Repeater**
```json
{
  "key": "field_abc12345",
  "label": "Slides",
  "name": "slides",
  "type": "repeater",
  "layout": "block",
  "pagination": 0,
  "min": 0,
  "max": 0,
  "collapsed": "",
  "button_label": "Add Row",
  "rows_per_page": 20,
  "sub_fields": [
    { "key": "field_def67890", "label": "Title", "name": "title", "type": "textarea", "parent_repeater": "field_abc12345" },
    { "key": "field_ghi11223", "label": "Image", "name": "image", "type": "image", "return_format": "id", "preview_size": "medium", "parent_repeater": "field_abc12345" }
  ]
}
```

`parent_repeater` in each sub-field must equal the repeater's own `key` exactly.
```

**Relationship** — use `return_format: "object"` to get WP_Post objects
```json
{ "key": "field_<hash>", "label": "Members", "name": "members", "type": "relationship", "post_type": ["post"], "return_format": "object" }
```

## Modified timestamp — critical rule

After **every** edit to `fields.json`, update the `modified` field with the current Unix timestamp:

```bash
date +%s
```

Paste the output as the `modified` value. ACF uses this for field group sync detection. A stale or zero value causes sync issues where ACF ignores local JSON.

A hook in this plugin automatically reminds you when `fields.json` is edited.

## Auto-routing JSON saves

Install [`acf-local-json-router.php`](https://github.com/phucbm/wp-mu-plugins/blob/main/acf-local-json-router.php) to automate JSON routing:

- Block field groups → `blocks/{slug}/fields.json`
- All other groups → `acf-json/{location-type}-{title-slug}.json`

An admin notice confirms the file path after each save. The `modified` timestamp is updated automatically when saving through WP admin — manual `date +%s` is only needed when editing `fields.json` directly.

## Adding fields via WordPress admin

1. Go to ACF → Field Groups
2. Find the group assigned to this block
3. Add or edit fields, then Save
4. With `acf-local-json-router` active, ACF writes back to `fields.json` automatically
5. If editing the file directly: run `date +%s` and update `modified`

## Safe fields to edit in fields.json directly

- `label`, `instructions`, `required`, `default_value`, `placeholder` — safe to edit
- `name` — **never change** — maps to saved database content, changing it orphans existing data
- `key` — **never change** — ACF uses it as the field identifier
