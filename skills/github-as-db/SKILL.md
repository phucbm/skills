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

Read [`@/knowledge/github/github-as-db.md`](/knowledge/github/github-as-db.md) and apply the full pattern: architecture overview, GitHub App setup, browser-side JWT + installation token, full CRUD operations, build-time index compilation (and why it's needed), PR-based community contribution flow, and all gotchas.
