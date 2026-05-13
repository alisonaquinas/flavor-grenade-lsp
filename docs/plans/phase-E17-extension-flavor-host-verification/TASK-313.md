---
id: "TASK-313"
title: "Retire obsolete language-mode host tests"
type: task
status: open
priority: high
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-310"]
tags: [tickets/task, "phase/E17", vscode, tests]
aliases: ["TASK-313"]
---

# Retire Obsolete Language-Mode Host Tests

## Description

Remove or rewrite host tests that still assert OFMarkdown language-mode
promotion.

## Work Scope

- Replace `activation-language-mode.test.js` expectations with flavor selector
  behavior or move remaining startup checks elsewhere.
- Keep manual non-Markdown preservation coverage.
- Ensure host runner has no stale `ofmarkdown` promotion waits.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-E-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/src/test/suite/activation-language-mode.test.js` | Retired or rewritten without promotion expectations. |

## Definition of Done

- [ ] No host test waits for `document.languageId === "ofmarkdown"`.
- [ ] Remaining activation coverage still passes.
- [ ] Manual language preservation remains tested.
