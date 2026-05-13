---
id: "FEAT-048"
title: "Original Markdown Language Support"
type: feature
status: in-review
priority: high
phase: 22
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-044"]
tags: [tickets/feature, "phase/22", markdown-flavor, "original"]
aliases: ["FEAT-048"]
---

# Original Markdown Language Support

> [!INFO] FEAT-048 - Feature - Phase 22 - Status: in-review

## Description

Implement first-class original language support for Original Markdown, using [[docs/research/commonmark-and-original-markdown]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Original Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-315]] | Implement Original Markdown parser semantics | Task | done |
| [[TASK-316]] | Add Original Markdown diagnostics and LSP features | Task | done |
| [[TASK-317]] | Add Original Markdown tests and validation evidence | Task | done |
| [[BUG-045]] | Ignore frontmatter when scanning Original setext headings | Bug | done |
| [[CHORE-115]] | Phase 22 trace and documentation sweep | Chore | done |
| [[CHORE-116]] | Phase 22 verification and closeout sweep | Chore | done |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[docs/requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[docs/requirements/ofmarkdown-language-mode]] |
| FlavorLSP.Profile.SignatureCoverage | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Parser.ProfileDispatch | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Diagnostics.ProfileRules | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Completion.ProfileCandidates | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Navigation.ProfileResolution | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Hover.ProfileMetadata | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.SemanticTokens.ProfileTokens | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Rename.ProfileSafety | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.HostBoundary.NonLocalReferences | [[docs/requirements/functional/markdown-flavor-lsp]] |

## Definition of Done

- [ ] original has source-backed parser/profile behavior.
- [ ] original satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] original behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C - 2026-05-13
> Phase 21 PR #71 is open with green CI. Step A confirmed Phase 22 tickets and
> the source trace in `docs/research/commonmark-and-original-markdown.md`; Step
> B found no missing ticket cross-references; Step C scopes implementation to
> `src/parser/ofm-parser.ts`, `src/markdown-flavor/markdown-flavor-profiles.ts`,
> `src/resolution/diagnostic-service.ts`, `src/completion/completion-router.ts`,
> `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, existing
> diagnostics/completion tests, `src/test/integration/markdown-flavor.test.ts`,
> and validation evidence under `docs/test/evidence/`.

> [!WARNING] RED - 2026-05-13
> Added failing Phase 22 coverage for Original Markdown parser/profile behavior,
> portability diagnostics, and inactive Obsidian completions before
> implementation.

> [!SUCCESS] Local gate - 2026-05-13
> Original Markdown parser semantics, FG101 diagnostics, completion gating,
> spawned-server coverage, and trace evidence are ready for PR review. BUG-045
> was opened and fixed during Step I before rerunning the full unit suite.

> [!SUCCESS] CI - 2026-05-13
> PR #72 CI run `25820116841` passed. Phase 22 remains `in-review` pending
> merge order; implementation tickets are marked `done`.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

The Phase 19 and Phase 20 flavor model gave Phase 22 a narrow implementation
path: parser dispatch was already threaded through open documents, so this
phase could focus on Original Markdown setext headings, profile surface status,
portability diagnostics, and completion suppression.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| BUG-045 | Bug | Setext heading scanning initially treated the YAML frontmatter closing `---` as a heading underline. | +0.25 h |

### Process observations

The documented Phase 22 gate was necessary but not sufficient for Step I:
`bun test src/` caught BUG-045 while the focused parser/profile and spawned
integration gate stayed green. Keeping the broader A-M sweeps after the phase
gate paid for itself.

### Carry-forward actions

- [ ] Keep passing body/content boundary offsets into future dialect block
      scanners so metadata delimiters cannot be reinterpreted as Markdown body
      syntax.

### Rule / template amendments

- [ ] none
