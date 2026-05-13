---
title: Markdown Flavor Unit Test Specification
tags:
  - test/spec
  - unit
  - markdown-flavor
aliases:
  - Markdown Flavor Unit Tests
---

# Markdown Flavor Unit Test Specification

Repository-level unit tests cover server-side flavor profile and configuration
logic. Extension unit tests are specified in
`extension/docs/tests/markdown-flavor-unit-spec.md`.

## Scope

`auto` is selector state. Unit tests for dialect profiles cover explicit
flavors only.

## Test Cases

| Spec ID | Target file | Requirement tags | Assertions |
|---|---|---|---|
| MF-U-001 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles` | Profile registry contains every explicit flavor id exactly once; labels match requirements; each profile has a research source. |
| MF-U-002 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Each profile distinguishes core syntax, extension syntax, host-specific behavior, and unsupported constructs. |
| MF-U-003 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Original Markdown profile marks fenced code, pipe tables, task lists, and wiki links as non-core. |
| MF-U-004 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | CommonMark profile enables fenced code blocks and standardized edge cases while excluding GFM tables/tasks and Obsidian wiki links as core syntax. |
| MF-U-005 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | GFM and GLFM profiles inherit CommonMark baseline and declare their platform extensions separately. |
| MF-U-006 | `src/lsp/handlers/__tests__/configuration.handler.test.ts` | `Extension.MarkdownFlavor.ServerPropagation` | `workspace/didChangeConfiguration` accepts every required flavor id and rejects unknown ids without mutating active flavor state. |
| MF-U-007 | `src/lsp/handlers/__tests__/configuration.handler.test.ts` | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.Refresh` | Flavor changes mark affected open documents for diagnostics and feature refresh. |

## Exit Criteria

- All explicit flavor ids from ADR020 are represented in the profile registry.
- Configuration validation cannot accept an unresearched flavor id.
- Unit evidence exists before integration or E2E tests rely on the flavor model.
