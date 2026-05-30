---
title: flavor-grenade-lsp — Feature Roadmap
tags: [meta, roadmap, phases]
aliases: [roadmap, release plan, phase plan]
updated: 2026-05-23
current-version: 0.4.2
current-extension-version: 0.2.2
---

# flavor-grenade-lsp — Feature Roadmap

This file tracks the phase-by-phase delivery plan for flavor-grenade-lsp from initial scaffold to first release. Each phase has a name, status, and key deliverable. Detailed per-phase implementation plans live in `plans/`.

> [!NOTE]
> Status values: `planned` | `in-progress` | `in-review` | `complete` | `blocked`
> All v1 phases (0–13) are **complete** as of 2026-04-17. Current server version: **0.4.2**.
> All extension phases (R, E1–E5) are **complete** as of 2026-04-22. VS Code extension ready for Marketplace publishing.
> Extension phase E14 is **complete** as of 2026-05-07. All planned extension parity hardening phases E7-E14 are now complete.
> Security hardening Phase 18 is **in-progress** from the 2026-05-08 deep audit of `develop`.
> Website phase W8 is **complete** as of 2026-05-12 after TASK-279 removed the remaining local Commonloom source and PR #65 CI passed.
> Markdown flavor gap closure phases 19-34 and E15-E17 are **planned** from the 2026-05-13 gap analysis.
> The 2026-05-13 roadmap/test-plan gap audits in [[docs/gaps/roadmap-and-test-plan-audit-index]] are now reflected in the pending phase plans. Server flavor phases trace `FlavorLSP.*` requirements directly, extension phases require resource-aware effective-flavor propagation, and test plans include root/server plus extension evidence boundaries.

## Phase Table

| # | Phase Name | Status | Key Deliverable | Completed |
|---|---|---|---|---|
| 0 | Documentation Scaffold | complete | All `docs/` files written and committed | 2026-04-17 |
| 1 | Project Scaffold | complete | NestJS + Bun initialised; repo structure; CI skeleton; `src/main.ts` stdio entry point | 2026-04-17 |
| 2 | LSP Transport | complete | JSON-RPC Content-Length framing; capability negotiation; `initialize` / `initialized` / `shutdown` / `exit` handshake | 2026-04-17 |
| 3 | OFM Parser | complete | Full OFM AST: wiki-links, embeds, block refs, tags, callouts, frontmatter, math, Obsidian comments | 2026-04-17 |
| 4 | Vault Index | complete | Vault detection (`.obsidian/` + Flavor Grenade markers); file watcher; DocId; FolderLookup; single-file mode | 2026-04-17 |
| 5 | Wiki-Link Resolution | complete | Diagnostics FG001–FG003; go-to-def; find-refs; wiki-link completion (file-stem default) | 2026-04-17 |
| 6 | Tags | complete | Tag indexing with hierarchy; tag completion; tag find-references; tag-to-yaml code action | 2026-04-17 |
| 7 | Embeds | complete | Embed resolution; FG004 broken-embed diagnostic; hover preview for `.md` embeds | 2026-04-17 |
| 8 | Block References | complete | `^blockid` indexing as `BlockAnchorDef`; `CrossBlock` ref; FG005 diagnostic; go-to-def; find-refs; completion | 2026-04-17 |
| 9 | Completions | complete | Full completion provider: wiki-links, heading completion, block-ref completion, tags, callout types, inline links | 2026-04-17 |
| 10 | Navigation | complete | Go-to-def for all ref types; find-refs for all def types; code lens "N references" above headings and block anchors | 2026-04-17 |
| 11 | Rename | complete | Heading rename (all `[[doc#heading]]` updated); file rename via `workspace/willRenameFiles`; prepare-rename | 2026-04-17 |
| 12 | Code Actions | complete | TOC generation (`fg.toc`); create-missing-file (`fg.createMissingFile`); tag-to-yaml (`fg.tagToYaml`); workspace symbols; document symbols; semantic tokens | 2026-04-17 |
| 13 | CI & Delivery | complete | Bun bundle; cross-platform binaries; CI gates (lint, test, integration); release pipeline | 2026-04-17 |
| 14 | Markdown Link Intelligence | complete | Standard Markdown local links, reference labels, same-document anchors, and heading ambiguity diagnostics | 2026-05-06 |
| 15 | Attachment Intelligence | complete | Vault attachments referenced by embeds and Markdown image links support completion, diagnostics, definition, and hover | 2026-05-06 |
| 16 | Vault File Operation Refactors | complete | File/folder moves update wiki-links, embeds, Markdown links, reference definitions, and image links atomically | 2026-05-06 |
| 17 | Structural LSP Capabilities | complete | Document links, folding ranges, and selection ranges expose OFMarkdown structure | 2026-05-07 |
| 18 | Security Hardening Audit | in-progress | Resolve deep-audit findings for URI validation, parser resource bounds, vault confinement, and supply-chain pinning | — |
| 19 | Markdown Flavor Model And Profiles | planned | Canonical flavor id contract, minimum profile schema, source-backed active/inert/boundary registry, and profile security metadata | — |
| 20 | Markdown Flavor Server Propagation | planned | Resource-aware effective flavor reaches parser/cache/diagnostics with validated payloads, confined TOML evidence, and shared non-local boundary classification | — |
| 21 | Markdown Flavor BDD Verification And Validation | planned | Root BDD, verification, validation, and matrix evidence execute against flavor state, distinct from E17 host proof | — |
| 22 | Original Markdown Language Support | planned | Original Markdown parser plus diagnostics, completions, navigation, hover, semantic tokens, rename disposition, and negative fixtures | — |
| 23 | CommonMark Language Support | planned | CommonMark parser/LSP behavior with standardized edge cases, inactive extension checks, and full surface evidence | — |
| 24 | Obsidian Flavor Language Support | planned | Existing OFM intelligence works as `obsidian` flavor with full LSP surface coverage and no language-mode promotion | — |
| 25 | GitHub Flavored Markdown Language Support | planned | GFM syntax plus local LSP behavior, host-boundary classification, and unsafe rename rejection | — |
| 26 | GitLab Flavored Markdown Language Support | planned | GLFM syntax plus offline-testable LSP behavior and GitLab non-local boundary classification | — |
| 27 | Pandoc Markdown Language Support | planned | Pandoc metadata/citation/math/attribute support plus conversion-boundary classification and validation evidence | — |
| 28 | MultiMarkdown Language Support | planned | MultiMarkdown metadata/tables/footnotes/citations/cross-refs plus export-boundary-safe LSP behavior | — |
| 29 | MDX Flavor Language Support | planned | Markdown-mode MDX syntax support with JSX/ESM boundaries and no takeover of VS Code `mdx` language mode | — |
| 30 | kramdown Language Support | planned | kramdown attributes, definition lists, tables, math, footnotes, and profile-gated LSP behavior | — |
| 31 | Markdown Extra Language Support | planned | Markdown Extra tables, definition lists, footnotes, abbreviations, attributes, and inactive-syntax checks | — |
| 32 | R Markdown Language Support | planned | R Markdown metadata/chunk syntax plus execution-boundary-safe LSP behavior without code execution | — |
| 33 | Reddit Markdown Language Support | planned | Reddit Markdown syntax awareness, portability diagnostics, and platform-reference boundary classification | — |
| 34 | Stack Overflow Markdown Language Support | planned | Stack Overflow Markdown, code authoring, spoilers, platform refs, and post/comment-surface boundary evidence | — |

