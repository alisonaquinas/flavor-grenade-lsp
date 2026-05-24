---
title: "MADR Analysis"
aliases:
  - "MADR"
  - "Markdown Architectural Decision Records"
  - "Markdown ADR"
tags:
  - research
  - markdown
  - adr
  - madr
  - architecture
status: researched
format: obsidian-flavored-markdown
source_type: web-research
processed: 2026-05-23
---
# MADR Analysis

> [!INFO] Related research
> - [[commonmark-and-original-markdown|CommonMark and Original Markdown]]
> - [[github-flavored-markdown-analysis|GitHub Flavored Markdown Analysis]]
> - [[keep-a-changelog-analysis|Keep a Changelog Analysis]]
> - [[common-changelog-analysis|Common Changelog Analysis]]

## Executive Summary

MADR means Markdown Architectural Decision Records. It is a Markdown template
and style for recording architectural decisions, not a general Markdown parser
grammar. MADR files are ordinary Markdown documents with a recognizable ADR
structure: metadata, one decision title, context, considered options, decision
outcome, consequences, confirmation, pros and cons, and more information.

For Flavor Grenade, MADR should be modeled as a structured Markdown profile
layered over the active Markdown flavor. The useful behavior is ADR-aware
outline, validation, snippets, links between decision records, and conservative
auto-detection for files in decision-log locations.

## Primary Sources

- MADR homepage: <https://adr.github.io/madr/>
- MADR repository: <https://github.com/adr/madr>
- Current development template:
  <https://github.com/adr/madr/blob/develop/template/adr-template.md>

## Format Model

MADR documents are individual ADRs. The homepage describes an architectural
decision as a justified software design choice with architectural significance,
and an ADR as the record that captures one such decision and its rationale.

The current MADR template includes YAML front matter for site and decision
metadata. Optional metadata fields include:

- `status`
- `date`
- `decision-makers`
- `consulted`
- `informed`

The body uses one first-level heading for the decision title, then second-level
sections for the main ADR structure:

```markdown
# {short title, representative of solved problem and found solution}

## Context and Problem Statement

## Decision Drivers

## Considered Options

## Decision Outcome

## Pros and Cons of the Options

## More Information
```

Some sections contain third-level headings:

```markdown
### Consequences
### Confirmation
### {title of option 1}
```

MADR examples use unordered lists with `*` markers. Considered options are list
items, and pros and cons use repeated `Good, because`, `Neutral, because`, and
`Bad, because` list entries.

## Repository Layout

The recommended project setup is a decision-log folder under documentation:

```text
docs/decisions/
```

The manual creation flow copies the template to a numbered Markdown filename:

```text
NNNN-title-with-dashes.md
```

The homepage documents this pattern as a four-digit consecutive number,
lowercase dash-separated title, and `.md` suffix. It also notes that categories
may be represented by subdirectories in large projects.

## Syntax Signals

Strong signals:

- path contains `docs/decisions/`, `decisions/`, or another configured ADR
  directory
- filename matches `NNNN-title-with-dashes.md`
- YAML front matter includes MADR decision metadata such as `status`, `date`,
  `decision-makers`, `consulted`, or `informed`
- body has a single H1 decision title
- H2 headings include `Context and Problem Statement`, `Considered Options`,
  and `Decision Outcome`
- `Pros and Cons of the Options` contains option-name H3 headings
- list items use `Good, because`, `Neutral, because`, or `Bad, because`

Weak signals:

- any file with only `## Decision Outcome`
- generic ADR terminology without MADR section names
- arbitrary Markdown files in `docs/`
- YAML `status` alone, because many static-site documents use it

Negative or ambiguity signals:

- multiple unrelated H1 headings
- changelog release headings and change categories
- README-style project overview sections
- issue template sections such as `Steps to reproduce`
- ADR formats with different section names, such as Nygard-style
  `Status`, `Context`, `Decision`, and `Consequences`

## Example

```markdown
---
status: accepted
date: 2026-05-23
decision-makers:
  - Platform Team
consulted:
  - Docs Team
informed:
  - Extension Team
---
# Use MADR for architecture decisions

## Context and Problem Statement

How should architecture decisions be recorded in the repository?

## Considered Options

* MADR
* Plain issue comments
* Wiki pages

## Decision Outcome

Chosen option: "MADR", because it keeps decisions close to code and review.

### Consequences

* Good, because decision records are versioned.
* Bad, because contributors must learn the template.

## Pros and Cons of the Options

### MADR

* Good, because it provides a repeatable structure.
* Neutral, because it is still ordinary Markdown.
* Bad, because strictness requires review discipline.

## More Information

See related ADRs for superseded decisions.
```

## Detection Recommendations

Use MADR inference only when ADR-specific structure is present:

1. Prefer explicit configuration when present.
2. If the path is under a known decision directory and the filename matches
   `NNNN-title-with-dashes.md`, scan for MADR headings.
3. Score strongly when at least two of `Context and Problem Statement`,
   `Considered Options`, and `Decision Outcome` are present.
4. Score strongly when YAML front matter includes decision metadata and the
   body has MADR headings.
5. Increase confidence for `Good, because`, `Neutral, because`, and
   `Bad, because` list entries under option sections.
6. Do not infer MADR from `Status`, `Context`, `Decision`, and `Consequences`
   alone, because that is a broader ADR pattern.
7. If a document looks like both MADR and another structured Markdown profile,
   require path or filename evidence before selecting MADR automatically.

## Feature Implications

Potential editor features:

- snippets for new ADRs and common optional sections
- diagnostics for missing required MADR headings
- diagnostics for multiple H1 headings
- filename diagnostics for non-`NNNN-title-with-dashes.md` names
- front matter completion for `status`, `date`, `decision-makers`,
  `consulted`, and `informed`
- document symbols grouped by ADR section and option
- links between ADRs, including supersession relationships in `status`
- quick fixes to add missing `Consequences` or `Confirmation` subsections

Potential parser flags:

- `structuredProfile: "madr"`
- `profileKind: "architectural-decision-record"`
- `requiresSingleDecisionTitle: true`
- `supportsYamlDecisionMetadata: true`
- `decisionSections: Context and Problem Statement | Decision Drivers | Considered Options | Decision Outcome | Pros and Cons of the Options | More Information`
- `argumentMarkers: Good, because | Neutral, because | Bad, because`

## Implementation Notes

MADR should not change low-level Markdown tokenization. It should be implemented
as a structural layer over parsed headings, lists, links, and YAML front matter.
The base Markdown flavor still controls tables, HTML, links, emphasis, code
fences, and other general Markdown constructs.

Auto-detection should be conservative. MADR shares vocabulary with broader ADR
formats and with normal architecture documentation. Path, filename, metadata,
and exact section names should be combined before selecting this profile.
