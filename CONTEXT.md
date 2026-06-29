# phucbm/skills

## Language

**Skill**:
A slash command that instructs Claude to perform a specific task (e.g. `/add-skill`, `/rag`). Lives at `skills/<domain>/<topic>/SKILL.md`.
_Avoid_: plugin, command, recipe

**Domain**:
A top-level category folder grouping related skills (e.g. `ai/`, `backend/`, `deploy/`).
_Avoid_: bucket, category, namespace

**Consumer**:
A developer who installs skills from this repo via `npx skills@latest add phucbm/skills` or the Claude plugin marketplace. Skills in `plugin.json` are consumer-facing.
_Avoid_: user (ambiguous with the human in a Claude session), subscriber

**Author tooling**:
Commands and scripts that help maintain this repo — not useful to consumers. Lives in `.claude/commands/` as project-local slash commands. Excluded from `plugin.json`.
_Avoid_: internal skills, meta skills

**Release**:
A versioned snapshot of the repo — bumped `package.json` version, new CHANGELOG entry, git tag. Cut manually via `/create-new-release`.
_Avoid_: publish, deploy, ship (implies npm publish, which this repo does not do)

## Relationships

- A **domain** holds many **skills**
- A **skill** is either consumer-facing (in `plugin.json`) or author tooling (in `.claude/commands/`)
- A **release** captures all consumer-facing changes since the last tag
