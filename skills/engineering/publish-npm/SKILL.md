---
name: publish-npm
description: Set up a GitHub Actions workflow to publish an npm package on release — using either a long-lived npm token or OIDC trusted publishing (no stored secret). Use when adding CI publish automation to a package repo, wiring up phucbm/publish-npm-action, switching to OIDC, or debugging publish failures in Actions.
when_to_use: When the user wants to auto-publish an npm package on GitHub release, set up OIDC trusted publishing, or troubleshoot npm CI publish errors.
allowed-tools: Read, Edit, Write, Bash
---

Read [`@/knowledge/github-actions/publish-npm.md`](/knowledge/github-actions/publish-npm.md) for full setup, workflow templates, inputs reference, and gotchas.
