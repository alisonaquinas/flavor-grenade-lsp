# Concepts

This file defines the short vocabulary used in the server code and root
documentation. The detailed domain model lives under `docs/`.

## Attachment

A non-Markdown vault file that can be referenced by an embed or Markdown image
link. Examples include images, PDFs, audio files, and other local files.
Attachments are indexed separately from Markdown documents so image links can
resolve without being treated as notes.

See also: `VaultIndex`, `Embed`, `MarkdownImage`.

## BlockAnchor

A positional marker of the form `^identifier` placed at the end of a paragraph,
list item, heading, or on a standalone anchor line in an OFM document. It makes
that block addressable through links such as `[[file#^identifier]]`.

The caret sigil is not stored in the identifier. Block anchors are stored in
`OFMIndex.blockAnchors`.

See also: `OFMIndex`, `WikiLink`.

## Callout

An Obsidian-style blockquote annotation of the form `> [!TYPE]` with optional
fold state and title text. The type keyword, such as `NOTE`, `WARNING`, or
`TIP`, determines the visual style in Obsidian. Callouts are stored in
`OFMIndex.callouts` and participate in completion, symbols, semantic tokens,
and folding.

See also: `OFMIndex`.

## DiagnosticCode

A string code attached to an LSP diagnostic. Current codes are:

- `FG001`: broken wiki-link, Markdown note link, or heading target
- `FG002`: ambiguous wiki-link, Markdown note link, attachment, or heading
  target
- `FG003`: malformed wiki-link
- `FG004`: broken embed, Markdown image, or attachment target
- `FG005`: missing block anchor target
- `FG006`: non-breaking space in document body text
- `FG007`: malformed YAML frontmatter

Diagnostic codes are consumed by code-action handlers so quick fixes can match
the diagnostics they resolve.

See also: `Oracle`, `src/resolution/diagnostic-service.ts`.

## DocId

A branded string type representing a vault-relative path to a Markdown document
without the `.md` extension. Examples are `notes/MyNote` and
`daily/2026-04-17`.

`toDocId()` strips the `.md` extension and normalizes path separators to `/`.
DocIds are used as keys in `VaultIndex` and throughout reference resolution.

See also: `VaultIndex`, `src/vault/doc-id.ts`.

## Embed

A transclusion link of the form `![[target]]` or `![[image.png|200x150]]`.
Embeds can target notes, headings, block anchors, and local attachments. Broken
embed or attachment targets produce `FG004`.

See also: `WikiLink`, `Attachment`, `OFMIndex`.

## Frontmatter

A YAML metadata block delimited by `---` at the very start of a document. The
parser stores it as `Record<string, unknown> | null` and sets
`frontmatterParseError` when YAML parsing fails.

Frontmatter `aliases` participate in Oracle resolution. Frontmatter `tags`
participate in the vault-wide tag registry. Frontmatter parsing has size,
alias-count, and prototype-pollution safeguards.

See also: `OFMDoc`, `Oracle`, `TagRegistry`.

## JsonRpcDispatcher

The central message router for JSON-RPC 2.0. It receives framed messages from
the stdio transport, looks up registered request or notification handlers, and
converts thrown errors into JSON-RPC error responses.

All request handlers registered with the dispatcher return `Promise<unknown>`.

See also: `src/transport/json-rpc-dispatcher.ts`.

## MarkdownImage

A standard Markdown image token of the form `![alt](target "title")`.
Local image and attachment targets are classified and resolved against the vault
attachment index. External URLs are ignored by vault diagnostics.

See also: `Attachment`, `MarkdownLink`, `OFMIndex`.

## MarkdownLink

A standard Markdown inline link of the form `[text](target "title")`.
Local Markdown targets, file-plus-fragment targets, and same-document fragments
participate in definition, diagnostics, document links, references, and heading
rename behavior. External URLs and unsupported schemes do not create vault
diagnostics.

