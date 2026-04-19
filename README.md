# skills

Personal knowledge base for Claude Code — patterns and integrations observed across projects.

## Install

Add the phucbm marketplace (once, ever):
```shell
/plugin marketplace add phucbm/skills
```

Install all phucbm plugins:
```shell
/plugin install claudify@phucbm
/plugin install skills@phucbm
```

Update all phucbm plugins:
```shell
/plugin marketplace update phucbm
```

## Plugins

All plugins available from the `phucbm` marketplace:

| Plugin | Repo | Description |
|---|---|---|
| `claudify` | [phucbm/claudify](https://github.com/phucbm/claudify) | Bootstrap `.claude/` structure for any existing repo |
| `skills` | [phucbm/skills](https://github.com/phucbm/skills) | Personal knowledge base (this repo) |

## Knowledge

| Topic | File | Description |
|---|---|---|
| GROQ | [groq/streaming-integration.md](knowledge/groq/streaming-integration.md) | SSE streaming with GROQ API, env setup, response parsing |
| Claude Plugins | [claude-plugins/marketplace-management.md](knowledge/claude-plugins/marketplace-management.md) | Plugin structure, marketplace setup, adding new phucbm plugins |
| Dexie | [dexie/patterns.md](knowledge/dexie/patterns.md) | IndexedDB via Dexie.js — schema, querying, useLiveQuery, migrations, SSR constraints |
| counterapi | [counterapi/usage.md](knowledge/counterapi/usage.md) | Simple hit counters via counterapi.dev v2 — lightweight alternative to GA4/PostHog/Umami |

## Managing this repo

| Skill | Description |
|---|---|
| [add-skill](skills/add-skill/SKILL.md) | Summarize knowledge from current project and push to this repo |
| [update-skill](skills/update-skill/SKILL.md) | Diff and update an existing knowledge entry |
