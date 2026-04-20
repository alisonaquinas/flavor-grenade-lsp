---
title: Code Action Requirements
tags:
  - requirements/code-actions
aliases:
  - Code Action Requirements
  - FG Code Actions
---

# Code Action Requirements

> [!NOTE] Scope
> These requirements govern `textDocument/codeAction` and `workspace/executeCommand` behaviour for the three OFM-specific code actions shipped in v1: `fg.createMissingFile` (create a missing wiki-link target), `fg.toc` (generate a table of contents from headings), and `fg.tagToYaml` (move inline tags to frontmatter). Diagnostic trigger conditions for FG001 are specified in [[wiki-link-resolution]]. Configuration keys are specified in [[configuration]].

---

**Tag:** CA-001
**Gist:** The server must surface a `fg.createMissingFile` code action when the cursor is inside a wiki-link whose target resolves to zero documents, and executing that action must create the missing file in the vault and clear the FG001 diagnostic.
**Ambition:** Broken wiki-links are the most common entry-point error in rapid note-taking workflows: authors write the link before the note exists. If the LSP offers no repair path from the error to the fix, authors must manually create the file, name it correctly, and wait for the next diagnostic cycle — three friction points that interrupt the writing flow. A single code action invocation that performs all three steps keeps the author in flow and reinforces the "link first, write later" OFM working style.
**Scale:** Two sub-scales: (1) percentage of cursor positions on FG001-flagged wiki-links at which `textDocument/codeAction` returns at least one item with command `fg.createMissingFile`; (2) percentage of `fg.createMissingFile` executions that result in the target file being created, added to the VaultIndex, and the FG001 diagnostic being cleared within the next diagnostic cycle.
**Meter:**

1. Create a test vault with at least 5 documents. Author a new document containing at least 3 `[[broken-link-N]]` wiki-links that do not resolve to any existing file.
2. Open the document; wait for FG001 diagnostics to appear on each broken link.
3. For each FG001 span, place the cursor inside the broken wiki-link token and issue `textDocument/codeAction`.
4. Verify at least one returned action has `command.command = "fg.createMissingFile"`.
5. Execute the action. Verify via `workspace/applyEdit` that a `CreateFile` operation is issued for the expected path.
6. Wait for the next diagnostic cycle (≤ `diagnostics.debounce_ms` + 100 ms). Verify the FG001 diagnostic for that span is absent.
7. Verify the new file appears in subsequent completion candidates for `[[broken-link-N`.
8. Compute scale (1): (FG001 positions offering fg.createMissingFile / total FG001 positions tested) × 100.
9. Compute scale (2): (executions resulting in correct file creation + FG001 clearance / total executions) × 100.
**Fail:** Any FG001 cursor position that does not offer `fg.createMissingFile`; any execution that fails to create the file or leaves the FG001 diagnostic active after the next diagnostic cycle.
**Goal:** 100% compliance on both sub-scales.

---

**Tag:** CA-002
**Gist:** The server must surface a `fg.toc` code action whenever the current document contains at least one heading, and executing the action must insert or replace a `<!-- TOC -->` block with a correctly formatted Markdown list of heading links respecting the configured `toc.max_depth`.
**Ambition:** Long OFM notes with many headings become navigable only if the author manually maintains a table of contents — a tedious, error-prone, and invariably stale process. An LSP code action that regenerates the TOC on demand eliminates that maintenance burden and ensures the TOC always reflects the current heading structure. The `<!-- TOC -->` comment markers allow idempotent re-generation: a second invocation updates rather than duplicates, which is the behaviour authors expect from a "keep it fresh" workflow.
**Scale:** Three sub-scales: (1) percentage of documents containing at least one heading at or below `toc.max_depth` at which `textDocument/codeAction` returns an item with command `fg.toc`; (2) percentage of `fg.toc` executions that produce a `<!-- TOC -->` block whose entries exactly match all headings at or below `toc.max_depth` in document order; (3) percentage of repeat executions on a document that already has a `<!-- TOC -->` block where the action label is `"Update Table of Contents"` and the existing block is replaced (not duplicated).
**Meter:**

