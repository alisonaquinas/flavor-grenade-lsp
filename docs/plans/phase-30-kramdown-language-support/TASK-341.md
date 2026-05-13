---
id: "TASK-341"
title: "Add kramdown tests and validation evidence"
type: task
status: open
priority: high
phase: 30
parent: "FEAT-056"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-056"]
tags: [tickets/task, "phase/30", markdown-flavor, "kramdown"]
aliases: ["TASK-341"]
---

# Add kramdown tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the kramdown flavor using [[docs/research/kramdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying kramdown behavior through flavor state.
- Record kramdown signature behavior: block and span attributes, definition lists, footnotes, tables, math, and inline attribute lists.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |
| FlavorLSP.Profile.SignatureCoverage | AUD-X-003 |
| FlavorLSP.Parser.ProfileDispatch | AUD-T-002 |
| FlavorLSP.Diagnostics.ProfileRules | AUD-T-002 |
| FlavorLSP.Completion.ProfileCandidates | AUD-T-002 |
| FlavorLSP.Navigation.ProfileResolution | AUD-T-002 |
| FlavorLSP.Hover.ProfileMetadata | AUD-T-011 |
| FlavorLSP.SemanticTokens.ProfileTokens | AUD-T-002 |
| FlavorLSP.Rename.ProfileSafety | AUD-T-002 |
| FlavorLSP.HostBoundary.NonLocalReferences | AUD-T-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-018 - kramdown Parser And Analysis|MF-U-018]] | Profile and parser behavior for kramdown. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor kramdown. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |
| Test | `src/test/bdd/step-definitions/extension-harness.steps.ts` |
| Evidence | `docs/test/evidence/markdown-flavor-research-trace.md` |
| Evidence | `docs/test/evidence/markdown-flavor-validation-run.md` |
| Evidence | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |

## Definition of Done

- [ ] kramdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Negative cross-flavor fixtures cover at least three inactive constructs for kramdown, including Obsidian-only syntax where applicable.
- [ ] Validation evidence records exact diagnostic categories/codes, completion labels/kinds, hover boundary text class, semantic-token classes, navigation sub-surfaces, and rename disposition.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
