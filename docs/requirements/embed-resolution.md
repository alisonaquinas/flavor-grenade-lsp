---
title: Embed Resolution Requirements
tags:
  - requirements/embed-resolution
aliases:
  - Embed Requirements
  - FG Embed Resolution
---

# Embed Resolution Requirements

> [!NOTE] Scope
> These requirements govern the server's handling of Obsidian embed syntax (`![[target]]`), including resolution of markdown document embeds, image-file embeds, heading-scoped embeds, and block-anchor embeds. Diagnostic codes referenced here are defined in [[requirements/diagnostics]]. Wiki-link resolution without the `!` prefix is specified in [[wiki-link-resolution]].

---

**Tag:** Embed.Resolution.MarkdownTarget
**User Req:** User.Embed.DetectBrokenEmbed, User.Embed.PreviewLinkedContent
**Gist:** `![[file.md]]` embed syntax must resolve to documents present in VaultIndex, and must produce FG004 (BrokenEmbed) when the target document cannot be found.
**Ambition:** Embed resolution is the semantic backbone of Obsidian's transclusion system. A broken embed produces a visible rendering failure in Obsidian (an error card instead of inline content). The LSP must surface this at edit time so authors catch broken embeds before publishing or sharing a vault, reducing the round-trip cost of discovering broken content at render time.
**Scale:** Percentage of `![[file.md]]` embed targets in a test vault that the server correctly classifies as either resolved (target in VaultIndex, no diagnostic) or broken (target absent, FG004 emitted). Scope: all embed link positions across all indexed documents.
**Meter:**

1. Construct a test vault with at least 10 documents and at least 5 `![[target.md]]` embed links: at least 3 pointing to existing documents and at least 2 pointing to non-existent documents.
2. Open all documents and wait for `textDocument/publishDiagnostics` to settle.
3. Verify that embeds pointing to existing documents produce zero diagnostics of any kind.
4. Verify that embeds pointing to non-existent documents produce exactly one FG004 diagnostic each, with the range covering the full embed target token.
5. Compute: (correctly classified embeds / total embed links tested) × 100.
**Fail:** Any existing-target embed producing FG004, or any missing-target embed failing to produce FG004.
**Goal:** 100% correct classification.
**Stakeholders:** Vault authors, technical writers using transclusion, Obsidian Publish users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/embeds#markdown-embeds]], [[design/domain-layer#vault-index]], [[requirements/diagnostics#FG004]].

---

**Tag:** Embed.Resolution.ImageTarget
**User Req:** User.Embed.DetectBrokenEmbed
**Gist:** `![[image.png]]` embed links pointing to image files must not produce FG001 (BrokenWikiLink); only FG004 (BrokenEmbed) applies when the image file is absent.
**Ambition:** Images are a primary content type in Obsidian vaults. The FG001 diagnostic is semantically specific to broken wiki-link resolution between markdown documents. Emitting FG001 for image embeds would misrepresent the nature of the problem, route the author to the wrong remediation, and conflate two categorically different link types. Correct diagnostic assignment allows tooling and users to distinguish between missing documents and missing assets.
**Scale:** Percentage of `![[image.*]]` embed links in a test vault that produce the correct diagnostic outcome: no FG001 regardless of whether the image exists, and FG004 only when the image file is absent from the vault directory.
**Meter:**

1. Create a test vault with at least 6 image embed links: 3 pointing to image files that exist in the vault (`png`, `jpg`, `svg`), 3 pointing to image files that do not exist.
2. Open all documents and wait for `textDocument/publishDiagnostics`.
3. Verify that no FG001 diagnostic appears on any image embed link, regardless of file existence.
4. Verify that embeds pointing to absent image files produce exactly one FG004 diagnostic each.
5. Verify that embeds pointing to present image files produce zero diagnostics.
6. Compute: (correctly handled image embeds / total image embed links tested) × 100.
**Fail:** Any FG001 on any image embed link, or any present-image embed producing FG004.
**Goal:** 100% correct diagnostic assignment.
**Stakeholders:** Vault authors who embed images, presentation creators, Obsidian Publish users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/embeds#image-embeds]], [[requirements/diagnostics#FG001]], [[requirements/diagnostics#FG004]], [[design/domain-layer#asset-index]].

