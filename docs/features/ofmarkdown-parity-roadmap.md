---
title: Feature - OFMarkdown Parity Roadmap
tags: [features/, marksman-parity, ofmarkdown, roadmap]
aliases: [OFMarkdown Parity Roadmap, Marksman Server Parity]
---

# Feature - OFMarkdown Parity Roadmap

This feature specification turns the Marksman parity research into a coherent
server-side roadmap for OFMarkdown documents.

The goal is not to clone Marksman. The goal is to meet the Markdown language
server affordances that OFMarkdown authors expect, then exceed them where
Obsidian semantics provide stronger behavior.

## Priority Model

| Priority | Meaning |
|---|---|
| P1 | Required for practical parity with Marksman's user-facing Markdown features |
| P2 | Required to make parity feel native to OFMarkdown and large vaults |
| P3 | Differentiators that make Flavor Grenade useful outside an editor |
| P4 | Explicit non-goals or experiments |

## Functional Requirement Trace

| Roadmap area | Functional requirements |
|---|---|
| Standard Markdown links | [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]], [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.ParseCoverage]], [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.TargetClassification]], [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.ReferenceGraph]], [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.Completion]], [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.NavigationAndReferences]], [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.RenameAnchors]] |
| Same-document and ambiguous heading anchors | [[requirements/ofmarkdown-parity#Parity.MarkdownLinks.SameDocumentAnchor]], [[requirements/ofmarkdown-parity#Parity.HeadingAmbiguity.Diagnostics]] |
| Attachment intelligence | [[requirements/ofmarkdown-parity#Parity.Attachments.Intelligence]], [[requirements/ofmarkdown-parity#Parity.Attachments.IndexCoverage]], [[requirements/ofmarkdown-parity#Parity.Attachments.Completion]], [[requirements/ofmarkdown-parity#Parity.Attachments.Diagnostics]], [[requirements/ofmarkdown-parity#Parity.Attachments.NavigationHover]], [[requirements/ofmarkdown-parity#Parity.Attachments.ConfigHints]] |
| File operation refactoring | [[requirements/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]], [[requirements/ofmarkdown-parity#Parity.FileOperations.CapabilityRegistration]], [[requirements/ofmarkdown-parity#Parity.FileOperations.MovePlannerConfinement]], [[requirements/ofmarkdown-parity#Parity.FileOperations.ReferenceRewrite]], [[requirements/ofmarkdown-parity#Parity.FileOperations.SkippedAmbiguousReporting]], [[requirements/ofmarkdown-parity#Parity.FileOperations.AtomicValidation]], [[requirements/ofmarkdown-parity#Parity.FileOperations.IndexRefresh]] |
| Structural LSP capabilities | [[requirements/ofmarkdown-parity#Parity.StructuralLSP.Coverage]], [[requirements/ofmarkdown-parity#Parity.StructuralLSP.CapabilityRegistration]], [[requirements/ofmarkdown-parity#Parity.StructuralLSP.DocumentLinks]], [[requirements/ofmarkdown-parity#Parity.StructuralLSP.FoldingRanges]], [[requirements/ofmarkdown-parity#Parity.StructuralLSP.SelectionRanges]] |

## P1 - Standard Markdown Link Intelligence

Flavor Grenade must treat local Markdown inline links, reference links, link
definitions, and image links as first-class vault references.

Supported forms:

| Form | Example | Behavior |
|---|---|---|
| Inline link | `[Alpha](notes/alpha.md)` | completion, diagnostics, definition, references, rename |
| Heading link | `[Intro](alpha.md#Introduction)` | resolve to heading, detect ambiguous heading anchors |
| Same-document anchor | `[Intro](#Introduction)` | resolve within current document, diagnose missing or ambiguous headings |
| Reference use | `[Alpha][alpha]` | definition jumps to `[alpha]: ...`; references include uses |
| Shortcut ref | `[alpha]` | resolves when `[alpha]: ...` is present |
| Reference def | `[alpha]: notes/alpha.md` | indexed as `LinkLabelDef` and local target ref |
| Image link | `![Alt](assets/diagram.png)` | attachment diagnostics and definition |

External URLs and non-file schemes are intentionally skipped by vault
diagnostics.

## P1 - Heading Anchor Ambiguity

The server must detect duplicate or ambiguous heading anchors inside a document.
When a link such as `[[doc#Overview]]` or `[Overview](doc.md#overview)` can match
more than one heading after Obsidian-style normalization, the diagnostic must
point to all candidate headings and offer OFM-native escape hatches.

Quick-fix candidates:

- create a stable block anchor near the intended heading
- rewrite the link to `[[doc#^blockid]]`
- rename one duplicate heading when safe

## P1 - File Operation Refactoring

File rename, file move, and folder move operations must update all local
references in a single previewable workspace edit.

Affected references:

- `[[note]]`
- `[[note#Heading]]`
- `[[note#^blockid]]`
- `![[note]]`
- `![[asset.png]]`
- `[text](note.md)`
- `[text](note.md#heading)`
- `[text](#heading)`
- `[label]: note.md`
- `![alt](asset.png)`

The operation is refused if any target would escape the vault root.

## P1 - Attachment Intelligence

Attachments must be treated as addressable vault assets for embeds and Markdown
image links.

Capabilities:

- completion for attachment paths
- broken attachment diagnostics
- go-to-definition to the file
- hover metadata for path, file type, size, and image dimensions when cheap
- attachment folder awareness from config or Obsidian settings

## P2 - Multi-Vault Workspace Hardening

Each detected vault remains a closed world. Multiple vaults in the same editor
session may be indexed, but completion, diagnostics, references, and rename must
not cross vault boundaries unless a future explicit configuration permits it.

Required events:

- workspace folder added
- workspace folder removed
- vault marker added
- vault marker removed
- index rebuild completed

## P2 - Structural LSP Capabilities

The parser already knows enough structure to support:

- `textDocument/documentLink`
- `textDocument/foldingRange`
- `textDocument/selectionRange`

These capabilities should use OFM structure: headings, frontmatter, callouts,
code fences, math, Obsidian comments, wiki-links, embeds, and block anchors.

## P2 - OFM Refactoring

Tags, aliases, and block anchors should be refactorable symbols.

Refactoring candidates:

- tag rename across body tags and frontmatter `tags:`
- alias rename across frontmatter and all `[[alias]]` uses
- block ID rename from definition or reference side
- duplicate alias diagnostics
- duplicate block ID diagnostics
- unused block anchor diagnostics or code lens

## P3 - CLI Vault Check

Add a standalone command that runs the same parser, indexer, and diagnostic
service without an editor.

Suggested command:

```text
flavor-grenade-lsp check <vault>
```

Output modes:

- human-readable text by default
- JSON for CI
- fail-on-warning and fail-on-error flags

## P3 - OFMarkdown Export

Add an export/build command that rewrites OFMarkdown into portable Markdown for
static site generators and publishing flows.

Export responsibilities:

- rewrite wiki-links to Markdown links
- rewrite embeds to Markdown image or file links
- preserve or filter frontmatter keys
- copy attachments into deterministic output folders
- emit a manifest mapping source DocIds to output paths

## P4 - Notebook Strategy

Notebook support is not part of the parity milestone. If OFMarkdown-in-notebook
cells become a real user need, model them as a separate experiment with explicit
URI and vault membership rules.

## Related

- [[research/marksman-feature-parity-ofmarkdown]]
- [[ADR017-standard-markdown-link-intelligence]]
- [[ADR018-vault-file-operation-refactoring]]
- [[requirements/ofmarkdown-parity]]
- `docs/bdd/features/ofmarkdown-parity.feature`
