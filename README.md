# phucbm/skills

<img width="947" height="581" alt="Screenshot 2026-04-29 at 10 14 41 (1)" src="https://github.com/user-attachments/assets/856cf0b9-deea-426c-8d09-97f58d6758b0" />

My personal knowledge base, reusable skills and reference knowledge observed across real projects.

**Skills** are slash commands that instruct Claude to perform a specific task (e.g. `/add-skill`, `/rag`).

**Knowledge** files are markdown references that Claude reads to apply proven patterns without re-discovering them each session (e.g. GROQ streaming setup, Pinecone schema).

---

## Quickstart

### Via skills.sh

Run the installer and pick what you want:

```bash
npx skills@latest add phucbm/skills
```

### Via Claude Plugin

Add the phucbm marketplace (once, ever):

```shell
/plugin marketplace add phucbm/skills
```

Install the skills plugin:

```shell
/plugin install skills@phucbm
```

Update when new skills are released:

```shell
/plugin marketplace update phucbm
```

---

## Skills

Skills I use across projects.

- **[add-skill](skills/add-skill/SKILL.md)** - Summarize knowledge from the current project and push it to this repo.
- **[update-skill](skills/update-skill/SKILL.md)** - Diff and update an existing knowledge entry.
- **[learn](skills/learn/SKILL.md)** - Scan any repo, diff against existing skills, and suggest what to save or update.
- **[vercel-ai-gateway](skills/vercel-ai-gateway/SKILL.md)** - Set up Vercel AI Gateway for multi-provider AI access.
- **[rag](skills/rag/SKILL.md)** - Build a RAG pipeline - chunk, embed, store, query, inject into prompt.
- **[pinecone](skills/pinecone/SKILL.md)** - Set up Pinecone as the vector DB in a RAG pipeline.
- **[groq](skills/groq/SKILL.md)** - Integrate GROQ LLM streaming into a project.
- **[dexie](skills/dexie/SKILL.md)** - Set up Dexie.js (IndexedDB) in a local-first Next.js + React + TypeScript app.
- **[counterapi](skills/counterapi/SKILL.md)** - Add lightweight hit counters via counterapi.dev v2.
- **[wp-blocks-dev](skills/wp-blocks-dev/SKILL.md)** - Scaffold, audit and manage ACF Gutenberg blocks with Tailwind CSS.
- **[publish-npm](skills/publish-npm/SKILL.md)** - Auto-publish npm package on GitHub release via token or OIDC.
- **[cloudflare-pages](skills/cloudflare-pages/SKILL.md)** - Migrate a Next.js app to Cloudflare Pages, pick the right adapter, and diagnose worker size issues.
- **[discord-as-backend](skills/discord-as-backend/SKILL.md)** - Use a Discord Forum channel as a database or a Discord webhook as a form submission inbox.
- **[github-as-db](skills/github-as-db/SKILL.md)** - Use a GitHub repo as a zero-infra data store — JSON files as records, GitHub App bot as write layer, build-time index as read layer. Community contribute via PR or personal CRUD, no auth service, no database.

---

## Knowledge

Reference files Claude reads to apply proven patterns.

| Topic | File | Description |
|---|---|---|
| GROQ | [groq/streaming-integration.md](knowledge/groq/streaming-integration.md) | SSE streaming with GROQ API, env setup, response parsing |
| Claude Plugins | [claude-plugins/marketplace-management.md](knowledge/claude-plugins/marketplace-management.md) | Plugin structure, marketplace setup, adding new phucbm plugins |
| Dexie | [dexie/patterns.md](knowledge/dexie/patterns.md) | IndexedDB via Dexie.js - schema, querying, useLiveQuery, migrations, SSR constraints |
| counterapi | [counterapi/usage.md](knowledge/counterapi/usage.md) | Simple hit counters via counterapi.dev v2 - lightweight alternative to GA4/PostHog/Umami |
| Vercel AI Gateway | [vercel/ai-gateway.md](knowledge/vercel/ai-gateway.md) | Multi-provider AI via `@ai-sdk/gateway`, reasoning middleware, test mock pattern |
| RAG Pipeline | [rag/pipeline.md](knowledge/rag/pipeline.md) | chunk→embed→upsert→query pattern, prompt injection, switchable embeddings, auto-ingest |
| Pinecone | [pinecone/setup.md](knowledge/pinecone/setup.md) | Vector DB setup, batch upsert, semantic query, metadata filter with semantic fallback |
| WP Blocks Dev | [wp-blocks-dev/overview.md](knowledge/wp-blocks-dev/overview.md) | Pointer to phucbm/wp-blocks-dev plugin - init, create-block, audit skills |
| GitHub Actions publish-npm | [github-actions/publish-npm.md](knowledge/github-actions/publish-npm.md) | Composite action to auto-publish npm on release - token or OIDC, workflow templates, gotchas |
| Cloudflare Pages | [cloudflare/nextjs-migration.md](knowledge/cloudflare/nextjs-migration.md) | Migrate Next.js from Vercel to Cloudflare - adapter comparison, worker size limits, pitfalls |
| Discord | [discord/web-patterns.md](knowledge/discord/web-patterns.md) | Forum channel as DB (bookmarks), webhook as form inbox — two zero-infra patterns |
| GitHub as DB | [github/github-as-db.md](knowledge/github/github-as-db.md) | Repo as zero-infra data store — GitHub App CRUD, build-time index (rate limit fix), PR contribute flow |

---

## Claude Plugins

All plugins available from the `phucbm` marketplace:

| Plugin | Repo | Install | Description |
|---|---|---|---|
| `claudify` | [phucbm/claudify](https://github.com/phucbm/claudify) | `/plugin install claudify@phucbm` | Bootstrap `.claude/` structure for any existing repo |
| `skills` | [phucbm/skills](https://github.com/phucbm/skills) | `/plugin install skills@phucbm` | Personal knowledge base (this repo) |
| `registry-system` | [phucbm/registry-system](https://github.com/phucbm/registry-system) | `/plugin install registry-system@phucbm` | Manage shadcn-compatible component registry - create, validate, and push components |
| `wp-blocks-dev` | [phucbm/wp-blocks-dev](https://github.com/phucbm/wp-blocks-dev) | `/plugin install wp-blocks-dev@phucbm` | Scaffold, audit and manage custom ACF Gutenberg blocks with Tailwind CSS |

---

## Reference
- [mattpocock/skills](https://github.com/mattpocock/skills)