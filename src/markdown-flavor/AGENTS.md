# AGENTS.md — src/markdown-flavor/

Server-side Markdown flavor selection, profile metadata, and resource-specific
effective flavor state live here.

## Layout

```text
src/markdown-flavor/
├── index.ts                         # Barrel exports for flavor services and contracts
├── mdf-config-files.ts               # Confined .mdfignore/.mdfattributes resolver
├── markdown-flavor-contract.ts      # Flavor ids, selector values, labels, and guards
├── markdown-flavor-profiles.ts      # Static profile registry for explicit flavors
├── markdown-flavor-state.ts         # Effective flavor resolution from config outcome and Auto Detect
├── non-local-boundary-classifier.ts # Host/non-local boundary classification
└── project-markdown-config-files.ts # Flavor Grenade vault marker list
```

## Workflows

### Adding a Markdown flavor

1. Add the explicit id and label in `markdown-flavor-contract.ts`.
2. Add the profile in `markdown-flavor-profiles.ts` with source documents and
   parser capability metadata.
3. Add or update parser, handler, and BDD coverage for the behavior that is no
   longer just metadata.
4. Update feature docs and flavor matrices under `docs/features/` and
   `docs/test/`.
5. Run `bun test`, `bun run typecheck`, and `bun run lint`.

### Changing flavor resolution

1. Update `markdown-flavor-state.ts` and keep resource keys URI-specific.
2. Update `mdf-config-files.ts` only if `.mdfignore` / `.mdfattributes`
   interpretation changes.
3. Add unit coverage for explicit, auto, standalone, and vault cases.
4. Run the Markdown flavor BDD and spawned integration tests.

## Invariants

- `auto` is never a `MarkdownFlavorId`; it resolves to an explicit effective
  flavor before handlers use it.
- Resource-specific state must not leak between vaults, workspace folders, or
  standalone documents.
- `.mdfignore` and `.mdfattributes` reads must stay bounded and confined to the
  vault root.
- Unsupported host or non-local references must be classified before resolution
  or rename code can create diagnostics or edits.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [README.md](./README.md)
- [ADR020](../../docs/adr/ADR020-markdown-flavor-selection.md)
