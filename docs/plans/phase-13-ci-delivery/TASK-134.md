---
id: "TASK-134"
title: "Write Helix editor configuration"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/13"]
aliases: ["TASK-134"]
---

# Write Helix editor configuration

> [!INFO] `TASK-134` · Task · Phase 13 · Parent: [[tickets/FEAT-014]] · Status: `open`

## Description

Create `editors/helix/languages.toml` with the Helix editor LSP configuration for flavor-grenade-lsp, enabling the server for markdown files in Helix.

---

## Implementation Notes

- File path: `editors/helix/languages.toml`
- Configure a `[[language]]` entry for `markdown` with `language-servers = ["flavor-grenade-lsp"]`
- Add a `[language-server.flavor-grenade-lsp]` entry with `command = "flavor-grenade-lsp"`
- Include root markers: `.obsidian`, `.flavor-grenade.toml`, `.git`
- Include instructional comment header explaining how to merge into user's `~/.config/helix/languages.toml`

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Helix editor configuration example | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | — (documentation task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `editors/helix/languages.toml` | Config | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | LSP server activated only for markdown language in editor |

---

## Parent Feature

[[tickets/FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `editors/helix/languages.toml` created and valid TOML
- [ ] Language server entry references correct command name
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-014]] child task row updated to `in-review`

---

## Notes

Helix uses a TOML-based `languages.toml` configuration. Users need to merge the provided snippet into their personal `~/.config/helix/languages.toml`. The comment header in the file should explain this.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-014]].
