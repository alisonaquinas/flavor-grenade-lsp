---
title: "Phase 19: Markdown Flavor Model And Profiles"
phase: 19
status: planned
tags: [plans, markdown-flavor, profiles, server]
aliases: [Phase 19, Markdown Flavor Profiles]
updated: 2026-05-13
---

# Phase 19: Markdown Flavor Model And Profiles

| Field | Value |
|---|---|
| Phase | 19 |
| Title | Markdown Flavor Model And Profiles |
| Status | planned |
| Gate | A canonical server-side flavor model and source-backed profile registry exist with unit coverage |
| Depends on | Phase 18 |

## Objective

Close the model/profile portion of the Markdown flavor gap before behavior is
threaded through the server. This phase makes the flavor set executable product
scope instead of documentation-only requirements.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]] | Define the canonical flavor id list and labels |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Add source-backed explicit flavor profiles |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]] | Define the minimum server profile schema and registry coverage for all explicit flavors |
| [[docs/test/markdown-flavor-unit-spec]] | Implement profile registry unit test coverage |
| [GAP-S-001](../gaps/markdown-flavor-gap-analysis.md) | Close missing server flavor enum/model gap |
| [GAP-S-002](../gaps/markdown-flavor-gap-analysis.md) | Close missing dialect profile registry gap |

## Scope

### In Scope

- Server-side flavor id type, label table, and display order.
- Dialect profile registry for every explicit researched flavor.
- Profile metadata for core syntax, extension syntax, host-specific behavior,
  unsupported constructs, and research source.
- Minimum server profile schema covering active, inert, host-specific,
  opaque-region, diagnostic, completion, navigation, hover, semantic-token,
  folding, document-symbol, and rename surfaces.
- Unit tests for required coverage and profile shape.
- Documentation trace from profile ids to research notes.

### Out of Scope

- Runtime parser gating.
- VS Code selector UI.
- Server configuration propagation.

## Acceptance

- `auto` is represented as detection state, not as a dialect profile.
- Every explicit ADR020 flavor has exactly one profile.
- Original Markdown and CommonMark profiles document the Obsidian constructs
  that are not core syntax.
- Unit tests fail when a required flavor id or source trace is removed.
- Phase 19 profiles may mark a surface `planned` only when the entry links the
  owning Phase 22-34 ticket; later phases that change profile surfaces must
  update the registry tests, test matrix/index, and validation evidence.

## Gate Verification

```bash
bun test src/parser/__tests__/markdown-flavor-profiles.test.ts
bun test src/
bun run typecheck
bun run lint
bun run bdd
bun run lint:docs
bun run build
```

## Tickets

Ticket index: [[docs/plans/phase-19-markdown-flavor-model-profiles/index]]

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]
