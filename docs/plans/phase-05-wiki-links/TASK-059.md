---
id: "TASK-059"
title: "Implement LinkResolver.resolveWikiLink"
type: task
status: open
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-058"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-059"]
---

# Implement LinkResolver.resolveWikiLink

> [!INFO] `TASK-059` · Task · Phase 5 · Parent: [[tickets/FEAT-006]] · Status: `open`

## Description

Create `src/resolution/link-resolver.ts`. The `LinkResolver` takes a `WikiLinkEntry` (from the OFM parser index) and a source `DocId`, delegates to the `Oracle` for name matching, and returns either a fully resolved link (with `defKey`, `targetDocId`, and optional heading/block target) or an unresolved link with a reason code (`broken`, `ambiguous`, or `malformed`) and the appropriate diagnostic code (`FG001`, `FG002`, or `FG003`).

---

## Implementation Notes

- Key interface:

  ```typescript
  export class LinkResolver {
    resolveWikiLink(entry: WikiLinkEntry, sourceDocId: DocId): ResolvedLink | UnresolvedLink;
  }

  export interface ResolvedLink {
    kind: 'resolved';
    defKey: DefKey;
    targetDocId: DocId;
    targetHeading?: HeadingEntry;
    targetBlock?: BlockAnchorEntry;
  }

  export interface UnresolvedLink {
    kind: 'unresolved';
    reason: 'broken' | 'ambiguous' | 'malformed';
    code: 'FG001' | 'FG002' | 'FG003';
    candidates?: DocId[];
  }
  ```

- Malformed link (FG003): empty target (`[[]]` or `[[#]]` with no document)
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Wiki-link resolution requirements | [[requirements/wiki-link-resolution]] |
| — | Diagnostic code assignment | [[requirements/diagnostics]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `LinkResolver returns resolved link for valid target` |
| [[bdd/features/wiki-links]] | `LinkResolver returns FG001 for broken link` |
| [[bdd/features/wiki-links]] | `LinkResolver returns FG002 for ambiguous link` |
| [[bdd/features/wiki-links]] | `LinkResolver returns FG003 for malformed link` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/resolution/link-resolver.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style and resolution binding strategy |

---

## Parent Feature

[[tickets/FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-058]] — Oracle must be implemented before LinkResolver can delegate to it

**Unblocks:**

- [[tickets/TASK-057]] — RefGraph calls LinkResolver (or uses its results) during rebuild
- [[tickets/TASK-060]] — DiagnosticService receives UnresolvedLink results from LinkResolver

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
- [ ] Parent feature [[tickets/FEAT-006]] child task row updated to `in-review`

---

## Notes

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-006]].
