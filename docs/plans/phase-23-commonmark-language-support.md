---
title: "Phase 23: CommonMark Language Support"
phase: 23
status: in-review
tags: [plans, markdown-flavor, commonmark, language-support]
aliases: [Phase 23, CommonMark Support]
updated: 2026-05-13
---

# Phase 23: CommonMark Language Support

| Field | Value |
|---|---|
| Phase | 23 |
| Title | CommonMark Language Support |
| Status | in-review |
| Gate | CommonMark behavior is implemented and tested |
| Depends on | Phase 22 |

## Objective

Implement actual language support for the `commonmark` flavor using
standardized CommonMark semantics and explicit exclusions for GFM and Obsidian
extensions.

## Scope

Support fenced code, ATX/setext headings, reference links, autolinks, normalized
labels, HTML blocks, blockquote/list edge cases, document links, folding,
semantic tokens, completion, diagnostics, and navigation according to
[[docs/plans/markdown-flavor-lsp-applicability-matrix]].

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/research/commonmark-and-original-markdown]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
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
- Generic Markdown in `auto` resolves to CommonMark and gets CommonMark
  behavior.
- GFM tables/tasks and Obsidian wiki links are not treated as CommonMark core.
- Spawned-server and BDD coverage prove behavior under `commonmark`.

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

Security evidence must also show the dialect parser/profile satisfies
`Security.Parser.FlavorProfileResourceSafety`; host, conversion, renderer,
bibliography, JSX/ESM, and execution-bound references perform no network access,
process execution, dynamic import, or out-of-root file reads; and rename evidence
satisfies `Security.Vault.RenameConfinement` before any workspace edit is sent.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-23-commonmark-language-support/index]]
