---
title: Root Test Plan Gap Analysis
tags: [audit, test-plan, markdown-flavor]
updated: 2026-05-13
---

# Root Test Plan Gap Analysis

## Scope

This audit reviews root/server test planning against current requirements and
pending roadmap phases. It stays within repository documentation and focuses on
unit, integration, e2e, verification, validation, BDD, and DDD coverage for:

- `FlavorLSP.*` requirements.
- `Extension.MarkdownFlavor.*` requirements where root/server plans depend on
  them.
- Markdown flavor feature-set behavior planned for phases 19-34.

`docs/test/` exists and contains the root test index, matrix, and Markdown flavor
spec files. `docs/tests/` is not present in this repository at audit time.

## Source Files Reviewed

Primary test docs:

- `docs/test/index.md`
- `docs/test/matrix.md`
- `docs/test/markdown-flavor-unit-spec.md`
- `docs/test/markdown-flavor-integration-spec.md`
- `docs/test/markdown-flavor-e2e-spec.md`
- `docs/test/markdown-flavor-verification-spec.md`
- `docs/test/markdown-flavor-validation-spec.md`

Requirements and acceptance docs:

- `docs/requirements/index.md`
- `docs/requirements/functional/ofmarkdown-language-mode.md`
- `docs/requirements/functional/markdown-flavor-lsp.md`
- `docs/requirements/functional/ofmarkdown-parity.md`
- `docs/requirements/functional/vscode-extension-parity.md`
- `docs/requirements/user/markdown-flavors.md`
- `docs/bdd/features/ofmarkdown-language-mode.feature`
- `docs/bdd/features/markdown-flavor-dialects.feature`
- `docs/bdd/features/vscode-extension.feature`
- `docs/bdd/features/vscode-extension-parity.feature`
- `docs/ddd/bounded-contexts.md`
- `docs/ddd/config/domain-model.md`
- `docs/ddd/document-lifecycle/domain-model.md`
- `docs/ddd/editor-client/domain-model.md`
- `docs/ddd/lsp-protocol/domain-model.md`
- `docs/ddd/reference-resolution/domain-model.md`
- `docs/ddd/ubiquitous-language.md`
- `docs/ddd/vault/domain-model.md`

Roadmap and phase plans:

- `docs/roadmap.md`
- `docs/plans/markdown-flavor-lsp-applicability-matrix.md`
- `docs/plans/phase-18-security-hardening-audit.md`
- `docs/plans/phase-19-markdown-flavor-model-profiles.md`
- `docs/plans/phase-20-markdown-flavor-server-propagation.md`
- `docs/plans/phase-21-markdown-flavor-bdd-validation.md`
- `docs/plans/phase-22-original-markdown-language-support.md`
- `docs/plans/phase-23-commonmark-language-support.md`
- `docs/plans/phase-24-obsidian-flavor-language-support.md`
- `docs/plans/phase-25-gfm-language-support.md`
- `docs/plans/phase-26-glfm-language-support.md`
- `docs/plans/phase-27-pandoc-markdown-language-support.md`
- `docs/plans/phase-28-multimarkdown-language-support.md`
- `docs/plans/phase-29-mdx-flavor-language-support.md`
- `docs/plans/phase-30-kramdown-language-support.md`
- `docs/plans/phase-31-markdown-extra-language-support.md`
- `docs/plans/phase-32-r-markdown-language-support.md`
- `docs/plans/phase-33-reddit-markdown-language-support.md`
- `docs/plans/phase-34-stack-overflow-markdown-language-support.md`

## Executive Summary

The root test plan has a real Markdown flavor scaffold, but it is still centered
on `Extension.MarkdownFlavor.*` and broad `MF-*` specs. The newer
`FlavorLSP.*` server requirements are defined in requirements and BDD, but are
not represented as first-class rows in `docs/test/matrix.md` and are not fully
assigned to phase 22-34 implementation evidence.

The biggest gap is executable granularity. `docs/test/markdown-flavor-unit-spec.md`
has one shared parser-analysis target for all dialects, while
`docs/requirements/functional/markdown-flavor-lsp.md` requires profile-specific
behavior across parser dispatch, diagnostics, completion, navigation, hover,
semantic tokens, rename, and host boundaries. The applicability matrix says
each phase must satisfy or defer every surface, but the phase plans only link to
the broad unit and validation specs.

BDD is useful but currently doubles as planned contract text. The BDD feature
explicitly says the harness must later replace planned registry and LSP behavior
with product data, and `docs/test/index.md` marks related step definitions as
needing updates. That is honest, but it means current BDD evidence is not enough
for release readiness.

Validation artifacts named by the validation spec do not exist yet under
`docs/test/evidence/`. That is acceptable for planned phases, but the plan should
make those artifacts mandatory owners of phase 21 and later flavor phase
closures.