## Phase Details

### Phase 1 — Project Scaffold

Establish the repository skeleton. NestJS application initialised with Bun as the runtime. Directory structure matches [[docs/architecture/overview]]. `src/main.ts` reads from `process.stdin` and writes to `process.stdout` using Content-Length framing (stub — no protocol handling yet). ESLint, Prettier, and TypeScript strict mode configured. CI pipeline runs typecheck and lint on every push.

Implementation plan: [[docs/plans/phase-01-scaffold]]

### Phase 2 — LSP Transport

Implement the full JSON-RPC Content-Length framing layer. Handle `initialize`, `initialized`, `shutdown`, and `exit` lifecycle messages. Advertise capabilities: `textDocumentSync: Full` (per [[ADR004-text-sync-strategy]]), semantic tokens, completion, hover, go-to-definition, references, document symbols, workspace symbols, rename, code actions, code lens. Return stub responses for all unimplemented methods rather than errors.

Implementation plan: [[docs/plans/phase-02-lsp-transport]]

### Phase 3 — OFM Parser

Write the OFM parser producing an AST for every OFM construct defined in [[docs/ofm-spec/index]]. The parser must correctly handle: wiki-links with optional heading and alias segments; embed links; block reference anchors (line-end `^id`); inline tags (`#tag/sub`); callouts (`> [!TYPE]`); YAML frontmatter; display math (`$$`); inline math (`$`); Obsidian comments (`%%`); Templater expressions (`<%`). Each construct maps to a named AST node type. The parser is covered by unit tests referencing OFM rule codes.

Implementation plan: [[docs/plans/phase-03-ofm-parser]]

### Phase 4 — Vault Index

Implement vault detection per [[ADR003-vault-detection]]. Walk the vault root collecting all `.md` files, assign each a `DocId`, and build `FolderLookup` for resolving relative paths. Start a file watcher (`Bun.watch()`) to keep the index fresh as files are created, renamed, or deleted. Implement single-file mode fallback. Parse and cache frontmatter (aliases, tags) for every document.

Implementation plan: [[docs/plans/phase-04-vault-index]]

### Phase 5 — Wiki-Link Resolution

Implement the reference resolver for `[[target]]`, `[[target#heading]]`, and `[[target|alias]]` patterns. Raise FG001 (broken), FG002 (ambiguous), and FG003 (malformed) diagnostics. Implement go-to-definition (jump to target document or heading). Implement find-references (find all links to a document or heading). Implement wiki-link completion using the style configured by `completion.wiki.style` (default `file-stem` per [[ADR005-wiki-style-binding]]).

Implementation plan: [[docs/plans/phase-05-wiki-links]]

### Phase 6 — Tags

Index all `#tag` occurrences in document bodies and `tags:` frontmatter keys. Build a tag occurrence map keyed by full tag path. Support hierarchical tag queries (`#project` matches `#project/active`). Implement tag completion (offer all vault tags). Implement find-references for tags. Implement the `fg.tagToYaml` code action to move inline body tags to frontmatter.

Implementation plan: [[docs/plans/phase-06-tags]]

### Phase 7 — Embeds

Resolve `![[target]]` embeds against the vault index. Raise FG004 (broken embed) when target resolves to zero files. Implement hover for embeds: show file type, file size, and for `.md` embeds the first paragraph of the target document. See [[docs/features/hover]].

Implementation plan: [[docs/plans/phase-07-embeds]]

### Phase 8 — Block References

Implement block anchor indexing as `BlockAnchorDef` per [[ADR006-block-ref-indexing]]. Implement `CrossBlock` ref type in `RefGraph`. Raise FG005 diagnostic for broken block refs. Implement go-to-definition for `[[doc#^id]]`. Implement find-references for `^blockid` anchors. Implement completion: after `[[doc#^`, offer known block ids. Implement code lens above each `^blockid`.

Implementation plan: [[docs/plans/phase-08-block-refs]]

### Phase 9 — Completions

Consolidate all completion providers from phases 5–8 into a unified `CompletionProvider`. Implement heading completion (`[[doc#` → offer headings from resolved doc). Implement inline link completion (Markdown `[text](` prefix). Implement callout type completion (`> [!` → 13 standard types). Apply `completion.candidates` cap (default 50) with `isIncomplete: true` when the list is truncated. See [[docs/features/completions]].

Implementation plan: [[docs/plans/phase-09-completions]]

### Phase 10 — Navigation

Implement `textDocument/definition` for all ref types: wiki-link → document, `[[doc#heading]]` → heading, `[[doc#^id]]` → block anchor, `![[embed]]` → file, `#tag` → first occurrence. Implement `textDocument/references` for all def types. Implement `textDocument/codeLens` returning "N references" above headings and block anchors. See [[docs/features/navigation]] and [[docs/features/code-lens]].

Implementation plan: [[docs/plans/phase-10-navigation]]

### Phase 11 — Rename

Implement `textDocument/prepareRename` (reject non-renameable positions). Implement `textDocument/rename` for headings (update all `[[doc#heading]]` refs) and for files via `workspace/willRenameFiles` (update all `[[doc]]` refs). Style binding: respect active `completion.wiki.style`. See [[docs/features/rename]].

Implementation plan: [[docs/plans/phase-11-rename]]

### Phase 12 — Code Actions

Implement `textDocument/codeAction` for three actions: `fg.toc` (insert or update `<!-- TOC -->` block), `fg.createMissingFile` (create target file for broken wiki-link), `fg.tagToYaml` (move body tags to frontmatter). Also implement `workspace/symbol` and `textDocument/documentSymbol` providers, semantic token highlighting for OFM elements, and the FG006 (non-breaking space) quick-fix diagnostic. See [[docs/features/code-actions]].

Implementation plan: [[docs/plans/phase-12-code-actions]]

### Phase 13 — CI & Delivery

Bundle the server with Bun (`bun build --compile`). Build cross-platform binaries for Linux x64, macOS ARM64, macOS x64, and Windows x64. PR CI gates: typecheck, lint, unit tests, integration tests (spawn server, exchange LSP messages over stdio, assert responses), BDD, docs lint, and build. The npm publish job in `.github/workflows/ci.yml` publishes `@flavor-grenade/lsp-server` with provenance for editor plugin convenience; `.github/workflows/release.yml` is for binary or GitHub release artifacts when applicable.

Implementation plan: [[docs/plans/phase-13-ci-delivery]]

### Phase 14 — Markdown Link Intelligence

Implement the first server-side Marksman parity slice: standard Markdown local links become first-class OFM references. This includes inline links, image link refs, reference-style label uses and definitions, local-vs-external target classification, same-document anchors, Markdown link URL completions, definition/references support, heading rename updates, and ambiguous heading diagnostics.

