---
title: OFMarkdown Parity Requirements
tags:
  - requirements/functional/ofmarkdown-parity
aliases:
  - Marksman Parity Requirements
  - OFMarkdown Parity
  - OFMarkdown Parity Requirements
---

# OFMarkdown Parity Requirements

Scope: These requirements govern the server-side parity roadmap derived from
[[research/marksman-feature-parity-ofmarkdown]]. They extend existing wiki-link,
completion, diagnostics, navigation, rename, and embed requirements to cover
standard Markdown link forms and vault file operations.

---

## Parity.MarkdownLinks.LocalResolution

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

## Parity.MarkdownLinks.SameDocumentAnchor

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

## Parity.HeadingAmbiguity.Diagnostics

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

## Parity.FileOperations.AtomicRefactor

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

## Parity.Attachments.Intelligence

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

## Parity.StructuralLSP.Coverage

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

---

## Implementation-Level Functional Requirements

The following Planguage requirements refine the parity goals above into
implementation-sized capabilities used by the phase plans and tickets.

---

## Parity.MarkdownLinks.ParseCoverage

**Tag:** Parity.MarkdownLinks.ParseCoverage
**User Req:** User.Author.UseStandardMarkdownLinks
**Gist:** The OFM parser must expose every supported standard Markdown link form as typed index data.
**Ambition:** Resolver, completion, navigation, diagnostics, rename, and attachment work should share one parsed representation instead of reparsing document text in each handler.
**Scale:** Percentage of supported Markdown link forms represented with correct ranges and typed symbols in `OFMIndex`.
**Meter:**

1. Create fixtures for inline links, image links, full reference links, collapsed reference links, shortcut reference links, and link definitions.
2. Include the same syntax inside code, math, comment, and Templater opaque regions.
3. Parse each fixture and inspect emitted Markdown link, Markdown image, label reference, and label definition entries.
4. Verify each in-scope link has correct text, target, label, and full-span ranges.
5. Verify opaque-region examples produce no link symbols.
6. Compute: (correct parser entries / total expected parser entries) x 100.
**Fail:** Any supported link form is absent from `OFMIndex`, has an unusable target range, or is parsed inside an opaque region.
**Goal:** 100% parser coverage for supported Markdown link forms.
**Stakeholders:** Vault authors, LSP implementers, extension authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR017-standard-markdown-link-intelligence]], [[ofm-spec/markdown-links]], [[plans/phase-14-markdown-link-intelligence]].

---

## Parity.MarkdownLinks.TargetClassification

**Tag:** Parity.MarkdownLinks.TargetClassification
**User Req:** User.Author.UseStandardMarkdownLinks
**Gist:** Markdown link targets must be classified as local document, local attachment, same-document fragment, external URL, or unsupported scheme before resolution.
**Ambition:** Classification prevents external URLs from becoming broken-link noise and gives downstream handlers clear local target types.
**Scale:** Percentage of target examples assigned to the correct target class.
**Meter:**

1. Create target examples for relative files, extensionless files, file-plus-fragment links, `#fragment`, attachments, `https://`, `mailto:`, and unknown schemes.
2. Run the target classifier for each example from a known source document.
3. Verify local targets carry normalized vault-relative candidate paths.
4. Verify external and unsupported schemes are marked non-vault without diagnostics.
5. Compute: (correct classifications / total target examples) x 100.
**Fail:** Any external URL is classified as a vault path, or any local Markdown target lacks a usable local classification.
**Goal:** 100% correct target classification.
**Stakeholders:** Vault authors, static-site authors, diagnostics maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR017-standard-markdown-link-intelligence]], [[requirements/completions]], [[plans/phase-14-markdown-link-intelligence]].

---

## Parity.MarkdownLinks.ReferenceGraph

**Tag:** Parity.MarkdownLinks.ReferenceGraph
**User Req:** User.Author.UseStandardMarkdownLinks
**Gist:** The reference graph must index Markdown document refs, image refs, label refs, and label definitions without a second document cache.
**Ambition:** Find-references, rename, diagnostics, and future file-operation refactors need one graph view across wiki-links, embeds, and Markdown links.
**Scale:** Percentage of local Markdown references and label definitions indexed with the correct source document and target metadata.
**Meter:**

