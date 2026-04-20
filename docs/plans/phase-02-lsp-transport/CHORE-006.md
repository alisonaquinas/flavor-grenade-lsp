---
id: "CHORE-006"
title: "Phase 2 Security Sweep"
type: chore
status: done
priority: high
phase: 2
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-017", "TASK-018", "TASK-019", "TASK-020", "TASK-021", "TASK-022", "TASK-023", "TASK-024", "TASK-025", "TASK-026", "TASK-027", "TASK-028", "TASK-029"]
tags: [tickets/chore, "phase/2"]
aliases: ["CHORE-006"]
---

# Phase 2 Security Sweep

> [!INFO] `CHORE-006` · Chore · Phase 2 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all Phase 2 implementation files for security issues arising from the server's position as a process that receives arbitrary JSON over stdio from an LSP client. The focus areas are: validating all LSP-received JSON before use (method name length, params structure, absence of prototype-pollution payloads), and ensuring that no internal path information or stack traces are leaked in JSON-RPC error responses sent to the client.

---

## Motivation

The LSP server processes JSON from an external source (the LSP client) over an unverified channel. Malformed or adversarial input must not crash the server, pollute the Node.js prototype chain, or expose internal file system paths in error messages. ADR014 establishes the security policy for all input validation in this project.

- Motivated by: [[adr/ADR014-dependency-security-policy]] (input validation, no path info in errors)

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Input validation on all LSP-received JSON; no path info in error responses | [[requirements/security/index]] |

---

## Scope of Change

**Files modified:**

- `src/transport/json-rpc-dispatcher.ts` — add input validation for method names and params
- `src/lsp/handlers/*.ts` — verify no internal paths or stack traces in error responses
- Related test files — add adversarial input test cases

**Files created:**

- None expected

**Files deleted:**

- None expected

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR014-dependency-security-policy]] | All LSP-received JSON must be validated; error responses must not leak internal path info |

---

## Dependencies

**Blocked by:**

- All Phase 2 TASK tickets (TASK-017 through TASK-029) must be `done`

**Unblocks:**

- Phase 2 feature ticket [[FEAT-003]] can transition to `in-review` once all three Phase 2 chores are `done`

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Method name in incoming JSON-RPC messages is validated (type `string`, max length enforced)
- [ ] `params` field is validated to be an object or array; non-conforming values return `-32600` Invalid Request
- [ ] No stack trace lines appear in any JSON-RPC error response `message` or `data` field
- [ ] No file system path segments appear in any JSON-RPC error response
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/`
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

Input validation must not be bypassed by `Object.prototype` or `__proto__` keys in JSON. Use `JSON.parse` with a reviver or a whitelist approach rather than trusting property access on unchecked objects.

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
> Chore created. Status: `open`. Motivation: input validation on all LSP-received JSON (method names, params), no path info in error responses. ADR014.

> [!SUCCESS] Done — 2026-04-17
> Sweep complete. No violations found or fixed. Status: `done`.
