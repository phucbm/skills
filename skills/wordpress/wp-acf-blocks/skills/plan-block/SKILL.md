---
name: plan-block
description: Discuss a new block's purpose and requirements with the user, then create a GitHub issue with a structured breakdown ready for /wp-acf-blocks:add-block.
---

Read [`@/knowledge/wp-acf-blocks/block-automation-goal.md`](/knowledge/wp-acf-blocks/wp-acf-blocks/block-automation-goal.md) for the breakdown format before starting.

## Step 1 — Get GitHub project

Ask: **Which GitHub project should this issue go into?**
Accept a project URL or project name. If the user has used one before this session, suggest it.

```bash
gh project list --owner <owner>
```

## Step 2 — Understand the block

Ask: **What is this block for? Describe it loosely.**

Then ask clarifying questions based on the response. Cover all of these before drafting - but ask conversationally, not as a form:

- What content does it display? (text, images, video, links?)
- Any repeating items? (cards, slides, rows, accordion items?)
- Layout: single column, grid, split, tabs, accordion, slider?
- Does anything expand, animate, or change on user interaction?
- Is there a heading above the main content?
- Any CTAs or links?
- Mobile layout different from desktop?

Stop asking when you have enough to write a complete breakdown. Usually 3-5 exchanges.

## Step 3 — Draft breakdown

Write the breakdown in standard format:

```md
## Block: {slug}

**Slug:** `{slug}`
**Title:** {Title}
**Description:** {One sentence describing what this block does.}

### Fields
- `{field_name}` — {type} — {purpose}
- `{repeater_name}` — repeater
  - `{sub_field}` — {type}

### Layout
- {Layout description line by line}
- {Note any JS interactions needed}
```

Rules:
- Slug: kebab-case, descriptive, concise (e.g. `team-grid`, `faq-accordion`)
- Fields: only what render.php will actually read via `get_field()`
- Image fields: always note `(return_format: id)`
- Link fields: always note `(return_format: array)`
- Layout: enough detail for Claude to generate structural HTML - columns, order, loops, interactions

Show the draft to the user and ask: **Does this look right? Any changes?**

Iterate until approved.

## Step 4 — Create GitHub issue

```bash
gh issue create \
  --repo <owner>/<repo> \
  --title "Block: {Title}" \
  --body "{breakdown}" \
  --project "{project name or URL}"
```

Show the created issue URL and number.

## Step 5 — Handoff

```
Issue #42 created: Block: {Title}

Run this to scaffold:
/wp-acf-blocks:add-block #42
```
