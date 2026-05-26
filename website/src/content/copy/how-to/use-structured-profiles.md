---
title: "Use Structured Profiles | Flavor Grenade LSP"
description: "Layer Keep a Changelog, Common Changelog, or MADR structure on top of the selected Markdown flavor."
h1: "Use Structured Profiles"
summary: "Use structured profiles when a document has a known shape in addition to its Markdown flavor."
related: ["conceptStructuredProfiles","howToChooseMarkdownFlavor","advancedConfigurationModel"]
---

# Use Structured Profiles

Use structured profiles when a document has a known shape in addition to its Markdown flavor.

## When to use it

Use this page when the file name, folder, or headings tell you that a document is not just Markdown, but a known document pattern. Flavor Grenade currently treats Keep a Changelog, Common Changelog, and MADR as structured profile flags that can mix with any supported base Markdown flavor.

The important point is separation. A `CHANGELOG.md` can be CommonMark, GFM, or Obsidian Markdown while still following Keep a Changelog. A MADR file can live in an Obsidian vault and still keep ADR-specific headings. Profiles add structure checks and structural editor features without expanding the base flavor list.

## Steps

Start with `auto` unless the project intentionally uses one profile everywhere. Auto mode can infer changelog profiles from `CHANGELOG.md` naming and changelog headings, and MADR from decision-record placement, file naming, and the expected headings.

Use explicit configuration when inference would be ambiguous. Do not enable both changelog profiles together; Keep a Changelog and Common Changelog are competing changelog conventions for the same document role.

### Keep Auto Detect on for mixed projects

Leave `flavorGrenade.markdownStructuredProfiles` set to `auto` when a repository contains ordinary docs, changelogs, and ADRs in different folders.

### Pin profile flags in project configuration

Use project config when every maintainer should get the same profile behavior. TOML, JSON, JSONC, YAML/YML, and Flavor Grenade `.editorconfig` directives can all carry profile selections.

### Disable profiles for noisy generated output

Use `none` when generated Markdown happens to match profile headings but should not receive profile-specific diagnostics or headings.

```toml
[core.markdown]
flavor = "commonmark"
structured_profiles = ["keep-a-changelog", "madr"]
```

For mixed repositories, scope profiles by directory instead of forcing one profile everywhere:

```jsonc
{
  "core": {
    "markdown": {
      "flavor": "commonmark",
      "structured_profiles": "auto",
      "overrides": [
        { "path": "docs/releases", "structured_profiles": ["common-changelog"] },
        { "path": "docs/decisions", "structured_profiles": ["madr"] }
      ]
    }
  }
}
```

Example files that can trigger auto inference:

- `CHANGELOG.md` with `## [Unreleased]` and version sections.
- `CHANGELOG.md` with `## 1.2.0 - 2026-05-24` Common Changelog style entries.
- `docs/decisions/0001-use-language-server.md` with `## Context and Problem Statement`.

## Expected result

Flavor Grenade keeps the selected base flavor and adds the inferred or configured profile flags to the document analysis. Structured hovers, document symbols, folding ranges, completions, and diagnostics can then understand changelog sections or MADR headings without changing how Markdown links, code fences, or embeds are parsed.

In a mixed workspace, one file might resolve as `gfm` plus `keep-a-changelog`, another as `obsidian` plus `madr`, and a plain note as only `obsidian`. Those are different layers, not different base flavors.

## Common failure mode

The common mistake is trying to make a profile act like a Markdown flavor. `keep-a-changelog`, `common-changelog`, and `madr` should not appear in `flavorGrenade.markdownFlavor`, and they should not be offered by the flavor selector.

Another failure is forcing one changelog profile across a repository that contains both styles. If a project has imported historical changelogs, keep profiles on `auto` until the files are normalized, or set profile flags only in the folder where the convention is reliable.
