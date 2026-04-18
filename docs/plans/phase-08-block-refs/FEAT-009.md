---
id: "FEAT-009"
title: "Block References"
type: feature
status: done
priority: "high"
phase: "8"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-006"]
tags: [tickets/feature, "phase/8"]
aliases: ["FEAT-009"]
---

# Block References

> [!INFO] `FEAT-009` · Feature · Phase 8 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain the ability to link directly to named paragraphs or list items within any document using `^blockid` anchors. The server indexes every block anchor in the vault, resolves `[[doc#^blockid]]` cross-references, reports a diagnostic when a block reference points to an anchor that does not exist, navigates to the anchor's exact location in the target document via go-to-definition, lists all locations that reference a given anchor via find-references, and offers block-anchor completion after the `[[doc#^` trigger — including intra-document anchors after `[[#^`.

---

## Scope

**In scope:**

- Indexing `^blockid` anchors via `BlockAnchorParser` into `OFMIndex`
- `CrossBlockRef` type in `RefGraph` for cross-document and intra-document block refs
- Block ref resolution in `LinkResolver` for both cross-doc and intra-doc cases
- FG005 BrokenBlockRef diagnostic (Error severity)
- Go-to-definition for wiki-links with `blockId`
- Find-references for cursor on `^blockid` anchors
- Block ref completion after `[[doc#^` and `[[#^`
- Intra-document block refs (`[[#^id]]` where `entry.target === ''`)

**Out of scope (explicitly excluded):**

- Heading completion (Phase 9)
- Full unified CompletionRouter (Phase 9)
- Callout and embed completions (Phase 9)

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Block reference navigation and diagnostics | [[requirements/user/index]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block reference requirements defined in Phase 8 | [[requirements/block-references]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/block-references]] | Block reference indexing, resolution, diagnostics, navigation, and completion scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-08-block-refs]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] All scenarios in `block-references.feature` pass in CI
- [ ] All linked Planguage requirement tags have `✅ passing` rows in [[test/matrix]]
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command passes in CI (see [[plans/execution-ledger]])
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-083]] | Ensure BlockAnchorEntry is fully populated | `done` |
| [[tickets/TASK-084]] | Add CrossBlock ref type to RefGraph | `done` |
| [[tickets/TASK-085]] | Implement block ref resolution in LinkResolver | `done` |
| [[tickets/TASK-086]] | Implement FG005 diagnostic | `done` |
| [[tickets/TASK-087]] | Implement go-to-definition for block refs | `done` |
| [[tickets/TASK-088]] | Implement find-references for block anchors | `done` |
| [[tickets/TASK-089]] | Implement block ref completion | `done` |
| [[tickets/TASK-090]] | Handle intra-document block refs | `done` |
| [[tickets/TASK-091]] | Write unit tests for block ref resolution | `done` |
| [[tickets/CHORE-022]] | Phase 8 Lint Sweep | `done` |
| [[tickets/CHORE-023]] | Phase 8 Code Quality Sweep | `done` |
| [[tickets/CHORE-024]] | Phase 8 Security Sweep | `done` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-006]] — Phase 5 (Wiki-Link Resolution) must be complete; block ref indexing and resolution build directly on the wiki-link parsing and `RefGraph` foundations

**Unblocks:**

- [[tickets/FEAT-010]] — Phase 9 (Completions) requires FEAT-006, FEAT-007, and FEAT-008 to also be done before it can start

---

## Notes

ADR references:

