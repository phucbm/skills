---
name: add-skill
description: Add a new skill or knowledge entry to phucbm/skills repo. Use when the user says "add this to my skills", "save this as a skill", "push this knowledge to phucbm/skills", or wants to preserve a pattern from the current project.
allowed-tools: Bash Read Write Edit
---

## Structure

Each skill is a folder with a single `SKILL.md` — all content inlined directly, no separate knowledge files.

- `skills/<topic>/SKILL.md` — frontmatter + full content
- One skill per topic, kebab-case: `skills/vercel-ai-gateway/`, `skills/dexie/`, `skills/learn/`
- Complex skills (like `wp-blocks-dev`) may have sub-skills and additional files co-located inside the skill folder

## Steps

0. **Read the prompt** — if arguments were passed with the slash command (e.g. `/add-skill I want to save the Stripe webhook pattern from this project`), treat them as the user's description of what to add and proceed to step 1. If no arguments were given, ask: "What skill or knowledge do you want to add?" and wait for the answer before continuing.

1. **Check existing skills** — pull latest and scan all files in `skills/`:
   ```shell
   gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
   find /tmp/phucbm-skills/skills -name "SKILL.md" | sort
   ```
   If a related skill exists, tell the user before proceeding:
   > "I found a related skill: `skills/groq/SKILL.md` — update that instead, or add a new skill?"

2. **Determine path**:
   - Skill: `skills/<topic>/SKILL.md` — flat, one level only
   - Use lowercase kebab-case. Ask if unclear.

3. **Draft the SKILL.md** and show it to the user:
   - Correct frontmatter (`name`, `description`, `when_to_use`, `allowed-tools`)
   - Full content inlined — env vars, code patterns, gotchas, source references
   - Generic patterns only; cite specific projects as examples, never hardcode project-specific data

4. **Wait for confirmation** before writing anything.

5. **Write the file**, update `README.md` (add row to skills table), bump patch version in `.claude-plugin/plugin.json`, commit and push:
   ```shell
   git -C /tmp/phucbm-skills add .
   git -C /tmp/phucbm-skills commit -m "skill: add <topic>"
   git -C /tmp/phucbm-skills push
   ```

6. Confirm the push URL to the user.

## Rules
- Follow Anthropic's official skill writing best practices:
  https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md
  Key points: `description` is the primary trigger mechanism — be specific and slightly pushy to avoid undertriggering; keep SKILL.md under 500 lines
- Never include real API keys or secrets — keep env blocks with empty values as templates
- Always show the file and wait for confirmation before pushing
- All content goes directly in `SKILL.md` — no separate knowledge files
- Knowledge files are generic — mention specific projects only as examples, never hardcode project-specific data

---

## Plugin Marketplace Management

Claude Code plugins discovered via **marketplaces** — GitHub repo with `.claude-plugin/marketplace.json` listing plugins. Can't install plugin without marketplace listing.

Two-step flow (marketplace added once):
```shell
/plugin marketplace add phucbm/skills    # register catalog once
/plugin install claudify@phucbm          # install individual plugins
/plugin install skills@phucbm
```

See newly added plugins after marketplace update:
```shell
/plugin marketplace update phucbm
```

Or enable auto-update: `/plugin` UI → select marketplace → toggle auto-update.

### phucbm marketplace

`phucbm/skills` is canonical marketplace for all phucbm plugins.

One repo acts as both marketplace AND plugin host — `skills` is local (`"source": "./"`) while other plugins (`claudify`, etc.) are external sources.

Current plugins in `.claude-plugin/marketplace.json`:
| Plugin | Source | Description |
|---|---|---|
| `claudify` | `https://github.com/phucbm/claudify` | Bootstrap `.claude/` for any repo |
| `skills` | `./` | Personal knowledge base |
| `registry-system` | `https://github.com/phucbm/registry-system` | Manage shadcn-compatible component registry |

### Adding a new phucbm plugin

**Option A — Plugin in own repo:**
1. Create plugin repo with correct structure
2. Add entry to `phucbm/skills/.claude-plugin/marketplace.json`:
   ```json
   { "name": "my-plugin", "source": "https://github.com/phucbm/my-plugin", "description": "..." }
   ```
3. Do NOT add `marketplace.json` to plugin repo — only `plugin.json`
4. Commit and push `phucbm/skills`

**Option B — Plugin inside phucbm/skills:**
1. Create `plugins/my-plugin/` with correct structure
2. Add entry with `"source": "./plugins/my-plugin"`

### Required plugin structure
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── my-skill/
        └── SKILL.md
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

**Do NOT add `marketplace.json` to individual plugin repos** — only canonical marketplace repo should have one. Multiple repos with same `"name"` conflict and overwrite each other.

Docs: https://code.claude.com/docs/en/plugin-marketplaces.md
