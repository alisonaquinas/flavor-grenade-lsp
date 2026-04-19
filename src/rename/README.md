# rename/

NestJS module for heading and file-stem rename support.

Provides the two LSP methods that form the rename workflow: first the editor
calls `prepareRename` to validate the cursor and get the current symbol name,
then it calls `rename` with the new name to receive a `WorkspaceEdit`.

## Files

| File | Role |
| --- | --- |
| `rename.module.ts` | NestJS module — provides and exports `PrepareRenameHandler` and `RenameHandler` |

The handler implementations live in `src/handlers/`:
- `prepare-rename.handler.ts` — `textDocument/prepareRename`
- `rename.handler.ts` — `textDocument/rename`
- `workspace-edit-builder.ts` — helper for constructing `WorkspaceEdit` objects

## What Can Be Renamed

| Target | Rename action |
| --- | --- |
| Heading text | Updates the heading in the source file and all `[[file#Heading]]` links across the vault |
| File stem (via a wiki-link) | Renames the physical file and updates all `[[stem]]` links across the vault |
