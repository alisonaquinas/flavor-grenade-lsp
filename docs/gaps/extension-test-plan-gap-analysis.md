---
title: Extension Test Plan Gap Analysis
tags: [audits, extension, tests, markdown-flavor]
updated: 2026-05-13
---

# Extension Test Plan Gap Analysis

## Scope

This audit evaluates `extension/docs/tests/**` against the current extension and
root requirements, BDD/DDD mirrors, and pending extension roadmap work for the
Markdown flavor selector model.

In scope:

- Unit, integration, e2e, verification, validation, BDD, and DDD test planning.
- Selector behavior, default VS Code `markdown` mode preservation, all required
  flavor ids, Auto Detect, override persistence, server propagation,
  manual-language safety, flavor-scoped contributions, Marketplace proof,
  package-target verification, and host verification.
- Pending phases E15-E17 and historical E6-E14 stale `ofmarkdown` references.

Out of scope:

- Implementing tests.
- Verifying current source implementation.
- Editing files outside `docs/audits/`.

## Source Files Reviewed

- `extension/docs/tests/index.md`
- `extension/docs/tests/matrix.md`
- `extension/docs/tests/markdown-flavor-unit-spec.md`
- `extension/docs/tests/markdown-flavor-integration-spec.md`
- `extension/docs/tests/markdown-flavor-e2e-spec.md`
- `extension/docs/tests/markdown-flavor-verification-spec.md`
- `extension/docs/tests/markdown-flavor-validation-spec.md`
- `docs/requirements/ofmarkdown-language-mode.md`
- `docs/requirements/functional/vscode-extension-parity.md`
- `extension/docs/requirements/vscode-extension-parity.md`
- `extension/docs/requirements/functional/vscode-extension-parity.md`
- `extension/docs/requirements/user/index.md`
- `extension/docs/requirements/user/markdown-flavors.md`
- `extension/docs/bdd/ofmarkdown-language-mode.feature`
- `extension/docs/bdd/vscode-extension-parity.feature`
- `extension/docs/ddd/editor-client-parity-model.md`
- `docs/roadmap.md`
- `docs/plans/phase-E6-ofmarkdown-language-mode.md`
- `docs/plans/phase-E7-activation-precision.md`
- `docs/plans/phase-E8-command-bridges-native-navigation.md`
- `docs/plans/phase-E9-extension-host-regression-harness.md`
- `docs/plans/phase-E10-status-ux-troubleshooting.md`
- `docs/plans/phase-E11-marketplace-evidence-packaging-proof.md`
- `docs/plans/phase-E12-ofmarkdown-editor-contributions.md`
- `docs/plans/phase-E13-workspace-environment-modes.md`
- `docs/plans/phase-E14-membership-refresh-compatibility-guardrails.md`
- `docs/plans/phase-E15-markdown-flavor-selector-settings.md`
- `docs/plans/phase-E15-markdown-flavor-selector-settings/**`
- `docs/plans/phase-E16-flavor-scoped-contributions-marketplace.md`
- `docs/plans/phase-E16-flavor-scoped-contributions-marketplace/**`
- `docs/plans/phase-E17-extension-flavor-host-verification.md`
- `docs/plans/phase-E17-extension-flavor-host-verification/**`
- `docs/test/index.md`
- `docs/test/matrix.md`

## Executive Summary

The extension-local test plan is mostly aligned with the new Markdown flavor
selector requirements. It correctly treats `ofmarkdown` language-mode promotion
as retired, defines planned coverage across unit, integration, e2e,
verification, and validation layers, and maps most pending work to E15-E17.

Main gaps:

- Test specs do not define a dedicated current `LanguageClient`
  `documentSelector`/activation guard spec, even though requirements and phase
  tickets require rejecting `ofmarkdown`.
- Phase tickets reference undefined or conflicting spec IDs: `EXT-MF-U-014` is
  not in the unit spec, and `EXT-MF-I-006` is reused for VSIX asset proof while
  one E16 ticket uses it for activation/client selector coverage.
- Integration planning under-specifies real client-to-server propagation and
  server refresh observability; most propagation coverage is currently unit or
  BDD-shaped.
- E2E coverage does not explicitly test workspace fallback target persistence,
  invalid setting values, or file-backed selector availability across every
  required context named by the requirements.
- Verification docs say CI must include host tests, but historical E9 records a
  host-CI blocker. The new test plan lacks an explicit acceptable fallback or
  failing gate rule.
- Validation artifacts are planned but not assigned cleanly across E15, E16,
  and E17. Package-target validation evidence is listed but not represented as
  a validation test case.

## Gap Table

