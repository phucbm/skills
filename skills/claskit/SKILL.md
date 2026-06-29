---
name: claskit
description: Autonomous Claude Code task runner — write task specs as Markdown files, run claskit, and Claude implements them one by one. Use when setting up claskit in a project, writing task specs, scheduling autonomous runs, or understanding the todo/done task lifecycle.
when_to_use: |
  - User wants to set up claskit in a project
  - User wants to write a task spec / plan file for claskit
  - User asks how claskit works or what commands are available
  - User wants to run tasks now or schedule them
  - User asks about the .claude/tasks/ folder structure
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
---

# claskit — Autonomous Claude Code Task Runner

**Repo:** https://github.com/phucbm/claskit  
**npm:** `npx claskit` or `npm i -g claskit`

## What it does

claskit reads Markdown task specs from `.claude/tasks/todo/`, launches Claude with `--dangerously-skip-permissions`, and lets Claude implement them autonomously. On success each spec moves to `.claude/tasks/done/`.

## Setup

```bash
npx claskit --init
```

Creates:
```
.claude/tasks/
  todo/     ← drop task specs here
  done/     ← claskit moves completed specs here
  README.md
```

## Running tasks

```bash
npx claskit          # interactive menu (now / schedule)
npx claskit --now    # skip menu, run immediately
```

Interactive flow — **schedule path**:
1. Select tasks (comma-separated numbers or "all")
2. Enter time (HH:MM, 24h) — retries on invalid input
3. Confirm
4. Countdown → Claude launches at scheduled time

## Creating a task spec with AI

When a user wants to create a claskit spec from a conversation (brainstorm, plan, feature description):

1. Use the `/claskit` skill — it reads the current conversation context and writes `.claude/tasks/todo/<slug>.md` directly
2. Or manually apply the format below

The `/claskit` skill handles: slug generation, folder creation, and correct file format. Prefer it over writing specs manually.

## Task spec format

```markdown
# Feature Title

## Task
What to implement — be specific.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Files Affected
- src/foo.ts

## Notes
Dependencies, order hints, constraints.
```

Save as `.claude/tasks/todo/my-feature.md`.

## Key rules for writing specs

- One concern per file — don't bundle unrelated changes
- Acceptance criteria must be verifiable (file exists, test passes, UI shows X)
- List dependencies in Notes so Claude orders tasks correctly
- Never hardcode secrets or env values in specs

## Commands

| Command | What it does |
|---|---|
| `npx claskit` | Interactive menu |
| `npx claskit --init` | Initialize .claude/tasks/ structure |
| `npx claskit --now` | Run immediately, skip menu |
| `npx claskit --test` | Create 2 sample tasks to try claskit |
| `npx claskit --clean-test` | Remove sample tasks and output |

## How Claude processes specs

1. Reads all selected `.md` files
2. Decides execution order based on dependencies in Notes
3. Implements each spec fully
4. Verifies acceptance criteria
5. Runs build/lint (from package.json scripts)
6. Moves `.md` from `todo/` → `done/` on success
7. Stops and reports on any failure

## Gotchas

- Requires Claude Code CLI (`claude`) installed and authenticated
- `--dangerously-skip-permissions` — only use in trusted, backed-up projects
- macOS: uses `caffeinate` during scheduled countdown to prevent sleep
- Specs in `todo/` are read-only — claskit (not you) moves them to `done/`
