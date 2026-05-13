---
title: Marksman Feature Parity For OFMarkdown
tags:
  - research/marksman
  - research/ofmarkdown
  - roadmap/parity
aliases:
  - Marksman Parity Research
  - OFMarkdown Feature Parity
updated: 2026-05-06
---

# Marksman Feature Parity For OFMarkdown

> [!NOTE] Source constraint
> This report does not inspect the sibling `marksman/` checkout because this
> repository's agent rules prohibit reading sibling repositories. The Marksman
> baseline below comes from public Marksman documentation and Marketplace
> metadata, then compares that baseline against the current Flavor Grenade docs
> and implementation surface inside this repository.

## Executive Summary

Marksman's public feature baseline is: document and workspace symbols,
completion for inline/reference/wiki links, hover previews, go-to-definition,
find-references, wiki-link diagnostics, multi-folder workspace support, a custom
Markdown parser, heading reference code lens, rename refactoring, project/user
configuration, ignore-file handling, single-file mode, and a table-of-contents
code action.

Flavor Grenade already reaches or exceeds much of that baseline for
Obsidian-flavored constructs: wiki-links, embeds, block references, callouts,
tags, aliases, frontmatter, semantic tokens, code lens, rename, diagnostics,
and an OFMarkdown VS Code language mode. The remaining feature-parity work is
mostly in standard Markdown link forms, workspace polish, richer file operation
handling, and standalone tooling.

The strongest path is not to clone Marksman. It is to match the general
Markdown affordances that OFMarkdown users still expect, then go beyond
Marksman where Obsidian semantics provide better answers: block graphs, embeds,
aliases, tags, callouts, frontmatter, attachment folders, and vault hygiene.

## Marksman Baseline

| Area | Public Marksman capability | OFMarkdown parity interpretation |
|---|---|---|
| Symbols | Document symbols and workspace symbols from headings, with subsequence query matching | Keep heading outline/search; extend optionally to block anchors, tags, callouts, and frontmatter sections |
| Link completion | Completion for inline links, reference links, and wiki-links | Complete `[[...]]`, `![[...]]`, `[text](...)`, `[ref]`, `[ref]: ...`, heading anchors, block anchors, and media paths |
| Hover | Hover preview for links | Preview notes, headings, blocks, aliases, embeds, tags, callouts, and frontmatter keys |
| Navigation | Go-to-definition for links | Resolve OFM links, embeds, headings, block refs, tags, aliases, and Markdown reference definitions |
| References | Find-references for headings and links | Include wiki-links, embeds, inline links, reference links, tags, aliases, block refs, and file references |
| Diagnostics | Broken wiki-links and duplicate/ambiguous headings | Add OFM-aware broken/ambiguous diagnostics across docs, headings, blocks, embeds, aliases, tags, and frontmatter |
| Workspace | Multi-folder workspaces, project roots, ignore files, and single-file mode | Make each Obsidian vault a closed world while supporting multiple vault folders in one editor session |
| Code lens | Reference counts on headings | Keep heading counts; add block, file, tag, alias, and embed reference counts where useful |
| Rename | Rename refactoring | Cover headings and files; extend to tags, aliases, block IDs, and file moves |
| Code actions | Create/update table of contents | Keep TOC; add note creation, attachment fixes, tag/frontmatter cleanup, and OFM normalization actions |
| Standalone tools | Planned check/build commands | Add vault check and OFM-to-portable-Markdown export commands |

## Existing Flavor Grenade Coverage

Current docs and source show these parity items are already present or planned
as first-class features:

- LSP capabilities: definition, references, completion, code actions, hover,
  code lens, document highlight, rename, workspace symbols, document symbols,
  and semantic tokens.
- OFM parser support: wiki-links, embeds, tags, callouts, block anchors,
  frontmatter, math, code, comments, and opaque regions.
- Vault model: `.obsidian/` and `.flavor-grenade.toml` detection, single-file
  mode, vault indexing, file watching, ignore filtering, and DocId normalization.
- OFM-native resolution: exact paths, aliases, stems, H1 titles, heading refs,
  block refs, and embed resolution.
