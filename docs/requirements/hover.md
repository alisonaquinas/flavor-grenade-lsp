---
title: Hover Requirements
tags:
  - requirements/hover
aliases:
  - Hover Requirements
  - FG Hover
---

# Hover Requirements

> [!NOTE] Scope
> These requirements govern `textDocument/hover` behaviour: wiki-link hover content (title, first-paragraph preview, and stats), and embed hover content (resolved path and file type). Tag hover, frontmatter key hover, and the `hover.enabled` configuration switch are specified in [[features/hover]]. Positions that return null are enumerated in [[features/hover#No Hover Positions]]. The `hover.preview_chars` configuration key is specified in [[configuration]].

---

**Tag:** HV-001
**Gist:** Hovering a wiki-link must return a `Hover` response containing the target document's title (H1 heading or file stem), its vault-relative path, and the first non-frontmatter, non-heading paragraph of the target document, truncated to `hover.preview_chars` characters.
**Ambition:** The primary friction of navigating a large vault is not the navigation itself but the decision of whether to navigate — authors must open a note to determine whether it contains the information they need. A hover that surfaces the title and first paragraph provides a preview-before-navigate affordance that eliminates speculative opens. Accurate truncation ensures that long introductory paragraphs do not overwhelm the hover popup, and the inclusion of the vault-relative path lets authors distinguish documents with identical titles in different directories without opening either.
**Scale:** Three sub-scales: (1) percentage of cursor positions on valid (resolvable) wiki-link tokens that return a non-null `Hover` containing all three components: title line, preview paragraph, and path; (2) percentage of preview paragraphs in those responses that are correctly truncated at `hover.preview_chars` (with `…` appended if truncated, unmodified if shorter); (3) percentage of hover responses for wiki-links that resolve to existing documents where the `range` field covers exactly the full `[[...]]` span.
**Meter:**
1. Create a test vault with at least 5 documents. Each document must have: a `# H1` heading; at least one paragraph of body text; a known vault-relative path.
2. Configure `hover.preview_chars = 200`.
3. Author an index document with wiki-links to each test document.
4. For each wiki-link, place the cursor inside the token and issue `textDocument/hover`.
5. Verify the response `MarkupContent.value` contains: (a) the document's H1 heading text in bold; (b) the vault-relative path in a code span; (c) a paragraph of body text from the target document (first non-frontmatter, non-heading paragraph).
6. For documents whose first paragraph exceeds 200 characters: verify the preview is exactly 200 characters followed by `…`. For documents whose first paragraph is ≤ 200 characters: verify the full paragraph appears without truncation or appended `…`.
7. Verify the `hover.range` covers the full `[[target]]` span (from the leading `[[` to the trailing `]]` inclusive).
8. Compute scale (1): (wiki-link positions returning all three components / total valid wiki-link positions tested) × 100.
9. Compute scale (2): (preview paragraphs with correct truncation behaviour / total preview paragraphs tested) × 100.
10. Compute scale (3): (responses with correctly scoped range / total responses) × 100.
**Fail:** Any valid wiki-link position returning null or a response missing title, path, or preview; any preview paragraph truncated at the wrong length or missing the `…` suffix; any `range` not covering the full `[[...]]` span.
**Goal:** 100% compliance on all three sub-scales.

---

**Tag:** HV-002
**Gist:** Hovering an embed link must return a `Hover` response containing the embedded target's resolved vault-relative path and its detected file type, using type-appropriate content as defined in the embed hover specification.
**Ambition:** Embed links in OFM span a heterogeneous set of file types — markdown documents, images, audio, video, and PDFs — all behind the same `![[...]]` syntax. Without hover support, authors cannot distinguish a broken embed from a valid one without the editor rendering the embed, which not all LSP-capable editors do. A hover that surfaces the resolved path and file type provides an immediate sanity-check for embed correctness and helps authors diagnose FG004 (BrokenEmbed) diagnostics without leaving the editor. The resolved path (not the raw link text) confirms that vault-relative resolution is working correctly.
**Scale:** Two sub-scales: (1) percentage of cursor positions on valid (resolvable) embed link tokens (`![[target]]`) that return a non-null `Hover` whose content includes both the resolved vault-relative path and the file type label (`"Image"`, `"Audio"`, `"Video"`, `"PDF"`, `"File"`, or a markdown first-paragraph preview for `.md` embeds); (2) percentage of `Hover` responses for `.md` embeds that include the first paragraph of the embedded document (matching the behaviour specified for wiki-link hover previews).
**Meter:**
1. Create a test vault with at least one of each embeddable file type: a `.md` document, a `.png` image, an `.mp3` audio file, a `.pdf` file.
2. Author a test document with `![[target]]` embeds pointing to each test file.
3. For each embed, place the cursor inside the `![[...]]` token and issue `textDocument/hover`.
4. For non-.md embeds: verify the `MarkupContent.value` contains both the vault-relative path and the appropriate type label (e.g., `"Image: photo.png"` for `.png`).
5. For `.md` embeds: verify the response contains the resolved vault-relative path and the first paragraph of the embedded document, applying the same `hover.preview_chars` truncation rule as HV-001.
6. Verify the `hover.range` covers the full `![[...]]` span (from `![[` to `]]` inclusive).
7. Compute scale (1): (embed positions returning path + type label / total valid embed positions tested) × 100.
8. Compute scale (2): (`.md` embed responses containing first-paragraph preview / total `.md` embed positions tested) × 100.
**Fail:** Any valid embed position returning null or a response missing the resolved path or file type label; any `.md` embed response missing the first-paragraph preview.
**Goal:** 100% compliance on both sub-scales.
