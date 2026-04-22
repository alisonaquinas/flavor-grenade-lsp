---
id: "TASK-148"
title: "Package VSIX and run end-to-end local smoke test"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "E4"
parent: "FEAT-018"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-147"]
tags: [tickets/task, "phase/E4"]
aliases: ["TASK-148"]
---

# Package VSIX and run end-to-end local smoke test

> [!INFO] `TASK-148` · Task · Phase E4 · Parent: [[FEAT-018]] · Status: `open`

## Description

Build the language server binary for the host platform, build the extension client, package everything into a VSIX with `vsce package`, inspect the VSIX contents to confirm only shipping files are included, install the VSIX locally with `code --install-extension`, and perform a manual end-to-end smoke test. The smoke test verifies that the extension activates, the status bar shows indexing state and document count, completions appear on `[[` and `#` triggers, diagnostics render for broken links, and all three commands (Restart Server, Rebuild Index, Show Output) work from the Command Palette. This is the Phase E4 gate: the extension must work locally before entering CI/CD pipelines.

---

## Implementation Notes

- **Build server binary** for the host platform (no cross-compilation):
  - Linux / macOS: `bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp`
  - Windows: `bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp.exe`
  - Note: local builds intentionally omit `--bytecode` (CI-only optimization for faster startup) and `--target` (compiles for host platform). These flags are only used in CI matrix builds.

- **Build extension client:**
  ```bash
  cd extension && npm run build:extension
  ```

- **Package VSIX:**
  ```bash
  cd extension && npx vsce package
  ```
  Expected output: `flavor-grenade-0.1.0.vsix`

- **Inspect VSIX contents:**
  ```bash
  unzip -l extension/flavor-grenade-0.1.0.vsix | head -30
  ```
  Must contain: `extension/dist/extension.js`, `extension/server/flavor-grenade-lsp`, `extension/package.json`, `extension/README.md`, `extension/LICENSE`, `extension/CHANGELOG.md`, `extension/images/icon.png`
  Must NOT contain: `src/`, `node_modules/`, `tsconfig.json`, `*.ts`, `*.test.*`
  Note: VSIX internal paths use `extension/` prefix because `vsce` wraps contents in an `extension/` subdirectory. This is the VSIX root, not the repo's `extension/` directory.

- **Install locally:**
  ```bash
  code --install-extension extension/flavor-grenade-0.1.0.vsix
  ```

- **Manual smoke test** — open a vault directory in VS Code, open a `.md` file, and verify:
  - Extension activates (check Extensions panel)
  - Status bar shows "FG: Starting..." then "FG: Indexing..." then "FG: N docs"
  - Completions appear on `[[`, `#`, etc.
  - Diagnostics render for broken wiki-links
  - Command Palette commands work:
    - "Flavor Grenade: Restart Server" — server restarts, status bar cycles through Starting/Indexing/Ready states
    - "Flavor Grenade: Rebuild Index" — status bar flashes "Indexing..." then returns to document count
    - "Flavor Grenade: Show Output" — output channel opens showing server logs

- **Gitignore:** Add `*.vsix` to `extension/.gitignore` if not already present. Check the current content first — if it already contains `*.vsix`, skip this step.

- See also: [[plans/phase-E4-packaging-local-test]] for the full step-by-step procedure

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | End-to-end packaging and installation verification; validates that all functional requirements from earlier phases work in the packaged extension | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — this is a manual smoke test. BDD scenarios exercise the LSP server directly; this task verifies the packaged extension works as an installed VS Code extension. Automated extension integration tests are out of scope for this phase. |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — verification is a manual smoke test of the installed VSIX. No automated test files are written. The gate is manual confirmation of completions, diagnostics, commands, and status bar in a live VS Code instance. | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| — | No ADR constrains the local packaging and smoke test procedure |

---

## Parent Feature

[[FEAT-018]] — VSIX Packaging and Local Verification

---

## Dependencies

**Blocked by:**

- [[TASK-147]] — Marketplace assets (README, CHANGELOG, LICENSE, icon) must exist before `vsce package` can succeed.

**Unblocks:**

- [[CHORE-042]] — VSIX content inspection in the chore depends on a successfully packaged VSIX from this task.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Server binary built for host platform with `bun build --compile --minify`
- [ ] Extension client built with `npm run build:extension`
- [ ] `npx vsce package` produces `flavor-grenade-0.1.0.vsix` without errors
- [ ] VSIX contents inspected: shipping files present, no source/test/config files included
- [ ] `code --install-extension` installs the VSIX successfully
- [ ] Manual smoke test passed: extension activates, status bar works, completions appear, commands execute
- [ ] `*.vsix` entry present in `extension/.gitignore`
- [ ] `bun run lint --max-warnings 0` passes (no regressions)
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-018]] child task row updated to `in-review`

---

## Notes

The smoke test is manual and cannot be automated within the current test framework. Document the smoke test results in the Workflow Log entry when transitioning to `in-review`. Include the VS Code version, OS, and confirmation of each smoke test checkpoint.

The `--bytecode` flag is intentionally omitted for local builds. It is a CI-only optimization that improves cold-start time but adds build complexity. The `--target` flag is also omitted because the local build compiles for the host platform by default.

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
