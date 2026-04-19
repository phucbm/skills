# Add Knowledge to phucbm/skills

When the user says "add this to my skills", "save this as a skill", or "push this knowledge to phucbm/skills":

## Structure reminder

Each topic gets TWO files:
- `skills/<topic>/SKILL.md` — thin wrapper: 3-5 lines describing when to trigger + pointer to the knowledge file. NOT where the content lives.
- `knowledge/<topic>/<slug>.md` — the actual content: env setup, code patterns, gotchas, source reference.

## Steps

1. **Check existing knowledge** — pull latest and scan all files in `skills/` and `knowledge/`:
   ```shell
   gh repo clone phucbm/skills /tmp/phucbm-skills 2>/dev/null || git -C /tmp/phucbm-skills pull
   find /tmp/phucbm-skills/skills /tmp/phucbm-skills/knowledge -name "*.md" | sort
   ```
   If a related entry exists, tell the user before proceeding:
   > "I found a related entry: `knowledge/groq/streaming-integration.md` — update that instead, or add a new file?"

2. **Determine paths**:
   - Knowledge: `knowledge/<topic>/<slug>.md`
   - Skill: `skills/<topic>/SKILL.md`
   - Use lowercase kebab-case. Ask if unclear.

3. **Draft both files** and show them to the user:
   - `SKILL.md`: trigger description (when does this activate?) + one step: "read `knowledge/<topic>/<slug>.md` and apply it"
   - `knowledge/<slug>.md`: full content — env vars, code patterns, env template with empty values, source reference

4. **Wait for confirmation** before writing anything.

5. **Write both files**, update `README.md` knowledge table, bump the patch version in `.claude-plugin/plugin.json` (e.g. `1.0.0` → `1.0.1`), commit and push:
   ```shell
   git -C /tmp/phucbm-skills add .
   git -C /tmp/phucbm-skills commit -m "skill: add <topic>"
   git -C /tmp/phucbm-skills push
   ```

6. Confirm the push URL to the user.

## Rules
- Never include real API keys or secrets — keep env blocks with empty values as templates
- Always show both files and wait for confirmation before pushing
- `SKILL.md` stays thin — 3-5 lines max, content belongs in `knowledge/`