1. Parse a vault containing inline links, image links, reference uses, shortcut uses, and link definitions.
2. Build the reference graph from `VaultIndex` data only.
3. Verify `MarkdownLinkRef`, `MarkdownImageRef`, `LinkLabelRef`, and `LinkLabelDef` entries exist with document-local label binding.
4. Verify external URLs are absent from vault reference entries.
5. Compute: (correct graph entries / total expected graph entries) x 100.
**Fail:** Any local Markdown reference is missing from the graph, labels bind across documents, or graph construction maintains another parsed document cache.
**Goal:** 100% graph coverage for local Markdown references.
**Stakeholders:** Vault authors, LSP implementers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR017-standard-markdown-link-intelligence]], `CONCEPTS.md`, [[plans/phase-14-markdown-link-intelligence]].

---

## Parity.MarkdownLinks.Completion

**Tag:** Parity.MarkdownLinks.Completion
**User Req:** User.Author.UseStandardMarkdownLinks
**Gist:** Markdown link URL contexts must offer vault document and heading completions.
**Ambition:** Authors using `[text](...)` should receive the same authoring assistance expected from wiki-link workflows.
**Scale:** Percentage of eligible Markdown link URL trigger positions that return correct completion candidates.
**Meter:**

1. Create a vault with at least five documents and headings.
2. Trigger completion inside `[text](`, `[text](note`, `[text](#`, and `[text](note#`.
3. Verify document candidates appear in file-target contexts.
4. Verify current-document headings appear after `#`.
5. Verify target-document headings appear after `note#`.
6. Verify external URL contexts do not return vault candidates.
7. Compute: (correct completion responses / total eligible trigger positions) x 100.
**Fail:** Any eligible local Markdown URL context returns no candidates, or external URL contexts return vault candidates.
**Goal:** 100% completion coverage for eligible Markdown URL contexts.
**Stakeholders:** Vault authors, documentation authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/completions]], [[features/ofmarkdown-parity-roadmap]], [[plans/phase-14-markdown-link-intelligence]].

---

## Parity.MarkdownLinks.NavigationAndReferences

**Tag:** Parity.MarkdownLinks.NavigationAndReferences
**User Req:** User.Navigate.JumpToNote
**Gist:** Definition and references must include Markdown inline links, image links, label uses, label definitions, and same-document anchors where applicable.
**Ambition:** Authors should not need to remember which link syntax gets full navigation support.
**Scale:** Percentage of supported Markdown link locations that return the correct definition and reference result.
**Meter:**

1. Create a vault with inline links, reference links, label definitions, image links, and same-document anchors.
2. Request definition from each supported source location.
3. Request references from each target document, heading, attachment, and label definition.
4. Verify returned locations include all and only matching local Markdown references.
5. Compute: (correct navigation/reference responses / total expected responses) x 100.
**Fail:** Any supported Markdown link cannot navigate to its local target, or find-references omits an indexed local Markdown reference.
**Goal:** 100% navigation and reference coverage for supported Markdown links.
**Stakeholders:** Vault authors, LSP client users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/navigation]], [[ADR017-standard-markdown-link-intelligence]], [[plans/phase-14-markdown-link-intelligence]].

---

## Parity.MarkdownLinks.RenameAnchors

**Tag:** Parity.MarkdownLinks.RenameAnchors
**User Req:** User.Rename.RenameHeadingEverywhere
**Gist:** Heading rename must update Markdown same-document and file-plus-fragment anchors.
**Ambition:** Standard Markdown heading links should not become stale when authors refactor headings.
**Scale:** Percentage of Markdown heading anchor references updated by a heading rename workspace edit.
**Meter:**

1. Create a vault with `# Introduction` and links `[Intro](#Introduction)` and `[Intro](note.md#Introduction)`.
2. Request rename on the heading.
3. Inspect the returned WorkspaceEdit.
4. Verify both Markdown anchor forms update using the configured anchor normalization.
5. Verify aliases and Markdown link text are preserved.
6. Compute: (correctly updated Markdown anchor refs / total Markdown anchor refs) x 100.
**Fail:** Any Markdown heading anchor remains stale after a successful heading rename.
**Goal:** 100% Markdown anchor update coverage.
**Stakeholders:** Vault authors, documentation maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/rename]], [[ADR017-standard-markdown-link-intelligence]], [[plans/phase-14-markdown-link-intelligence]].

