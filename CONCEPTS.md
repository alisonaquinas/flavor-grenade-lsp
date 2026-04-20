# Concepts

## BlockAnchor

A positional marker of the form `^identifier` placed at the end of a paragraph
or list item in an OFM document. Enables `[[file#^identifier]]` deep-link
navigation. The caret sigil is not stored in the identifier; the parser captures
only the alphanumeric id. Block anchors are stored in `OFMIndex.blockAnchors`.

**See also:** [`OFMIndex`](#ofmindex), [`WikiLink`](#wikilink)

## Callout

An Obsidian-style blockquote annotation of the form `> [!TYPE]± Title`. The
type keyword (e.g. `NOTE`, `WARNING`, `TIP`) determines the visual style in
Obsidian. An optional `+` or `-` suffix makes the callout foldable. Callouts
are stored in `OFMIndex.callouts` and are a target for completion.

**See also:** [`OFMIndex`](#ofmindex)

## DiagnosticCode

A string code attached to an LSP diagnostic to identify which rule fired.
Current codes: `FG001` (broken link), `FG002` (ambiguous link), `FG003`
(malformed link), `FG006` (missing block anchor), `FG007` (frontmatter parse
error). Used by code-action handlers to match quick fixes to the diagnostics
they resolve.

**See also:** [`Oracle`](#oracle), `src/resolution/oracle.ts` (codes declared on `ResolutionResult`)

## DocId

A branded string type (`string & { readonly __brand: 'DocId' }`) representing a
vault-relative path to a document **without file extension** (e.g. `notes/MyNote`,
`daily/2026-04-17`). Used as the key in `VaultIndex` and throughout resolution.
`toDocId()` strips the `.md` extension and normalises separators to `/`.
Enforced at compile time via a type brand so that raw strings cannot be passed
as DocIds without an explicit cast.

**See also:** [`VaultIndex`](#vaultindex), `src/vault/doc-id.ts`

## Embed

A transclusion link of the form `![[target]]` or `![[image.png|200x150]]`.
Obsidian renders embeds by inlining the referenced document or image. The embed
target is resolved the same way as a wiki-link but displayed inline rather than
navigated to.

**See also:** [`WikiLink`](#wikilink), [`OFMIndex`](#ofmindex)

## Frontmatter

YAML metadata block delimited by `---` at the very start of a document. The
parser extracts it as `Record<string, unknown> | null`. A `frontmatterParseError`
flag is set when the block is present but the YAML is invalid (triggers FG007).
Frontmatter `aliases` and `tags` keys are consumed by the Oracle and TagRegistry
respectively.

**See also:** [`OFMDoc`](#ofmdoc), [`Oracle`](#oracle), [`TagRegistry`](#tagregistry)

## JsonRpcDispatcher

Central message router for the JSON-RPC 2.0 protocol. Receives raw framed
messages from `StdioReader`, looks up registered handlers by method name, and
dispatches requests/notifications. Request handlers return `Promise<unknown>`;
notification handlers return `void`. Errors are converted to JSON-RPC error
responses automatically.

**See also:** `src/transport/json-rpc-dispatcher.ts`

## OFM (Obsidian Flavored Markdown)

The superset of CommonMark used by the Obsidian note-taking app. Adds wiki-links
(`[[target]]`), embeds (`![[target]]`), tags (`#tag/sub`), block anchors (`^id`),
callouts (`> [!NOTE]`), and YAML frontmatter. This server implements LSP features
specifically for OFM syntax.

## OFMDoc

The fully parsed in-memory representation of a single document. Holds the raw
`text`, `uri`, `version`, parsed `frontmatter`, `frontmatterEndOffset`, the list
of `opaqueRegions` (math, code, comments that token parsers skip), and the
`OFMIndex` of all extracted tokens.

**See also:** [`OFMIndex`](#ofmindex), `src/parser/types.ts`

## OFMIndex

The token index extracted from an `OFMDoc`. Contains six named lists:
`wikiLinks`, `embeds`, `blockAnchors`, `tags`, `callouts`, and `headings`.
Populated by the OFM parser pipeline and stored in `VaultIndex` alongside the
document.

**See also:** [`OFMDoc`](#ofmdoc), `src/parser/types.ts`

## OpaqueRegion

A range of document text that the OFM token parsers must skip — specifically
code spans, fenced code blocks, math blocks (`$ … $`, `$$ … $$`), and HTML
comments. The opaque-region marker runs first in the parse pipeline so that
downstream parsers never misidentify e.g. `[[link]]` inside a code block.

**See also:** `src/parser/opaque-region-marker.ts`

## Oracle

The wiki-link resolution engine. Given a link target string it tries, in order:
exact DocId match → frontmatter alias match (case-insensitive) → stem suffix
match via `FolderLookup` → H1 title match. Returns a `ResolutionResult` tagged
as `resolved`, `broken` (FG001), `ambiguous` (FG002), or `malformed` (FG003).

**See also:** `src/resolution/oracle.ts`, [`DocId`](#docid)

## TagRegistry

Vault-wide index of all tag occurrences, built from both inline `#tag` tokens
and frontmatter `tags:` arrays. Supports frequency queries (`allTags`), prefix
filtering (`tagsWithPrefix`), and a slash-delimited hierarchy tree
(`hierarchy`). Used by completion and references handlers.

**See also:** `src/tags/tag-registry.ts`

## VaultIndex

In-memory `Map<DocId, OFMDoc>` that acts as the single source of truth for all
documents currently known to the server. Updated by `VaultScanner` on startup
and by `didOpen`/`didChange`/`didClose` notifications at runtime.

**See also:** `src/vault/vault-index.ts`, [`DocId`](#docid), [`OFMDoc`](#ofmdoc)

## VaultMode

One of three vault detection outcomes: `'obsidian'` (`.obsidian/` directory
found), `'flavor-grenade'` (`.flavor-grenade.toml` file found), or
`'single-file'` (no vault marker found anywhere in the tree). Determines how
the server scans for related documents.

**See also:** `src/vault/vault-detector.ts`

## WikiLink

An inter-document link of the form `[[target]]`, optionally with an alias
(`[[target|alias]]`), heading fragment (`[[target#Heading]]`), or block
reference (`[[target#^anchor]]`). The `target` string is resolved by the Oracle
to a `DocId`. WikiLinks are the primary navigation primitive in OFM.

**See also:** [`Oracle`](#oracle), [`OFMIndex`](#ofmindex), `src/parser/types.ts`