- Diagnostics: broken wiki-links, ambiguous wiki-links, malformed wiki-links,
  broken embeds, broken block refs, non-breaking heading spaces, and malformed
  frontmatter.
- Code actions: create missing file, table of contents, fix non-breaking
  heading space, and move body tags to YAML.
- Editor packaging: VS Code OFMarkdown language mode and platform-specific VSIX
  releases.

## Parity Features To Add

### P1: Standard Markdown Link Intelligence

**Goal:** Match Marksman for Markdown links that OFMarkdown users still write.

Feature candidates:

- Parse and index Markdown reference definitions:
  `[label]: target "title"`.
- Complete reference labels in `[label]` and `[label][]` contexts.
- Go to definition from `[label]` to its reference definition.
- Find references from a reference definition to all label uses.
- Complete inline-link targets in `[text](...)` with vault-relative Markdown
  files, headings, block anchors, and media assets.
- Diagnose broken inline links and reference links when the target is local to
  the vault.
- Normalize local Markdown links and wiki-links with code actions, without
  forcing one style globally.

Why it matters:

Marksman treats inline, reference, and wiki links as one link-intelligence
family. Flavor Grenade should do the same, but resolve them through OFM rules
when they point at vault content.

### P1: Heading Anchor Ambiguity Diagnostics

**Goal:** Match Marksman's duplicate/ambiguous heading protection, then make it
OFM-aware.

Feature candidates:

- Detect duplicate headings that produce the same Obsidian heading anchor within
  a document.
- Diagnose `[[doc#heading]]` when multiple headings normalize to the same
  anchor.
- Provide related information for all conflicting headings.
- Offer a quick fix to qualify the link by block anchor when one is available.
- Offer a quick fix to create a stable `^blockid` near the intended heading.

Why it matters:

Heading links are fragile in long notes. OFMarkdown has a better escape hatch
than generic Markdown: block anchors.

### P1: File Operation Refactoring

**Goal:** Make rename/move behavior dependable in real vault maintenance.

Feature candidates:

- Implement `workspace/willRenameFiles` and `workspace/didRenameFiles` for file
  moves, not only stem renames.
- Update wiki-links, embeds, inline Markdown links, and reference definitions
  when a note moves folders.
- Preserve configured link style: file stem, file path stem, title slug, or
  relative Markdown path.
- Add folder move handling for batches emitted by VS Code, Neovim file-tree
  plugins, and other LSP clients that support file operations.
- Report skipped edits when an ambiguous target prevents a safe rewrite.

Why it matters:

Vaults change structure over time. A language server earns trust when moving a
folder does not leave silent broken references behind.

### P1: Image And Attachment Intelligence

**Goal:** Cover Marksman's planned image support and exceed it for Obsidian
embeds.

Feature candidates:

- Complete image, audio, video, PDF, and other attachment paths in `![[...]]`
  and Markdown image syntax `![alt](...)`.
- Diagnose broken image/attachment paths in embeds and Markdown image links.
- Go to definition from an embed or image link to the asset.
- Hover asset metadata: extension, size, dimensions for images, page count for
  PDFs when cheap, and vault-relative path.
- Respect Obsidian attachment-folder settings from `.obsidian/app.json` or a
  Flavor Grenade config key.
- Offer quick fixes to move or relink attachments into the configured
  attachment folder.

Why it matters:

Obsidian users rely on attachments heavily. Marksman's public roadmap calls out
images; Flavor Grenade can treat all Obsidian embeds as first-class references.

### P2: Multi-Vault Workspace Hardening

**Goal:** Match Marksman's multi-folder workspace support while preserving
Obsidian's closed-vault model.

Feature candidates:

- Treat each workspace folder that contains `.obsidian/` or
  `.flavor-grenade.toml` as an isolated vault.
- Handle `workspace/didChangeWorkspaceFolders` incrementally.
- Avoid cross-vault completions and diagnostics unless a future explicit config
  enables them.
- Surface server status per vault: indexing, ready, degraded, or too large.
- Add tests for one editor session with two vaults containing the same note
  stems and aliases.

Why it matters:

Generic Markdown projects can share roots more loosely. OFMarkdown vaults need
isolation because Obsidian resolves links inside a vault boundary.

### P2: Document Links Provider

