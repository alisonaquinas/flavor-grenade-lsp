---
title: Cross-Cutting Roadmap Traceability Gap Analysis
tags: [audits, roadmap, traceability, markdown-flavor]
date: 2026-05-13
---

# Cross-Cutting Roadmap Traceability Gap Analysis

## Scope

Audit of pending roadmap work only: Phase 18 (`in-progress`), Phases 19-34
(`planned`), and Phases E15-E17 (`planned`). Completed phases were treated as
historical evidence and not retconned.

Focus areas:

- roadmap-to-requirement traceability from pending phases and tickets;
- requirement-to-test traceability across unit, integration, e2e, BDD,
  verification, validation, and DDD artifacts;
- operational chores for phase execution, docs lint, link validation, CI gates,
  and evidence updates;
- stale `ofmarkdown` language-mode assumptions in pending work.

## Source Files Reviewed

- [docs/roadmap.md](../roadmap.md)
- [docs/plans/phase-18-security-hardening-audit.md](../plans/phase-18-security-hardening-audit.md)
- [docs/plans/phase-19-markdown-flavor-model-profiles.md](../plans/phase-19-markdown-flavor-model-profiles.md)
- [docs/plans/phase-20-markdown-flavor-server-propagation.md](../plans/phase-20-markdown-flavor-server-propagation.md)
- [docs/plans/phase-21-markdown-flavor-bdd-validation.md](../plans/phase-21-markdown-flavor-bdd-validation.md)
- [docs/plans/phase-22-original-markdown-language-support.md](../plans/phase-22-original-markdown-language-support.md) through [docs/plans/phase-34-stack-overflow-markdown-language-support.md](../plans/phase-34-stack-overflow-markdown-language-support.md)
- [docs/plans/phase-E15-markdown-flavor-selector-settings.md](../plans/phase-E15-markdown-flavor-selector-settings.md)
- [docs/plans/phase-E16-flavor-scoped-contributions-marketplace.md](../plans/phase-E16-flavor-scoped-contributions-marketplace.md)
- [docs/plans/phase-E17-extension-flavor-host-verification.md](../plans/phase-E17-extension-flavor-host-verification.md)
- Pending ticket indexes and task/chore/feature tickets under matching `docs/plans/**/`
- [docs/requirements/ofmarkdown-language-mode.md](../requirements/ofmarkdown-language-mode.md)
- [docs/requirements/functional/markdown-flavor-lsp.md](../requirements/functional/markdown-flavor-lsp.md)
- [docs/requirements/functional/vscode-extension-parity.md](../requirements/functional/vscode-extension-parity.md)
- [docs/requirements/ci-cd.md](../requirements/ci-cd.md)
- [docs/requirements/development-process.md](../requirements/development-process.md)
- [docs/test/matrix.md](../test/matrix.md), [docs/test/index.md](../test/index.md), and `docs/test/markdown-flavor-*.md`
- [extension/docs/tests/matrix.md](../../extension/docs/tests/matrix.md), [extension/docs/tests/index.md](../../extension/docs/tests/index.md), and `extension/docs/tests/markdown-flavor-*.md`
- [docs/bdd/features/ofmarkdown-language-mode.feature](../bdd/features/ofmarkdown-language-mode.feature)
- [docs/bdd/features/markdown-flavor-dialects.feature](../bdd/features/markdown-flavor-dialects.feature)
- [docs/ddd/bounded-contexts.md](../ddd/bounded-contexts.md)
- [docs/ddd/config/domain-model.md](../ddd/config/domain-model.md)
- [docs/ddd/document-lifecycle/domain-model.md](../ddd/document-lifecycle/domain-model.md)
- [extension/docs/ddd/editor-client-parity-model.md](../../extension/docs/ddd/editor-client-parity-model.md)
- [docs/gaps/markdown-flavor-gap-analysis.md](../gaps/markdown-flavor-gap-analysis.md)
- [extension/docs/gaps/markdown-flavor-gap-analysis.md](../../extension/docs/gaps/markdown-flavor-gap-analysis.md)

## Executive Summary

