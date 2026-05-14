---
id: "TASK-353"
title: "Add Stack Overflow Markdown tests and validation evidence"
type: task
status: done
priority: high
phase: 34
parent: "FEAT-060"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-060"]
tags: [tickets/task, "phase/34", markdown-flavor, "stack-overflow"]
aliases: ["TASK-353"]
---

# Add Stack Overflow Markdown tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the stack-overflow flavor using [[docs/research/stack-overflow-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying stack-overflow behavior through flavor state.
- Record Stack Overflow Markdown signature behavior: technical-writing Markdown, code fence behavior, tags, spoilers, tables, and Stack Overflow portability diagnostics.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-022 - Stack Overflow Markdown Parser And Analysis|MF-U-022]] | Profile and parser behavior for stack-overflow. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor stack-overflow. |
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

- [x] stack-overflow behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Negative cross-flavor fixtures cover at least three inactive constructs for stack-overflow, including Obsidian-only syntax where applicable.
- [x] Validation evidence records exact diagnostic categories/codes, completion labels/kinds, hover boundary text class, semantic-token classes, navigation sub-surfaces, and rename disposition.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> RED coverage will assert Stack Overflow tag references, spoilers, language
> directives, fence hints, tables, portability diagnostics for comment-only
> limitations or unsupported directives, inactive Obsidian behavior,
> completions, symbols, folds, semantic tokens, spawned-server counts, and
> validation evidence for local-only Stack Exchange host boundaries.

> [!FAIL] Step D RED - 2026-05-13
> Status set to `red`. Added RED coverage in parser, diagnostic, completion,
> document-symbol, folding, semantic-token, and spawned-server integration
> tests. Focused command produced 142 passing tests and 8 expected failures.

> [!SUCCESS] Step D GREEN - 2026-05-13
> Status set to `green`. Focused Stack Overflow parser, diagnostic, completion,
> document-symbol, folding, semantic-token, and spawned-server integration
> tests now pass with 150 passing tests and 440 assertions.

> [!SUCCESS] Step L closeout - 2026-05-13
> Status set to `done`. Phase 34 unit, integration, BDD, matrix, index, and
> validation evidence now include Stack Overflow Markdown coverage.
