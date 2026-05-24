---
title: Markdown Flavor User Requirements
tags:
  - requirements/user/markdown-flavors
aliases:
  - Markdown Flavor Authoring
  - Flavor Authoring User Requirements
---

# Markdown Flavor User Requirements

> [!NOTE] Scope
> These user requirements cover how authors select, understand, and safely write within each planned Markdown flavor. Flavor feature sets are indexed in [[docs/features/markdown-flavor-feature-sets]].

---

## User.Flavor.SelectSupportedFlavor

**Tag:** User.Flavor.SelectSupportedFlavor
**Goal:** Select the intended Markdown flavor
**Need:** A Markdown author wants one visible place to choose `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, or `stack-overflow`, so the editor interprets the document according to the audience and publishing target.
**Maps to:** Extension.MarkdownFlavor.Selector, Extension.MarkdownFlavor.RequiredCoverage

---

## User.Flavor.UnderstandActiveRules

**Tag:** User.Flavor.UnderstandActiveRules
**Goal:** Understand the active flavor's rules
**Need:** A Markdown author wants the editor to make clear which syntax is active, inert, host-specific, or conversion-bound for the selected flavor before they rely on it.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Hover.ProfileMetadata

---

## User.Flavor.AvoidCrossFlavorMistakes

**Tag:** User.Flavor.AvoidCrossFlavorMistakes
**Goal:** Avoid writing syntax for the wrong flavor
**Need:** A Markdown author wants diagnostics, completions, hovers, and navigation to stay within the selected flavor so Obsidian, GitHub, GitLab, Pandoc, MDX, and other dialect features do not silently leak into unrelated documents.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Completion.ProfileCandidates, FlavorLSP.SemanticTokens.ProfileTokens, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.ApplyStructuredProfiles

**Tag:** User.Flavor.ApplyStructuredProfiles
**Goal:** Apply structured document profiles without changing base flavor
**Need:** A Markdown author wants Keep a Changelog, Common Changelog, and MADR rules to layer onto any active Markdown flavor through auto-detection or explicit configuration, so a changelog or ADR can still be CommonMark, GFM, Obsidian, Pandoc, or another supported base flavor.
**Maps to:** FlavorLSP.StructuredProfiles.Flags, Extension.MarkdownStructuredProfiles.Configuration, Extension.MarkdownFlavor.AutoDetection

---

## User.Flavor.AuthorOriginal

**Tag:** User.Flavor.AuthorOriginal
**Goal:** Author original Markdown safely
**Need:** A compatibility-focused author wants links, headings, lists, code, and raw HTML treated as original Markdown while modern extensions such as tables, task lists, footnotes, fenced code blocks, wiki-links, and callouts are identified as outside the 2004 baseline.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution

---

## User.Flavor.AuthorCommonMark

**Tag:** User.Flavor.AuthorCommonMark
**Goal:** Author CommonMark safely
**Need:** A portable Markdown author wants standardized CommonMark parsing, local link help, heading navigation, reference label support, and fenced-code awareness without platform extensions being treated as active syntax.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution

---

## User.Flavor.AuthorObsidian

**Tag:** User.Flavor.AuthorObsidian
**Goal:** Author Obsidian vault notes safely
**Need:** An Obsidian vault author wants wiki-links, embeds, block references, tags, callouts, frontmatter, opaque regions, and local Markdown links to behave as vault-native syntax while non-Obsidian flavors keep those constructs inactive.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution

---

## User.Flavor.AuthorGFM

**Tag:** User.Flavor.AuthorGFM
**Goal:** Author GitHub Flavored Markdown safely
**Need:** A developer documentation author wants GFM tables, task lists, strikethrough, autolinks, and GitHub alert syntax supported while issue references, commits, mentions, emoji, and rendering behavior are treated as GitHub-host-specific.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorGLFM

**Tag:** User.Flavor.AuthorGLFM
**Goal:** Author GitLab Flavored Markdown safely
**Need:** A GitLab documentation author wants GLFM tables, task markers, footnotes, description lists, diagrams, math, alerts, TOC tags, includes, and GitLab references classified without pretending local analysis can verify GitLab objects or renderer output.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorPandoc

**Tag:** User.Flavor.AuthorPandoc
**Goal:** Author Pandoc Markdown safely
**Need:** An academic or technical author wants Pandoc metadata, citations, footnotes, math, attributes, tables, labels, and local links analyzed while filters, templates, citeproc, command-line extensions, and output formats remain clearly conversion-bound.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorMultiMarkdown

**Tag:** User.Flavor.AuthorMultiMarkdown
**Goal:** Author MultiMarkdown safely
**Need:** A document-production author wants MultiMarkdown metadata, tables, footnotes, citations, math, cross-references, labels, and local links understood without local tooling promising final PDF, HTML, or LaTeX export parity.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorMDX

**Tag:** User.Flavor.AuthorMDX
**Goal:** Author MDX in Markdown mode safely
**Need:** An MDX author working in VS Code's Markdown mode wants JSX, expressions, ESM declarations, component references, headings, and local Markdown links recognized without the extension taking over documents whose language mode is already `mdx`.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, Extension.MarkdownFlavor.ManualLanguageSafety, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorKramdown

**Tag:** User.Flavor.AuthorKramdown
**Goal:** Author kramdown safely
**Need:** A Ruby-oriented Markdown author wants kramdown attributes, explicit IDs, definition lists, tables, footnotes, math, headings, and local links treated as addressable syntax without those rules leaking into CommonMark or GFM files.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution

---

## User.Flavor.AuthorMarkdownExtra

**Tag:** User.Flavor.AuthorMarkdownExtra
**Goal:** Author Markdown Extra safely
**Need:** A web publishing author wants Markdown Extra tables, definition lists, footnotes, abbreviations, fenced code, attributes, headings, and local links understood without CommonMark-only documents receiving Markdown Extra behavior.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution

---

## User.Flavor.AuthorRMarkdown

**Tag:** User.Flavor.AuthorRMarkdown
**Goal:** Author R Markdown safely
**Need:** An R Markdown author wants YAML metadata, code chunks, inline R, chunk labels, options, citations, cross-references, headings, and local links analyzed without any R code being executed.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorReddit

**Tag:** User.Flavor.AuthorReddit
**Goal:** Author Reddit Markdown safely
**Need:** A Reddit post or comment author wants Reddit spoilers, superscript, escapes, tables, links, and platform references classified with portability warnings, without subreddit, user, post, or comment references being treated as vault files.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorStackOverflow

**Tag:** User.Flavor.AuthorStackOverflow
**Goal:** Author Stack Overflow Markdown safely
**Need:** A technical Q&A author wants CommonMark prose, code fences, language hints, tables, spoilers, local links, and Stack Overflow references understood while post-body and comment limitations stay distinct and platform references remain non-local.
**Maps to:** Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ServerPropagation, FlavorLSP.Profile.SignatureCoverage, FlavorLSP.Parser.ProfileDispatch, FlavorLSP.Diagnostics.ProfileRules, FlavorLSP.Navigation.ProfileResolution, FlavorLSP.HostBoundary.NonLocalReferences

---

## User.Flavor.AuthorKeepAChangelog

**Tag:** User.Flavor.AuthorKeepAChangelog
**Goal:** Author Keep a Changelog documents safely
**Need:** A release maintainer wants `CHANGELOG.md` files using Keep a Changelog headings, `Unreleased`, release dates, categories, and version links validated as a structured profile without changing the file's base Markdown flavor.
**Maps to:** FlavorLSP.StructuredProfiles.Flags, Extension.MarkdownStructuredProfiles.Configuration

---

## User.Flavor.AuthorCommonChangelog

**Tag:** User.Flavor.AuthorCommonChangelog
**Goal:** Author Common Changelog documents safely
**Need:** A release maintainer wants Common Changelog release headings, four-category ordering, change references, breaking prefixes, and author notation validated as a structured profile without adding Common Changelog to the base flavor list.
**Maps to:** FlavorLSP.StructuredProfiles.Flags, Extension.MarkdownStructuredProfiles.Configuration

---

## User.Flavor.AuthorMADR

**Tag:** User.Flavor.AuthorMADR
**Goal:** Author MADR decision records safely
**Need:** An architecture decision author wants MADR front matter, decision headings, considered options, outcomes, consequences, confirmation, and pros/cons structure validated as a structured profile that can mix with any base Markdown flavor.
**Maps to:** FlavorLSP.StructuredProfiles.Flags, Extension.MarkdownStructuredProfiles.Configuration
