---
title: Markdown Flavor Settings Scope Evidence
tags: [extension/docs, tests, evidence, markdown-flavor]
updated: 2026-05-13
---

# Markdown Flavor Settings Scope Evidence

Phase E15 records selector/settings behavior in pure extension unit coverage.
The user-visible Extension Development Host proof remains owned by Phase E17.

## Commands

| Command | Result |
|---|---|
| `npm test` from `extension/` | Pass: 71 tests, including `extension/src/markdown-flavor.test.ts` and updated `extension/src/language-mode.test.ts`. |
| `npm run compile` from `extension/` | Pass: `tsc --noEmit` and bundled extension build. |
| `bun run lint:docs` from repo root | Pass for root, website, and extension docs. |
| `bun test src/` from repo root | Pass: 703 tests. |
| `bun test src/test/integration/` from repo root | Pass: 19 tests. |
| `bun run bdd` from repo root | Pass: 178 scenarios, 1074 steps. |

## Scope Behavior

| Case | Evidence |
|---|---|
| Workspace-folder override | `resolveMarkdownFlavorUpdateTarget` returns `workspace-folder` for multi-root or existing folder-level overrides. |
| Workspace override | `resolveMarkdownFlavorUpdateTarget` returns `workspace` for a single owning folder without an existing folder override. |
| Standalone file override | `resolveMarkdownFlavorUpdateTarget` returns `global` when the active Markdown document has no owning workspace folder. |
| Auto Detect clearing | `selectionSettingValue("auto")` returns `undefined`, so the active override scope is cleared instead of storing a literal `auto` override. |
| Manual language safety | `isFlavorEligibleDocument` and resolver tests exclude `plaintext`, VS Code `mdx`, `ofmarkdown`, and unsupported-scheme documents. |
| Server propagation | `buildMarkdownFlavorConfigurationNotification` emits `workspace/didChangeConfiguration` with selected/effective/source per resource and suppresses restricted or inactive resources. |

## Residual Handoff

E16 owns stale contribution and Marketplace proof cleanup tied to
`ofmarkdown`. E17 owns Extension Development Host proof for visible selector
behavior, server-unavailable replay, and host-level settings persistence.
