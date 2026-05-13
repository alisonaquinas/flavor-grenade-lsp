---
id: "TASK-294"
title: "Rewrite BDD harness around effective flavor state"
type: task
status: open
priority: high
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-044", "FEAT-045"]
tags: [tickets/task, "phase/21", bdd, markdown-flavor]
aliases: ["TASK-294"]
---

# Rewrite BDD Harness Around Effective Flavor State

## Description

Change the BDD extension harness so it tracks `effectiveFlavor` separately from
VS Code `languageId`.

## Work Scope

- Remove simulated vault-to-`ofmarkdown` assignment.
- Add state for selector label, configured flavor, effective flavor, and
  settings target.
- Record simulated settings writes and `workspace/didChangeConfiguration`
  payloads so server propagation assertions are observable.
- Preserve manual non-Markdown language behavior.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-S-006` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | Language remains `markdown` while flavor changes. |

## Definition of Done

- [ ] Harness state has `effectiveFlavor`.
- [ ] Existing language-mode assertions no longer expect `ofmarkdown`.
- [ ] Manual non-Markdown language scenarios assert no override write and no
      server propagation.
- [ ] BDD tests fail honestly when flavor steps are missing.
