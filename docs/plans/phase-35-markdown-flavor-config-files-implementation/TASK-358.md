---
id: "TASK-358"
title: "Remove legacy file and directory flavor assignment paths"
type: task
status: open
priority: high
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["TASK-357"]
tags: [tickets/task, "phase/35", markdown-flavor, legacy-removal]
aliases: ["TASK-358"]
---

# Remove Legacy File And Directory Flavor Assignment Paths

## Work Scope

- Stop treating `.flavor-grenade.*` and `.editorconfig` as file/directory
  flavor assignment sources.
- Stop using global or workspace-folder VS Code flavor settings as persistent
  file/directory flavor assignment.
- Keep non-flavor operational configuration intact.
- Remove or quarantine client resource propagation code that exists only to
  persist effective flavor assignment.
- Preserve compatibility only where needed for transient server refresh
  notifications, not as an assignment source.

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/markdown-flavor/project-markdown-config-files.ts` |
| Source | `src/markdown-flavor/project-markdown-flavor-config.ts` |
| Source | `src/lsp/handlers/configuration.handler.ts` |
| Source | `extension/src/markdown-flavor.ts` |
| Test | `src/lsp/handlers/__tests__/configuration.handler.test.ts` |
| Test | `extension/src/markdown-flavor.test.ts` |

## Definition of Done

- [ ] Legacy flavor config files no longer change effective flavor.
- [ ] VS Code settings do not persist file/directory flavor assignments.
- [ ] Operational config remains available for unrelated server settings.
- [ ] Stale docs/test references are updated to the new model.
