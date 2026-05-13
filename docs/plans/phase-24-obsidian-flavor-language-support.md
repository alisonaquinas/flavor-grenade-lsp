---
title: "Phase 24: Obsidian Flavor Language Support"
phase: 24
status: planned
tags: [plans, markdown-flavor, obsidian, language-support]
aliases: [Phase 24, Obsidian Flavor Support]
updated: 2026-05-13
---

# Phase 24: Obsidian Flavor Language Support

| Field | Value |
|---|---|
| Phase | 24 |
| Title | Obsidian Flavor Language Support |
| Status | planned |
| Gate | Existing OFM behavior is represented as the `obsidian` flavor without language-mode promotion |
| Depends on | Phase 23, Phase E15 |

## Objective

Reframe existing Obsidian Flavored Markdown intelligence as actual support for
the `obsidian` flavor under the new selector model.

## Scope

Preserve wiki links, embeds, block anchors, tags, callouts, frontmatter, math,
comments, Templater opaque regions, vault-local resolution, completions,
diagnostics, navigation, rename, semantic tokens, document links, folding, and
selection ranges.

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/ofm-spec/index]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]] | Preserve vault-aware wiki and Markdown link resolution in Obsidian flavor |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.SameDocumentAnchor]] | Preserve same-document heading anchor behavior for Obsidian notes |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.HeadingAmbiguity.Diagnostics]] | Preserve ambiguous heading diagnostics under Obsidian normalization |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Intelligence]] | Preserve Obsidian embed and Markdown image attachment intelligence |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]] | Preserve vault file-operation refactors for Obsidian references |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.Coverage]] | Preserve document links, folding, and selection ranges for Obsidian structures |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Obsidian behavior works when effective flavor is `obsidian`.
- `.md` documents stay in VS Code `markdown` language mode.
- Tests prove Obsidian features are gated by flavor and no longer by
  `ofmarkdown`.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-24-obsidian-flavor-language-support/index]]
