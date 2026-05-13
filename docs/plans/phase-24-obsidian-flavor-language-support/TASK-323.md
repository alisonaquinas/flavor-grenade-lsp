---
id: "TASK-323"
title: "Add Obsidian flavor regression and validation evidence"
type: task
status: green
priority: high
phase: 24
parent: "FEAT-050"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-050"]
tags: [tickets/task, "phase/24", markdown-flavor, "obsidian"]
aliases: ["TASK-323"]
---

# Add Obsidian flavor regression and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the obsidian flavor using [[docs/ofm-spec/index]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying obsidian behavior through flavor state.
- Record Obsidian signature behavior: wiki links, embeds, block refs, tags, callouts, frontmatter, comments, math, and vault semantics.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-012 - Obsidian Parser And Analysis|MF-U-012]] | Profile and parser behavior for obsidian. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor obsidian. |
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

## Implementation Details

- Extend `docs/bdd/features/markdown-flavor-dialects.feature` from planned
  Obsidian examples to executable implemented Obsidian language-support
  assertions.
- Update `docs/test/markdown-flavor-unit-spec.md`,
  `docs/test/markdown-flavor-integration-spec.md`, `docs/test/index.md`, and
  `docs/test/matrix.md` with Phase 24 Obsidian evidence paths.
- Update `docs/test/evidence/markdown-flavor-research-trace.md`,
  `docs/test/evidence/markdown-flavor-validation-run.md`, and
  `docs/test/evidence/markdown-flavor-host-boundary-review.md` when Obsidian
  surface dispositions move from planned to implemented.
- Verification command API remains the phase gate in
  `docs/plans/phase-24-obsidian-flavor-language-support.md`.

## Definition of Done

- [ ] obsidian behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Negative cross-flavor fixtures cover at least three inactive constructs for obsidian, including Obsidian-only syntax where applicable.
- [ ] Validation evidence records exact diagnostic categories/codes, completion labels/kinds, hover boundary text class, semantic-token classes, navigation sub-surfaces, and rename disposition.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED regression coverage added at unit and integration levels. Documentation
> trace/evidence updates remain green-work after the Obsidian profile surfaces
> are implemented.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> Phase 24 unit and spawned-server regression coverage now exercises Obsidian
> parser, diagnostic, completion, and selector-mode flavor behavior without
> depending on `ofmarkdown` language-mode promotion.
> Status: `green`.
