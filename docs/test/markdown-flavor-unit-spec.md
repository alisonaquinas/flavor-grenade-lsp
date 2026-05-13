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
| MF-U-008 | `src/lsp/handlers/__tests__/configuration.handler.test.ts` | `Extension.MarkdownFlavor.AutoDetection` | `.flavor-grenade.toml` and workspace settings resolve `auto` to each required explicit flavor id; invalid configured values fall back without mutating active flavor state. |
| MF-U-009 | shared flavor contract fixture | `Extension.MarkdownFlavor.RequiredCoverage` | Server accepted ids, extension constants, package schema enum, and selector ids match exactly. |
| MF-U-010 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Original Markdown analysis supports historical core constructs and treats fenced code, pipe tables, task lists, wiki links, and callouts as non-core. |
| MF-U-011 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | CommonMark analysis supports standardized fenced code, heading, link, and list behavior while excluding GFM tables/tasks and Obsidian wiki links as core syntax. |
| MF-U-012 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `Extension.MarkdownFlavor.ServerPropagation` | Obsidian analysis preserves wiki links, embeds, tags, block anchors, callouts, vault-local resolution, and structural LSP behavior only for effective flavor `obsidian`. |
| MF-U-013 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | GFM analysis supports pipe tables, task lists, strikethrough, autolinks, and GitHub-style heading anchors where modeled locally. |
| MF-U-014 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | GLFM analysis extends the CommonMark/GFM baseline with GitLab references, media behavior, and heading/link conventions that require no GitLab service access. |
| MF-U-015 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Pandoc analysis supports metadata blocks, citations, footnotes, math, attributes, fenced divs, definition lists, labels, and cross-references without invoking Pandoc. |
| MF-U-016 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | MultiMarkdown analysis supports metadata, tables, footnotes, citations, labels, and document-production cross-references. |
| MF-U-017 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `Extension.MarkdownFlavor.ManualLanguageSafety` | MDX analysis recognizes JSX expression/component regions, ESM regions, and Markdown/JSX boundaries without relying on VS Code language-mode promotion. |
| MF-U-018 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | kramdown analysis supports block/span attributes, definition lists, tables, math, footnotes, and inline attribute list behavior. |
| MF-U-019 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Markdown Extra analysis supports tables, definition lists, footnotes, abbreviations, fenced code, and attribute blocks. |
| MF-U-020 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | R Markdown analysis supports YAML metadata, fenced chunk syntax, chunk labels/options, folding, document symbols, and diagnostics without executing code. |
| MF-U-021 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Reddit Markdown analysis supports Reddit-specific syntax awareness, escaping and line-break behavior, spoilers, and portability diagnostics without calling Reddit services. |
| MF-U-022 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Stack Overflow Markdown analysis supports tag links, spoilers, syntax highlighting hints, code fence behavior, GFM-style tables, and post-surface constraints. |

## Exact Spec ID Anchors

### MF-U-006 - Server Flavor Configuration Validation

Unit evidence for `workspace/didChangeConfiguration` handling of
`flavorGrenade.markdownFlavor`.

### MF-U-007 - Flavor Change Refresh

Unit evidence for diagnostic and feature refresh after flavor changes.

### MF-U-008 - Auto Flavor Resolution

Unit evidence for `.flavor-grenade.toml`, workspace settings, precedence, and
invalid-value fallback.

### MF-U-010 - Original Markdown Parser And Analysis

Unit evidence for Phase 22.

### MF-U-011 - CommonMark Parser And Analysis

Unit evidence for Phase 23.

### MF-U-012 - Obsidian Parser And Analysis

Unit evidence for Phase 24.

### MF-U-013 - GFM Parser And Analysis

Unit evidence for Phase 25.

### MF-U-014 - GLFM Parser And Analysis

Unit evidence for Phase 26.

### MF-U-015 - Pandoc Markdown Parser And Analysis

Unit evidence for Phase 27.

### MF-U-016 - MultiMarkdown Parser And Analysis

Unit evidence for Phase 28.

### MF-U-017 - MDX Parser And Analysis

Unit evidence for Phase 29.

### MF-U-018 - kramdown Parser And Analysis

Unit evidence for Phase 30.

### MF-U-019 - Markdown Extra Parser And Analysis

Unit evidence for Phase 31.

### MF-U-020 - R Markdown Parser And Analysis

Unit evidence for Phase 32.

### MF-U-021 - Reddit Markdown Parser And Analysis

Unit evidence for Phase 33.

### MF-U-022 - Stack Overflow Markdown Parser And Analysis

Unit evidence for Phase 34.

## Exit Criteria

- All explicit flavor ids from ADR020 are represented in the profile registry.
- Configuration validation cannot accept an unresearched flavor id.
- Auto-detection precedence and invalid configured flavor fallback are covered.
- Client/server enum drift fails a unit contract test.
- Unit evidence exists before integration or E2E tests rely on the flavor model.
- Each Phase 22-34 dialect has a concrete parser/analysis unit spec ID.
