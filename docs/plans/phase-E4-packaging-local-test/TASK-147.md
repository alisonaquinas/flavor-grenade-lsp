---
id: "TASK-147"
title: "Add Marketplace assets (README, CHANGELOG, LICENSE, icon)"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "E4"
parent: "FEAT-018"
created: "2026-04-21"
updated: "2026-04-22"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-146"]
tags: [tickets/task, "phase/E4"]
aliases: ["TASK-147"]
---

# Add Marketplace assets (README, CHANGELOG, LICENSE, icon)

> [!INFO] `TASK-147` · Task · Phase E4 · Parent: [[FEAT-018]] · Status: `done`

## Description

Create the four Marketplace-required assets in the `extension/` directory: a user-facing `README.md` with features overview, configuration table, and getting started instructions; a `CHANGELOG.md` with the 0.1.0 unreleased entry; a copy of the MIT `LICENSE` from the repo root; and a 256x256 placeholder icon PNG at `extension/images/icon.png`. These files are required by `vsce package` and will be displayed on the VS Code Marketplace listing page. This task creates no source code and modifies no build configuration — it only adds static assets.

---

## Implementation Notes

- Write `extension/README.md` with the exact content specified in the phase plan [[plans/phase-E4-packaging-local-test]]. It must include: extension title, features list (completions, diagnostics, go-to-definition, rename, code actions, code lens, semantic tokens), configuration table (5 settings), getting started section, commands section (3 commands), requirements, and links.
- Write `extension/CHANGELOG.md` with the 0.1.0 unreleased entry listing initial release features: LanguageClient wrapper, status bar, commands, and configuration.
- Copy `LICENSE` from the repo root: `cp LICENSE extension/LICENSE`
- Create `extension/images/` directory and a 256x256 PNG icon at `extension/images/icon.png`. The Marketplace requires PNG format, minimum 128x128. SVG is not accepted. A placeholder (e.g., solid-color square with "FG" text) is acceptable for development.
- The `extension/package.json` must already have `"icon": "images/icon.png"` set (from Phase E1). Verify this is present.
- See also: [[plans/phase-E4-packaging-local-test]] for exact file contents

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Marketplace asset preparation; no functional requirement — packaging infrastructure only | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — static asset creation has no BDD scenario. Verification is by inspection of file contents and successful `vsce package` in TASK-148. |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — this task creates static Marketplace assets (README, CHANGELOG, LICENSE, icon). No test files are written or modified. Verification is by file inspection and the subsequent `vsce package` step in TASK-148. | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| — | No ADR constrains Marketplace asset creation |

---

## Parent Feature

[[FEAT-018]] — VSIX Packaging and Local Verification

---

## Dependencies

**Blocked by:**

- [[TASK-146]] — Phase E3 must be complete (status bar and commands implemented) before Marketplace assets are finalized. The README documents features that must exist.

**Unblocks:**

- [[TASK-148]] — VSIX packaging requires all Marketplace assets to be present. `vsce package` will fail without README, LICENSE, and icon.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/README.md` exists with features, configuration table, getting started, commands, requirements, and links sections
- [ ] `extension/CHANGELOG.md` exists with `## [0.1.0] — Unreleased` section and initial release entries
- [ ] `extension/LICENSE` exists and is identical to the repo root `LICENSE`
- [ ] `extension/images/icon.png` exists and is a valid PNG file at least 128x128 pixels
- [ ] `extension/package.json` has `"icon": "images/icon.png"` in its manifest
- [ ] `bun run lint --max-warnings 0` passes (no regressions)
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-018]] child task row updated to `in-review`

---

## Notes

The exact README and CHANGELOG content is specified in the phase plan [[plans/phase-E4-packaging-local-test]]. Copy the content verbatim from the plan to ensure consistency. The icon is a development placeholder and will be replaced with a designed icon before Marketplace publishing.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` *(optional)* → `in-review` → `done`
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

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `open`. Parent: [[FEAT-018]].

> [!CHECK] Done — 2026-04-22
> Infrastructure task exception. Created 4 Marketplace assets: `extension/README.md` (features, config table, getting started, commands, requirements, links), `extension/CHANGELOG.md` (0.1.0 unreleased entry), `extension/LICENSE` (MIT), `extension/images/icon.png` (256x256 dark green placeholder PNG, 762 bytes). No root LICENSE existed — created MIT license matching package.json. `package.json` already has `"icon": "images/icon.png"`. All DoD items satisfied. Status: `done`.