See also: `LinkLabel`, `Oracle`, `OFMIndex`.

## LinkLabel

A reference-style Markdown label use or definition. The parser indexes
`[text][label]`, `[label][]`, shortcut labels, and definitions of the form
`[label]: target "title"`. Labels are matched document-locally with normalized
case-insensitive keys.

See also: `MarkdownLink`, `OFMIndex`.

## OFM

Obsidian Flavored Markdown. In this repository, OFM means Markdown plus the
Obsidian constructs used by vaults: wiki-links, embeds, block anchors, callouts,
frontmatter, tags, comments, math, and Templater regions.

## OFMDoc

The fully parsed in-memory representation of one document. It stores the raw
text, URI, LSP version, parsed frontmatter, frontmatter body offset,
opaque regions, and the `OFMIndex`.

See also: `OFMIndex`, `src/parser/types.ts`.

## OFMIndex

The token index extracted from an `OFMDoc`. It currently contains:

- `wikiLinks`
- `embeds`
- `blockAnchors`
- `tags`
- `callouts`
- `headings`
- `markdownLinks`
- `markdownImages`
- `linkLabelRefs`
- `linkLabelDefs`

The parser rebuilds the index atomically when a document changes. `VaultIndex`
stores the parsed document and its index.

See also: `OFMDoc`, `src/parser/types.ts`.

## OpaqueRegion

A range of document text that OFM token parsers must skip. Opaque regions cover
code spans, fenced code blocks, indented code blocks, math, Obsidian comments,
HTML comments, and Templater blocks.

The opaque-region pass runs before token parsers so constructs such as
`[[link]]` inside code or comments are ignored.

See also: `src/parser/opaque-region-marker.ts`.

## Oracle

The resolution service for wiki-link and local Markdown targets. For wiki-links
it normalizes slashes and a trailing `.md` extension, then tries exact DocId
match, case-insensitive DocId match, Obsidian-style path-suffix match,
frontmatter alias match, stem match, and H1 title match. The path-suffix step
only applies to path-like targets and matches on `/` boundaries, so
`[[sources/foo]]` can resolve to `wiki/sources/foo.md` while
`super-sources/foo.md` is not a match. It returns resolved, broken, ambiguous,
or malformed results with the appropriate diagnostic code.

For standard Markdown targets, the Oracle resolves same-document fragments,
local note paths, file-plus-fragment targets, and heading anchors after target
classification.

See also: `src/resolution/oracle.ts`, `DocId`.

## TagRegistry

The vault-wide index of all tag occurrences, built from inline `#tag` tokens
and frontmatter `tags:` arrays. It supports frequency queries, prefix filtering,
and slash-delimited hierarchy lookup.

See also: `src/tags/tag-registry.ts`.

## VaultIndex

The in-memory index of documents and attachments known to the server.
`VaultIndex` is the single source of truth for parsed `OFMDoc` objects. Handlers
read from it rather than maintaining separate document caches.

The index is populated by the initial vault scan and updated from open, change,
close, and file-watcher events.

See also: `src/vault/vault-index.ts`, `DocId`, `OFMDoc`.

## VaultMode

The outcome of vault detection:

- `obsidian`: a `.obsidian/` directory was found
- `flavor-grenade`: a `.flavor-grenade.toml` file was found
- `single-file`: no vault marker was found

Single-file mode keeps local parsing features available and suppresses
vault-wide diagnostics that would otherwise become false positives.

See also: `src/vault/vault-detector.ts`.

## WikiLink

An Obsidian link of the form `[[target]]`, optionally with an alias, heading
fragment, or block reference. Examples include `[[target|display]]`,
`[[target#Heading]]`, `[[target#^anchor]]`, `[[#Heading]]`, and
`[[#^anchor]]`.

Wiki-links are the primary OFM navigation primitive and are resolved by the
Oracle.

See also: `Oracle`, `OFMIndex`, `src/parser/types.ts`.
