---
title: Extension Roadmap Requirements Gap Analysis
tags: [audit, extension, roadmap, markdown-flavor]
updated: 2026-05-13
---

# Extension Roadmap Requirements Gap Analysis

## Scope

This audit compares pending extension roadmap phases E15-E17 against current
extension/root requirements for Markdown flavor selection, default Markdown
language mode, required flavor coverage, auto detection, override scope, server
propagation, manual language safety, flavor-scoped contributions, Marketplace
proof, and host verification.

## Source Files Reviewed

- [[docs/roadmap]]
- [[docs/plans/phase-E15-markdown-flavor-selector-settings]]
- [[docs/plans/phase-E16-flavor-scoped-contributions-marketplace]]
- [[docs/plans/phase-E17-extension-flavor-host-verification]]
- [[docs/plans/phase-E6-ofmarkdown-language-mode]]
- [[docs/plans/phase-E7-activation-precision]]
- [[docs/plans/phase-E9-extension-host-regression-harness]]
- [[docs/plans/phase-E11-marketplace-evidence-packaging-proof]]
- [[docs/plans/phase-E12-ofmarkdown-editor-contributions]]
- [[docs/plans/phase-E14-membership-refresh-compatibility-guardrails]]
- [[docs/requirements/ofmarkdown-language-mode]]
- [[docs/requirements/functional/vscode-extension-parity]]
- [extension/docs/requirements/functional/vscode-extension-parity.md](../../extension/docs/requirements/functional/vscode-extension-parity.md)
- [extension/docs/requirements/user/markdown-flavors.md](../../extension/docs/requirements/user/markdown-flavors.md)
- [extension/docs/features/activation-behavior.md](../../extension/docs/features/activation-behavior.md)
- [extension/docs/features/vscode-extension-parity.md](../../extension/docs/features/vscode-extension-parity.md)
- [extension/docs/bdd/ofmarkdown-language-mode.feature](../../extension/docs/bdd/ofmarkdown-language-mode.feature)
- [extension/docs/bdd/vscode-extension-parity.feature](../../extension/docs/bdd/vscode-extension-parity.feature)
- [extension/docs/tests/index.md](../../extension/docs/tests/index.md)
- [extension/docs/tests/matrix.md](../../extension/docs/tests/matrix.md)
- [extension/docs/tests/markdown-flavor-unit-spec.md](../../extension/docs/tests/markdown-flavor-unit-spec.md)
- [extension/docs/tests/markdown-flavor-integration-spec.md](../../extension/docs/tests/markdown-flavor-integration-spec.md)
- [extension/docs/tests/markdown-flavor-e2e-spec.md](../../extension/docs/tests/markdown-flavor-e2e-spec.md)
- [extension/docs/tests/markdown-flavor-verification-spec.md](../../extension/docs/tests/markdown-flavor-verification-spec.md)
- [extension/docs/tests/markdown-flavor-validation-spec.md](../../extension/docs/tests/markdown-flavor-validation-spec.md)

## Executive Summary

E15-E17 cover the core requirements: `.md` stays `markdown`, flavor moves to a
separate selector, all 14 selector choices are planned, overrides have scoped
settings behavior, manual non-`markdown` language selections are protected,
`ofmarkdown` contribution and activation assumptions are retired, Marketplace
proof is retargeted, and host verification is planned.

The remaining gaps are mostly precision gaps, not missing whole phases. The
highest-risk item is the server propagation contract: E15 says to send
`workspace/didChangeConfiguration` with selected and effective flavor, but does
not pin a multi-root/resource-aware payload shape. There is also an ownership
gap around extension-visible dialect-profile evidence, an E15/E16 gate-order
risk from stale tests, and missing selector-specific checks in restricted or
remote host environments.

## Gap Table

