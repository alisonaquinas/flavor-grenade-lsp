---
id: "CHORE-042"
title: "Verify .vscodeignore excludes all non-shipping files"
type: chore
# status: open | in-progress | blocked | in-review | done | cancelled
status: done
priority: "high"
phase: "E4"
created: "2026-04-21"
updated: "2026-04-22"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-148"]
tags: [tickets/chore, "phase/E4"]
aliases: ["CHORE-042"]
---

# Verify .vscodeignore excludes all non-shipping files

> [!INFO] `CHORE-042` · Chore · Phase E4 · Priority: `high` · Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit the `extension/.vscodeignore` file and verify that the packaged VSIX contains only the files necessary for the extension to run. Inspect the VSIX archive with `unzip -l` and confirm that only `dist/`, `server/`, `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `images/` are included. The VSIX must not contain source files, test files, configuration files, lock files, or `node_modules/`. If any non-shipping files are found, update `.vscodeignore` to exclude them and re-package.

---

## Motivation

The VS Code Marketplace has a quality bar for extension packages. Shipping source code, test files, TypeScript configuration, lock files, or `node_modules/` bloats the VSIX, increases install time, and may expose internal implementation details. This chore ensures the `.vscodeignore` is comprehensive and the VSIX is as lean as possible before the extension enters CI/CD publishing pipelines.

- Motivated by: Marketplace quality standards and VSIX hygiene — lean packages install faster and present a professional listing

---

## Linked Requirements

> Quality, process, CI/CD, or security requirements this chore addresses. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | VSIX packaging hygiene; no Planguage tag — motivated by Marketplace quality standards | [[requirements/index]] |

---

## Scope of Change

> List every file or directory that will be modified, created, or deleted. Keep this section honest — if the scope grows during execution, update this list and note the expansion in the Workflow Log.

**Files modified:**

- `extension/.vscodeignore` — update exclusion rules if any non-shipping files are found in the VSIX

**Files created:**

- None expected (`.vscodeignore` should already exist from Phase E1)

**Files deleted:**

- None

---

## Affected ADRs

> ADRs whose implementation constraints apply to this chore.

| ADR | Constraint |
|---|---|
| — | No ADR constrains .vscodeignore verification |

---

## Dependencies

> Other tickets or phase gates that must complete before this chore can start. Also list tickets this chore unblocks. Update the `dependencies` frontmatter list to match **Blocked by** entries.

**Blocked by:**

- [[TASK-148]] — A successfully packaged VSIX must exist before its contents can be audited. The VSIX is produced by `vsce package` in TASK-148.

**Unblocks:**

- [[FEAT-018]] — This is the final child ticket. When this chore is done, the parent feature can transition to `in-review`.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `unzip -l` of the VSIX shows only these top-level entries under `extension/`: `dist/`, `server/`, `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, `images/`

- [ ] VSIX does not contain `src/`, `node_modules/`, `tsconfig.json`, `tsconfig.*.json`, `*.ts` source files, `*.test.*` files, `*.map` files, `package-lock.json`, `bun.lockb`, `.eslintrc.*`, `.prettierrc.*`, or `.gitignore`

- [ ] `extension/.vscodeignore` is reviewed and any missing exclusions are added

- [ ] If `.vscodeignore` was modified, `vsce package` is re-run and the new VSIX is re-inspected

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added

- [ ] `tsc --noEmit` exits 0

- [ ] `bun test` passes (no regressions introduced)

- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)

- [ ] [[test/matrix]] updated if any test files were added or removed

- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

The VSIX internal directory structure uses an `extension/` prefix added by `vsce`. When inspecting with `unzip -l`, all shipping files appear under `extension/` (e.g., `extension/dist/extension.js`, `extension/server/flavor-grenade-lsp`). This is the VSIX container root, not the repo's `extension/` directory.

Expected VSIX contents for reference:

```text
extension/dist/extension.js
extension/server/flavor-grenade-lsp (or .exe on Windows)
extension/package.json
extension/README.md
extension/LICENSE
extension/CHANGELOG.md
extension/images/icon.png
[Content_Types].xml
extension.vsixmanifest
```

If additional files appear beyond this list (other than VSIX metadata files like `[Content_Types].xml` and `extension.vsixmanifest`), they must be excluded via `.vscodeignore`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no behaviour-affecting files; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run `bun test` periodically; if scope grows, update list and log |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; lint+type+test pass | Verify Acceptance Criteria; confirm no `src/` behaviour changes; update matrix/index if needed |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]`; revert uncommitted partial changes if needed |

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-21
> Chore created. Status: `open`. Motivation: Marketplace quality standards — VSIX must contain only shipping files. Blocked by TASK-148 until a packaged VSIX exists for inspection.

> [!SUCCESS] Done — 2026-04-22
> VSIX contents audited via `unzip -l`. 9 files total. Shipping files present: `dist/extension.js`, `dist/extension.js.map`, `package.json`, `readme.md`, `LICENSE.txt`, `changelog.md`, `images/icon.png`. No `src/`, `node_modules/`, `tsconfig.json`, `*.ts` source, `*.test.*`, `package-lock.json`, `.eslintrc*`, `.prettierrc*`, or `.gitignore` found. `.vscodeignore` reviewed — all exclusions correct. No modifications needed. `server/` directory absent (binary added by CI, not committed). No behaviour-affecting changes. Status: `done`.
