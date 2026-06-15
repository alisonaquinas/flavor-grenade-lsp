---
title: flavor-grenade-lsp — Project Overview
tags: [project, overview, lsp, ofm]
aliases: [flavor-grenade overview, fg-lsp index]
---

# flavor-grenade-lsp

> A Language Server Protocol server exclusively for **Obsidian Flavored Markdown**, built with NestJS + Bun + TypeScript.

## What is flavor-grenade-lsp?

flavor-grenade-lsp is an LSP 3.17–compliant language server that brings first-class editor intelligence to Obsidian Flavored Markdown (OFM) documents. It speaks JSON-RPC over stdio — the same transport used by marksman, rust-analyzer, and clangd — so it works immediately in any LSP-capable editor: Neovim, Helix, VS Code, Zed, Emacs (lsp-mode / eglot), and Sublime Text LSP.

The server targets OFM exclusively. It does not attempt to serve as a generic Markdown LSP and does not ship a CommonMark-only fallback. Every feature — diagnostics, completions, navigation, rename, code actions — is designed around OFM semantics from the ground up.

## Why does it exist?

[marksman](https://github.com/artempyanykh/marksman) is the closest prior art. It targets CommonMark + wiki-links and does an excellent job within that scope. However, OFM introduces a set of constructs that marksman explicitly does not support:

| OFM Feature | marksman | flavor-grenade-lsp |
|---|---|---|
| Wiki-links `[[Note]]` | Partial | Full |
| Embedded files `![[img.png]]` | No | Full |
| Block references `^blockid` | No | First-class |
| Callouts `> [!NOTE]` | No | Full |
| Tag hierarchy `#project/active` | No | Full |
| Alias resolution (`aliases:` YAML key) | No | Full |
| Obsidian comments `%% ... %%` | No | Semantic tokens |
| Math blocks `$$...$$` | No | Semantic tokens |
| Frontmatter special keys | No | Hover + diagnostics |

flavor-grenade-lsp closes this gap by building an OFM-exclusive parse pipeline on top of a dedicated OFM specification (`ofm-spec/`), a domain model (`ddd/`), and a full feature layer (`features/`).

## Key Differentiators

### OFM-Exclusive Parse Pipeline

The parser recognises every OFM construct natively. There is no CommonMark base layer patched with OFM overlays — the grammar is written for OFM from the start. This makes diagnostic rules, completion triggers, and navigation targets unambiguous across the full language surface.

### Block Reference Indexing (First-Class)

`^blockid` anchors are indexed as `BlockAnchorDef` entries in `OFMIndex`. `[[doc#^id]]` cross-references are tracked as `CrossBlock` refs in `RefGraph`. This enables: FG005 (broken block ref) diagnostics, go-to-definition on `[[doc#^id]]`, find-references for any `^blockid`, completion of known block ids after `[[doc#^`, and "N references" code lens above each anchor. See [[ADR006-block-ref-indexing]] and [[docs/features/completions]].

### Embed Resolution

`![[target]]` embeds are resolved against the vault index. Broken embeds raise FG004 diagnostics. Hover on an embed shows file type and, for `.md` embeds, the first paragraph of the target document. See [[docs/features/hover]] and [[docs/features/diagnostics]].

### Alias-Aware Document Resolution

When a document's YAML frontmatter contains `aliases: [...]`, all aliases are indexed as alternative names for that document. A wiki-link `[[alias text]]` resolves to the document that declares that alias. Alias resolution participates in completions, diagnostics, go-to-definition, and rename. See [[docs/ddd/reference-resolution/domain-model]].

### Callout Type Completion

Typing `> [!` inside a blockquote triggers a completion list of the 13 primary Obsidian callout types. Aliases are accepted by the parser, but completion emits only the primary names. See [[docs/features/completions]].

### Tag Hierarchy Awareness

Tags are indexed with their full hierarchical path. A tag `#project/active` is discoverable as both `project` and `project/active`. Completion offers the full hierarchy. Find-references for `#project` includes all uses of `#project/*` sub-tags. See [[docs/features/completions]] and [[docs/features/navigation]].

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Framework | [NestJS](https://nestjs.com) |
| Language | TypeScript (strict mode) |
| LSP version | 3.17 |
| Transport | stdio JSON-RPC (see [[ADR001-stdio-transport]]) |
| Configuration | `.mdfignore` for Flavor Grenade visibility; `.mdfattributes` for file/directory flavor and structured profile attributes |
| Vault detection | `.obsidian/` or Markdown flavor config-file context (`.mdfignore` / `.mdfattributes`) |

## Project Status

**Implementation phase — server parity continuation.**

The server and VS Code extension are implemented and are now being hardened
through phase-by-phase parity work. Server phases 14-16 are complete, Phase 17
is in progress, and extension parity continuation phases E7-E14 are planned in
[[roadmap]].

## Navigation

| Section | Description |
|---|---|
| [[docs/ofm-spec/index]] | Normative OFM language specification with rule codes |
| [[docs/ofm-spec/markdown-links]] | Standard Markdown local link rules inside OFMarkdown |
| [[docs/ddd/bounded-contexts]] | Bounded context map and domain model overview |
| [[docs/ddd/ubiquitous-language]] | Canonical vocabulary used throughout all docs |
| [[docs/architecture/overview]] | System architecture, component diagram, layering |
| [[docs/adr/ADR001-stdio-transport]] | Transport decision |
| [[docs/adr/ADR002-ofm-only-scope]] | Scope decision |
| [[docs/adr/ADR003-vault-detection]] | Vault detection decision |
| [[docs/adr/ADR004-text-sync-strategy]] | Text sync decision |
| [[docs/adr/ADR005-wiki-style-binding]] | Wiki-link completion style decision |
| [[docs/adr/ADR006-block-ref-indexing]] | Block reference indexing decision |
| [[docs/adr/ADR007-git-flow-branching]] | git-flow branching strategy decision |
| [[docs/adr/ADR008-oidc-publishing]] | OIDC trusted publishing decision |
| [[docs/adr/ADR009-precommit-hooks-zero-warnings]] | Pre-commit hooks zero warnings decision |
| [[docs/adr/ADR010-tests-directory-structure]] | Tests directory structure decision |
| [[docs/adr/ADR011-one-class-per-file-namespaces]] | One class per file namespaces decision |
| [[docs/adr/ADR012-parser-safety-policy]] | Parser safety policy decision |
| [[docs/adr/ADR013-vault-root-confinement]] | Vault root confinement decision |
| [[docs/adr/ADR014-dependency-security-policy]] | Dependency security policy decision |
| [[docs/adr/ADR015-platform-specific-vsix]] | Platform-specific VSIX distribution decision |
| [[docs/adr/ADR020-markdown-flavor-selection]] | Markdown flavor selector decision |
| [[docs/adr/ADR021-mdfignore-mdfattributes-flavor-configuration]] | Git-style `.mdfignore` and `.mdfattributes` configuration decision |
| [[docs/concepts/workspace-model]] | Vault, single-file mode, DocId, FolderLookup |
| [[docs/concepts/symbol-model]] | Def, Ref, RefGraph, OFMIndex |
| [[docs/requirements/functional/workspace]] | Workspace requirements (Planguage) |
| [[docs/requirements/functional/wiki-link-resolution]] | Wiki-link requirements |
| [[docs/requirements/functional/block-references]] | Block reference requirements |
| [[docs/features/completions]] | Completion provider specification |
| [[docs/features/diagnostics]] | Diagnostic rules table |
| [[docs/features/navigation]] | Go-to-def and find-references |
| [[docs/features/rename]] | Rename refactoring |
| [[docs/features/symbols]] | Document and workspace symbols |
| [[docs/features/code-actions]] | TOC, create-missing-file, tag-to-yaml |
| [[docs/features/code-lens]] | "N references" code lens |
| [[docs/features/hover]] | Hover information |
| [[docs/features/semantic-tokens]] | Semantic token types table |
| [[docs/features/ofmarkdown-language-mode]] | VS Code Markdown flavor selector |
| [[docs/features/markdown-flavor-config-files]] | Git-style Markdown flavor configuration files |
| [[docs/features/ofmarkdown-parity-roadmap]] | Marksman-inspired OFMarkdown server parity roadmap |
| [[docs/features/vscode-extension-parity]] | Marksman VSCode-inspired extension parity roadmap |
| [[docs/requirements/index]] | Master Planguage requirements index |
| [[docs/requirements/functional/ofmarkdown-parity]] | Server-side OFMarkdown parity functional requirements |
| [[docs/requirements/functional/vscode-extension-parity]] | VS Code extension parity functional requirements |
| [[docs/design/markdown-flavor-auto-detection]] | Effective Markdown flavor auto-detection algorithm |
| [[docs/design/behavior-layer]] | Behavior layer design |
| [[docs/design/domain-layer]] | Domain layer design |
| [[docs/ddd/editor-client/domain-model]] | Editor Client bounded context (BC6) domain model |
| [[roadmap]] | Phase-by-phase feature roadmap |
| [[AGENTS]] | AI agent guidance for this repository |

### Research

| Document | Description |
|---|---|
| [[docs/research/vscode-extension-publishing]] | VS Code extension publishing research |
| [[docs/research/security-threat-model]] | Security threat model research |
| [[docs/research/marksman-feature-parity-ofmarkdown]] | Marksman parity research for OFMarkdown features |
| [[docs/research/marksman-vscode-feature-parity-ofmarkdown]] | Marksman VSCode parity research for OFMarkdown extension features |

### Parity Plans

| Document | Description |
|---|---|
| [[docs/plans/phase-14-markdown-link-intelligence]] | Standard Markdown local link intelligence plan |
| [[docs/plans/phase-15-attachment-intelligence]] | Attachment intelligence plan |
| [[docs/plans/phase-16-vault-file-operation-refactors]] | Vault file operation refactor plan |
| [[docs/plans/phase-17-structural-lsp-capabilities]] | Structural LSP capabilities plan |
| [[docs/plans/phase-E7-vscode-extension-parity]] | VS Code extension parity split-phase index |
| [[docs/plans/phase-E7-activation-precision]] | Extension activation precision and startup gating plan |
| [[docs/plans/phase-E8-command-bridges-native-navigation]] | Extension command bridge and native navigation plan |
| [[docs/plans/phase-E9-extension-host-regression-harness]] | Extension-host regression harness plan |
| [[docs/plans/phase-E10-status-ux-troubleshooting]] | Extension status UX and troubleshooting plan |
| [[docs/plans/phase-E11-marketplace-evidence-packaging-proof]] | Extension Marketplace evidence and package proof plan |
| [[docs/plans/phase-E12-ofmarkdown-editor-contributions]] | OFMarkdown editor contribution plan |
| [[docs/plans/phase-E13-workspace-environment-modes]] | Workspace environment behavior plan |
| [[docs/plans/phase-E14-membership-refresh-compatibility-guardrails]] | Membership refresh and compatibility guardrail plan |
| `extension/docs/index.md` | Extension-local parity specification mirror |

### Extension

| Document | Description |
|---|---|
| [[docs/superpowers/specs/2026-04-21-vscode-extension-design]] | VS Code extension design spec |

> [!NOTE]
> All wikilinks in this documentation use `[[target]]` syntax. Cross-references are authoritative — if a linked document does not exist, it is a documentation gap that must be filled before implementation begins.
