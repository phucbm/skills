---
name: wp-acf-blocks
description: Scaffold, audit and manage custom ACF Gutenberg blocks for WordPress with Tailwind CSS. Use when the user wants to create a new block, audit blocks, or set up a WordPress blocks project.
when_to_use: |
  - User wants to scaffold a new ACF Gutenberg block
  - User wants to audit existing blocks for structural or content issues
  - User wants to initialize a new WordPress theme with the wp-acf-blocks structure
  - User asks about block conventions, render.php patterns, fields.json, or asset loading
  - User works in a WordPress project with ACF Pro and the wp-acf-blocks workflow
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

Read [`@/knowledge/wp-acf-blocks/overview.md`](/knowledge/wp-acf-blocks/overview.md), then determine which sub-skill to invoke based on the user's request:

- `/wp-acf-blocks:init` — initialize a new theme with the full directory structure
- `/wp-acf-blocks:create-block` — scaffold a new block via `create-block.js`
- `/wp-acf-blocks:audit-blocks` — fast structural audit (files, wrappers, timestamps)
- `/wp-acf-blocks:audit-blocks-deep` — structural audit + AI content quality review

For general questions about conventions, PHP patterns, ACF fields, Tailwind build, or TypeScript setup, read the relevant knowledge files directly:

- [`@/knowledge/wp-acf-blocks/acf-blocks/conventions.md`](/knowledge/wp-acf-blocks/acf-blocks/conventions.md)
- [`@/knowledge/wp-acf-blocks/acf-blocks/fields.md`](/knowledge/wp-acf-blocks/acf-blocks/fields.md)
- [`@/knowledge/wp-acf-blocks/wordpress/asset-loading.md`](/knowledge/wp-acf-blocks/wordpress/asset-loading.md)
- [`@/knowledge/wp-acf-blocks/tailwind/build-pipeline.md`](/knowledge/wp-acf-blocks/tailwind/build-pipeline.md)
- [`@/knowledge/wp-acf-blocks/typescript/tsup-setup.md`](/knowledge/wp-acf-blocks/typescript/tsup-setup.md)