Requirement links: [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.SameDocumentAnchor]], [[docs/requirements/functional/ofmarkdown-parity#Parity.HeadingAmbiguity.Diagnostics]], [[docs/requirements/functional/completions#Completion.Trigger.Coverage]], [[docs/requirements/functional/navigation#Navigation.Definition.AllLinkTypes]], [[docs/requirements/functional/navigation#Navigation.References.Completeness]], [[docs/requirements/functional/rename#Rename.Refactoring.Completeness]]

Detailed functional requirements: [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.ParseCoverage]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.TargetClassification]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.ReferenceGraph]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.Completion]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.NavigationAndReferences]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.RenameAnchors]]

Implementation plan: [[docs/plans/phase-14-markdown-link-intelligence]]

### Phase 15 — Attachment Intelligence

Make non-Markdown vault assets first-class targets for OFMarkdown embeds and standard Markdown image links. This phase indexes attachment targets, completes attachment paths, diagnoses missing attachments, navigates to assets, and returns lightweight hover metadata.

Requirement links: [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Intelligence]], [[docs/requirements/functional/embed-resolution#Embed.Resolution.ImageTarget]], [[docs/requirements/functional/embed-resolution#Embed.Resolution.MarkdownTarget]], [[docs/requirements/functional/diagnostics#Diagnostic.Severity.Embed]], [[docs/requirements/functional/navigation#Navigation.Definition.AllLinkTypes]], [[docs/requirements/functional/hover#HV-002]]

Detailed functional requirements: [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.IndexCoverage]], [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Completion]], [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Diagnostics]], [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.NavigationHover]], [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.ConfigHints]]

Implementation plan: [[docs/plans/phase-15-attachment-intelligence]]

### Phase 16 — Vault File Operation Refactors

Make vault reorganization safe by updating every local reference to moved notes and attachments before the editor applies file or folder moves. This phase returns one vault-confined WorkspaceEdit for wiki-links, embeds, Markdown links, reference definitions, and Markdown image links, while reporting ambiguous references that cannot be safely rewritten.

Requirement links: [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]], [[docs/requirements/functional/rename#Rename.Refactoring.Completeness]], [[docs/requirements/functional/rename#Rename.StyleBinding.Consistency]], [[docs/requirements/functional/security-vault-confinement#Security.Vault.PathConfinement]], [[docs/requirements/functional/security-vault-confinement#Security.Vault.RenameConfinement]], [[docs/requirements/functional/wiki-link-resolution#Link.Wiki.StyleBinding]]

Detailed functional requirements: [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.CapabilityRegistration]], [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.MovePlannerConfinement]], [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.ReferenceRewrite]], [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.SkippedAmbiguousReporting]], [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicValidation]], [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.IndexRefresh]]

Implementation plan: [[docs/plans/phase-16-vault-file-operation-refactors]]

### Phase 17 — Structural LSP Capabilities

Expose OFMarkdown document structure through standard LSP capabilities: `textDocument/documentLink`, `textDocument/foldingRange`, and `textDocument/selectionRange`. This phase reuses existing resolution data for document links and derives folding/selection ranges from OFMIndex without crossing opaque regions.

Requirement links: [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.Coverage]], [[docs/requirements/functional/navigation#Navigation.Definition.AllLinkTypes]], [[docs/requirements/functional/semantic-tokens#ST-002]], [[docs/requirements/technical/security-input-validation#Security.Input.PositionValidation]], [[docs/requirements/functional/diagnostics#Diagnostic.Ambiguous.RelatedInfo]]

Detailed functional requirements: [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.CapabilityRegistration]], [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.DocumentLinks]], [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.FoldingRanges]], [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.SelectionRanges]]

Implementation plan: [[docs/plans/phase-17-structural-lsp-capabilities]]

### Phase 18 — Security Hardening Audit

Close the remaining security gaps discovered in the 2026-05-08 deep audit of
`develop`. This phase centralizes file URI validation, enforces parser and vault
resource budgets, proves symlink realpath confinement, hardens JSON-RPC payload
validation, and removes dependency range specifiers from package manifests.

Requirement links: [[docs/requirements/functional/security-vault-confinement#Security.Vault.URISchemeAllowlist]], [[docs/requirements/technical/security-parser-safety#Security.Parser.YAMLLimits]], [[docs/requirements/technical/security-parser-safety#Security.Parser.ParseTimeout]], [[docs/requirements/technical/security-parser-safety#Security.Parser.ReDoS]], [[docs/requirements/technical/security-parser-safety#Security.Parser.VaultFileLimit]], [[docs/requirements/functional/security-vault-confinement#Security.Vault.SymlinkConfinement]], [[docs/requirements/technical/security-input-validation#Security.Input.PrototypePollution]], [[docs/requirements/operational/security-supply-chain#Security.Supply.ExactPinning]], [[docs/requirements/operational/security-supply-chain#Security.Supply.AdvisoryMonitoring]]

Implementation plan: [[docs/plans/phase-18-security-hardening-audit]]

### Phase 19 — Markdown Flavor Model And Profiles

Close the model and profile gaps identified in
[[docs/gaps/markdown-flavor-gap-analysis]]. This phase adds the canonical Markdown
flavor id contract, selector/server labels, and source-backed dialect profiles
for every explicit researched flavor. The profile schema must include active
syntax, inert/unsupported syntax, host/conversion boundaries, opaque regions,
diagnostics, completions, navigation, hover, semantic tokens, and rename
disposition. `auto` is represented as detection state, not as a dialect profile.

Requirement links: [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/technical/security-parser-safety#Security.Parser.FlavorProfileResourceSafety]], [[docs/test/markdown-flavor-unit-spec]]

Implementation plan: [[docs/plans/phase-19-markdown-flavor-model-profiles]]

### Phase 20 — Markdown Flavor Server Propagation

Make Markdown flavor real server analysis state. This phase accepts
`flavorGrenade.markdownFlavor`, resolves `auto` to an effective flavor, threads
the result through parser and cache paths, gates initial Obsidian-only behavior
for Original Markdown and CommonMark, and adds spawned-server integration tests
for supported and unsupported flavor ids. Process-boundary propagation uses
`workspace/didChangeConfiguration` carrying `flavorGrenade.markdownFlavor`.
Phase 20 now also owns the shared non-local boundary classifier in [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]], so host, conversion, renderer, bibliography, MDX/JSX, and execution-bound references do not become broken vault diagnostics, local navigation targets, or speculative rename edits.

Requirement links: [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]], [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]], [[docs/requirements/technical/security-input-validation#Security.Input.ProjectConfigSafety]], [[docs/requirements/technical/security-input-validation#Security.Input.FlavorPropagationPayload]], [[docs/requirements/functional/security-vault-confinement#Security.Vault.ProjectConfigConfinement]], [[docs/test/markdown-flavor-unit-spec#MF-U-006 - Server Flavor Configuration Validation|MF-U-006]], [[docs/test/markdown-flavor-unit-spec#MF-U-007 - Flavor Change Refresh|MF-U-007]], [[docs/test/markdown-flavor-unit-spec#MF-U-008 - Auto Flavor Resolution|MF-U-008]], [[docs/test/markdown-flavor-integration-spec#MF-I-005|MF-I-005]], [[docs/test/markdown-flavor-integration-spec#MF-I-006 - Handler Refresh Coverage|MF-I-006]], [[docs/test/markdown-flavor-integration-spec#MF-I-007 - Resource-Specific Propagation|MF-I-007]], [[docs/test/markdown-flavor-integration-spec#MF-I-008 - Host Boundary Integration|MF-I-008]], [[docs/test/markdown-flavor-integration-spec#MF-I-009 - Flavor Security Input Validation|MF-I-009]]

Implementation plan: [[docs/plans/phase-20-markdown-flavor-server-propagation]]

### Phase 21 — Markdown Flavor BDD Verification And Validation

Replace stale BDD assumptions about `ofmarkdown` language assignment with
acceptance tests that track effective flavor separately from VS Code language
mode. This phase implements the Markdown flavor BDD steps, adds verification
checks that the flavor test layers stay wired into CI, and records validation
evidence tying the displayed/profiled flavor set to research. This phase is a
root/server PR release-readiness gate, not a platform package gate unless its
implementation changes publishing, binary, extension, or platform packaging
workflows. Server dialect phases may proceed once Phase 20 propagation and
Phase 19 model readiness are available. Phase 21 evidence is root/server BDD
and validation evidence; VS Code host proof remains owned by Phase E17.

Requirement links: [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownLanguage.PreserveDefault]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/functional/markdown-flavor-lsp]], [[docs/test/markdown-flavor-e2e-spec]], [[docs/test/markdown-flavor-verification-spec]], [[docs/test/markdown-flavor-validation-spec]]

