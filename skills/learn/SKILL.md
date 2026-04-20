---
name: learn
description: Scan the current codebase, compare against existing phucbm/skills knowledge, and suggest new skills to save or existing skills to update. Use when the user says "learn from this repo", "what can I save from here", or "run learn".
when_to_use: When visiting any repo and wanting to extract reusable knowledge from it.
allowed-tools: Bash Read Write Edit
---

## What this skill does

Reads your existing skills from `phucbm/skills` README, scans the current codebase, diffs the two, and presents a ranked list of save/update candidates. You pick which ones to act on.

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

Produce two lists:

**NEW** — topics found in codebase with no match in existing knowledge/skills:
```
[N] Topic name — one-line reason it's worth saving (reusable + non-obvious)
```

**UPDATE** — topics that overlap an existing entry but the codebase shows something new (newer API, additional gotcha, different pattern):
```
[N] update: <existing-topic> — what's new or different
```

Rank by: reusability across projects × non-obviousness (things you'd have to figure out again from scratch).

Skip topics that are: trivial to look up, fully covered already, or project-specific with no transfer value.

### Phase 4 — User picks, then act

Present the full list and ask: "Which ones to save? (e.g. 1, 3, update 4 — or 'all')"

Wait for response. Then for each selected item:
- **NEW picks** → invoke `add-skill` flow: draft `skills/<topic>/SKILL.md` + `knowledge/<topic>/<slug>.md`, show both, confirm, push
- **UPDATE picks** → invoke `update-skill` flow: show diff of proposed changes to existing knowledge file, confirm, push

Each item is confirmed individually. Never batch-push without showing what will change.

After all pushes: confirm final state and remind user to run `/plugin marketplace update phucbm` in other projects to get the new skills.

## Rules
- Phase 1 reads README.md only — no file tree scanning of the skills repo (saves tokens)
- Phase 2 reads breadth-first — top-level files only, don't recurse into deep source dirs
- Never suggest saving secrets, API keys, or project-specific data (user IDs, URLs, credentials)
- Always confirm per-item before pushing
- If nothing new is found, say so clearly rather than inventing suggestions
