---
id: "CHORE-073"
title: "Phase E11 Package Inspection Script Sweep"
type: chore
status: done
priority: medium
phase: E11
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-200"]
tags: [tickets/chore, "phase/E11"]
aliases: ["CHORE-073"]
---

# Phase E11 Package Inspection Script Sweep

> [!INFO] `CHORE-073` - Chore - Phase E11 - Priority: `medium` - Status: `done`

> [!NOTE]
> A chore produces no user-visible behaviour change. It improves internal
> quality: tooling, configuration, documentation, refactoring, or process.

---

## Description

Review the package inspection verification added for E11 and make sure it is
repeatable, documented, and narrow enough to validate Marketplace README assets
without changing extension runtime behavior.

---

## Motivation

The E11 gate depends on reproducible VSIX inspection rather than manual archive
checking.

- Motivated by: `Extension.Marketplace.AssetPackaging`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Marketplace.AssetPackaging` | Referenced README assets ship in packaged VSIX output | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `extension/package.json` - Add or refine package inspection script if needed
- `extension/test/marketplace/vsix-assets.test.ts` - Keep package asset checks focused

**Files created:**

- None - no new files are expected beyond task-owned verification files

**Files deleted:**

- None - no deletion is expected for this chore

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Package inspection must respect target-specific VSIX structure |

---

## Dependencies

**Blocked by:**

- [[TASK-200]] - Package verification must exist before it can be swept

**Unblocks:**

- [[FEAT-029]] - Feature review can rely on repeatable package evidence

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Package inspection command is documented or discoverable
- [x] Verification fails when a README asset is missing from the VSIX
- [x] Verification does not require Marketplace publish credentials
- [x] No behaviour-affecting changes in `src/`
- [ ] [[test/matrix]] updated if verification files were added or removed
- [ ] [[test/index]] updated if verification files were added or removed
- [x] `cd extension && npx vsce package --no-dependencies` passes

---

## Notes

This chore should keep the inspection local and deterministic. Publishing is not
part of E11.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run relevant checks |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; checks pass | Verify Acceptance Criteria |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]` with reason |

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: make E11 VSIX asset inspection
> repeatable.

> [!SUCCESS] Done - 2026-05-07
> `verify:marketplace-assets` runs README and packaged-output checks without
> publish credentials. `npx vsce package --no-dependencies` created a VSIX in
> `%TEMP%` and listed every Marketplace asset under `images/marketplace/`.