---

**Tag:** Embed.HeadingEmbed.Resolution
**User Req:** User.Embed.DetectBrokenEmbed, User.Embed.PreviewLinkedContent
**Gist:** `![[doc#Heading]]` section embed syntax must validate that both the target document exists in VaultIndex and that the named heading exists within that document, producing appropriate diagnostics when either is absent.
**Ambition:** Heading-scoped embeds are widely used in Obsidian to compose documents from sections of other notes. A broken heading embed silently renders nothing or renders the wrong content. Validating both the document reference and the heading reference provides precise, actionable diagnostic information: the author knows immediately whether they mistyped the document name or the heading name, enabling faster correction.
**Scale:** Percentage of `![[doc#Heading]]` embed links that the server correctly diagnoses: no diagnostic when both document and heading exist; FG004 with an appropriate message when the document is missing; FG004 with a distinct message indicating missing heading when the document exists but the heading does not.
**Meter:**

1. Create a test vault with at least 3 documents each containing at least 3 headings.
2. Author a document with 6 heading embed links:
   - 2 valid (document and heading both exist)
   - 2 with a non-existent document
   - 2 with an existing document but a non-existent heading
3. Open the document and wait for diagnostics.
4. Verify the 2 valid embeds produce zero diagnostics.
5. Verify the 2 missing-document embeds produce FG004 with the diagnostic message referencing the document name.
6. Verify the 2 missing-heading embeds produce FG004 with the diagnostic message referencing the heading name.
7. Compute: (correctly diagnosed embeds / total embeds tested) × 100.
**Fail:** Any valid heading embed producing a diagnostic, or any broken heading embed failing to produce FG004.
**Goal:** 100% correct diagnosis across all three cases.
**Stakeholders:** Vault authors using section transclusion, knowledge base curators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/embeds#heading-embeds]], [[design/domain-layer#heading-index]], [[requirements/diagnostics#FG004]].

---

**Tag:** Embed.BlockEmbed.Resolution
**User Req:** User.Embed.DetectBrokenEmbed
**Gist:** `![[doc#^blockid]]` block embed syntax must validate that the target document exists and that the referenced `^blockid` anchor is present in that document, producing FG004 when either condition is unmet.
**Ambition:** Block-level transclusion via `^blockid` anchors is a distinctive and heavily used Obsidian feature that enables fine-grained content reuse. Because block IDs are author-defined freeform strings, they are prone to typos and drift when the source document is edited. Early detection of broken block embeds prevents silent content gaps in composed notes, particularly in daily notes workflows and evergreen note systems where block transclusion is the primary assembly mechanism.
**Scale:** Percentage of `![[doc#^blockid]]` embed links correctly diagnosed: zero diagnostics when both document and block anchor exist; FG004 when the document is absent; FG004 when the document exists but the block anchor is not in OFMIndex.blockAnchors for that document.
**Meter:**

1. Create a test vault with at least 3 documents, each containing at least 3 block-anchor definitions (e.g., `paragraph text ^anchor-id`).
2. Author a document with 6 block embed links:
   - 2 valid (document and block anchor both exist)
   - 2 referencing a non-existent document
   - 2 referencing an existing document with a non-existent block anchor
3. Open the document and wait for `textDocument/publishDiagnostics`.
4. Verify the 2 valid embeds produce zero diagnostics.
5. Verify the 4 broken embeds each produce exactly one FG004.
6. Compute: (correctly diagnosed embeds / total embeds tested) × 100.
**Fail:** Any valid block embed producing FG004, or any broken block embed failing to produce FG004.
**Goal:** 100% correct diagnosis.
**Stakeholders:** Vault authors using block transclusion, Zettelkasten practitioners, evergreen note authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/embeds#block-embeds]], [[requirements/block-references]], [[design/domain-layer#block-anchor-index]], [[requirements/diagnostics#FG004]].
