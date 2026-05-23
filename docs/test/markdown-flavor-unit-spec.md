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
flavors only. Auto-detection precedence tests follow
[[docs/design/markdown-flavor-auto-detection]].

## Test Cases

| Spec ID | Target file | Requirement tags | Assertions |
|---|---|---|---|
| MF-U-001 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles`, `Security.Parser.FlavorProfileResourceSafety` | Profile registry contains every explicit flavor id exactly once; labels match requirements; each profile has a research source and parser/resource-safety metadata. |
| MF-U-002 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Each profile distinguishes core syntax, extension syntax, host-specific behavior, and unsupported constructs. |
| MF-U-003 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Original Markdown profile marks fenced code, pipe tables, task lists, and wiki links as non-core. |
| MF-U-004 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | CommonMark profile enables fenced code blocks and standardized edge cases while excluding GFM tables/tasks and Obsidian wiki links as core syntax. |
| MF-U-005 | `src/parser/__tests__/markdown-flavor-profiles.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | GFM and GLFM profiles inherit CommonMark baseline and declare their platform extensions separately. |
| MF-U-006 | `src/lsp/handlers/__tests__/configuration.handler.test.ts` | `Extension.MarkdownFlavor.ServerPropagation`, `Security.Input.FlavorPropagationPayload` | `workspace/didChangeConfiguration` accepts every required flavor id and rejects unknown ids, malformed resource maps, non-file URI keys, dangerous object keys, stale resources, and `auto` as effective flavor without mutating active flavor state. |
| MF-U-007 | `src/lsp/handlers/__tests__/configuration.handler.test.ts` | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.Refresh` | Flavor changes mark affected open documents for diagnostics and feature refresh. |
| MF-U-008 | `src/lsp/handlers/__tests__/configuration.handler.test.ts` | `Extension.MarkdownFlavor.AutoDetection` | The auto-detection truth table from [[docs/design/markdown-flavor-auto-detection]] is covered: workspace-folder/workspace/user scope, project TOML, `.obsidian/`, `.flavor-grenade.toml`, server membership, syntax/context inference, invalid values, and CommonMark fallback. |
| MF-U-009 | shared flavor contract fixture | `Extension.MarkdownFlavor.RequiredCoverage` | Server accepted ids, extension constants, package schema enum, and selector ids match exactly. |
| MF-U-010 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `src/completion/__tests__/completion-router.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates` | Original Markdown analysis supports historical core constructs, marks Phase 22 LSP surfaces implemented, emits FG101 portability diagnostics for unsupported extensions, and suppresses inactive Obsidian completions. |
| MF-U-011 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `src/completion/__tests__/completion-router.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates` | CommonMark analysis supports fenced code, setext/ATX headings, inline/reference links, autolinks, and implemented surface status while excluding GFM tables/tasks and Obsidian wiki links/callouts as core syntax; FG102 portability warnings and inactive Obsidian completion suppression are covered. |
| MF-U-012 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `src/completion/__tests__/completion-router.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `Extension.MarkdownFlavor.ServerPropagation`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates` | Obsidian analysis preserves wiki links, embeds, tags, block anchors, callouts, vault-local resolution, implemented profile surface status, active-syntax diagnostics, and Obsidian-only completions only for effective flavor `obsidian`. |
| MF-U-013 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `src/completion/__tests__/completion-router.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts`, `src/handlers/__tests__/semantic-tokens.handler.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Navigation.ProfileResolution`, `FlavorLSP.SemanticTokens.ProfileTokens`, `FlavorLSP.HostBoundary.NonLocalReferences` | GFM analysis supports pipe tables, task lists, strikethrough, extended autolinks, implemented profile surface status, malformed table diagnostics, table/task completions, table/task symbols, table folds, task/strikethrough semantic tokens, and inactive Obsidian syntax. |
| MF-U-014 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `src/completion/__tests__/completion-router.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts`, `src/handlers/__tests__/semantic-tokens.handler.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Navigation.ProfileResolution`, `FlavorLSP.SemanticTokens.ProfileTokens`, `FlavorLSP.HostBoundary.NonLocalReferences` | GLFM analysis extends the CommonMark/GFM baseline with inapplicable task markers, description lists, footnotes, TOC tags, host reference boundaries, implemented profile surface status, FG202 diagnostics, GLFM snippets, description-list/TOC symbols, description-list folds, task/footnote semantic tokens, and inactive Obsidian syntax. |
| MF-U-015 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Pandoc analysis supports metadata blocks, citations, footnotes, math, attributes, fenced divs, definition lists, labels, and cross-references without invoking Pandoc. |
| MF-U-016 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | MultiMarkdown analysis supports metadata, tables, footnotes, citations, labels, and document-production cross-references. |
| MF-U-017 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles`, `Extension.MarkdownFlavor.ManualLanguageSafety` | MDX analysis recognizes JSX expression/component regions, ESM regions, and Markdown/JSX boundaries without relying on VS Code language-mode promotion. |
| MF-U-018 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | kramdown analysis supports block/span attributes, definition lists, tables, math, footnotes, and inline attribute list behavior. |
| MF-U-019 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Markdown Extra analysis supports tables, definition lists, footnotes, abbreviations, fenced code, and attribute blocks. |
| MF-U-020 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | R Markdown analysis supports YAML metadata, fenced chunk syntax, chunk labels/options, folding, document symbols, and diagnostics without executing code. |
| MF-U-021 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Reddit Markdown analysis supports Reddit-specific syntax awareness, escaping and line-break behavior, spoilers, and portability diagnostics without calling Reddit services. |
| MF-U-022 | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | `Extension.MarkdownFlavor.DialectProfiles` | Stack Overflow Markdown analysis supports tag links, spoilers, syntax highlighting hints, code fence behavior, GFM-style tables, and post-surface constraints. |
| MF-U-023 | planned syntax-inference classifier unit | `Extension.MarkdownFlavor.AutoDetection`, `Security.Parser.FlavorProfileResourceSafety` | TOML-absent documents with strong local syntax infer `mdx`, `r-markdown`, `stack-overflow`, `reddit`, `glfm`, `pandoc`, `multimarkdown`, `kramdown`, or `markdown-extra`; weak/shared syntax such as GFM tables/tasks/strikethrough does not infer a flavor by itself; Original Markdown is never inferred from absence of extensions. |
| MF-U-024 | planned marker-boundary unit | `Extension.MarkdownFlavor.AutoDetection`, `Security.Vault.ProjectConfigConfinement` | Marker and context search stops at the active workspace/vault boundary, so fixture roots or nested workspaces do not inherit `.flavor-grenade.toml` from ancestor directories outside that boundary. |
| MF-U-025 | planned structured-profile contract unit | `FlavorLSP.StructuredProfiles.Flags`, `Extension.MarkdownStructuredProfiles.Configuration` | `keep-a-changelog`, `common-changelog`, and `madr` exist only as `StructuredMarkdownProfileId` values; they are absent from `MarkdownFlavorId`, selector ids, and package flavor enum; TOML/VS Code settings accept `auto`, `none`, and explicit arrays while rejecting unknown ids and duplicate/incompatible changelog flags. |
| MF-U-026 | planned structured-profile inference unit | `FlavorLSP.StructuredProfiles.Flags`, `Extension.MarkdownFlavor.AutoDetection` | Filename/folder/content inference detects Keep a Changelog, Common Changelog, and MADR from strong local evidence; weak headings fall back to no structured profile; structured profile inference respects the active workspace boundary and can combine with every base Markdown flavor. |

