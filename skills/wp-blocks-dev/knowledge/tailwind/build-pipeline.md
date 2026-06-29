# Tailwind v4 Build Pipeline

Tailwind is built outside WordPress by a Node.js wrapper script — not via WP enqueue directly.

## Scripts

```json
{
  "tw-build": "node ./scripts/tailwind.js",
  "tw-watch": "node ./scripts/tailwind.js --watch"
}
```

The wrapper script reads `TAILWIND_USER` from `.env.local` to determine the output file.

## Output files

- `assets/css/style.generated.css` — shared production file, committed to git
- `assets/css/style.{user}.generated.css` — per-developer file, gitignored

## Per-developer CSS setup

Each developer sets their own key in `.env.local` (gitignored):

```
TAILWIND_USER=yourlogin
```

The project lead maps WP user IDs to keys in `functions.php`:

```php
define('DEV_CSS_MAP', [
    1 => 'alice',
    2 => 'bob',
]);
```

Each dev runs `pnpm tw-watch` independently. The `tailwind-theme-loader` mu-plugin reads the logged-in admin's user ID, finds their key in `DEV_CSS_MAP`, and serves their CSS file automatically.

## CSS entry file

`assets/css/index.css`:

```css
@import "tailwindcss";
```

## .gitignore additions

```
.env.local
assets/css/style.*.generated.css
```

## Deploy

Always commit `assets/css/style.generated.css` before deploying — the server cannot run Node.js.

## Setup commands (during init)

```bash
mkdir -p themes/{slug}/scripts themes/{slug}/assets/css
cp $(claude plugin path wp-blocks-dev)/templates/tailwind.js themes/{slug}/scripts/tailwind.js
```

Then copy [`tailwind-theme-loader.php`](https://github.com/phucbm/wp-mu-plugins/blob/main/tailwind-theme-loader.php) into `mu-plugins/`.
