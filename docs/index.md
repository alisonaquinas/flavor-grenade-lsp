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

`^blockid` anchors are indexed as `BlockAnchorDef` entries in `OFMIndex`. `[[doc#^id]]` cross-references are tracked as `CrossBlock` refs in `RefGraph`. This enables: FG005 (broken block ref) diagnostics, go-to-definition on `[[doc#^id]]`, find-references for any `^blockid`, completion of known block ids after `[[doc#^`, and "N references" code lens above each anchor. See [[ADR006-block-ref-indexing]] and [[features/completions]].

### Embed Resolution

`![[target]]` embeds are resolved against the vault index. Broken embeds raise FG004 diagnostics. Hover on an embed shows file type and, for `.md` embeds, the first paragraph of the target document. See [[features/hover]] and [[features/diagnostics]].

### Alias-Aware Document Resolution

When a document's YAML frontmatter contains `aliases: [...]`, all aliases are indexed as alternative names for that document. A wiki-link `[[alias text]]` resolves to the document that declares that alias. Alias resolution participates in completions, diagnostics, go-to-definition, and rename. See [[ddd/reference-resolution/domain-model]].

### Callout Type Completion

Typing `> [!` inside a blockquote triggers a completion list of all 23 standard Obsidian callout types (NOTE, TIP, WARNING, DANGER, INFO, SUCCESS, QUESTION, FAILURE, EXAMPLE, QUOTE, and more). See [[features/completions]].

### Tag Hierarchy Awareness

Tags are indexed with their full hierarchical path. A tag `#project/active` is discoverable as both `project` and `project/active`. Completion offers the full hierarchy. Find-references for `#project` includes all uses of `#project/*` sub-tags. See [[features/completions]] and [[features/navigation]].

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Framework | [NestJS](https://nestjs.com) |
| Language | TypeScript (strict mode) |
| LSP version | 3.17 |
| Transport | stdio JSON-RPC (see [[ADR001-stdio-transport]]) |
| Configuration | `.flavor-grenade.toml` |
| Vault detection | `.obsidian/` or `.flavor-grenade.toml` (see [[ADR003-vault-detection]]) |

## Project Status

**Documentation phase — pre-implementation.**

All documentation layers are being written before any TypeScript implementation files are created. The implementation order is defined in [[AGENTS]]. No `src/` files exist yet. The specification, domain model, architecture, ADRs, concepts, design, requirements, BDD scenarios, features, and plans must all be complete before implementation begins.

## Navigation

| Section | Description |
|---|---|
| [[ofm-spec/index]] | Normative OFM language specification with rule codes |
| [[ddd/bounded-contexts]] | Bounded context map and domain model overview |
| [[ddd/ubiquitous-language]] | Canonical vocabulary used throughout all docs |
| [[architecture/overview]] | System architecture, component diagram, layering |
| [[adr/ADR001-stdio-transport]] | Transport decision |
| [[adr/ADR002-ofm-only-scope]] | Scope decision |
| [[adr/ADR003-vault-detection]] | Vault detection decision |
| [[adr/ADR004-text-sync-strategy]] | Text sync decision |
| [[adr/ADR005-wiki-style-binding]] | Wiki-link completion style decision |
| [[adr/ADR006-block-ref-indexing]] | Block reference indexing decision |
| [[concepts/workspace-model]] | Vault, single-file mode, DocId, FolderLookup |
| [[concepts/symbol-model]] | Def, Ref, RefGraph, OFMIndex |
| [[requirements/workspace]] | Workspace requirements (Planguage) |
| [[requirements/wiki-link-resolution]] | Wiki-link requirements |
| [[requirements/block-references]] | Block reference requirements |
| [[features/completions]] | Completion provider specification |
| [[features/diagnostics]] | Diagnostic rules table |
| [[features/navigation]] | Go-to-def and find-references |
| [[features/rename]] | Rename refactoring |
| [[features/symbols]] | Document and workspace symbols |
| [[features/code-actions]] | TOC, create-missing-file, tag-to-yaml |
| [[features/code-lens]] | "N references" code lens |
| [[features/hover]] | Hover information |
| [[features/semantic-tokens]] | Semantic token types table |
| [[roadmap]] | Phase-by-phase feature roadmap |
| [[AGENTS]] | AI agent guidance for this repository |

> [!NOTE]
> All wikilinks in this documentation use `[[target]]` syntax. Cross-references are authoritative — if a linked document does not exist, it is a documentation gap that must be filled before implementation begins.
