---
title: "Phase E17: Extension Flavor Host Verification"
phase: E17
status: planned
tags: [plans, vscode, extension, markdown-flavor, tests]
aliases: [Phase E17, Extension Flavor Verification]
updated: 2026-05-13
---

# Phase E17: Extension Flavor Host Verification

| Field | Value |
|---|---|
| Phase | E17 |
| Title | Extension Flavor Host Verification |
| Status | planned |
| Gate | VS Code host, CI, and validation evidence prove flavor selector behavior |
| Depends on | Phase E16, Phase 20 |

## Objective

Close the extension test and validation gaps by replacing old language-mode host
expectations with visible selector, settings-scope, refresh, and manual-language
safety evidence.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/vscode-extension-parity#Extension.Tests.HostCoverage]] | Add host coverage for flavor selector behavior |
| [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]] | Verify refresh triggers in host/e2e coverage |
| [[docs/requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]] | Verify selector/environment-mode regressions in restricted, virtual, and remote contexts |
| [[docs/requirements/functional/vscode-extension-parity#Extension.Packaging.TargetBinaryValidation]] | Own package-target evidence closeout for extension flavor validation |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]] | Verify plaintext and MDX language preservation |
| [extension markdown flavor e2e spec](../../extension/docs/tests/markdown-flavor-e2e-spec.md) | Implement extension host e2e test cases |
| [extension markdown flavor verification spec](../../extension/docs/tests/markdown-flavor-verification-spec.md) | Wire extension commands and CI gates |
| [extension markdown flavor validation spec](../../extension/docs/tests/markdown-flavor-validation-spec.md) | Add user-visible validation evidence |
| [GAP-E-011](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close missing host flavor suite gap |
| [GAP-E-014](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close missing validation evidence gap |

## Scope

### In Scope

- Add `extension/src/test/suite/markdown-flavor.test.js`.
- Include the new host suite in the extension host runner.
- Retire or rewrite obsolete `activation-language-mode.test.js` expectations.
- Add CI checks that run extension flavor tests.
- Add validation evidence for selector visibility, settings scope, and no
  custom language id transition.
- Add host or verification coverage for restricted, virtual, WSL, SSH, and Dev
  Container selector behavior. Unsupported environments must not spawn the
  server; supported remote modes must keep selector state and package-target
  evidence aligned.
- Add untrusted workspace coverage proving selector UI degrades safely without
  workspace-folder writes, server spawn, or flavor propagation.
- Add package-target validation evidence for flavor-era VSIX output.
- Run a stale `ofmarkdown` expectation scan for current host tests and host
  evidence; historical docs may keep historical mentions when classified.
- Update extension-local test matrix and root test matrix.

### Out of Scope

- New dialect parser features beyond Phase 20.
- New Marketplace art beyond E16.

## Acceptance

- `npm run test:host` proves Obsidian, generic, config, standalone, manual
  language, Auto reset, and environment-mode flows.
- Host logs show no `.md` document changes to `ofmarkdown`.
- CI and local commands fail if flavor host tests are removed.
- Package-target evidence proves flavor-era VSIX output is covered by
  `npm run verify:package-targets`.
- Restricted, virtual, unsupported-scheme, and untrusted contexts never spawn
  the server or persist workspace-folder flavor settings.
- Extension validation docs show current user-visible behavior.

## Gate Verification

```bash
bun run lint:docs
cd extension
npm run compile
npm test
npm run test:host
npm run verify:marketplace-assets
npm run verify:package-targets
```

## Tickets

Ticket index: [[docs/plans/phase-E17-extension-flavor-host-verification/index]]

## Related

- [extension markdown flavor e2e spec](../../extension/docs/tests/markdown-flavor-e2e-spec.md)
- [extension Markdown flavor gap analysis](../../extension/docs/gaps/markdown-flavor-gap-analysis.md)