Implementation plan: [[docs/plans/phase-21-markdown-flavor-bdd-validation]]

### Phase 22 — Original Markdown Language Support

Implement actual language support for `original`: historical core constructs,
LSP behavior for supported syntax, and explicit non-core treatment for fenced
code, tables, task lists, wiki links, and callouts.

Depends on Phase 19 model readiness and Phase 20 server propagation. Phase 21
validates release evidence but is not a server dialect prerequisite.

Requirement links: [[docs/research/commonmark-and-original-markdown]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]], [[docs/test/markdown-flavor-unit-spec#MF-U-010 - Original Markdown Parser And Analysis|MF-U-010]]

Implementation plan: [[docs/plans/phase-22-original-markdown-language-support]]

### Phase 23 — CommonMark Language Support

Implement actual language support for `commonmark`: fenced code, standardized
heading/link/list behavior, document links, folding, semantic tokens,
completion, diagnostics, and navigation while keeping GFM and Obsidian
extensions gated.

Requirement links: [[docs/research/commonmark-and-original-markdown]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-011 - CommonMark Parser And Analysis|MF-U-011]]

Implementation plan: [[docs/plans/phase-23-commonmark-language-support]]

### Phase 24 — Obsidian Flavor Language Support

Reframe existing OFM intelligence as behavior for the `obsidian` flavor under
the selector model. This phase preserves wiki links, embeds, tags, block
anchors, callouts, vault-local resolution, and structural LSP behavior without
requiring `ofmarkdown` language promotion.

Requirement links: [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.SameDocumentAnchor]], [[docs/requirements/functional/ofmarkdown-parity#Parity.HeadingAmbiguity.Diagnostics]], [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Intelligence]], [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]], [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.Coverage]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]], [[docs/test/markdown-flavor-unit-spec#MF-U-012 - Obsidian Parser And Analysis|MF-U-012]]

Implementation plan: [[docs/plans/phase-24-obsidian-flavor-language-support]]

### Phase 25 — GitHub Flavored Markdown Language Support

Implement actual language support for `gfm`: pipe tables, task lists,
strikethrough, autolinks, GitHub-style heading anchors where practical, and
matching diagnostics, completions, folding, semantic tokens, and navigation.

Requirement links: [[docs/research/github-flavored-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-013 - GFM Parser And Analysis|MF-U-013]]

Implementation plan: [[docs/plans/phase-25-gfm-language-support]]

### Phase 26 — GitLab Flavored Markdown Language Support

Implement actual language support for `glfm`: the CommonMark/GFM baseline plus
GitLab-specific references, media behavior, and heading/link conventions that
can be modeled without GitLab service access.

Requirement links: [[docs/research/gitlab-flavored-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-014 - GLFM Parser And Analysis|MF-U-014]]

Implementation plan: [[docs/plans/phase-26-glfm-language-support]]

### Phase 27 — Pandoc Markdown Language Support

Implement practical local support for `pandoc`: metadata blocks, citations,
footnotes, math, attributes, fenced divs, definition lists, labels, and
cross-references without running Pandoc conversion.

Requirement links: [[docs/research/pandoc-markdown-deep-research-report]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-015 - Pandoc Markdown Parser And Analysis|MF-U-015]]

Implementation plan: [[docs/plans/phase-27-pandoc-markdown-language-support]]

### Phase 28 — MultiMarkdown Language Support

Implement actual language support for `multimarkdown`: metadata, tables,
footnotes, citations, labels, and document-production cross-references.

Requirement links: [[docs/research/multimarkdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-016 - MultiMarkdown Parser And Analysis|MF-U-016]]

Implementation plan: [[docs/plans/phase-28-multimarkdown-language-support]]

### Phase 29 — MDX Flavor Language Support

Implement practical local support for `mdx` as a Markdown flavor: JSX
expression/component regions, ESM awareness, and Markdown/JSX boundaries while
preserving manually selected VS Code `mdx` language mode.

Requirement links: [[docs/research/mdx-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]], [[docs/test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]]

Implementation plan: [[docs/plans/phase-29-mdx-flavor-language-support]]

### Phase 30 — kramdown Language Support

Implement actual language support for `kramdown`: block/span attributes,
definition lists, tables, math, footnotes, and IAL behavior.

Requirement links: [[docs/research/kramdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-018 - kramdown Parser And Analysis|MF-U-018]]

Implementation plan: [[docs/plans/phase-30-kramdown-language-support]]

### Phase 31 — Markdown Extra Language Support

Implement actual language support for `markdown-extra`: tables, definition
lists, footnotes, abbreviations, fenced code, and attribute blocks.

Requirement links: [[docs/research/markdown-extra-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-019 - Markdown Extra Parser And Analysis|MF-U-019]]

Implementation plan: [[docs/plans/phase-31-markdown-extra-language-support]]

### Phase 32 — R Markdown Language Support

Implement practical local support for `r-markdown`: YAML metadata, fenced chunk
syntax, chunk labels/options, folding, document symbols, and diagnostics without
executing code.

Requirement links: [[docs/research/r-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]]

Implementation plan: [[docs/plans/phase-32-r-markdown-language-support]]

### Phase 33 — Reddit Markdown Language Support

Implement practical local support for `reddit`: Reddit-specific syntax
awareness, escaping and line-break behavior, supported spoiler syntax, and
portability diagnostics without calling Reddit services.

Requirement links: [[docs/research/reddit-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-021 - Reddit Markdown Parser And Analysis|MF-U-021]]

Implementation plan: [[docs/plans/phase-33-reddit-markdown-language-support]]

### Phase 34 — Stack Overflow Markdown Language Support

Implement practical local support for `stack-overflow`: tag links, spoilers,
syntax highlighting hints, code fence behavior, GFM-style tables, and
question/answer versus comment-surface constraints.

Requirement links: [[docs/research/stack-overflow-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-022 - Stack Overflow Markdown Parser And Analysis|MF-U-022]]

Implementation plan: [[docs/plans/phase-34-stack-overflow-markdown-language-support]]

### Markdown Flavor LSP Surface Gate

Every Phase 22-34 dialect phase must satisfy or explicitly defer each required
surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] before
closeout:

