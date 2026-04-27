---
name: add-skill
description: Add a new skill or knowledge entry to phucbm/skills repo. Use when the user says "add this to my skills", "save this as a skill", "push this knowledge to phucbm/skills", or wants to preserve a pattern from the current project.
allowed-tools: Bash Read Write Edit
---

## Structure

### Skills — always flat, one level deep
- `skills/<topic>/SKILL.md` — thin wrapper: frontmatter + pointer(s) to knowledge file(s)
- NEVER nest: `skills/vercel/ai-gateway/SKILL.md` breaks plugin discovery — use `skills/vercel-ai-gateway/SKILL.md`
- One skill per topic, kebab-case: `skills/vercel-ai-gateway/`, `skills/pinecone/`, `skills/rag/`

### Knowledge — namespaced, shareable
- `knowledge/<category>/<slug>.md` — the actual content
- A knowledge file can be referenced by multiple skills
  e.g. `knowledge/rag/concepts.md` read by both `skills/rag/SKILL.md` and `skills/pinecone/SKILL.md`
- A single session can produce multiple skills that share knowledge files — plan all files together before drafting

## Steps

1. **Check existing knowledge** — pull latest and scan all files in `skills/` and `knowledge/`:
   ```shell
   gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
   find /tmp/phucbm-skills/skills /tmp/phucbm-skills/knowledge -name "*.md" | sort
   ```
   If a related entry exists, tell the user before proceeding:
   > "I found a related entry: `knowledge/groq/streaming-integration.md` — update that instead, or add a new file?"

2. **Determine paths**:
   - Skill: `skills/<topic>/SKILL.md` — flat, one level only
   - Knowledge: `knowledge/<category>/<slug>.md` — can be nested, shareable
   - If adding related skills (e.g. rag + pinecone), plan all files together and note cross-references before drafting
   - Use lowercase kebab-case. Ask if unclear.

3. **Draft all files** and show them to the user:
   - `SKILL.md`: correct frontmatter (`name`, `description`, `when_to_use`, `allowed-tools`) + instructions to read knowledge file(s) via `${CLAUDE_SKILL_DIR}/../../knowledge/<category>/<slug>.md`
   - `knowledge/<category>/<slug>.md`: full content — env vars, code patterns, gotchas, source reference. Generic patterns only; cite specific projects as examples, never hardcode project-specific data.

4. **Wait for confirmation** before writing anything.

5. **Write all files**, update `README.md` (add row to knowledge table for each new knowledge file, add row to skills table for each new skill), bump patch version in `.claude-plugin/plugin.json`, commit and push:
   ```shell
   git -C /tmp/phucbm-skills add .
   git -C /tmp/phucbm-skills commit -m "skill: add <topic>"
   git -C /tmp/phucbm-skills push
   ```

6. Confirm the push URL to the user.

## Rules
- Follow Anthropic's official skill writing best practices:
  https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md
  Key points: `description` is the primary trigger mechanism — be specific and slightly pushy to avoid undertriggering; keep SKILL.md under 500 lines; use bundled resources for large content.
- Never include real API keys or secrets — keep env blocks with empty values as templates
- Always show all files and wait for confirmation before pushing
- `SKILL.md` stays thin — frontmatter + a few lines, content belongs in `knowledge/`
- Always use `${CLAUDE_SKILL_DIR}/../../knowledge/...` to reference knowledge files
- When a skill references shared knowledge, note it explicitly in the SKILL.md
- Knowledge files are generic — mention specific projects only as examples, never hardcode project-specific data
