---
title: "Choose a Markdown Flavor | Flavor Grenade LSP"
description: "Use Auto Detect, .fgattributes, and the VS Code selector to choose the right base Markdown flavor."
h1: "Choose a Markdown Flavor"
summary: "Choose the base Markdown flavor that matches the file before adding vault or structured-profile behavior."
related: ["conceptMarkdownFlavorModel","advancedConfigurationModel","howToConfigureObsidianVaults"]
---

# Choose a Markdown Flavor

Choose the base Markdown flavor that matches the file before adding vault or structured-profile behavior.

## When to use it

Use this page when a Markdown file is being treated like the wrong kind of document, or when a generic repository contains several Markdown styles side by side. The goal is to make the effective flavor explicit enough that diagnostics, completions, hovers, symbols, folds, semantic tokens, and rename all read the same grammar.

Auto Detect is the normal starting point. It runs when `.fgattributes` is absent, requests `flavor=auto`, or clears flavor with `!flavor`. Auto Detect then checks Obsidian markers and strong syntax evidence. If those signals do not identify a stronger flavor, Flavor Grenade falls back to CommonMark instead of assuming Obsidian syntax for every root-level README.

## Steps

Start with Auto Detect and only pin a flavor when the workspace has stable evidence that Auto Detect cannot infer. Pinning is useful for repositories that intentionally use a platform style, such as GitHub Flavored Markdown or MDX, without an obvious folder marker.

Keep structured profiles separate. A Keep a Changelog file can still be GFM, CommonMark, or Obsidian Markdown; the changelog profile describes document structure, not the base flavor.

### Check project evidence

Look for `.fgattributes`, `.obsidian/`, MDX component syntax, R Markdown chunks, Stack Overflow style posts, Reddit conventions, or other syntax that makes one flavor stronger than the fallback.

### Use the selector for one file or directory

Run the Flavor Grenade Markdown flavor command from VS Code, choose a base flavor, then choose whether the rule applies to the selected file or all Markdown files in the directory. The extension writes or updates `.fgattributes` beside the active file.

### Pin .fgattributes when it should travel

Use `.fgattributes` when the decision belongs to the repository and should travel with the content.

```gitattributes
# .fgattributes
*.md flavor=auto
docs/github/*.md flavor=gfm structured_profiles=keep-a-changelog
docs/decisions/*.md flavor=commonmark structured_profiles=madr
```

Use directory overrides when one repository mixes Markdown styles:

```gitattributes
# docs/.fgattributes
github/*.md flavor=gfm
decisions/*.md flavor=commonmark structured_profiles=madr
private.md !flavor
```

Supported base flavor ids are `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`.

## Expected result

The status bar and server state agree on the effective Markdown flavor. Generic Markdown stays CommonMark when there is no stronger evidence, Obsidian vaults become Obsidian flavored, and configured projects use the explicit flavor that the repository declares.

Once the effective flavor is stable, warnings should become more useful. Obsidian-only wiki syntax is not enabled for CommonMark-only files, while Obsidian notes still get vault-aware completions for `[[Daily Note]]`, embeds, tags, headings, and local attachments.

## Common failure mode

The most common failure is treating location as stronger evidence than it is. A root-level `README.md` near an Obsidian vault is not automatically an Obsidian note. If there is no `.fgattributes` rule, vault marker, or syntax signal attached to that file, CommonMark fallback is the safer result.

The second failure is mixing base flavors with structured profiles. Do not add `keep-a-changelog`, `common-changelog`, or `madr` to the Markdown flavor selector. Configure those with `structured_profiles` in `.fgattributes` so the base flavor remains clear.