- profile signature and parser dispatch;
- diagnostics and completion;
- definition, references, document links, document symbols, and folding;
- hover and semantic tokens;
- rename safety or a documented not-applicable/deferred disposition;
- host, conversion, renderer, bibliography, MDX/JSX, and execution boundaries;
- negative cross-flavor fixtures proving inactive syntax stays inactive.

Closeout chores for each dialect phase must update [[docs/test/index]],
[[docs/test/matrix]], relevant validation evidence, and the profile registry
whenever profile surfaces change.

### Server Improvement Continuation

| Phase | Primary Requirements |
|---|---|
| 14 | [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.SameDocumentAnchor]], [[docs/requirements/functional/ofmarkdown-parity#Parity.HeadingAmbiguity.Diagnostics]] |
| 15 | [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Intelligence]], [[docs/requirements/functional/embed-resolution#Embed.Resolution.ImageTarget]], [[docs/requirements/functional/hover#HV-002]] |
| 16 | [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]], [[docs/requirements/functional/security-vault-confinement#Security.Vault.RenameConfinement]], [[docs/requirements/functional/rename#Rename.StyleBinding.Consistency]] |
| 17 | [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.Coverage]], [[docs/requirements/functional/semantic-tokens#ST-002]], [[docs/requirements/technical/security-input-validation#Security.Input.PositionValidation]] |
| 18 | [[docs/requirements/functional/security-vault-confinement#Security.Vault.URISchemeAllowlist]], [[docs/requirements/technical/security-parser-safety#Security.Parser.YAMLLimits]], [[docs/requirements/technical/security-parser-safety#Security.Parser.VaultFileLimit]], [[docs/requirements/operational/security-supply-chain#Security.Supply.ExactPinning]] |
| 19 | [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]], [[docs/requirements/technical/security-parser-safety#Security.Parser.FlavorProfileResourceSafety]] |
| 20 | [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]], [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]], [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Parser.ProfileDispatch]], [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]], [[docs/requirements/technical/security-input-validation#Security.Input.ProjectConfigSafety]], [[docs/requirements/technical/security-input-validation#Security.Input.FlavorPropagationPayload]], [[docs/requirements/functional/security-vault-confinement#Security.Vault.ProjectConfigConfinement]], [[docs/test/markdown-flavor-unit-spec#MF-U-006 - Server Flavor Configuration Validation|MF-U-006]], [[docs/test/markdown-flavor-unit-spec#MF-U-007 - Flavor Change Refresh|MF-U-007]], [[docs/test/markdown-flavor-unit-spec#MF-U-008 - Auto Flavor Resolution|MF-U-008]], [[docs/test/markdown-flavor-integration-spec#MF-I-005|MF-I-005]], [[docs/test/markdown-flavor-integration-spec#MF-I-006 - Handler Refresh Coverage|MF-I-006]], [[docs/test/markdown-flavor-integration-spec#MF-I-007 - Resource-Specific Propagation|MF-I-007]], [[docs/test/markdown-flavor-integration-spec#MF-I-008 - Host Boundary Integration|MF-I-008]], [[docs/test/markdown-flavor-integration-spec#MF-I-009 - Flavor Security Input Validation|MF-I-009]] |
| 21 | [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownLanguage.PreserveDefault]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/functional/markdown-flavor-lsp]], [[docs/test/markdown-flavor-validation-spec]] |
| 22 | [[docs/research/commonmark-and-original-markdown]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]], [[docs/test/markdown-flavor-unit-spec#MF-U-010 - Original Markdown Parser And Analysis|MF-U-010]] |
| 23 | [[docs/research/commonmark-and-original-markdown]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-011 - CommonMark Parser And Analysis|MF-U-011]] |
| 24 | [[docs/ofm-spec/index]], [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]], [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Intelligence]], [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]], [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.Coverage]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-012 - Obsidian Parser And Analysis|MF-U-012]] |
| 25 | [[docs/research/github-flavored-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-013 - GFM Parser And Analysis|MF-U-013]] |
| 26 | [[docs/research/gitlab-flavored-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-014 - GLFM Parser And Analysis|MF-U-014]] |
| 27 | [[docs/research/pandoc-markdown-deep-research-report]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-015 - Pandoc Markdown Parser And Analysis|MF-U-015]] |
| 28 | [[docs/research/multimarkdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-016 - MultiMarkdown Parser And Analysis|MF-U-016]] |
| 29 | [[docs/research/mdx-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]], [[docs/test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]] |
| 30 | [[docs/research/kramdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-018 - kramdown Parser And Analysis|MF-U-018]] |
| 31 | [[docs/research/markdown-extra-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-019 - Markdown Extra Parser And Analysis|MF-U-019]] |
| 32 | [[docs/research/r-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]] |
| 33 | [[docs/research/reddit-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-021 - Reddit Markdown Parser And Analysis|MF-U-021]] |
| 34 | [[docs/research/stack-overflow-markdown-analysis]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/test/markdown-flavor-unit-spec#MF-U-022 - Stack Overflow Markdown Parser And Analysis|MF-U-022]] |

## VS Code Extension Phases (`feature/vs-code`)

Packaging flavor-grenade-lsp as a VS Code Marketplace extension with bundled platform-specific binaries. Design: [[docs/superpowers/specs/2026-04-21-vscode-extension-design]]. Distribution strategy: [[ADR015-platform-specific-vsix]].

### Extension Phase Table

| # | Phase Name | Status | Key Deliverable | Completed |
|---|---|---|---|---|
| R | Publishing Research | complete | Research report covering manifest, packaging, CI/CD, security | 2026-04-21 |
| E1 | Extension Scaffold | complete | `extension/` directory with `package.json`, `tsconfig.json`, esbuild config; `npm run build:extension` exits 0 | 2026-04-22 |
| E2 | LanguageClient Core | complete | `extension.ts` with binary resolution, `LanguageClient` config, activate/deactivate lifecycle; server spawns in Extension Development Host | 2026-04-22 |
| E3 | Status Bar & Commands | complete | Status bar widget showing vault state; 3 palette commands (restart, rebuild, output); config change watcher | 2026-04-22 |
| E4 | Packaging & Local Test | complete | `.vscodeignore`, Marketplace assets (README, CHANGELOG, LICENSE, icon); `vsce package` produces installable VSIX | 2026-04-22 |
| E5 | CI/CD Pipeline | complete | `extension-release.yml` with 7-target matrix build; tag-triggered publish via `VSCE_PAT` | 2026-04-22 |
| E6 | OFMarkdown Language Mode | complete | Dynamic `ofmarkdown` language id for vault/index documents; generic Markdown preserved | 2026-05-07 |
| E7 | Activation Precision And Startup Gating | complete | Vault-marker activation, command activation, and generic Markdown idle startup | 2026-05-07 |
| E8 | Command Bridges And Native Navigation | complete | VS Code-native references, follow-link, embed, backlink, outlink, and vault commands | 2026-05-07 |
| E9 | Extension Host Regression Harness | complete | Extension-host tests for activation, language mode, commands, status, and failure states | 2026-05-07 |
| E10 | Status UX And Troubleshooting | complete | Rich status tooltip, crash/error states, quick actions, and diagnostic collection | 2026-05-07 |
| E11 | Marketplace Evidence And Packaging Proof | complete | OFMarkdown screenshots, README proof, and packaged asset verification | 2026-05-07 |
| E12 | OFMarkdown Editor Contributions | complete | Snippets, keybindings, language configuration, and scoped contribution checks | 2026-05-07 |
| E13 | Workspace Environment Modes | complete | Restricted, virtual, WSL, SSH, Dev Container, and remote behavior verification | 2026-05-07 |
| E14 | Membership Refresh And Compatibility Guardrails | complete | Robust language-mode refresh plus client/server and package-target validation | 2026-05-07 |
| E15 | Markdown Flavor Selector And Settings | planned | Separate selector, settings schema, override persistence, auto detection, resource-aware server propagation, and stale unit-test retirement | — |
| E16 | Flavor-Scoped Contributions And Marketplace | planned | Editor contributions, activation/client-selector guards, stale current-doc ledger, and Marketplace proof align with Markdown flavor selection | — |
| E17 | Extension Flavor Host Verification | planned | Extension-host, CI, package-target, stale-scan, and validation evidence prove selector behavior | — |

### Extension Phase Details

> [!NOTE]
> E6, E12, and E14 remain historical completion records for the prior
> `ofmarkdown` language-mode implementation. ADR020 and phases E15-E17 define
> the current target behavior: keep `.md` files in VS Code's built-in
> `markdown` mode and represent dialect choice as Markdown flavor state.

#### Phase R — Publishing Research

Research report covering VS Code extension manifest requirements, VSIX packaging, PAT-based publisher identity, CI/CD automation with `@vscode/vsce`, security model, and Marketplace policy. Used to inform the extension design spec and ADR015.

Reference: [[docs/research/vscode-extension-publishing]]

#### Phase E1 — Extension Scaffold

Create the `extension/` directory at the repo root with its own `package.json` (extension manifest with identity, activation events, contributes, configuration), `tsconfig.json` (Node16 target for VS Code extension host), and esbuild bundling. Stub `extension.ts` exports empty `activate`/`deactivate`. Gate: `npm run build:extension` produces `dist/extension.js`.

Implementation plan: [[docs/plans/phase-E1-extension-scaffold]]

#### Phase E2 — LanguageClient Core

Implement server command resolution (user setting → development `dist/main.js` → packaged `server/main.js`). Configure `LanguageClient` v9.x with Executable ServerOptions over stdio. Wire `activate()` and `deactivate()` lifecycle. Gate: extension activates and spawns the server in VS Code Extension Development Host; LSP initialization handshake succeeds.

Implementation plan: [[docs/plans/phase-E2-languageclient-core]]

#### Phase E3 — Status Bar & Commands

Add status bar widget listening to the `flavorGrenade/status` custom notification (initializing → indexing → ready → error). Register three palette commands: Restart Server (`client.restart()`), Rebuild Index (`workspace/executeCommand`), Show Output (`outputChannel.show()`). Add `onDidChangeConfiguration` watcher to restart on `server.path` changes. Gate: commands appear in palette; status bar reflects server state transitions.

Implementation plan: [[docs/plans/phase-E3-status-bar-commands]]

#### Phase E4 — Packaging & Local Test

Add Marketplace assets (`README.md`, `CHANGELOG.md`, `LICENSE`, 256×256 PNG icon). Package with `vsce package` for host platform. Verify VSIX contents (only `dist/`, `server/`, manifest, and assets ship). Install locally and smoke test: completions, diagnostics, commands, status bar. Gate: `vsce package` produces installable VSIX; manual test passes end-to-end.

Implementation plan: [[docs/plans/phase-E4-packaging-local-test]]

#### Phase E5 — CI/CD Pipeline

Create `extension-release.yml` workflow triggered by `ext-v*` tags. The current workflow builds the client and bundled `server/main.js`, packages one Marketplace VSIX, verifies package contents and checksums, attests provenance, smoke-tests the bundled JS server, and publishes in a gated job. Gate: release, package-target, host, asset, provenance, and smoke-test checks pass on tag push.

Implementation plan: [[docs/plans/phase-E5-ci-cd-pipeline]]

#### Phase E6 — OFMarkdown Language Mode

Add a VS Code language id `ofmarkdown` displayed as **OFMarkdown**. The extension keeps generic `.md` files in the built-in `markdown` mode, then dynamically promotes only documents that Flavor Grenade detects as part of an Obsidian vault or present in the server index. The LanguageClient serves both `markdown` and `ofmarkdown` documents, and promotion uses loop guards because VS Code reopens documents when changing language ids. Gate: extension tests and manual smoke tests prove vault/index documents promote, generic Markdown remains Markdown, manual language choices are preserved, and Markdown highlighting still works.

Implementation plan: [[docs/plans/phase-E6-ofmarkdown-language-mode]]

#### Phase E7 — Activation Precision And Startup Gating

Match Marksman VSCode's project-scoped activation while using OFMarkdown-native
workspace signals. The extension activates for `.obsidian/`, `.fgignore`,
`.fgattributes`, `markdown`, `ofmarkdown`, and explicit commands, but it
defers vault work until a positive vault signal exists. Gate: extension-host
fixtures prove vault workspaces activate, generic Markdown remains idle, and
commands can still wake the extension intentionally.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.VaultPrecision]], [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.MarkerEvents]]

