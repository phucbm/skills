---
name: audit-blocks-deep
description: Deep AI audit of all blocks — runs structural checks first, then uses AI to review content quality, descriptions, grammar, admin render justification, wrapper usage, and empty-state messages.
---

Read `[@/knowledge/wp-blocks-dev/acf-blocks/conventions.md](/knowledge/wp-blocks-dev/acf-blocks/conventions.md) and [@/knowledge/wp-blocks-dev/acf-blocks/fields.md](/knowledge/wp-blocks-dev/acf-blocks/fields.md)`, then:

## Step 1 — Structural check

```bash
node $(claude plugin path wp-blocks-dev)/scripts/audit-blocks.js
```

If there are `✗` issues, tell the user to fix them before proceeding. Warnings are fine to continue.

## Step 2 — AI content review

For each block read `block.json`, `fields.json`, `render.php`, `render-admin.php` (if exists) and check:

- **Title and description** — clear, human-readable, no placeholders, no grammar errors
- **ACF field labels** — meaningful, no defaults like "Text" or "Field Label", no typos. Never suggest changing `name` or `key`.
- **Wrapper** — `render.php` must use `get_block_wrapper_attributes()`, never build wrapper attributes manually
- **Admin render justification** — `render-admin.php` only for interactive/hidden-content blocks; flag static blocks that have it unnecessarily, and interactive blocks that are missing it
- **Empty states** — `render-admin.php` must show a placeholder when content is empty; `render.php` must render nothing on the frontend when content is missing
- **render.php cleanliness** — no commented-out code, no leftover scaffold comments

## Output format

```
{block-name}
  Structural:   ✔ passed
  Title:        ✔ clear
  Description:  ✗ "Sample description" — generic, update it
  Fields:       ⚠ field "text_1" has a generic label
  Wrapper:      ✔ correct
  Admin render: ✔ justified
  Empty states: ⚠ missing placeholder in render-admin.php
```

End with a summary count, then ask: **"Fix all issues automatically? (or specify which blocks/rules to fix)"** — only proceed after confirmation.
