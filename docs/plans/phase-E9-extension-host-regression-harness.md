---
title: "Phase E9: Extension Host Regression Harness"
phase: E9
status: complete
tags: [plans, vscode, extension, testing, marksman-parity]
aliases: [Phase E9, Extension Host Tests]
updated: 2026-05-07
---

# Phase E9: Extension Host Regression Harness

| Field | Value |
|---|---|
| Phase | E9 |
| Title | Extension Host Regression Harness |
| Status | complete |
| Gate | Extension-host tests cover activation, language mode, commands, status, and failure states |
| Depends on | Phase E8 |

## Objective

Replace sample-style extension tests with a real VS Code extension-host
regression suite. This phase protects the client integration points that are
hard to validate with plain Node tests.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/vscode-extension-parity#Extension.Tests.HostCoverage]] | Add automated tests for required extension-host behavior groups |
| [[docs/requirements/functional/vscode-extension-parity#Extension.LanguageMode.MembershipRefresh]] | Exercise language-mode promotion and preservation paths |
| [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.PayloadValidation]] | Cover bridge command valid and invalid payloads in the host |

## Scope

### In Scope

- Add a VS Code extension-host test runner if the existing test command cannot
  exercise VS Code APIs.
- Add fixture workspaces for `.obsidian/`, `.flavor-grenade.toml`, and generic
  Markdown.
- Test command registration for core and bridge commands.
- Test status transitions with a mock or fixture server.
- Test missing custom server path behavior.
- Wire the extension-host test command into CI where practical.

### Out of Scope

- Manual remote workspace verification.
- Marketplace image capture.
- Server feature behavior already covered by LSP tests.

## Acceptance

- Every `Extension.Tests.HostCoverage` behavior group has a passing host test.
- The test command can run locally from `extension/`.
- CI either runs the host tests or records the documented blocker.

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
npm run test:host
```

`npm run test:host` runs all Phase E9 fixtures by default. The root CI workflow
does not currently run the Electron extension host; Phase E9 records this as a
CI-environment blocker and relies on the local host command plus normal PR CI
until a dedicated VS Code host job is added.

## Related

- [[docs/test/matrix]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/features/vscode-extension-parity]]
