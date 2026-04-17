---
title: Seeing Broken Links User Requirements
tags:
  - requirements/user/seeing-broken-links
aliases:
  - Seeing Broken Links
---

# Seeing Broken Links User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors learn about broken, ambiguous, or missing references in their vault. Implementation details are in [[diagnostics]], [[wiki-link-resolution]], and [[embed-resolution]].

---

**Tag:** User.Diagnose.SpotBrokenLinks
**Gist:** Vault author sees a clearly marked error diagnostic for every `[[wiki-link]]` that points to a note not present in the vault.
**Ambition:** Broken-link diagnostics are always accurate, never silent, and never produce false alarms in single-file mode — authors can trust that any unmarked link is valid.
**Scale:** Percentage of `[[wiki-link]]` references to non-existent notes that produce an FG001 diagnostic within 500 ms of the document being opened or modified, and percentage of links in single-file mode that produce zero cross-file diagnostics.
**Meter:** Integration test suite: `bun test tests/integration/diagnostics/` — creates documents with a mix of valid and broken links, measures time-to-diagnostic for broken links, and verifies that single-file mode suppresses all cross-file errors.
**Fail:** Any broken link that does not produce a diagnostic within 500 ms, or any cross-file diagnostic produced in single-file mode.
**Goal:** See immediately which links point to non-existent notes
**Need:** A vault author wants to know immediately when any of their `[[wiki-links]]` point to notes that do not exist in the vault. They expect broken links to appear as clearly marked errors in the editor, updated promptly after each change, so they can fix them before the vault becomes internally inconsistent. When working on a single file without a vault, they expect cross-file errors to be suppressed so as not to produce false alarms.
**Maps to:** Diagnostic.Severity.WikiLink, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency, Diagnostic.SingleFile.Suppression

---

**Tag:** User.Diagnose.SpotAmbiguousLinks
**Gist:** Vault author receives an FG002 warning diagnostic for every link whose short name matches more than one note in the vault.
**Ambition:** Ambiguity warnings are precise and actionable — every multi-match link is flagged and the diagnostic's `relatedInformation` identifies each candidate, giving the author enough context to resolve the ambiguity immediately.
**Scale:** Percentage of `[[short-name]]` links whose target resolves to two or more vault documents that produce an FG002 diagnostic with populated `relatedInformation` entries, within 500 ms of the document being opened or modified.
**Meter:** Integration test suite: `bun test tests/integration/diagnostics/` — creates a vault with multiple notes sharing a short name, opens a document with links to that name, and checks that FG002 diagnostics appear with the correct number of `relatedInformation` entries.
**Fail:** Any ambiguous link that does not produce an FG002 diagnostic, or any FG002 diagnostic missing `relatedInformation` entries identifying each candidate.
**Goal:** Be warned when a link could resolve to more than one note
**Need:** A vault author with notes spread across multiple folders sometimes uses short link names that match more than one file. They want to be warned when a link is ambiguous — meaning the vault contains multiple notes the link could refer to — so they can make the link more specific and avoid linking to the wrong note unintentionally.
**Maps to:** Diagnostic.Ambiguous.RelatedInfo

---

**Tag:** User.Diagnose.SpotBrokenEmbeds
**Gist:** Vault author sees a distinct embed-broken diagnostic for every `![[embed]]` whose target cannot be found in the vault.
**Ambition:** Broken-embed diagnostics use a code distinct from broken-link diagnostics so authors can filter, suppress, or prioritise the two issue types independently, with no false positives on valid embeds.
**Scale:** Percentage of `![[embed]]` references to missing files that produce a diagnostic with the embed-broken code (distinct from FG001) within 500 ms of the document being opened or modified.
**Meter:** Integration test suite: `bun test tests/integration/diagnostics/` — creates embed references to non-existent files, checks that a diagnostic with the embed-specific code appears within the latency threshold, and verifies that no embed diagnostic uses the wiki-link broken code FG001.
**Fail:** Any broken embed that does not produce a diagnostic within 500 ms, or any broken-embed diagnostic whose code is identical to the broken-link code FG001.
**Goal:** Be warned when an embedded file is missing
**Need:** A vault author who has embedded files using `![[embed]]` syntax wants to be warned when an embedded file cannot be found in the vault. They expect a visible warning distinct from the broken-link error so they can identify and fix broken embeds separately from broken links, reflecting that the two issues have different causes and fixes.
**Maps to:** Diagnostic.Severity.Embed, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency
