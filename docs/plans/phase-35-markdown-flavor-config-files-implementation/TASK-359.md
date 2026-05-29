---
id: "TASK-359"
title: "Implement extension scope prompt and .fgattributes writes"
type: task
status: partial
priority: high
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["TASK-355", "TASK-358"]
tags: [tickets/task, "phase/35", markdown-flavor, vscode]
aliases: ["TASK-359"]
---

# Implement Extension Scope Prompt And .fgattributes Writes

## Work Scope

- After flavor selection, show a second prompt with `Selected file` and
  `All Markdown files in this directory`.
- Write `.fgattributes` beside the active Markdown file.
- For selected-file scope, write a file-specific pattern such as
  `guide.md flavor=gfm`.
- For directory scope, write an anchored direct-child pattern such as
  `/*.md flavor=gfm`.
- Selecting Auto Detect removes or resets the matching scoped `flavor`
  attribute.
- Skip writes for non-file, non-`markdown`, restricted, virtual, untrusted, or
  `.fgignore`-inactive resources.
- Request server refresh after successful writes.

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `extension/src/markdown-flavor.ts` |
| Source | `extension/src/commands.ts` |
| Source | `extension/package.json` |
| Test | `extension/src/markdown-flavor.test.ts` |
| Test | `extension/src/language-mode.test.ts` |

## Definition of Done

- [x] Unit tests cover selected-file, directory, standalone, and Auto Detect
      reset writes.
- [ ] Unit tests cover skipped writes for inactive or unsafe resources.
- [ ] Selector keeps VS Code language id as `markdown`.
- [x] Refresh fires after `.fgattributes` writes.

## Workflow Log

> [!FAIL] RED - 2026-05-29
> Added extension unit tests for scope quick-pick rows, canonical selected-file
> and directory `.fgattributes` rules, upsert behavior, and same-scope Auto
> Detect reset. Expected failure: extension helper API did not exist yet.

> [!SUCCESS] GREEN - 2026-05-29
> Added pure `.fgattributes` rule helpers and wired
> `flavorGrenade.selectMarkdownFlavor` to show a second scope prompt, write or
> update `.fgattributes` beside the active file, start the server, and refresh
> language-mode flavor state. `npm run check-types` and focused extension unit
> tests pass.

> [!NOTE] PARTIAL - 2026-05-29
> Command behavior is green for file-backed Markdown documents. Inactive
> `.fgignore` resources, unsafe-resource write rejection coverage, and host UI
> proof remain in scope.
