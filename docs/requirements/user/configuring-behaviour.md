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
**Gist:** Vault author sets a link-style preference once and the server applies it consistently across every feature without requiring an editor restart.
**Ambition:** Configuration takes effect immediately on save, applies uniformly to completion, rename, and code-action outputs, and never requires per-feature overrides.
**Scale:** Percentage of link-producing operations that conform to the configured link style immediately after the configuration file is saved, measured across completion, rename, and code-action features.
**Meter:** Integration test suite: `bun test tests/integration/configuration/` — writes each of the three `wiki.style` values to `.flavor-grenade.toml`, triggers operations without restarting the server, and validates that all produced link texts match the newly set style.
**Fail:** Any link-producing operation that does not reflect the current configuration, or that requires a server restart before the new setting is honoured.
**Goal:** Configure how links are written (stem, title, path)
**Need:** A vault author wants to control how the server writes link text when inserting or updating links — for example, using only the file's stem, using the full title from frontmatter, or using the vault-relative file path. They expect their choice to apply consistently across all features without needing per-feature configuration, and to take effect immediately without restarting the editor.
**Maps to:** Config.Precedence.Layering, Link.Wiki.StyleBinding

---

**Tag:** User.Config.TuneCompletions
**Gist:** Vault author sets a maximum candidate count and the server respects that limit across all completion contexts.
**Ambition:** The configured limit is honoured exactly in every completion context — wiki-links, tags, block refs, and callout types — so authors with large vaults are never overwhelmed and authors with small vaults are never under-served.
**Scale:** Percentage of completion responses in a test session whose `CompletionList.items` length does not exceed the configured `completions.maxCandidates` value, across all completion trigger types.
**Meter:** Integration test suite: `bun test tests/integration/configuration/` — sets `completions.maxCandidates` to a value smaller than the number of available candidates, triggers completion for each context type (wiki-link, tag, block ref, callout), and asserts that no response returns more items than the configured limit.
**Fail:** Any completion response whose item count exceeds the configured maximum, or any context type that ignores the limit.
**Goal:** Control how many completion candidates are offered
**Need:** A vault author with a large vault may find the default number of completion suggestions either too many (overwhelming) or too few (requiring too much typing to filter). They want to set a limit on how many candidates the editor offers at once and expect that limit to be respected consistently across all completion contexts — links, tags, block refs, and callout types.
**Maps to:** Config.Validation.Candidates, Completion.Candidates.Cap
