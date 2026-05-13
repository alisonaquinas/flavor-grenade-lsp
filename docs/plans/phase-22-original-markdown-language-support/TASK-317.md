---
id: "TASK-317"
title: "Add Original Markdown tests and validation evidence"
type: task
status: in-progress
priority: high
phase: 22
parent: "FEAT-048"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-048"]
tags: [tickets/task, "phase/22", markdown-flavor, "original"]
aliases: ["TASK-317"]
---

# Add Original Markdown tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the original flavor using [[docs/research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying original behavior through flavor state.
- Record Original Markdown signature behavior: historical core Markdown without fenced code, pipe tables, task lists, wiki links, or callouts.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-010 - Original Markdown Parser And Analysis|MF-U-010]] | Profile and parser behavior for original. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor original. |
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

- [ ] original behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Negative cross-flavor fixtures cover at least three inactive constructs for original, including Obsidian-only syntax where applicable.
- [ ] Validation evidence records exact diagnostic categories/codes, completion labels/kinds, hover boundary text class, semantic-token classes, navigation sub-surfaces, and rename disposition.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Implementation Notes

- Update `src/test/integration/markdown-flavor.test.ts` for spawned-server
  Original Markdown diagnostics and parser behavior.
- Update BDD/evidence only for changed Original behavior; Phase 21 already
  owns root validation artifacts.
- Update `docs/test/index.md`, `docs/test/matrix.md`,
  `docs/test/markdown-flavor-unit-spec.md`,
  `docs/test/markdown-flavor-integration-spec.md`, and
  `docs/test/evidence/markdown-flavor-validation-run.md` during closeout.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] RED - 2026-05-13
> Started Phase 22 validation coverage with Original Markdown unit,
> diagnostic, and completion assertions. Integration, BDD, and evidence updates
> remain part of the GREEN/closeout pass.