Implementation plan: [[docs/plans/phase-E7-activation-precision]]

#### Phase E8 — Command Bridges And Native Navigation

Add VS Code command bridges equivalent to Marksman's show-references and
follow-link bridge, then extend them for OFMarkdown graph actions. Bridges
validate JSON-serializable payloads and adapt server locations into native VS
Code UI. Gate: bridge commands register, validate payloads, and invoke the
expected VS Code action without leaking VS Code types into the server.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.NativeUI]], [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.PayloadValidation]], [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.GraphActions]]

Implementation plan: [[docs/plans/phase-E8-command-bridges-native-navigation]]

#### Phase E9 — Extension Host Regression Harness

Build the extension-host test harness needed to keep the VS Code integration
stable. Coverage includes activation, language-mode promotion, command
registration, status transitions, custom server path failures, and command
bridge validation. Gate: extension tests run in CI and cover every required
behavior group.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Tests.HostCoverage]], [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.PayloadValidation]]

Historical trace: the retired language-mode membership-refresh requirement is
superseded by [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]].

Implementation plan: [[docs/plans/phase-E9-extension-host-regression-harness]]

#### Phase E10 — Status UX And Troubleshooting

Upgrade the status bar from a state indicator into an operational recovery
surface. Add rich tooltip fields, disabled/error/crash states, quick actions,
and diagnostic collection for support. Gate: known server and workspace states
have accurate status text, useful tooltip detail, and at least one applicable
action.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Status.Diagnostics]], [[docs/requirements/functional/vscode-extension-parity#Extension.Status.QuickActions]]

Implementation plan: [[docs/plans/phase-E10-status-ux-troubleshooting]]

#### Phase E11 — Marketplace Evidence And Packaging Proof

Match Marksman's screenshot-backed Marketplace proof with OFMarkdown-specific
visuals and package checks. Add README visuals for language mode, completions,
embeds, tags, callouts, code lens, and status, then prove referenced assets ship
inside VSIX output. Gate: required visuals are present, referenced, and packaged.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.OFMProof]], [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.AssetPackaging]]