---

## Parity.Attachments.IndexCoverage

**Tag:** Parity.Attachments.IndexCoverage
**User Req:** User.Embed.ManageAttachments
**Gist:** Non-Markdown vault files must be indexed as attachment targets without creating parsed `OFMDoc` entries.
**Ambition:** Attachment intelligence needs cheap target metadata while preserving `VaultIndex` as the single parsed-document source of truth.
**Scale:** Percentage of eligible non-Markdown vault files indexed as attachments with correct vault-relative paths.
**Meter:**

1. Create a vault with images, PDFs, audio files, unknown binary files, Markdown notes, ignored files, and hidden tool folders.
2. Build the vault index.
3. Verify non-Markdown supported files appear in the attachment index.
4. Verify Markdown notes appear only as documents, not attachments.
5. Verify ignored files are absent.
6. Compute: (correct attachment index entries / total expected attachment entries) x 100.
**Fail:** Any eligible attachment is missing, or any attachment creates an `OFMDoc`.
**Goal:** 100% attachment index coverage for eligible files.
**Stakeholders:** Vault authors, media-heavy note users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/embed-resolution]], [[plans/phase-15-attachment-intelligence]].

---

## Parity.Attachments.Completion

**Tag:** Parity.Attachments.Completion
**User Req:** User.Embed.ManageAttachments
**Gist:** Embed and Markdown image contexts must complete indexed attachment paths.
**Ambition:** Authors should be able to reference media assets without leaving the editor or guessing paths.
**Scale:** Percentage of attachment completion contexts that return expected attachment candidates and exclude unrelated document-only candidates.
**Meter:**

1. Create a vault with attachments under root and configured attachment folders.
2. Trigger completion inside `![[...]]` and `![alt](...)` attachment contexts.
3. Verify attachment candidates appear with vault-relative paths.
4. Verify unrelated note-only candidates do not pollute attachment-only contexts.
5. Compute: (correct attachment completion results / total attachment contexts) x 100.
**Fail:** Any supported attachment context lacks existing attachment candidates.
**Goal:** 100% attachment completion coverage for supported contexts.
**Stakeholders:** Vault authors, media-heavy note users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/ofmarkdown-parity-roadmap]], [[plans/phase-15-attachment-intelligence]].

---

## Parity.Attachments.Diagnostics

**Tag:** Parity.Attachments.Diagnostics
**User Req:** User.Embed.ManageAttachments
**Gist:** Broken attachment references must produce diagnostics while existing attachments remain diagnostic-free.
**Ambition:** Asset-heavy vaults should surface missing files clearly without false positives on valid media references.
**Scale:** Percentage of supported attachment references with correct broken or valid diagnostic state.
**Meter:**

1. Create embed and Markdown image references to existing and missing attachments.
2. Request diagnostics for the source documents.
3. Verify missing attachments produce the documented attachment diagnostic.
4. Verify existing attachments produce no broken-reference diagnostic.
5. Compute: (correct attachment diagnostic states / total attachment references) x 100.
**Fail:** Any missing attachment is silent, or any existing attachment is reported broken.
**Goal:** 100% diagnostic correctness for supported attachment refs.
**Stakeholders:** Vault authors, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/diagnostics]], [[requirements/embed-resolution]], [[plans/phase-15-attachment-intelligence]].

---

## Parity.Attachments.NavigationHover

**Tag:** Parity.Attachments.NavigationHover
**User Req:** User.Embed.ManageAttachments
**Gist:** Existing attachment references must support definition and lightweight hover metadata.
**Ambition:** Users should be able to inspect and open vault assets from link locations without heavy preview rendering.
**Scale:** Percentage of existing attachment references that return a file URI definition and metadata hover.
**Meter:**

