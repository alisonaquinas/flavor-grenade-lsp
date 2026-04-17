---
title: Tag Indexing Requirements
tags:
  - requirements/tag-indexing
aliases:
  - Tag Requirements
  - FG Tag Indexing
---

# Tag Indexing Requirements

> [!NOTE] Scope
> These requirements govern the completeness, hierarchical correctness, frontmatter equivalence, and Unicode coverage of the tag index maintained by VaultIndex. They apply to inline `#tag` syntax and `tags:` YAML frontmatter values. Code blocks, math blocks, and HTML comments are explicitly excluded from tag indexing scope. Tag-based completion behaviour is also covered in [[completions]]. Tag go-to-definition and references are covered in [[navigation]].

---

**Tag:** Tag.Index.Completeness
**Gist:** All `#tag` occurrences in vault body text must be discovered and indexed by VaultIndex, excluding only occurrences inside fenced code blocks, indented code blocks, math blocks, and HTML comments.
**Ambition:** A tag index that silently misses occurrences is unreliable for completion, navigation, and find-references. Authors who trust the tag index to represent their vault's knowledge graph will make incorrect decisions if the index is incomplete. Full coverage of body-text tags is the foundational guarantee on which all other tag features depend.
**Scale:** Percentage of actual `#tag` tokens present in vault body text (as parsed by the OFM parser, excluding excluded regions) that appear in the VaultIndex tag entry for that document and vault scope.
**Meter:**
1. Create a test vault with at least 10 documents. Each document must contain:
   - At least 5 inline `#tag` occurrences in body text (paragraphs, headings, list items)
   - At least 2 `#tag` occurrences inside fenced code blocks (should be excluded)
   - At least 1 `#tag` occurrence inside a math block (should be excluded)
