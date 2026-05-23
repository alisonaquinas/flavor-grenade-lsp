---
title: Functional Requirements Index
tags:
  - requirements/functional
aliases:
  - Functional Requirements
---

# Functional Requirements

Functional requirements describe product behavior visible through the language
server, VS Code extension, and supported Markdown authoring workflows.

Use this folder when a change affects what a user or LSP client can observe:
diagnostics, navigation, completion, rename, semantic tokens, code actions,
vault membership, flavor-specific Markdown behavior, or extension behavior that
is part of the product contract.

## Layer Boundary

Functional requirements define externally visible behavior. They should state
the user-visible goal, measurable target, and verification evidence without
repeating implementation details from the technical layer. Security requirements
that change visible behavior, such as rejecting vault-escaping links or hiding
absolute paths, live here with a `security-` prefix and link back to the
cross-cutting security index.

## Maintenance Rules

- Add a file here when a new feature or user-facing capability needs its own
  requirement set.
- Keep every requirement tag traceable from [[docs/test/matrix]] before a
  feature is considered complete.
- Move implementation-only constraints to [[docs/requirements/technical/index]]
  and CI or release controls to [[docs/requirements/operational/index]].
- Prefer links to existing feature, DDD, and test docs over duplicating long
  explanations.

## Files

| File | Scope |
|---|---|
| [[block-references]] | Block anchors, block references, and block completion |
| [[code-actions]] | LSP code actions and command execution contracts |
| [[completions]] | Completion triggers, candidates, and style binding |
| [[diagnostics]] | Diagnostic severity, codes, latency, and related information |
| [[embed-resolution]] | Obsidian embed resolution and embed diagnostics |
| [[hover]] | Hover content for notes and embeds |
| [[markdown-flavor-lsp]] | Markdown flavor profile behavior in the language server |
| [[navigation]] | Definition, references, highlights, symbols, and navigation |
| [[ofmarkdown-language-mode]] | Markdown language mode and flavor selector behavior |
| [[ofmarkdown-parity]] | Standard Markdown parity with OFMarkdown intelligence |
| [[rename]] | Rename preparation and workspace edits |
| [[security-information-disclosure]] | Functional information-disclosure controls |
| [[security-vault-confinement]] | Vault path, URI, symlink, and rename confinement |
| [[semantic-tokens]] | Semantic token behavior |
| [[tag-indexing]] | Tag indexing and tag completion |
| [[vscode-extension-parity]] | VS Code extension parity behavior |
| [[wiki-link-resolution]] | Wiki-link resolution and style binding |
| [[workspace]] | Vault detection, indexing scope, and workspace isolation |
