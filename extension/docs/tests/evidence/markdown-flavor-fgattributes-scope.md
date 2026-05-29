---
title: Markdown Flavor .fgattributes Scope Evidence
tags: [extension/docs, tests, evidence, markdown-flavor]
updated: 2026-05-13
---

# Markdown Flavor .fgattributes Scope Evidence

Phase E15 records selector-to-`.fgattributes` behavior in pure extension unit
coverage.
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
| Selected-file override | Selector scope prompt writes a file-specific `.fgattributes` rule beside the active Markdown file. |
| Directory override | Selector scope prompt writes an anchored `/*.md flavor=<id>` rule to `.fgattributes` in the active file's directory. |
| Standalone file override | Standalone Markdown files use the same selected-file `.fgattributes` write beside the file. |
| Auto Detect clearing | Selecting Auto Detect removes or resets the matching `flavor` attribute for the chosen scope instead of storing an effective flavor. |
| Manual language safety | `isFlavorEligibleDocument` and resolver tests exclude `plaintext`, VS Code `mdx`, `ofmarkdown`, and unsupported-scheme documents. |
| Server propagation | Flavor refresh payloads carry selected/effective/source per resource and suppress restricted or inactive resources. |

## Residual Handoff

E16 owns stale contribution and Marketplace proof cleanup tied to `ofmarkdown`.
E17 owns Extension Development Host proof for visible selector behavior,
server-unavailable replay, `.fgattributes` persistence, and `.fgignore`
inactive state.
