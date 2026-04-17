---
title: Feature — Rename Refactoring
tags: [features/, rename, refactoring]
aliases: [rename, file rename, heading rename, refactoring]
---

# Feature — Rename Refactoring

Rename refactoring updates all references to a named entity across the vault when the entity is renamed. It is implemented via two LSP methods: `textDocument/prepareRename` (validate that the cursor is on something renameable and return its current name) and `textDocument/rename` (compute the `WorkspaceEdit` that applies all changes).

> [!WARNING]
> Rename refactoring is only available in vault mode. In single-file mode, `textDocument/prepareRename` returns a `ResponseError` with code `InvalidRequest` and the message `"Rename requires vault mode"`. This prevents misleading partial renames where only the current document is updated.

## Prepare Rename

`textDocument/prepareRename` is called before `textDocument/rename`. Its job is to:

1. Determine whether the cursor is on a renameable entity.
2. Return the current name and the range it occupies.

If the cursor is **not** on a renameable entity, the server returns `null`, which the editor interprets as "rename not applicable here" and shows an appropriate message.

### Renameable Positions

| Cursor position | Renameable entity | Returned range |
|---|---|---|
| On a heading line (`## My Heading`) | The heading text | From character after `## ` to end of heading text |
| Inside a `[[target]]` wiki-link target segment | The target document name | The target segment span |
| On a `^blockid` anchor | The block id | The `blockid` portion (after `^`) |

### Non-Renameable Positions

The following positions cause `textDocument/prepareRename` to return `null`:

- Cursor in body text (not on a heading or wiki-link)
- Cursor inside a fenced code block
- Cursor inside a math block (`$$` or `$`)
- Cursor inside an Obsidian comment (`%% ... %%`)
- Cursor inside a callout type (`[!TYPE]`)
- Cursor on a tag (`#tag`) — tag rename is not supported in v1 (would require renaming across all documents simultaneously and updating YAML frontmatter)

## Heading Rename

**Trigger:** Cursor on a heading line; user invokes rename.

**Scope:** All occurrences of `[[currentdoc#Old Heading]]` and `[[#Old Heading]]` (same-document heading links) across the entire vault.

**WorkspaceEdit produced:**

1. The heading line in the current document: replace `Old Heading` with `New Heading`.
2. For every `[[currentdoc#Old Heading]]` reference found in the vault (via `RefGraph`): replace the heading segment with `New Heading`.
3. For every `[[#Old Heading]]` same-document reference in the current document: replace with `[[#New Heading]]`.

**Style binding:** Heading rename does not depend on `completion.wiki.style` because heading references always use the heading text verbatim after `#`, regardless of the active wiki-link style.

## File Rename

File rename is triggered by the `workspace/willRenameFiles` notification, which the editor sends before performing the actual filesystem rename. The server computes and returns a `WorkspaceEdit` that updates all wiki-link references to the old file name.

**Scope:** All `[[old-stem]]`, `[[old-stem#heading]]`, `[[old-stem#^id]]`, `![[old-stem]]`, and any aliases for the old document across the vault.

**WorkspaceEdit produced:**

For each occurrence of the old file name in `RefGraph`:
- Replace the target segment with the new file stem (or path-stem, depending on `completion.wiki.style`).
- Preserve the heading and block-ref segments if present.
- Preserve any alias segment (`|alias`) unchanged.

**Example:**

Old file: `projects/old-name.md`
New file: `projects/new-name.md`

| Before | After |
|---|---|
| `[[old-name]]` | `[[new-name]]` |
| `[[old-name#Introduction]]` | `[[new-name#Introduction]]` |
| `[[old-name#^abc123]]` | `[[new-name#^abc123]]` |
| `![[old-name]]` | `![[new-name]]` |
| `[[old-name\|My Label]]` | `[[new-name\|My Label]]` |

**Style binding:** Under `file-path-stem` style, the full relative path is updated. Under `file-stem` style, only the stem portion is updated. Under `title-slug` style, if the document's H1 heading has not changed, no update to title-slug links is needed — the server checks this explicitly before generating the edit.

## Limitations

The following rename scenarios are explicitly not supported in v1:

| Scenario | Reason |
|---|---|
| Cross-folder renames (moving a file to a different folder) | Handled by the editor's file manager; the server only updates link text, not file paths |
| Tag rename | Requires simultaneous updates to YAML frontmatter and body text across all documents; deferred to post-v1 |
| Alias rename | Aliases are YAML values; rename of an alias would require YAML editing; deferred |
| Block id rename | Supported only when cursor is on the `^blockid` anchor itself; rename from the `[[doc#^id]]` reference side is not supported |

## prepare-rename Error Responses

| Scenario | Error code | Error message |
|---|---|---|
| Single-file mode | `InvalidRequest` | `"Rename requires vault mode"` |
| Cursor on non-renameable position | `null` response | (no error; editor handles gracefully) |
| Document not saved (unsaved buffer rename) | `InvalidRequest` | `"Save the document before renaming"` |

## Related

- [[ADR005-wiki-style-binding]]
- [[ADR006-block-ref-indexing]]
- [[features/navigation]]
- [[features/diagnostics]]
- [[concepts/symbol-model]]
- [[requirements/wiki-link-resolution]]
