---
id: "CHORE-021"
title: "Phase 7 Security Sweep"
type: chore
status: open
priority: normal
phase: 7
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/7"]
aliases: ["CHORE-021"]
---

# Phase 7 Security Sweep

> [!INFO] `CHORE-021` · Chore · Phase 7 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 7 source files for security issues and resolve them without altering observable LSP behaviour. Focus areas: confirming that all asset path resolution is confined to the vault root (ADR013 — path traversal prevention), ensuring no user-controlled embed target strings are passed to raw filesystem reads without validation, and verifying that hover content cannot expose server-local filesystem paths to LSP clients.

---

## Motivation

Phase 7 resolves user-controlled strings (embed target paths from document content) to filesystem locations. Without proper confinement checks, a crafted embed target like `![[../../etc/passwd]]` could leak information. Hover content that includes resolved paths must similarly be sanitised before being sent to the LSP client.

- Motivated by: [[requirements/security]], [[adr/ADR013-vault-root-confinement]], path traversal prevention

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Asset path confinement to vault root (ADR013) | [[requirements/security]] |
| — | No user-controlled embed target strings in raw filesystem reads without validation | [[requirements/security]] |
| — | Hover content must not leak server paths | [[requirements/security]] |

---

## Scope of Change

**Files modified:**

- `src/resolution/embed-resolver.ts` — verify all resolved asset paths are within vault root
- `src/vault/vault-scanner.ts` — verify AssetIndex only admits paths under vault root
- `src/handlers/hover.handler.ts` — verify hover content does not expose server-local paths

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All asset and embed resolution paths must be confined to vault root |

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
- [ ] Confirmed: all resolved asset paths are within vault root (path traversal prevented)
- [ ] Confirmed: no user-controlled embed target strings reach raw `fs.*` calls without validation
- [ ] Confirmed: hover content does not leak server-local filesystem paths
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

Focus: asset path confinement to vault root (ADR013), no user-controlled embed target strings used in raw filesystem reads without validation, hover content must not leak server paths.

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
> Chore created. Status: `open`. Motivation: security sweep for Phase 7 — asset path confinement to vault root, no user-controlled embed strings in raw filesystem reads, hover content must not leak server paths.
