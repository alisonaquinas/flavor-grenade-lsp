---
title: Rename Refactoring Requirements
tags:
  - requirements/rename
aliases:
  - Rename Requirements
  - FG Rename
---

# Rename Refactoring Requirements

> [!NOTE] Scope
> These requirements govern the `textDocument/rename` and `textDocument/prepareRename` LSP methods. They cover completeness of the workspace edit produced by rename, rejection of invalid rename positions, and style-binding consistency between rename targets and active wiki-link style configuration. Completion style binding is specified in [[completions#Completion.WikiStyle.Binding]]. The wiki-style configuration contract is defined in [[configuration]].

---

**Tag:** Rename.Refactoring.Completeness
**User Req:** User.Rename.RenameNoteEverywhere, User.Rename.RenameHeadingEverywhere
**Gist:** A `textDocument/rename` request on a renameable element (document title or heading) must produce a `WorkspaceEdit` that updates every cross-document reference to that element in a single atomic edit, with no reference left unupdated.
**Ambition:** A rename operation that misses references leaves the vault in an inconsistent state: some links point to the new name, others to the old name, producing broken-link diagnostics and a confusing navigational experience. Authors trust rename to be a safe, complete operation — the same guarantee users expect from IDE refactoring tools. Anything less than 100% completeness transforms rename from a reliable tool into a source of hard-to-diagnose link rot that spreads silently through the vault.
**Scale:** Percentage of cross-document references to the renamed element that are updated in the `WorkspaceEdit` returned by the rename request. A reference is any `[[link]]`, `![[embed]]`, or heading anchor in the vault that resolves to the renamed element. Scope: all indexed documents in the vault.
**Meter:**
1. Create a test vault with at least 15 documents. Ensure the target element (e.g., `My Document`) is referenced by at least 12 of them, using a mix of wiki-links (`[[My Document]]`), embed links (`![[My Document]]`), and heading links (`[[My Document#Section]]`).
2. Issue `textDocument/rename` with the new name from the document title position.
3. Collect the returned `WorkspaceEdit`.
4. Apply the edit to a copy of the vault.
5. Independently scan all original documents for references to the old name.
6. Verify each such reference is updated in the applied edit.
7. Verify no reference to the old name remains in any indexed document after the edit is applied.
8. Compute: (references updated in WorkspaceEdit / total references found by independent scan) × 100.
**Fail:** Any reference to the old name remaining in any indexed document after the workspace edit is applied (i.e., < 100% updated).
**Goal:** 100% of references updated in a single `WorkspaceEdit`.
**Stakeholders:** Vault authors performing refactoring, knowledge base curators, teams managing shared vaults.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#rename-handler]], [[design/domain-layer#vault-index]], LSP specification §3.16 textDocument/rename, [[navigation#Navigation.References.Completeness]].

---

**Tag:** Rename.Prepare.Rejection
**User Req:** User.Rename.RenameHeadingEverywhere
**Gist:** `textDocument/prepareRename` must return `null` (or a `ResponseError`) when the cursor is positioned on any non-renameable location: body text prose, fenced code blocks, math blocks, or inline URLs in standard Markdown links.
**Ambition:** The `prepareRename` method exists in the LSP protocol specifically to allow the server to validate the rename target before the user commits to a new name. If `prepareRename` does not reject invalid positions, the client will prompt the user for a new name, the user will type it, and then `textDocument/rename` will either silently do nothing or produce an error — both outcomes are confusing and erode user trust. Correct rejection at the `prepareRename` stage provides immediate, low-cost feedback that the cursor is not on a renameable element.
**Scale:** Percentage of `textDocument/prepareRename` requests issued at non-renameable cursor positions that return `null` or a protocol-compliant error response. Non-renameable positions include: mid-paragraph prose, content inside fenced code blocks, content inside `$$...$$` or `$...$` math spans, and URL portions of `[text](url)` inline links.
**Meter:**
1. Author a document containing at least 8 non-renameable positions:
   - 2 positions in mid-paragraph prose (not on any link or heading token)
   - 2 positions inside a fenced code block
   - 2 positions inside a math block (`$$...$$`)
   - 2 positions on the URL portion of an inline link (`[text](https://example.com)`)
2. Issue `textDocument/prepareRename` at each position.
3. Verify each response is `null` or a `ResponseError`.
4. Additionally, verify that at least 2 valid positions (document title, heading text) return a non-null range response.
5. Compute: (invalid positions returning null/error / total invalid positions tested) × 100.
**Fail:** Any non-renameable position returning a non-null range from `prepareRename`.
**Goal:** 100% of non-renameable positions correctly rejected.
**Stakeholders:** LSP client developers, editor users, vault authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#rename-handler]], LSP specification §3.16 textDocument/prepareRename, [[ofm-spec/wiki-links]].

---

**Tag:** Rename.StyleBinding.Consistency
**User Req:** User.Rename.RenameNoteEverywhere, User.Author.FollowLinkStyle
**Gist:** The rename `WorkspaceEdit` must only update references that are bound to the active `wiki.style` configuration; links bound to a different style must not be rewritten, and the new reference text must conform to the active style.
**Ambition:** A vault may contain links created under different style configurations — for example, historical file-stem links that predate a switch to title-slug mode. Rewriting all links regardless of style would corrupt the historical links by applying the wrong text transformation, potentially making them ambiguous or broken under their original interpretation. Style-binding consistency ensures that rename operates precisely within its declared scope: if `wiki.style` is `title-slug`, only title-slug-formatted links are updated, and the updated links use the new title in slug format. This is the rename-specific formulation of the general style-binding contract established in [[wiki-link-resolution#Link.Wiki.StyleBinding]].
**Scale:** Percentage of rename `WorkspaceEdit` text changes that: (a) update only references whose existing text format matches the active `wiki.style`; and (b) write the new reference text in the format prescribed by the active `wiki.style`. Out-of-style links present in the vault must not appear in the WorkspaceEdit at all.
**Meter:**
1. Create a test vault with documents referenced by a mix of link styles: some using file-stem format, some using title-slug format (different from the active style).
2. Set `wiki.style` to `title-slug`.
3. Issue `textDocument/rename` on a document whose title changes from `Old Title` to `New Title`.
4. Collect the `WorkspaceEdit`.
5. Verify that only links in title-slug format (`[[old-title]]`) are included in the edit.
6. Verify that file-stem format links (`[[old-title-stem]]`) are absent from the edit.
7. Verify all updated texts are in title-slug format for the new title (`[[new-title]]`).
8. Repeat with `wiki.style` set to `file-stem`; verify the inverse: only file-stem links updated.
9. Compute: (style-correct edit entries / total edit entries) × 100.
**Fail:** Any rename edit entry that updates an out-of-style link, or any updated link text that does not conform to the active style.
**Goal:** 100% of edit entries are style-consistent.
**Stakeholders:** Vault authors with mixed-style link histories, teams migrating link style conventions.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[wiki-link-resolution#Link.Wiki.StyleBinding]], [[configuration]], [[design/api-layer#rename-handler]], [[design/domain-layer#wiki-style]].
