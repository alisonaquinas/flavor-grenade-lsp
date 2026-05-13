---
id: "TASK-312"
title: "Add extension validation evidence for selector behavior"
type: task
status: open
priority: medium
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-310"]
tags: [tickets/task, "phase/E17", validation, markdown-flavor]
aliases: ["TASK-312"]
---

# Add Extension Validation Evidence For Selector Behavior

## Description

Record validation evidence that users can see and change Markdown flavor without
using VS Code's language picker.

## Work Scope

- Add smoke record or screenshot reference for selector behavior at
  `extension/docs/tests/evidence/markdown-flavor-selector-smoke.md`.
- Record settings-scope evidence at
  `extension/docs/tests/evidence/markdown-flavor-settings-scope.md`.
- Record host log evidence at
  `extension/docs/tests/evidence/markdown-flavor-host-log.md` showing no `.md`
  document changes to `ofmarkdown`.
- Record research-backed flavor review at
  `extension/docs/tests/evidence/markdown-flavor-research-review.md`.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.Selector` | `GAP-E-014` |
| `Extension.MarkdownFlavor.OverridePersistence` | `GAP-E-014` |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | `GAP-E-014` |
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-E-014` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/docs/tests/markdown-flavor-validation-spec.md` | EXT-MF-VA-001 through EXT-MF-VA-004. |

## Definition of Done

- [ ] Validation evidence exists.
- [ ] Evidence is linked from extension docs.
- [ ] Manual-language and settings-scope evidence are included.
- [ ] Evidence files use the artifact paths required by
      `extension/docs/tests/markdown-flavor-validation-spec.md`.
