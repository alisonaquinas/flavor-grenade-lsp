---
title: Markdown Flavor Validation Test Specification
tags:
  - test/spec
  - validation
  - markdown-flavor
aliases:
  - Markdown Flavor Validation Tests
---

# Markdown Flavor Validation Test Specification

Validation proves the implemented flavor set matches product intent and the
research corpus.

## Test Cases

| Spec ID | Evidence | Acceptance criteria |
|---|---|---|
| MF-VA-001 | `docs/research/*.md`, `docs/features/ofmarkdown-language-mode.md` | Every researched Markdown flavor appears in the selector requirements or is explicitly excluded with rationale. |
| MF-VA-002 | `docs/adr/ADR020-markdown-flavor-selection.md` | ADR flavor enum matches requirements, BDD examples, and extension test plans. |
| MF-VA-003 | `docs/bdd/features/markdown-flavor-dialects.feature` | Profile examples cite the correct research source slug and at least one signature behavior per flavor. |
| MF-VA-004 | Product review checklist | Reviewer confirms `mdx` as a flavor does not authorize changing the VS Code language id away from `markdown`. |

## Exit Criteria

- Product review can trace each displayed flavor to research or `ofm-spec/`.
- `auto` remains documented as detection state, not a dialect profile.
- Platform flavors do not override user-selected non-Markdown language modes.