1. Create references to image, PDF, audio, and unknown attachments.
2. Request definition and hover from each reference.
3. Verify definition targets the attachment file URI.
4. Verify hover includes vault-relative path and detected file type.
5. Verify image dimensions are included when available without blocking.
6. Compute: (correct definition and hover behaviors / total expected behaviors) x 100.
**Fail:** Any existing supported attachment lacks definition support or returns hover content for the wrong file.
**Goal:** 100% definition coverage and metadata hover for supported attachments.
**Stakeholders:** Vault authors, media-heavy note users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/hover]], [[requirements/navigation]], [[plans/phase-15-attachment-intelligence]].

---

## Parity.Attachments.ConfigHints

**Tag:** Parity.Attachments.ConfigHints
**User Req:** User.Embed.ManageAttachments
**Gist:** Attachment completion and indexing must respect configured attachment folder hints when available.
**Ambition:** Flavor Grenade should feel native in Obsidian vaults that centralize media under configured folders.
**Scale:** Percentage of configured attachment-folder cases that influence completion ordering without hiding valid attachments.
**Meter:**

1. Configure an attachment folder hint through Flavor Grenade config or discovered Obsidian settings.
2. Create matching and non-matching attachments.
3. Trigger attachment completion.
4. Verify hinted-folder candidates rank ahead of other valid attachments.
5. Verify valid attachments outside the hinted folder remain available.
6. Compute: (correctly ordered completion cases / total configured cases) x 100.
**Fail:** Configured hints hide valid attachments or have no observable effect on completion ordering.
**Goal:** 100% correct hint behavior where a supported hint is configured.
**Stakeholders:** Vault authors, Obsidian users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/configuration]], [[plans/phase-15-attachment-intelligence]].

---

## Parity.FileOperations.CapabilityRegistration

**Tag:** Parity.FileOperations.CapabilityRegistration
**User Req:** User.Rename.MoveNotesSafely
**Gist:** The server must advertise and handle LSP file-operation rename capability when the client supports it.
**Ambition:** File explorer moves should trigger pre-apply reference edits instead of relying on after-the-fact diagnostics.
**Scale:** Percentage of supporting clients that receive file-operation capability registration and a valid handler response.
**Meter:**

1. Initialize the server with client capabilities for file operations.
2. Inspect the initialize result or dynamic registration.
3. Send `workspace/willRenameFiles` for a supported file move.
4. Verify the handler returns a `WorkspaceEdit` or a safe refusal.
5. Compute: (correct registration/handler cases / total capability cases) x 100.
**Fail:** A supporting client cannot discover or invoke the file-operation handler.
**Goal:** 100% registration and handler coverage for supported clients.
**Stakeholders:** Vault authors, LSP client integrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR018-vault-file-operation-refactoring]], [[plans/phase-16-vault-file-operation-refactors]].

---

## Parity.FileOperations.MovePlannerConfinement

**Tag:** Parity.FileOperations.MovePlannerConfinement
**User Req:** User.Rename.MoveNotesSafely
**Gist:** File-operation planning must canonicalize old and new paths and reject any move escaping the vault root.
**Ambition:** Reference refactors must not create edits for files outside the user's vault.
**Scale:** Percentage of file and folder move events classified into vault-confined mappings or safe refusals.
**Meter:**

1. Send file move, file rename, folder move, cross-vault move, and path-traversal events.
2. Build the move plan.
3. Verify in-vault moves produce old/new `VaultPath` mappings.
4. Verify escaping or cross-vault moves produce no edit plan.
5. Compute: (correct move planning outcomes / total move events) x 100.
**Fail:** Any escaping path is accepted, or any valid in-vault move lacks a mapping.
**Goal:** 100% confinement correctness for move planning.
**Stakeholders:** Vault authors, security reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/security/vault-confinement]], [[ADR018-vault-file-operation-refactoring]], [[plans/phase-16-vault-file-operation-refactors]].

---

## Parity.FileOperations.ReferenceRewrite

**Tag:** Parity.FileOperations.ReferenceRewrite
**User Req:** User.Rename.MoveNotesSafely
**Gist:** File-operation refactors must rewrite all resolved moved-target reference forms while preserving syntax family.
**Ambition:** Vault reorganizations should not convert user style or lose aliases, fragments, labels, or titles.
**Scale:** Percentage of references to moved targets rewritten correctly with preserved syntax details.
**Meter:**

