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

## 2. Env vars (Vite example)

```env
VITE_GITHUB_APP_ID=123456
VITE_GITHUB_APP_INSTALLATION_ID=78901234
VITE_GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
```

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
    return { ...record, source: 'repo' }   // tag records so app can distinguish repo vs local data
  })
  .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))

writeFileSync(join(outDir, 'index.json'), JSON.stringify(items, null, 2))
console.log(`[build-index] wrote ${items.length} items → public/data/index.json`)
```

Hook into `package.json` — runs before every dev start and production build:

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
const res = await fetch('/data/index.json')  // relative URL, served by Vite dev server or CDN
const items = await res.json()
```

> In-memory cache is enough — index is per-deploy, no TTL needed.

---

## 6. Community contribution via PR flow

For public contributions where a maintainer reviews before merging:

```ts
import { nanoid } from 'nanoid'

async function contributeRecord(
  data: object,
  filePath: string,
  prTitle: string,
  prBody: string,
): Promise<string> {
  const octokit = await getOctokit()

  // conflict-safe branch name
  const branch = `contribute/${nanoid(8)}`

  // get current main SHA
  const { data: ref } = await octokit.rest.git.getRef({ owner: OWNER, repo: REPO, ref: 'heads/main' })

  // create branch
  await octokit.rest.git.createRef({
    owner: OWNER, repo: REPO,
    ref: `refs/heads/${branch}`,
    sha: ref.object.sha,
  })

  // commit file to branch
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO,
    path: filePath,
    message: prTitle,
    content: encode(data),
    branch,
  })

  // open PR
  const { data: pr } = await octokit.rest.pulls.create({
    owner: OWNER, repo: REPO,
    title: prTitle,
    head: branch,
    base: 'main',
    body: prBody,
  })

  // request reviewer (non-fatal if app lacks permission)
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

### Strip internal fields before publishing

App data often has internal-only fields (local state, cache flags) that shouldn't land in the repo:

```ts
const { _localOnly, source, copiedFrom, ...publicData } = record
await contributeRecord(publicData, filePath, title, body)
```

### Editing an existing record (update PR)

```ts
async function contributeEdit(data: object, existingPath: string, ...): Promise<string> {
  const octokit = await getOctokit()
  const fileSha = await getFileSha(octokit, existingPath)
  // ... same branch+PR flow, but pass sha to createOrUpdateFileContents
  await octokit.rest.repos.createOrUpdateFileContents({
    ...,
    ...(fileSha ? { sha: fileSha } : {}),
  })
}
```

---

## Gotchas

| Issue | Fix |
|---|---|
| Non-ASCII content breaks `btoa()` | Use `btoa(unescape(encodeURIComponent(str)))` — handles CJK, emoji |
| PEM newlines in env | Store as `\n` literals; `.replace(/\\n/g, '\n')` at runtime |
| Update/delete fails with 422 | Always fetch current SHA first; pass it to the API call |
| Branch name collisions | Append `nanoid(6–8)` to branch name |
| Internal fields leaking to repo | Destructure + strip before serializing |
| Installation ID hard to find | GitHub → Settings → Installed GitHub Apps → click app → URL: `/installations/<id>` |
| Rate limits on file reads | Compile to `public/data/index.json` at build time — one fetch, no API calls at runtime |
| `source` field confusion | Inject `source: 'repo'` in build script; app uses it to distinguish repo vs local records |
