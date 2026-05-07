---
id: "FEAT-030"
title: "OFMarkdown Editor Contributions"
type: feature
status: draft
priority: medium
phase: E12
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-029"]
tags: [tickets/feature, "phase/E12"]
aliases: ["FEAT-030"]
---

# OFMarkdown Editor Contributions

> [!INFO] `FEAT-030` - Feature - Phase E12 - Priority: `medium` - Status: `draft`

## Goal

Vault authors get OFMarkdown-specific snippets, editing rules, and command
shortcuts in VS Code while ordinary Markdown documents keep their existing
generic Markdown behavior.

---

## Scope

**In scope:**

- Add snippets for callouts, embeds, wiki-links, aliases frontmatter, tags
  frontmatter, and block anchors.
- Tune `ofmarkdown` language configuration and add useful keybindings guarded
  by `editorLangId == ofmarkdown`.

**Out of scope (explicitly excluded):**

- New server completions or LSP behavior changes.
- Theme publishing or user-customizable snippet generation.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.UseNativeVSCodeActions` | Use VS Code editor affordances without surprising generic Markdown users | [[requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Contributions.OFMarkdownScoped` | Snippets, keybindings, language configuration, and examples are scoped to `ofmarkdown` where needed | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for OFMarkdown scoping |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | Language mode behavior that contribution scoping depends on |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E12-ofmarkdown-editor-contributions]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`.

- [ ] OFMarkdown snippets appear only for `ofmarkdown`
- [ ] OFMarkdown keybindings are guarded by `editorLangId == ofmarkdown`
- [ ] Language configuration changes are scoped to the OFMarkdown language id
- [ ] Generic Markdown behavior is unchanged unless intentionally shared
- [ ] `Extension.Contributions.OFMarkdownScoped` has passing evidence in [[test/matrix]]
- [ ] [[test/index]] updated with every new verification file introduced
- [ ] `cd extension && npm run check-types` exits 0
- [ ] `cd extension && npm test` exits 0
- [ ] `cd extension && npm run build:extension` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-201]] | Add OFMarkdown snippets | `open` |
| [[TASK-202]] | Tune OFMarkdown language configuration | `open` |
| [[TASK-203]] | Add OFMarkdown-scoped keybindings | `open` |
| [[TASK-204]] | Test generic Markdown isolation | `open` |
| [[CHORE-075]] | Phase E12 Contribution Manifest Sweep | `open` |
| [[CHORE-076]] | Phase E12 Snippet And Language Docs Sweep | `open` |
| [[CHORE-077]] | Phase E12 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[FEAT-029]] - Marketplace proof should be complete before adding new visible
  contribution affordances

**Unblocks:**

- Phase E13 - Workspace environment documentation can assume scoped
  OFMarkdown contributions exist

---

## Notes

E12 is where Flavor Grenade uses the `ofmarkdown` language id beyond
identification. Keep every contribution scoped unless a shared Markdown effect is
explicitly documented.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | - |
| `blocked` | All active tasks blocked | Blocker resolved -> back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI and review | CI green and human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE]
> This ticket opens in `draft`. The first agent obligation is to complete the
> spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries. Update the `status` frontmatter field to match the current
> state whenever adding an entry.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.
