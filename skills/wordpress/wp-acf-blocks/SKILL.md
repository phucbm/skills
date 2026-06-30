---
name: wp-acf-blocks
description: Scaffold, revise and manage custom ACF Gutenberg blocks for WordPress with Tailwind CSS. Use when the user wants to create a new block, revise/audit blocks, or set up a WordPress blocks project.
when_to_use: |
  - User wants to scaffold a new ACF Gutenberg block
  - User wants to revise or audit existing blocks for structural or content issues
  - User wants to set up a new WordPress theme with the wp-acf-blocks structure
  - User asks about block conventions, render.php patterns, fields.json, or asset loading
  - User works in a WordPress project with ACF Pro and the wp-acf-blocks workflow
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

Read [`@/knowledge/wp-acf-blocks/overview.md`](/knowledge/wp-acf-blocks/overview.md), then determine which sub-skill to invoke based on the user's request:

- `/wp-acf-blocks:setup` — set up a new theme with the full directory structure and mu-plugins
- `/wp-acf-blocks:plan-block` — discuss a block's requirements and create a GitHub issue with structured breakdown
- `/wp-acf-blocks:add-block` — scaffold one or more blocks from GitHub issues, markdown brief, or interactive prompts
- `/wp-acf-blocks:revise-block` — fast structural audit (files, wrappers, timestamps); accepts block slugs as args
- `/wp-acf-blocks:revise-block-deep` — structural audit + AI content quality review; accepts block slugs as args

For general questions about conventions, PHP patterns, ACF fields, Tailwind build, or TypeScript setup, read the relevant knowledge files directly:

- [`@/knowledge/wp-acf-blocks/acf-blocks/conventions.md`](/knowledge/wp-acf-blocks/acf-blocks/conventions.md)
- [`@/knowledge/wp-acf-blocks/acf-blocks/fields.md`](/knowledge/wp-acf-blocks/acf-blocks/fields.md)
- [`@/knowledge/wp-acf-blocks/wordpress/asset-loading.md`](/knowledge/wp-acf-blocks/wordpress/asset-loading.md)
- [`@/knowledge/wp-acf-blocks/tailwind/build-pipeline.md`](/knowledge/wp-acf-blocks/tailwind/build-pipeline.md)
- [`@/knowledge/wp-acf-blocks/typescript/tsup-setup.md`](/knowledge/wp-acf-blocks/typescript/tsup-setup.md)
