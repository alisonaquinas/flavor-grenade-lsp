---
title: Feature — Completions
tags: [features/, completions, wiki-link, tags, callout]
aliases: [completion provider, autocomplete, wiki-link completion]
---

# Feature — Completions

The completion provider responds to `textDocument/completion` requests and supplies context-aware candidates for all OFM-specific constructs. It is the primary discoverability mechanism for vault structure.

## Trigger Characters

The server advertises the following trigger characters in its `completionProvider` capability:

| Character | Context |
|---|---|
| `[` | Wiki-links (`[[`), embeds (`![[`), inline links (`[text](`) |
| `#` | Tags (`#tagname`), heading refs within wiki-links (`[[doc#`) |
| `(` | Inline Markdown link URL (`[text](`) |
| `!` | Embeds (`![[`) |

Trigger characters cause the editor to send a `textDocument/completion` request automatically without the user pressing a hotkey. Manual invocation (e.g., `Ctrl+Space`) also works at any position.

## Wiki-Link Completion

**Trigger:** the cursor is inside a `[[` sequence and the user has typed zero or more characters of the target document name.

**Candidates:** all documents in the vault index (all `.md` files) whose name, path, or aliases match the typed prefix. In single-file mode this provider is disabled and returns an empty list.

**Insert text style:** determined by `completion.wiki.style` (default `"file-stem"` per [[ADR005-wiki-style-binding]]):

| Style | Insert text example | Label |
|---|---|---|
| `file-stem` | `my-note` | `my-note` |
| `title-slug` | `My Heading Title` | `My Heading Title` |
| `file-path-stem` | `projects/my-note` | `projects/my-note` |

When two documents share the same stem (disambiguation required), the completion label always includes the folder qualifier (`projects/my-note`) regardless of style. The `insertText` still uses the configured style; the label is for display only.

Each completion item sets `kind: File` and includes `detail` with the vault-relative path and `documentation` with the first paragraph of the target document (fetched from the index — no disk read at completion time).

## Wiki-Link Heading Completion

**Trigger:** the cursor is inside `[[doc#` — the document portion has been resolved (i.e., `doc` matches exactly one document in the vault), and the user has typed `#` to begin a heading reference.

**Candidates:** all headings in the resolved document, in document order, offered as completion items. The insert text is the heading text without the `#` prefix, URL-encoded if the heading contains spaces (Obsidian uses `%20`).

**When the document is unresolved** (zero or ambiguous matches for the `doc` portion), heading completion is suppressed and an informational item is shown: `"Document not found — heading completion unavailable"`.

## Wiki-Link Block Reference Completion

**Trigger:** the cursor is inside `[[doc#^` — the document portion resolves, and the user has typed `#^` to begin a block reference.

**Candidates:** all `^blockid` anchors indexed for the resolved document, per [[ADR006-block-ref-indexing]]. Items are labelled with the anchor id and include the block's text as documentation preview.

**When no block anchors exist** in the target document, an informational item is shown: `"No block anchors in this document"`.

## Tag Completion

**Trigger:** the cursor is on a `#` character in a body position (not inside a code block, not inside frontmatter, not inside a wiki-link heading reference).

**Candidates:** all tags in the vault tag index, including nested hierarchical tags. Hierarchy is flattened: both `project` and `project/active` appear as separate candidates. Typing `#proj` narrows to all tags matching `proj` as a prefix.

**Insert text:** the full tag path without the leading `#`. Completion applies the `#` from the already-typed trigger; the server does not add it again.

**In single-file mode:** tag completion still works but only offers tags found in the current document (since no vault index is available).

## Callout Type Completion

**Trigger:** the cursor is on `[!` immediately after `> ` at the beginning of a blockquote line.

> [!NOTE]
> Callout type completion is NOT a wiki-link completion. The trigger pattern is `> [!` in blockquote context, distinct from `[[` wiki-link context.

**Candidates:** all 23 standard Obsidian callout types, in the order Obsidian displays them:

| Type | Aliases |
|---|---|
| `NOTE` | `note` |
| `TIP` | `tip`, `hint`, `important` |
| `INFO` | `info` |
| `SUCCESS` | `success`, `check`, `done` |
| `QUESTION` | `question`, `help`, `faq` |
| `WARNING` | `warning`, `caution`, `attention` |
| `FAILURE` | `failure`, `fail`, `missing` |
| `DANGER` | `danger`, `error` |
| `BUG` | `bug` |
| `EXAMPLE` | `example` |
| `QUOTE` | `quote`, `cite` |
| `ABSTRACT` | `abstract`, `summary`, `tldr` |

Each candidate inserts the callout type in uppercase (e.g., `NOTE`) and sets the cursor after the `]` for the title text.

## Inline Markdown Link Completion

**Trigger:** the cursor is inside `](` — completing the URL portion of a standard Markdown inline link `[text](url)`.

**Candidates:** same as wiki-link completion — vault documents by configured style. This allows users who prefer Markdown-standard links over wiki-links to still get vault-aware completions.

## Candidate Cap and Pagination

The maximum number of completion candidates returned in a single response is controlled by `completion.candidates` (default: `50`).

When the number of matching candidates exceeds the cap, the response sets `isIncomplete: true`. This signals to the editor that the list is not exhaustive and that further typing will narrow the candidates — the server will return a fresh, more specific list on the next request.

> [!TIP]
> Setting `completion.candidates = 0` disables the cap entirely. This is not recommended for large vaults as it may cause editor lag when the trigger character fires at the start of a document name.

## Configuration Keys

| Key | Type | Default | Description |
|---|---|---|---|
| `completion.wiki.style` | `"file-stem" \| "title-slug" \| "file-path-stem"` | `"file-stem"` | Wiki-link completion insert text style |
| `completion.candidates` | integer | `50` | Maximum completion candidates per request |

## Related

- [[ADR005-wiki-style-binding]]
- [[ADR006-block-ref-indexing]]
- [[features/diagnostics]]
- [[features/semantic-tokens]]
- [[requirements/wiki-link-resolution]]
- [[ofm-spec/index]]
