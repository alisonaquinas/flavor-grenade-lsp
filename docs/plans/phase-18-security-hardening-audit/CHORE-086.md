---
id: "CHORE-086"
title: "Security audit verification sweep"
type: chore
status: in-review
priority: "high"
phase: "18"
created: "2026-05-08"
updated: "2026-05-08"
dependencies: ["BUG-016", "BUG-017", "BUG-018", "BUG-019", "BUG-020", "BUG-021", "BUG-022", "BUG-023", "BUG-024", "BUG-025", "BUG-042"]
tags: [tickets/chore, "phase/18", security, verification]
aliases: ["CHORE-086"]
---

# Security Audit Verification Sweep

> [!INFO] `CHORE-086` · Chore · Phase 18 · Priority: `high` · Status: `in-review`

## Description

Run the final security verification pass after all Phase 18 findings are fixed,
then update the test matrix, test index, dependency audit log, and phase
workflow evidence.

---

## Motivation

Phase 18 exists to close security audit findings. A final sweep prevents a
ticket from being marked complete without evidence across local commands, CI,
and security requirement docs.

- Motivated by: [[docs/plans/phase-execution]] Step G and [[docs/requirements/security/index]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Security.Supply.AdvisoryMonitoring` | Record advisory scan evidence | [[docs/requirements/security/supply-chain]] |
| `Security.Input.PayloadSize` | Keep existing transport size limits green | [[docs/requirements/security/input-validation]] |
| `Security.Config.NoCodeExecution` | Confirm config still cannot spawn commands | [[docs/requirements/security/information-disclosure]] |

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
| [[docs/adr/ADR014-dependency-security-policy]] | Advisory monitoring and exact pinning evidence must be current |

---

## Dependencies

**Blocked by:**

- [[docs/plans/phase-18-security-hardening-audit/BUG-016]] through [[docs/plans/phase-18-security-hardening-audit/BUG-025]] — findings must be fixed first.

**Unblocks:**

- [[docs/plans/phase-18-security-hardening-audit/FEAT-033]] — final phase review.

---

## Acceptance Criteria

- [x] `bun run lint --max-warnings 0` passes.
- [x] `bun run typecheck` passes.
- [x] `bun test` passes.
- [x] `bun run lint:docs` passes.
- [x] `bun audit` passes or findings are ticketed.
- [x] `npm audit --prefix extension --omit=dev` passes or findings are ticketed.
- [x] No open Phase 18 security tickets remain.

---

## Notes

The initial audit on 2026-05-08 found no active advisory vulnerabilities in root
or extension dependency scans.

---

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`

---

## Workflow Log

> [!INFO] Opened — 2026-05-08
> Chore created as final verification for Phase 18 security findings. Status: `open`.

> [!INFO] Started — 2026-05-08
> Final local verification sweep started after BUG-016 through BUG-022 reached `in-review`. Status: `in-progress`.

> [!SUCCESS] Local verification — 2026-05-08
> `bun run lint --max-warnings 0`, `bun run typecheck`, `bun test`, `bun run lint:docs`, `bun run lint:dependencies`, `bun audit`, `npm audit --prefix extension`, `npm audit --prefix extension --omit=dev`, and `bun run bdd --tags "@smoke"` passed. Root `tests/integration`, `tests/verification`, and `tests/validation` contain no runnable `.test` or `.spec` files. BUG-023 and BUG-024 were opened and fixed during the sweep. Status: `in-review`.

> [!NOTE] Reopened by extension audit — 2026-05-08
> BUG-025 was opened after a deep extension security audit found command-triggered startup can bypass unsupported-environment no-spawn checks. Status: `in-progress`.

> [!SUCCESS] Extension verification — 2026-05-08
> BUG-025 was fixed and moved to `in-review`. The extension startup regression test, extension typecheck, full extension unit suite, package verification checks, host test suite, and docs lint passed. Status: `in-review`.

> [!WARNING] Host verification finding - 2026-05-13
> `npm run test:host` failed before tests executed because the VS Code
> `vscode-updating` mutex was held. Opened [[BUG-042]] before retrying or
> changing the verification path. Status remains `in-review`.
