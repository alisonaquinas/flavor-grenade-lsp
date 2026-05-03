---
title: VS Code Language Mode User Requirements
tags:
  - requirements/user/vscode-language-mode
aliases:
  - VS Code Language Mode
  - OFMarkdown User Requirements
---

# VS Code Language Mode User Requirements

> [!NOTE] Scope
> These user requirements describe what VS Code users need from the OFMarkdown language mode. Functional requirements are in [[requirements/ofmarkdown-language-mode]].

---

**Tag:** User.Extension.RecognizeOFMarkdown
**Gist:** A vault author opens an Obsidian note in VS Code and sees it automatically recognized as OFMarkdown.
**Ambition:** Recognition happens without manual language picker changes, while still leaving ordinary Markdown files alone.
**Scale:** Percentage of opened vault notes that settle into `ofmarkdown` mode after Flavor Grenade detection.
**Meter:** Extension integration tests open Markdown files in `.obsidian/` and `.flavor-grenade.toml` workspaces, wait for detection, and read the active document language id.
**Fail:** Any qualifying vault note requires a manual language picker change.
**Goal:** Automatic OFMarkdown recognition for all qualifying vault notes.
**Need:** A vault author wants VS Code to distinguish Obsidian notes from generic Markdown so they can use OFMarkdown-specific settings, commands, and future snippets.
**Maps to:** Extension.LanguageMode.Contribution, Extension.LanguageMode.DynamicAssignment

---

**Tag:** User.Extension.PreserveMarkdown
**Gist:** A user opens generic Markdown outside a Flavor Grenade vault and it remains normal Markdown.
**Ambition:** Flavor Grenade adds OFM support without taking ownership of unrelated Markdown documents.
**Scale:** Percentage of non-vault Markdown files that remain in VS Code's built-in `markdown` mode after extension activation.
**Meter:** Extension integration tests open Markdown files in a workspace with no vault marker and assert the language id remains `markdown`.
**Fail:** Any non-vault Markdown file is promoted to `ofmarkdown`.
**Goal:** No non-vault Markdown file is promoted.
**Need:** A user who edits READMEs, changelogs, and generic Markdown in the same VS Code installation expects those files to keep their normal Markdown behavior.
**Maps to:** Extension.LanguageMode.NonVaultIsolation

---

**Tag:** User.Extension.PreserveManualMode
**Gist:** A user manually chooses another VS Code language mode and Flavor Grenade does not override it.
**Ambition:** Explicit user choices outrank automatic detection.
**Scale:** Percentage of documents with non-`markdown` language ids that remain unchanged after detection refresh.
**Meter:** Extension tests set a vault Markdown file to `plaintext` or another custom language and verify Flavor Grenade does not reassign it.
**Fail:** Any manual non-Markdown language selection is overwritten.
**Goal:** 100% of manual non-Markdown language selections are preserved.
**Need:** Advanced users sometimes use MDX, plaintext, or other language modes for `.md` files and expect extensions not to fight the language picker.
**Maps to:** Extension.LanguageMode.UserOverrideSafety

---

**Tag:** User.Extension.StableModeSwitch
**Gist:** Automatic OFMarkdown recognition is stable and does not cause flicker, repeated restarts, or looping reopen events.
**Ambition:** The user should experience one clean mode switch at most, then a stable editor session.
**Scale:** Number of language assignment calls and client restarts caused by one qualifying document open.
**Meter:** Extension tests instrument language assignment and LanguageClient lifecycle while opening qualifying vault documents.
**Fail:** Any repeated assignment loop or restart loop caused by language promotion.
**Goal:** One assignment per qualifying document at most; zero restart loops.
**Need:** A vault author wants automatic recognition to feel invisible, not like the editor is repeatedly reopening the file.
**Maps to:** Extension.LanguageMode.LoopSafety

---

**Tag:** User.Extension.PreserveMarkdownEditing
**Gist:** A document in OFMarkdown mode still looks and edits like Markdown, with OFM intelligence layered on top.
**Ambition:** The language mode distinction should enable better targeting without regressing everyday Markdown editing.
**Scale:** Percentage of baseline Markdown editing affordances preserved after promotion.
**Meter:** Manual and extension smoke tests verify highlighting, brackets, comments, semantic tokens, and LSP features after promotion.
**Fail:** Promotion removes baseline Markdown grammar behavior or disables Flavor Grenade LSP features.
**Goal:** All baseline Markdown smoke affordances preserved.
**Need:** A vault author wants a distinct OFMarkdown mode without losing familiar Markdown highlighting and editing behavior.
**Maps to:** Extension.LanguageMode.MarkdownParity