Implementation plan: [[docs/plans/phase-E11-marketplace-evidence-packaging-proof]]

#### Phase E12 — OFMarkdown Editor Contributions

Use the `ofmarkdown` language id for editor affordances that should not affect
generic Markdown. Add snippets, scoped keybindings, language configuration
refinements, and contribution scoping tests. Gate: OFMarkdown contributions
appear only in intended language or command contexts.

Historical trace: retired `ofmarkdown` contribution scoping is superseded by
[[docs/requirements/functional/vscode-extension-parity#Extension.Contributions.FlavorScoped]].

Implementation plan: [[docs/plans/phase-E12-ofmarkdown-editor-contributions]]

#### Phase E13 — Workspace Environment Modes

Make restricted, virtual, local, WSL, SSH, Dev Container, and remote extension
host behavior explicit and verifiable. Gate: unsupported modes do not spawn the
server and supported remote modes resolve the correct platform-specific binary.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]], [[docs/requirements/functional/vscode-extension-parity#Extension.Status.Diagnostics]]

Implementation plan: [[docs/plans/phase-E13-workspace-environment-modes]]

#### Phase E14 — Membership Refresh And Compatibility Guardrails

Harden long-running sessions and platform packages. Refresh language-mode
membership after server readiness, rebuilds, workspace folder changes, visible
editor changes, and file opens. Add client/server version checks and VSIX target
validation so bundled binaries stay aligned with the extension. Gate: refresh
triggers assign the correct language mode and packaged VSIX checks catch target
or version mismatches.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]], [[docs/requirements/functional/vscode-extension-parity#Extension.Packaging.ServerModuleValidation]]

Historical trace: the retired language-mode membership-refresh requirement is
superseded by [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]].

Implementation plan: [[docs/plans/phase-E14-membership-refresh-compatibility-guardrails]]

#### Phase E15 — Markdown Flavor Selector And Settings

Replace the retired language-mode promotion design with a separate Markdown
flavor selector backed by `.fgattributes`. This phase keeps `.md` documents in
VS Code's built-in `markdown` language mode, resolves Auto Detect when
configuration is absent, reset, or explicitly set to `auto`, persists overrides
to selected-file or directory scope in `.fgattributes`, and propagates
resource-specific effective flavor to the server using
[[docs/design/markdown-flavor-auto-detection]]. E15 also
owns stale unit-test blockers for the old language-mode promotion path.

Requirement links: [[docs/design/markdown-flavor-auto-detection]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownLanguage.PreserveDefault]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.Selector]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.OverridePersistence]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]]

Test trace: [EXT-MF-U-001 through EXT-MF-U-014](../extension/docs/tests/markdown-flavor-unit-spec.md), plus [EXT-MF-I-004, EXT-MF-I-008, and EXT-MF-I-009](../extension/docs/tests/markdown-flavor-integration-spec.md) for rebuild-triggered refresh, outbound payload shape, and server-unavailable replay/recompute after selector overrides. Selector persistence writes `.fgattributes`; client-to-server propagation uses watched `.fgignore` and `.fgattributes` changes plus any documented resource-specific status refresh contract.

Implementation plan: [[docs/plans/phase-E15-markdown-flavor-selector-settings]]

#### Phase E16 — Flavor-Scoped Contributions And Marketplace

