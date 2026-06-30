# Block Automation Goal

## What we want

Fully automate steps 1 and 2 of the block creation workflow:

1. **Breakdown** — leader reads brief, produces a breakdown (fields needed, layout description)
2. **Scaffold** — dev creates block files: `block.json`, `fields.json`, `render.php`, `view.js`
3. **CSS** — frontend dev finishes styling (manual, high-standard, NOT automated)

Current cost of steps 1-2: 2-3 hours, up to 3 people. Target: under 5 minutes, 0 people after input is ready.

## Input: the breakdown

A breakdown describes a block's purpose, ACF fields, and rough layout. It can come from:

- A GitHub issue (identified by issue number)
- A local `.md` file
- A JSON config entry (see below)

Breakdown format (markdown, written by lead):
```md
## Block: info-accordion

**Slug:** `info-accordion`  
**Title:** Info Accordion  
**Description:** Expandable accordion with image, numbered title, and text per item.

### Fields
- `heading` — textarea — main section heading
- `according` — repeater
  - `image` — image (return_format: id)
  - `title` — textarea
  - `text` — textarea

### Layout
- Full-height section, container, top heading
- Two-column grid (5/7): left = stacked images (one visible at a time), right = accordion list
- Each accordion row: number + title as trigger, text + mobile image as panel
- Needs JS for accordion expand/collapse and image switching
```

## Batch config: `blocks-queue.json`

Place at theme root or project root. Lists blocks to create in one run.

```json
[
  {
    "source": "local",
    "breakdown": "breakdowns/info-accordion.md"
  },
  {
    "source": "github",
    "issue": 42
  },
  {
    "source": "inline",
    "slug": "hero-banner",
    "title": "Hero Banner",
    "description": "Full-width hero with heading, subtext, and CTA.",
    "fields": [
      { "name": "heading", "type": "text" },
      { "name": "subtext", "type": "textarea" },
      { "name": "cta_link", "type": "link", "return_format": "array" }
    ],
    "layout": "Single column, container, heading + subtext stacked, CTA button below",
    "js": false
  }
]
```

## Automation flow

```
[blocks-queue.json or single breakdown]
        ↓
  Claude reads each entry
  - parses fields, layout, slug, title
  - for GitHub: fetches issue via gh CLI
        ↓
  Dry-run report (per block):
  - files to create
  - fields summary
  - layout intent
  - flags: needs JS? needs admin preview?
        ↓
  User confirms (yes/edit/skip per block)
        ↓
  Claude creates all confirmed blocks:
  - block.json
  - fields.json (with generated unique keys)
  - render.php (structural HTML only: rows, columns, loops — no decorative CSS)
  - view.js stub (if JS needed)
        ↓
  Creation report: what was created, what to do next (add CSS, run ts-build)
```

## render.php scope (important)

Claude generates **structural HTML only**:
- Semantic tags: `<section>`, `<div>`, `<h2>`, `<ul>`, `<button>`, etc.
- Grid/column structure via Tailwind layout utilities: `grid`, `flex`, `col-span-*`
- ACF field output with correct PHP patterns (see `conventions.md`)
- `theme_get_block_wrapper_attributes()` wrapper (see `ref/get-block-wrapper-attributes.php`)
- Loops for repeaters
- Conditional rendering for optional fields
- `data-*` attributes for JS hooks if needed

Claude does NOT add:
- Decorative spacing values (leave as Tailwind placeholder classes like `pt-??`)
- Color classes
- Font/typography classes
- Animation classes
- Exact pixel values

Frontend dev fills in the decorative layer.

## What the skill needs to support

- `/wp-blocks-dev:from-breakdown` — scaffold one block from a breakdown file or GitHub issue
- `/wp-blocks-dev:batch-create` — read `blocks-queue.json`, show dry-run report, confirm, create all

Both sub-skills must:
1. Generate unique ACF field keys (format: `field_<8-char hex>`)
2. Generate unique group keys (format: `group_<8-char hex>`)
3. Set correct `location` binding to the block slug
4. Set `modified` to current Unix timestamp
5. Use configurable namespace in `block.json` name (read from project config or prompt user)
6. Use `theme_get_block_wrapper_attributes()` (from `ref/get-block-wrapper-attributes.php`)
