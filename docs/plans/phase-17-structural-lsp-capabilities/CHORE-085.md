---
id: "CHORE-085"
title: "Phase 17 Security Sweep"
type: chore
status: done
priority: high
phase: 17
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["CHORE-084"]
tags: [tickets/chore, "phase/17"]
aliases: ["CHORE-085"]
---

# Phase 17 Security Sweep

> [!INFO] `CHORE-085` - Chore - Phase 17 - Priority: `high` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. Security findings
> that affect behavior must be opened as `BUG` tickets before fixes are made.

---

## Description

Review Phase 17 structural LSP code for position validation, vault-path
confinement, information disclosure, and parser opaque-region safety before the
phase PR is opened.

---

## Motivation

Phase execution Step G requires a security sweep for all new code before unit,
integration, and validation gates are treated as final.

- Motivated by: [[docs/plans/phase-execution]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Security.Input.PositionValidation` | LSP positions and ranges are validated before use | [[docs/requirements/technical/security-input-validation]] |
| `Security.Vault.PathConfinement` | Structural links do not create vault-escape paths | [[docs/requirements/functional/security-vault-confinement]] |
| `ST-002` | Opaque regions prevent parsing through unsafe text spans | [[docs/requirements/functional/semantic-tokens]] |

---

## Scope of Change

**Files modified:**

- Phase 17 source and test files - security fixes only after ticketing findings

**Files created:**

- New `BUG` tickets for security findings, if any

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR012-parser-safety-policy]] | Opaque regions are parsed before token parsers |
| [[ADR013-vault-root-confinement]] | File and URI handling must remain vault-confined |

---

## Dependencies

**Blocked by:**

- [[CHORE-084]] - code quality sweep should settle implementation structure

**Unblocks:**

- Final Phase 17 unit, integration, and validation gates

---

## Acceptance Criteria

- [ ] Review structural handlers for invalid position and range handling
- [ ] Review document links for misleading targets or vault escape risk
- [ ] Review opaque-region handling for code, math, comments, and Templater
- [ ] Open `BUG` tickets for any security findings before fixing them
- [ ] `bun audit` is run if Phase 17 added dependencies; otherwise note N/A
- [ ] `bun run typecheck` exits 0 after any fixes

---

## Notes

This chore was added during Phase 17 Step A-C review because the phase had no
explicit Step G security sweep ticket.

---

## Workflow Log

> [!INFO] Opened - 2026-05-07
> Chore created from Phase 17 Step A-C review. Status: `open`.

> [!SUCCESS] In Review - 2026-05-07
> Reviewed invalid-position handling, document-link target suppression, and
> opaque-region parser ordering. Fixed invalid `selectionRange` batches to
> return JSON-RPC InvalidParams and constrained Templater parsing around
> existing opaque regions. No dependencies were added, so `bun audit` was N/A.
> Status: `in-review`.
