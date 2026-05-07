---
id: "FEAT-032"
title: "Membership Refresh And Compatibility Guardrails"
type: feature
status: in-progress
priority: medium
phase: E14
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-031"]
tags: [tickets/feature, "phase/E14"]
aliases: ["FEAT-032"]
---

# Membership Refresh And Compatibility Guardrails

> [!INFO] `FEAT-032` - Feature - Phase E14 - Priority: `medium` - Status: `in-progress`

## Goal

Vault authors can keep long-running VS Code windows open while documents enter
and leave `ofmarkdown` mode as vault membership changes. Packaged extension
builds also warn when the client, bundled server, or package target do not match.

---

## Scope

**In scope:**

- Refresh language membership after server `ready` and rebuild-index completion.
- Refresh membership after workspace folder changes, visible editor changes, and
  file-open events.
- Revert `ofmarkdown` to `markdown` only when server membership and marker checks
  both say the file is outside a vault.
- Query or expose server version and target metadata.
- Warn on client/server version mismatch.
- Validate each platform VSIX contains exactly one matching server binary.

**Out of scope (explicitly excluded):**

- Server protocol redesign.
- Multi-root server session isolation.
- Automatic extension update management.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.TrustExtensionBehavior` | Trust that language mode follows vault membership during long-running sessions | [[requirements/user/vscode-extension-parity]] |
| `User.Extension.InstallCompatiblePackage` | Install packages whose bundled server and target metadata are correct | [[requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.LanguageMode.MembershipRefresh` | Membership refreshes after server, index, workspace, editor, and file-open events | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Workspace.EnvironmentModes` | Remote and local membership behavior stays consistent | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Packaging.TargetBinaryValidation` | Packaged VSIX output contains exactly one matching server binary | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for language mode and packaged output |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | OFMarkdown language-mode membership scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E14-membership-refresh-compatibility-guardrails]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Server `ready` refreshes open Markdown document membership.
- [ ] Rebuild-index completion refreshes open Markdown document membership.
- [ ] Workspace folder changes refresh affected visible and open documents.
- [ ] Visible editor changes and file-open events refresh membership.
- [ ] Manual non-Markdown language choices are preserved.
- [ ] `ofmarkdown` reverts only when server and marker checks both say outside
  vault.
- [ ] Version and target mismatches are visible before publish or at startup.
- [ ] Packaged VSIX smoke checks catch missing or wrong server binaries.
- [ ] [[test/matrix]] updated with every new test file introduced.
- [ ] [[test/index]] updated with every new test file introduced.
- [ ] Phase gate command passes in CI (see [[plans/execution-ledger]]).
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`).
- [ ] `tsc --noEmit` exits 0.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-209]] | Refresh membership after server and index events | `green` |
| [[TASK-210]] | Refresh membership after workspace and editor events | `green` |
| [[TASK-211]] | Guard language-mode reversion | `green` |
| [[TASK-212]] | Validate server version and package target metadata | `green` |
| [[CHORE-081]] | Phase E14 extension lint sweep | `open` |
| [[CHORE-082]] | Phase E14 package smoke-test trace sweep | `open` |
| [[CHORE-083]] | Phase E14 compatibility documentation sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[FEAT-031]] - environment-mode behavior must be explicit before membership
  refresh is hardened across local and remote hosts.

**Unblocks:**

- Later extension release work that depends on package compatibility evidence.

---

## Notes

The packaging requirement text currently emphasizes Marketplace assets. This
phase applies the same packaging-proof responsibility to the bundled server
binary and target metadata described in [[plans/phase-E14-membership-refresh-compatibility-guardrails]].

---

## Lifecycle

Full state machine, entry and exit criteria, and agent obligations for each
state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | - |
| `blocked` | All active tasks blocked | Blocker resolved -> back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI and review | CI green and human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E14 execution started on branch
> `codex/phase-e14-membership-compatibility`. Child task tickets are present
> and scoped; implementation now follows the phase execution procedure.
