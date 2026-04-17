---
title: Completion Requirements
tags:
  - requirements/completions
aliases:
  - Completion Requirements
  - FG Completions
---

# Completion Requirements

> [!NOTE] Scope
> These requirements govern `textDocument/completion` behaviour: candidate list capping, trigger-character coverage, Obsidian callout-type enumeration, and wiki-style binding for completion insertions. Tag completion Unicode coverage is specified in [[tag-indexing#Tag.Completion.Unicode]]. Block anchor completion is specified in [[block-references#Block.Completion.Offer]]. The wiki-style configuration is defined in [[configuration]].

---

**Tag:** Completion.Candidates.Cap
**Gist:** The completion candidate list must be capped at the integer value configured by `completion.candidates`, and `CompletionList.isIncomplete` must be set to `true` whenever the cap is reached.
**Ambition:** Unbounded completion lists degrade editor performance and overwhelm the author with irrelevant candidates. The cap setting lets teams tune the trade-off between completeness and responsiveness. The `isIncomplete` flag is the LSP protocol's mechanism for signalling to the client that further typing will refine the list, ensuring the client triggers a new request rather than assuming the list is final — which would silently hide matching candidates that fell outside the cap.
**Scale:** Two sub-scales: (1) percentage of completion responses where the returned item count does not exceed the configured `completion.candidates` value; (2) percentage of responses where the total matching candidates exceed the cap in which `CompletionList.isIncomplete` is set to `true`.
**Meter:**
1. Configure `completion.candidates` to a value N (e.g., 5) in `.flavor-grenade.toml`.
2. Create a test vault with at least N+10 documents whose names all share a common prefix.
3. Open a document and trigger completion at `[[` with an empty query (all candidates match).
4. Verify the returned `CompletionList.items` array length equals exactly N.
5. Verify `CompletionList.isIncomplete` is `true`.
6. Repeat with a query that matches exactly N-1 documents; verify item count equals N-1 and `isIncomplete` is `false`.
7. Compute scale (1): (responses with item count ≤ N / total responses tested) × 100.
8. Compute scale (2): (responses with isIncomplete=true when total matches > N / total such responses) × 100.
**Fail:** Any response with item count exceeding N, or any response where total matches > N but `isIncomplete` is `false`.
**Goal:** 100% compliance on both sub-scales.
**Stakeholders:** LSP client developers, editor plugin authors, vault authors in large vaults.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[configuration#Config.Validation.Candidates]], [[design/api-layer#completion-handler]], LSP specification §3.16 `CompletionList`.

---

**Tag:** Completion.Trigger.Coverage
**Gist:** Each of the three LSP trigger characters (`[`, `#`, `(`) must return a non-empty candidate list when the cursor is at an appropriate syntactic context.
**Ambition:** Trigger characters are the entry points to the server's completion surface. If a trigger character fires but returns an empty list, the author receives no feedback and must rely on manual typing — the core value proposition of the LSP is lost. Complete trigger-character coverage ensures that every authoring affordance Obsidian provides has a corresponding LSP completion path.
**Scale:** Percentage of trigger-character invocations at appropriate positions in a vault of at least 5 documents and at least 5 tags that return a non-empty `CompletionList.items` array. Appropriate positions are: `[` at the start of a wiki-link context; `#` at the start of a tag context; `(` at the start of a standard Markdown link URL context.
**Meter:**
1. Create a test vault with at least 5 documents and at least 5 distinct tags.
2. Author a document with positioned cursors at:
   - `[[` — wiki-link trigger (trigger char `[`)
   - `#` — tag trigger (trigger char `#`)
   - `[text](` — inline-link URL trigger (trigger char `(`)
3. For each position, send `textDocument/completion` with `triggerKind: TriggerCharacter` and the appropriate `triggerCharacter`.
4. Verify each response has `items.length >= 1`.
5. Compute: (positions returning non-empty lists / total positions tested) × 100.
**Fail:** Any trigger-character invocation at an appropriate position returning an empty list when matching candidates exist.
**Goal:** 100% of appropriate trigger positions return non-empty candidate lists.
**Stakeholders:** Editor users, LSP client integrators, vault authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#completion-handler]], [[ofm-spec/wiki-links]], [[ofm-spec/properties#inline-tags]], LSP specification §3.16 trigger characters.

---

**Tag:** Completion.CalloutType.Coverage
**Gist:** When the cursor is at the `> [!` position in a block-quote line, the completion response must include all 23 standard Obsidian callout type names as candidates.
**Ambition:** Obsidian defines 23 built-in callout types (`note`, `abstract`, `info`, `tip`, `success`, `question`, `warning`, `failure`, `danger`, `bug`, `example`, `quote`, and their documented aliases). Authors must currently type callout names from memory or consult the Obsidian documentation. Completion at the `> [!` trigger position makes callout authoring discoverable, consistent with Obsidian's own UI affordances, and prevents misspelled callout types that render as unstyled blockquotes.
**Scale:** Percentage of the 23 standard Obsidian callout type names (as documented in [[ofm-spec/callouts]]) that appear as completion candidates when `textDocument/completion` is triggered at a `> [!` cursor position.
**Meter:**
1. Open any document with the cursor placed at the end of `> [!` on an otherwise empty blockquote line.
2. Issue `textDocument/completion`.
3. Collect all `CompletionItem.label` or `insertText` values from the response.
4. Check each of the 23 standard callout types against the collected labels (case-insensitive).
5. Compute: (standard callout types present in response / 23) × 100.
**Fail:** Any of the 23 standard callout types absent from the completion response at the `> [!` position.
**Goal:** 100% (all 23 types present).
**Stakeholders:** Note authors, documentation writers, anyone using Obsidian callouts.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/callouts#standard-types]], [[design/api-layer#completion-handler]], Obsidian Help: Callouts.

---

**Tag:** Completion.WikiStyle.Binding
**Gist:** Completion items for wiki-links must use the link text format prescribed by the active `wiki.style` configuration, and must not mix formats from different style modes in the same response.
**Ambition:** This is the completion-specific formulation of [[wiki-link-resolution#Link.Wiki.StyleBinding]]. Completion is the primary mechanism by which the server writes new link text into the author's document. If completion produces link text in the wrong style, every accepted completion silently corrupts the vault's link-style consistency, leading to a mixed-format vault that is harder to batch-migrate and easier to break with rename refactoring. Binding completion to the active style at the point of insertion prevents the accumulation of format debt.
**Scale:** Percentage of `insertText` values in a wiki-link completion response that conform to the active `wiki.style` setting. Measured across at least 3 style configurations. See [[wiki-link-resolution#Link.Wiki.StyleBinding]] for the style conformance definition.
**Meter:**
1. Configure `wiki.style` to `file-stem`. Trigger completion at `[[` in a vault with documents whose titles differ from file stems. Verify all `insertText` values use the file stem (no title, no path prefix).
2. Configure `wiki.style` to `title-slug`. Repeat. Verify all `insertText` values use the slugified document title.
3. Configure `wiki.style` to `file-path-stem`. Repeat. Verify all `insertText` values use the vault-relative file path without extension.
4. In each run, verify zero items in the response use a format belonging to a different style mode.
5. Compute: (style-conforming items / total items) × 100 across all runs.
**Fail:** Any completion item whose `insertText` does not conform to the active `wiki.style`, or any response mixing formats from different style modes.
**Goal:** 100% of completion items conform to the active style.
**Stakeholders:** Vault authors, teams enforcing link-style consistency, migration tooling users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[wiki-link-resolution#Link.Wiki.StyleBinding]], [[configuration]], [[design/api-layer#completion-handler]], [[design/domain-layer#wiki-style]].
