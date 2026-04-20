---
id: "TASK-052"
title: "Implement single-file mode fallback"
type: task
status: done
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-045", "TASK-047", "TASK-048"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-052"]
---

# Implement single-file mode fallback

> [!INFO] `TASK-052` · Task · Phase 4 · Parent: [[FEAT-005]] · Status: `open`

## Description

When `VaultDetector` returns `mode: 'single-file'`, the server operates in a reduced-capability mode. `VaultIndex` contains only the currently open document(s); `FolderLookup` is kept empty and not rebuilt; `FileWatcher` is not started. Cross-file diagnostic codes FG001, FG002, FG004, and FG005 are suppressed globally in this mode to prevent spurious errors that are only meaningful in a multi-document vault context.

---

## Implementation Notes

- When `VaultDetectionResult.mode === 'single-file'`:
  - `VaultIndex` is populated only from `textDocument/didOpen` notifications (currently open docs)
  - `FolderLookup.rebuild()` is never called; lookups always return empty
  - `FileWatcher.start()` is never called
  - Cross-file diagnostics FG001, FG002, FG004, FG005 are globally suppressed
- FG003 (malformed wiki-link) still fires in single-file mode as it does not require cross-file context
- See also: [[adr/ADR002-ofm-only-scope]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Single-file mode requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vault-detection.feature` | `Single-file mode suppresses cross-file diagnostics` |
| `bdd/features/vault-detection.feature` | `Single-file mode does not start file watcher` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/single-file-mode.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Scope of OFM-only diagnostics; cross-file codes suppressed in single-file mode |
| [[adr/ADR003-vault-detection]] | Vault detection modes and single-file fallback behaviour |

---

## Parent Feature

[[FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[TASK-045]] — single-file mode is determined by VaultDetector result
- [[TASK-047]] — VaultIndex must exist to receive open-document entries
- [[TASK-048]] — FolderLookup must exist (as an empty/no-op instance)

**Unblocks:**

- Nothing directly — cross-cutting behaviour affecting Phase 5 diagnostics

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
- [ ] Parent feature [[FEAT-005]] child task row updated to `in-review`

---

## Notes

Cross-file diagnostics suppressed in single-file mode: FG001 (broken wiki-link), FG002 (ambiguous wiki-link), FG004, FG005. FG003 (malformed wiki-link) is intra-document and is NOT suppressed.

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
> Ticket created. Status: `open`. Parent: [[FEAT-005]].

> [!SUCCESS] Done — 2026-04-17
> `src/vault/single-file-mode.ts` implemented. Static utility class. isActive() delegates to VaultDetector. uriToPath() handles Windows drive letter stripping. Used by VaultScanner.scan() and InitializedHandler.handle(). Status: `done`.