## Per-LSP-Surface Fixture Expectations

Each Phase 22-34 dialect fixture must declare active, inert, and host-specific
syntax expectations for the LSP surfaces below. A phase may mark a surface
deferred only by linking the applicable row in
[[docs/plans/markdown-flavor-lsp-applicability-matrix]] and recording the
deferred lookup or product limitation in validation evidence.

| Surface Spec ID | Requirement tags | Required fixture expectations |
|---|---|---|
| MF-DIAG-001 | `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.HostBoundary.NonLocalReferences` | Exact diagnostic codes or categories for supported malformed constructs; negative checks that inactive syntax does not emit active-flavor diagnostics; host references do not become broken local link diagnostics. |
| MF-COMP-001 | `FlavorLSP.Completion.ProfileCandidates` | Completion item label/kind classes for active constructs; absence or portability-only treatment for inactive syntax; host-prefix snippets only for platform flavors that define them. |
| MF-NAV-001 | `FlavorLSP.Navigation.ProfileResolution`, `FlavorLSP.HostBoundary.NonLocalReferences` | Definition, references, document links, document symbols, and folding ranges for local constructs; host references classified as non-local and not resolved as vault targets. |
| MF-HOVER-001 | `FlavorLSP.Hover.ProfileMetadata` | Hover text classifies local target metadata, syntax support, renderer/conversion/execution boundaries, and host-boundary status without claiming external platform validation. |
| MF-ST-001 | `FlavorLSP.SemanticTokens.ProfileTokens` | Token type/modifier expectations for active constructs; opaque-region and inactive-syntax negative token checks. |
| MF-REN-001 | `FlavorLSP.Rename.ProfileSafety`, `FlavorLSP.HostBoundary.NonLocalReferences` | `prepareRename` and `rename` success cases for profile-supported local symbols; rejection cases for inactive, host-specific, conversion-bound, renderer-bound, and execution-bound targets. |
| MF-HOST-001 | `FlavorLSP.HostBoundary.NonLocalReferences`, `Security.Vault.PathConfinement` | Per-platform/conversion fixtures prove host references, conversion directives, JSX/ESM, and executable chunks are never treated as local vault edits, local definitions, or broken vault diagnostics and never trigger network access, process execution, dynamic imports, or out-of-root file reads without configured integration context. |
| MF-SEC-001 | `Security.Parser.FlavorProfileResourceSafety` | Pathological fixtures for long delimiters, nested constructs, unterminated syntax, large tables/lists/chunks/citations, and unsafe-regex review for every dialect parser change. |
| MF-SEC-002 | `Security.Input.ProjectConfigTOMLSafety`, `Security.Vault.ProjectConfigConfinement` | Oversized, invalid, dangerous-key, symlinked, and out-of-root `.flavor-grenade.toml` fixtures are treated as absent configuration without logging content or mutating prior flavor state. |

