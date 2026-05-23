# Differences Between Keep a Changelog 1.1.0 and Common Changelog

## Bottom line

**Keep a Changelog 1.1.0** is the broader, more widely recognized convention. It is intentionally human-first, relatively flexible, and easy for projects to adopt. **Common Changelog** is explicitly “adapted from and a stricter subset of Keep a Changelog”; it keeps the same human-centered philosophy but adds more rules around release structure, references, authorship, breaking-change markers, commit hygiene, and release workflow.

Neither is really a formal standards-body “standard.” Keep a Changelog itself says there is “not really” a standard changelog format and positions itself as a better convention. Common Changelog calls itself a “style guide,” not a formal specification.

Sources:

- <https://keepachangelog.com/en/1.1.0/>
- <https://common-changelog.org/>

## High-level comparison

| Area | Keep a Changelog 1.1.0 | Common Changelog |
|---|---|---|
| Core philosophy | Human-readable changelogs, not raw git logs | Same, but stricter and more tied to clean git history |
| Relationship | Original/influential convention | Stricter subset/adaptation of Keep a Changelog |
| File name | Recommends `CHANGELOG.md` | Requires `CHANGELOG.md` |
| Release order | Latest version first | SemVer latest-first, even if a lower version was published later |
| Categories | `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security` | Only `Changed`, `Added`, `Removed`, `Fixed` |
| Unreleased section | Recommends `## [Unreleased]` | Rejects an `Unreleased` section |
| References | Encourages linkable versions/sections | Requires change-level references to commits/PRs/issues where relevant |
| Authors | Not part of the core format | Allows/requires author notation after references in defined form |
| Breaking changes | Emphasize deprecations/removals/breakage clearly | Requires bold `**Breaking:**` prefix or subsystem-breaking prefix |
| Yanked releases | Uses explicit `[YANKED]` marker | Uses a release notice instead |
| GitHub Releases | Warns they are non-portable as the sole changelog | Gives an integration pattern to derive GitHub Releases from `CHANGELOG.md` |
| Automation posture | Human-first; parsing is difficult because formats vary | Human-first but more parseable because it is stricter; still warns against full automation |

## Shared foundation

Both formats reject the idea that a changelog is just a `git log`. Keep a Changelog says commit-log diffs are noisy and that changelog entries should communicate noteworthy differences to end users. Common Changelog makes the same point, warning against verbatim copying of git log or pull request titles because those are often meaningful only to contributors.

Both also expect a project-level Markdown changelog, release entries, dates in `YYYY-MM-DD` form, human-readable grouping of changes, and Semantic Versioning as the usual versioning model. Keep a Changelog says to mention whether the project follows SemVer; Common Changelog makes SemVer adherence a prerequisite.

## The biggest structural difference: flexibility vs. strictness

Keep a Changelog is more of a convention with guiding principles. It says changelogs are for humans, every version should have an entry, types of changes should be grouped, versions/sections should be linkable, newest version should appear first, release dates should be shown, and SemVer should be mentioned.

Common Changelog turns many of those ideas into explicit rules. It says the file **must** be `CHANGELOG.md`, the content **must** start with `# Changelog`, releases **must** use `## VERSION - DATE`, versions must be SemVer-valid, release headings should link to further information, and the content after a release heading is limited to either change groups or one notice followed by change groups.

In practice, **Keep a Changelog is easier to adopt**, especially for mixed-skill contributor groups. **Common Changelog is better when you want a house style that can be linted, reviewed, and turned into release artifacts with less ambiguity.**

## Categories: six vs. four

Keep a Changelog’s standard categories are:

```markdown
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
```

That makes it very friendly for readers scanning for upgrade risk: deprecations, removals, fixes, and security matters each have their own bucket.

Common Changelog deliberately reduces this to four categories, in this order:

```markdown
### Changed
### Added
### Removed
### Fixed
```

It explicitly omits `Deprecated` and `Security`; deprecations are expected to fit under `Changed`, and security issues are not given a special category.

My read: **Keep a Changelog has a better default taxonomy for public libraries and products where security and deprecation visibility matter.** **Common Changelog has a cleaner, narrower taxonomy**, but at the cost of hiding some semantically useful distinctions unless your entry wording is disciplined.

