---
id: "TASK-347"
title: "Add R Markdown tests and validation evidence"
type: task
status: done
priority: high
phase: 32
parent: "FEAT-058"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-058"]
tags: [tickets/task, "phase/32", markdown-flavor, "r-markdown"]
aliases: ["TASK-347"]
---

# Add R Markdown tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the r-markdown flavor using [[docs/research/r-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying r-markdown behavior through flavor state.
- Record R Markdown signature behavior: YAML metadata, executable code chunk fences, chunk options, math, and document-output metadata without running code.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]] | Profile and parser behavior for r-markdown. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor r-markdown. |
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

- [x] r-markdown behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Negative cross-flavor fixtures cover at least three inactive constructs for r-markdown, including Obsidian-only syntax where applicable.
- [x] Validation evidence records exact diagnostic categories/codes, completion labels/kinds, hover boundary text class, semantic-token classes, navigation sub-surfaces, and rename disposition.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> RED coverage will assert R Markdown YAML metadata, chunk labels/options,
> inline R markers, inactive Obsidian behavior, spawned-server counts,
> completions, symbols, folds, semantic tokens, malformed-chunk diagnostics,
> and validation evidence for local-only execution boundaries.

> [!FAILURE] RED validation - 2026-05-13
> Ran the focused R Markdown RED command across parser, diagnostics,
> completions, symbols, folds, semantic tokens, and integration tests. Result:
> 127 passing tests and 7 expected failures for missing R Markdown
> implementation. `bun run lint --max-warnings 0` passed.

> [!SUCCESS] GREEN validation - 2026-05-13
> Re-ran the focused R Markdown command after implementation. Result: 134
> passing tests, 0 failures, 390 assertions. `bun run typecheck` and
> `bun run lint --max-warnings 0` also pass.

> [!SUCCESS] Done - 2026-05-13
> Unit, integration, BDD, evidence, matrix, and applicability trace are updated
> for R Markdown Phase 32 closeout.
