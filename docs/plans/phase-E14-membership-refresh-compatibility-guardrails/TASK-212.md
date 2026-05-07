---
id: "TASK-212"
title: "Validate server version and package target metadata"
type: task
status: red
priority: medium
phase: E14
parent: "FEAT-032"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-031"]
tags: [tickets/task, "phase/E14"]
aliases: ["TASK-212"]
---

# Validate server version and package target metadata

> [!INFO] `TASK-212` - Task - Phase E14 - Parent: [[FEAT-032]] - Status: `red`

## Description

Add compatibility guardrails that expose server version and target metadata, warn
when the client and server versions do not match, and validate packaged VSIX
output for exactly one matching bundled server binary per target.

---

## Implementation Notes

- Prefer existing server initialization or status data before adding protocol
  shape.
- Include extension version, server version, platform, architecture, and server
  path in diagnostic metadata.
- Add package inspection that fails on missing, duplicate, or wrong-target
  server binaries.
- See also: [[ADR015-platform-specific-vsix]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Packaging.TargetBinaryValidation` | Packaged VSIX output contains exactly one matching server binary | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Status diagnostics expose version, platform, server path, and errors | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Client/server version mismatch is visible (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Packaged VSIX contains one matching server binary (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/status-bar.test.ts` | Unit | `Extension.Status.Diagnostics` | 🔴 failing |
| `extension/scripts/package-smoke.test.ts` | Script | `Extension.Packaging.TargetBinaryValidation` | 🔴 failing |

After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR015-platform-specific-vsix]] | Each platform VSIX bundles the matching server target |

---

## Parent Feature

[[FEAT-032]] - Membership Refresh And Compatibility Guardrails

---

## Dependencies

**Blocked by:**

- [[FEAT-031]] - host and target behavior must be settled first.

**Unblocks:**

- [[CHORE-082]] - package smoke-test trace sweep depends on final checks.
- [[CHORE-083]] - compatibility docs depend on final metadata fields.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test or package smoke check written first.
- [ ] Server version and target metadata are available to status diagnostics.
- [ ] Client/server version mismatch produces a visible warning.
- [ ] Package inspection fails on missing server binary.
- [ ] Package inspection fails on duplicate server binaries.
- [ ] Package inspection fails on wrong target binary.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] All linked BDD scenarios pass locally or have documented manual evidence.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-032]] child task row updated to `in-review`.

---

## Notes

This ticket should keep the extension thin. Server metadata may be read from an
existing startup response, status notification, or executable metadata if that
avoids protocol churn.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-032]].

> [!WARNING] Red - 2026-05-07
> Added failing package-target tests requiring a repeatable script and server
> binary validator for missing, duplicate, and wrong-target binaries.
