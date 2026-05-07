---
id: "FEAT-027"
title: "Extension Host Regression Harness"
type: feature
status: in-progress
priority: high
phase: E9
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-026"]
tags: [tickets/feature, "phase/E9"]
aliases: ["FEAT-027"]
---

# Extension Host Regression Harness

> [!INFO] `FEAT-027` - Feature - Phase E9 - Priority: `high` - Status: `in-progress`

## Goal

Extension maintainers can trust that VS Code integration keeps working across
activation, OFMarkdown recognition, command bridges, status updates, and server
failure states. Regressions that only appear inside the VS Code extension host
are caught before publishing.

---

## Scope

**In scope:**

- Add a VS Code extension-host test runner and fixture workspaces for vault,
  Flavor Grenade config, and generic Markdown cases
- Cover activation, language-mode membership, command registration, command
  payload validation, status transitions, and missing server path failure
- Wire the host-test command into the extension verification path where the
  environment supports it

**Out of scope (explicitly excluded):**

- Manual remote workspace verification
- Marketplace screenshots or README image capture
- Server-side LSP behavior already covered by root tests

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.TrustExtensionBehavior` | Trust extension behavior across updates | [[requirements/user/vscode-extension-parity]] |
| `User.Extension.StartOnlyForVaults` | Start automatically for vaults without invading generic Markdown | [[requirements/user/vscode-extension-parity]] |
| `User.Extension.UseNativeVSCodeActions` | Use native VS Code actions for vault navigation | [[requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Tests.HostCoverage` | Extension-host tests cover required client behavior groups | [[requirements/functional/vscode-extension-parity]] |
| `Extension.LanguageMode.MembershipRefresh` | Membership refresh keeps `markdown` and `ofmarkdown` assignments correct | [[requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.PayloadValidation` | Command bridges validate JSON-serializable payloads before VS Code API calls | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for host coverage, language mode, and command bridges |
| `docs/bdd/features/vscode-extension.feature` | Existing extension lifecycle, status, command, and binary resolution scenarios |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | OFMarkdown language-mode assignment and preservation scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E9-extension-host-regression-harness]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `Extension.Tests.HostCoverage` has passing host tests for every required behavior group
- [ ] Activation tests cover `.obsidian/`, `.flavor-grenade.toml`, and generic Markdown fixtures
- [ ] Language-mode tests cover vault promotion, non-vault isolation, and manual mode preservation
- [ ] Command bridge tests cover valid and invalid payloads without uncaught extension-host exceptions
- [ ] Status and missing server path tests prove useful failure states
- [ ] Host tests run from `extension/` or the blocker is documented in the phase notes
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-189]] | Add extension-host test runner and fixtures | `green` |
| [[TASK-190]] | Cover activation and language-mode membership | `green` |
| [[TASK-191]] | Cover command bridge payload validation | `green` |
| [[TASK-192]] | Cover status and server failure states | `green` |
| [[CHORE-066]] | Phase E9 CI Test Command Sweep | `open` |
| [[CHORE-067]] | Phase E9 Test Matrix Sweep | `open` |
| [[CHORE-068]] | Phase E9 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[FEAT-026]] - Phase E8 command bridges must exist before bridge host coverage
- Phase E8 (see [[plans/execution-ledger]]) - Native command bridge behavior is the main test target

**Unblocks:**

- [[FEAT-028]] - Status UX work depends on observable host status behavior
- Phase E10 - Status quick actions need the same extension-host regression path

---

## Notes

Implementation sequence: [[TASK-189]] first, then [[TASK-190]], [[TASK-191]],
and [[TASK-192]]. Run [[CHORE-066]] after the command is stable, then finish
with [[CHORE-067]] and [[CHORE-068]].

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to
> complete the spec and create all child `TASK-NNN` tickets before transitioning
> to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E9 execution started on branch `codex/phase-e9-extension-host-harness`.
