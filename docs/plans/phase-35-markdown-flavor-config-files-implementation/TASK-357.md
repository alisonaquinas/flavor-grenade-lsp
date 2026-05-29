---
id: "TASK-357"
title: "Refactor effective flavor resolution around config outcome and Auto Detect"
type: task
status: partial
priority: high
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["TASK-355"]
tags: [tickets/task, "phase/35", markdown-flavor, auto-detection]
aliases: ["TASK-357"]
---

# Refactor Effective Flavor Resolution Around Config Outcome And Auto Detect

## Work Scope

- Split effective flavor resolution into visibility, configuration resolution,
  and Auto Detect stages.
- Treat `.fgattributes` concrete `flavor` values as effective flavor inputs.
- Treat `flavor=auto`, `!flavor`, and absent flavor as requests to run Auto
  Detect.
- Keep Auto Detect inputs limited to document, workspace, marker,
  server-membership, and syntax/context evidence.
- Resolve structured profile flags independently from the base flavor.

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/markdown-flavor/markdown-flavor-state.ts` |
| Source | `src/markdown-flavor/syntax-inference.ts` |
| Source | `src/markdown-flavor/structured-profiles.ts` |
| Test | `src/markdown-flavor/__tests__/markdown-flavor-state.test.ts` |
| Test | `src/lsp/handlers/__tests__/configuration.handler.test.ts` |

## Definition of Done

- [ ] Auto Detect tests prove it does not parse or inspect `.fgattributes`.
- [x] Obsidian marker still resolves to `obsidian` when config requests Auto
      Detect.
- [x] Generic visible Markdown still resolves to `commonmark`.
- [ ] Structured profile flags can layer over every effective base flavor.

## Workflow Log

> [!FAIL] RED - 2026-05-29
> Status set to `red`. Added didOpen/didChange tests that expect
> `.fgattributes` rules to set parse context effective flavor. Expected
> failure: handlers do not yet read `FlavorGrenadeConfigFiles`.

> [!SUCCESS] GREEN - 2026-05-29
> Status set to `green`. `DidOpenHandler`, `DidChangeHandler`, and
> `ConfigurationHandler` now pass resolved `.fgattributes` outcome to
> `MarkdownFlavorState`; concrete `.fgattributes` flavors win before Auto
> Detect, while `flavor=auto` still falls through. Focused handler tests,
> typecheck, and lint pass.

> [!NOTE] PARTIAL - 2026-05-29
> Status corrected to `partial`. Parse-context wiring is green, but explicit
> proof that Auto Detect does not inspect `.fgattributes` and full
> structured-profile layering coverage remain in scope.
