---
title: Feature — Diagnostics
tags: [features/, diagnostics, errors, warnings]
aliases: [diagnostic rules, linting, FG codes]
---

# Feature — Diagnostics

Diagnostics are published via `textDocument/publishDiagnostics` notifications. They are recomputed after a debounce idle period — not on every keystroke — to avoid flooding the editor with intermediate states while the user is still typing.

> [!NOTE]
> Diagnostic codes are prefixed `FG` (flavor-grenade). They are distinct from OFM rule codes (which are prefixed `OFM-`) defined in [[ofm-spec/index]]. An OFM rule code identifies a language rule; an FG code identifies a diagnostic emitted when that rule is violated.

## Diagnostic Table

| Code | Name | Severity | Trigger | Suppressed when |
|------|------|----------|---------|-----------------|
| FG001 | BrokenWikiLink | Error | `[[target]]` resolves to 0 documents in the vault index | single-file mode |
| FG002 | AmbiguousWikiLink | Error | `[[target]]` resolves to 2 or more documents | single-file mode |
| FG003 | MalformedWikiLink | Error | `[[]]` (empty target), `[[target\n]]` (newline in target), or any syntactically invalid wiki-link per OFM parser | never |
| FG004 | BrokenEmbed | Warning | `![[target]]` resolves to 0 files in the vault index | single-file mode |
| FG005 | BrokenBlockRef | Error | `[[doc#^id]]` resolves to a document but `^id` is not found in that document's block anchor index | single-file mode |
| FG006 | NonBreakableWhitespace | Warning | A U+00A0 (non-breaking space) character appears immediately after the `#` marker of a heading line, causing Obsidian to not render it as a heading | never |
| FG007 | MalformedFrontmatter | Warning | The YAML block between the opening `---` and closing `---` fails YAML parsing | never |

## Per-Diagnostic Specification

### FG001 — BrokenWikiLink

**Severity:** Error

**Trigger:** The OFM parser produces a `WikiLinkNode` with a `target` field. The reference resolver queries the vault index for documents matching the target using the active `completion.wiki.style` resolution rules. If zero documents match, FG001 is raised on the `[[target]]` span.

**Range:** The full `[[target]]` span, including delimiters.

**Message template:** `"No document found for '{{target}}' in vault"`

**Suppressed when:** The server is in single-file mode (no vault index available). Cross-file resolution is meaningless without an index, so raising this diagnostic would produce universally false positives.

**Related information:** Not applicable (zero candidates means there is nothing to point to).

**Fix:** The `fg.createMissingFile` code action is offered when FG001 is active (see [[features/code-actions]]).

---

### FG002 — AmbiguousWikiLink

**Severity:** Error

**Trigger:** Same resolution process as FG001. If two or more documents match the target, FG002 is raised.

**Range:** The full `[[target]]` span.

**Message template:** `"Ambiguous wiki-link '{{target}}': matches {{count}} documents"`

**Related information:** The diagnostic carries `relatedInformation` entries pointing to each ambiguous match location (the first line of each matching document). This allows editors that display related information (VS Code, Neovim with `vim.diagnostic.open_float`) to show all candidates in context.

**Suppressed when:** single-file mode.

**Fix:** The user should qualify the link with a folder path or use `file-path-stem` style. No automated code action is provided because there is no unambiguous resolution to offer.

---

### FG003 — MalformedWikiLink

**Severity:** Error

**Trigger:** The OFM parser encounters a `[[` sequence but cannot produce a valid `WikiLinkNode`. This includes: `[[]]` (empty target), a target containing a raw newline, a `[[` with no matching `]]` before end-of-block, or a nested `[[` inside a target.

**Range:** As much of the malformed sequence as was parsed before the error.

**Suppressed when:** Never. Malformed syntax is always reported regardless of vault mode.

---

### FG004 — BrokenEmbed

**Severity:** Warning (not Error, because Obsidian shows a placeholder rather than breaking the document for unresolved embeds)

**Trigger:** The OFM parser produces an `EmbedNode` with a `target` field. The resolver queries the vault index for files matching the target (including non-`.md` files: images, PDFs, audio). If zero files match, FG004 is raised.

**Range:** The full `![[target]]` span.

**Message template:** `"No file found for embed '{{target}}' in vault"`

**Suppressed when:** single-file mode.

---

### FG005 — BrokenBlockRef

**Severity:** Error

**Trigger:** The OFM parser produces a `WikiLinkNode` with both a `target` and a `blockRef` field (i.e., `[[doc#^id]]`). The resolver first resolves `doc` to a document. If the document resolves successfully, the resolver then checks the `BlockAnchorDef` index for that document. If `^id` is not found, FG005 is raised.

**Range:** The `#^id` portion of the span (not the full `[[doc#^id]]`).

**Message template:** `"Block anchor '^{{id}}' not found in '{{doc}}'"`

**Suppressed when:** single-file mode. If the `doc` portion also fails to resolve (FG001 would fire), FG005 is suppressed — only one diagnostic is raised per wiki-link.

---

### FG006 — NonBreakableWhitespace

**Severity:** Warning

**Trigger:** The OFM parser detects a heading line (line beginning with one or more `#` characters followed by whitespace and text) where the whitespace character immediately following the final `#` is U+00A0 (non-breaking space, `\u00a0`) rather than U+0020 (ordinary space). Obsidian's renderer does not recognise U+00A0 as the separator between the `#` marker and the heading text, so the line is rendered as a paragraph beginning with `#`.

**Range:** The U+00A0 character span.

**Message template:** `"Non-breaking space after heading marker — Obsidian will not render this as a heading"`

**Suppressed when:** Never. This is a syntactic issue independent of vault state.

---

### FG007 — MalformedFrontmatter

**Severity:** Warning

**Trigger:** The document begins with `---` on the first line. The parser extracts the block between the opening `---` and the next `---`. A YAML parser (js-yaml or the equivalent) attempts to parse the block. If parsing throws, FG007 is raised.

**Range:** The entire frontmatter block, from the first `---` to the closing `---` inclusive.

**Message template:** `"YAML parse error in frontmatter: {{yamlErrorMessage}}"`

**Suppressed when:** Never.

## Debounce Behaviour

Diagnostics are not published synchronously with `textDocument/didChange`. Instead:

1. On each `didChange`, the debounce timer is reset to `diagnostics.debounce_ms` (default: `300`).
2. When the timer fires (no further changes within the window), the document is re-parsed and all diagnostics are recomputed.
3. A fresh `textDocument/publishDiagnostics` notification is sent with the complete updated list.

This prevents the editor from flickering diagnostics between keystrokes in the middle of a word or link.

## Configuration Keys

| Key | Type | Default | Description |
|---|---|---|---|
| `diagnostics.debounce_ms` | integer | `300` | Milliseconds of idle time before diagnostics are published |
| `diagnostics.enabled` | boolean | `true` | Master switch — set to `false` to disable all diagnostics |

## Related

- [[ADR002-ofm-only-scope]]
- [[ADR003-vault-detection]]
- [[ADR006-block-ref-indexing]]
- [[features/code-actions]]
- [[features/navigation]]
- [[ofm-spec/index]]
- [[requirements/wiki-link-resolution]]
- [[requirements/block-references]]
