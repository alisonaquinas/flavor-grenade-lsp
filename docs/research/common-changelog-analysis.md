---
title: "Common Changelog Analysis"
aliases:
  - "Common Changelog"
  - "Common Changelog Style Guide"
tags:
  - research
  - markdown
  - changelog
  - common-changelog
status: researched
format: obsidian-flavored-markdown
source_type: web-research
processed: 2026-05-23
---
# Common Changelog Analysis

> [!INFO] Related research
> - [[keep-a-changelog-vs-common-changelog|Differences Between Keep a Changelog 1.1.0 and Common Changelog]]
> - [[keep-a-changelog-analysis|Keep a Changelog Analysis]]
> - [[commonmark-and-original-markdown|CommonMark and Original Markdown]]
> - [[github-flavored-markdown-analysis|GitHub Flavored Markdown Analysis]]

## Executive Summary

Common Changelog is a stricter changelog style guide derived from Keep a
Changelog. It keeps the human-first goal but defines a narrower, more
lintable structure. The format requires `CHANGELOG.md`, Markdown content,
`# Changelog`, SemVer release headings, release dates, a fixed four-category
taxonomy, change-level references, and explicit formatting for breaking changes,
authors, notices, and subsystem prefixes.

For Flavor Grenade, Common Changelog should be treated as a structured Markdown
profile with stronger validation than Keep a Changelog. Its stricter rules make
it a better candidate for deterministic diagnostics and auto-detection, but it
must not be inferred from generic changelog prose alone.

## Primary Sources

- Common Changelog: <https://common-changelog.org/>
- Keep a Changelog 1.1.0: <https://keepachangelog.com/en/1.1.0/>
- Semantic Versioning: <https://semver.org/>

## Format Model

Common Changelog specifies a narrow file and release structure:

- file name must be `CHANGELOG.md`
- content must be Markdown
- first heading must be `# Changelog`
- releases are second-level headings
- release headings use `## VERSION - DATE`
- version is SemVer-valid and has no leading `v`
- date uses `YYYY-MM-DD`
- entries are sorted SemVer latest-first
- every stable release needs an entry
- release content is limited to change groups, or one notice followed by
  change groups

Common Changelog categories are fixed and ordered:

```markdown
### Changed
### Added
### Removed
### Fixed
```

This is narrower than Keep a Changelog. There is no `Deprecated` category and
no `Security` category. Those meanings must be expressed in the change text or
under one of the four allowed groups.

## Change Entry Model

Each change group must contain only an unordered list. Each list item is a
single-line change entry with this conceptual shape:

```markdown
- Change text ([reference](url)) (Author Name)
```

Important constraints:

- change text should use imperative mood
- references come after the change on the same line
- references are wrapped in parentheses
- each reference should be a Markdown link
- authors, when included, come after references and are wrapped in parentheses
- breaking changes are prefixed with `**Breaking:**`
- subsystem prefixes may be bolded, such as `**UI**:`
- subsystem breaking prefixes use `**Subsystem (breaking):**`

## Syntax Signals

Strong signals:

- file basename `CHANGELOG.md`
- first heading exactly `# Changelog`
- release heading like `## [1.2.3] - 2026-05-23` or `## 1.2.3 - 2026-05-23`
- only the four ordered categories `Changed`, `Added`, `Removed`, `Fixed`
- one-line list entries with linked references in parentheses
- `**Breaking:**` prefix on list items
- author notation after references
- no `Unreleased` section

Weak signals:

- `# Changelog` by itself
- any one of the four category headings by itself
- `YYYY-MM-DD` date on a heading without SemVer
- plain issue numbers without Markdown links

Negative or ambiguity signals:

- `## [Unreleased]` points toward Keep a Changelog.
- `### Deprecated` or `### Security` points toward Keep a Changelog.
- long-form release notes with arbitrary subsections do not match Common
  Changelog.
- raw Conventional Commit lists are explicitly discouraged by the style guide.

## Example

```markdown
# Changelog

## [1.2.0] - 2026-05-23

### Changed

- **Breaking:** require Node.js 22 ([#42](https://github.com/owner/project/pull/42))
- **Docs:** clarify install path ([#41](https://github.com/owner/project/pull/41)) (Ada Lovelace)

### Added

- Add changelog profile detection ([#40](https://github.com/owner/project/pull/40))

[1.2.0]: https://github.com/owner/project/releases/tag/v1.2.0
```

## Detection Recommendations

Use Common Changelog inference only when stricter structure is visible:

1. Prefer explicit configuration when present.
2. Require `CHANGELOG.md` or very strong `# Changelog` plus release-heading
   evidence.
3. Require at least one SemVer/date release heading.
4. Prefer Common Changelog when category headings are limited to the four
   allowed categories and appear in the documented order.
5. Increase confidence for linked references in list-item parentheses.
6. Increase confidence for `**Breaking:**` or subsystem prefixes.
7. Downgrade or reject if `Unreleased`, `Deprecated`, or `Security` appears as
   a release section.
8. If evidence overlaps with Keep a Changelog and no distinguishing rule wins,
   report ambiguity or fall back to the ambient Markdown flavor.

## Feature Implications

Potential editor features:

- diagnostics for missing `# Changelog`
- diagnostics for non-SemVer release headings
- diagnostics for invalid date format
- diagnostics for forbidden categories
- category-order checks
- list-entry shape checks
- quick fixes for missing Markdown reference links
- snippets for release headings, notices, and change groups
- navigation from change references to commits, PRs, or issues

Potential parser flags:

- `changelogProfile: "common-changelog"`
- `supportsUnreleasedSection: false`
- `changeCategories: Changed | Added | Removed | Fixed`
- `releaseHeadingPattern: semver-date`
- `changeReferencesRequired: true`
- `breakingPrefix: "**Breaking:**"`

## Implementation Notes

Common Changelog should be implemented as a validation and tooling layer above
the base Markdown parser. It should not alter low-level Markdown tokenization.
The useful structure is in headings, lists, inline links, dates, and release
reference definitions.

This profile is a stronger auto-detection candidate than Keep a Changelog
because its constraints are narrower. Still, inference should remain
conservative: many real-world changelogs borrow pieces of this style without
following it completely.