Pending roadmap traceability is strongest for the extension selector phases
E15-E17 and for Phase 21 validation. It is weakest for server-side dialect
phases 22-34: those phases point mostly to selector-era requirements
(`Extension.MarkdownFlavor.*`) and broad test specs, but do not consistently
trace to the newer server requirements in
[docs/requirements/functional/markdown-flavor-lsp.md](../requirements/functional/markdown-flavor-lsp.md).

The roadmap correctly avoids relying on the old `ofmarkdown` promotion model in
new E15-E17 text, but some evidence layers still use the historical filename
`ofmarkdown-language-mode.feature`; Phase 21 must keep that as a legacy test
container only and assert `languageId = markdown`.

Main risk: a pending dialect phase can be marked complete by adding profile and
some parser tests while missing required LSP surfaces such as hover, rename,
host-boundary classification, semantic tokens, or evidence updates.

## Gap Table

| ID | Severity | Requirement tag(s) | Roadmap phase/ticket evidence | Gap | Impact | Recommended remediation |
|---|---|---|---|---|---|---|
| AUD-X-001 | Critical | `FlavorLSP.Profile.SignatureCoverage`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Navigation.ProfileResolution`, `FlavorLSP.Hover.ProfileMetadata`, `FlavorLSP.SemanticTokens.ProfileTokens`, `FlavorLSP.Rename.ProfileSafety`, `FlavorLSP.HostBoundary.NonLocalReferences` | Phases 22-34 link `Extension.MarkdownFlavor.DialectProfiles`, `Extension.MarkdownFlavor.ServerPropagation`, and broad test specs; their task tickets use generic "parser/profile", "diagnostics and LSP", and "tests and validation evidence" buckets. | Server dialect phases do not explicitly link the `FlavorLSP.*` requirements they are meant to satisfy. | Phase closure can miss required LSP surfaces or host-boundary safety while still appearing requirement-linked. | Add `FlavorLSP.*` rows to every Phase 22-34 plan and relevant tickets. Make the LSP applicability matrix a required checklist in each closeout chore. |
| AUD-X-002 | High | `FlavorLSP.Hover.ProfileMetadata`, `FlavorLSP.Rename.ProfileSafety`, `FlavorLSP.HostBoundary.NonLocalReferences` | [docs/plans/markdown-flavor-lsp-applicability-matrix.md](../plans/markdown-flavor-lsp-applicability-matrix.md) requires hover and host-boundary behavior; Phase 22-34 plan scopes often list diagnostics/completions/navigation/folding/tokens but omit rename and often compress hover/boundary work. | LSP surface coverage is not uniform between the applicability matrix, requirements, and phase scopes. | Dialect work may implement parser/diagnostic basics but omit unsafe rename rejection or false local-resolution prevention. | For each dialect phase, add explicit acceptance rows: hover, rename or explicit N/A, host-boundary classification, and deferred lookup disposition. |
| AUD-X-003 | High | `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Profile.SignatureCoverage`, `Process.TestIndex.Matrix` | Phase 19 covers `Extension.MarkdownFlavor.DialectProfiles`; Phase 22-34 each also plan profile semantics. | Profile ownership is split. Phase 19 may create source-backed profiles, while later dialect phases may mutate profile semantics without a required trace update back to the registry tests and matrices. | Profile drift: selector/profile evidence can pass while later dialect implementation changes active/inert surfaces without updating traceability. | Add a recurring ticket/check in each Phase 22-34 closeout: update profile registry tests, feature page trace, [docs/test/matrix.md](../test/matrix.md), and validation evidence when profile surfaces change. |
| AUD-X-004 | High | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.ManualLanguageSafety`, `Extension.Tests.HostCoverage` | E15/E17 correctly require Markdown language preservation; Phase 21 rewrites BDD harness around effective flavor; test matrices still mark `ofmarkdown-language-mode.feature` and old host tests as failing/obsolete. | Legacy feature/test names remain valid as containers, but pending phase evidence can be misread as preserving `ofmarkdown` behavior unless every acceptance row states `languageId = markdown`. | Risk of retconning completed E6/E9 history or reintroducing language promotion as "coverage." | In Phase 21/E17 tickets, add a hard evidence rule: any legacy `ofmarkdown` file name is historical only; current assertions must prove no `.md` transition to `ofmarkdown`. |
| AUD-X-005 | Medium | `CICD.Markdown.DocsFolderLinting`, `CICD.Markdown.SourceLinting`, `CICD.Workflow.PRGate` | Phase 19-21 gates include `bun run lint:docs`; E15-E17 gates mostly run extension commands. Test matrices note docs lint and CI checks need update. | Extension phases that edit `extension/docs/**`, README, Marketplace docs, and package evidence do not consistently include root docs lint or root CI verification in phase gates. | Docs or extension docs can fail repository lint/link expectations after phase-local extension tests pass. | Add `bun run lint:docs` and root CI/file-presence verification to E16 and E17 closeout gates; document whether E15 needs it if only package/source changes occur. |
| AUD-X-006 | Medium | `Process.TestIndex.Matrix`, `Extension.MarkdownFlavor.*`, `FlavorLSP.*` | Phase 21 requires matrix updates; E17 requires root and extension matrix updates; Phase 22-34 test tickets mention evidence but not always root/extension index maintenance. | Matrix/index update obligations are present but uneven across later dialect tickets. | New tests may land without trace rows, weakening requirement-to-test coverage. | Add a standard checklist item to every pending implementation and closeout ticket: update [docs/test/index.md](../test/index.md), [docs/test/matrix.md](../test/matrix.md), and extension-local matrices when applicable. |
| AUD-X-007 | Medium | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.Refresh`, `FlavorLSP.Parser.ProfileDispatch` | Phase 20 depends on Phase 19; E15 depends on Phase 20; Phase 21 depends on Phase 20/E15. Phase 22 says Phase 21 is not a dependency. | Server dialect phases can proceed after Phase 20 without Phase 21 validation, but their BDD/validation rows still reference specs whose steps/evidence may not be implemented until Phase 21. | Dialect PRs may claim BDD/validation trace against non-executable or stale evidence if Phase 21 slips. | Split evidence labels: Phase 22-34 may depend on Phase 20 for server work, but any "BDD/validation complete" acceptance must depend on Phase 21 artifacts or provide phase-local replacement evidence. |
| AUD-X-008 | Medium | `CICD.Workflow.PRGate`, `Extension.Tests.HostCoverage`, `Extension.Marketplace.AssetPackaging` | E17 gate runs `npm test`, `npm run test:host`, `npm run compile`; extension test index requires `npm run verify:marketplace-assets` and `npm run verify:package-targets`; E16 includes marketplace assets but not package targets. | Package-target verification is not consistently attached to the extension flavor host validation phase even though validation specs require packaged VSIX payload evidence. | Release readiness may miss wrong-platform or missing-server VSIX regressions after selector/contribution changes. | Add `npm run verify:package-targets` to E17 verification or explicitly keep it in a linked release gate with evidence path. |
| AUD-X-009 | Low | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles` | Phase 19 and E15 link to required coverage; Phase 22-34 each link individual research sources. | Roadmap does not provide a single roll-up table mapping all 14 selector ids to owning phase, profile source, planned tests, and validation artifact. | Auditors must infer coverage across roadmap, plans, research, and tests. | Add a compact roll-up table to Phase 19 or roadmap Phase 19-34 section: flavor id, owning phase, source doc, unit/integration/BDD/validation evidence. |
| AUD-X-010 | Low | `Process.TestIndex.Matrix`, docs link integrity requirements by CI convention | Phase gates mention docs lint, but no pending phase explicitly names link validation for new wiki/relative links. | Link validity is implied by lint/CI, not called out in closeout chores. | Broken cross-doc trace links can survive if docs lint does not catch every wiki/relative anchor. | Add "run docs lint/link validation or record unavailable" to Phase 21, E17, and Phase 22-34 closeout chores. |

## Notes

- No completed phase needs text changes for this audit. Completed `ofmarkdown`
  language-mode phases can remain as history.
- Pending work should use "Markdown flavor selector" and "effective flavor" as
  current concepts; use `ofmarkdown` only when referencing legacy file names,
  historical evidence, or Obsidian-flavor syntax.
