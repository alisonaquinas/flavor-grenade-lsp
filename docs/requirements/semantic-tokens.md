---
title: Semantic Token Requirements
tags:
  - requirements/semantic-tokens
aliases:
  - Semantic Token Requirements
  - FG Semantic Tokens
---

# Semantic Token Requirements

> [!NOTE] Scope
> These requirements govern `textDocument/semanticTokens/full` and `textDocument/semanticTokens/range` behaviour: token type coverage for OFM constructs, correct scoping (no tokens inside fenced code or math blocks), and LSP delta-encoding compliance. The full token type legend and editor integration examples are specified in [[features/semantic-tokens]]. The token encoding format follows LSP 3.17 §3.16.6.

---

**Tag:** ST-001
**Gist:** The server must emit semantic token ranges for all five primary OFM construct categories — wiki-links, embed links, block anchors, inline tags, and callout markers — so that LSP-capable editors can apply syntax highlighting to OFM-specific constructs beyond what base Markdown TextMate grammars provide.
**Ambition:** Standard Markdown TextMate grammars have no knowledge of Obsidian-specific constructs. Without semantic tokens, `[[wiki-links]]`, `![[embeds]]`, `^block-anchors`, `#tags`, and `> [!CALLOUT]` markers all render as plain text or generic punctuation in LSP editors such as Neovim, Helix, and Zed. Semantic tokens are the LSP-standard mechanism for the server to communicate these construct boundaries to editors in a theme-agnostic way. Full construct coverage ensures that authors using any LSP editor get the same structural visual feedback that Obsidian's native renderer provides, making the OFM document structure legible regardless of editor choice.
**Scale:** Percentage of the five primary OFM construct categories (wiki-links, embed links, block anchors, inline tags, callout markers) for which at least one semantic token of the appropriate type is emitted in a `textDocument/semanticTokens/full` response for a document containing at least two instances of each construct. A "correct" token must have: the correct `tokenType` index as registered in the legend; a `length` and `deltaLine`/`deltaStartChar` that resolves to the exact source range of the construct; and a `tokenModifiers` bitmask consistent with the legend.
**Meter:**
1. Author a test document containing:
   - At least 2 `[[wiki-link]]` constructs (using `wikiLink`, `wikiLinkTarget` token types)
   - At least 2 `![[embed-link]]` constructs (using `embedLink` token type)
   - At least 2 `^blockid` anchors at end-of-line (using `blockAnchor` token type)
   - At least 2 inline `#tag` occurrences in body text (using `tag` token type)
   - At least 2 `> [!TYPE]` callout markers (using `calloutType` token type)
2. Open the document; issue `textDocument/semanticTokens/full`.
3. Decode the flat integer array using the LSP delta-encoding algorithm (LSP 3.17 §3.16.6) to recover `(line, startChar, length, tokenType, tokenModifiers)` tuples.
4. For each of the 5 construct categories, verify at least 2 tokens with the expected `tokenType` index are present.
5. For each decoded token, verify the `(line, startChar, length)` triple maps to the correct source span in the document text.
6. Compute: (construct categories with correct token coverage / 5) × 100.
**Fail:** Any of the 5 construct categories with zero tokens or tokens with incorrect `tokenType` index; any token whose decoded position does not match the actual source span.
**Goal:** 100% (all 5 construct categories covered; all token positions correct).

---

**Tag:** ST-002
**Gist:** Semantic tokens must not be emitted for OFM constructs that appear inside fenced code blocks or display math blocks (`$$...$$`); such spans must be completely absent from the `textDocument/semanticTokens/full` response.
**Ambition:** Fenced code blocks and display math blocks are verbatim-content regions: editors render them with specialised highlighting (syntax highlighting for the code language, LaTeX rendering for math) that must not be overridden or confused by OFM semantic tokens. A `#tag` inside a code block is not a vault tag — it is source code. A `[[link]]` inside a math block is not a wiki-link — it is LaTeX. Emitting OFM tokens for these constructs would cause incorrect visual highlighting (OFM colours over code syntax colours), mislead find-references operations, and create false positives in diagnostics. Suppression is required for correctness, not merely for aesthetics.
**Scale:** Percentage of `textDocument/semanticTokens/full` responses for documents containing OFM-syntax strings inside fenced code and math blocks where zero OFM semantic tokens are emitted for any character position that falls within a fenced code block or display math block span.
**Meter:**
1. Author a test document with:
   - A fenced code block containing: `[[wiki-link-in-code]]`, `#tag-in-code`, `![[embed-in-code]]`, `^anchor-in-code`, `> [!NOTE] in code`
   - A `$$` display math block containing: `[[link-in-math]]`, `#tag-in-math`
   - Outside those blocks: one valid `[[valid-link]]`, one `#valid-tag`, one `![[valid-embed]]`
2. Issue `textDocument/semanticTokens/full`.
3. Decode the response into `(line, startChar, length, tokenType, tokenModifiers)` tuples.
4. Compute the character ranges of all fenced code blocks and display math blocks in the source.
5. For each decoded token, verify that its source range does NOT overlap with any fenced code block or display math block range.
6. Verify that tokens ARE present for `[[valid-link]]`, `#valid-tag`, and `![[valid-embed]]` (to confirm the server is not trivially suppressing all tokens).
7. Compute: (responses with zero tokens overlapping code/math regions / total responses tested) × 100.
**Fail:** Any decoded token whose source range overlaps with a fenced code block or display math block; any response that also suppresses tokens for valid OFM constructs outside those regions.
**Goal:** 100% of responses contain zero tokens overlapping fenced code or display math regions; valid outside-block tokens present in all responses.
