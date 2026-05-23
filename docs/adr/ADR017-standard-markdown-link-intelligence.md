---
adr: "017"
title: Standard Markdown links participate in OFM reference intelligence
status: accepted
date: 2026-05-06
tags: [adr, ADR017, markdown-links, reference-resolution, parity]
aliases: [ADR017, standard markdown link intelligence, markdown link parity]
---

# ADR 017 - Standard Markdown links participate in OFM reference intelligence

## Context

Flavor Grenade is OFM-first, but OFMarkdown documents still contain standard
Markdown inline links, reference links, image links, and link definitions. The
Marksman parity research identified these link forms as the largest remaining
server-side parity gap. Ignoring them creates inconsistent behavior: `[[note]]`
gets completion, diagnostics, navigation, references, and rename support, while
`[note](note.md)` or `[label][ref]` can silently break.

The existing RefGraph already models first-class references and definitions for
wiki-links, embeds, headings, block anchors, aliases, and tags. Adding standard
Markdown local links to a separate subsystem would duplicate resolution,
diagnostics, rename, and backlinks logic.

## Decision

Standard Markdown local links become first-class OFM reference symbols.

The parser adds typed nodes for:

- inline Markdown links: `[text](target)`
- reference link uses: `[text][label]`, `[label][]`, and `[label]`
- reference link definitions: `[label]: target "title"`
- Markdown image links: `![alt](target)`

The reference-resolution domain adds corresponding ref/def types:

- `MarkdownLinkRef` for local file or fragment targets in inline links
- `MarkdownImageRef` for local image or attachment targets in image links
- `LinkLabelRef` for reference-style link uses
- `LinkLabelDef` for reference-style link definitions

Only local file targets participate in vault resolution. External URLs,
`mailto:`, `tel:`, fragment-only links outside OFM heading rules, and unknown
schemes remain opaque and produce no broken-link diagnostics.

All local Markdown link targets resolve through the same Oracle and VaultFolder
boundary rules as wiki-links. They participate in completion, go-to-definition,
find-references, diagnostics, document links, rename, file moves, and graph
queries where applicable.

## Consequences

**Positive:**

- Markdown-standard authoring gets the same vault safety as wiki-link authoring.
- Rename and file move support can update all local link forms consistently.
- Reference definitions become navigable and refactorable instead of plain text.
- Flavor Grenade remains OFM-first while covering real OFMarkdown authoring.

**Negative:**

- Parser complexity increases because Markdown link syntax overlaps wiki-link
  and embed syntax.
- Diagnostics must distinguish local file targets from external URLs to avoid
  false positives.
- Rename edits must preserve Markdown URL encoding and title strings.

## Rejected Options

### Treat Markdown links as plain CommonMark

Rejected because this preserves the current parity gap and leaves broken local
links invisible.

### Implement Markdown link intelligence outside RefGraph

Rejected because it duplicates navigation, diagnostics, references, and rename
logic already owned by the Reference Resolution bounded context.

## Cross-References

- [[docs/research/marksman-feature-parity-ofmarkdown]]
- [[docs/features/ofmarkdown-parity-roadmap]]
- [[docs/requirements/functional/ofmarkdown-parity]]
- [[docs/ddd/reference-resolution/domain-model]]
- `docs/bdd/features/ofmarkdown-parity.feature`
