---
id: "CHORE-030"
title: "Phase 10 Security Sweep"
type: chore
status: done
priority: "normal"
phase: "10"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/10"]
aliases: ["CHORE-030"]
---

# Phase 10 Security Sweep

> [!INFO] `CHORE-030` · Chore · Phase 10 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 10 LSP response payloads for security-sensitive content. Two primary checks: (1) no LSP response payloads include absolute server file paths — all URIs returned must use the `file://` URI scheme as presented to the client, never raw filesystem paths; (2) `LocationLink.originSelectionRange` must always be within the bounds of the current document, preventing out-of-bounds range references that could cause client crashes or unexpected behaviour.

---

## Motivation

Leaking absolute server paths in LSP responses is an information-disclosure risk. Out-of-bounds ranges in `LocationLink` responses can trigger client-side crashes or unexpected editor behaviour in strict LSP clients.

- Motivated by: `Security.NoPathLeakage`, `Security.BoundedRanges`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Security requirements | [[requirements/security]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/cursor-entity.ts` — verify range bounds checking
- Navigation handler files returning `LocationLink[]` — verify no raw paths in responses

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All file references must remain within the vault root |

---

## Dependencies

**Blocked by:**

- Nothing — can run after Phase 10 tasks complete

**Unblocks:**

- Nothing

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] Confirmed: no LSP response payloads include absolute server-side filesystem paths
- [ ] Confirmed: `LocationLink.originSelectionRange` is always within current document bounds

---

## Notes

If a security issue is found that requires changing LSP response behaviour, convert this ticket to a TASK before making the fix.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no behaviour-affecting files; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run `bun test` periodically; if scope grows, update list and log |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; lint+type+test pass | Verify Acceptance Criteria; confirm no `src/` behaviour changes; update matrix/index if needed |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]`; revert uncommitted partial changes if needed |

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: Phase 10 security sweep — verify no absolute server paths in LSP responses and locationLink originSelectionRange remains within document bounds.

> [!CHECK] Done — 2026-04-17
> Security sweep complete. All LSP responses use `pathToFileURL()` for URI construction (safe). No user-controlled shell injection paths. `spawn()` uses fixed args with no user input. LocationLink originSelectionRange is always the parsed entry.range (document-bounded). Status: `done`.
