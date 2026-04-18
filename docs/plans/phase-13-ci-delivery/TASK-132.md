---
id: "TASK-132"
title: "Write Neovim lspconfig example"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/13"]
aliases: ["TASK-132"]
---

# Write Neovim lspconfig example

> [!INFO] `TASK-132` · Task · Phase 13 · Parent: [[FEAT-014]] · Status: `open`

## Description

Create `editors/neovim/flavor-grenade.lua` with a working `lspconfig` setup for flavor-grenade-lsp. The file configures `cmd`, `filetypes: ['markdown']`, and `root_dir` using `.obsidian` or `.flavor-grenade.toml` detection, plus example `settings` reflecting the implemented config schema.

---

## Implementation Notes

- File path: `editors/neovim/flavor-grenade.lua`
- Use `lspconfig.configs` to register a custom server named `flavor_grenade`
- `cmd`: `{ 'flavor-grenade-lsp' }`
- `filetypes`: `{ 'markdown' }`
- `root_dir`: detect `.obsidian` or `.flavor-grenade.toml` via `root_pattern`, fallback to `find_git_ancestor`
- `settings.flavorGrenade.linkStyle`: `'file-stem'`
- `settings.flavorGrenade.completion.candidates`: `50`
- Include instructional comments for users copying the snippet

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Editor configuration example lowering barrier to first-use | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | — (documentation task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `editors/neovim/flavor-grenade.lua` | Config | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | LSP server handles only markdown files |

---

## Parent Feature

[[FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `editors/neovim/flavor-grenade.lua` created with working lspconfig snippet
- [ ] Settings fields match the implemented config schema
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-014]] child task row updated to `in-review`

---

## Notes

This is a documentation/example file. No Lua syntax errors should be introduced. The `root_dir` detection ordering (`.obsidian` before `.flavor-grenade.toml` before git root) ensures Obsidian vault roots are preferred.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-014]].
