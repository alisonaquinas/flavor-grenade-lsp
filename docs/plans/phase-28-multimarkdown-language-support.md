---
title: "Phase 28: MultiMarkdown Language Support"
phase: 28
status: planned
tags: [plans, markdown-flavor, multimarkdown, language-support]
aliases: [Phase 28, MultiMarkdown Support]
updated: 2026-05-13
---

# Phase 28: MultiMarkdown Language Support

| Field | Value |
|---|---|
| Phase | 28 |
| Title | MultiMarkdown Language Support |
| Status | planned |
| Gate | MultiMarkdown document-production constructs are implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement actual language support for the `multimarkdown` flavor.

## Scope

Support metadata, tables, footnotes, citations, cross-references, labels,
supported attributes, diagnostics, completions, document symbols, folding,
semantic tokens, and navigation for document-production constructs according to
[[docs/plans/markdown-flavor-lsp-applicability-matrix]].

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/research/multimarkdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]] | Keep the flavor profile signature aligned with implemented surfaces |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Parser.ProfileDispatch]] | Dispatch parser behavior through the effective profile |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Diagnostics.ProfileRules]] | Apply profile-specific diagnostics |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Completion.ProfileCandidates]] | Apply profile-specific completions |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Navigation.ProfileResolution]] | Cover definition, references, document links, document symbols, and folding |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Hover.ProfileMetadata]] | Apply profile-specific hover metadata and boundary wording |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.SemanticTokens.ProfileTokens]] | Apply profile-specific semantic tokens |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Rename.ProfileSafety]] | Implement or explicitly reject profile-safe rename surfaces |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]] | Classify host, conversion, renderer, bibliography, MDX/JSX, and execution boundaries before local resolution |
| [[docs/plans/markdown-flavor-lsp-applicability-matrix]] | Record per-surface implementation, deferral, or not-applicable disposition |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Phase evidence includes a surface disposition table for diagnostics, completion, navigation, hover, semantic tokens, rename, and host/conversion boundaries.
- Selecting `multimarkdown` enables MultiMarkdown-specific constructs.
- Shared table/footnote behavior is reused through profile capabilities.
- Integration and BDD coverage prove MultiMarkdown behavior.

## Gate Verification

```bash
bun test src/parser/__tests__/markdown-flavor-profiles.test.ts
bun test src/test/integration/markdown-flavor.test.ts
bun run bdd
bun test src/test/ci-workflow.test.ts
bun run lint:docs
bun run typecheck
bun run lint
bun run build
```

Validation evidence must link the targeted unit/integration output,
`docs/test/evidence/markdown-flavor-validation-run.md`,
`docs/test/evidence/markdown-flavor-research-trace.md`, and
`docs/test/evidence/markdown-flavor-host-boundary-review.md` when boundary
dispositions are introduced, changed, deferred, or rejected.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-28-multimarkdown-language-support/index]]
