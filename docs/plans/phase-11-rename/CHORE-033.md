---
id: "CHORE-033"
title: "Phase 11 Security Sweep"
type: chore
status: open
priority: "normal"
phase: "11"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/11"]
aliases: ["CHORE-033"]
---

# Phase 11 Security Sweep

> [!INFO] `CHORE-033` · Chore · Phase 11 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 11 rename and workspace-edit code for three security concerns: (1) new file URIs in `RenameFile` operations must remain within the vault root — a crafted `newName` containing path traversal sequences (`../`) must not be able to move a file outside the vault boundary; (2) rename must not silently create files outside the vault boundary — the `newUri` must be validated against the vault root before the `WorkspaceEdit` is returned; (3) opaque region rejection must be effective in preventing rename inside code blocks — verify that `OFMDoc.opaqueRegions` coverage is complete for fenced code, inline code, math, and HTML comments.

---

## Motivation

Path traversal in rename operations is a well-known attack vector against LSP servers. A malicious `.md` file could encode crafted heading text that, when used as a rename target, moves server or vault files outside the intended boundary. Opaque region rejection prevents rename from operating on literal text that happens to look like a heading or wiki-link inside a code block.

- Motivated by: `Security.VaultRootConfinement` (ADR013), `Security.OpaqueRegionRejection`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Security requirements | [[requirements/security]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/rename.handler.ts` — vault root boundary check on RenameFile newUri
- `src/handlers/prepare-rename.handler.ts` — verify opaque region coverage completeness

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All file URIs in RenameFile operations must remain within vault root |

---

## Dependencies

**Blocked by:**

- Nothing — can run after Phase 11 tasks complete

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
- [ ] Confirmed: new file URIs in RenameFile operations validated against vault root
- [ ] Confirmed: path traversal sequences in newName are rejected or normalised
- [ ] Confirmed: opaque region rejection covers fenced code, inline code, math, and HTML comments

---

## Notes

If any security issue requires changing the LSP response behaviour (e.g. returning a different error code, or adding a vault-root guard that was missing), convert this ticket to a TASK before making the fix.

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
> Chore created. Status: `open`. Motivation: Phase 11 security sweep — new file URIs in RenameFile must remain within vault root (ADR013), rename must not silently create files outside vault boundary, opaque region rejection preventing rename inside code blocks.
