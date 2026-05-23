---
title: Extension Markdown Flavor E2E Test Specification
tags: [extension/docs, tests, e2e, markdown-flavor]
aliases: [Extension Markdown Flavor E2E Tests]
---

# Extension Markdown Flavor E2E Test Specification

Target file: `extension/src/test/suite/markdown-flavor.test.js`.

E2E fixtures validate user-visible results of the root
[Markdown flavor auto-detection algorithm](../../../docs/design/markdown-flavor-auto-detection.md).

## Test Cases

| Spec ID | Fixture | Steps | Assertions |
|---|---|---|---|
| EXT-MF-E-001 | `.obsidian/` vault fixture | Open `notes/welcome.md`. | Active document language id is `markdown`; selector shows `Auto Detect (Obsidian)`. |
| EXT-MF-E-002 | Generic Markdown fixture | Open `README.md`. | Active document language id is `markdown`; selector shows `Auto Detect (CommonMark)`; no vault indexing work starts. |
| EXT-MF-E-003 | Flavor Grenade config fixture | Select each required explicit flavor from the selector. | Setting is written to workspace scope and server refresh is observed. |
| EXT-MF-E-004 | Standalone file fixture | Open a file outside any workspace and select `Original Markdown`. | Setting is written to user scope. |
| EXT-MF-E-005 | Manual language fixture | Change active `.md` document to `plaintext` or `mdx`. | Flavor selector becomes inactive or non-applying; language id remains user-selected. |
| EXT-MF-E-006 | Auto reset fixture | Start with workspace override `gfm`, then select `Auto Detect`. | Override is cleared/reset and effective flavor recomputes from context. |
| EXT-MF-E-007 | Workspace fallback fixture | Open a folder-backed Markdown file where workspace-folder settings are unavailable or absent, select `Pandoc Markdown`, then reload. | Setting is written to workspace fallback scope, persists across reload, and `Auto Detect` clears that same scope. |
| EXT-MF-E-008 | Invalid and precedence fixture | Open a workspace with invalid setting value, valid `.flavor-grenade.toml`, `.obsidian/`, and then an explicit selector override. | Invalid values are ignored; explicit selector outranks workspace/project/marker evidence; selector display and server refresh show the final effective flavor. |
| EXT-MF-E-009 | Selector availability fixture | Open file-backed workspace-folder, workspace-only, Obsidian vault, generic Markdown, standalone, untitled, virtual, and non-`markdown` documents. | Selector is available for supported file-backed `markdown` contexts and inactive/hidden for unsupported, virtual, untitled, or non-`markdown` contexts. |
| EXT-MF-E-010 | Host propagation fixture | Select representative `obsidian`, `gfm`, `mdx`, and `r-markdown` flavors while host logs record server notifications. | Effective flavor propagation is observed end-to-end without changing VS Code `languageId` away from `markdown`. |
| EXT-MF-E-011 | Smoketest inference fixture | Open TOML-absent inference samples for MDX, R Markdown, Stack Overflow, Reddit, GLFM, Pandoc, MultiMarkdown, kramdown, Markdown Extra, and ambiguous GFM-like syntax. | Selector/status shows Auto Detect with the inferred strong flavor for unambiguous samples; ambiguous GFM-like syntax shows Auto Detect (CommonMark). |
| EXT-MF-E-012 | Smoketest boundary fixture | Open the root `smoketest/README.md` in an isolated copy and from a development checkout with repository ancestor TOML. | Root README remains `markdown`, does not display OFM/Obsidian/project flavor, and does not start vault behavior because of child fixture TOML files or ancestor markers outside the workspace boundary. |

## Exit Criteria

- E2E tests prove visible behavior, not only internal state.
- E2E tests enumerate every required selector id and label and select each
  explicit flavor while `languageId` remains `markdown`.
- Workspace and standalone persistence both pass.
- Workspace-folder, workspace fallback, standalone user, and same-scope Auto
  Detect clearing all pass.
- Invalid setting fallback and precedence are proven in at least one real host
  fixture.
- Syntax/context inference and ambiguous fallback are proven in real host
  fixtures without TOML.
- Fixture boundary behavior is proven so the root smoketest README remains a
  negative control.
- Selector availability is explicit for supported file-backed Markdown contexts
  and unsupported/virtual/non-Markdown contexts.
- No E2E flow changes a `.md` document to a custom Markdown language id.
