# Repo-local author tooling excluded from plugin manifest

Skills that are repo-maintenance tools — things that help the author manage this repo — are excluded from `.claude-plugin/plugin.json` and `README.md`.

Consumers install skills to learn reusable patterns. They don't need the machinery for maintaining this repo. Shipping author tooling as consumer skills would bloat the install and expose internal plumbing.

Repo-local commands live in `.claude/commands/` as project-local slash commands instead. They're usable by the author in any session with this repo loaded, invisible to everyone else.

**Applies to:** `add-changeset`, any future repo-maintenance commands.
