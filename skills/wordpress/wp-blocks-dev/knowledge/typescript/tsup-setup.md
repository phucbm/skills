# TypeScript + tsup Setup

## Entry file convention

Any file ending in `*.entry.ts` anywhere in the theme is treated as a JS entry point. tsup compiles it to the same directory, stripping `.entry` from the filename:

```
blocks/hero/view.entry.ts  →  blocks/hero/view.js
assets/js/index.entry.ts   →  assets/js/index.js
```

## tsup.config.ts

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['**/*.entry.ts'],
    format: ['iife'],
    outDir: '.',
    bundle: true,
    clean: false,
});
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Scripts

```json
{
  "ts-build": "NODE_ENV=production tsup",
  "ts-watch": "NODE_ENV=development tsup --watch"
}
```

## Block-specific JS

For a block that needs frontend JS, create `view.entry.ts` in the block folder:

```ts
document.querySelectorAll<HTMLElement>('.wp-block-{block-name}').forEach((block) => {
    // block JS here
});
```

Then declare the compiled output in `block.json`:

```json
{
  "viewScript": ["file:./view.js"]
}
```

WordPress loads `view.js` only on pages where the block is present.

## Combined dev script

```json
{
  "dev": "pnpm ts-watch & pnpm tw-watch",
  "build": "pnpm ts-build && pnpm tw-build"
}
```
