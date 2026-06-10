---
title: Markdown Flavor .mdfattributes Scope Evidence
tags: [extension/docs, tests, evidence, markdown-flavor]
updated: 2026-05-29
---

# Markdown Flavor .mdfattributes Scope Evidence

This artifact records the required evidence for selector-to-`.mdfattributes`
behavior. It is not yet passing evidence. The current implementation still needs
config-file resolver and persistence tests before this artifact can move to
validation-ready.

## Commands

| Command | Result |
|---|---|
| `npm test` from `extension/` | Pending: must include `.mdfattributes` selected-file, directory, standalone, and Auto Detect reset unit tests. |
| `npm run compile` from `extension/` | Pending for the implementation PR that adds config-file persistence. |
| `bun run bdd` from repo root | Pending executable `.mdfattributes` scenarios after step definitions are implemented. Current config-file scenarios remain tagged `@planned`. |

## Scope Behavior

| Case | Evidence |
|---|---|
| Selected-file override | Planned: selector scope prompt writes a file-specific `.mdfattributes` rule beside the active Markdown file. |
| Directory override | Planned: selector scope prompt writes an anchored `/*.md flavor=<id>` rule to `.mdfattributes` in the active file's directory. |
| Standalone file override | Planned: standalone Markdown files use the same selected-file `.mdfattributes` write beside the file. |
| Auto Detect clearing | Planned: selecting Auto Detect removes or resets the matching `flavor` attribute for the chosen scope instead of storing an effective flavor. |
| Manual language safety | Planned: resolver tests exclude `plaintext`, VS Code `mdx`, `ofmarkdown`, and unsupported-scheme documents from selector writes. |
| Server propagation | Planned: flavor refresh payloads carry selected/effective/source per resource and suppress restricted or inactive resources. |

## Residual Handoff

- E15 follow-up owns pure extension resolver and `.mdfattributes` persistence
  coverage.
- E16 owns stale contribution and Marketplace proof cleanup tied to
  `ofmarkdown`.
- E17 owns Extension Development Host proof for visible selector behavior,
  server-unavailable replay, `.mdfattributes` persistence, and `.mdfignore`
  inactive state.
