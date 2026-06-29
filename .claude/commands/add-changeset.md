---
description: Create a changeset file for the current branch. Asks for bump type, writes .changeset/<slug>.md, and stages it.
---

A **changeset** is an intent signal — a file that records what changed and how to bump the version. CI consumes it on merge to write `CHANGELOG.md` automatically.

## Steps

1. Run `git diff origin/main...HEAD --name-only`. List every changed path under `skills/`. Done when all paths are listed.

2. Ask the user:

   > What type of change is this?
   > - **patch** — content update to an existing skill (fix, improvement, rewording)
   > - **minor** — new skill added
   > - **major** — skill removed or renamed (breaking: consumers lose a slash command)

   Wait for the answer. Done when bump type is confirmed.

3. Ask the user:

   > Write a one-line summary for the CHANGELOG. It will appear like this:
   >
   > ```
   > Add the **`groq`** skill — streaming LLM integration with the GROQ API.
   > ```
   >
   > For patch: describe what improved. For minor: describe what the new skill does. For major: describe what was removed/renamed and include a **Breaking:** line.

   Wait for the answer. Done when summary is confirmed.

4. Generate slug: run `git rev-parse --short HEAD`, combine with a 1-2 word topic. Example: `add-groq-a3f9b2`. Must be kebab-case. Done when slug is valid.

5. Write `.changeset/<slug>.md`:

   ```markdown
   ---
   "phucbm-skills": <bump type>
   ---

   <summary from step 3>
   ```

   Package name must be `"phucbm-skills"` exactly. Done when file exists with correct YAML frontmatter.

6. Run `git add .changeset/<slug>.md`. Report the file path. Done when `git status` confirms the file is staged.

Do not commit. The user commits this file alongside their feature PR.

---

## CHANGELOG format reference

CI auto-generates `CHANGELOG.md` in this format from consumed `.changeset/*.md` files:

```markdown
# phucbm-skills

## 1.1.0

### Minor Changes

- [`a3f9b2c`](https://github.com/phucbm/skills/commit/a3f9b2c) Thanks [@phucbm](https://github.com/phucbm)! - Add the **`groq`** skill — streaming LLM integration with the GROQ API.

## 1.0.1

### Patch Changes

- [`d20ee26`](https://github.com/phucbm/skills/commit/d20ee26) Thanks [@phucbm](https://github.com/phucbm)! - Tighten the **`rag`** skill: clearer chunking guidance and updated embed model references.

## 1.0.0

### Major Changes

- [`47bde84`](https://github.com/phucbm/skills/commit/47bde84) Thanks [@phucbm](https://github.com/phucbm)! - Remove the **`old-skill`** skill.

  **Breaking:** invoke `/new-skill` instead — `/old-skill` no longer exists.

### Minor Changes

- [`47bde84`](https://github.com/phucbm/skills/commit/47bde84) Thanks [@phucbm](https://github.com/phucbm)! - Add the **`dexie`** skill — IndexedDB wrapper setup for local-first Next.js apps.
```
