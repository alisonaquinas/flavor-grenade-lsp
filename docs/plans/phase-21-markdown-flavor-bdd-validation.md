---
title: "Phase 21: Markdown Flavor BDD Verification And Validation"
phase: 21
status: planned
tags: [plans, markdown-flavor, bdd, validation]
aliases: [Phase 21, Markdown Flavor BDD Validation]
updated: 2026-05-13
---

# Phase 21: Markdown Flavor BDD Verification And Validation

| Field | Value |
|---|---|
| Phase | 21 |
| Title | Markdown Flavor BDD Verification And Validation |
| Status | planned |
| Gate | BDD, verification, and validation evidence execute against flavor state before release |
| Depends on | Phase 20, Phase E15 |

## Objective

Replace stale `ofmarkdown` BDD assumptions with flavor-state acceptance tests,
then wire the unit, integration, e2e, verification, and validation specs into
traceable PR and release-readiness gates. This phase validates the flavor model and selector; it
does not block server dialect implementation after Phase 20 propagation is
ready.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownLanguage.PreserveDefault]] | Assert language preservation in BDD |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]] | Assert every required selector/profile id |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Assert profile source and signature behavior |
| [[test/markdown-flavor-e2e-spec]] | Implement root BDD e2e scenarios |
| [[test/markdown-flavor-verification-spec]] | Verify CI and traceability gates |
| [[test/markdown-flavor-validation-spec]] | Add product validation evidence |
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
- Update test matrix and test index with implemented evidence.

### Out of Scope

- New server parser behavior beyond Phase 20 gates.
- VS Code host UI automation, which belongs to Phase E17.

## Acceptance

- `bun run bdd` executes the Markdown flavor features without stale
  `ofmarkdown` simulations.
- The default BDD gate includes both flavor feature files.
- Validation can trace every displayed flavor to research or `ofm-spec`.
- Validation evidence names the reviewer or command, commit, date, commands run,
  and links to output for every artifact.
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

## Tickets

Ticket index: [[plans/phase-21-markdown-flavor-bdd-validation/index]]

## Related

- [[test/markdown-flavor-e2e-spec]]
- [[test/markdown-flavor-verification-spec]]
- [[test/markdown-flavor-validation-spec]]
- [[gaps/markdown-flavor-gap-analysis]]
