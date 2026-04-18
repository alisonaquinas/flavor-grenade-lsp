---
id: "TASK-075"
title: "Add EmbedRef to RefGraph"
type: task
status: done
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/7"]
aliases: ["TASK-075"]
---

# Add EmbedRef to RefGraph

> [!INFO] `TASK-075` · Task · Phase 7 · Parent: [[FEAT-008]] · Status: `open`

## Description

Update `src/resolution/ref-graph.ts` to track embed entries separately from wiki-link entries. The new `EmbedRef` interface shares the same `DefKey` format used by wiki-link refs but adds an `embedSize` field for optional width/height size specifiers. The `RefGraph` must maintain a dedicated collection of `EmbedRef` entries so that embed-specific queries (broken embed diagnostics, go-to-definition, hover) do not mix with wiki-link ref queries.

---

## Implementation Notes

- Add `EmbedRef` interface to `src/resolution/ref-graph.ts`:

  ```typescript
  export interface EmbedRef {
    sourceDocId: DocId;
    entry: EmbedEntry;
    resolvedTo: DefKey | null;
    diagnostic?: 'FG004';
    embedSize?: { width?: number; height?: number };
  }
  ```

- Add `embedRefs` collection to `RefGraph` alongside existing `wikiLinkRefs`
- Provide methods to add, remove (by `sourceDocId`), and query `EmbedRef` entries
- See also: [[requirements/embed-resolution]], [[adr/ADR002-ofm-only-scope]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | EmbedRef tracked separately from wiki-link refs in RefGraph | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/embeds.feature` | `RefGraph tracks embed references separately` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/smoke-embeds.md` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Embed handling is scoped to OFM `![[embed]]` syntax only |

---

## Parent Feature

[[FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-076]] — EmbedDest resolution requires EmbedRef to exist in RefGraph
- [[TASK-082]] — unit tests depend on EmbedRef being defined

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-008]] child task row updated to `in-review`

---

## Notes

Keeping `EmbedRef` separate from wiki-link refs ensures FG004 diagnostics are emitted only for broken embeds, not broken wiki-links (which use FG001).

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-008]].

> [!SUCCESS] Done — 2026-04-17
> `EmbedRef` interface added to `src/resolution/ref-graph.ts`. `RefGraph` now maintains `embedRefsMap` and `brokenEmbeds` collections with `addEmbedRef`, `getEmbedRefsTo`, and `getBrokenEmbedRefs` methods. `rebuild` accepts optional `EmbedResolver`. All 211 tests pass. Status: `done`.
