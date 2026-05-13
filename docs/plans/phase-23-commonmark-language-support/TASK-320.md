---
id: "TASK-320"
title: "Add CommonMark tests and validation evidence"
type: task
status: green
priority: high
phase: 23
parent: "FEAT-049"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-049"]
tags: [tickets/task, "phase/23", markdown-flavor, "commonmark"]
aliases: ["TASK-320"]
---

# Add CommonMark tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the commonmark flavor using [[docs/research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying commonmark behavior through flavor state.
- Record CommonMark signature behavior: standardized CommonMark block and inline behavior without GFM or Obsidian extensions.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-011 - CommonMark Parser And Analysis|MF-U-011]] | Profile and parser behavior for commonmark. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor commonmark. |
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

- [ ] commonmark behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Negative cross-flavor fixtures cover at least three inactive constructs for commonmark, including Obsidian-only syntax where applicable.
- [ ] Validation evidence records exact diagnostic categories/codes, completion labels/kinds, hover boundary text class, semantic-token classes, navigation sub-surfaces, and rename disposition.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> Test scope confirmed: add unit and spawned-server coverage for CommonMark parser
> behavior, portability diagnostics, inactive Obsidian completions, and generic
> Markdown `auto` fallback evidence.
> Focused RED coverage added. The spawned-server fixture also showed that a local
> Markdown link can produce `FG001` before index evidence; the fixture will keep
> portability assertions separate from broken-link assertions.
> Command: `bun test src/parser/__tests__/markdown-flavor-parser-analysis.test.ts src/resolution/__tests__/diagnostic-service.test.ts src/completion/__tests__/completion-router.test.ts src/test/integration/markdown-flavor.test.ts`.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> CommonMark unit and spawned-server coverage passes for parser behavior,
> portability diagnostics, completion suppression, and generic Markdown
> propagation. The integration fixture separates portability assertions from
> local broken-link diagnostics.
> Command passed: `bun test src/parser/__tests__/markdown-flavor-parser-analysis.test.ts src/resolution/__tests__/diagnostic-service.test.ts src/completion/__tests__/completion-router.test.ts src/test/integration/markdown-flavor.test.ts`.
> Status: `green`.
