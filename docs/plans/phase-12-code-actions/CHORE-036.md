---
id: "CHORE-036"
title: "Phase 12 Security Sweep"
type: chore
status: open
priority: medium
phase: 12
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/12"]
aliases: ["CHORE-036"]
---

# Phase 12 Security Sweep

> [!INFO] `CHORE-036` · Chore · Phase 12 · Priority: `medium` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 12 code action implementations for security vulnerabilities. Three specific concerns must be verified: the `CreateFile` code action URI must be resolved to within the vault root (no path traversal); no user-controlled heading text is used in unescaped HTML output; and the FG006 fix range must be validated to be within the current document bounds before the edit is applied.

---

## Motivation

Code actions that produce `WorkspaceEdit` or `CreateFile` document changes operate on the file system via the editor. Unchecked URI construction or unvalidated ranges can lead to path traversal or out-of-bounds edit vulnerabilities.

- Motivated by: `Security.CodeAction.UriValidation` (ADR013), `Security.CodeAction.RangeBounds`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault root URI containment for CreateFile edits | [[requirements/diagnostics]] |

---

## Scope of Change

**Files modified:**

- `src/code-actions/create-missing-file.action.ts` — verify URI is within vault root (ADR013)
- `src/code-actions/toc-generator.action.ts` — verify heading text is not used in any unescaped HTML path
- `src/code-actions/fix-nbsp.action.ts` — verify FG006 range is within current document bounds

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | CreateFile URI must resolve to within vault root; reject path traversal attempts |

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
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] `CreateFile` URI construction verified to reject paths outside vault root
- [ ] No user-controlled heading text rendered as unescaped HTML anywhere in Phase 12 code
- [ ] FG006 range validation confirmed present and tested

---

## Notes

Path traversal check for vault root: the resolved file URI must start with the vault root URI after normalization. Reject any URI that contains `..` segments after joining.

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
> Chore created. Status: `open`. Motivation: security audit of Phase 12 code actions — vault root URI containment, no unescaped heading HTML, FG006 range bounds validation.
