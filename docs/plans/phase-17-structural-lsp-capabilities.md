---
title: "Phase 17: Structural LSP Capabilities"
phase: 17
status: in-progress
tags: [plans, document-links, folding, selection-range, lsp]
aliases: [Phase 17, Structural LSP Capabilities]
updated: 2026-05-07
---

# Phase 17: Structural LSP Capabilities

| Field | Value |
|---|---|
| Phase | 17 |
| Title | Structural LSP Capabilities |
| Status | in-progress |
| Gate | Document links, folding ranges, and selection ranges reflect OFMarkdown structure without crossing opaque regions |
| Depends on | Phase 16 |

## Objective

Expose OFMarkdown document structure through standard LSP capabilities that
editors can use without custom client extensions.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.Coverage]] | Implement document links, folding ranges, and selection ranges for OFMarkdown constructs |
| [[requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.CapabilityRegistration]] | Advertise structural providers only when handlers are implemented |
| [[requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.DocumentLinks]] | Return document links for unambiguous local OFMarkdown links and attachments |
| [[requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.FoldingRanges]] | Return folding ranges for supported OFMarkdown structures without crossing opaque regions |
| [[requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.SelectionRanges]] | Return nested selection ranges through OFMarkdown construct boundaries |
| [[requirements/navigation#Navigation.Definition.AllLinkTypes]] | Reuse resolution targets for document links where unambiguous |
| [[requirements/semantic-tokens#ST-002]] | Respect opaque regions when deriving ranges |
| [[requirements/security/input-validation#Security.Input.PositionValidation]] | Validate positions and ranges before structural queries |
| [[requirements/diagnostics#Diagnostic.Ambiguous.RelatedInfo]] | Leave ambiguous document links unresolved and rely on diagnostics/related information |

## Scope

### In Scope

- Advertise and implement `textDocument/documentLink`.
- Advertise and implement `textDocument/foldingRange`.
- Advertise and implement `textDocument/selectionRange`.
- Return document links for unambiguous wiki-links, embeds, Markdown links,
  reference definitions, and attachment references.
- Return fold ranges for frontmatter, headings, callouts, code fences, math
  blocks, Obsidian comments, and Templater regions.
- Return selection ranges that expand from token to construct, paragraph,
  section, and document.

### Out of Scope

- VS Code-specific command bridges.
- Custom graph panels or tree views.
- Formatting provider.
- Semantic token theme contributions.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Capability registry | `documentLinkProvider`, `foldingRangeProvider`, `selectionRangeProvider` |
| Document links | Unambiguous local targets converted to LSP DocumentLink values |
| Folding ranges | OFM structure fold ranges with opaque-region boundaries |
| Selection ranges | Hierarchical selection ranges derived from OFMIndex spans |
| Tests | Unit, integration, and BDD coverage for representative OFM constructs |

## Acceptance

- `Parity.StructuralLSP.Coverage` meter passes.
- Existing navigation and semantic token tests remain green.
- Ambiguous links do not receive misleading document-link targets.
- Folding and selection ranges never cross fenced code, math, comment, or
  Templater opaque region boundaries.

## Risks

| Risk | Mitigation |
|---|---|
| Document links duplicate definition logic | Reuse resolver output; do not fork target resolution |
| Folding ranges conflict with editor Markdown folding | Return only well-bounded OFM ranges and let clients merge |
| Selection ranges become noisy | Start with conservative hierarchy and expand after user feedback |

## Related

- [[features/ofmarkdown-parity-roadmap]]
- [[requirements/functional/ofmarkdown-parity]]
- [[design/api-layer]]
- [[ofm-spec/index]]
