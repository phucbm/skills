Skills live under `skills/<domain>/<topic>/SKILL.md`.

Every public skill (not in `in-progress/` or `deprecated/`) must have an entry in `.claude-plugin/plugin.json` and a row in its domain section of `README.md`, linked to its `SKILL.md`.

Repo-local skills (author tooling, not for consumers) are excluded from `plugin.json` and `README.md`. They live in `.claude/commands/` as project-local slash commands.

Every `SKILL.md` is either:

- **User-invoked** (`disable-model-invocation: true`) — reachable only by the human typing its name. The `description` is human-facing: a one-line summary, no trigger lists.
- **Model-invoked** (omit flag) — reachable by model or user. The `description` is model-facing with rich trigger phrasing ("Use when the user wants…, mentions…, asks for…").

Skills in `in-progress/` and `deprecated/` must not appear in `plugin.json` or `README.md`.

See `docs/invocation.md` for the full user-invoked vs model-invoked rules.
