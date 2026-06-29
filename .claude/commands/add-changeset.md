---
description: Create a changeset file for the current branch's diff. Infers bump type, writes .changeset/<slug>.md, and stages it.
---

A **changeset** is an intent signal — a file that records what changed and how to bump the version. CI consumes it on merge to write `CHANGELOG.md` automatically. This command produces one from the current diff.

## Steps

1. Run `git diff origin/main...HEAD --name-only`. List every changed path under `skills/`. Done when every path is categorized as: new skill folder, modified skill content, or removed/renamed skill folder.

2. Infer bump type from the categorized paths:
   - `major` — skill folder deleted or renamed (consumers lose a slash command)
   - `minor` — new skill folder added under `skills/`
   - `patch` — content edit inside an existing skill folder
   Done when bump type is decided and the reason is clear.

3. Write one plain-English sentence per changed skill describing what changed and why it matters to a consumer. Aggregate into a single summary if multiple skills changed in the same direction. Done when a consumer reading only this summary would understand the release without context from this conversation.

4. Generate slug from `git rev-parse --short HEAD` plus a 1-2 word topic. Example: `add-groq-a3f9b2`. Must be kebab-case, no special chars. Done when slug is valid.

5. Write `.changeset/<slug>.md`:
   ```markdown
   ---
   "phucbm-skills": patch
   ---

   Summary from step 3.
   ```
   Done when file exists with correct YAML frontmatter and `"phucbm-skills"` as the package name — not `mattpocock-skills` or anything else.

6. Run `git add .changeset/<slug>.md`. Report the file path. Done when `git status` confirms the file is staged.

Do not commit. The user commits this file alongside their feature PR.