| ID | Affected requirement tags | Existing test evidence | Roadmap evidence | Gap | Impact | Recommended remediation | Severity |
|---|---|---|---|---|---|---|---|
| AUD-ET-001 | `Extension.Activation.MarkerEvents`, `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Refresh` | `markdown-flavor-integration-spec.md` only says startup gates must not require `onLanguage:ofmarkdown`; `markdown-flavor-unit-spec.md` stops at `EXT-MF-U-013`. | E15/TASK-300 references undefined `EXT-MF-U-014`; E16/TASK-305 requires `activationEvents` excludes `onLanguage:ofmarkdown` and `clientOptions.documentSelector` rejects `ofmarkdown`. | No canonical extension-local spec ID covers current activation events plus `LanguageClient.clientOptions.documentSelector` being file-backed `markdown` only. | Stale `ofmarkdown` selector or activation behavior can survive while the test matrix appears covered. | Add a defined spec such as `EXT-MF-U-014` or `EXT-MF-I-007` for manifest activation and client document selector. Update E15/TASK-300 and E16/TASK-305 to reference the same ID. | High |
| AUD-ET-002 | `Extension.Activation.MarkerEvents`, `Extension.Marketplace.AssetPackaging` | `EXT-MF-I-006` is defined as VSIX selector-proof asset packaging in `markdown-flavor-integration-spec.md`. | E16/TASK-305 also maps `EXT-MF-I-006` to activation-gate/client-selector coverage; E16/TASK-307 and TASK-309 map it to VSIX asset proof. | Spec ID collision/conflict. | Traceability can falsely mark activation and asset packaging covered by one unrelated test. | Reserve `EXT-MF-I-006` for VSIX asset proof and create a new activation/client-selector ID. Update all ticket references. | High |
| AUD-ET-003 | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.Refresh`, `Extension.Tests.HostCoverage` | Unit spec `EXT-MF-U-009/U-010`; integration spec only has `EXT-MF-I-004` for rebuild after selector override; BDD expects `workspace/didChangeConfiguration`. | E15 requires propagation using `workspace/didChangeConfiguration`; E17 depends on Phase 20 and wants host verification. | Integration/e2e specs do not require observing real client-to-server payloads across all required flavor ids in a spawned server or host boundary. | Selector UI could update and unit mocks could pass while real server analysis remains stale. | Add integration cases for actual `workspace/didChangeConfiguration` payload shape, effective flavor, open-document refresh, server-unavailable behavior, and all explicit ids. Cross-link to Phase 20. | High |
| AUD-ET-004 | `Extension.MarkdownFlavor.OverridePersistence`, `Extension.MarkdownFlavor.Selector` | Unit covers workspace, standalone, Auto clearing. E2E covers workspace setting and standalone user setting. BDD distinguishes workspace-folder and workspace fallback. | E15/TASK-302 explicitly requires workspace-folder/workspace/user targets. E17/TASK-310 says workspace/user but not workspace fallback. | E2E spec omits workspace fallback target and does not require proving Auto Detect clears the same target for all scopes. | VS Code configuration target bugs can pass host tests, especially multi-root or workspace-only cases. | Add e2e cases for workspace-folder, workspace fallback, standalone user target, and Auto Detect clearing the same target that received the explicit override. | Medium |
| AUD-ET-005 | `Extension.MarkdownFlavor.AutoDetection`, `Extension.MarkdownFlavor.RequiredCoverage` | Unit `EXT-MF-U-004` covers invalid configured values and every required id; e2e covers Obsidian, generic CommonMark, config fixture selecting flavors. | E15/TASK-303 requires `.flavor-grenade.toml`, workspace settings, membership fallback, invalid fallback, and precedence. | E2E/host spec does not require invalid setting fallback or precedence between explicit override, project config, workspace setting, marker, membership, and generic fallback. | Auto Detect can be correct in simple fixtures but wrong in mixed or invalid real workspaces. | Add a host or integration matrix for precedence and invalid values. Keep the exhaustive every-flavor resolution in unit tests, but require at least representative host coverage for precedence. | Medium |
| AUD-ET-006 | `Extension.MarkdownFlavor.Selector`, `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.ManualLanguageSafety` | E2E says enumerate every selector id and select each explicit flavor; manual-language e2e covers `plaintext` or `mdx`. | Requirements require selector availability in workspace-folder, workspace-only, vault, generic Markdown, and standalone file contexts; DDD says non-`markdown` ids are outside selector behavior. | E2E does not explicitly require selector inactive/absent behavior for non-file-backed, untitled, virtual, or unsupported contexts, nor all file-backed contexts named by parity requirements. | Selector can appear in unsupported contexts or disappear in valid contexts without a planned failure. | Expand selector host matrix to file-backed workspace folder, workspace-only, vault, generic, standalone, and non-`markdown` language ids. State whether untitled/virtual contexts are unsupported or manually verified under environment-mode tests. | Medium |
| AUD-ET-007 | `Extension.Contributions.FlavorScoped` | Contribution specs cover snippets, keybindings, language configuration, and generic isolation. | E16 requires snippets, keybindings, commands, optional theme examples, selector/context state, and Marketplace/troubleshooting docs. | Contribution test spec omits commands and optional theme/example scoping, even though requirements name them. | Flavor-specific commands or visuals can still affect generic Markdown while snippets/keybindings pass. | Add contribution test rows for command `when`/precondition scoping and optional theme/example contribution scoping, or explicitly mark absent contribution types as not applicable. | Medium |
| AUD-ET-008 | `Extension.Marketplace.OFMProof`, `Extension.Marketplace.AssetPackaging`, `Extension.Packaging.TargetBinaryValidation` | Verification covers `verify:marketplace-assets` and `verify:package-targets`; validation artifacts include package-target evidence but validation test cases only list `EXT-MF-VA-001` through `VA-004`. | E16/TASK-309 owns selector proof; E17/CHORE-114 runs marketplace and package-target checks. | Package-target validation evidence is listed as an artifact but lacks a validation case ID and owner. Marketplace proof is split between E16 and E17 without a single validation closeout row. | Release proof can be generated but not counted in validation signoff. | Add `EXT-MF-VA-005` for package-target/VSIX evidence and assign E16 selector proof plus E17 package closeout owners explicitly. | Medium |
| AUD-ET-009 | `Extension.Tests.HostCoverage`, `CICD.Workflow.PRGate`, `CICD.Workflow.BDDGate` | Verification spec says `.github/workflows/ci.yml` includes extension unit and host tests after flavor tests are added. | Historical E9 says root CI does not run Electron host and records a blocker; E17/TASK-311 requires CI verification detects missing host flavor suite. | No explicit rule resolves whether host tests must run in CI, may be locally required only, or may be represented by a documented blocker. | CI can look compliant on paper while host flavor behavior is only locally verified. | Update verification spec with a hard gate: CI runs host tests, or CI runs a detector that fails without documented host-test evidence and blocker. Tie to `src/test/ci-workflow.test.ts`. | High |
| AUD-ET-010 | `Extension.MarkdownFlavor.DialectProfiles`, `Extension.MarkdownFlavor.RequiredCoverage` | Extension validation spec has research review artifact; root matrix assigns dialect profile tests mostly to root server files. | Roadmap phases 19-34 own server profiles; E15/E17 consume the flavor id contract. | Extension-local specs do not clearly separate "extension selector accepts ids" from "server profiles implement behavior"; validation could require extension work to prove server semantics prematurely. | Phase E15/E17 may block on Phase 19-34 parser behavior rather than testing the extension contract boundary. | Split validation into extension contract review and server dialect-profile behavior review. Extension should verify IDs/labels/schema/protocol compatibility; server phases should verify profile semantics. | Medium |
| AUD-ET-011 | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.Contributions.FlavorScoped`, `Extension.MarkdownFlavor.Refresh` | Test matrix lists legacy tests to retire or rewrite. | E6, E9, E11, E12, and E14 historical plans still contain current-looking `ofmarkdown` gates, with some supersession notes. E17/TASK-313 retires obsolete host tests. | Historical stale-test references are identified, but no spec requires a repository-wide stale `ofmarkdown` expectation scan in test names, docs, package activation, and host waits. | New test plan can pass while stale expectations remain discoverable and confusing. | Add a verification row for stale expectation scanning: allowed historical docs only; current test specs, package activation, and host tests must not assert language promotion. | Medium |
| AUD-ET-012 | `Extension.Workspace.EnvironmentModes`, `Extension.MarkdownFlavor.ManualLanguageSafety`, `Extension.Packaging.TargetBinaryValidation` | Extension test index mentions restricted/virtual/remote modes only in verification/package context. | E13 requires restricted, virtual, local, WSL, SSH, Dev Container behavior; DDD says restricted and virtual workspaces do not spawn the server. | Pending E15-E17 flavor tests do not tie selector/Auto Detect/server propagation behavior to restricted or virtual workspace safety. | Flavor refresh could spawn or propagate in restricted/virtual contexts contrary to DDD invariants. | Add a narrow integration or verification case that flavor selector state does not cause server spawn/propagation in restricted or virtual workspaces; leave remote binary behavior to E13/E14 package tests. | Low |

## Top Findings

1. Fix the spec ID traceability bugs first: define the missing document-selector
   guard and stop reusing `EXT-MF-I-006` for two different purposes.
2. Strengthen propagation coverage beyond unit tests. The plan needs at least
   one real client/server or host-observed `workspace/didChangeConfiguration`
   path.
3. Make CI host coverage explicit. The current docs conflict with historical E9
   host-CI limitations.
4. Add e2e persistence cases for workspace fallback and same-scope Auto Detect
   clearing.
5. Add validation ownership for package-target evidence and stale `ofmarkdown`
   expectation scanning.
