# skills

Personal knowledge base for Claude Code — patterns and integrations observed across projects.

## Install

Add the phucbm marketplace (once, ever):
```shell
/plugin marketplace add phucbm/skills
```

Update all phucbm plugins:
```shell
/plugin marketplace update phucbm
```

## Plugins

All plugins available from the `phucbm` marketplace:

| Plugin | Repo | Install | Description |
|---|---|---|---|
| `claudify` | [phucbm/claudify](https://github.com/phucbm/claudify) | `/plugin install claudify@phucbm` | Bootstrap `.claude/` structure for any existing repo |
| `skills` | [phucbm/skills](https://github.com/phucbm/skills) | `/plugin install skills@phucbm` | Personal knowledge base (this repo) |
| `registry-system` | [phucbm/registry-system](https://github.com/phucbm/registry-system) | `/plugin install registry-system@phucbm` | Manage shadcn-compatible component registry — create, validate, and push components |
| `wp-blocks-dev` | [phucbm/wp-blocks-dev](https://github.com/phucbm/wp-blocks-dev) | `/plugin install wp-blocks-dev@phucbm` | Scaffold, audit and manage custom ACF Gutenberg blocks with Tailwind CSS |

## Knowledge

| Topic | File | Description |
|---|---|---|
| GROQ | [groq/streaming-integration.md](knowledge/groq/streaming-integration.md) | SSE streaming with GROQ API, env setup, response parsing |
| Claude Plugins | [claude-plugins/marketplace-management.md](knowledge/claude-plugins/marketplace-management.md) | Plugin structure, marketplace setup, adding new phucbm plugins |
| Dexie | [dexie/patterns.md](knowledge/dexie/patterns.md) | IndexedDB via Dexie.js — schema, querying, useLiveQuery, migrations, SSR constraints |
| counterapi | [counterapi/usage.md](knowledge/counterapi/usage.md) | Simple hit counters via counterapi.dev v2 — lightweight alternative to GA4/PostHog/Umami |
| Vercel AI Gateway | [vercel/ai-gateway.md](knowledge/vercel/ai-gateway.md) | Multi-provider AI via `@ai-sdk/gateway`, reasoning middleware, test mock pattern |
| RAG Pipeline | [rag/pipeline.md](knowledge/rag/pipeline.md) | chunk→embed→upsert→query pattern, prompt injection, switchable embeddings, auto-ingest |
| Pinecone | [pinecone/setup.md](knowledge/pinecone/setup.md) | Vector DB setup, batch upsert, semantic query, metadata filter with semantic fallback |
| WP Blocks Dev | [wp-blocks-dev/overview.md](knowledge/wp-blocks-dev/overview.md) | Pointer to phucbm/wp-blocks-dev plugin — init, create-block, audit skills |

## Managing this repo

| Skill | Description |
|---|---|
| [add-skill](skills/add-skill/SKILL.md) | Summarize knowledge from current project and push to this repo |
| [update-skill](skills/update-skill/SKILL.md) | Diff and update an existing knowledge entry |
| [learn](skills/learn/SKILL.md) | Scan any repo, diff against existing skills, suggest what to save or update |
| [vercel-ai-gateway](skills/vercel-ai-gateway/SKILL.md) | Set up Vercel AI Gateway for multi-provider AI access |
| [rag](skills/rag/SKILL.md) | Build a RAG pipeline — chunk, embed, store, query, inject into prompt |
| [pinecone](skills/pinecone/SKILL.md) | Set up Pinecone as the vector DB in a RAG pipeline |
| [wp-blocks-dev](skills/wp-blocks-dev/SKILL.md) | Scaffold, audit and manage ACF Gutenberg blocks with Tailwind CSS |
