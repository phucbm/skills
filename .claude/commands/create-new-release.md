---
description: Cut a new release — bump version, write CHANGELOG entry, commit and tag.
---

A **release** bundles all unreleased changes into a versioned CHANGELOG entry, bumps `package.json`, commits, and tags. Run this on `main` after merging the PRs you want to ship.

## Steps

1. Run `git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --oneline`. List every commit since the last tag. Done when all commits are listed.

2. Ask the user:

   > What type of release is this?
   > - **patch** — fixes, content updates, no new skills
   > - **minor** — new skill(s) added
   > - **major** — skill(s) removed or renamed (breaking: consumers lose a slash command)

   Wait for the answer. Done when bump type is confirmed.

3. Ask the user:

   > Write the CHANGELOG entries for this release. One bullet per meaningful change. Format:
   >
   > ```
   > Add the **`groq`** skill — streaming LLM integration with the GROQ API.
   > ```
   >
   > For major changes, add a **Breaking:** line. You can write multiple bullets.

   Wait for the answer. Done when entries are confirmed.

4. Read `package.json`. Bump `version` field according to semver and the bump type from step 2. Done when new version string is valid semver.

5. Read `CHANGELOG.md`. Prepend a new version section using this exact format:

   ```markdown
   ## <version>

   ### <Patch|Minor|Major> Changes

   - [`<short-sha>`](https://github.com/phucbm/skills/commit/<short-sha>) Thanks [@phucbm](https://github.com/phucbm)! - <entry from step 3>
   ```

   Get `<short-sha>` from `git rev-parse --short HEAD`. One bullet per entry. Done when CHANGELOG.md has the new section at the top, below the `# phucbm-skills` heading.

6. Write the bumped version back to `package.json`. Done when `package.json` version matches the new version.

7. Run:
   ```bash
   git add CHANGELOG.md package.json
   git commit -m "chore: release v<version>"
   git tag v<version>
   git push && git push --tags
   ```
   Done when push succeeds and tag is on remote.

Report the new version and the CHANGELOG entry to the user.
