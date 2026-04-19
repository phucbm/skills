# Update Knowledge in phucbm/skills

When the user says "update my X skill", "update groq knowledge", or "add this to my X skill/knowledge":

## Structure reminder

Each topic has TWO files — always consider both when updating:
- `skills/<topic>/SKILL.md` — thin wrapper: trigger description + pointer to knowledge file. Update only if the trigger wording or steps change.
- `knowledge/<topic>/<slug>.md` — the actual content: env setup, code patterns, gotchas. This is usually what gets updated.

## Steps

1. **Pull latest**:
   ```shell
   gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
   ```

2. **Surface related files** — scan `skills/` and `knowledge/` for anything related to the topic. List all candidates:
   > "Files that may need updating:
   > - `skills/groq/SKILL.md` (trigger description)
   > - `knowledge/groq/streaming-integration.md` (actual content)
   > Should I update both, or just the knowledge file?"

3. **Show a diff for each file that will change**:
   ```
   FILE:     knowledge/groq/streaming-integration.md
   CURRENT:  <existing section>
   PROPOSED: <updated section>
   REASON:   <why>
   ```

4. **Wait for user confirmation** before applying anything.

5. **Apply edits**, bump the patch version in `.claude-plugin/plugin.json` (e.g. `1.0.1` → `1.0.2`), commit and push:
   ```shell
   git -C /tmp/phucbm-skills add .
   git -C /tmp/phucbm-skills commit -m "knowledge: update <topic>"
   git -C /tmp/phucbm-skills push
   ```

6. Confirm the push URL to the user.

## Rules
- Never silently overwrite — always show the diff first
- If README.md description for this topic changed, update that row too
- Prefer surgical edits over full rewrites
- `SKILL.md` rarely needs updating — only if the skill trigger or workflow changes
