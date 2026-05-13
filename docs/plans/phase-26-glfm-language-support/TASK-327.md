---
id: "TASK-327"
title: "Implement GLFM parser semantics"
type: task
status: red
priority: high
phase: 26
parent: "FEAT-052"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-052"]
tags: [tickets/task, "phase/26", markdown-flavor, "glfm"]
aliases: ["TASK-327"]
---

# Implement GLFM parser semantics

## Description

Deliver parser/profile semantics for the glfm flavor using [[docs/research/gitlab-flavored-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying glfm behavior through flavor state.
- Record GitLab Flavored Markdown signature behavior: GitLab-specific references, media syntax, heading ids, and platform extensions.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-014 - GLFM Parser And Analysis|MF-U-014]] | Profile and parser behavior for glfm. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor glfm. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/markdown-flavor/markdown-flavor-profiles.ts` |
| Source | `src/parser/gfm-parser.ts` |
| Source | `src/parser/glfm-parser.ts` |
| Source | `src/parser/ofm-parser.ts` |
| Source | `src/parser/types.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [ ] glfm behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for glfm.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will reuse GFM entries for the baseline and add
> `GlfmParser.parse(text, opaqueRegions)` for inapplicable task markers,
> description lists, footnotes, TOC tags, and GitLab host-reference shapes.

> [!INFO] RED - 2026-05-13
> Added failing parser/profile coverage for inherited GFM syntax, GLFM local
> syntax, host-reference shapes, inactive Obsidian syntax, and implemented
> GLFM surface status.
