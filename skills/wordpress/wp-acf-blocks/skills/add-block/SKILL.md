---
name: add-block
description: Scaffold one or more ACF Gutenberg blocks from GitHub issues, a markdown brief, or interactive prompts. Generates block.json, fields.json, render.php, and optional view.js.
---

Read [`@/knowledge/wp-acf-blocks/acf-blocks/conventions.md`](/knowledge/wp-acf-blocks/acf-blocks/conventions.md) and [`@/knowledge/wp-acf-blocks/acf-blocks/fields.md`](/knowledge/wp-acf-blocks/acf-blocks/fields.md) before proceeding.

## Usage

```
/wp-acf-blocks:add-block              # interactive
/wp-acf-blocks:add-block #42          # from GitHub issue
/wp-acf-blocks:add-block #42 #43 #44  # batch from multiple issues
/wp-acf-blocks:add-block brief.md     # from local markdown file
```

## Step 1 — Detect namespace

Read `style.css` at the current working directory (theme root). Parse `Text Domain:`:

```bash
grep "Text Domain" style.css
```

If not found, search one level up: `themes/*/style.css`. If multiple themes found, ask the user which one. Use the Text Domain value as the namespace for the rest of the session.

## Step 2 — Gather block info

**From GitHub issue(s):**
```bash
gh issue view <n> --json title,body
```
Parse the body using the breakdown format (see below). Fetch all issues in parallel before proceeding.

**From local file:**
Read the file. Parse using the breakdown format.

**Interactive:**
Ask the user for:
- Slug (kebab-case, e.g. `hero-banner`)
- Title (human-readable, e.g. `Hero Banner`)
- Description (one sentence)
- Fields: name, type, and options per field
- Layout description (used to generate render.php structure)
- Needs frontend JS? (yes/no)

## Breakdown format

```md
## Block: info-accordion

**Slug:** `info-accordion`
**Title:** Info Accordion
**Description:** Expandable accordion with image, numbered title, and text per item.

### Fields
- `heading` — textarea — main section heading
- `items` — repeater
  - `image` — image (return_format: id)
  - `title` — textarea
  - `text` — textarea

### Layout
- Full-height section, container, top heading
- Two-column grid (5/7): left = stacked images, right = accordion list
- Needs JS for accordion expand/collapse and image switching
```

## Step 3 — Dry-run report

Before creating any files, show a summary for each block:

```
Block: info-accordion
  Files: block.json, fields.json, render.php, view.js
  Fields: heading (textarea), items repeater [image, title, text]
  JS: yes
  Namespace: dmd

Block: hero-banner
  Files: block.json, fields.json, render.php
  Fields: heading (text), subtext (textarea), cta_link (link)
  JS: no
  Namespace: dmd
```

Ask: **Confirm all? Or skip/edit any block?**

Do not create files until confirmed.

## Step 4 — Generate files

For each confirmed block, create `blocks/{slug}/`:

### block.json

```json
{
  "$schema": "https://raw.githubusercontent.com/AdvancedCustomFields/schemas/refs/heads/main/json/block.json",
  "apiVersion": 3,
  "name": "{namespace}/{slug}",
  "title": "{Title}",
  "description": "{Description}",
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

Add `"viewScript": ["file:./view.js"]` if JS flagged.

### fields.json

Generate a unique `group_<8-char hex>` key for the group. Generate a unique `field_<8-char hex>` key for every field and sub-field. Set `modified` to current Unix timestamp (`date +%s`). Set location to `{namespace}/{slug}`.

For repeater sub-fields: set `parent_repeater` to the repeater field's own key.

Use field type snippets from `knowledge/acf-blocks/fields.md`.

### render.php

Generate structural HTML only - no decorative CSS:

```php
<?php
$wrapper_attributes = theme_get_block_wrapper_attributes([
    'slug'  => '{slug}',
    'block' => $block,
    'class' => '',
]);
?>
<section <?php echo $wrapper_attributes; ?>>
    <div class="container">
        <!-- structural layout from breakdown -->
    </div>
</section>
```

Rules:
- Semantic tags: `<section>`, `<div>`, `<h2>`, `<ul>`, `<button>`, etc.
- Grid/column structure via Tailwind layout utilities only: `grid`, `flex`, `col-span-*`, `gap-??`
- Use `pt-??`, `pb-??`, `mt-??` etc. as placeholders for spacing (frontend dev fills values)
- ACF field output with correct PHP patterns from `conventions.md`
- Loops for repeaters using `foreach ($items as $index => $item)`
- Conditional rendering: `if ($field)` before outputting optional fields
- `data-*` attributes for JS hooks if needed
- No color classes, no font/typography classes, no animation classes, no exact pixel values

### view.js (if JS flagged)

```js
// {Title} — frontend JS
// Scope all selectors to [data-theme-block="{slug}"]
```

### blocks.json

Append `"{namespace}/{slug}"` to the array in `blocks.json` at theme root.

## Step 5 — Creation report

After all files are written:

```
Created: info-accordion
  blocks/info-accordion/block.json
  blocks/info-accordion/fields.json
  blocks/info-accordion/render.php
  blocks/info-accordion/view.js

Created: hero-banner
  blocks/hero-banner/block.json
  blocks/hero-banner/fields.json
  blocks/hero-banner/render.php

Next steps:
  - Add decorative CSS classes to render.php (spacing, colors, typography)
  - If JS block: run `pnpm ts-build` or `pnpm ts-watch`
  - Activate field groups in WordPress admin (ACF → Field Groups)
```
