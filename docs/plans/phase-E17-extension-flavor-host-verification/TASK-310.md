---
id: "TASK-310"
title: "Add VS Code host Markdown flavor suite"
type: task
status: open
priority: high
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045", "FEAT-046"]
tags: [tickets/task, "phase/E17", vscode, markdown-flavor]
aliases: ["TASK-310"]
---

# Add VS Code Host Markdown Flavor Suite

## Description

Add `extension/src/test/suite/markdown-flavor.test.js` covering user-visible
flavor behavior in the VS Code Extension Development Host.

## Work Scope

- Cover Obsidian auto, generic CommonMark fallback, config overrides,
  standalone user-scope override, manual language safety, and Auto reset.
- Include the suite in `extension/src/test/suite/index.js`.
- Prefer visible behavior and settings checks over private state.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Tests.HostCoverage` | `GAP-E-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/src/test/suite/markdown-flavor.test.js` | EXT-MF-E-001 through EXT-MF-E-006. |

## Definition of Done

- [ ] Host suite covers all extension e2e flavor scenarios.
- [ ] `npm run test:host` includes the suite.
- [ ] No scenario expects `ofmarkdown` language id.
