---
id: "CHORE-003"
title: "Phase 1 Security Sweep"
type: chore
# status: open | in-progress | blocked | in-review | done | cancelled
status: done
priority: "high"
phase: "1"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["CHORE-002"]
tags: [tickets/chore, "phase/1"]
aliases: ["CHORE-003"]
---

# Phase 1 Security Sweep

> [!INFO] `CHORE-003` · Chore · Phase 1 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all new code and dependencies introduced in Phase 1 for three categories of security concern: path traversal risks (any code that constructs file paths from user-controlled input must be reviewed against ADR013); input validation gaps (any data received over the LSP JSON-RPC channel must be validated before use — even at the skeleton phase, establish the pattern); and supply chain risks (run `bun audit` to check all newly installed packages for known vulnerabilities per ADR014). For each finding of high or critical severity, open a BUG ticket with the severity level noted in the frontmatter.

---

## Motivation

Security issues are cheapest to fix at the scaffolding phase before business logic accumulates. Path traversal is the primary attack surface for an LSP server operating on a user's vault (file system). Supply chain vulnerabilities in newly added packages must be triaged before they are relied upon in production logic.

- Motivated by: [[adr/ADR013-vault-root-confinement]], [[adr/ADR014-dependency-security-policy]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Security requirements to be authored in Phase 0 requirements layer; this sweep applies them to Phase 1 output | [[requirements/index]] |

---

## Scope of Change

> List every file or directory that will be modified, created, or deleted.

**Files modified:**

- `src/main.ts` — review for any path construction or input consumption patterns
- `src/lsp/lsp.module.ts` — review for any input handling that bypasses validation

**Files created:**

- BUG tickets (in `docs/plans/phase-01-scaffold/`) for any high/critical severity findings

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All file path construction from LSP-received workspace URIs must be sanitised; no `../` traversal permitted |
| [[adr/ADR014-dependency-security-policy]] | All new packages must pass `bun audit` with no high/critical CVEs; exceptions require a documented SPIKE ticket |

---

## Dependencies

**Blocked by:**

- [[CHORE-002]] — Code quality sweep must be done before security sweep; code smells can obscure security issues.

**Unblocks:**

- [[FEAT-002]] can move to `in-review` once CHORE-003 is done (all three chores complete).

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun audit` run and output reviewed; no unaddressed high/critical CVEs
- [ ] All Phase 1 `src/` files reviewed for path traversal risks per [[adr/ADR013-vault-root-confinement]]
- [ ] All Phase 1 `src/` files reviewed for LSP input validation patterns
- [ ] All high/critical findings have corresponding BUG tickets opened with `priority: high` or `priority: critical`
- [ ] `bun run lint --max-warnings 0` still passes
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

At Phase 1, no LSP data is received — the server does not yet listen on stdio. Path traversal and input validation findings at this phase will likely be architectural notes rather than executable bugs. Nevertheless, the sweep establishes the review pattern for all subsequent phases where actual data handling occurs. Document any architectural decisions made here in the Workflow Log for the benefit of Phase 2 implementers.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: [[adr/ADR013-vault-root-confinement]], [[adr/ADR014-dependency-security-policy]]. Blocked until CHORE-002 (Code Quality Sweep) is done.

> [!SUCCESS] Done — 2026-04-17
> Sweep complete. All findings ticketed and resolved. Status: `done`.
