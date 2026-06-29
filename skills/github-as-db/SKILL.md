---
name: github-as-db
description: >
  Use a GitHub repo as a zero-infra, anonymous-friendly data store — JSON files as records,
  GitHub App bot as the write layer, build-time index compilation as the read layer.
  No auth service, no database, no backend required. Covers CRUD via Octokit, community
  contribution via PR flow, and build-time index generation to avoid API rate limits.
  Use when building community data repos, personal low-frequency data stores, open-source
  projects that need structured data without a database, or any "submit to repo" feature
  from a browser app where users don't need a GitHub account.
when_to_use: >
  User wants to store or contribute structured data to a GitHub repo from a browser app.
  Also use when: setting up GitHub App installation token auth in a Vite/browser context,
  implementing a PR-based contribution flow, asking about repo-as-database architecture,
  looking for a free zero-infra alternative to a database for OSS or personal projects,
  or hitting GitHub API rate limits when reading many files.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# GitHub as Zero-Infra Data Store

## Concept

Repo = database. JSON files checked into `data/` = records. A GitHub App bot handles all writes — no user GitHub account needed, no backend, no DB. A build-time script compiles all records into a single static `index.json` for fast reads without API calls.

Used in: [clyrics](https://github.com/phucbm/clyrics) — community song lyrics where anyone contributes from the web app anonymously.

---

## When to use / avoid

| Use | Avoid |
|---|---|
| Community contributions to public data | Private/sensitive data (repo must be public on free tier) |
| Personal low-frequency CRUD (configs, bookmarks, etc.) | High-frequency writes (>100/day gets slow) |
| OSS project, no auth or DB budget | Real-time data or complex queries |
| Version history / audit log matters | Relational data or joins |
| Anonymous contributions with moderation | Mass concurrent contributors |

PR review step = built-in moderation. Git history = free audit log. GitHub Issues/PRs = free support queue.

---

## Architecture

```
browser app
    │
    ├─ READ  → fetch /data/index.json (static, CDN-served, compiled at build time)
    │
    └─ WRITE → GitHub App bot
                  ├─ Personal use:    direct commit to main
                  └─ Community use:   branch → commit → PR (maintainer reviews + merges)

repo: data/*.json  ←──  source of truth
           │
    prebuild script
           │
      public/data/index.json  (gitignored, regenerated each deploy)
```

---

## 1. Create the GitHub App

1. GitHub → Settings → Developer Settings → GitHub Apps → New GitHub App
2. **Permissions** (repository scope):
   - Contents: Read & Write
   - Pull requests: Read & Write (community flow only)
3. Install the app on your target repo
4. Note down:
   - **App ID** (shown on app settings page)
   - **Installation ID** (GitHub → Settings → Installed GitHub Apps → click app → URL ends in `/installations/<id>`)
   - **Private Key** — generate and download `.pem` file

---

## 2. Env vars + framework notes

**Vite (browser-side — acceptable for public repos with narrow app permissions):**
```env
VITE_GITHUB_APP_ID=123456
VITE_GITHUB_APP_INSTALLATION_ID=78901234
VITE_GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
```

> `VITE_*` vars ship to the browser bundle. Acceptable only when the repo is public and the GitHub App has narrow permissions (one repo, no org access) — worst case someone uses the key to open a PR, still gated by maintainer review.

**Next.js / Nuxt — move auth server-side. Never use `NEXT_PUBLIC_*` for the private key.**
```env
# .env (not NEXT_PUBLIC_*)
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=78901234
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
```

Call `getInstallationToken()` only inside a Server Action (`'use server'`) or API route (`/app/api/contribute/route.ts`). Browser posts `{ data }` → server mints JWT → exchanges for token → creates PR → returns PR URL.

> Store the PEM as a single line with literal `\n` separators. Reconstruct at runtime with `.replace(/\\n/g, '\n')`.
> For CI/CD: set as repo secrets, never commit the `.pem` file.

**Deps:**
```bash
pnpm add jose octokit nanoid
```

---

## 3. GitHub App auth — mint JWT + exchange for installation token

```ts
import { SignJWT, importPKCS8 } from 'jose'

async function getInstallationToken(): Promise<string> {
  const appId = import.meta.env.VITE_GITHUB_APP_ID
  const installationId = import.meta.env.VITE_GITHUB_APP_INSTALLATION_ID
  const rawKey = import.meta.env.VITE_GITHUB_APP_PRIVATE_KEY

  if (!appId || !installationId || !rawKey) throw new Error('NO_GITHUB_APP_CONFIG')

  const pem = rawKey.replace(/\\n/g, '\n')
  const key = await importPKCS8(pem, 'RS256')

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setIssuer(appId)
    .setExpirationTime('10m')   // max allowed by GitHub
    .sign(key)

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )
  if (!res.ok) throw new Error(`GitHub App token error: ${res.status}`)
  const { token } = await res.json()
  return token
}

async function getOctokit() {
  const { Octokit } = await import('octokit')
  return new Octokit({ auth: await getInstallationToken() })
}
```

> Mint fresh per operation — installation tokens last ~1 hour but the JWT used to fetch them is 10m max.

---

## 4. CRUD operations

### Encoding — always use this for file content

```ts
// Handles CJK characters, emoji, and any non-ASCII safely
function encode(obj: object): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj, null, 2))))
}
```

> `btoa()` alone breaks on non-ASCII. `btoa(unescape(encodeURIComponent(...)))` is the fix. Learned from CJK song titles in clyrics.

### Get file SHA (required for update + delete)

```ts
async function getFileSha(octokit: Octokit, path: string): Promise<string | undefined> {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner: OWNER, repo: REPO, path })
    if ('sha' in data) return data.sha
  } catch {
    return undefined // file doesn't exist
  }
}
```

> **Always fetch SHA before update or delete.** GitHub API rejects updates without the current SHA. If file was deleted externally, SHA fetch returns undefined — handle gracefully.

### Create

```ts
async function createRecord(path: string, data: object, message: string) {
  const octokit = await getOctokit()
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO,
    path,
    message,
    content: encode(data),
    branch: 'main',
  })
}
```

### Read (single file)

```ts
async function readRecord(path: string): Promise<object> {
  const res = await fetch(
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${path}`
  )
  if (!res.ok) throw new Error(`Not found: ${path}`)
  return res.json()
}
```

> Use raw.githubusercontent.com for direct file reads — no API auth needed, no rate limit for public repos.

### Update

```ts
async function updateRecord(path: string, data: object, message: string) {
  const octokit = await getOctokit()
  const sha = await getFileSha(octokit, path)
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO,
    path,
    message,
    content: encode(data),
    branch: 'main',
    ...(sha ? { sha } : {}),
  })
}
```

### Delete

```ts
async function deleteRecord(path: string, message: string) {
  const octokit = await getOctokit()
  const sha = await getFileSha(octokit, path)
  if (!sha) return // already gone
  await octokit.rest.repos.deleteFile({
    owner: OWNER, repo: REPO,
    path,
    message,
    sha,
    branch: 'main',
  })
}
```

---

## 5. Build-time index (solves the rate limit problem)

**Problem:** Fetching each JSON file via GitHub API at runtime burns rate limit fast — only 60 req/hr unauthenticated, 5000 req/hr authenticated. A collection of 200 items = 200 API calls on every page load.

**Solution:** Compile all records to a single `public/data/index.json` at build time. App fetches one static file — no API calls at runtime.

```js
// scripts/build-index.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'data')
const outDir = join(root, 'public', 'data')

