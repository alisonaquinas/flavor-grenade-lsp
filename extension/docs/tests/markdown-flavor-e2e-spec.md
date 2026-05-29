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
| EXT-MF-E-003 | Flavor Grenade config fixture | Select each required explicit flavor from the selector, then choose `Selected file` and `All files in this directory` in separate runs. | `.fgattributes` receives the correct file-specific or `/*.md` rule and server refresh is observed. |
| EXT-MF-E-004 | Standalone file fixture | Open a file outside any workspace, select `Original Markdown`, then choose `Selected file`. | `.fgattributes` is written beside the standalone file. |
| EXT-MF-E-005 | Manual language fixture | Change active `.md` document to `plaintext` or `mdx`. | Flavor selector becomes inactive or non-applying; language id remains user-selected. |
| EXT-MF-E-006 | Auto reset fixture | Start with `.fgattributes` `flavor=gfm`, then select `Auto Detect` for the same scope. | Attribute is cleared/reset and effective flavor recomputes from context. |
| EXT-MF-E-007 | Directory scope fixture | Open a folder-backed Markdown file, select `Pandoc Markdown`, choose `All files in this directory`, then reload. | `.fgattributes` contains `/*.md flavor=pandoc`, persists across reload, and `Auto Detect` clears that same scope. |
| EXT-MF-E-008 | Invalid and precedence fixture | Open a workspace with invalid `.fgattributes` value, `.obsidian/`, and then an explicit selector override. | Invalid values are ignored; explicit selector-written attributes outrank marker evidence; selector display and server refresh show the final effective flavor. |
| EXT-MF-E-009 | Selector availability fixture | Open file-backed workspace-folder, workspace-only, Obsidian vault, generic Markdown, standalone, untitled, virtual, and non-`markdown` documents. | Selector is available for supported file-backed `markdown` contexts and inactive/hidden for unsupported, virtual, untitled, or non-`markdown` contexts. |
| EXT-MF-E-010 | Host propagation fixture | Select representative `obsidian`, `gfm`, `mdx`, and `r-markdown` flavors while host logs record server notifications. | Effective flavor propagation is observed end-to-end without changing VS Code `languageId` away from `markdown`. |
| EXT-MF-E-011 | Smoketest inference fixture | Open config-absent inference samples for MDX, R Markdown, Stack Overflow, Reddit, GLFM, Pandoc, MultiMarkdown, kramdown, Markdown Extra, and ambiguous GFM-like syntax. | Selector/status shows Auto Detect with the inferred strong flavor for unambiguous samples; ambiguous GFM-like syntax shows Auto Detect (CommonMark). |
| EXT-MF-E-012 | Smoketest boundary fixture | Open the root `smoketest/README.md` in an isolated copy and from a development checkout with repository ancestor config files. | Root README remains `markdown`, does not display OFM/Obsidian/attributed flavor, and does not start vault behavior because of child `.fgignore`/`.fgattributes` files or ancestor markers outside the workspace boundary. |
| EXT-MF-E-014 | Ignored file fixture | Open a Markdown file matched by `.fgignore`, then remove or negate the ignore rule. | Ignored file shows inactive state with no diagnostics/completions/selector writes, then returns to Auto Detect after refresh. |
| EXT-MF-E-013 | Structured profile smoketest fixture | Open Keep a Changelog, Common Changelog, and MADR examples from configured and config-absent inference smoke workspaces. | Status/propagation evidence shows the same base flavor result as the containing workspace plus the expected structured profile flag; structured profile ids never appear in the Markdown flavor selector, and opening one changelog variant does not activate the other. |

## Exit Criteria

- E2E tests prove visible behavior, not only internal state.
- E2E tests enumerate every required selector id and label and select each
  explicit flavor while `languageId` remains `markdown`.
- Selected-file, directory, and standalone `.fgattributes` persistence pass.
- Same-scope Auto Detect clearing/reset passes for `.fgattributes`.
- Invalid `.fgattributes` fallback and precedence are proven in at least one real host
  fixture.
- Syntax/context inference and ambiguous fallback are proven in real host
  fixtures without config files.
- Fixture boundary behavior is proven so the root smoketest README remains a
  negative control.
- Structured profile behavior is proven for both changelog variants and MADR
  across configured and config-absent inference smoke workspaces.
- Selector availability is explicit for supported file-backed Markdown contexts
  and unsupported/virtual/non-Markdown contexts.
- No E2E flow changes a `.md` document to a custom Markdown language id.