- [[adr/ADR006-block-ref-indexing]] — block anchor ID format constraints and indexing strategy

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | — |
| `blocked` | All active tasks blocked | Blocker resolved → back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!SUCCESS] In-review — 2026-04-17
> All child tasks complete. Phase 8 Block References implementation done. 263 tests passing (237 original + 26 new). Lint and tsc clean. Status: `in-review`.
>
> ## Retrospective
>
> ### What was implemented
>
> - **TASK-083**: Verified `BlockAnchorEntry` has `id` and `range` fields only (no `lineRange`). Added 4 edge-case tests: anchor at end-of-file, anchor on list item, anchor on heading line, field presence check.
> - **TASK-084**: Added `CrossBlockRef` interface to `ref-graph.ts`. Added `blockRefsMap`, `brokenBlockRefsList`, `addBlockRef()`, `getBlockRefsToAnchor()`, `getBrokenBlockRefs()`. `rebuild()` now processes wiki-link entries with `blockRef` set, creating `CrossBlockRef` for each via `buildCrossBlockRef()`.
> - **TASK-085**: Updated `LinkResolver.resolveLink()` to detect `entry.blockRef !== undefined` and dispatch to `resolveLinkWithBlockRef()`. Handles intra-doc (empty target) and cross-doc (non-empty target) cases. `VaultIndex` and `RefGraph` injected as `@Optional()` for backward compat.
> - **TASK-086**: Updated `DiagnosticService.diagnoseEntry()` to detect block ref entries and route to `diagnoseBlockRefEntry()`. FG005 fires when target doc is found (or intra-doc) but anchor is missing; FG001/FG002/FG003 fire for target doc resolution failures. `VaultIndex` injected as `@Optional()`.
> - **TASK-087**: Updated `DefinitionHandler` to detect `wikiEntry.blockRef` and call `resolveBlockRefDefinition()`. Returns anchor's exact `range` in the target (or source) document URI rather than a zero-range. `VaultIndex` injected as `@Optional()`.
> - **TASK-088**: Updated `ReferencesHandler.handle()` to detect cursor on `BlockAnchorEntry` via `findBlockAnchorAtPosition()`, then call `refGraph.getBlockRefsToAnchor(sourceDocId, anchorId)` and map each `CrossBlockRef.entry.range` to a `Location`.
> - **TASK-089**: Created `BlockRefCompletionProvider` in `src/resolution/block-ref-completion-provider.ts`. Handles cross-doc (resolve via oracle, return target doc's blockAnchors) and intra-doc (parseCache lookup of currentUri). CompletionItemKind.Reference (18). Registered in `ResolutionModule` and `LspModule`; `^` added as trigger character.
> - **TASK-090**: Updated `WikiLinkParser.parseInner()` to detect `#^` pattern: when the fragment after `#` starts with `^`, set `blockRef` (strip `^`) and leave `heading` undefined. Handles both `[[doc#^id]]` (cross-doc) and `[[#^id]]` (intra-doc, `target=''`). Added 4 new wiki-link-parser tests.
> - **TASK-091**: Created `src/resolution/__tests__/block-ref-resolver.test.ts` with 18 tests covering all key scenarios: cross-doc resolved, intra-doc resolved, FG005, FG001 (missing target), EOF anchor, list-item anchor, `[[#^id]]` syntax, and completion provider cross-doc and intra-doc cases.
>
> ### Design decisions
>
> - **Block ref key uses anchor owner**: `getBlockRefsToAnchor(docId, anchorId)` uses the document that *owns* the anchor as the key. For cross-doc refs this is `targetDocId`; for intra-doc refs this is `sourceDocId`. This unifies the lookup interface for the references handler.
> - **`@Optional()` for new injected dependencies**: `VaultIndex`, `RefGraph` added to `LinkResolver`, `DiagnosticService`, `DefinitionHandler` with `@Optional()` to avoid breaking existing unit tests that construct these classes directly without NestJS DI.
> - **FG005 vs FG001 discrimination**: FG001 fires when oracle cannot resolve the target document. FG005 fires only when the target document exists but the anchor ID is absent. Intra-doc refs skip oracle entirely and check only the source doc's `blockAnchors`.
> - **WikiLinkParser `#^` pattern**: The `#^` prefix is detected before general heading extraction. `[[doc#^id]]` → `target='doc', blockRef='id'`. `[[#^id]]` → `target='', blockRef='id'`. `[[doc#Heading]]` → `target='doc', heading='Heading'`. The legacy `[[doc^id]]` syntax (caret without hash) is preserved.
>
> ### Regressions
>
> None. All 237 original tests continue to pass.
