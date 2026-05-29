---
title: "Phase 21: Markdown Flavor BDD Verification And Validation"
phase: 21
status: in-review
tags: [plans, markdown-flavor, bdd, validation]
aliases: [Phase 21, Markdown Flavor BDD Validation]
updated: 2026-05-13
---

# Phase 21: Markdown Flavor BDD Verification And Validation

| Field | Value |
|---|---|
| Phase | 21 |
| Title | Markdown Flavor BDD Verification And Validation |
| Status | in-review |
| Gate | BDD, verification, and validation evidence execute against flavor state before release |
| Depends on | Phase 20, Phase E15 selector contract/spec |

## Objective

Replace stale `ofmarkdown` BDD assumptions with flavor-state acceptance tests,
then wire the unit, integration, e2e, verification, and validation specs into
traceable PR and release-readiness gates. This phase validates the root/server
flavor model and the E15 selector contract shape; it does not require E15
implementation completion and does not block server dialect implementation
after Phase 20 propagation is ready.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownLanguage.PreserveDefault]] | Assert language preservation in BDD |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]] | Assert every required selector/profile id |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Assert profile source and signature behavior |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]] | Assert server profile evidence is represented in traceability matrices |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Parser.ProfileDispatch]] | Validate BDD fixture behavior against effective flavor |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Diagnostics.ProfileRules]] | Validate profile-scoped diagnostics evidence |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Completion.ProfileCandidates]] | Validate profile-scoped completion evidence |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Navigation.ProfileResolution]] | Validate definition, references, document links, document symbols, and folding evidence |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Hover.ProfileMetadata]] | Validate profile-scoped hover evidence |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.SemanticTokens.ProfileTokens]] | Validate profile-scoped semantic-token evidence |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Rename.ProfileSafety]] | Validate profile-safe rename acceptance and rejection evidence |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]] | Establish planned host-boundary validation artifact and per-surface evidence rule |
| [[docs/test/markdown-flavor-e2e-spec]] | Implement root BDD e2e scenarios |
| [[docs/test/markdown-flavor-verification-spec]] | Verify CI and traceability gates |
| [[docs/test/markdown-flavor-validation-spec]] | Add product validation evidence |
| [GAP-S-009](../gaps/markdown-flavor-gap-analysis.md) | Close stale BDD step gap |
| [GAP-S-011](../gaps/markdown-flavor-gap-analysis.md) | Close validation trace gap |

## Scope

### In Scope

- Rewrite `src/test/bdd/step-definitions/extension-harness.steps.ts` to track
  `effectiveFlavor` separately from `languageId`.
- Implement steps for `docs/bdd/features/ofmarkdown-language-mode.feature`.
- Implement steps for `docs/bdd/features/markdown-flavor-dialects.feature`.
- Add CI/file-presence verification for flavor test layers.
- Add dated validation artifacts for research-to-profile review, product review,
  and validation run evidence.
- Add validation evidence redaction checks so committed artifacts do not contain
  user paths, vault content, `.fgignore`/`.fgattributes` contents, environment
  variables, API-like tokens, or raw server output with document content.
- Add the host-boundary validation artifact path and require later dialect
  phases to fill platform/conversion false-local-resolution evidence before
  they claim LSP-surface validation.
- Add negative cross-flavor fixture evidence proving inactive constructs do not
  receive active diagnostics, completions, navigation, hover, semantic tokens,
  or rename edits.
- Update test matrix and test index with implemented evidence.

### Out of Scope

- New server parser behavior beyond Phase 20 gates.
- VS Code host UI automation, which belongs to Phase E17.
- E17 documentSelector, activation, package-target, Marketplace, and host-test
  proof. Phase 21 may reference those requirements only to keep the evidence
  boundary explicit.

## Acceptance

- `bun run bdd` executes the Markdown flavor features without stale
  `ofmarkdown` simulations.
- The default BDD gate includes both flavor feature files.
- Validation can trace every displayed flavor to research or `ofm-spec`.
- Validation evidence names the reviewer or command, commit, date, commands run,
  and links to output for every artifact.
- Validation evidence is sanitized according to
  [[docs/test/markdown-flavor-validation-spec]] before commit.
- Validation artifact planning includes `docs/test/evidence/` paths for
  research trace, product review, validation run, and host-boundary review.
- The matrix shows honest passing/failing status after implementation.

## Gate Verification

```bash
bun run bdd
bun test src/test/ci-workflow.test.ts
bun test src/
bun run typecheck
bun run lint
bun run lint:docs
bun run build
```

Phase 21 is a root/server PR release-readiness gate: it proves the flavor test
layers and validation evidence are complete before release work consumes them.
It is not a platform package gate unless the implementation changes publishing,
binary, extension, or platform packaging workflows.

Legacy `ofmarkdown` feature filenames are historical containers only. Current
Phase 21 assertions must prove `.md` documents remain in VS Code's built-in
`markdown` language mode. Real VS Code host proof for documentSelector,
activation events, `.fgattributes` persistence, `.fgignore` inactive state,
host logs, stale `ofmarkdown` host test retirement, Marketplace proof, and
package-target checks belongs to Phase E17 and `extension/docs/tests/**`.

## Tickets

Ticket index: [[docs/plans/phase-21-markdown-flavor-bdd-validation/index]]

## Related

- [[docs/test/markdown-flavor-e2e-spec]]
- [[docs/test/markdown-flavor-verification-spec]]
- [[docs/test/markdown-flavor-validation-spec]]
- [[docs/gaps/markdown-flavor-gap-analysis]]
