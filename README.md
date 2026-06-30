# phucbm/skills

<img width="947" height="581" alt="Screenshot 2026-04-29 at 10 14 41 (1)" src="https://github.com/user-attachments/assets/856cf0b9-deea-426c-8d09-97f58d6758b0" />

My personal knowledge base, reusable skills and reference knowledge observed across real projects.

**Skills** are slash commands that instruct Claude to perform a specific task (e.g. `/add-skill`, `/rag`).

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

### meta

- **[add-skill](skills/meta/add-skill/SKILL.md)** - Summarize knowledge from the current project and push it to this repo.
- **[update-skill](skills/meta/update-skill/SKILL.md)** - Diff and update an existing knowledge entry.
- **[learn](skills/meta/learn/SKILL.md)** - Scan any repo, diff against existing skills, and suggest what to save or update.
- **[claskit](skills/meta/claskit/SKILL.md)** - Autonomous Claude Code task runner - write task specs as Markdown, run claskit, watch Claude implement them.

### ai

- **[vercel-ai-gateway](skills/ai/vercel-ai-gateway/SKILL.md)** - Set up Vercel AI Gateway for multi-provider AI access.
- **[rag](skills/ai/rag/SKILL.md)** - Build a RAG pipeline - chunk, embed, store, query, inject into prompt.
- **[pinecone](skills/ai/pinecone/SKILL.md)** - Set up Pinecone as the vector DB in a RAG pipeline.
- **[groq](skills/ai/groq/SKILL.md)** - Integrate GROQ LLM streaming into a project.

### backend

- **[dexie](skills/backend/dexie/SKILL.md)** - Set up Dexie.js (IndexedDB) in a local-first Next.js + React + TypeScript app.
- **[counterapi](skills/backend/counterapi/SKILL.md)** - Add lightweight hit counters via counterapi.dev v2.
- **[discord-as-backend](skills/backend/discord-as-backend/SKILL.md)** - Use a Discord Forum channel as a database or a Discord webhook as a form submission inbox.
- **[github-as-db](skills/backend/github-as-db/SKILL.md)** - Use a GitHub repo as a zero-infra data store.

### deploy

- **[publish-npm](skills/deploy/publish-npm/SKILL.md)** - Auto-publish npm package on GitHub release via token or OIDC.
- **[cloudflare-pages](skills/deploy/cloudflare-pages/SKILL.md)** - Migrate a Next.js app to Cloudflare Pages, pick the right adapter, and diagnose worker size issues.

### wordpress

- **[wp-acf-blocks](skills/wordpress/wp-acf-blocks/SKILL.md)** - Scaffold, audit and manage ACF Gutenberg blocks with Tailwind CSS.

---

## Claude Plugins

All plugins available from the `phucbm` marketplace:

| Plugin | Repo | Install | Description |
|---|---|---|---|
| `claudify` | [phucbm/claudify](https://github.com/phucbm/claudify) | `/plugin install claudify@phucbm` | Bootstrap `.claude/` structure for any existing repo |
| `skills` | [phucbm/skills](https://github.com/phucbm/skills) | `/plugin install skills@phucbm` | Personal knowledge base (this repo) |
| `registry-system` | [phucbm/registry-system](https://github.com/phucbm/registry-system) | `/plugin install registry-system@phucbm` | Manage shadcn-compatible component registry - create, validate, and push components |
| `wp-acf-blocks` | [phucbm/wp-acf-blocks](https://github.com/phucbm/wp-acf-blocks) | `/plugin install wp-acf-blocks@phucbm` | Scaffold, audit and manage custom ACF Gutenberg blocks with Tailwind CSS |

---

## Reference
- [mattpocock/skills](https://github.com/mattpocock/skills)
