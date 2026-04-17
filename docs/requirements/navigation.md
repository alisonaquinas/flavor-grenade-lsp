---
title: Navigation Requirements
tags:
  - requirements/navigation
aliases:
  - Navigation Requirements
  - FG Navigation
---

# Navigation Requirements

> [!NOTE] Scope
> These requirements govern LSP navigation features: `textDocument/definition` (go-to-definition), `textDocument/references` (find-references), and `textDocument/codeLens` (reference count display). They apply to all link types defined in the OFM specification: wiki-links, embed links, block references, and tags. Single-file mode behaviour follows the suppression rules in [[diagnostics#Diagnostic.SingleFile.Suppression]]. Rename navigation is specified in [[rename]].

---

**Tag:** Navigation.Definition.AllLinkTypes
**Gist:** The `textDocument/definition` handler must return a valid `Location` response for cursor positions on wiki-links, embed links, block references, and tag occurrences.
**Ambition:** Go-to-definition is the single most important navigation feature in a knowledge graph context — it is the LSP equivalent of clicking a hyperlink. If any link type is unsupported, authors must fall back to manual search for that type, which undermines the server's value as a seamless navigation layer. Complete link-type coverage establishes the server as a reliable replacement for Obsidian's own Ctrl+Click navigation, applicable in any LSP-compatible editor.
**Scale:** Percentage of the four defined OFM link types (wiki-link, embed link, block reference, tag) for which `textDocument/definition` returns a non-null, non-empty `Location` result when the cursor is on a valid (resolvable) occurrence. Scope: all four types must be tested with at least 3 valid occurrences each.
**Meter:**
1. Create a test vault with documents covering all four link types:
   - At least 3 `[[wiki-link]]` occurrences pointing to existing documents
   - At least 3 `![[embed-link]]` occurrences pointing to existing documents
   - At least 3 `[[doc#^blockid]]` occurrences pointing to existing block anchors
   - At least 3 `#tag` occurrences with the tag defined in at least one other document
2. For each occurrence, place the cursor on the link token and issue `textDocument/definition`.
3. Verify each response is a non-null `Location` (or `Location[]`) pointing to the correct target range in the correct file.
4. Compute: (link types with 100% correct definition results / 4 link types) × 100.
**Fail:** Any of the four link types returning null or an incorrect Location for a valid occurrence.
**Goal:** 100% of link types supported; 100% of valid occurrences return correct Location.
**Stakeholders:** Vault authors navigating their knowledge graph, editor users expecting Ctrl+Click behaviour.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#definition-handler]], [[ofm-spec/wiki-links]], [[ofm-spec/embeds]], [[ofm-spec/properties#inline-tags]], LSP specification §3.14 textDocument/definition.

---

**Tag:** Navigation.References.Completeness
**Gist:** The `textDocument/references` handler must return every reference in the vault folder that resolves to the target document, heading, block anchor, or tag — with no omissions.
**Ambition:** Find-references in a vault context is a graph traversal problem: the author needs to know every note that links to or mentions a given target before safely renaming or deleting it. An incomplete references list gives a false sense of safety — the author believes they have found all dependents, renames the target, and discovers later that orphaned links remain. Completeness is therefore a hard correctness property, not a quality-of-life improvement.
**Scale:** Percentage of actual references in the vault folder (as determined by an independent full-text scan of all indexed documents) that are returned in the `textDocument/references` response for a given target. Scope: wiki-link, embed, block-reference, and tag references to the target.
**Meter:**
1. Create a test vault with at least 15 documents. In 10 of them, include references to a single target document (mix of wiki-links, embed links, and heading references).
2. Open the target document. Issue `textDocument/references` with `includeDeclaration: false` from the document title position.
3. Collect the returned `Location[]`.
4. Independently scan all indexed document source text for any occurrence of `[[targetDoc]]`, `![[targetDoc]]`, `[[targetDoc#heading]]` that resolves to the target.
5. Compare the two sets. Compute: (locations in LSP response / locations found by independent scan) × 100.
**Fail:** Any reference found by independent scan that is absent from the LSP response (i.e., < 100%).
**Goal:** 100% of actual references returned.
**Stakeholders:** Vault authors before rename or delete operations, knowledge base curators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#references-handler]], [[design/domain-layer#vault-index]], LSP specification §3.15 textDocument/references.

---

**Tag:** Navigation.CodeLens.Count
**Gist:** Each heading in an indexed document must display a `textDocument/codeLens` entry showing the exact count of vault-wide references that resolve to that heading, and the count must be updated when the vault index changes.
**Ambition:** Reference counts on headings give authors an at-a-glance measure of how well-connected each section of their vault is. A heading with 0 references is a candidate for pruning or promotion; a heading with many references signals high-value content that should be protected during refactoring. Inaccurate counts would misguide these decisions, and a count that becomes stale after indexing changes would erode trust in the entire code lens feature.
**Scale:** Percentage of headings across all indexed documents whose displayed code lens reference count exactly matches the actual count of vault-wide references resolving to that heading (including `[[doc#Heading]]` and `![[doc#Heading]]` syntax). Scope: all headings in all indexed documents in a vault of at least 10 documents.
**Meter:**
1. Create a test vault with at least 10 documents. Ensure at least 5 headings have a known, non-zero reference count and at least 3 headings have zero references.
2. Issue `textDocument/codeLens` for each document and collect all code lens entries.
3. For each heading in each document, find its code lens entry and read the count from its `command.title` (e.g., `"3 references"`).
4. Independently compute the expected count by scanning all indexed documents for references to `[[docName#Heading]]` and `![[docName#Heading]]`.
5. Compare reported count to expected count for each heading.
6. Compute: (headings with correct count / total headings) × 100.
7. Modify a document to add a new reference to a heading; verify the code lens count updates within the next index cycle.
**Fail:** Any heading whose code lens count does not match the actual reference count.
**Goal:** 100% of headings display correct reference counts.
**Stakeholders:** Vault authors assessing content connectivity, PKM practitioners, Zettelkasten users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#codelens-handler]], [[design/domain-layer#heading-index]], [[ofm-spec/wiki-links#heading-links]], LSP specification §3.16 textDocument/codeLens.
