---
title: OFMarkdown Parity Requirements
tags:
  - requirements/ofmarkdown-parity
aliases:
  - Marksman Parity Requirements
  - OFMarkdown Parity
---

# OFMarkdown Parity Requirements

Scope: These requirements govern the server-side parity roadmap derived from
[[research/marksman-feature-parity-ofmarkdown]]. They extend existing wiki-link,
completion, diagnostics, navigation, rename, and embed requirements to cover
standard Markdown link forms and vault file operations.

---

**Tag:** Parity.MarkdownLinks.LocalResolution
**User Req:** User.Author.UseStandardMarkdownLinks
**Gist:** Local standard Markdown links must resolve through the same vault rules as wiki-links.
**Ambition:** Authors can mix wiki-links and standard Markdown links without losing vault-aware completion, diagnostics, navigation, references, or rename support.
**Scale:** Percentage of local inline links, reference links, link definitions, and image links in a test vault that resolve to the same target locations as equivalent wiki-link or embed forms.
**Meter:**

1. Create a vault with notes, headings, block anchors, and attachments.
2. Add equivalent references using `[[note]]`, `[note](note.md)`, `[label][ref]`, `[ref]: note.md`, `![[image.png]]`, and `![alt](image.png)`.
3. Run definition and diagnostic requests at each local Markdown link.
4. Verify local Markdown links resolve to the same DocId or attachment target as the equivalent OFM form.
5. Verify external URLs and non-file schemes produce no broken-link diagnostics.
6. Compute: (correctly resolved local Markdown links / total local Markdown links tested) x 100.
**Fail:** Any local Markdown link resolves outside the vault rules, or any external URL produces a vault broken-link diagnostic.
**Goal:** 100% correct local resolution and 0 false positives for external URLs.
**Stakeholders:** Vault authors, Markdown authors, static-site authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR017-standard-markdown-link-intelligence]], [[features/ofmarkdown-parity-roadmap]].

---

**Tag:** Parity.MarkdownLinks.SameDocumentAnchor
**User Req:** User.Author.UseStandardMarkdownLinks
**Gist:** Same-document Markdown anchors must support definition, diagnostics, references, and heading rename behavior.
**Ambition:** Authors who use standard Markdown links such as `[Intro](#Introduction)` should get the same section-level safety Marksman provides for inline anchor links and Flavor Grenade provides for wiki heading links.
**Scale:** Percentage of same-document Markdown anchor links that resolve, diagnose missing or ambiguous headings, appear in references, and update when the heading is renamed.
**Meter:**

1. Create a document with headings `Introduction`, `Details`, and duplicate `Overview` headings.
2. Add same-document Markdown links `[Intro](#Introduction)`, `[Missing](#Missing)`, and `[Overview](#Overview)`.
3. Request definition on `#Introduction` and verify the target is the `Introduction` heading in the same document.
4. Request diagnostics and verify `[Missing](#Missing)` reports a missing-heading diagnostic and `[Overview](#Overview)` reports an ambiguity diagnostic with both candidate headings.
5. Request references on the `Introduction` heading and verify `[Intro](#Introduction)` is included.
6. Rename `Introduction` to `Intro` and verify the link target updates to `#Intro` using the configured anchor normalization.
7. Compute: (correct same-document anchor behaviors / total expected behaviors) x 100.
**Fail:** Any same-document anchor link cannot navigate to an existing heading, misses a broken or ambiguous heading diagnostic, is omitted from references, or remains stale after heading rename.
**Goal:** 100% same-document anchor behavior coverage.
**Stakeholders:** Vault authors, Markdown authors, static-site authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR017-standard-markdown-link-intelligence]], [[features/ofmarkdown-parity-roadmap]], [[ofm-spec/markdown-links]].

---

**Tag:** Parity.HeadingAmbiguity.Diagnostics
**User Req:** User.Diagnose.SpotAmbiguousHeadingAnchors
**Gist:** Duplicate or ambiguous heading anchors must produce diagnostics with related candidate locations.
**Ambition:** Links to headings should never silently jump to the wrong section when duplicate headings normalize to the same anchor.
**Scale:** Percentage of ambiguous heading-link cases that produce one diagnostic with related information for every candidate heading.
**Meter:**

