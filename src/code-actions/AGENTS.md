# AGENTS.md — src/code-actions/

## Purpose

Implements all `textDocument/codeAction` quick fixes. Each action is a
separate class that encapsulates one transformation.

## Layout

```
code-actions/
├── code-action.handler.ts          # LSP request handler — collects and returns actions
├── create-missing-file.action.ts   # FG001 quick fix
├── fix-nbsp.action.ts              # non-breaking space replacement
├── tag-to-yaml.action.ts           # inline tags → frontmatter
├── toc-generator.action.ts         # heading → TOC insertion
├── code-actions.module.ts
└── __tests__/
```

## Invariants

- Each action class must be independently instantiable and testable. Actions
  must not depend on each other.
- `CodeActionHandler` must return an empty array (not `null`) when no actions
  apply to the given range/diagnostics.
- Actions that create or modify files must produce a `WorkspaceEdit` — they
  must not perform direct file I/O.

## Workflows

- **Adding a new action**: create the action class, add it to
  `code-actions.module.ts`, inject it in `CodeActionHandler`, add a
  condition in the handler's action-selection logic.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [CONCEPTS.md](../../CONCEPTS.md) — DiagnosticCode
