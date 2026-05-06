---
title: "Phase 14: OFMarkdown Parity Foundation"
phase: 14
status: planned
tags: [plans, marksman-parity, markdown-links, file-operations, attachments]
aliases: [Phase 14, OFMarkdown Parity Foundation]
updated: 2026-05-06
---

# Phase 14: OFMarkdown Parity Foundation

| Field | Value |
|---|---|
| Phase | 14 |
| Title | OFMarkdown Parity Foundation |
| Status | planned |
| Gate | Local Markdown links, attachment references, heading ambiguity diagnostics, and file-operation refactors pass BDD scenarios |
| Depends on | Phase 13, Extension Phase E6 |

## Objective

Deliver the P1 server-side parity items from
[[research/marksman-feature-parity-ofmarkdown]] while preserving Flavor
Grenade's OFM-first architecture.

## Scope

### In Scope

- Standard Markdown local link parsing and indexing
- Reference-style link label definitions and references
- Markdown image and attachment references
- Heading anchor ambiguity diagnostics
- File and folder move refactors across all local reference forms
- Attachment completion, definition, diagnostics, and hover

### Out of Scope

- CLI `check` command
- OFMarkdown export/build command
- Notebook support
- Optional graph views
- Tag, alias, and block ID rename beyond file-operation support

## Workstreams

| Workstream | Deliverable | Primary docs |
|---|---|---|
| Parser | Markdown link nodes and reference-definition nodes in OFMIndex | [[ADR017-standard-markdown-link-intelligence]] |
| RefGraph | `MarkdownLinkRef`, `MarkdownImageRef`, `LinkLabelRef`, `LinkLabelDef` | [[ddd/reference-resolution/domain-model]] |
| Diagnostics | Heading ambiguity and broken local Markdown link diagnostics | [[requirements/ofmarkdown-parity]] |
| Navigation | Definition and references for Markdown local links and labels | [[features/ofmarkdown-parity-roadmap]] |
| Rename | File/folder move workspace edits across all reference forms | [[ADR018-vault-file-operation-refactoring]] |
| Attachments | Completion, hover, diagnostics, and definition for vault assets | [[requirements/ofmarkdown-parity]] |

## Acceptance

- `docs/bdd/features/ofmarkdown-parity.feature` scenarios pass.
- Existing wiki-link, embed, block-ref, tag, completion, diagnostics, navigation,
  and rename scenarios still pass.
- No local reference can resolve outside the vault root.
- External URLs produce no vault broken-link diagnostics.
- File-operation edits are previewable through WorkspaceEdit, not direct server
  writes.

## Risks

| Risk | Mitigation |
|---|---|
| Markdown link syntax overlaps wiki-links and embeds | Keep OFM parse precedence from [[ofm-spec/index]]; parse opaque regions first |
| External URL false positives | Scheme and URL classifier before RefGraph construction |
| Folder moves produce conflicting edits | Compute all edits before returning; fail the whole operation on overlap |
| Attachment indexing increases scan cost | Store metadata lazily; resolve existence eagerly |

## Related

- [[features/ofmarkdown-parity-roadmap]]
- [[requirements/ofmarkdown-parity]]
- [[ADR017-standard-markdown-link-intelligence]]
- [[ADR018-vault-file-operation-refactoring]]
