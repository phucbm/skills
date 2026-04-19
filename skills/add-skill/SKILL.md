# Add Knowledge to phucbm/skills

Summarize the current knowledge/pattern and push it as a new entry to the `phucbm/skills` repo.

## Steps

1. **Summarize** the knowledge from the current conversation or codebase context. Focus on: what it is, env setup, code patterns, gotchas, source reference.

2. **Check existing knowledge** — pull latest and scan all files in `knowledge/`:
   ```shell
   gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
   find /tmp/phucbm-skills/knowledge -name "*.md" | sort
   ```
   Read any that seem related. If overlap or related entries exist, **tell the user** before proceeding:
   > "I found a related entry: `knowledge/groq/streaming-integration.md` — do you want to update that instead, or add a new file?"

3. **Determine path**: `knowledge/<topic>/<slug>.md` — use lowercase kebab-case. Ask the user if unclear.

4. **Show the file content to the user and wait for confirmation** before making any changes.

5. **Write** the new knowledge file.

6. **Update `README.md`** — append a new row to the knowledge table.

7. **Commit and push**:
   ```shell
   git -C /tmp/phucbm-skills add .
   git -C /tmp/phucbm-skills commit -m "knowledge: add <slug>"
   git -C /tmp/phucbm-skills push
   ```

8. Confirm the push URL to the user.

## Rules
- Never include real API keys or secrets
- Keep env blocks with empty values (e.g. `GROQ_API_KEY=`) as templates
- Always show content and wait for confirmation before pushing