## Gap Table

| ID | Affected requirement tags | Existing test evidence | Roadmap evidence | Gap | Impact | Recommended remediation | Severity |
|---|---|---|---|---|---|---|---|
| AUD-T-001 | `FlavorLSP.Profile.SignatureCoverage`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Navigation.ProfileResolution`, `FlavorLSP.Hover.ProfileMetadata`, `FlavorLSP.SemanticTokens.ProfileTokens`, `FlavorLSP.Rename.ProfileSafety`, `FlavorLSP.HostBoundary.NonLocalReferences` | BDD tags exist in `docs/bdd/features/markdown-flavor-dialects.feature`; `docs/test/matrix.md` has no dedicated `FlavorLSP.*` rows. | Roadmap phases 22-34 and `docs/plans/markdown-flavor-lsp-applicability-matrix.md` require these surfaces per flavor. | Matrix traceability is missing for the server-specific requirement family. | A phase can appear covered through broad Markdown flavor specs while leaving individual LSP surfaces unowned. | Add one matrix row per `FlavorLSP.*` tag, with planned/implemented evidence, phase owner, and status. Link each to phase 20 or phase 22-34 as appropriate. | High |
| AUD-T-002 | `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Navigation.ProfileResolution`, `FlavorLSP.Hover.ProfileMetadata`, `FlavorLSP.SemanticTokens.ProfileTokens`, `FlavorLSP.Rename.ProfileSafety` | `MF-U-010` through `MF-U-022` use one shared `markdown-flavor-parser-analysis.test.ts` target; `MF-I-*` only covers propagation and refresh. | Phase 22-34 plans mention these surfaces but generally trace only to `docs/test/markdown-flavor-unit-spec` and validation. | Unit specs do not define per-surface fixture matrices for diagnostics, completion, navigation, hover, semantic tokens, and rename. | Flavor support could ship with parser recognition but weak LSP behavior coverage. | Split root specs into explicit tables: `MF-DIAG-*`, `MF-COMP-*`, `MF-NAV-*`, `MF-HOVER-*`, `MF-ST-*`, and `MF-REN-*`, or add columns per surface and flavor with required/deferred status. | High |
| AUD-T-003 | `FlavorLSP.HostBoundary.NonLocalReferences`, `Security.Vault.PathConfinement`, `Extension.MarkdownFlavor.DialectProfiles` | BDD has a host-boundary scenario outline. Validation spec requires research trace artifacts. No `docs/test/evidence/` artifacts exist. | Phase 21 requires validation artifacts; phases 26, 29, 33, and 34 have explicit live-platform lookup deferrals. | Host/conversion boundaries are planned mostly as acceptance prose, not mandatory fixture evidence per platform flavor. | False local resolution, broken-link diagnostics, or rename edits may leak into host-specific references. | Require each platform flavor phase to add a host-boundary fixture file and a validation note citing the applicability matrix and deferred lookup disposition. | High |
| AUD-T-004 | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.Refresh`, `FlavorLSP.Parser.ProfileDispatch` | `MF-I-001` through `MF-I-005` cover spawned server config changes and effective flavor state. | Phase 20 owns propagation and initial gates for Original, CommonMark, and Obsidian. | Integration spec stops at propagation and one wiki-link gating example; it does not require each LSP handler to consume effective flavor after refresh. | Server may accept flavor changes but keep stale or flavor-blind completion, diagnostics, semantic token, hover, or navigation caches. | Extend `markdown-flavor-integration-spec.md` with handler-level spawned-server cases for diagnostics, completion, navigation/documentLink, hover, semantic tokens, folding, and rename after flavor changes. | High |
| AUD-T-005 | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Profile.SignatureCoverage` | `MF-U-001` through `MF-U-005` define profile registry checks; `MF-U-009` checks shared contract drift. | Phase 19 owns canonical flavor model and profiles. | `MF-U-009` names a "shared flavor contract fixture" but no concrete target path or owner is listed in the phase plan. | Client/server enum drift could remain theoretical until an implementation chooses a location. | Name the exact fixture path in `docs/test/markdown-flavor-unit-spec.md` and phase 19 tickets, and require it to compare server ids, extension ids, package schema, and selector ids. | Medium |
| AUD-T-006 | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.ManualLanguageSafety`, `Extension.Tests.HostCoverage` | Root test index marks legacy extension language-mode and host tests as obsolete or needing replacement; root E2E spec points to extension docs for VS Code host E2E. | Roadmap E15-E17 own selector, contribution, and host verification; phase 21 explicitly excludes VS Code host UI automation. | Root/server plans depend on extension behavior but do not clearly separate what phase 21 proves from what E17 must prove. | Release readiness could be overstated if root BDD passes while real VS Code selector and language-id safety remain unimplemented. | Add a "root vs extension evidence boundary" section to `docs/test/markdown-flavor-e2e-spec.md` and matrix rows, marking phase 21 as acceptance/BDD only and E17 as real VS Code host proof. | Medium |
| AUD-T-007 | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles` | `docs/test/markdown-flavor-validation-spec.md` names three required artifacts; `docs/test/evidence/` is absent. | Phase 21 plans validation artifacts and research-to-profile review. | Validation artifact paths are planned but not present, and the matrix does not list them as blocked/failing concrete evidence. | Future phase closure may cite the validation spec without producing dated review evidence. | Add planned rows to `docs/test/matrix.md` for each validation artifact path with phase 21 owner and failing/planned status until files exist. | Medium |
| AUD-T-008 | `FlavorLSP.Profile.SignatureCoverage`, all phase 22-34 flavor authoring requirements | `docs/plans/markdown-flavor-lsp-applicability-matrix.md` defines required surfaces and deferral rules. | Phase 22-34 plans link broad unit and validation specs, but not always the applicability matrix or per-surface evidence. | Applicability matrix is not consistently enforced as a close gate in each flavor phase plan. | A flavor phase can close with unreviewed surface omissions. | Add the applicability matrix to every phase 22-34 requirement trace and acceptance section. Require a phase-local "surface disposition" table before closure. | Medium |
| AUD-T-009 | `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.SemanticTokens.ProfileTokens`, `FlavorLSP.Navigation.ProfileResolution` | DDD docs define `ParseContext`, `EffectiveMarkdownFlavor`, `MarkdownIndex`, and dialect projections. Test specs do not map these DDD invariants to tests. | Phase 20 introduces flavor-bearing parse/analysis context; phases 22-34 add dialect behavior. | DDD invariants are not represented as DDD or model-level verification rows. | Domain ownership rules can regress even if external behavior tests pass narrowly. | Add DDD conformance tests or static/model tests for: BC4 owns effective flavor, BC2 consumes only `ParseContext`, and BC5 validates but does not store effective flavor. | Medium |
| AUD-T-010 | `CICD.Workflow.BDDGate`, `Extension.Tests.HostCoverage`, `Extension.MarkdownFlavor.*` | Verification spec requires CI and cucumber gates; test index marks BDD flavor step definitions as needing updates. | Phase 21 owns verification and BDD rewiring. | Verification spec says gates should include flavor features, but current docs do not identify which gate fails if planned root flavor spec files are removed after implementation. | Test-plan files can drift from CI without an obvious failure. | In phase 21, add explicit CI guard assertions for all root flavor spec files, all flavor BDD feature files, and the future `docs/test/evidence/*` artifacts. | Medium |
| AUD-T-011 | `FlavorLSP.Hover.ProfileMetadata`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Diagnostics.ProfileRules` | BDD scenario examples use broad strings such as "GFM extensions and host-specific refs" and "table snippets and task-list markers". | Phase plans for 25-34 state feature categories but not exact expected messages/candidate labels/diagnostic codes. | Expected outputs are too coarse for precise test implementation. | Tests may pass on vague assertions that do not prove user-visible LSP behavior. | For each flavor phase, require exact diagnostic codes or categories, completion item kinds/labels, hover boundary text class, and semantic token classes in the test spec. | Medium |
| AUD-T-012 | `Extension.MarkdownFlavor.AutoDetection`, `Extension.MarkdownFlavor.ServerPropagation`, `FlavorLSP.Parser.ProfileDispatch` | Existing server membership tests are reusable evidence, but root specs also introduce new effective flavor cascade expectations. | Phase 20 says explicit override, workspace config, vault marker, and CommonMark fallback are in scope. DDD config gives cascade order. | The cascade precedence is split across requirements, DDD, and `MF-I-005`; no table enumerates all precedence permutations and invalid-value cases. | Auto detection can be implemented partially or inconsistently between config, vault, and LSP paths. | Add a cascade truth table to `markdown-flavor-unit-spec.md` and `markdown-flavor-integration-spec.md`, covering VS Code override, workspace setting, `.flavor-grenade.toml`, `.obsidian/`, single-file mode, invalid values, and reset to `auto`. | Medium |

## Top Findings

1. `FlavorLSP.*` requirements need first-class matrix rows and phase ownership.
2. Phase 22-34 test plans need per-flavor, per-LSP-surface fixture matrices, not
   only broad parser-analysis specs.
3. BDD currently captures planned contracts; it must be replaced with product
   state and product data before it can count as passing release evidence.
4. Validation artifacts are named but absent. That is honest for planned work,
   but phase 21 should make them explicit failing/planned evidence rows.
5. The root/extension boundary needs clearer wording so phase 21 BDD is not
   mistaken for E17 VS Code host proof.
