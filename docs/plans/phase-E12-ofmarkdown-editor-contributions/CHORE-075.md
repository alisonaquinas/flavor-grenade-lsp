---
id: "CHORE-075"
title: "Phase E12 Contribution Manifest Sweep"
type: chore
status: open
priority: medium
phase: E12
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-201", "TASK-202", "TASK-203"]
tags: [tickets/chore, "phase/E12"]
aliases: ["CHORE-075"]
---

# Phase E12 Contribution Manifest Sweep

> [!INFO] `CHORE-075` - Chore - Phase E12 - Priority: `medium` - Status: `open`

> [!NOTE]
> A chore produces no user-visible behaviour change. It improves internal
> quality: tooling, configuration, documentation, refactoring, or process.

---

## Description

Audit `extension/package.json` contributions after E12 tasks land to confirm
that snippets, keybindings, and language configuration are scoped as intended.

---

## Motivation

Contribution scope mistakes can affect every Markdown document in VS Code.

- Motivated by: `Extension.Contributions.OFMarkdownScoped`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Contributions.OFMarkdownScoped` | OFMarkdown contributions are scoped to the intended language or command context | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `extension/package.json` - Correct contribution scopes if drift is found

**Files created:**

- None - no new files are expected for this sweep

**Files deleted:**

- None - no deletion is expected for this chore

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR016-ofmarkdown-language-mode]] | OFMarkdown-specific editor behavior must be scoped to `ofmarkdown` |

---

## Dependencies

**Blocked by:**

- [[TASK-201]] - Snippet contributions must exist
- [[TASK-202]] - Language configuration contribution must exist
- [[TASK-203]] - Keybinding contributions must exist

**Unblocks:**

- [[TASK-204]] - Isolation testing can rely on a swept manifest

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Snippet contribution language is `ofmarkdown`
- [ ] Keybinding `when` clauses include `editorLangId == ofmarkdown`
- [ ] Language configuration is tied to the OFMarkdown language contribution
- [ ] No generic Markdown contribution changes are accidental
- [ ] No behaviour-affecting changes in `src/`
- [ ] [[test/matrix]] updated if verification files were added or removed
- [ ] [[test/index]] updated if verification files were added or removed

---

## Notes

This is a manifest hygiene ticket. New contribution behavior belongs in the
task tickets, not here.

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
> Chore created. Status: `open`. Motivation: prevent OFMarkdown contribution
> scope drift.
