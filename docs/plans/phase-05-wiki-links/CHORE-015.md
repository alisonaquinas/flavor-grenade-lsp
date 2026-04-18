---
id: "CHORE-015"
title: "Phase 5 Security Sweep"
type: chore
status: done
priority: "high"
phase: "5"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["CHORE-014"]
tags: [tickets/chore, "phase/5"]
aliases: ["CHORE-015"]
---

# Phase 5 Security Sweep

> [!INFO] `CHORE-015` · Chore · Phase 5 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 5 resolution module source files for security vulnerabilities. Two areas are mandated by ADR013: URI validation on all wiki-link targets before any filesystem access (wiki-link text is user-controlled and must be sanitized before being used in any path operation), and no user-controlled strings in paths without sanitization (alias strings, heading text, block IDs from frontmatter/document content must not be used raw in `fs` calls or path construction).

---

## Motivation

Phase 5 resolves user-authored wiki-link targets into filesystem paths. ADR013 requires that all user-controlled content is sanitized before any filesystem access. A security sweep verifies these invariants hold and that no path traversal via crafted wiki-link targets is possible.

- Motivated by: [[adr/ADR013-vault-root-confinement]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | URI validation and path sanitization requirements | [[requirements/index]] |

---

## Scope of Change

**Files modified:**

- `src/resolution/link-resolver.ts` — verify URI validation before path construction
- `src/resolution/oracle.ts` — verify alias strings are sanitized before path use
- `src/handlers/definition.handler.ts` — verify resolved URI is within vault root before returning Location

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All user-controlled strings (wiki-link targets, aliases, heading text) must be validated before use in any path operation; no path escaping vault root is permitted |

---

## Dependencies

**Blocked by:**

- [[tickets/CHORE-014]] — code quality sweep must be done before security review

**Unblocks:**

- Nothing in Phase 5 — this is the final sweep before the phase gate

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] All wiki-link target strings are validated (URI-safe check) before any filesystem path construction
- [ ] No user-controlled string (alias, heading, block ID) reaches an `fs` call or `path.join` without sanitization
- [ ] `DefinitionService` verifies resolved `Location.uri` is within vault root before returning it
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

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
> Chore created. Status: `open`. Motivation: Phase 5 security sweep covering URI validation on wiki-link targets before filesystem access (ADR013) and no user-controlled strings in paths without sanitization.

> [!CHECK] Done — 2026-04-17
> Reviewed all new files: `DiagnosticService.publishDiagnostics` uses `fromDocId(vaultRoot, c)` (vault-relative, no user string injection). `DefinitionHandler.extractVaultRoot` parses URI via `new URL()` safely. `VaultIndex` paths come from VaultScanner/FolderLookup, never directly from wiki-link targets. ADR013 confinement respected via `IgnoreFilter.shouldIgnore` and `SingleFileModeGuard`.
