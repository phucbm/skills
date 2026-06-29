# GitHub Actions — Auto-publish npm package on Release

Canonical implementation: [`phucbm/publish-npm-action`](https://github.com/phucbm/publish-npm-action) — a composite action that handles install → test → build → version sync → commit artifacts → publish.

## Two auth methods

| Method | Secret needed | Provenance |
|---|---|---|
| npm token | `NPM_TOKEN` in repo secrets | No |
| OIDC trusted publishing | None | Auto (attestations) |

OIDC is preferred — no long-lived secret, short-lived job-scoped token.

## Minimal workflow — npm token

```yaml
name: Publish on Release

on:
  release:
    types: [published]
  workflow_dispatch:

permissions:
  contents: write  # push artifacts back to main

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          ref: main          # always checkout main, not the tag
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0     # required to read release history

      - uses: phucbm/publish-npm-action@v1
        with:
          npm-token: ${{ secrets.NPM_TOKEN }}
```

## Minimal workflow — OIDC (no token)

```yaml
name: Publish on Release

on:
  release:
    types: [published]
  workflow_dispatch:

permissions:
  contents: write
  id-token: write   # required for OIDC

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          ref: main
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - uses: phucbm/publish-npm-action@v1
        # no npm-token — OIDC is used automatically
```

**One-time npmjs.com setup for OIDC:**
1. Go to your package on npmjs.com → Settings → Trusted Publishers
2. Click GitHub Actions, enter: org/user, repo name, workflow filename, environment (leave blank if none)

## What the action does

1. Setup pnpm + Node.js (configures registry-url for auth)
2. Install dependencies
3. Auto-detect and run tests (skips gracefully if no test script)
4. Extract version from release tag (`v1.2.3` → `1.2.3`)
5. `npm version <ver> --no-git-tag-version --allow-same-version`
6. Run build command
7. Commit `package.json` + `output-dir` (force-added) back to `main`
8. Publish to npm

## Inputs

| Input | Default | Notes |
|---|---|---|
| `npm-token` | `` | Leave empty to use OIDC |
| `node-version` | `20` | |
| `pnpm-version` | `8` | |
| `build-command` | `pnpm build` | Set `''` to skip build |
| `install-command` | `pnpm install --no-frozen-lockfile` | |
| `test-command` | `pnpm test` | |
| `publish-access` | `public` | |
| `skip-tests` | `false` | |
| `output-dir` | `dist/` | Force-committed even if in .gitignore |
| `target-branch` | `main` | Branch artifacts are pushed to |
| `commit-files` | `` | Extra files/patterns to commit |

## Outputs

`package-name`, `version`, `npm-url`, `tests-run`

## Critical gotchas (learned the hard way)

- **Checkout `ref: main`, not the tag.** The action commits build artifacts back — checking out the tag leaves you in detached HEAD and the push fails.
- **`fetch-depth: 0` is required.** When triggered by `workflow_dispatch`, the action calls `gh release list` to find the version. Shallow clone breaks this.
- **OIDC and `NODE_AUTH_TOKEN` conflict.** `setup-node` with `registry-url` writes an `.npmrc` that sets `_authToken=${NODE_AUTH_TOKEN}`. If `NODE_AUTH_TOKEN` is empty, npm falls back to OIDC — but *only* if you don't set the env var at all. Never pass an empty `NODE_AUTH_TOKEN` in the OIDC path.
- **npm ≥ 11.5.1 required for OIDC.** The action runs `npm install -g npm@latest` before publishing via OIDC. GitHub-hosted runners ship with an older npm that doesn't support trusted publishing.
- **`actions/checkout@v6` + `actions/setup-node@v6`.** The npm OIDC guide specifies these versions; older versions don't wire OIDC correctly.
- **`--allow-same-version` prevents errors** when `package.json` already has the release version (e.g. you pre-bumped it manually).
- **Build artifacts in `.gitignore`.** The `dist/` commit step uses `git add --force` — without it, ignored build output is silently skipped and the publish has stale files.

## References

- [npm Trusted Publishers — official docs](https://docs.npmjs.com/trusted-publishers/)
- [npm trusted publishing with OIDC is generally available — GitHub Changelog, July 2025](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [Feature discussion: Publish packages to npm via OIDC — GitHub Community](https://github.com/orgs/community/discussions/127011)
