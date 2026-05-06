---
title: "Phase 14: Markdown Link Intelligence"
phase: 14
status: planned
tags: [plans, markdown-links, reference-resolution, diagnostics, navigation]
aliases: [Phase 14, Markdown Link Intelligence]
updated: 2026-05-06
---

# Phase 14: Markdown Link Intelligence

| Field | Value |
|---|---|
| Phase | 14 |
| Title | Markdown Link Intelligence |
| Status | planned |
| Gate | Local standard Markdown links resolve, diagnose, navigate, reference, and rename like OFM heading links |
| Depends on | Phase 13 |

## Objective

Implement the first server-side Marksman parity slice: local standard Markdown
links become first-class OFM reference symbols without weakening wiki-link,
embed, block-reference, or tag behavior.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]] | Resolve local inline links, reference links, link definitions, and image links through vault rules |
| [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.SameDocumentAnchor]] | Support `[text](#heading)` definition, diagnostics, references, and heading rename updates |
| [[requirements/ofmarkdown-parity#Parity.HeadingAmbiguity.Diagnostics]] | Diagnose duplicate or ambiguous heading anchors for wiki and Markdown heading links |
| [[requirements/completions#Completion.Trigger.Coverage]] | Extend completion coverage for Markdown link URL contexts without regressing existing triggers |
| [[requirements/navigation#Navigation.Definition.AllLinkTypes]] | Extend definition behavior to Markdown local links and same-document anchors |
| [[requirements/navigation#Navigation.References.Completeness]] | Include Markdown local links in reference queries |
| [[requirements/rename#Rename.Refactoring.Completeness]] | Include Markdown heading anchors in heading rename edits |

## Scope

### In Scope

- Parse inline Markdown links `[text](target)`.
- Parse reference link uses `[text][label]`, `[label][]`, and `[label]`.
- Parse reference definitions `[label]: target "title"`.
- Classify local file targets versus external URLs and unknown schemes.
- Add `MarkdownLinkRef`, `LinkLabelRef`, and `LinkLabelDef` to the symbol graph.
- Resolve local links to documents, headings, and same-document anchors.
- Diagnose missing and ambiguous heading anchors.
- Include Markdown link references in find-references and heading rename edits.

### Out of Scope

- Attachment metadata and image dimensions.
- File and folder move refactors.
- `textDocument/documentLink`, folding ranges, and selection ranges.
- CLI check/export tooling.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Parser | Markdown link and reference definition nodes in OFMIndex |
| Target classifier | Local-vs-external target classifier with scheme allowlist |
| RefGraph | `MarkdownLinkRef`, `LinkLabelRef`, `LinkLabelDef` indexing |
| Oracle | Local path and same-document fragment resolution |
| Diagnostics | Missing-heading and ambiguous-heading diagnostics for Markdown anchors |
| Navigation | Definition and references for inline links and reference labels |
| Rename | Heading rename updates for same-document and file-plus-heading Markdown anchors |

## Acceptance

- Relevant scenarios in `docs/bdd/features/ofmarkdown-parity.feature` pass:
  local inline links, reference-style links, external URL suppression,
  same-document anchors, missing same-document anchors, and duplicate heading
  anchors.
- Existing wiki-link, heading, block-reference, tag, completion, diagnostics,
  navigation, and rename scenarios remain green.
- External URLs never produce FG001 or vault broken-link diagnostics.
- All new parser behavior respects [[ofm-spec/markdown-links]] and opaque
  regions from [[ofm-spec/index]].

## Risks

| Risk | Mitigation |
|---|---|
| Markdown link parsing conflicts with wiki-links and embeds | Preserve OFM parse precedence from [[ofm-spec/index]] |
| External URLs become false-positive broken links | Classify schemes before RefGraph construction |
| Reference-style labels create document-global leakage | Keep `LinkLabelDef` document-local per [[ofm-spec/markdown-links]] |
| Heading anchor normalization differs by syntax | Centralize heading-anchor normalization before diagnostics and rename |

## Related

- [[ADR017-standard-markdown-link-intelligence]]
- [[features/ofmarkdown-parity-roadmap]]
- [[requirements/ofmarkdown-parity]]
- [[ofm-spec/markdown-links]]
