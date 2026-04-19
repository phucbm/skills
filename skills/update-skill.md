# Update Knowledge in phucbm/skills

Compare current knowledge against an existing skill file and apply updates.

## Steps

1. **Pull latest**:
   ```shell
   gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
   ```

2. **Surface related knowledge** — scan all files in `knowledge/` and list ones related to the current topic, even if not the target file. Tell the user:
   > "Related entries I found: `knowledge/groq/streaming-integration.md` — should any of these be updated too?"

3. **Identify the target file** — ask the user which to update, or infer from context.

4. **Show a diff** of current vs proposed:
   ```
   CURRENT:  <existing section>
   PROPOSED: <updated section>
   REASON:   <why>
   ```

5. **Wait for user confirmation** before applying.

6. **Apply edits**, commit and push:
   ```shell
   git -C /tmp/phucbm-skills add .
   git -C /tmp/phucbm-skills commit -m "knowledge: update <slug>"
   git -C /tmp/phucbm-skills push
   ```

7. Confirm the push URL to the user.

## Rules
- Never silently overwrite — always show the diff first
- If the update also changes the README description, update that row too
- Prefer surgical edits over full rewrites
