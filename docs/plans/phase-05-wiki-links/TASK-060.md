---
id: "TASK-060"
title: "Implement DiagnosticService FG001/FG002/FG003"
type: task
status: done
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-057", "TASK-059"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-060"]
---

# Implement DiagnosticService FG001/FG002/FG003

> [!INFO] `TASK-060` · Task · Phase 5 · Parent: [[FEAT-006]] · Status: `open`

## Description

Create `src/diagnostics/diagnostic-service.ts`. After resolving all wiki-links in a document, the `DiagnosticService` emits LSP `textDocument/publishDiagnostics` notifications for each unresolved or malformed link. Three diagnostic codes are produced: FG001 for broken links, FG002 for ambiguous links (with related information listing each candidate), and FG003 for malformed links. In single-file mode, all three codes are suppressed. All three codes have severity Error.

---

## Implementation Notes

- Diagnostic definitions:
  - **FG001 BrokenWikiLink**: severity `Error`; range = wiki-link span; message = `Cannot resolve wiki-link '[[target]]'`
  - **FG002 AmbiguousWikiLink**: severity `Error`; `relatedInformation` = one entry per candidate file path
  - **FG003 MalformedWikiLink**: severity `Error`; range = `[[]]` span; message = `Malformed wiki-link: target is empty`
- Severities: FG001 = Error, FG002 = Error, FG003 = Error
- In single-file mode: skip FG001, FG002, FG003 entirely (no diagnostics emitted for wiki-links)
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Diagnostic emission requirements | [[requirements/diagnostics]] |
| — | Wiki-link diagnostic codes | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/wiki-links.feature` | `DiagnosticService emits FG001 for broken link` |
| `bdd/features/diagnostics.feature` | `FG001 BrokenWikiLink emitted with Error severity` |
| `bdd/features/diagnostics.feature` | `FG002 AmbiguousWikiLink includes candidate relatedInformation` |
| `bdd/features/diagnostics.feature` | `FG003 MalformedWikiLink emitted for empty target` |
| `bdd/features/diagnostics.feature` | `No wiki-link diagnostics in single-file mode` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/diagnostics/diagnostic-service.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Diagnostic codes and severities for wiki-link resolution failures |

---

## Parent Feature

[[FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[TASK-057]] — RefGraph provides unresolved/ambiguous refs for bulk diagnostic computation
- [[TASK-059]] — LinkResolver provides per-link resolution results

**Unblocks:**

- [[TASK-065]] — LspModule registers DiagnosticService as a handler

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
- [ ] Parent feature [[FEAT-006]] child task row updated to `in-review`

---

## Notes

FG001, FG002, FG003 all have severity `Error` (not `Warning` or `Information`). Ensure the LSP `DiagnosticSeverity` enum value is `1` (Error) for all three.

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
> Ticket created. Status: `open`. Parent: [[FEAT-006]].
