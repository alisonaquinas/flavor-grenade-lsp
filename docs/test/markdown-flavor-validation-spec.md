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
| MF-VA-004 | `docs/test/evidence/markdown-flavor-product-review.md` | Reviewer confirms `mdx` as a flavor does not authorize changing the VS Code language id away from `markdown`. |

## Required Evidence Artifacts

| Artifact path | Required content |
|---|---|
| `docs/test/evidence/markdown-flavor-research-trace.md` | Table mapping every displayed flavor id to its research source or `ofm-spec/` source. |
| `docs/test/evidence/markdown-flavor-product-review.md` | Signed review notes for `auto`, `mdx`, platform flavors, and manual non-Markdown language safety. |
| `docs/test/evidence/markdown-flavor-validation-run.md` | Validation run date, reviewer, commit, commands, and links to BDD/test output. |

## Exit Criteria

- Product review can trace each displayed flavor to research or `ofm-spec/`.
- `auto` remains documented as detection state, not a dialect profile.
- Platform flavors do not override user-selected non-Markdown language modes.
- Evidence artifacts exist at the paths above before validation rows move from
  planned/failing to passing.
