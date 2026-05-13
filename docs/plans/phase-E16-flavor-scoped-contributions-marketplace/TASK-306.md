---
id: "TASK-306"
title: "Rewrite editor contributions around flavor context"
type: task
status: open
priority: high
phase: E16
parent: "FEAT-046"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045", "TASK-305"]
tags: [tickets/task, "phase/E16", markdown-flavor, vscode]
aliases: ["TASK-306"]
---

# Rewrite Editor Contributions Around Flavor Context

## Description

Replace `ofmarkdown`-scoped snippets, keybindings, and language configuration
assumptions with flavor/context-safe behavior.

## Work Scope

- Decide which contributions become commands, context-key gated affordances, or
  safe built-in Markdown behavior.
- Rewrite contribution tests around flavor context.
- Cover command `when`/precondition scoping and optional theme/example
  contribution scoping. If a contribution type is absent, mark it explicitly as
  not applicable in the trace docs.
- Preserve generic CommonMark isolation.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Contributions.FlavorScoped` | `GAP-E-010` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/test/contributions/*.test.ts` | Flavor/context scoping, command preconditions, optional theme/example disposition, and generic isolation. |

## Definition of Done

- [ ] Contribution tests no longer assert `editorLangId == ofmarkdown`.
- [ ] Command and optional theme/example contribution scoping is tested or
      explicitly marked not applicable.
- [ ] Generic Markdown isolation is covered.
- [ ] Obsidian affordances remain accessible when flavor context allows.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
