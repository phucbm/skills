---
name: setup
description: Set up a new WordPress theme with the wp-acf-blocks block development workflow
---

Read [`@/knowledge/wp-acf-blocks/acf-blocks/conventions.md`](/knowledge/wp-acf-blocks/acf-blocks/conventions.md) before proceeding.

## Step 1 — Collect project info

Ask for all answers before proceeding:

- **Theme name** — human-readable, e.g. `My Client Site`
- **Theme slug / Text Domain** — kebab-case, e.g. `my-client-site`
- **Author** — developer or agency name
- **WordPress path** — absolute path to the WordPress installation root (needed to copy mu-plugins)

## Step 2 — Confirm optional features

Default yes for all:

- **Tailwind v4** — CSS build pipeline with per-developer CSS support
- **TypeScript + tsup** — JS bundler for entry files and block scripts

## Step 3 — Check for existing files

If a file already exists, ask whether to overwrite or skip. Never silently overwrite.

## Step 4 — Copy and configure boilerplate

Copy the entire `boilerplate/theme/` directory to `themes/{slug}/`:

```bash
cp -r "$(claude plugin path wp-acf-blocks)/boilerplate/theme" themes/{slug}
```

Then replace all placeholders throughout the copied files:

| Placeholder | Replace with |
|-------------|--------------|
| `{THEME_NAME}` | Human-readable theme name |
| `{TEXT_DOMAIN}` | Theme slug (kebab-case) |
| `{AUTHOR}` | Author name |

Files containing placeholders: `style.css`, `functions.php`, `package.json`.

The scaffolded structure:

```
themes/{slug}/
├── style.css
├── index.php
├── functions.php           THEME_NAME constant, DEV_CSS_MAP stub, requires
├── blocks.json             { "blocks": [] }
├── inc/
│   ├── enqueue-assets.php
│   └── auto-include-components.php
├── helpers/
│   └── ui/
│       └── get-block-wrapper-attributes.php
├── blocks/
├── scripts/
│   └── tailwind.js
├── assets/
│   ├── js/
│   │   └── index.entry.ts
│   └── css/
│       └── index.css
├── tsup.config.ts
├── tsconfig.json
└── package.json
```

## Step 5 — Install mu-plugins

Copy all three mu-plugins to the WordPress `mu-plugins` directory:

```bash
cp "$(claude plugin path wp-acf-blocks)/boilerplate/mu-plugins/wp-blocks-loader.php" {WP_PATH}/wp-content/mu-plugins/
cp "$(claude plugin path wp-acf-blocks)/boilerplate/mu-plugins/acf-local-json-router.php" {WP_PATH}/wp-content/mu-plugins/
cp "$(claude plugin path wp-acf-blocks)/boilerplate/mu-plugins/tailwind-theme-loader.php" {WP_PATH}/wp-content/mu-plugins/
```

**What each does:**

- **`wp-blocks-loader.php`** — reads `blocks.json`, registers each block via `register_block_type()`, adds a project block category in the Gutenberg inserter (label from `THEME_NAME` constant), fixes WP 6.3+ defer strategy so `viewScript` files load in footer
- **`acf-local-json-router.php`** — routes ACF field group saves to `blocks/{slug}/fields.json` (per-block) or `acf-json/` (all other groups); required for the per-block `fields.json` workflow
- **`tailwind-theme-loader.php`** — enqueues Tailwind-built CSS on frontend and inside Gutenberg editor iframe; supports per-developer CSS files via `DEV_CSS_MAP`

## Step 6 — If Tailwind selected

Add `.gitignore` entries:

```
.env.local
assets/css/style.*.generated.css
```

For per-developer CSS, instruct each developer to create `.env.local` in the theme root:

```
TAILWIND_USER=theirlogin
```

Then map WP user IDs in `functions.php`:

```php
define('DEV_CSS_MAP', [
    1 => 'alice',
    2 => 'bob',
]);
```

## Step 7 — Install dependencies and build

```bash
cd themes/{slug}
pnpm install
pnpm build
```

## Step 8 — Confirm completion

Print a summary of what was created and what was skipped. Next steps:

- Activate the theme in WordPress admin
- Confirm ACF plugin is active (required for block field groups)
- Use `/wp-acf-blocks:plan-block` to plan a block and create a GitHub issue
- Use `/wp-acf-blocks:add-block` to scaffold the first block