Minimum fixture families:

| Flavor family | Required examples |
|---|---|
| Core flavors | Original and CommonMark fixtures must prove Obsidian, GFM, platform, conversion, MDX, and R Markdown constructs are inert or portability-only. |
| Obsidian | Wiki links, embeds, tags, block references, callouts, vault-local attachments, and Obsidian opaque regions. |
| GFM/GLFM | Tables, task lists, strikethrough/autolinks, heading anchors, alerts or platform references, and host issue/MR/user/label references as non-local. |
| Pandoc/MultiMarkdown/kramdown/Markdown Extra | Citations, footnotes, labels/attributes, abbreviations, definition lists, math, fenced divs, and conversion/export-bound references. |
| MDX/R Markdown | JSX/ESM or chunk regions as opaque/execution-bound where applicable; local Markdown structures still behave by profile. |
| Reddit/Stack Overflow | Spoilers, user/subreddit/tag/question/reference forms, code-fence hints, and platform references as non-local. |

## Exact Spec ID Anchors

### MF-U-006 - Server Flavor Configuration Validation

Unit evidence for `workspace/didChangeConfiguration` handling of
`flavorGrenade.markdownFlavor`.

### MF-U-007 - Flavor Change Refresh

Unit evidence for diagnostic and feature refresh after flavor changes.

