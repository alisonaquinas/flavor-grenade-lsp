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
| [[requirements/functional/vscode-extension-parity#Extension.Tests.HostCoverage]] | Add host coverage for flavor selector behavior |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.Refresh]] | Verify refresh triggers in host/e2e coverage |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]] | Verify plaintext and MDX language preservation |
| [[extension/docs/tests/markdown-flavor-e2e-spec]] | Implement extension host e2e test cases |
| [[extension/docs/tests/markdown-flavor-verification-spec]] | Wire extension commands and CI gates |
| [[extension/docs/tests/markdown-flavor-validation-spec]] | Add user-visible validation evidence |
| [[extension/docs/gaps/markdown-flavor-gap-analysis#GAP-E-011]] | Close missing host flavor suite gap |
| [[extension/docs/gaps/markdown-flavor-gap-analysis#GAP-E-014]] | Close missing validation evidence gap |

## Scope

### In Scope

- Add `extension/src/test/suite/markdown-flavor.test.js`.
- Include the new host suite in the extension host runner.
- Retire or rewrite obsolete `activation-language-mode.test.js` expectations.
- Add CI checks that run extension flavor tests.
- Add validation evidence for selector visibility, settings scope, and no
  custom language id transition.
- Update extension-local test matrix and root test matrix.

### Out of Scope

- New dialect parser features beyond Phase 20.
- New Marketplace art beyond E16.

## Acceptance

- `npm run test:host` proves Obsidian, generic, config, standalone, manual
  language, and Auto reset flows.
- Host logs show no `.md` document changes to `ofmarkdown`.
- CI and local commands fail if flavor host tests are removed.
- Extension validation docs show current user-visible behavior.

## Gate Verification

```bash
cd extension
npm test
npm run test:host
npm run compile
```

## Tickets

Ticket index: [[plans/phase-E17-extension-flavor-host-verification/index]]

## Related

- [[extension/docs/tests/markdown-flavor-e2e-spec]]
- [[extension/docs/gaps/markdown-flavor-gap-analysis]]
