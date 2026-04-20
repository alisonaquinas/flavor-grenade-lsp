---
id: "TASK-133"
title: "Write VS Code settings example"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/13"]
aliases: ["TASK-133"]
---

# Write VS Code settings example

> [!INFO] `TASK-133` · Task · Phase 13 · Parent: [[FEAT-014]] · Status: `open`

## Description

Create `editors/vscode/settings.json` with an example VS Code workspace settings file that enables quick suggestions for markdown files and provides example `flavorGrenade` configuration values matching the implemented config schema.

---

## Implementation Notes

- File path: `editors/vscode/settings.json`
- Include `[markdown]` language-specific settings enabling `editor.quickSuggestions` and `editor.suggest.showFiles`
- Include `flavorGrenade.linkStyle`, `flavorGrenade.completion.candidates`, and `flavorGrenade.diagnostics.suppress` example values
- Values must match the implemented config schema
- Include instructional comments where JSON allows (none — use a companion `.md` or inline documentation in the file header via a README if needed)

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | VS Code editor configuration example | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | — (documentation task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `editors/vscode/settings.json` | Config | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Configuration scoped to markdown file type |

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

- [ ] `editors/vscode/settings.json` created and valid JSON
- [ ] Settings fields match the implemented config schema
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-014]] child task row updated to `in-review`

---

## Notes

This is a documentation/example file. JSON must be valid (no trailing commas, no comments). The `quickSuggestions` setting is essential for completion triggers to fire in the markdown editor.

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
