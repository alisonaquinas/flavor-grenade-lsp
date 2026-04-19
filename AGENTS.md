# AGENTS.md — flavor-grenade-lsp

## Scope

**Only work inside this repository.**

This directory (`flavor-grenade-lsp/`) is a fully independent git repository.
When a task is requested here, all changes, commits, and investigations must
stay within `flavor-grenade-lsp/`. Do not read, modify, or commit files in
sibling repositories (`markdownlint-obsidian/`, `marksman/`, `obsidian-linter/`,
`repo-docs-skills/`) even if a linting or tooling check appears to surface issues
there.

## Commands

```bash
bun install        # install deps
bun run build      # compile
bun run lint       # eslint src/
bun run typecheck  # tsc --noEmit
bun test           # unit tests
bun run test:bdd   # BDD cucumber suite
```

## Branch convention

- `main` — releases
- `develop` — integration
- `feature/*` — work branches; open PRs against `develop`
