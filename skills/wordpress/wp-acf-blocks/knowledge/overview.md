# wp-acf-blocks

Scaffold, audit, and manage custom ACF Gutenberg blocks for WordPress with optional Tailwind CSS and TypeScript support.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| `init` | `/wp-acf-blocks:init` | Scaffold new theme — collects name/slug/author, optional Tailwind/TS, creates directory structure |
| `plan-block` | `/wp-acf-blocks:plan-block` | Discuss block requirements, draft breakdown, create GitHub issue |
| `add-block` | `/wp-acf-blocks:add-block` | Scaffold one or more blocks from GitHub issues (`#42 #43`), a markdown brief, or interactive prompts |
| `audit-blocks` | `/wp-acf-blocks:audit-blocks` | Fast structural audit via `scripts/audit-blocks.js` — checks files, wrappers, timestamps |
| `audit-blocks-deep` | `/wp-acf-blocks:audit-blocks-deep` | Structural audit + AI content quality review (titles, fields, wrapper, empty states) |

## Knowledge files

- [`acf-blocks/conventions.md`](/knowledge/acf-blocks/conventions.md) — block file structure, `block.json`, `render.php`, `render-admin.php`, wrapper attributes, field reading patterns, block registration
- [`acf-blocks/fields.md`](/knowledge/acf-blocks/fields.md) — `fields.json` format, ACF field types, modified timestamp rule
- [`wordpress/asset-loading.md`](/knowledge/wordpress/asset-loading.md) — enqueue patterns, mu-plugins, block registration from `blocks.json`
- [`tailwind/build-pipeline.md`](/knowledge/tailwind/build-pipeline.md) — Tailwind v4, per-dev CSS via `TAILWIND_USER`, output files, `.gitignore` rules
- [`typescript/tsup-setup.md`](/knowledge/typescript/tsup-setup.md) — `*.entry.ts` convention, tsup config, tsconfig, `viewScript` in `block.json`

## Requirements

- WordPress 6.0+, ACF Pro, PHP 8.0+
- Node.js + pnpm (optional, for Tailwind/TypeScript)
- 3 mu-plugins from [phucbm/wp-mu-plugins](https://github.com/phucbm/wp-mu-plugins)

## Key conventions

1. Each block lives in `blocks/{slug}/` — self-contained with `block.json`, `fields.json`, `render.php`
2. Always use `get_block_wrapper_attributes()` in render.php wrapper
3. `fields.json` modified timestamp must be updated after any ACF field edit (`date +%s`)
4. Per-developer CSS: `TAILWIND_USER` env var maps to `style.{user}.generated.css`
5. TypeScript entry files use `*.entry.ts` convention, compiled by tsup
