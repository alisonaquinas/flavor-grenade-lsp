---
id: "TASK-300"
title: "Replace language promotion with Markdown flavor controller"
type: task
status: open
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-299"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-300"]
---

# Replace Language Promotion With Markdown Flavor Controller

## Description

Replace `LanguageModeController` promotion/demotion behavior with a controller
that preserves VS Code language mode and tracks effective flavor.

## Work Scope

- Remove flavor-state calls to `setTextDocumentLanguage`.
- Preserve non-`markdown` documents.
- Track current effective flavor per active Markdown context.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-E-001` |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | `GAP-E-008` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/src/markdown-flavor.test.ts` | Refresh logic never changes language id for flavor. |

## Definition of Done

- [ ] Vault `.md` documents remain `markdown`.
- [ ] `plaintext` and `mdx` language documents are ignored by flavor application.
- [ ] Obsolete promotion tests are marked for rewrite or removal.
