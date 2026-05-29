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

| Spec ID | Planned/generated evidence | Acceptance criteria |
|---|---|---|
| MF-VA-001 | `docs/research/*.md`, `docs/features/ofmarkdown-language-mode.md` | Every researched Markdown flavor appears in the selector requirements or is explicitly excluded with rationale. |
| MF-VA-002 | `docs/adr/ADR020-markdown-flavor-selection.md` | ADR flavor enum matches requirements, BDD examples, and extension test plans. |
| MF-VA-003 | `docs/bdd/features/markdown-flavor-dialects.feature`, `docs/test/evidence/markdown-flavor-research-trace.md` | Profile examples cite the correct research source slug and at least one signature behavior per flavor. |
| MF-VA-004 | `docs/test/evidence/markdown-flavor-product-review.md` | Reviewer confirms `mdx` as a flavor does not authorize changing the VS Code language id away from `markdown`. |
| MF-VA-005 | `docs/test/evidence/markdown-flavor-host-boundary-review.md` | Reviewer confirms platform, conversion, renderer, and execution-bound references have non-local fixture coverage or an explicit deferred lookup disposition. |
| MF-VA-006 | `docs/test/evidence/markdown-flavor-inference-review.md` | Reviewer confirms syntax/context inference uses only strong local evidence, documents ambiguous fallback to CommonMark, and does not infer Original Markdown by absence of extensions. |
| MF-VA-007 | `docs/test/evidence/markdown-structured-profile-review.md` | Reviewer confirms Keep a Changelog, Common Changelog, and MADR remain structured profile flags, have smoke fixtures in every `.fgattributes`-configured and config-absent inference workspace, and are backed by research sources. |

## Planned Evidence Artifacts

These paths are generated validation artifacts. Phase 19 implemented the
research trace artifact, and Phase 21 adds the product review, validation run,
and host-boundary review metadata required before release-readiness claims.

| Artifact path | Required content |
|---|---|
| `docs/test/evidence/markdown-flavor-research-trace.md` | Table mapping every displayed flavor id to its research source or `ofm-spec/` source. |
| `docs/test/evidence/markdown-flavor-product-review.md` | Signed review notes for `auto`, `mdx`, platform flavors, and manual non-Markdown language safety. |
| `docs/test/evidence/markdown-flavor-validation-run.md` | Validation run date, reviewer, commit, commands, and links to BDD/test output. |
| `docs/test/evidence/markdown-flavor-host-boundary-review.md` | Table mapping host/conversion fixtures to GFM, GLFM, Pandoc, MultiMarkdown, MDX, R Markdown, Reddit, and Stack Overflow boundary expectations; each row states no local diagnostics/navigation/rename or links an explicit deferral. |
| `docs/test/evidence/markdown-flavor-inference-review.md` | Table mapping each inference fixture to expected strong/medium/weak evidence, expected effective flavor or CommonMark fallback, ambiguity rationale, boundary scope, and safety checks. |
| `docs/test/evidence/markdown-structured-profile-review.md` | Table mapping Keep a Changelog, Common Changelog, and MADR research sources to fixture paths, expected structured profile ids, mutually exclusive changelog behavior, and configured/inference workspace coverage. |

Each artifact must include its generation or review date, reviewer name or
generating command, repository commit SHA, source inputs reviewed, pass/fail
status for each related MF-VA row, and links or paths to the command output that
supports the result. The validation run artifact must include `bun run bdd`,
`bun test src/test/ci-workflow.test.ts`, and the current Phase 21 gate command
set from [[docs/plans/phase-21-markdown-flavor-bdd-validation]].

Evidence artifacts must be sanitized before commit. They must not include note
body text, frontmatter values, `.fgignore` or `.fgattributes` contents,
environment variables, API-like tokens, local usernames, home-directory paths,
or raw server stderr/stdout that contains vault content. Use
repository-relative paths and redacted excerpts when command output is needed.

## Exit Criteria

- Product review can trace each displayed flavor to research or `ofm-spec/`.
- `auto` remains documented as detection state, not a dialect profile.
- Platform flavors do not override user-selected non-Markdown language modes.
- Host-specific and conversion-specific references cannot be counted as local
  LSP support unless fixture evidence proves the server has verified local
  context.
- Syntax/context inference cannot count as validated unless evidence proves
  strong local syntax wins, weak/shared syntax falls back, and fixture roots do
  not inherit ancestor or child markers.
- Structured profiles cannot count as validated unless evidence proves both
  changelog variants and MADR remain profile flags and have fixture coverage in
  `.fgattributes`-configured and config-absent inference smoke workspaces.
- Planned evidence artifacts exist at the paths above before validation rows
  move from planned/failing to passing.
- Phase 21 release readiness is limited to root/server PR evidence unless the
  phase also changes release, binary, extension, or platform package workflows.
