---
title: "Keep a Changelog Analysis"
aliases:
  - "Keep a Changelog"
  - "Keep a Changelog 1.1.0"
  - "KaC"
tags:
  - research
  - markdown
  - changelog
  - keep-a-changelog
status: researched
format: obsidian-flavored-markdown
source_type: web-research
processed: 2026-05-23
---
# Keep a Changelog Analysis

> [!INFO] Related research
> - [[keep-a-changelog-vs-common-changelog|Differences Between Keep a Changelog 1.1.0 and Common Changelog]]
> - [[common-changelog-analysis|Common Changelog Analysis]]
> - [[commonmark-and-original-markdown|CommonMark and Original Markdown]]
> - [[github-flavored-markdown-analysis|GitHub Flavored Markdown Analysis]]

## Executive Summary

Keep a Changelog 1.1.0 is a human-first changelog convention expressed in
Markdown. It is not a separate Markdown parser grammar in the same way that GFM
or Pandoc Markdown is. The flavor boundary is document structure: a
`CHANGELOG.md`-style file with release headings, optional `Unreleased` heading,
categorized third-level sections, ISO-style release dates, linkable versions,
and reference-style comparison links.

For Flavor Grenade, Keep a Changelog is best modeled as a structured Markdown
profile layered over CommonMark/GFM, not as a general Markdown dialect. The
core value is validation, outline support, completion snippets, and release-note
navigation for changelog files.

## Primary Sources

- Keep a Changelog 1.1.0: <https://keepachangelog.com/en/1.1.0/>
- Semantic Versioning: <https://semver.org/>

## Format Model

Keep a Changelog defines a conventional changelog shape:

- `# Changelog` top-level title is conventional, though the site is more
  guidance-oriented than strict.
- `## [Unreleased]` is recommended at the top for pending changes.
- Released versions appear newest first.
- Release headings typically use `## [VERSION] - YYYY-MM-DD`.
- Version headings should be linkable.
- Release dates are displayed.
- Projects should mention whether they follow Semantic Versioning.
- Entries are grouped under change-type headings.

The standard change-type headings are:

```markdown
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
```

This six-category taxonomy is the strongest recognition signal. `Deprecated`
and `Security` are especially important because they distinguish Keep a
Changelog from Common Changelog.

## Syntax Signals

Strong signals:

- file basename `CHANGELOG.md`
- first heading `# Changelog`
- `## [Unreleased]`
- `## [1.2.3] - 2026-05-23`
- repeated `### Added`, `### Changed`, `### Deprecated`, `### Removed`,
  `### Fixed`, and `### Security` sections
- reference links for versions, such as `[1.2.3]: https://.../compare/...`
- SemVer links or explicit SemVer mention

Weak signals:

- any one category heading by itself
- generic release heading without brackets or date
- ordinary Markdown reference links
- `CHANGELOG.md` filename alone

Negative or ambiguity signals:

- Common Changelog only allows four categories and does not use `Unreleased`.
- Many projects use partial Keep a Changelog style without following the full
  convention.
- GitHub Release notes can resemble Keep a Changelog but may lack reference
  links and file-level structure.

## Example

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to
Semantic Versioning.

## [Unreleased]

### Added

- Add changelog flavor detection.

## [1.0.0] - 2026-05-23

### Added

- Publish first stable release.

[unreleased]: https://github.com/owner/project/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/owner/project/releases/tag/v1.0.0
```

## Detection Recommendations

Use Keep a Changelog inference only when multiple structural signals agree:

1. Prefer explicit configuration when present.
2. If the filename is `CHANGELOG.md` and the document has `# Changelog`, scan
   for release headings.
3. If `## [Unreleased]` is present, score strongly for Keep a Changelog.
4. If at least two of the six Keep a Changelog categories occur under release
   headings, score strongly.
5. If `Deprecated` or `Security` occurs as a third-level release section, prefer
   Keep a Changelog over Common Changelog.
6. If version reference links are present for bracketed version headings, raise
   confidence.
7. If evidence is limited to generic changelog headings, do not infer this
   flavor; fall back to the ambient Markdown flavor.

## Feature Implications

Potential editor features:

- document symbols for release entries and change sections
- diagnostics for unknown category headings
- quick fixes to add missing comparison links
- snippets for new release and `Unreleased` sections
- date-format diagnostics for non-ISO dates
- release comparison link navigation
- section-order checks

Potential parser flags:

- `changelogProfile: "keep-a-changelog"`
- `supportsUnreleasedSection: true`
- `changeCategories: Added | Changed | Deprecated | Removed | Fixed | Security`
- `releaseHeadingPattern: bracketed-version-date`
- `versionLinksRecommended: true`

## Implementation Notes

Keep a Changelog should not replace Markdown parsing. The base Markdown flavor
still controls tables, task lists, HTML, links, emphasis, and code fences. The
Keep a Changelog layer should operate on heading hierarchy, list blocks, dates,
and reference definitions after baseline Markdown parsing.

Treat this profile as file-scoped. It should normally activate only in
`CHANGELOG.md`, release-note files explicitly configured by users, or documents
with very strong structural evidence.