1. Create references to moved notes and attachments using wiki-links, embeds, inline Markdown links, reference definitions, and Markdown image links.
2. Generate edits from a valid move plan.
3. Apply the edits to a copy of the vault.
4. Verify every moved-target reference points to the new path.
5. Verify fragments, aliases, labels, and Markdown titles are preserved.
6. Compute: (correct rewritten references / total moved-target references) x 100.
**Fail:** Any resolved moved-target reference remains stale or changes syntax family unexpectedly.
**Goal:** 100% rewrite coverage for resolved moved-target references.
**Stakeholders:** Vault authors, documentation maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR018-vault-file-operation-refactoring]], [[plans/phase-16-vault-file-operation-refactors]].

---

## Parity.FileOperations.SkippedAmbiguousReporting

**Tag:** Parity.FileOperations.SkippedAmbiguousReporting
**User Req:** User.Rename.MoveNotesSafely
**Gist:** References skipped because ambiguity prevents safe rewrite must be reported without generating speculative edits.
**Ambition:** Users should know when an operation could not update every reference, and the server should never guess the intended target.
**Scale:** Percentage of ambiguous moved-target references reported with no speculative text edit.
**Meter:**

1. Create ambiguous references that cannot be tied to one moved target.
2. Generate file-operation edits.
3. Verify ambiguous references appear in the skipped-reference report.
4. Verify no text edit is emitted for skipped references.
5. Compute: (correct skipped-reference reports / total ambiguous references) x 100.
**Fail:** Any ambiguous reference is silently skipped or rewritten speculatively.
**Goal:** 100% skipped-reference reporting for ambiguous cases.
**Stakeholders:** Vault authors, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR018-vault-file-operation-refactoring]], [[plans/phase-16-vault-file-operation-refactors]].

---

## Parity.FileOperations.AtomicValidation

**Tag:** Parity.FileOperations.AtomicValidation
**User Req:** User.Rename.MoveNotesSafely
**Gist:** WorkspaceEdit output must be validated as deterministic, non-overlapping, and all-or-nothing before returning to the client.
**Ambition:** Large move refactors should be previewable and safe to apply through editor undo.
**Scale:** Percentage of edit graphs accepted or rejected according to atomic validation rules.
**Meter:**

1. Generate valid, overlapping, out-of-bounds, and unsafe edit graphs.
2. Run the WorkspaceEdit validator.
3. Verify valid edit graphs return deterministic edits.
4. Verify invalid graphs return no partial edit.
5. Compute: (correct validation outcomes / total edit graphs) x 100.
**Fail:** Any invalid graph returns a partial edit, or valid edit ordering is nondeterministic.
**Goal:** 100% validation correctness.
**Stakeholders:** Vault authors, LSP client users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR018-vault-file-operation-refactoring]], [[requirements/security/input-validation]], [[plans/phase-16-vault-file-operation-refactors]].

---

## Parity.FileOperations.IndexRefresh

**Tag:** Parity.FileOperations.IndexRefresh
**User Req:** User.Rename.MoveNotesSafely
**Gist:** `workspace/didRenameFiles` must refresh affected index entries and diagnostics after editor-applied moves.
**Ambition:** After a file operation, server state should reflect the new vault layout without stale diagnostics or completion entries.
**Scale:** Percentage of moved files and folders whose document, attachment, reference, and diagnostic state refreshes after `didRenameFiles`.
**Meter:**

1. Apply a file move and folder move in a test vault.
2. Send matching `workspace/didRenameFiles`.
3. Query completion, diagnostics, definition, and references for affected paths.
4. Verify old paths are absent and new paths are present.
5. Compute: (correct refreshed states / total affected states) x 100.
**Fail:** Any moved target remains indexed at the old path after refresh.
**Goal:** 100% affected-state refresh coverage.
**Stakeholders:** Vault authors, LSP client users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[plans/phase-16-vault-file-operation-refactors]], [[requirements/workspace]].

---

## Parity.StructuralLSP.CapabilityRegistration

