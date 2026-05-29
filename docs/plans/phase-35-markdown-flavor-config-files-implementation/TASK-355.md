---
id: "TASK-355"
title: "Implement .fgignore and .fgattributes parser/resolver"
type: task
status: green
priority: high
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["FEAT-061"]
tags: [tickets/task, "phase/35", markdown-flavor, configuration]
aliases: ["TASK-355"]
---

# Implement .fgignore And .fgattributes Parser/Resolver

## Work Scope

- Create a server-side config-file resolver for `.fgignore` and `.fgattributes`.
- Discover config files from vault root to the target file's directory.
- Confine each candidate realpath to the active vault/workspace boundary before
  reading it.
- Enforce size limits and reject malformed or dangerous contents without
  logging file contents.
- Support Git-style comments, escaping, anchored patterns, unanchored patterns,
  directory patterns, `*`, `?`, `**`, and negation.
- Resolve `.fgattributes` attributes per key: `flavor`,
  `structured_profiles`, `!flavor`, and `!structured_profiles`.

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/markdown-flavor/fg-config-files.ts` |
| Source | `src/markdown-flavor/project-markdown-config-files.ts` |
| Source | `src/markdown-flavor/project-markdown-flavor-config.ts` |
| Test | `src/markdown-flavor/__tests__/fg-config-files.test.ts` |

## Definition of Done

- [x] RED tests cover root, nested, negated, anchored, directory, and reset
      patterns.
- [x] Invalid values are treated as absent configuration.
- [x] `flavor=auto` is preserved as a configured request for Auto Detect.
- [x] Structured profile values accept `auto`, `none`, and compatible profile
      lists.

## Workflow Log

> [!FAIL] RED - 2026-05-29
> Status set to `red`. Added focused resolver tests for default Auto Detect
> state, `.fgignore` ignore/re-include behavior, nested rules, `.fgattributes`
> cascades, invalid values, and vault-boundary rejection. Expected failure:
> resolver module is not implemented yet.

> [!SUCCESS] GREEN - 2026-05-29
> Status set to `green`. Added `FlavorGrenadeConfigFiles` with confined reads,
> Git-style pattern matching, `.fgignore` visibility resolution, and
> `.fgattributes` attribute cascade. Focused tests, typecheck, and lint pass.