**Goal:** Make editor-native link opening work beyond hover and definition.

Feature candidates:

- Implement `textDocument/documentLink` for wiki-links, embeds, Markdown inline
  links, reference links, and bare local paths where appropriate.
- Return direct `file://` targets for unambiguous local files.
- Attach tooltip text that names the resolved target and ambiguity state.
- Leave ambiguous links without a target but with diagnostics and related
  information.

Why it matters:

Many editors render document links as clickable text. This is a low-friction
parity win that complements go-to-definition.

### P2: Folding And Selection Ranges

**Goal:** Add structural navigation for OFMarkdown blocks.

Feature candidates:

- Implement folding ranges for headings, frontmatter, callouts, fenced code,
  math blocks, comments, and long embeds if the client supports it.
- Implement selection ranges that expand through OFM structure:
  link target -> full link -> paragraph -> section -> document.
- Keep opaque-region rules consistent with parser behavior.

Why it matters:

Marksman's custom parser gives it fine-grained note structure. Flavor Grenade
already parses OFM-specific regions, so folding and selection ranges should be
cheap and high value.

### P2: Tag Rename And Tag Hygiene

**Goal:** Go beyond Marksman by treating tags as symbols, not plain text.

Feature candidates:

- Prepare/rename on body tags and frontmatter `tags:` entries.
- Rename hierarchical tags with previewed scope:
  `#project` can include or exclude `#project/*`.
- Find references for frontmatter and body tags through one TagRegistry path.
- Diagnose invalid tag syntax, duplicate frontmatter tags, and body/YAML drift.
- Offer code actions to canonicalize tags to either body text or frontmatter.

Why it matters:

Tags are core OFMarkdown structure. Marksman's generic Markdown model does not
give users this vault-maintenance affordance.

### P2: Alias Rename And Alias Hygiene

**Goal:** Make aliases maintainable across frontmatter and links.

Feature candidates:

- Prepare/rename on individual frontmatter aliases.
- Update all `[[alias]]` references when an alias changes.
- Diagnose duplicate aliases that resolve to multiple documents.
- Diagnose aliases that collide with file stems or H1 titles in ways that make
  completion ambiguous.
- Offer quick fixes to convert display aliases:
  `[[target|label]]` into frontmatter aliases when useful.

Why it matters:

Aliases are one of Flavor Grenade's strongest differentiators from a generic
Markdown LSP. They should be refactorable.

### P2: Block Reference Refactoring

**Goal:** Make block anchors as refactorable as headings.

Feature candidates:

- Allow rename from either the `^blockid` definition or a `[[doc#^blockid]]`
  reference.
- Diagnose duplicate block IDs within a document.
- Offer a quick fix to create a missing block anchor at the destination block
  when the user writes a broken `[[doc#^id]]`.
- Offer unused-block-anchor diagnostics or code lens for anchors with zero
  references.
- Add a command to generate stable block IDs for selected paragraphs.

Why it matters:

Block references are an OFMarkdown advantage over Marksman. They should become
the safest way to address precise content.

### P3: Standalone Vault Check Command

**Goal:** Match Marksman's planned `check` command for CI and editorless use.

Feature candidates:

- Add `flavor-grenade-lsp check <vault>` or `flavor-grenade check <vault>`.
- Emit machine-readable diagnostics as JSON and human-readable output by
  default.
- Support severity filters and fail-on-warning/fail-on-error flags.
- Use the same parser, vault index, and diagnostic service as the LSP server.
- Add GitHub Actions examples for validating a published notes vault.

Why it matters:

Vault owners need a way to catch broken links before publishing or syncing,
without opening an editor.

### P3: OFMarkdown Export/Build Command

**Goal:** Go beyond Marksman's planned Markdown build command by preserving
Obsidian semantics during export.

Feature candidates:

- Rewrite wiki-links, embeds, and block refs to portable Markdown links for
  static site generators.
- Copy or rewrite attachments into a deterministic output folder.
- Expand or strip callouts according to a target profile.
- Preserve frontmatter with configurable key filtering.
- Produce an export manifest mapping source DocIds to output paths.

Why it matters:

