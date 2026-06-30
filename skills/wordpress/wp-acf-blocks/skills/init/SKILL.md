---
name: init
description: Initialize a new WordPress theme with the wp-acf-blocks block development workflow
---

Read `[@/knowledge/wp-acf-blocks/acf-blocks/conventions.md](/knowledge/wp-acf-blocks/acf-blocks/conventions.md)`, `[@/knowledge/wp-acf-blocks/tailwind/build-pipeline.md](/knowledge/wp-acf-blocks/tailwind/build-pipeline.md)`, and `[@/knowledge/wp-acf-blocks/typescript/tsup-setup.md](/knowledge/wp-acf-blocks/typescript/tsup-setup.md)`, then:

## 1. Collect project info

Ask for all answers before proceeding:
- **Project name** — human-readable, e.g. `My Client Site`
- **Theme slug** — kebab-case, e.g. `my-client-site`
- **Author** — developer or agency name

## 2. Confirm optional features

Default yes for all:
- **Tailwind v4** — CSS build pipeline with per-developer CSS support
- **TypeScript + tsup** — JS bundler for entry files and block scripts
- **Per-developer CSS** — multi-dev Tailwind setup

## 3. Check for existing files

If a file already exists, ask whether to overwrite or skip. Never silently overwrite.

## 4. Scaffold the theme

Create under `themes/{slug}/`:

```
themes/{slug}/
├── style.css           Theme header (Name, Author, Text Domain, Version)
├── index.php           <?php // Silence is golden.
├── functions.php       require register-blocks + enqueue-assets, PX_PROJECT_NAME constant
├── blocks.json         []
├── QUICKSTART.md
├── blocks/
├── inc/
│   ├── register-blocks.php
│   └── enqueue-assets.php
├── helpers/
└── assets/
    ├── js/
    └── css/
```

`QUICKSTART.md` content:
```markdown
# Quick Start
- `/wp-acf-blocks:add-block` — scaffold a new block (interactive, from GitHub issue, or markdown brief)
- `/wp-acf-blocks:audit-blocks` — audit all blocks against conventions
```

## 5. If Tailwind selected

Follow `knowledge/tailwind/build-pipeline.md`. Copy the template:
```bash
mkdir -p themes/{slug}/scripts themes/{slug}/assets/css
cp $(claude plugin path wp-acf-blocks)/templates/tailwind.js themes/{slug}/scripts/tailwind.js
```

Remind user to copy `tailwind-theme-loader.php` into `mu-plugins/`.

## 6. If TypeScript selected

Follow `knowledge/typescript/tsup-setup.md`. Create `tsup.config.ts`, `tsconfig.json`, and `assets/js/index.entry.ts`.

## 7. Confirm completion

Print a summary of what was created and what was skipped. Next steps:
- Activate the theme in WordPress
- Run `pnpm install && pnpm build` if Tailwind or TS was selected
- Use `/wp-acf-blocks:add-block` to add the first block
