---
title: Navigation User Requirements
tags:
  - requirements/user/navigating-notes
aliases:
  - Navigating Notes
---

# Navigation User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors move between notes, discover connections, and understand the structure of their knowledge graph. Implementation details are in [[navigation]], [[wiki-link-resolution]], and [[block-references]].

---

**Tag:** User.Navigate.JumpToNote
**Gist:** Vault author navigates to the definition of a wiki-link target with one LSP action.
**Ambition:** Navigation always succeeds for every valid, indexed link type — wiki-links, aliased links, and heading links — with no perceptible latency, regardless of vault depth or link-writing style.
**Scale:** Percentage of valid `textDocument/definition` requests on wiki-link, alias-link, and heading-link tokens that return a correct `Location` within 200 ms.
**Meter:** Integration test suite: `bun test tests/integration/navigation/` — issues `textDocument/definition` on a representative set of each link type in a test vault and counts successful, correctly-targeted responses within the latency threshold.
**Fail:** < 95% success rate across all link types, or > 500 ms median latency.
**Goal:** Navigate to a linked note
**Need:** A vault author reading a document containing a `[[wiki-link]]` wants to open the linked note without manually navigating the file tree. They expect to place their cursor on any link — whether a wiki-link, an aliased link, or a heading link — and jump directly to the target note or section in a single action, regardless of how deeply nested the target is or how the link was written.
**Maps to:** Navigation.Definition.AllLinkTypes, Link.Wiki.StyleBinding, Link.Wiki.AliasResolution

---

**Tag:** User.Navigate.FindAllReferences
**Gist:** Vault author retrieves a complete list of every cross-vault reference to a note or heading in a single action.
**Ambition:** The references list is exhaustive — it misses no occurrence anywhere in the vault — and is returned fast enough that authors routinely use it before every rename rather than performing a manual text search.
**Scale:** Percentage of known vault-wide references to a given note or heading that appear in the `textDocument/references` response, measured across a test vault with at least 20 linking documents.
**Meter:** Integration test suite: `bun test tests/integration/navigation/` — creates a test vault with a known reference count, calls `textDocument/references`, and computes (returned references / known references) × 100.
**Fail:** < 100% of known references returned, or response latency > 1000 ms for a vault of ≤ 500 notes.
**Goal:** See everywhere a note or heading is referenced
**Need:** A vault author who has written or is considering renaming a note or heading wants to know every other note that links to it before making changes. They expect their editor to list all occurrences across the entire vault in a single action, so they can understand the impact of a change without performing a manual text search.
**Maps to:** Navigation.References.Completeness

---

**Tag:** User.Navigate.SeeReferenceCount
**Gist:** Vault author sees an inline reference count displayed above each heading, updated automatically as the vault changes.
**Ambition:** Code lens counts are always accurate and refresh within the debounce window after any vault change, giving authors a continuously reliable signal of section connectivity.
**Scale:** Percentage of heading code lens entries across a test vault whose displayed count matches the actual number of `[[note#heading]]`-style references at the time of measurement.
**Meter:** Integration test suite: `bun test tests/integration/navigation/` — queries `textDocument/codeLens` for a document, compares each lens count against the ground-truth reference count from the vault index, and checks that counts update within 500 ms after a new reference is added.
**Fail:** Any code lens count that differs from the actual reference count, or counts that do not refresh within 500 ms after a vault change.
**Goal:** See at a glance how many notes link to a heading
**Need:** A vault author wants to understand how connected a particular heading or section is within their vault without running an explicit search. They expect to see an inline count of references displayed directly above each heading in the editor, updated automatically as the vault changes, so they can identify high-value sections at a glance.
**Maps to:** Navigation.CodeLens.Count
