---
id: "TASK-321"
title: "Rebase existing OFM parser behavior onto the Obsidian flavor"
type: task
status: red
priority: high
phase: 24
parent: "FEAT-050"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-050"]
tags: [tickets/task, "phase/24", markdown-flavor, "obsidian"]
aliases: ["TASK-321"]
---

# Rebase existing OFM parser behavior onto the Obsidian flavor

## Description

Deliver parser/profile semantics for the obsidian flavor using [[docs/ofm-spec/index]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying obsidian behavior through flavor state.
- Record Obsidian signature behavior: wiki links, embeds, block refs, tags, callouts, frontmatter, comments, math, and vault semantics.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |
| FlavorLSP.Profile.SignatureCoverage | AUD-S-005 |
| FlavorLSP.Parser.ProfileDispatch | AUD-S-001 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-012 - Obsidian Parser And Analysis|MF-U-012]] | Profile and parser behavior for obsidian. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor obsidian. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/markdown-flavor-profiles.ts` |
| Source | `src/parser/markdown-flavor-parser-analysis.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Implementation Details

- Update `src/markdown-flavor/markdown-flavor-profiles.ts` so every Obsidian
  LSP surface records `status: "implemented"` after Phase 24 evidence exists.
- Keep `OFMParser.parse(uri, text, version, { effectiveFlavor: "obsidian" })`
  as the parser dispatch API for Obsidian behavior; do not reintroduce
  `ofmarkdown` language-mode gating.
- Add RED coverage in
  `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` for active
  Obsidian wiki links, embeds, tags, block anchors, callouts, math/comment/code
  opaque regions, and inactive host syntax.
- ADR020 constraint: `auto` remains selector state only; the server profile is
  keyed by explicit `obsidian`.

## Definition of Done

- [ ] obsidian behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for obsidian.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage added in
> `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` for active
> Obsidian parser syntax and implemented profile surfaces. Expected failure:
> Obsidian LSP surfaces are still marked `planned` in the profile registry.
> Status: `red`.
