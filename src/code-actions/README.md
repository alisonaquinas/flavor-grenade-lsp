# code-actions/

Code action handler and quick-fix action implementations.

Code actions are editor commands triggered by a diagnostic or by the user
requesting available actions at the cursor. This module dispatches to the
right action based on the diagnostic code or context.

## Files

| File | Role |
| --- | --- |
| `code-action.handler.ts` | Handles `textDocument/codeAction` — collects applicable actions for the given range and diagnostics |
| `create-missing-file.action.ts` | Quick fix for FG001 (broken link) — creates the missing target file |
| `fix-nbsp.action.ts` | Replaces non-breaking spaces with regular spaces |
| `tag-to-yaml.action.ts` | Moves inline `#tags` from document body to YAML frontmatter `tags:` array |
| `toc-generator.action.ts` | Inserts a Markdown table-of-contents generated from the document's heading hierarchy |
| `code-actions.module.ts` | NestJS module |

## Action Triggers

| Action | Trigger |
| --- | --- |
| `CreateMissingFileAction` | FG001 diagnostic on a wiki-link |
| `FixNbspAction` | Cursor on or near a non-breaking space character |
| `TagToYamlAction` | Cursor on an inline `#tag` |
| `TocGeneratorAction` | Cursor anywhere in a document with headings |
