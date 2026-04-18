---
id: "FEAT-009"
title: "Block References"
type: feature
status: in-progress
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
| [[tickets/TASK-083]] | Ensure BlockAnchorEntry is fully populated | `open` |
| [[tickets/TASK-084]] | Add CrossBlock ref type to RefGraph | `open` |
| [[tickets/TASK-085]] | Implement block ref resolution in LinkResolver | `open` |
| [[tickets/TASK-086]] | Implement FG005 diagnostic | `open` |
| [[tickets/TASK-087]] | Implement go-to-definition for block refs | `open` |
| [[tickets/TASK-088]] | Implement find-references for block anchors | `open` |
| [[tickets/TASK-089]] | Implement block ref completion | `open` |
| [[tickets/TASK-090]] | Handle intra-document block refs | `open` |
| [[tickets/TASK-091]] | Write unit tests for block ref resolution | `open` |
| [[tickets/CHORE-022]] | Phase 8 Lint Sweep | `open` |
| [[tickets/CHORE-023]] | Phase 8 Code Quality Sweep | `open` |
| [[tickets/CHORE-024]] | Phase 8 Security Sweep | `open` |

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
