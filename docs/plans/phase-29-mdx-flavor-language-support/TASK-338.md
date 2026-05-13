---
id: "TASK-338"
title: "Add MDX tests and validation evidence"
type: task
status: red
priority: high
phase: 29
parent: "FEAT-055"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-055"]
tags: [tickets/task, "phase/29", markdown-flavor, "mdx"]
aliases: ["TASK-338"]
---

# Add MDX tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the mdx flavor using [[docs/research/mdx-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying mdx behavior through flavor state.
- Record MDX signature behavior: JSX elements, expressions, imports, exports, and Markdown interop without taking over the MDX language mode.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]] | Profile and parser behavior for mdx. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor mdx. |
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

- [ ] mdx behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Negative cross-flavor fixtures cover at least three inactive constructs for mdx, including Obsidian-only syntax where applicable.
- [ ] Validation evidence records exact diagnostic categories/codes, completion labels/kinds, hover boundary text class, semantic-token classes, navigation sub-surfaces, and rename disposition.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> RED coverage will assert MDX local syntax, inactive Obsidian behavior,
> spawned-server propagation, completion/symbol/fold/token surfaces, malformed
> JSX/ESM diagnostics, renderer-bound classification, and preservation of the
> separate VS Code `mdx` language-mode safety contract.

> [!INFO] RED - 2026-05-13
> Added failing spawned-server integration coverage for MDX syntax counts,
> diagnostics, inactive Obsidian behavior, and renderer-bound component
> classification.
