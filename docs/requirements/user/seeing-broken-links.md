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
**Goal:** See immediately which links point to non-existent notes
**Need:** A vault author wants to know immediately when any of their `[[wiki-links]]` point to notes that do not exist in the vault. They expect broken links to appear as clearly marked errors in the editor, updated promptly after each change, so they can fix them before the vault becomes internally inconsistent. When working on a single file without a vault, they expect cross-file errors to be suppressed so as not to produce false alarms.
**Maps to:** Diagnostic.Severity.WikiLink, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency, Diagnostic.SingleFile.Suppression

---

**Tag:** User.Diagnose.SpotAmbiguousLinks
**Goal:** Be warned when a link could resolve to more than one note
**Need:** A vault author with notes spread across multiple folders sometimes uses short link names that match more than one file. They want to be warned when a link is ambiguous — meaning the vault contains multiple notes the link could refer to — so they can make the link more specific and avoid linking to the wrong note unintentionally.
**Maps to:** Diagnostic.Ambiguous.RelatedInfo

---

**Tag:** User.Diagnose.SpotBrokenEmbeds
**Goal:** Be warned when an embedded file is missing
**Need:** A vault author who has embedded files using `![[embed]]` syntax wants to be warned when an embedded file cannot be found in the vault. They expect a visible warning distinct from the broken-link error so they can identify and fix broken embeds separately from broken links, reflecting that the two issues have different causes and fixes.
**Maps to:** Diagnostic.Severity.Embed, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency
