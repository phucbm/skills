---
name: wp-blocks-dev
description: Scaffold, audit and manage custom ACF Gutenberg blocks for WordPress with Tailwind CSS. Use when the user wants to create a new block, audit blocks, or set up a WordPress blocks project.
when_to_use: |
  - User wants to scaffold a new ACF Gutenberg block
  - User wants to audit existing blocks for structural or content issues
  - User wants to initialize a new WordPress theme with the wp-blocks-dev structure
  - User asks about block conventions, render.php patterns, fields.json, or asset loading
  - User works in a WordPress project with ACF Pro and the wp-blocks-dev workflow
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

Read [`@/knowledge/wp-blocks-dev/overview.md`](/knowledge/wp-blocks-dev/overview.md), then determine which sub-skill to invoke based on the user's request:

- `/wp-blocks-dev:init` — initialize a new theme with the full directory structure
- `/wp-blocks-dev:create-block` — scaffold a new block via `create-block.js`
- `/wp-blocks-dev:audit-blocks` — fast structural audit (files, wrappers, timestamps)
- `/wp-blocks-dev:audit-blocks-deep` — structural audit + AI content quality review

For general questions about conventions, PHP patterns, ACF fields, Tailwind build, or TypeScript setup, read the relevant knowledge files directly:

- [`@/knowledge/wp-blocks-dev/acf-blocks/conventions.md`](/knowledge/wp-blocks-dev/acf-blocks/conventions.md)
- [`@/knowledge/wp-blocks-dev/acf-blocks/fields.md`](/knowledge/wp-blocks-dev/acf-blocks/fields.md)
- [`@/knowledge/wp-blocks-dev/wordpress/asset-loading.md`](/knowledge/wp-blocks-dev/wordpress/asset-loading.md)
- [`@/knowledge/wp-blocks-dev/tailwind/build-pipeline.md`](/knowledge/wp-blocks-dev/tailwind/build-pipeline.md)
- [`@/knowledge/wp-blocks-dev/typescript/tsup-setup.md`](/knowledge/wp-blocks-dev/typescript/tsup-setup.md)
