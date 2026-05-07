---
id: "CHORE-072"
title: "Phase E11 Marketplace Asset Inventory Sweep"
type: chore
status: done
priority: medium
phase: E11
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-197", "TASK-198", "TASK-199"]
tags: [tickets/chore, "phase/E11"]
aliases: ["CHORE-072"]
---

# Phase E11 Marketplace Asset Inventory Sweep

> [!INFO] `CHORE-072` - Chore - Phase E11 - Priority: `medium` - Status: `done`

> [!NOTE]
> A chore produces no user-visible behaviour change. It improves internal
> quality: tooling, configuration, documentation, refactoring, or process.

---

## Description

Audit the Marketplace visual asset inventory after the E11 README visuals are
added, confirming that filenames, paths, formats, and category coverage match
the phase requirement trace.

---

## Motivation

Marketplace evidence can silently drift if README references and asset files are
not inventoried together before package inspection.

- Motivated by: `Extension.Marketplace.OFMProof`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Marketplace.OFMProof` | Required OFMarkdown visuals are present and referenced | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `extension/README.md` - Fix stale or inconsistent asset references if found

**Files created:**

- `extension/images/marketplace/` - Add missing inventory entries if needed

**Files deleted:**

- None - no deletion is expected for this audit chore

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Assets must be compatible with platform VSIX packaging |

---

## Dependencies

**Blocked by:**

- [[TASK-197]] - Mode and status visuals must exist
- [[TASK-198]] - Completion and navigation visuals must exist
- [[TASK-199]] - Diagnostics, hover, tag, and callout visuals must exist

**Unblocks:**

- [[TASK-200]] - VSIX asset verification depends on a stable inventory

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Every required visual category has an inventory entry
- [x] Every referenced asset path resolves under `extension/`
- [x] Every asset uses PNG, JPEG, or GIF
- [x] No behaviour-affecting changes in `src/`
- [x] [[test/matrix]] updated if verification files were added or removed
- [x] [[test/index]] updated if verification files were added or removed
- [x] Notes identify any intentionally combined visuals

---

## Notes

Combined visuals are acceptable only when the inventory still maps each required
category to an explicit README reference.

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
> Chore created. Status: `open`. Motivation: keep E11 Marketplace asset
> inventory aligned with README proof.

> [!SUCCESS] Done - 2026-05-07
> Added `extension/images/marketplace/inventory.json` mapping all required
> visual categories to local PNG assets. No combined visuals are used.
