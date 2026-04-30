---
name: learn
description: Scan the current codebase, compare against existing phucbm/skills knowledge, and suggest new skills to save or existing skills to update. Use when the user says "learn from this repo", "what can I save from here", or "run learn".
when_to_use: When visiting any repo and wanting to extract reusable knowledge from it.
allowed-tools: Bash Read Write Edit
---

## What this skill does

Reads your existing skills from `phucbm/skills` README, scans the current codebase, diffs the two, and presents a ranked list of save/update candidates with recommended file paths. You pick which ones to act on.

## Steps

### Phase 1 — Pull existing skills index (read README only)

```shell
gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
```

Read `/tmp/phucbm-skills/README.md` only. Extract:
- **Knowledge table**: topic names and descriptions (what's already saved)
- **Skills table**: skill names (operational skills already known)

### Phase 2 — Scan current codebase (run in parallel)

Read these in parallel:
- `package.json` / `composer.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` — deps and scripts
- Config files at root: `next.config.*`, `vite.config.*`, `drizzle.config.*`, `biome.jsonc`, `playwright.config.*`, `tailwind.config.*`
- `.github/workflows/*.yml` — CI/CD patterns
- `scripts/` directory — custom tooling
- Key source entry files: `lib/`, `src/`, `app/` top-level only (don't recurse deep — read index/entry files)
- `.claude/CLAUDE.md` and `.claude/docs/` if present — already-documented patterns

Extract topics: libraries used, non-obvious configurations, custom patterns, architectural decisions, CI/CD tricks.

### Phase 3 — Diff and rank

Cross-reference found topics against existing README knowledge and skills tables.

Produce two lists with **recommended file paths for every item**:

**NEW** — topics found in codebase with no match in existing knowledge/skills:
```
[N] Topic name — one-line reason it's worth saving
    skill:     skills/<bucket>/<topic>/SKILL.md
    knowledge: knowledge/<category>/<slug>.md
```
Buckets: `ai/` (LLM/vector/RAG), `engineering/` (libraries, tooling, deployment), `productivity/` (skills-repo management).
If multiple new topics share knowledge (e.g. rag + pinecone), show the relationship:
```
[N] RAG pipeline — generic chunk→embed→query pattern, reusable with any vector DB
    skill:     skills/ai/rag/SKILL.md
    knowledge: knowledge/rag/concepts.md

[N+1] Pinecone — vector DB setup, upsert, query, metadata filters
    skill:     skills/ai/pinecone/SKILL.md
    knowledge: knowledge/pinecone/setup.md
    note:      skills/ai/rag will also reference knowledge/pinecone/setup.md
```

**UPDATE** — topics that overlap an existing entry but the codebase shows something new:
```
[N] update: <existing-topic> — what's new or different
    file: knowledge/<category>/<slug>.md
```

Rank by: reusability across projects × non-obviousness (things you'd have to figure out again from scratch).

Skip topics that are: trivial to look up, fully covered already, or project-specific with no transfer value.

### Phase 4 — User picks, then act

Present the full list and ask: "Which ones to save? (e.g. 1, 3, update 4 — or 'all')"

Wait for response. Then for each selected item:
- **NEW picks** → invoke `add-skill` flow: draft `skills/<bucket>/<topic>/SKILL.md` + `knowledge/<category>/<slug>.md`, show both, confirm, push
- **UPDATE picks** → invoke `update-skill` flow: show diff of proposed changes to existing knowledge file, confirm, push

Each item is confirmed individually. Never batch-push without showing what will change.

After all pushes: confirm final state and remind user to run `/plugin marketplace update phucbm` in other projects to get the new skills.

## Rules
- Phase 1 reads README.md only — no file tree scanning of the skills repo (saves tokens)
- Phase 2 reads breadth-first — top-level files only, don't recurse into deep source dirs
- Always output recommended file paths in Phase 3 — user must confirm names before any files are written
- Skills are nested: `skills/<bucket>/<topic>/SKILL.md` — always include the bucket in suggested paths
- Knowledge can be namespaced: `knowledge/<category>/<slug>.md` — flag when shared across skills
- Never suggest saving secrets, API keys, or project-specific data (user IDs, URLs, credentials)
- Knowledge files are generic — cite specific projects as examples only, never as facts
- Always confirm per-item before pushing
- If nothing new is found, say so clearly rather than inventing suggestions
