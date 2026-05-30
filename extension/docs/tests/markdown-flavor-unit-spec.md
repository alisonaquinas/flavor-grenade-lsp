---
title: Extension Markdown Flavor Unit Test Specification
tags: [extension/docs, tests, unit, markdown-flavor]
aliases: [Extension Markdown Flavor Unit Tests]
---

# Extension Markdown Flavor Unit Test Specification

Target file: `extension/src/markdown-flavor.test.ts`.

Effective flavor resolver cases follow the root
[Markdown flavor auto-detection algorithm](../../../docs/design/markdown-flavor-auto-detection.md).
They must keep configuration resolution separate from Auto Detect.

## Core Unit Cases

| Spec ID | Unit target | Requirement tags | Assertions |
|---|---|---|---|
| EXT-MF-U-001 | Flavor constants | `Extension.MarkdownFlavor.RequiredCoverage` | Exported flavor list includes `auto` and every required explicit flavor id in stable display order. |
| EXT-MF-U-002 | Selector labels | `Extension.MarkdownFlavor.Selector` | Quick-pick labels and status labels match requirements for all flavors. |
| EXT-MF-U-003 | Language preservation | `Extension.MarkdownLanguage.PreserveDefault` | Refresh logic never calls `setTextDocumentLanguage` for flavor selection. |
| EXT-MF-U-004 | Effective flavor and auto-detection resolver | `Extension.MarkdownFlavor.AutoDetection` | The root truth table is covered in two layers: configuration resolution handles `.fgignore`, concrete `.fgattributes` flavor values, `.fgattributes flavor=auto`, `!flavor`, absent `.fgignore`/`.fgattributes`, and invalid values; Auto Detect itself handles `.obsidian/`, strong syntax evidence, ambiguity, and CommonMark fallback. |
| EXT-MF-U-005 | Membership fallback | `Extension.MarkdownFlavor.AutoDetection` | Server membership response can resolve Obsidian/Flavor Grenade vault state after startup. |
| EXT-MF-U-006 | Selected-file override target | `Extension.MarkdownFlavor.OverridePersistence` | Folder-backed active document writes a file-specific `.fgattributes` rule in the active file's directory after the second scope prompt chooses `Selected file`. |
| EXT-MF-U-007 | Directory override target | `Extension.MarkdownFlavor.OverridePersistence` | The second scope prompt choice `All files in this directory` writes a directory-local Markdown pattern such as `/*.md flavor=<id>` to `.fgattributes`. |
| EXT-MF-U-008 | Auto clearing | `Extension.MarkdownFlavor.OverridePersistence` | Selecting `Auto Detect` clears or resets the matching `.fgattributes` `flavor` at the chosen selected-file or directory scope. |
| EXT-MF-U-009 | Server propagation | `Extension.MarkdownFlavor.ServerPropagation`, `Security.Input.FlavorPropagationPayload` | Changing flavor sends configuration or metadata refresh with the exact effective flavor id for every required explicit flavor, including standalone `original`; oversized maps, unsafe resource keys, dangerous object keys, stale resources, and restricted/virtual/untrusted contexts do not propagate. |
| EXT-MF-U-010 | Refresh triggers | `Extension.MarkdownFlavor.Refresh` | Server ready, index rebuild, workspace folder changes, visible editor changes, file-open events, selector changes, and `.fgignore`/`.fgattributes` appear/disappear/change events recompute effective flavor or inactive state. |
| EXT-MF-U-011 | Manual language safety | `Extension.MarkdownFlavor.ManualLanguageSafety` | Documents with `plaintext`, `mdx`, or any non-`markdown` language id are ignored by flavor application and do not receive server propagation/reanalysis until their language id returns to `markdown`. |
| EXT-MF-U-012 | MDX distinction | `Extension.MarkdownFlavor.ManualLanguageSafety`, `Extension.MarkdownFlavor.RequiredCoverage` | `mdx` can be selected as a flavor only when the document language id remains `markdown`; a VS Code `mdx` language document is not modified. |
| EXT-MF-U-013 | Flavor contract parity | `Extension.MarkdownFlavor.RequiredCoverage` | Extension constants, `.fgattributes` accepted enum, quick-pick ids, and server accepted ids are identical. |
| EXT-MF-U-014 | Document selector and activation manifest guard | `Extension.Activation.MarkerEvents`, `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Refresh` | E15 asserts file-backed `markdown` `LanguageClient` selection and selector command activation. E16 owns retired contribution activation cleanup for `onLanguage:ofmarkdown`. |
| EXT-MF-U-015 | Smoketest fixture inventory | `Extension.MarkdownFlavor.AutoDetection` | `extension/test-fixtures/workspaces/smoketest/` contains `.fgattributes` fixtures for every explicit flavor plus `inference/` fixtures with no `.fgignore` or `.fgattributes` for strong syntax inference and ambiguity fallback. |
| EXT-MF-U-016 | Fixture boundary guard | `Extension.MarkdownFlavor.AutoDetection`, `Security.Vault.ProjectConfigConfinement` | The smoketest root README is a negative control: it must not detect as OFM or inherit flavor attributes because of child `.fgignore`/`.fgattributes` files or repository ancestor config outside the active workspace boundary. |
| EXT-MF-U-017 | Structured profile constants and schema | `Extension.MarkdownStructuredProfiles.Configuration`, `FlavorLSP.StructuredProfiles.Flags` | The base flavor selector remains unchanged; `.fgattributes structured_profiles` accepts `auto`, `none`, and unique compatible lists of `keep-a-changelog`, `common-changelog`, and `madr`; invalid ids, duplicates, and incompatible changelog pairs are rejected. |
| EXT-MF-U-018 | Structured profile auto-detection | `Extension.MarkdownStructuredProfiles.Configuration`, `Extension.MarkdownFlavor.AutoDetection` | `CHANGELOG.md` and `docs/decisions/NNNN-title.md` fixture evidence can infer Keep a Changelog, Common Changelog, and MADR profile flags independently of the base effective flavor; weak evidence returns no profile flag. |
| EXT-MF-U-019 | Structured profile fixture inventory | `Extension.MarkdownStructuredProfiles.Configuration`, `FlavorLSP.StructuredProfiles.Flags`, `Extension.MarkdownFlavor.AutoDetection` | `extension/test-fixtures/workspaces/smoketest/` contains Keep a Changelog, Common Changelog, and MADR examples under every `.fgattributes`-configured flavor workspace and every config-absent inference workspace, using the expected `structured/` paths and preserving each workspace's base flavor evidence. |
| EXT-MF-U-020 | Ignore inactive state | `Extension.MarkdownFlavor.IgnoreVisibility` | `.fgignore` matched files report inactive state, receive no selector writes or server feature refreshes, and return to Auto Detect after negation/removal. |

## Contribution Unit Cases

Target files: `extension/test/contributions/*.test.ts`.

| Spec ID | Target | Assertions |
|---|---|---|
| EXT-MF-C-001 | Snippets | Flavor-specific snippets are gated by context keys or commands, not by an `ofmarkdown` language contribution. |
| EXT-MF-C-002 | Keybindings | Flavor-specific keybindings require explicit flavor/context preconditions and do not affect generic Markdown unintentionally. |
| EXT-MF-C-003 | Language configuration | Any language configuration changes apply to built-in Markdown safely or are removed; no custom Markdown language id is required. |
| EXT-MF-C-004 | Isolation | Generic Markdown with `auto` resolving to CommonMark does not receive Obsidian-only affordances. |
| EXT-MF-C-005 | Commands | Flavor-specific commands require selector/context preconditions and do not become active solely because a document has VS Code language id `markdown`. |
| EXT-MF-C-006 | Optional theme/example contributions | Optional theme examples or visual proof contributions are flavor-scoped or explicitly marked not applicable; no custom `ofmarkdown` language contribution is introduced. |
