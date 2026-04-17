---
title: Configuring Behaviour User Requirements
tags:
  - requirements/user/configuring-behaviour
aliases:
  - Configuring Behaviour
---

# Configuring Behaviour User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors tune the server's behaviour to match their workflow. Implementation details are in [[configuration]].

---

**Tag:** User.Config.CustomiseLinkStyle
**Goal:** Configure how links are written (stem, title, path)
**Need:** A vault author wants to control how the server writes link text when inserting or updating links — for example, using only the file's stem, using the full title from frontmatter, or using the vault-relative file path. They expect their choice to apply consistently across all features without needing per-feature configuration, and to take effect immediately without restarting the editor.
**Maps to:** Config.Precedence.Layering, Link.Wiki.StyleBinding

---

**Tag:** User.Config.TuneCompletions
**Goal:** Control how many completion candidates are offered
**Need:** A vault author with a large vault may find the default number of completion suggestions either too many (overwhelming) or too few (requiring too much typing to filter). They want to set a limit on how many candidates the editor offers at once and expect that limit to be respected consistently across all completion contexts — links, tags, block refs, and callout types.
**Maps to:** Config.Validation.Candidates, Completion.Candidates.Cap