mkdirSync(outDir, { recursive: true })

const items = readdirSync(dataDir)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const record = JSON.parse(readFileSync(join(dataDir, f), 'utf-8'))
    return { ...record, source: 'repo' }
  })
  .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))

writeFileSync(join(outDir, 'index.json'), JSON.stringify(items, null, 2))
console.log(`[build-index] wrote ${items.length} items → public/data/index.json`)
```

Hook into `package.json`:
```json
{
  "scripts": {
    "predev": "node scripts/build-index.mjs",
    "prebuild": "node scripts/build-index.mjs"
  }
}
```

Add to `.gitignore`:
```
public/data/
```

App fetches at runtime:
```ts
const res = await fetch('/data/index.json')
const items = await res.json()
```

---

## 6. Community contribution via PR flow

```ts
import { nanoid } from 'nanoid'

async function contributeRecord(
  data: object,
  filePath: string,
  prTitle: string,
  prBody: string,
): Promise<string> {
  const octokit = await getOctokit()
  const branch = `contribute/${nanoid(8)}`
  const { data: ref } = await octokit.rest.git.getRef({ owner: OWNER, repo: REPO, ref: 'heads/main' })

  await octokit.rest.git.createRef({
    owner: OWNER, repo: REPO,
    ref: `refs/heads/${branch}`,
    sha: ref.object.sha,
  })

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO,
    path: filePath,
    message: prTitle,
    content: encode(data),
    branch,
  })

  const { data: pr } = await octokit.rest.pulls.create({
    owner: OWNER, repo: REPO,
    title: prTitle,
    head: branch,
    base: 'main',
    body: prBody,
  })

  try {
    await octokit.rest.pulls.requestReviewers({
      owner: OWNER, repo: REPO,
      pull_number: pr.number,
      reviewers: [OWNER],
    })
  } catch { /* non-fatal */ }

  return pr.html_url
}
```

Strip internal fields before publishing:
```ts
const { _localOnly, source, copiedFrom, ...publicData } = record
await contributeRecord(publicData, filePath, title, body)
```

---

## Gotchas

| Issue | Fix |
|---|---|
| Non-ASCII content breaks `btoa()` | Use `btoa(unescape(encodeURIComponent(str)))` — handles CJK, emoji |
| PEM newlines in env | Store as `\n` literals; `.replace(/\\n/g, '\n')` at runtime |
| Update/delete fails with 422 | Always fetch current SHA first; pass it to the API call |
| Branch name collisions | Append `nanoid(6-8)` to branch name |
| Internal fields leaking to repo | Destructure + strip before serializing |
| Installation ID hard to find | GitHub → Settings → Installed GitHub Apps → click app → URL: `/installations/<id>` |
| Rate limits on file reads | Compile to `public/data/index.json` at build time |
| Private key in Next.js | Never use `NEXT_PUBLIC_*` — use server actions or API routes only |
