---
title: Embedding Content User Requirements
tags:
  - requirements/user/embedding-content
---

# Embedding Content User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors embed other files — notes, images, and other assets — and the feedback they receive when embeds are broken. Implementation details are in [[embed-resolution]].

---

**Tag:** User.Embed.DetectBrokenEmbed
**Goal:** Be told immediately when an embedded file is missing
**Need:** A vault author who has embedded another file using `![[embed]]` syntax wants to be told immediately if the embedded file no longer exists or was moved. They expect a visible warning in the editor so they can fix the broken embed before the rendered version of their vault shows a missing-file placeholder.
**Maps to:** Embed.Resolution.MarkdownTarget, Embed.Resolution.ImageTarget, Embed.HeadingEmbed.Resolution, Embed.BlockEmbed.Resolution

---

**Tag:** User.Embed.PreviewLinkedContent
**Goal:** Hover over an embed to preview the target
**Need:** A vault author hovering over an `![[embed]]` link wants to see a quick preview of the embedded content without switching to the target file. They expect to see enough context — the first lines of a note, or the image itself — to confirm they are embedding the right resource without interrupting their writing flow.
**Maps to:** Embed.Resolution.MarkdownTarget, Embed.HeadingEmbed.Resolution
