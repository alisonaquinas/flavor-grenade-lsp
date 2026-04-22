---
id: "TASK-140"
title: "Create .vscodeignore for VSIX package hygiene"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "E1"
parent: "FEAT-015"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-139"]
tags: [tickets/task, "phase/E1"]
aliases: ["TASK-140"]
---

# Create .vscodeignore for VSIX package hygiene

> [!INFO] `TASK-140` · Task · Phase E1 · Parent: [[tickets/FEAT-015]] · Status: `open`

## Description

Create `extension/.vscodeignore` with aggressive exclusions to keep the VSIX package small and free of development artefacts. The ignore file excludes source files, documentation, node_modules, TypeScript config, linter config, test files, editor config, lock files, and other non-shipping content. Only `dist/`, `images/`, `package.json`, `README.md`, and `LICENSE` should survive into the packaged VSIX.

---

## Implementation Notes

- Write `extension/.vscodeignore` with the exact content from the phase plan [[plans/phase-E1-extension-scaffold]]:
  - `.github/**`
  - `src/**`
  - `docs/**`
  - `node_modules/**`
  - `*.ts`
  - `!dist/**`
  - `tsconfig.json`
  - `.eslintrc*`
  - `.prettierrc*`
  - `**/*.test.*`
  - `**/__tests__/**`
  - `.vscode/**`
  - `.gitignore`
  - `package-lock.json`
- The `!dist/**` negation is critical — it ensures the bundled `extension.js` and source maps are included in the VSIX even though `*.ts` is excluded
- See also: [[plans/phase-E1-extension-scaffold]], [[adr/ADR015-platform-specific-vsix]]

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Packaging hygiene; no functional requirement tag for VSIX content filtering | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — extension client has no BDD scenarios; VSIX content verified manually or in CI packaging step |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — configuration file; verified by inspecting VSIX contents during CI packaging (Phase E3+) | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Platform-specific VSIX must be lean; `.vscodeignore` controls what ships to users |

---

## Parent Feature

[[tickets/FEAT-015]] — VS Code Extension Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-139]] — the extension must be buildable (with `dist/extension.js` produced) before `.vscodeignore` exclusions can be meaningfully verified.

**Unblocks:**

- Phase E2 — with `.vscodeignore` in place, the extension scaffold is complete and ready for LanguageClient wiring.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/.vscodeignore` exists with all exclusion patterns from the phase plan
- [ ] The `!dist/**` negation is present (ensures bundled output is included)
- [ ] `node_modules/**` is excluded (dependencies are bundled by esbuild, not shipped raw)
- [ ] `src/**` and `*.ts` are excluded (source files do not ship)
- [ ] Parent feature [[tickets/FEAT-015]] child task row updated to `in-review`

---

## Notes

The `.vscodeignore` file follows `.gitignore` syntax. The `!dist/**` negation pattern is order-sensitive — it must appear after any pattern that would otherwise exclude `dist/` contents. In the current file, it appears after `*.ts` to ensure that `.js` and `.js.map` files in `dist/` are included. The `package-lock.json` exclusion is correct because all dependencies are bundled by esbuild into `dist/extension.js`; the raw `node_modules/` tree is not needed at runtime.

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

> [!WARNING] `red` before `green` is non-negotiable. However, this is a pure configuration task with no unit tests — the RED/GREEN cycle is satisfied by verifying the file exists with correct patterns. Full VSIX content verification happens in CI packaging (Phase E3+). See [[templates/tickets/lifecycle/task-lifecycle]] for infrastructure task exceptions.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-015]].
