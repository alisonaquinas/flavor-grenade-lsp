---
id: "TASK-322"
title: "Gate Obsidian diagnostics and LSP features by flavor"
type: task
status: open
priority: high
phase: 24
parent: "FEAT-050"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-050"]
tags: [tickets/task, "phase/24", markdown-flavor, "obsidian"]
aliases: ["TASK-322"]
---

# Gate Obsidian diagnostics and LSP features by flavor

## Description

Deliver diagnostics and LSP feature behavior for the obsidian flavor using [[docs/ofm-spec/index]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying obsidian behavior through flavor state.
- Record Obsidian signature behavior: wiki links, embeds, block refs, tags, callouts, frontmatter, comments, math, and vault semantics.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |
| FlavorLSP.Diagnostics.ProfileRules | AUD-S-001 |
| FlavorLSP.Completion.ProfileCandidates | AUD-S-001 |
| FlavorLSP.Navigation.ProfileResolution | AUD-S-003 |
| FlavorLSP.Hover.ProfileMetadata | AUD-X-002 |
| FlavorLSP.SemanticTokens.ProfileTokens | AUD-S-001 |
| FlavorLSP.Rename.ProfileSafety | AUD-S-002 |
| FlavorLSP.HostBoundary.NonLocalReferences | AUD-S-004 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-012 - Obsidian Parser And Analysis|MF-U-012]] | Profile and parser behavior for obsidian. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor obsidian. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/resolution/diagnostic-service.ts` |
| Source | `src/completion/completion-router.ts` |
| Source | `src/handlers/definition.handler.ts` |
| Source | `src/handlers/references.handler.ts` |
| Source | `src/handlers/document-symbol.handler.ts` |
| Source | `src/rename/prepare-rename.handler.ts` |
| Source | `src/rename/rename.handler.ts` |
| Source | `src/handlers/document-link.handler.ts` |
| Source | `src/handlers/folding-range.handler.ts` |
| Source | `src/handlers/semantic-tokens.handler.ts` |
| Source | `src/handlers/hover.handler.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `src/resolution/__tests__/diagnostic-service.test.ts` |
| Test | `src/handlers/__tests__/definition.handler.test.ts` |
| Test | `src/handlers/__tests__/references.handler.test.ts` |
| Test | `src/handlers/__tests__/document-symbol.handler.test.ts` |
| Test | `src/rename/__tests__/prepare-rename.handler.test.ts` |
| Test | `src/rename/__tests__/rename.handler.test.ts` |
| Test | `src/handlers/__tests__/document-link.handler.test.ts` |
| Test | `src/handlers/__tests__/folding-range.handler.test.ts` |
| Test | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Test | `src/handlers/__tests__/hover.handler.test.ts` |

## Implementation Details

- Use the existing `OFMDoc.markdownFlavor` and `parseContext.effectiveFlavor`
  fields as the LSP-surface dispatch API.
- Add RED coverage in `src/resolution/__tests__/diagnostic-service.test.ts`
  proving Obsidian vault diagnostics remain active for Obsidian and portability
  diagnostics are not emitted for active Obsidian wiki/callout syntax.
- Add RED coverage in `src/completion/__tests__/completion-router.test.ts`
  proving Obsidian wiki-link, embed, tag, block, and callout completions remain
  available only when `doc.markdownFlavor === "obsidian"`.
- Use `src/test/integration/markdown-flavor.test.ts` for spawned-server proof
  that the `obsidian` effective flavor activates parser, diagnostics, and
  completion behavior without depending on `ofmarkdown`.
- ADR020 constraint: `.md` documents remain VS Code `markdown`; Phase 24 only
  consumes effective flavor state.

## Definition of Done

- [ ] obsidian behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor LSP fixtures proving inactive constructs do not receive diagnostics, completions, navigation, hover, semantic tokens, or rename edits for obsidian.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Navigation coverage includes definition, references, document links, document symbols, and folding for obsidian.
- [ ] Rename coverage is implemented for safe local obsidian symbols or rejected with an explicit disposition.
- [ ] Host/conversion non-local boundaries use the shared Phase 20 classifier and do not emit local diagnostics, navigation, or rename edits.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
