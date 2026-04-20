# Claude Code Plugin & Marketplace Management

## How it works

Claude Code plugins are discovered via **marketplaces** — a marketplace is a GitHub repo
with a `.claude-plugin/marketplace.json` that lists plugins. You cannot install a plugin
without it being listed in a marketplace.

Two-step flow (marketplace is added only once):
```shell
/plugin marketplace add phucbm/skills    # register catalog once
/plugin install claudify@phucbm          # install individual plugins
/plugin install skills@phucbm
```

To see newly added plugins after the marketplace is updated:
```shell
/plugin marketplace update phucbm
```

Or enable auto-update in the `/plugin` UI → select marketplace → toggle auto-update.

## phucbm marketplace

`phucbm/skills` is the canonical marketplace for all phucbm plugins.

**Why not a separate `phucbm/claude` registry repo?**
Docs support a hybrid model: one repo can act as both a marketplace AND host a plugin.
`skills` is local (`"source": "./"`) while other plugins like `claudify` are listed as
external sources. This is the same pattern Anthropic uses in `anthropics/claude-code`.

Current plugins in `phucbm/skills/.claude-plugin/marketplace.json`:
| Plugin | Source | Description |
|---|---|---|
| `claudify` | `https://github.com/phucbm/claudify` | Bootstrap `.claude/` for any repo |
| `skills` | `./` | Personal knowledge base |
| `registry-system` | `https://github.com/phucbm/registry-system` | Manage shadcn-compatible component registry |

## Adding a new phucbm plugin

Two options:

### Option A — Plugin lives in its own repo (external source)
1. Create the plugin repo with the correct structure (see below)
2. Add an entry to `phucbm/skills/.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "my-plugin",
     "source": "https://github.com/phucbm/my-plugin",
     "description": "..."
   }
   ```
3. Do NOT add a `marketplace.json` to the plugin repo — only `plugin.json`
4. Commit and push `phucbm/skills`

### Option B — Plugin lives inside phucbm/skills (monorepo)
1. Create `plugins/my-plugin/` with correct structure
2. Add entry to marketplace.json with `"source": "./plugins/my-plugin"`

## Required plugin structure

Minimum for any plugin repo:
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # required
└── skills/
    └── my-skill/
        └── SKILL.md        # one folder per skill
```

`plugin.json`:
```json
{
  "name": "my-plugin",
  "displayName": "My Plugin",
  "version": "1.0.0",
  "description": "...",
  "author": { "name": "phucbm", "url": "https://github.com/phucbm" },
  "repository": "https://github.com/phucbm/my-plugin",
  "license": "MIT"
}
```

**Do NOT add `marketplace.json` to individual plugin repos** — only the canonical
marketplace repo (`phucbm/skills`) should have one. Multiple repos with the same
`"name"` in their `marketplace.json` will conflict and overwrite each other.

## SKILL.md structure

Skills live at `skills/<name>/SKILL.md`. The file contains instructions for Claude
to follow when the skill is invoked. No frontmatter required but supported:

```markdown
---
description: What this skill does
---

Instructions for Claude...
```

## Patterns from the docs

| Pattern | When to use |
|---|---|
| Monorepo (`./plugins/` relative paths) | Multiple plugins, same repo, version-locked together |
| Registry-only (external URLs) | Aggregating plugins from independent repos |
| Hybrid (mix of both) | **phucbm's approach** — own plugins local, others external |

Reference: `anthropics/claude-plugins-official` (pure registry) and `anthropics/claude-code`
(monorepo with 13 bundled plugins) are the two official reference implementations.

## Source
Learned while setting up `phucbm/skills` as the canonical phucbm marketplace.
Docs: https://code.claude.com/docs/en/plugin-marketplaces.md