Move extension contributions and Marketplace proof from the historical
`ofmarkdown` language-mode story to the Markdown flavor selector model. This
phase updates activation for selector interaction, rewrites snippets,
keybindings, and language configuration around flavor/context scoping, and
updates README, troubleshooting, visuals, Marketplace asset verification, and
activation/client-selector guard evidence. `EXT-MF-I-006` is reserved for VSIX
asset proof; activation and client document-selector proof use `EXT-MF-I-007`.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.MarkerEvents]], [[docs/requirements/functional/vscode-extension-parity#Extension.Contributions.FlavorScoped]], [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.OFMProof]], [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.AssetPackaging]]

Test trace: [EXT-MF-I-001 through EXT-MF-I-003, EXT-MF-I-005, EXT-MF-I-006, and EXT-MF-I-007](../extension/docs/tests/markdown-flavor-integration-spec.md), plus [EXT-MF-C-001 through EXT-MF-C-006](../extension/docs/tests/markdown-flavor-unit-spec.md).

Implementation plan: [[docs/plans/phase-E16-flavor-scoped-contributions-marketplace]]

#### Phase E17 — Extension Flavor Host Verification

Close the extension host, verification, and validation gaps. This phase adds a
VS Code host suite for selector behavior, settings scope, Auto reset, generic
CommonMark fallback, Obsidian auto-detection, and manual-language safety. It
also retires stale language-mode host expectations and updates root plus
extension traceability matrices. E17 also records package-target evidence,
selector behavior in restricted/virtual/remote contexts, and the stale
`ofmarkdown` expectation scan required before validation signoff.

Requirement links: [[docs/requirements/functional/vscode-extension-parity#Extension.Tests.HostCoverage]], [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]], [[docs/requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]], [[docs/requirements/functional/vscode-extension-parity#Extension.Packaging.ServerModuleValidation]], [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]], [extension markdown flavor e2e spec](../extension/docs/tests/markdown-flavor-e2e-spec.md), [extension markdown flavor verification spec](../extension/docs/tests/markdown-flavor-verification-spec.md), [extension markdown flavor validation spec](../extension/docs/tests/markdown-flavor-validation-spec.md)

Implementation plan: [[docs/plans/phase-E17-extension-flavor-host-verification]]

### Extension Phase Dependencies

```text
Phase R ──► Phase E1 ──► Phase E2 ──► Phase E3
                                          │
                                       Phase E4 ──► Phase E5 ──► Phase E6
                                                                  │
                                                                  ▼
                                      Phase E7 ──► Phase E8 ──► Phase E9
                                                                  │
                                                                  ▼
                                     Phase E10 ─► Phase E11 ─► Phase E12
                                                                  │
                                                                  ▼
                                                Phase E13 ───► Phase E14 ──► Phase E15 ──► Phase E16 ──► Phase E17
```

Phases are mostly sequential. E3 requires E2's `LanguageClient` to wire
commands and status bar into. E4 requires E3 to have a complete extension for
packaging. E5 requires E4 to have verified local packaging. E6 requires E2/E3
client lifecycle and command surfaces. E7 requires E6 language-mode behavior so
startup gates can reason about `markdown` and `ofmarkdown`. E8 depends on E7's
activation contract. E9 follows E8 so the host harness can lock command bridge
behavior. E10-E14 then harden user-facing status, Marketplace proof, editor
contributions, workspace environments, and compatibility guardrails.
E15-E17 are new Markdown flavor gap-closure phases. E15 depends on the
server-side flavor model from Phase 19 and the resource-aware propagation plus
non-local boundary contract from Phase 20 because the selector must send
effective flavor changes without turning host/conversion references into local
vault edits. E17 depends on E16, Phase 20, and the E13/E14
environment/package guardrails because host verification needs selector UI,
server propagation, remote/restricted context behavior, and package-target
evidence.

## Website Phases (`website/`)

The website phases build and publish the public documentation site that explains
the LSP server, VS Code extension, and OFMarkdown concepts. These phases are
tracked separately because their gates run from `website/` and include website
build, content, accessibility, and publishing checks.

### Website Phase Table

| # | Phase Name | Status | Key Deliverable | Completed |
|---|---|---|---|---|
| W1 | Website Foundation And Toolchain | complete | Website dev, typecheck, lint, test, and build scripts pass from `website/` | 2026-05-09 |
| W2 | Content Pipeline And SEO Skeleton | complete | Static pages build with typed routes, metadata, sitemap, robots, and SEO checks | 2026-05-09 |
| W3 | Homepage And Design System | complete | Homepage, theme modes, responsive shell, product assets, and footer pass tests and visual smoke checks | 2026-05-09 |
| W4 | Documentation Pages And LLM Wiki | complete | Quickstart, how-to, advanced usage, FAQ, and concept wiki pages build and pass content checks | 2026-05-09 |
| W5 | Website CI And Pages Release | complete | Website CI and Pages release automation pass PR CI; production release execution was cancelled | 2026-05-09 |
| W6 | Website Review Polish | complete | Browser-reviewed homepage visual feedback is implemented, tested, and verified on mobile and desktop | 2026-05-09 |
| W7 | Website Guide Prose And Article Hubs | complete | How-to, concept, and advanced article pages build with dropdown navigation, linked hub pages, concrete prose, and asset evidence | 2026-05-09 |
| W8 | Commonloom Content Pipeline | complete | Markdown copy pipeline consumes the external `commonloom` package; local Commonloom source is removed and PR #65 CI passed | 2026-05-12 |

### Website Phase Details

#### Phase W1 — Website Foundation And Toolchain

Create the Svelte/Vite website workspace with local development, lint,
typecheck, test, and production build gates.

Implementation plan: [[docs/plans/phase-W1-website-foundation]]

#### Phase W2 — Content Pipeline And SEO Skeleton

Add typed page metadata, route inventory, sitemap, robots, SEO checks, and the
initial public content skeleton.

Implementation plan: [[docs/plans/phase-W2-content-pipeline-seo]]

#### Phase W3 — Homepage And Design System

Implement the public homepage, responsive shell, theme modes, product identity
assets, and footer attribution system.

Implementation plan: [[docs/plans/phase-W3-homepage-design-system]]

#### Phase W4 — Documentation Pages And LLM Wiki

Build the core documentation pages, FAQ, public concepts, and LLM-readable wiki
surface.

Implementation plan: [[docs/plans/phase-W4-docs-llm-wiki]]

#### Phase W5 — Website CI And Pages Release

Wire tag-triggered GitHub Pages deployment from `main` with CI gates, ancestry
guardrails, and release evidence. The actual production release tag was
cancelled by human instruction, so W5 closes on implemented automation and PR
CI evidence rather than a pushed release.

Implementation plan: [[docs/plans/phase-W5-website-ci-release]]

#### Phase W6 — Website Review Polish

Apply browser-review feedback to homepage visual quality, responsive behavior,
and production polish.

Implementation plan: [[docs/plans/phase-W6-website-review-polish]]

#### Phase W7 — Website Guide Prose And Article Hubs

Expand the guide surface into linked how-to, concept, and advanced-usage article
hubs with deeper prose, dropdown navigation, and asset evidence.

Implementation plan: [[docs/plans/phase-W7-website-guide-prose]]

#### Phase W8 — Commonloom Content Pipeline

Replace the hard-to-maintain `website/src/content` TypeScript copy modules with
a Markdown-first authoring pipeline. Phase W8 introduces `website/src/content/copy`
Markdown documents, one typed manifest per page group, `website/src/content/media`
assets, git-ignored generated TypeScript records in `website/src/content/generated`,
and the external `commonloom` package for reusable Markdown compilation. The
website keeps only Flavor Grenade-specific adapter code; it must not maintain
`website/src/content/pipeline/commonloom` as local source.

Requirement links: [website ADR 0002](../website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy.md), [website content pipeline](../website/docs/architecture/content-pipeline.md), [website source layout requirements](../website/docs/requirements/technical/source-layout-and-documentation.md), [W8 content pipeline research](../website/docs/research/w8-content-pipeline-technology-research.md)

Implementation plan: [[docs/plans/phase-W8-commonloom-content-pipeline]]

### Website Phase Dependencies

```text
Phase E14 ──► Phase W1 ──► Phase W2 ──► Phase W3 ──► Phase W4 ──► Phase W5 ──► Phase W6 ──► Phase W7 ──► Phase W8
```

W8 depends on W7 because it migrates existing article hubs and page content into
Markdown copy files while preserving public routes, metadata, sitemap coverage,
and rendering behavior.

## Feature Backlog (Post-v1)

These features are out of scope for the initial release. Recorded to avoid scope creep.

| Feature | Notes |
|---|---|
| HTTP+SSE transport | Reserved per [[ADR001-stdio-transport]]; requires separate server startup path |
| Dataview passthrough | Dataview query blocks detected but treated as opaque; no query evaluation |
| Templater completion | Templater expression `<% %>` nodes detected; completions deferred |
| Incremental sync default | Currently opt-in; may become default after editor compatibility data is gathered |
| Multi-root workspace | Multiple vault roots in a single LSP session; requires session-level isolation |
| Remote vault (HTTP) | Vault files fetched over HTTP (e.g., Obsidian Sync API); requires async file access |
| Dataview schema | Infer field names from Dataview queries for frontmatter key completion |

## Related

- [[docs/index]]
- [[AGENTS]]
- [[docs/architecture/overview]]
- [[docs/adr/ADR001-stdio-transport]]
- [[docs/adr/ADR003-vault-detection]]
- [[docs/adr/ADR004-text-sync-strategy]]
- [[docs/adr/ADR005-wiki-style-binding]]
- [[docs/adr/ADR006-block-ref-indexing]]
- [[docs/adr/ADR015-platform-specific-vsix]]
- [[docs/adr/ADR016-ofmarkdown-language-mode]]
- [[docs/adr/ADR017-standard-markdown-link-intelligence]]
- [[docs/adr/ADR018-vault-file-operation-refactoring]]
- [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]]
- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/superpowers/specs/2026-04-21-vscode-extension-design]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]
- [[docs/design/behavior-layer]]
- [[docs/research/vscode-extension-publishing]]