1. Create a document with duplicate headings that normalize to the same Obsidian anchor.
2. Link to that heading through `[[doc#heading]]` and `[heading](doc.md#heading)`.
3. Request diagnostics for the source document.
4. Verify exactly one ambiguity diagnostic is emitted for each ambiguous link.
5. Verify diagnostic related information includes every candidate heading location.
6. Compute: (ambiguous cases with complete related information / total ambiguous cases) x 100.
**Fail:** Any ambiguous heading link has no diagnostic, or related information omits a candidate.
**Goal:** 100% complete ambiguity diagnostics.
**Stakeholders:** Vault authors, documentation maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/ofmarkdown-parity-roadmap]], [[ADR017-standard-markdown-link-intelligence]].

---

**Tag:** Parity.FileOperations.AtomicRefactor
**User Req:** User.Rename.MoveNotesSafely
**Gist:** File and folder moves must update every local reference to moved targets in one workspace edit.
**Ambition:** Authors can reorganize a vault without silently breaking wiki-links, embeds, Markdown links, reference definitions, or attachment references.
**Scale:** Percentage of references to moved files or folders that are updated correctly in the returned WorkspaceEdit.
**Meter:**

1. Create a vault containing references to one note and one attachment using wiki-link, embed, inline Markdown link, reference definition, and image link syntax.
2. Send `workspace/willRenameFiles` for a file move and a folder move.
3. Apply the returned WorkspaceEdit to a copy of the vault.
4. Re-index the copy and request diagnostics.
5. Verify all references now resolve to the new target paths.
6. Verify the operation is refused if any old or new target escapes the vault root.
7. Compute: (correctly updated references / total references to moved targets) x 100.
**Fail:** Any moved-target reference remains stale, or any escaping path is accepted.
**Goal:** 100% reference update coverage and 100% vault confinement.
**Stakeholders:** Vault authors, maintainers of large vaults, security reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR018-vault-file-operation-refactoring]], [[ADR013-vault-root-confinement]].

---

**Tag:** Parity.Attachments.Intelligence
**User Req:** User.Embed.ManageAttachments
**Gist:** Attachments referenced by embeds or Markdown image links must support completion, diagnostics, definition, and hover metadata.
**Ambition:** Images, PDFs, audio, and other vault assets should be as safe to reference as notes.
**Scale:** Percentage of attachment references in supported syntaxes that receive correct completion, diagnostics, definition, and hover behavior.
**Meter:**

1. Create a vault with image, PDF, audio, and unknown attachment files.
2. Trigger completion inside `![[` and `![alt](` contexts.
3. Request diagnostics for existing and missing attachment references.
4. Request definition and hover at each existing attachment reference.
5. Verify completions include existing attachments, missing attachments produce diagnostics, definitions open the asset URI, and hovers include file type and path.
6. Compute: (correct behaviors observed / total expected behaviors) x 100.
**Fail:** Any supported attachment syntax lacks diagnostics or definition support.
**Goal:** 100% behavior coverage for supported attachment types.
**Stakeholders:** Vault authors, media-heavy note users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/ofmarkdown-parity-roadmap]], [[requirements/embed-resolution]].

---

**Tag:** Parity.StructuralLSP.Coverage
**User Req:** User.Navigate.UseEditorStructure
**Gist:** Document links, folding ranges, and selection ranges must reflect OFMarkdown structure.
**Ambition:** Editors should expose OFMarkdown documents as structured documents, not just plain text with completions.
**Scale:** Percentage of representative OFM constructs that return correct document link, folding range, and selection range data.
**Meter:**

1. Create a document containing frontmatter, headings, callouts, code fences, math blocks, comments, wiki-links, embeds, and block anchors.
2. Request `textDocument/documentLink`, `textDocument/foldingRange`, and `textDocument/selectionRange`.
3. Verify links target resolved local files where unambiguous.
4. Verify fold ranges cover frontmatter, headings, callouts, code, math, and comments.
5. Verify selection ranges expand through OFM constructs in a stable order.
6. Compute: (constructs with correct structural responses / total constructs tested) x 100.
**Fail:** Any advertised structural capability returns incoherent ranges or crosses opaque region boundaries.
**Goal:** 100% coverage for advertised constructs.
**Stakeholders:** LSP client users, editor integrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/ofmarkdown-parity-roadmap]], [[ofm-spec/index]].
