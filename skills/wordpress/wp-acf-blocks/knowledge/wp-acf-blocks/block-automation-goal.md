# Block Automation Goal

## What we want

Fully automate steps 1 and 2 of the block creation workflow:

1. **Breakdown** - leader reads brief, produces a breakdown (fields needed, layout description)
2. **Scaffold** - dev creates block files: `block.json`, `fields.json`, `render.php`, `view.js`
3. **CSS** - frontend dev finishes styling (manual, high-standard, NOT automated)

Current cost of steps 1-2: 2-3 hours, up to 3 people. Target: under 5 minutes, 0 people after input is ready.

## The skill: `add-block`

One sub-skill handles all creation paths:

```
/wp-acf-blocks:add-block              # interactive - Claude prompts for all info
/wp-acf-blocks:add-block #42          # single GitHub issue
/wp-acf-blocks:add-block #42 #43 #44  # batch - multiple issues
/wp-acf-blocks:add-block brief.md     # local markdown breakdown file
```

No `blocks-queue.json`. GitHub issues are the stable source - pass issue numbers directly.

## Input formats

### GitHub issue (primary)

Fetch via `gh issue view <n> --json title,body`. Issue body follows the breakdown format below.

### Local markdown file

Read the file directly. Same breakdown format.

### Interactive

Claude asks:
- Block slug (kebab-case)
- Block title (human-readable)
- Block description (one sentence)
- Fields (name, type, options per field)
- Layout description (for render.php generation)
- Needs frontend JS?

## Breakdown format

Markdown written by lead. Claude parses this to extract all scaffolding info:

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
- Two-column grid (5/7): left = stacked images (one visible at a time), right = accordion list
- Each accordion row: number + title as trigger, text + mobile image as panel
- Needs JS for accordion expand/collapse and image switching
```

## Namespace detection

Claude reads `style.css` at theme root and extracts `Text Domain`:

```css
/*
Theme Name: DMD
Text Domain: dmd
*/
```

`Text Domain: dmd` - namespace is `dmd`. Used in `block.json` name (`dmd/info-accordion`) and `fields.json` location binding.

If multiple themes found, Claude asks once and remembers for the session.

## Process flow

```
/wp-acf-blocks:add-block #42 #43
        ↓
Read style.css - extract namespace
        ↓
gh issue view 42 --json title,body
gh issue view 43 --json title,body
        ↓
Claude parses each: slug, title, description, fields, layout, JS flag
        ↓
Dry-run report:
  #42 info-accordion — 4 fields — needs JS
  #43 hero-banner — 3 fields — no JS
        ↓
User: confirm all / skip #43 / edit #42
        ↓
Create all confirmed blocks
        ↓
Summary: files created, what to do next
```

## Files generated per block

| File | Always? | Notes |
|------|---------|-------|
| `block.json` | yes | namespace from `Text Domain` in `style.css` |
| `fields.json` | yes | unique keys generated, `modified` set to current Unix timestamp |
| `render.php` | yes | structural HTML from layout description |
| `view.js` stub | only if JS flagged | empty module with comment |
| `blocks.json` entry | yes | slug appended to theme `blocks.json` |

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

## Key generation rules

Both sub-skills must:
1. Generate unique ACF field keys: `field_<8-char hex>` (e.g. `field_3a7f2c1b`)
2. Generate unique group keys: `group_<8-char hex>` (e.g. `group_9d4e8a2f`)
3. Set `location` binding to `{namespace}/{block-slug}`
4. Set `modified` to current Unix timestamp (`date +%s`)
5. Set `parent_repeater` on sub-fields to the repeater's own key