### MF-U-008 - Auto Flavor Resolution

Unit evidence for [[docs/design/markdown-flavor-auto-detection]], including
`.flavor-grenade.toml`, workspace settings, precedence, standalone user
settings, server membership, syntax/context inference, boundary confinement,
and invalid-value fallback.

### MF-U-010 - Original Markdown Parser And Analysis

Unit evidence for Phase 22. Coverage proves Original Markdown setext and ATX
headings, indented code opacity, inline Markdown links, inactive wiki/callout
syntax, FG101 portability diagnostics, and completion suppression for inactive
Obsidian contexts.

### MF-U-011 - CommonMark Parser And Analysis

Unit evidence for Phase 23. Coverage proves CommonMark setext and ATX
headings, fenced code opacity, inline/reference Markdown links, autolinks,
inactive wiki/callout/task/table syntax, FG102 portability diagnostics, and
completion suppression for inactive Obsidian contexts.

### MF-U-012 - Obsidian Parser And Analysis

Unit evidence for Phase 24. Coverage proves Obsidian wiki links, embeds,
tags, block anchors, callouts, frontmatter, math/comment/Templater opaque
regions, implemented surface status, active-syntax diagnostic behavior, and
Obsidian-only completion routing under effective flavor `obsidian`.

### MF-U-013 - GFM Parser And Analysis

Unit evidence for Phase 25. Coverage proves GFM pipe tables, task-list items,
strikethrough, extended bare autolinks, implemented surface status, malformed
table diagnostics, table/task completions, table/task document symbols, table
folding, task/strikethrough semantic tokens, and inactive Obsidian syntax.

### MF-U-014 - GLFM Parser And Analysis

Unit evidence for Phase 26. Coverage proves inherited GFM syntax, GLFM
inapplicable task markers, description lists, footnotes, TOC tags, GitLab
host-reference recognition, implemented surface status, malformed
description-list diagnostics, GLFM completion snippets, description-list and
TOC document symbols, description-list folding, inapplicable-task/footnote
semantic tokens, and inactive Obsidian syntax.

### MF-U-015 - Pandoc Markdown Parser And Analysis

Unit evidence for Phase 27. Coverage proves Pandoc title blocks, citations,
footnotes, attribute sets, malformed attribute diagnostics, fenced Divs,
definition lists, implemented surface status, Pandoc completion snippets,
metadata/label/footnote document symbols, fenced-Div and definition-list
folding, citation/footnote/attribute semantic tokens, bibliography-bound
citation classification, and inactive Obsidian syntax.

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

### MF-U-023 - Syntax And Context Inference

Unit evidence for the no-TOML inference path. Coverage proves strong syntax
signals select one inferred flavor only when the evidence is unambiguous; weak
or shared constructs remain CommonMark fallback; no inference path executes
code, fetches network data, loads renderers, or reads outside the configured
workspace/vault boundary.

### MF-U-024 - Marker Boundary Confinement

Unit evidence for fixture/workspace boundary safety. Coverage proves a
workspace root used as a negative control, such as the smoketest root README,
does not become OFM or inherit project flavor merely because a repository
ancestor or nested child fixture has `.flavor-grenade.toml`.

## Exit Criteria

- All explicit flavor ids from ADR020 are represented in the profile registry.
- Configuration validation cannot accept an unresearched flavor id.
- Auto-detection precedence and invalid configured flavor fallback are covered.
- TOML-absent syntax/context inference, ambiguity fallback, and boundary
  confinement are covered.
- Structured profile flags for Keep a Changelog, Common Changelog, and MADR
  are covered without expanding `MarkdownFlavorId`.
- Client/server enum drift fails a unit contract test.
- Unit evidence exists before integration or E2E tests rely on the flavor model.
- Each Phase 22-34 dialect has a concrete parser/analysis unit spec ID.
