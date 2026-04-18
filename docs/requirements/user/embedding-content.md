---
title: Embedding Content User Requirements
tags:
  - requirements/user/embedding-content
aliases:
  - Embedding Content
---

# Embedding Content User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors embed other files — notes, images, and other assets — and the feedback they receive when embeds are broken. Implementation details are in [[requirements/embed-resolution]].

---

**Tag:** User.Embed.DetectBrokenEmbed
**Gist:** Vault author sees a diagnostic warning immediately when an `![[embed]]` target does not exist or has been moved.
**Ambition:** Every broken embed is surfaced as a visible editor diagnostic within the debounce window after each change, so no broken embed silently persists in the vault.
**Scale:** Percentage of `![[embed]]` references to non-existent or moved files that produce a visible diagnostic within 500 ms of the document being saved or opened.
**Meter:** Integration test suite: `bun test tests/integration/embedding/` — creates embed references to existing files, then deletes or moves the targets, and asserts that a diagnostic with the embed-broken code appears for each affected reference within the latency threshold.
**Fail:** Any broken embed that does not produce a diagnostic within 500 ms, or any false-positive diagnostic on a valid embed.
**Goal:** Be told immediately when an embedded file is missing
**Need:** A vault author who has embedded another file using `![[embed]]` syntax wants to be told immediately if the embedded file no longer exists or was moved. They expect a visible warning in the editor so they can fix the broken embed before the rendered version of their vault shows a missing-file placeholder.
**Maps to:** Embed.Resolution.MarkdownTarget, Embed.Resolution.ImageTarget, Embed.HeadingEmbed.Resolution, Embed.BlockEmbed.Resolution

---

**Tag:** User.Embed.PreviewLinkedContent
**Gist:** Vault author sees a hover preview of the embedded content without leaving the current document.
**Ambition:** Hover always returns enough context — the first meaningful lines of a note or the image itself — to confirm the correct resource is embedded, with no perceptible delay.
**Scale:** Percentage of `textDocument/hover` requests on `![[embed]]` tokens that return a non-empty preview within 300 ms.
**Meter:** Integration test suite: `bun test tests/integration/embedding/` — triggers `textDocument/hover` on embed tokens pointing to markdown notes and image files, and checks that the response `contents` field is non-empty and arrives within the latency threshold.
**Fail:** Any hover request on a valid embed that returns an empty response or exceeds 300 ms median latency.
**Goal:** Hover over an embed to preview the target
**Need:** A vault author hovering over an `![[embed]]` link wants to see a quick preview of the embedded content without switching to the target file. They expect to see enough context — the first lines of a note, or the image itself — to confirm they are embedding the right resource without interrupting their writing flow.
**Maps to:** Embed.Resolution.MarkdownTarget, Embed.HeadingEmbed.Resolution
