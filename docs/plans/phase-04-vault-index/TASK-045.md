---
id: "TASK-045"
title: "Implement VaultDetector"
type: task
status: done
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/4"]
aliases: ["TASK-045"]
---

# Implement VaultDetector

> [!INFO] `TASK-045` · Task · Phase 4 · Parent: [[FEAT-005]] · Status: `open`

## Description

Create `src/vault/vault-detector.ts`. The `VaultDetector` walks up the directory tree from a given start path, checking each directory for `.obsidian/` or `.flavor-grenade.toml` markers to determine the vault mode and root. When both markers are present, Obsidian takes precedence and the decision is logged. If no marker is found after reaching the filesystem root, single-file mode is returned. The result is cached after the first call.

---

## Implementation Notes

- Key interface:

  ```typescript
  export type VaultMode = 'obsidian' | 'flavor-grenade' | 'single-file';

  export interface VaultDetectionResult {
    mode: VaultMode;
    vaultRoot: string | null;
    fullFeatures: boolean;
  }

  export class VaultDetector {
    detect(startPath: string): Promise<VaultDetectionResult>;
  }
  ```

- Detection algorithm: (1) start at `rootUri` from `initialize`; (2) check `.obsidian/` → `obsidian` mode; (3) check `.flavor-grenade.toml` → `flavor-grenade` mode; (4) both present → obsidian wins, log the decision; (5) walk up to filesystem root; (6) no marker → `single-file`
- Cache result after first call; subsequent calls return the cached result
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault detection requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vault-detection.feature` | `Detect obsidian vault from workspace root` |
| `bdd/features/vault-detection.feature` | `Detect flavor-grenade vault from workspace root` |
| `bdd/features/vault-detection.feature` | `Obsidian marker takes precedence when both markers present` |
| `bdd/features/vault-detection.feature` | `Fall back to single-file mode when no marker found` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/vault-detector.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Vault detection algorithm, marker precedence, and walk-up behaviour |

---

## Parent Feature

[[FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- Nothing — this is the first task in Phase 4

**Unblocks:**

- [[TASK-049]] — VaultScanner needs VaultDetectionResult to know vault root
- [[TASK-052]] — single-file mode fallback depends on VaultDetector result

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-005]] child task row updated to `in-review`

---

## Notes

Fixture directories for unit tests live at `src/test/fixtures/vault-detection/`. See TASK-055 for the full unit test implementation task.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-005]].

> [!SUCCESS] Done — 2026-04-17
> `src/vault/vault-detector.ts` implemented. VaultDetector walks up directory tree checking for `.obsidian/` (obsidian mode) or `.flavor-grenade.toml` (flavor-grenade mode) with obsidian taking precedence. Cache after first call. All 6 tests pass. Status: `done`.
