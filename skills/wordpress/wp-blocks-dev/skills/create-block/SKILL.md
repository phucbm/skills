---
name: create-block
description: Scaffold a new ACF Gutenberg block with block.json, fields.json, and render.php
---

Read `[@/knowledge/wp-blocks-dev/acf-blocks/conventions.md](/knowledge/wp-blocks-dev/acf-blocks/conventions.md) and [@/knowledge/wp-blocks-dev/acf-blocks/fields.md](/knowledge/wp-blocks-dev/acf-blocks/fields.md)`, then:

1. Ask the user for:
   - **Block name** — kebab-case slug, e.g. `hero-banner`
   - **Block title** — human-readable, e.g. `Hero Banner`
   - **Block description** — one sentence (optional)
   - **Needs frontend JS?** — pass `--js` if yes
   - **Needs admin preview?** — pass `--admin` if yes (interactive blocks only)

2. Run the script from the theme root:
   ```bash
   node $(claude plugin path wp-blocks-dev)/scripts/create-block.js <name> --title="<title>" --description="<description>" [--js] [--admin]
   ```

3. Show the script output, then remind:
   - Add ACF fields in WordPress admin → Field Groups
   - After editing `fields.json`, run `date +%s` and update the `modified` value
   - If `--js` was used, run `pnpm ts-build` or `pnpm ts-watch`
