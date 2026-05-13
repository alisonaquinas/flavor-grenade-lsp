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
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]] | Define the canonical flavor id list and labels |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Add source-backed explicit flavor profiles |
| [[test/markdown-flavor-unit-spec]] | Implement profile registry unit test coverage |
| [[gaps/markdown-flavor-gap-analysis#GAP-S-001]] | Close missing server flavor enum/model gap |
| [[gaps/markdown-flavor-gap-analysis#GAP-S-002]] | Close missing dialect profile registry gap |

## Scope

### In Scope

- Server-side flavor id type, label table, and display order.
- Dialect profile registry for every explicit researched flavor.
- Profile metadata for core syntax, extension syntax, host-specific behavior,
  unsupported constructs, and research source.
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

## Gate Verification

```bash
bun test src/parser/__tests__/markdown-flavor-profiles.test.ts
bun run typecheck
bun run lint:docs
```

## Tickets

Ticket index: [[plans/phase-19-markdown-flavor-model-profiles/index]]

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[features/ofmarkdown-language-mode]]
- [[gaps/markdown-flavor-gap-analysis]]
