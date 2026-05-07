---
id: "FEAT-029"
title: "Marketplace Evidence And Packaging Proof"
type: feature
status: in-progress
priority: high
phase: E11
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-028"]
tags: [tickets/feature, "phase/E11"]
aliases: ["FEAT-029"]
---

# Marketplace Evidence And Packaging Proof

> [!INFO] `FEAT-029` - Feature - Phase E11 - Priority: `high` - Status: `in-progress`

## Goal

Vault authors can evaluate Flavor Grenade before installing it because the
Marketplace README shows current OFMarkdown behavior and the packaged VSIX
contains every required visual asset.

---

## Scope

**In scope:**

- Add Marketplace README visuals for OFMarkdown mode, status, completions,
  diagnostics, hover, tags, callouts, and reference code lens.
- Verify referenced README assets use Marketplace-supported formats and ship in
  packaged VSIX output.

**Out of scope (explicitly excluded):**

- Rebranding, publisher identity, or Marketplace account changes.
- Runtime server behavior, LSP response changes, or non-Marketplace web pages.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.EvaluateBeforeInstall` | Understand OFMarkdown value before installing the extension | [[requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Marketplace.OFMProof` | README shows required OFMarkdown screenshots or GIFs | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Packaging.TargetBinaryValidation` | Referenced Marketplace assets are included in packaged VSIX output | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Marketplace README and packaged asset parity scenario |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E11-marketplace-evidence-packaging-proof]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`.

- [ ] `extension/README.md` references all required OFMarkdown visual categories
- [ ] Visual assets use Marketplace-supported PNG, JPEG, or GIF formats
- [ ] Packaged VSIX inspection confirms each referenced required asset ships
- [ ] `Extension.Marketplace.OFMProof` has passing evidence in [[test/matrix]]
- [ ] `Extension.Packaging.TargetBinaryValidation` has passing evidence in [[test/matrix]]
- [ ] [[test/index]] updated with every new verification file introduced
- [ ] `cd extension && npm run build:extension` exits 0
- [ ] `cd extension && npx vsce package --no-dependencies` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-197]] | Add OFMarkdown mode and status visuals | `green` |
| [[TASK-198]] | Add completion and navigation visuals | `green` |
| [[TASK-199]] | Add diagnostics, hover, tag, and callout visuals | `green` |
| [[TASK-200]] | Verify README assets in packaged VSIX | `open` |
| [[CHORE-072]] | Phase E11 Marketplace Asset Inventory Sweep | `done` |
| [[CHORE-073]] | Phase E11 Package Inspection Script Sweep | `open` |
| [[CHORE-074]] | Phase E11 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[FEAT-028]] - Phase E10 status UX must exist before status visuals are final

**Unblocks:**

- [[FEAT-030]] - OFMarkdown editor contributions can reuse the Marketplace proof
  framing after E11 is complete

---

## Notes

Required visual categories come from [[features/vscode-extension-parity]] and
[[research/marksman-vscode-feature-parity-ofmarkdown]]. The package check should
use the extension plan gate in [[plans/phase-E11-marketplace-evidence-packaging-proof]].

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[templates/tickets/lifecycle/feature-lifecycle]]

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

> [!NOTE]
> This ticket opens in `draft`. The first agent obligation is to complete the
> spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries. Update the `status` frontmatter field to match the current
> state whenever adding an entry.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E11 execution started on branch `codex/phase-e11-marketplace-proof`.
> Child task tickets are present and scoped; implementation now follows the
> phase execution procedure.
