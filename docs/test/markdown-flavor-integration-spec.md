---
title: Markdown Flavor Integration Test Specification
tags:
  - test/spec
  - integration
  - markdown-flavor
aliases:
  - Markdown Flavor Integration Tests
---

# Markdown Flavor Integration Test Specification

Integration tests prove that flavor state moves through multiple server modules
and affects analysis without requiring VS Code UI.

## Test Cases

| Spec ID | Target file | Setup | Assertions |
|---|---|---|---|
| MF-I-001 | `src/test/integration/markdown-flavor.test.ts` | Spawn server with a temp workspace and `flavorGrenade.markdownFlavor = commonmark`. | `initialize` succeeds, open document analysis records effective flavor `commonmark`, and diagnostics do not enable Obsidian-only wiki-link behavior. |
| MF-I-002 | `src/test/integration/markdown-flavor.test.ts` | Change configuration from `commonmark` to `obsidian` with an open document containing `[[Target]]`. | Server refreshes the open document and Obsidian profile enables wiki-link diagnostics/navigation. |
| MF-I-003 | `src/test/integration/markdown-flavor.test.ts` | Iterate every required explicit flavor id through configuration updates. | Server accepts each id and publishes or exposes a refresh state without process restart. |
| MF-I-004 | `src/test/integration/markdown-flavor.test.ts` | Use unsupported flavor id `asciidoc`. | Server reports configuration validation failure and keeps previous effective flavor. |

## Exit Criteria

- Flavor state survives a real LSP process boundary.
- Every required flavor id can be applied without restart.
- Invalid flavor ids fail without corrupting active document state.