1. Create a test document with headings at levels H1 through H4. Configure `toc.max_depth = 3`.
2. Issue `textDocument/codeAction` at an arbitrary cursor position. Verify `fg.toc` is present.
3. Execute the action. Inspect the resulting workspace edit. Verify: (a) a `<!-- TOC -->...<!-- /TOC -->` block is inserted; (b) entries are `[[#Heading Text]]` links for every heading at levels H1, H2, H3 (H4 excluded); (c) nesting depth in the list matches heading level depth.
4. Execute the action again on the same document. Verify: (a) no second `<!-- TOC -->` block is created; (b) the existing block is replaced with a fresh copy; (c) the action label in the `codeAction` response is `"Update Table of Contents"`.
5. Modify a heading in the document. Execute the action. Verify the TOC reflects the new heading text.
6. Compute scale (1): (documents with headings offering fg.toc / total documents tested) × 100.
7. Compute scale (2): (executions producing correct entry set in correct order / total executions) × 100.
8. Compute scale (3): (repeat executions replacing block without duplication / total repeat executions) × 100.
**Fail:** Any document with headings that does not offer `fg.toc`; any execution producing an incorrect entry set, wrong order, or depth mismatch; any repeat execution that duplicates the TOC block.
**Goal:** 100% compliance on all three sub-scales.

---

**Tag:** CA-003
**Gist:** The server must surface a `fg.tagToYaml` code action when the cursor is on an inline `#tag` in the document body (outside code and math blocks), and executing the action must move the selected tag(s) into the frontmatter `tags:` array and remove them from the body text.
**Ambition:** Obsidian treats inline body tags and frontmatter `tags:` values as functionally equivalent, but vault-wide tooling, search, and publish pipelines often rely exclusively on frontmatter tags for indexing and filtering. Authors who use inline tags for speed but later want structured frontmatter must currently move them manually — a tedious, repetitive process that grows linearly with the number of tags. A code action that performs the move atomically removes the friction and ensures the resulting frontmatter is valid YAML (deduplication, correct sequence style), which manual editing cannot guarantee.
**Scale:** Three sub-scales: (1) percentage of cursor positions on inline body `#tag` tokens (outside fenced code and math blocks) at which `textDocument/codeAction` returns at least one item with command `fg.tagToYaml`; (2) percentage of `fg.tagToYaml` executions that correctly add the tag to frontmatter `tags:` (deduplicated, flow-sequence style) and remove it from the body; (3) percentage of executions on documents without existing frontmatter that result in a new valid frontmatter block being created.
**Meter:**

1. Author a test document with: (a) 3 inline body tags; (b) one `#tag` inside a fenced code block; (c) one `#tag` inside a `$$` math block. No frontmatter initially.
2. Place the cursor on an inline body tag. Issue `textDocument/codeAction`. Verify `fg.tagToYaml` is offered.
3. Place the cursor on the `#tag` inside the fenced code block. Verify `fg.tagToYaml` is NOT offered.
4. Execute `fg.tagToYaml` for one body tag. Inspect the workspace edit. Verify: (a) a frontmatter block is created with `tags: [tagname]`; (b) the `#tagname` occurrence is removed from the body text.
5. Execute for a second body tag on the same document (which now has frontmatter with one tag). Verify: (a) the new tag is appended to the existing `tags: [...]` array; (b) no duplicate entry; (c) flow-sequence YAML style preserved.
6. Verify body integrity: surrounding punctuation may be affected; the word immediately before and after the tag is left intact (no extra whitespace deletion).
7. Compute scale (1): (eligible body tag positions offering fg.tagToYaml / total eligible body tag positions) × 100.
8. Compute scale (2): (executions producing correct frontmatter update + body removal / total executions) × 100.
9. Compute scale (3): (executions on frontmatter-free documents creating valid frontmatter / total such executions) × 100.
**Fail:** Any eligible body tag position not offering `fg.tagToYaml`; any execution on a code-block or math-block tag offering `fg.tagToYaml`; any execution producing duplicate frontmatter entries or invalid YAML.
**Goal:** 100% compliance on all three sub-scales.
