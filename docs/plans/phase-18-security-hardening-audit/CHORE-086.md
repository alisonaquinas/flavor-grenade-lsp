---
id: "CHORE-086"
title: "Security audit verification sweep"
type: chore
status: open
priority: "high"
phase: "18"
created: "2026-05-08"
updated: "2026-05-08"
dependencies: ["BUG-016", "BUG-017", "BUG-018", "BUG-019", "BUG-020", "BUG-021", "BUG-022"]
tags: [tickets/chore, "phase/18", security, verification]
aliases: ["CHORE-086"]
---

# Security Audit Verification Sweep

> [!INFO] `CHORE-086` · Chore · Phase 18 · Priority: `high` · Status: `open`

## Description

Run the final security verification pass after all Phase 18 findings are fixed,
then update the test matrix, test index, dependency audit log, and phase
workflow evidence.

---

## Motivation

Phase 18 exists to close security audit findings. A final sweep prevents a
ticket from being marked complete without evidence across local commands, CI,
and security requirement docs.

- Motivated by: [[plans/phase-execution]] Step G and [[requirements/security/index]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Security.Supply.AdvisoryMonitoring` | Record advisory scan evidence | [[requirements/security/supply-chain]] |
| `Security.Input.PayloadSize` | Keep existing transport size limits green | [[requirements/security/input-validation]] |
| `Security.Config.NoCodeExecution` | Confirm config still cannot spawn commands | [[requirements/security/information-disclosure]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` — update security rows when tests pass.
- `docs/test/index.md` — record new test files.
- `docs/security/dependency-audit-log.md` — record advisory scan results if present.
- `docs/plans/phase-18-security-hardening-audit/FEAT-033.md` — append retrospective.

**Files created:**

- None expected.

**Files deleted:**

- None expected.

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR014-dependency-security-policy]] | Advisory monitoring and exact pinning evidence must be current |

---

## Dependencies

**Blocked by:**

- [[plans/phase-18-security-hardening-audit/BUG-016]] through [[plans/phase-18-security-hardening-audit/BUG-022]] — findings must be fixed first.

**Unblocks:**

- [[plans/phase-18-security-hardening-audit/FEAT-033]] — final phase review.

---

## Acceptance Criteria

- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.
- [ ] `bun run lint:docs` passes.
- [ ] `bun audit` passes or findings are ticketed.
- [ ] `npm audit --prefix extension --omit=dev` passes or findings are ticketed.
- [ ] No open Phase 18 security tickets remain.

---

## Notes

The initial audit on 2026-05-08 found no active advisory vulnerabilities in root
or extension dependency scans.

---

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`

---

## Workflow Log

> [!INFO] Opened — 2026-05-08
> Chore created as final verification for Phase 18 security findings. Status: `open`.