**Tag:** Parity.StructuralLSP.CapabilityRegistration
**User Req:** User.Navigate.UseEditorStructure
**Gist:** The server must advertise document link, folding range, and selection range providers only when implemented.
**Ambition:** Clients should not call structural LSP methods that return placeholder or incoherent results.
**Scale:** Percentage of structural providers advertised consistently with implemented handlers.
**Meter:**

1. Initialize the server.
2. Inspect advertised server capabilities.
3. Call each advertised structural method.
4. Verify every advertised method has a handler and every unimplemented method is not advertised.
5. Compute: (correct capability advertisements / total structural capabilities) x 100.
**Fail:** Any advertised structural capability lacks a functioning handler.
**Goal:** 100% advertisement/handler consistency.
**Stakeholders:** LSP client users, editor integrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[plans/phase-17-structural-lsp-capabilities]], [[design/api-layer]].

---

## Parity.StructuralLSP.DocumentLinks

**Tag:** Parity.StructuralLSP.DocumentLinks
**User Req:** User.Navigate.UseEditorStructure
**Gist:** `textDocument/documentLink` must return targets for unambiguous local OFMarkdown links and leave ambiguous links unresolved.
**Ambition:** Editors can make links clickable without bypassing Flavor Grenade's ambiguity diagnostics.
**Scale:** Percentage of unambiguous local links returned with correct targets and ambiguous links returned without misleading targets.
**Meter:**

1. Create a document with unambiguous wiki-links, embeds, Markdown links, reference definitions, attachment refs, and ambiguous heading refs.
2. Request `textDocument/documentLink`.
3. Verify unambiguous links include correct target URIs.
4. Verify ambiguous links do not include speculative targets.
5. Compute: (correct document link results / total link cases) x 100.
**Fail:** Any unambiguous local link is missing, or any ambiguous link receives a misleading target.
**Goal:** 100% document-link correctness for supported link cases.
**Stakeholders:** LSP client users, editor integrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/navigation]], [[plans/phase-17-structural-lsp-capabilities]].

---

## Parity.StructuralLSP.FoldingRanges

**Tag:** Parity.StructuralLSP.FoldingRanges
**User Req:** User.Navigate.UseEditorStructure
**Gist:** `textDocument/foldingRange` must expose OFMarkdown foldable constructs without crossing opaque-region boundaries.
**Ambition:** Long OFMarkdown files should fold by meaningful document structure, not only generic Markdown heuristics.
**Scale:** Percentage of representative OFM foldable constructs returned with valid non-overlapping ranges.
**Meter:**

1. Create a document with frontmatter, headings, callouts, code fences, math blocks, comments, and Templater regions.
2. Request `textDocument/foldingRange`.
3. Verify expected ranges exist and stay inside construct boundaries.
4. Verify ranges never cross opaque region boundaries.
5. Compute: (correct folding ranges / total expected folding ranges) x 100.
**Fail:** Any returned fold range crosses an opaque boundary or omits a supported foldable construct.
**Goal:** 100% folding coverage for supported constructs.
**Stakeholders:** Vault authors, LSP client users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/index]], [[requirements/semantic-tokens]], [[plans/phase-17-structural-lsp-capabilities]].

---

## Parity.StructuralLSP.SelectionRanges

**Tag:** Parity.StructuralLSP.SelectionRanges
**User Req:** User.Navigate.UseEditorStructure
**Gist:** `textDocument/selectionRange` must expand from token to OFMarkdown construct, paragraph, section, and document.
**Ambition:** Selection expansion should respect OFMarkdown syntax so editor operations feel precise in complex notes.
**Scale:** Percentage of tested cursor positions that return a correct nested selection range chain.
**Meter:**

1. Create a document with links, embeds, tags, callouts, headings, frontmatter, and opaque regions.
2. Request `textDocument/selectionRange` at representative token positions.
3. Verify each chain expands through valid OFM construct boundaries.
4. Verify no chain crosses code, math, comment, or Templater opaque boundaries incorrectly.
5. Compute: (correct selection chains / total tested positions) x 100.
**Fail:** Any selection chain skips the construct under the cursor or crosses an invalid boundary.
**Goal:** 100% selection-range correctness for supported constructs.
**Stakeholders:** Vault authors, LSP client users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/index]], [[plans/phase-17-structural-lsp-capabilities]].
