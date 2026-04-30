# Migrating Next.js from Vercel to Cloudflare Pages

## Conclusion

Not viable for large Next.js apps on Cloudflare's free plan. The bundled worker size is the hard blocker. Lightweight projects (few dependencies) work fine.

---

## Two Cloudflare Adapters — Pick the Right One

### `@cloudflare/next-on-pages` (older)
- Splits each route into a separate edge function
- **Requires every dynamic route to export `runtime='edge'`**
- Hard incompatibility: Next.js throws if you combine `runtime='edge'` with `generateStaticParams` in the same route
- Any Node.js module (`fs`, `path`, `child_process`) anywhere in a route's import chain breaks the build
- Not recommended for Nextra or content-heavy apps

### `@opennextjs/cloudflare` (recommended)
- Bundles the entire app into a single `handler.mjs` worker
- Does NOT require `runtime='edge'` on all routes
- Supports Node.js APIs via the `nodejs_compat` Cloudflare compatibility flag
- Correct choice for apps with Node.js-dependent server components

---

## Migration Steps (`@opennextjs/cloudflare`)

1. Install: `pnpm add -D @opennextjs/cloudflare wrangler`
2. Create `open-next.config.ts`:
   ```ts
   import { defineCloudflareConfig } from "@opennextjs/cloudflare";
   export default defineCloudflareConfig({});
   ```
3. Create `wrangler.jsonc`:
   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "main": ".open-next/worker.js",
     "name": "<your-cloudflare-worker-name>",
     "compatibility_date": "<today>",
     "compatibility_flags": ["nodejs_compat"],
     "assets": {
       "directory": ".open-next/assets",
       "binding": "ASSETS"
     },
     "observability": { "enabled": true }
   }
   ```
   - Worker name must match the name in your Cloudflare dashboard exactly
   - Only add `services` / `WORKER_SELF_REFERENCE` binding if you use ISR (`export const revalidate = X` at page level) — most apps don't need it
4. In Cloudflare Pages dashboard: set build command to `opennextjs-cloudflare build`, output directory to `.open-next/assets`

---

## The Real Blocker: Worker Size

`@opennextjs/cloudflare` collapses everything into one `handler.mjs`. Cloudflare enforces a compressed size limit:

| Plan | Limit |
|---|---|
| Free | 3 MiB |
| Paid | 10 MiB |

**Always measure before deploying:**
```bash
opennextjs-cloudflare build
du -sh .open-next/server-functions/default/handler.mjs
```

Real-world examples:
- Lightweight Nextra docs site (minimal deps): ~4 MB — works on paid, too large for free
- Full-featured Next.js app (Sandpack, GSAP, Radix UI, component registry): ~42 MB — exceeds even the paid plan

**Important:** Shiki language chunks and `.next/server/chunks/` are served as CDN assets and do NOT count toward the worker size limit. The worker size is driven by `node_modules` bundled into the worker context — primarily heavy packages imported by server components or API routes.

---

## If the Worker Is Too Large

Options in order of effort:

1. **Upgrade plan** — only viable if `handler.mjs` is between 3–10 MB
2. **Remove or lazy-load heavy dependencies** — likely candidates: Sandpack, GSAP, icon libraries, OG image generation (`@vercel/og` adds ~3.6 MB via `resvg.wasm`)
3. **Limit Shiki language packs** — configure Nextra/Shiki to only bundle languages actually used
4. **Accept it's not viable** — some apps are simply too large for Cloudflare's worker model

---

## Pitfalls to Avoid

- **`runtime='edge'` on API routes for Cloudflare breaks Vercel** — Vercel's edge bundler may flag Node.js module references that are fine in Node.js runtime. Only add `runtime='edge'` to routes that genuinely need it (stateless, no Node.js APIs). Revert these if moving back to Vercel.
- **`WORKER_SELF_REFERENCE` service binding** — only needed for ISR. The binding name must match your exact worker name or the deploy fails with code 10143.
- **Worker name mismatch** — the `name` in `wrangler.jsonc` must match the Cloudflare dashboard worker name exactly (visible in CI warning if wrong).
- **Cloudflare doesn't auto-update build settings** — when switching adapters on an existing project, manually update the build command and output directory in the dashboard.
