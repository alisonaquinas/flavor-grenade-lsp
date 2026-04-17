---
id: "CHORE-018"
title: "Phase 6 Security Sweep"
type: chore
status: open
priority: normal
phase: 6
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/6"]
aliases: ["CHORE-018"]
---

# Phase 6 Security Sweep

> [!INFO] `CHORE-018` · Chore · Phase 6 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 6 source files for security issues and resolve them without altering observable LSP behaviour. Focus areas: ensuring no user-supplied tag strings are used in any filesystem operations (tags are metadata — they must never reach `fs.*` calls), and validating that YAML frontmatter input is properly sanitised before being fed into `TagRegistry` to prevent injection or parser-confusion from malformed frontmatter.

---

## Motivation

Phase 6 processes user-controlled strings (tag values from document content and YAML frontmatter) and constructs `WorkspaceEdit` payloads. User tag strings must never be passed to filesystem APIs, and frontmatter YAML must be validated before indexing.

- Motivated by: [[requirements/security]], no-filesystem-from-tag-strings invariant

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | No user tag strings in filesystem operations | [[requirements/security]] |
| — | Frontmatter YAML input validation before indexing | [[requirements/security]] |

---

## Scope of Change

**Files modified:**

- `src/tags/tag-registry.ts` — verify no `fs.*` calls touch tag strings
- `src/code-actions/tag-to-yaml.action.ts` — verify WorkspaceEdit construction is safe
- Any Phase 6 file with identified security issues

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Tag strings are metadata only, never filesystem operands |

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
- [ ] Confirmed: no user tag strings reach any `fs.*` or path-construction API
- [ ] Confirmed: frontmatter YAML tags are validated/sanitised before indexing
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

Focus: no user tag strings used in filesystem operations, frontmatter YAML input validation.

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
> Chore created. Status: `open`. Motivation: security sweep for Phase 6 — no user tag strings in filesystem operations, frontmatter YAML input validation.