2. Run the VaultIndex build process.
3. For each document, use the test harness to enumerate all actual body-text `#tag` tokens (via the OFM parser's token stream, filtering excluded regions).
4. Compare the enumerated set against the VaultIndex tag set for that document.
5. Compute: (indexed body-text tags / actual body-text tags) × 100 across all documents.
**Fail:** Any body-text `#tag` token absent from VaultIndex (i.e., < 100%).
**Goal:** 100% of body-text `#tag` tokens indexed.
**Stakeholders:** Vault authors relying on tag-based navigation, teams using Dataview or tag maps.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/properties#inline-tags]], [[design/domain-layer#tag-index]], [[ofm-spec/index]].

---

**Tag:** Tag.Hierarchy.Awareness
**Gist:** The tag index must support hierarchical parent-tag queries such that querying `#project` also returns documents and positions tagged with `#project/active` and `#project/done`.
**Ambition:** Obsidian's tag hierarchy (slash-separated) is a deliberate organisational feature. An index that treats `#project` and `#project/active` as entirely unrelated tokens breaks the mental model users have built around tag trees. LSP features like find-references and completion must reflect the hierarchical relationship, or the server becomes less useful than Obsidian's own built-in tag panel.
**Scale:** Percentage of parent-tag completion and find-references requests that return the full set of child-tag matches. A parent-tag request is one where the query tag has at least one child tag in the vault. Scope: all unique parent tags with at least one child in the test vault.
**Meter:**
1. Create a test vault with at least 3 parent tags, each with at least 2 child tags (e.g., `#project/active`, `#project/done`, `#area/work`, `#area/personal`).
2. For each parent tag, invoke `textDocument/references` on a `#project` occurrence.
3. Verify the response includes positions of `#project`, `#project/active`, and `#project/done` (all descendants).
4. Trigger completion at `#proj` and verify all child tags appear in the candidate list alongside the parent.
5. Compute: (parent-tag requests returning complete child set / total parent-tag requests) × 100.
**Fail:** Any parent-tag query that omits a known child-tag result.
**Goal:** 100% of parent-tag queries return the complete descendant set.
**Stakeholders:** Vault authors using hierarchical tags, PKM practitioners, teams with tag taxonomies.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/properties#tag-hierarchies]], [[design/domain-layer#tag-index]], [[navigation]].

---

**Tag:** Tag.YAML.Equivalence
**Gist:** Tag values declared in `tags:` YAML frontmatter must be indexed identically to the same tag value appearing as inline `#tag` syntax in the document body, with no distinction between the two sources in the tag index.
**Ambition:** Obsidian treats frontmatter `tags:` and inline `#tags` as equivalent for filtering, graph view, and search. An LSP that indexes them separately or that privileges one source over the other breaks the user's mental model and produces asymmetric find-references results — some references found, others missed — which is worse than finding none, because it misleads rather than simply falling short.
**Scale:** Percentage of tag values declared in `tags:` frontmatter (across all documents in the test vault) that appear in the VaultIndex tag entry with the same key and document association as equivalent inline `#tag` occurrences would.
**Meter:**
1. Create a test vault with at least 5 documents. For each document, declare at least 2 tags in `tags:` frontmatter and place at least 2 of the same tag values as inline `#tag` in the body.
2. Run VaultIndex build.
3. For each frontmatter tag value, query the tag index for that tag name.
4. Verify the document appears in the result set for the frontmatter-sourced tag.
5. Verify the same document appears in the result set for the inline-sourced equivalent tag.
6. Verify the index entry does not distinguish by source — both are returned together in find-references.
7. Compute: (YAML tag values correctly indexed as equivalent / total YAML tag values tested) × 100.
**Fail:** Any YAML tag value absent from the vault tag index, or any tag index that returns different results for the same tag name depending on source.
**Goal:** 100% of YAML tag values appear in the index equivalent to inline tags.
**Stakeholders:** Vault authors mixing frontmatter tags and inline tags, Dataview users, plugin developers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/properties#tags-frontmatter]], [[design/domain-layer#tag-index]], [[bdd/features/tag-equivalence]].

---

**Tag:** Tag.Completion.Unicode
**Gist:** Tag completion must successfully parse and return candidates for tag names containing Unicode letters (including non-Latin scripts) and emoji characters.
**Ambition:** Obsidian's tag parser accepts any Unicode letter sequence after `#`, enabling multilingual vault authors and users who include emoji in their organisational tags (e.g., `#日本語`, `#📚reading`). An LSP that silently drops these tags from the index or fails to complete them excludes a significant segment of non-English-speaking users and creates a false sense that their vault is correctly handled when it is not.
**Scale:** Binary pass/fail per test case. A test case is a tag name containing at least one non-ASCII Unicode letter or emoji character. The scale is the percentage of such test cases that (a) parse without error, (b) appear in VaultIndex, and (c) appear in completion candidates when the prefix is typed.
**Meter:**
1. Create a vault with at least 8 documents, each containing at least one tag from the following Unicode categories: CJK ideograph (`#漢字`), Cyrillic (`#привет`), Arabic (`#مرحبا`), Emoji (`#📚reading`), mixed ASCII+Unicode (`#project日本`).
2. Run VaultIndex build; check for parser errors in the server log. Any parse error for a valid OFM tag is a failure.
3. For each tag, query the VaultIndex tag list; verify the tag name is present with the correct Unicode encoding.
4. In an LSP client, type the first character of each Unicode tag name after `#`; verify at least one matching candidate appears.
5. Compute: (Unicode tags parsing, indexing, and completing successfully / total Unicode tags tested) × 100.
**Fail:** Any valid Unicode tag that fails to parse, fails to index, or fails to appear in completion candidates.
**Goal:** 100% of Unicode tag test cases handled correctly.
**Stakeholders:** Non-English vault authors, multilingual knowledge workers, emoji-tagging users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/properties#inline-tags]], [[design/domain-layer#tag-parser]], [[bdd/features/unicode-tags]].