## The `Unreleased` section is a philosophical split

Keep a Changelog recommends an `Unreleased` section at the top so upcoming changes are collected as work lands and can later be moved into a release section.

Common Changelog rejects that workflow. Its argument is that unreleased entries cannot yet include final self-references, first-time contributors should not be expected to update the changelog, maintainers would create noisy follow-up commits, and writing a useful changelog requires a release-level, bird’s-eye view rather than isolated per-change updates.

This is one of the most important operational differences:

```markdown
# Keep a Changelog style

## [Unreleased]

### Added

- Add export support for Foo format.

## [1.2.0] - 2026-05-23
```

```markdown
# Common Changelog style

## [1.2.0] - 2026-05-23

### Added

- Add export support for Foo format ([#123](...)).
```

**Keep a Changelog favors continuous changelog maintenance. Common Changelog favors release-time curation from completed commits/PRs/issues.**

## References and traceability

Keep a Changelog wants versions and sections to be linkable, and its examples use reference-style links for version comparisons, such as comparing one tag to another.

Common Changelog goes further: each change should be a single-line list item that starts with the change, then includes one or more references, then optionally authors. It says changes must reference relevant commits and should reference tickets or PRs when available.

Example Common Changelog shape:

```markdown
### Fixed

- Fix infinite loop ([#194](...)) (Alice Meerkat)
```

That is much more audit-friendly. For regulated, enterprise, or internal engineering environments, Common Changelog’s traceability rules are a major advantage.

## Breaking changes

Keep a Changelog emphasizes that deprecations, removals, and breaking changes must be clear, and it has dedicated `Deprecated` and `Removed` categories.

Common Changelog uses explicit inline prefixes. Breaking changes must be prefixed with `**Breaking:**` and listed before other changes in their category; subsystem-specific changes can use a prefix such as `**Installer (breaking):**`.

Example:

```markdown
### Changed

- **Breaking:** change default encryption metadata format ([#42](...)).
```

This is one place where Common Changelog is stronger: a breaking change remains visible even inside `Changed`, `Removed`, or subsystem-prefixed entries. Keep a Changelog’s category model is clearer at a glance, but Common Changelog’s bold prefix is more precise at the individual-entry level.

## Release notices vs. special markers

Keep a Changelog recommends an explicit `[YANKED]` marker in the release heading, such as:

```markdown
## [0.0.5] - 2014-12-13 [YANKED]
```

It notes that the bracketed marker is loud and easier to parse programmatically.

Common Changelog avoids a special yanked marker and instead uses a general-purpose release notice: a single-sentence paragraph after the release heading. It says a yanked release should still have a changelog entry, with a notice explaining its status, and that the notice should not replace the list of changes.

So Keep a Changelog is **more parseable for yanked status**, while Common Changelog is **more general and prose-oriented**.

## GitHub Releases integration

Keep a Changelog is skeptical of using GitHub Releases as the only changelog because GitHub Releases are non-portable and only visible in the GitHub context.

Common Changelog is more integration-friendly: it shows a GitHub Actions workflow where pushing a tag extracts the corresponding `CHANGELOG.md` entry and creates a GitHub Release with the same content.

That means Common Changelog fits a release pipeline where `CHANGELOG.md` is the source of truth and GitHub/GitLab releases are generated from it.

## Recommendation

For most projects, I would use **Keep a Changelog as the public-facing baseline** and borrow several Common Changelog rules:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, with selected Common Changelog conventions:
- Release entries are curated at release time.
- Each change links to a PR, issue, ticket, or commit where practical.
- Breaking changes are prefixed with **Breaking:**.
- GitHub/GitLab releases are generated from CHANGELOG.md.
```

For engineering-style projects, especially libraries, CLI tools, and anything with release discipline, I would adopt a **hybrid**.

Use Keep a Changelog categories:

```markdown
Added
Changed
Deprecated
Removed
Fixed
Security
```

Then add Common Changelog conventions:

```markdown
- **Breaking:** make key derivation metadata mandatory ([#123])
- Fix random-access read past block boundary ([#124]) (Contributor Name)
```

That preserves the reader-friendly taxonomy of Keep a Changelog while gaining the traceability and release-engineering discipline of Common Changelog.