| ID | Severity | Requirement tag(s) | Roadmap phase/ticket evidence | Gap | Impact | Recommended remediation |
|---|---|---|---|---|---|---|
| AUD-E-001 | Critical | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.OverridePersistence`, `Extension.MarkdownFlavor.Refresh` | E15 and [[docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-304]] require `workspace/didChangeConfiguration` carrying `flavorGrenade.markdownFlavor` plus resolved effective flavor; [[docs/plans/phase-E15-markdown-flavor-selector-settings/TASK-302]] covers multi-root settings writes. | The roadmap does not define the exact server payload shape for resource-specific effective flavor in multi-root workspaces, standalone files, or multiple open documents with different effective flavors. | Server may receive a global flavor while the extension UI has per-resource state, causing wrong diagnostics/completions after overrides. | Add a subtask or acceptance clause to TASK-304 that defines a resource-aware contract, e.g. selected setting plus effective flavor map keyed by workspace folder/document URI, matching Phase 20 server handling and tests. |
| AUD-E-002 | High | `Extension.MarkdownFlavor.DialectProfiles`, `Extension.MarkdownFlavor.RequiredCoverage` | E15/TASK-299 covers ids/schema; E17/TASK-312 records `markdown-flavor-research-review.md`; root Phase 19 owns profiles. | E15 requirement trace omits `DialectProfiles`, even though extension user requirements require displayed choices to map to source-backed profiles and validation spec EXT-MF-VA-004 depends on it. | The selector could ship complete ids/labels but drift from profile availability or research-backed labels. | Add explicit `Extension.MarkdownFlavor.DialectProfiles` trace to TASK-299 or TASK-314 and require the extension enum/schema test to compare against the Phase 19 profile registry or shared contract fixture. |
| AUD-E-003 | High | `Extension.MarkdownFlavor.AutoDetection`, `Extension.MarkdownFlavor.ServerPropagation` | E15/TASK-303 says `.flavor-grenade.toml` can resolve `auto` to each explicit flavor; TASK-304 sends effective flavor. | Ownership is ambiguous for reading/parsing `.flavor-grenade.toml` in the extension versus receiving project-config evidence from the server. | Duplicate config parsing or mismatched precedence could make selector labels disagree with server analysis. | Add a decision note to TASK-303: either extension parses only VS Code settings and marker signals while server returns project-config flavor evidence, or extension owns project config parsing with a shared parser/contract. |
| AUD-E-004 | High | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.Contributions.FlavorScoped`, `Extension.Tests.HostCoverage` | E15 gate runs `npm test`; E16 owns contribution-test rewrites; E17 owns host-test retirement. Historical E12/E14 tests still assert `ofmarkdown` scoping/promotion. | Gate order is unclear. E15 may fail `npm test` if stale contribution or language-mode tests remain, but those rewrites are assigned to later phases. | Implementers may either overreach E15 scope or leave the phase unverifiable. | Split E15 verification into exact unit files it owns, or move stale unit test rewrites that block `npm test` into E15. Keep host retirement in E17 if it is only under `npm run test:host`. |
| AUD-E-005 | Medium | `Extension.Workspace.EnvironmentModes`, `Extension.Activation.MarkerEvents`, `Extension.MarkdownFlavor.Selector` | E13 previously verified restricted/virtual/remote behavior; E16/TASK-305 adds selector command activation; E17 verifies normal host selector flows. | No E15-E17 ticket explicitly verifies selector command behavior in restricted, virtual, WSL, SSH, or Dev Container modes. | A selector command could start the server or write settings in a host mode where E13 expected disabled or constrained behavior. | Add E17 or E16 acceptance for environment-mode regression: selector command can open UI where safe, but unsupported modes must not spawn the server and must show disabled/error status consistently. |
| AUD-E-006 | Medium | `Extension.Marketplace.OFMProof`, `Extension.Marketplace.AssetPackaging`, `Extension.Packaging.TargetBinaryValidation` | E16/TASK-307 and TASK-309 update selector proof and README/VSIX asset checks; E17/CHORE-114 runs package-target verification. | Marketplace selector proof and package-target validation are split across phases, but the validation artifact list includes `markdown-flavor-package-targets.md` while E17/TASK-312 does not mention creating or linking it. | Release evidence may prove selector visuals but omit the package-target artifact required by validation spec. | Add `markdown-flavor-package-targets.md` to TASK-312 or CHORE-114 Definition of Done and link it from the validation spec/matrix. |
| AUD-E-007 | Medium | `Extension.MarkdownFlavor.Refresh`, `Extension.Activation.MarkerEvents` | E15/TASK-304 covers selector changes and rebuild-index completion; E16/TASK-305 covers activation; E17/TASK-310 covers visible flows. | Refresh triggers from E14, such as workspace-folder changes, visible editor changes, and file opens, are not all restated for the flavor controller. | Flavor state may update on selector changes but become stale during long-running sessions after folder or editor changes. | Expand TASK-304 or E17 host tests to enumerate all E14 refresh triggers as flavor recomputation triggers, not only rebuild-index and selector changes. |
| AUD-E-008 | Low | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.Marketplace.OFMProof` | E16/TASK-308 says update troubleshooting and activation docs; CHORE-111 says no current user-facing doc should present language promotion as required behavior. Historical E6-E14 plans remain completed records. | The roadmap allows historical references but does not require an explicit stale-reference sweep result listing which `ofmarkdown` mentions are historical versus current user-facing text. | Users or future implementers may treat completed phase text as current behavior. | In CHORE-111, require a stale-reference ledger that classifies remaining `ofmarkdown` mentions as historical, legacy compatibility, or current bug. |

## Coverage Notes

- Covered well: default Markdown mode, selector UI, full required flavor list,
  manual language safety, override scope, contribution scoping, Marketplace
  selector proof, host e2e coverage, and validation evidence paths.
- Still needs sharper contracts: resource-aware propagation, project-config
  auto-detection ownership, stale-test phase ordering, environment-mode
  regression checks, and validation artifact closure.

