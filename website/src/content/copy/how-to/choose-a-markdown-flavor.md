---
title: "Choose a Markdown Flavor | Flavor Grenade LSP"
description: "Use Auto Detect, project configuration, and the VS Code selector to choose the right base Markdown flavor."
h1: "Choose a Markdown Flavor"
summary: "Choose the base Markdown flavor that matches the file before adding vault or structured-profile behavior."
related: ["conceptMarkdownFlavorModel","advancedConfigurationModel","howToConfigureObsidianVaults"]
---

# Choose a Markdown Flavor

Choose the base Markdown flavor that matches the file before adding vault or structured-profile behavior.

## When to use it

Use this page when a Markdown file is being treated like the wrong kind of document, or when a generic repository contains several Markdown styles side by side. The goal is to make the effective flavor explicit enough that diagnostics, completions, hovers, symbols, folds, semantic tokens, and rename all read the same grammar.

Auto Detect is the normal starting point. It checks explicit configuration first, then project and vault markers, then syntax and path context. If those signals do not identify a stronger flavor, Flavor Grenade falls back to CommonMark instead of assuming Obsidian syntax for every root-level README.

## Steps

Start with Auto Detect and only pin a flavor when the workspace has stable evidence that Auto Detect cannot infer. Pinning is useful for repositories that intentionally use a platform style, such as GitHub Flavored Markdown or MDX, without an obvious folder marker.

Keep structured profiles separate. A Keep a Changelog file can still be GFM, CommonMark, or Obsidian Markdown; the changelog profile describes document structure, not the base flavor.

### Check project evidence

Look for Flavor Grenade project config, `.obsidian/`, MDX component syntax, R Markdown chunks, Stack Overflow style posts, Reddit conventions, or other syntax that makes one flavor stronger than the fallback.

### Use the selector for one workspace

Run the Flavor Grenade Markdown flavor command from VS Code, choose a base flavor, and let the extension write `flavorGrenade.markdownFlavor` at the workspace-folder or workspace scope when the active file belongs to a folder.

### Pin project configuration when it should travel

Use a project config file when the decision belongs to the repository and should travel with the content. TOML is checked first, and JSON, JSONC, YAML/YML, and Flavor Grenade `.editorconfig` directives are also supported.

```toml
[core.markdown]
flavor = "gfm"
structured_profiles = "auto"
```

Use directory overrides when one repository mixes Markdown styles:

```yaml
core:
  markdown:
    flavor: commonmark
    overrides:
      - path: docs/github
        flavor: gfm
        structured_profiles: [keep-a-changelog]
      - path: docs/decisions
        flavor: commonmark
        structured_profiles: [madr]
```

Supported base flavor ids are `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`.

## Expected result

The status bar and server state agree on the effective Markdown flavor. Generic Markdown stays CommonMark when there is no stronger evidence, Obsidian vaults become Obsidian flavored, and configured projects use the explicit flavor that the repository declares.

Once the effective flavor is stable, warnings should become more useful. Obsidian-only wiki syntax is not enabled for CommonMark-only files, while Obsidian notes still get vault-aware completions for `[[Daily Note]]`, embeds, tags, headings, and local attachments.

## Common failure mode

The most common failure is treating location as stronger evidence than it is. A root-level `README.md` near an Obsidian vault is not automatically an Obsidian note. If there is no project config file, vault marker, or syntax signal attached to that file, CommonMark fallback is the safer result.

The second failure is mixing base flavors with structured profiles. Do not add `keep-a-changelog`, `common-changelog`, or `madr` to the Markdown flavor selector. Configure those with `flavorGrenade.markdownStructuredProfiles` or `structured_profiles` so the base flavor remains clear.
