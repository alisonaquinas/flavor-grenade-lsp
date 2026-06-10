---
id: "TASK-360"
title: "Add end-to-end config-file acceptance coverage"
type: task
status: green
priority: high
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["TASK-355", "TASK-356", "TASK-357", "TASK-358", "TASK-359"]
tags: [tickets/task, "phase/35", markdown-flavor, tests]
aliases: ["TASK-360"]
---

# Add End-To-End Config-File Acceptance Coverage

## Work Scope

- Convert planned BDD scenarios for `.mdfignore` and `.mdfattributes` into
  executable scenarios.
- Add integration coverage proving spawned-server behavior sees config-file
  changes.
- Add extension tests proving selector writes and refresh behavior.
- Update test matrices and evidence artifacts only after tests exist.

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Test | `docs/bdd/features/ofmarkdown-language-mode.feature` |
| Test | `docs/bdd/features/workspace.feature` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `extension/src/markdown-flavor.test.ts` |
| Docs | `docs/test/matrix.md` |
| Docs | `extension/docs/tests/matrix.md` |

## Definition of Done

- [x] BDD proves ignored files are inactive.
- [x] BDD proves `.mdfattributes` selected-file and directory behavior.
- [x] Integration tests prove config-file refresh affects effective context.
- [x] Extension tests prove selector writes and refreshes.
- [x] Evidence rows no longer mark implemented behavior as planned.

## Workflow Log

> [!SUCCESS] GREEN - 2026-05-29
> BDD coverage in `docs/bdd/features/workspace.feature` proves root and nested
> `.mdfignore` behavior, re-inclusion, and ignored-open-document inactivity.
> `docs/bdd/features/ofmarkdown-language-mode.feature` covers selected-file and
> directory `.mdfattributes` writes. `src/test/integration/markdown-flavor.test.ts`
> proves spawned-server refresh after `.mdfattributes` changes and rejection of
> legacy flavor payload overrides. Extension tests cover selector rule creation,
> refresh-only server propagation, `.mdfignore` inactive status, and local
> evidence cascades. `bun run bdd`, focused integration tests, and extension
> tests pass.
