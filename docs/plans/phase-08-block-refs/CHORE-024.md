---
id: "CHORE-024"
title: "Phase 8 Security Sweep"
type: chore
status: open
priority: "normal"
phase: "8"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/8"]
aliases: ["CHORE-024"]
---

# Phase 8 Security Sweep

> [!INFO] `CHORE-024` · Chore · Phase 8 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 8 code for security concerns with focus on two areas: block anchor ID regex validation (ensuring only alphanumeric and hyphen characters are accepted per OFM-BLOCK-001/002 constraints), and confirming that no block anchor IDs are ever used in file path construction or any filesystem operation.

---

## Motivation

Block anchor IDs are user-supplied strings extracted from vault documents. Without strict validation, a malformed or malicious anchor ID could be injected into path-building operations. OFM-BLOCK-001/002 define the permitted character set; this sweep verifies enforcement.

- Motivated by: `Security.InputValidation.BlockAnchorId` (see [[requirements/security]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block anchor ID input validation (OFM-BLOCK-001/002) | [[requirements/security]] |

---

## Scope of Change

**Files modified:**

- `src/parser/block-anchor-parser.ts` — verify regex rejects non-alphanumeric/hyphen characters
- `src/resolution/link-resolver.ts` — confirm anchor ID is never passed to filesystem APIs
- Any other Phase 8 files that handle `anchorId` strings

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR006-block-ref-indexing]] | Permitted block anchor ID character set |

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] Block anchor ID validation regex confirmed to allow only `[a-zA-Z0-9-]` per OFM-BLOCK-001/002
- [ ] Confirmed: no `anchorId` string is ever concatenated into a file path or passed to any filesystem API
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

OFM-BLOCK-001: block anchor IDs consist of alphanumeric characters and hyphens only.
OFM-BLOCK-002: the `^` prefix is stripped before storing the ID; the stored `id` field must never contain `^`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: security sweep focusing on block anchor ID regex validation and no filesystem use of anchor IDs.