Obsidian vaults often become public sites. A first-party export path can make
Flavor Grenade useful outside the editor.

### P3: Vault Graph Queries

**Goal:** Expose the OFM connection graph as an editor feature, not just an
internal implementation detail.

Feature candidates:

- Add custom requests for backlinks, outlinks, orphan notes, unresolved links,
  and tag neighborhoods.
- Add code lens modes for inbound links, outbound links, embeds, and tag counts.
- Add workspace symbols for documents, tags, aliases, and block anchors, not
  only headings.
- Provide a stable JSON graph export command for external tools.

Why it matters:

Marksman gives code-style navigation. OFMarkdown users also expect
knowledge-graph affordances.

### P3: Frontmatter Schema Intelligence

**Goal:** Make Obsidian frontmatter safer and more discoverable.

Feature candidates:

- Complete known Obsidian keys: `aliases`, `tags`, `cssclasses`, `publish`,
  `created`, `modified`, and common community keys.
- Validate expected value shapes for known keys.
- Hover known keys with concise semantics.
- Let users extend the schema in `.flavor-grenade.toml`.
- Offer quick fixes for scalar-vs-list mistakes in `aliases:` and `tags:`.

Why it matters:

Frontmatter is executable metadata for many Obsidian workflows. Better schema
help reduces vault drift.

### P4: Jupyter Notebook And Mixed Document Strategy

**Goal:** Decide whether to match Marksman's planned notebook support or
explicitly decline it.

Feature candidates:

- Document notebook support as out of scope unless OFMarkdown-in-notebook cells
  become a real user need.
- If pursued, parse Markdown cells as isolated OFM documents with notebook-cell
  URI support.
- Keep vault resolution opt-in because notebook files are not ordinary Obsidian
  notes.

Why it matters:

This is lower priority for an OFMarkdown-focused server. The useful action now
is to make the non-goal explicit.

## Suggested Roadmap

| Priority | Theme | Suggested delivery slice |
|---|---|---|
| P1 | Standard Markdown link intelligence | Reference links, inline links, local target diagnostics, and link completions |
| P1 | Heading ambiguity | Duplicate heading anchor diagnostics and related information |
| P1 | File operations | File/folder move refactors for wiki-links, embeds, inline links, and reference links |
| P1 | Attachments | Completion, diagnostics, go-to-definition, and hover for image/media/PDF assets |
| P2 | Multi-vault | Workspace folder lifecycle, per-vault isolation, and status reporting |
| P2 | Structural LSP | Document links, folding ranges, and selection ranges |
| P2 | OFM refactors | Tag rename, alias rename, and block-ref rename |
| P3 | CLI tooling | `check` command and OFMarkdown export/build command |
| P3 | Graph intelligence | Backlinks, outlinks, orphan notes, graph export, and richer code lens |
| P3 | Frontmatter | Schema completions, validation, hovers, and quick fixes |
| P4 | Notebooks | Explicit non-goal or scoped experiment |

## Recommendation

Treat P1 as the real parity milestone. After those slices, Flavor Grenade would
cover the Marksman user-facing baseline that matters for OFMarkdown authors:
links, symbols, diagnostics, references, refactors, workspaces, and attachments.

Then use P2 and P3 to differentiate. Marksman is a strong Markdown LSP; Flavor
Grenade should be the stronger Obsidian vault intelligence layer.

## Sources

| Source | URL |
|---|---|
| Marksman README | https://github.com/artempyanykh/marksman |
| Marksman features documentation | https://raw.githubusercontent.com/artempyanykh/marksman/main/docs/features.md |
| Marksman configuration documentation | https://raw.githubusercontent.com/artempyanykh/marksman/main/docs/configuration.md |
| Marksman VS Code Marketplace listing | https://marketplace.visualstudio.com/items?itemName=arr.marksman |
| Flavor Grenade project overview | [[docs/index]] |
| Flavor Grenade completions | [[docs/features/completions]] |
| Flavor Grenade diagnostics | [[docs/features/diagnostics]] |
| Flavor Grenade navigation | [[docs/features/navigation]] |
| Flavor Grenade rename | [[docs/features/rename]] |
| Flavor Grenade workspace model | [[docs/concepts/workspace-model]] |
