---
name: update-skill
description: Update an existing skill or knowledge entry in phucbm/skills. Use when the user says "update my X skill", "update X knowledge", or "add this change to my X skill/knowledge".
allowed-tools: Bash Read Write Edit
---

## Structure

### Skills — nested under a bucket
- `skills/<bucket>/<topic>/SKILL.md` — thin wrapper. Update only if trigger wording, description, or knowledge pointers change.
- Buckets: `ai/`, `engineering/`, `productivity/` — do not move a skill between buckets without updating README.md.

### Knowledge — namespaced, shareable
- `knowledge/<category>/<slug>.md` — the actual content. This is usually what gets updated.
- A knowledge file may be referenced by multiple skills — check before editing. If shared, note which other skills will be affected.

## Steps

0. **Read the prompt** — if arguments were passed with the slash command (e.g. `/update-skill add the new retry logic to my groq skill`), treat them as the user's description of what to update and proceed to step 1. If no arguments were given, ask: "Which skill or knowledge do you want to update, and what should change?" and wait for the answer before continuing.

1. **Pull latest**:
   ```shell
   gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
   ```

2. **Surface related files** — scan `skills/` and `knowledge/` for anything related to the topic. List all candidates and flag shared knowledge files:
   > "Files that may need updating:
   > - `skills/ai/groq/SKILL.md` (trigger description)
   > - `knowledge/groq/streaming-integration.md` (actual content — also referenced by skills/X)
   > Should I update both, or just the knowledge file?"

3. **Show a diff for each file that will change**:
   ```
   FILE:     knowledge/groq/streaming-integration.md
   CURRENT:  <existing section>
   PROPOSED: <updated section>
   REASON:   <why>
   ```

4. **Wait for user confirmation** before applying anything.

5. **Apply edits**, bump patch version in `.claude-plugin/plugin.json`, commit and push:
   ```shell
   git -C /tmp/phucbm-skills add .
   git -C /tmp/phucbm-skills commit -m "knowledge: update <topic>"
   git -C /tmp/phucbm-skills push
   ```

6. Confirm the push URL to the user.

## Rules
- Follow Anthropic's official skill writing best practices:
  https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md
  Key points: `description` is the primary trigger — keep it specific and slightly pushy; prefer surgical edits to stay under 500 lines.
- Never silently overwrite — always show the diff first
- If README.md description for this topic changed, update that row too
- Prefer surgical edits over full rewrites
- `SKILL.md` rarely needs updating — only if frontmatter `description`/`when_to_use` or knowledge pointers change
- Knowledge file refs must use clickable markdown links:
  - Single: `Read [\`@/knowledge/<category>/<slug>.md\`](/knowledge/<category>/<slug>.md) and apply...`
  - Multiple: `Read and apply:` followed by a bullet list of `[@/knowledge/...](...)` links
- Knowledge files are generic — examples referencing specific projects are fine, but never add project-specific data as facts
