---
title: Feature — Code Actions
tags: [features/, code-actions, toc, refactoring]
aliases: [code actions, quick fixes, fg.toc, fg.createMissingFile, fg.tagToYaml]
---

# Feature — Code Actions

Code actions are offered via `textDocument/codeAction` responses and executed via `workspace/executeCommand`. flavor-grenade-lsp ships three code actions in v1, each with a distinct OFM-specific motivation.

> [!NOTE]
> Code actions are context-sensitive. Each action is only offered when its preconditions are met at the cursor position. Editors display code actions in a lightbulb popup or via a dedicated keybinding (VS Code: `Ctrl+.`; Neovim: `<leader>ca`).

## fg.toc — Table of Contents Generation

**Command identifier:** `fg.toc`

**Offered when:** The cursor is anywhere in the document and the document contains at least one heading at or below the configured `toc.max_depth` level.

**Behaviour:**

1. The code action scans the document for all headings at levels `1` through `toc.max_depth` (default: `3`).
2. It generates a Markdown list of links to those headings using Obsidian's heading-link syntax (`[[#Heading Text]]` for same-document links).
3. The TOC is wrapped in `<!-- TOC -->` and `<!-- /TOC -->` HTML comment markers.

**Insert behaviour:** If no existing `<!-- TOC -->` block is found in the document, the TOC is inserted at the cursor position. If an existing `<!-- TOC -->` block is found, the code action's label changes to `"Update Table of Contents"` and the existing block is replaced with the freshly generated TOC.

**Example output:**

```markdown
<!-- TOC -->
- [[#Introduction]]
- [[#Installation]]
  - [[#Prerequisites]]
  - [[#Steps]]
- [[#Usage]]
<!-- /TOC -->
```

**Heading link style:** Always uses `[[#Heading Text]]` (same-document wiki-link style) regardless of `completion.wiki.style`. This matches Obsidian's native TOC plugin behaviour.

**Configuration keys:**

| Key | Type | Default | Description |
|---|---|---|---|
| `toc.max_depth` | integer | `3` | Maximum heading level included in generated TOC |
| `toc.indent` | `"spaces" \| "tab"` | `"spaces"` | Indentation style for nested TOC entries |
| `toc.indent_size` | integer | `2` | Number of spaces per indent level (when `toc.indent = "spaces"`) |

---

## fg.createMissingFile — Create Missing File

**Command identifier:** `fg.createMissingFile`

**Offered when:** The cursor is inside a `[[target]]` wiki-link for which FG001 (BrokenWikiLink) has been raised — i.e., the target resolves to zero documents.

> [!TIP]
> This is one of the most useful code actions for rapid note-taking workflows: write the link first, create the note later.

**Behaviour:**

1. The server determines the intended file path from the wiki-link target and the active `completion.wiki.style`.
   - Under `file-stem` style: creates the file in the same folder as the current document.
   - Under `file-path-stem` style: creates the file at the relative path implied by the link.
   - Under `title-slug` style: creates the file with the slug as the stem in the same folder.
2. The new file is created with the following template content:

   ```markdown
   # {{link text or file stem}}
   ```

   Where `{{link text}}` is the alias portion of `[[target|link text]]` if present, otherwise the target stem.
3. The file is added to the vault index immediately (no file-watcher delay).
4. The FG001 diagnostic is cleared on the next diagnostic cycle (within `diagnostics.debounce_ms`).

**WorkspaceEdit:** The action produces a `workspace/applyEdit` call that creates the new file via `documentChanges` with a `CreateFile` operation.

**Precondition enforcement:** If the cursor is not on an FG001 diagnostic span, this action is not offered. It is never offered in single-file mode (no vault root to create the file in).

---

## fg.tagToYaml — Move Inline Tags to Frontmatter

**Command identifier:** `fg.tagToYaml`

**Offered when:** The cursor is on a `#tag` in the document body (not inside a code block, not inside a math block).

**Behaviour:**

1. The server collects the set of inline body tags selected by the user (or all body tags in the document if the code action is triggered with an empty selection spanning the whole document).
2. It reads the existing `tags:` key from the document's frontmatter (if present).
3. It merges the collected inline tags into the frontmatter `tags:` array, deduplicating. Order: existing YAML tags first, then new tags in the order they appeared in the body, alphabetically within each group.
4. It removes the inline `#tag` occurrences from the document body (only the tags being moved — the user is not forced to move all tags at once).

**Example transformation:**

Before:

```markdown
---
tags: [project]
---

This note is about #project/active work on #refactoring.
```

After:

```markdown
---
tags: [project, project/active, refactoring]
---

This note is about work on .
```

> [!WARNING]
> The inline tag removal is a destructive edit. The server does not attempt to preserve surrounding punctuation (commas, periods) around the removed tags. Users should review the edit in their editor's diff view before accepting.

**Frontmatter creation:** If the document has no frontmatter, the action creates a frontmatter block at the top of the document containing only `tags: [...]`.

**YAML style:** Tags are always written as a YAML flow sequence (`tags: [tag1, tag2]`). If the existing frontmatter uses block sequence style, the server normalises to flow sequence.

---

## Code Action Kinds

All three actions use the `source` code action kind prefix:

| Action | Kind |
|---|---|
| `fg.toc` | `source.fg.toc` |
| `fg.createMissingFile` | `quickfix.fg.createMissingFile` |
| `fg.tagToYaml` | `source.organizeImports.fg.tagToYaml` |

Using `quickfix` kind for `fg.createMissingFile` causes editors to show it in the quick-fix lightbulb when FG001 is active, which is the expected UX for a fix-this-error action.

## Related

- [[features/diagnostics]]
- [[features/completions]]
- [[ADR002-ofm-only-scope]]
- [[ADR003-vault-detection]]
- [[ofm-spec/index]]
