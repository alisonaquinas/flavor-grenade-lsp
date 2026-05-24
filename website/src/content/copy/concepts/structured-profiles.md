---
title: "Structured Profiles | Flavor Grenade LSP"
description: "Understand changelog and MADR profiles as optional structure layered over a base Markdown flavor."
h1: "Structured Profiles"
summary: "Structured profiles are optional document-shape flags layered over the active Markdown flavor."
related: ["conceptMarkdownFlavorModel","conceptDiagnostics","howToUseStructuredProfiles"]
---

# Structured Profiles

Structured profiles are optional document-shape flags layered over the active Markdown flavor.

## Profiles are not flavors

Flavor Grenade uses base flavors for Markdown syntax and structured profiles for document conventions. Keep a Changelog, Common Changelog, and MADR are profiles because they describe expected headings, sections, and relationships inside a Markdown file.

That distinction matters in mixed projects. A MADR decision record can still be CommonMark, GFM, Pandoc, or Obsidian Markdown. The MADR profile helps symbols, folds, hovers, completions, and diagnostics understand ADR structure without pretending MADR is a separate Markdown dialect.

```toml
[core.markdown]
flavor = "obsidian"
structured_profiles = ["madr"]
```

## Supported profile flags

`keep-a-changelog` targets Keep a Changelog 1.1.0 structure, including Unreleased sections and version entries. `common-changelog` targets Common Changelog version sections and release metadata. `madr` targets Markdown Architectural Decision Records, including status, context, decision, and consequences sections.

The changelog profiles are mutually exclusive for one document because they describe competing conventions for the same role. MADR can mix with either ordinary docs or changelog-free workspaces because it describes architectural decision records, not release history.

## Inference signals

Auto Detect can infer profiles from naming and content. `CHANGELOG.md` is a strong path signal when the headings match a supported changelog convention. A file under `docs/decisions/` with a numeric ADR name and headings such as `## Context and Problem Statement` can point to MADR.

Inference is still conservative. A file with one matching word is not enough. Flavor Grenade looks for a combination of filename, folder placement, metadata, and headings before enabling profile-specific behavior.

## Editor behavior

Structured profiles feed structural editor features. Document symbols can show changelog releases or ADR sections. Folding ranges can collapse profile sections. Hovers can explain recognized headings. Completions can suggest missing expected headings when the current file context makes that useful.

Diagnostics should also become more precise. A profile-specific warning can say that a changelog section is malformed instead of presenting the issue as a generic heading problem. The profile flag is what lets the server know which convention to apply.

## Configuration boundary

Use `flavorGrenade.markdownStructuredProfiles` in VS Code or `core.markdown.structured_profiles` in `.flavor-grenade.toml`. Values can be `auto`, `none`, or an explicit compatible array. Keep the base flavor in `flavorGrenade.markdownFlavor` or `core.markdown.flavor`.

For example, a repository can set CommonMark as the base and still enable profile inference:

```toml
[core.markdown]
flavor = "commonmark"
structured_profiles = "auto"
```

That file remains CommonMark. Changelog and MADR behavior only appears when a document has enough profile evidence.
