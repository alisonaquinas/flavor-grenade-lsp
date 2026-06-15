---
title: Extension Tests Matrix
tags: [extension/docs, tests, matrix, markdown-flavor]
aliases:
  - Extension Test Matrix
  - VS Code Extension Tests Matrix
---

# Extension Tests Matrix

Detailed cases for the rows below live in:

- [markdown-flavor-unit-spec.md](markdown-flavor-unit-spec.md)
- [markdown-flavor-integration-spec.md](markdown-flavor-integration-spec.md)
- [markdown-flavor-e2e-spec.md](markdown-flavor-e2e-spec.md)
- [markdown-flavor-verification-spec.md](markdown-flavor-verification-spec.md)
- [markdown-flavor-validation-spec.md](markdown-flavor-validation-spec.md)

| Requirement | Planned or existing evidence | Status | Notes |
|---|---|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `extension/src/language-mode.test.ts`; `extension/src/markdown-flavor.test.ts`; planned host selector test | 🟢 unit covered | Unit tests reject `setTextDocumentLanguage` and non-`markdown` flavor application; host proof remains E17. |
| `Extension.MarkdownFlavor.Selector` | `extension/src/markdown-flavor.test.ts`; planned host selector test | 🟢 unit covered | Selector command, activation, quick-pick ids, and labels are covered; visible host proof remains E17. |
| `Extension.MarkdownFlavor.RequiredCoverage` | `extension/src/markdown-flavor.test.ts`; `docs/bdd/features/ofmarkdown-language-mode.feature` | 🟢 unit covered | Includes `auto` and all researched explicit flavor ids. |
| `Extension.MarkdownFlavor.DialectProfiles` | `extension/src/markdown-flavor.test.ts`; `docs/bdd/features/markdown-flavor-dialects.feature`; server/profile registry tests | 🟢 compatibility covered | Extension selector/schema ids match the server profile id set; server semantics remain root/server phase-owned. |
| `Extension.MarkdownFlavor.AutoDetection` | planned `.mdfignore`/`.mdfattributes` extension resolver tests; `extension/src/markdown-flavor-evidence.test.ts`; planned inference resolver tests | 🔴 needs config-file update | Effective resolution must cover `.mdfignore`, `.mdfattributes`, invalid values, and absent-config Auto Detect triggers. Auto Detect itself covers Obsidian marker evidence, strong syntax evidence, ambiguity, and CommonMark fallback. Fixture inventory now covers config-absent inference inputs and boundary-negative samples; inference implementation remains planned. |
| `Extension.MarkdownStructuredProfiles.Configuration` | `extension/src/markdown-flavor-evidence.test.ts`; planned `extension/src/markdown-flavor.test.ts`; `EXT-MF-U-017` through `EXT-MF-U-019`; `EXT-MF-I-013`; `EXT-MF-E-013` | 🔴 failing | Fixture inventory covers Keep a Changelog, Common Changelog, and MADR under every `.mdfattributes`-configured and config-absent inference smoke workspace. `.mdfattributes` structured-profile parsing, propagation, selector non-expansion, explicit overrides, and host proof remain pending. |
| `Extension.MarkdownFlavor.OverridePersistence` | planned `.mdfattributes` unit tests; planned host `.mdfattributes` tests | 🔴 needs config-file update | Unit tests must distinguish selected-file and directory-scope `.mdfattributes` targets and Auto clearing. |
| `Extension.MarkdownFlavor.ServerPropagation` | `extension/src/markdown-flavor.test.ts`; `extension/src/extension-startup.test.ts`; planned host propagation tests | 🟡 partial | Unit tests cover refresh payload shape and live `mdfConfigMaxBytes` propagation. Server-unavailable host behavior remains E17. |
| `Security.Input.FlavorPropagationPayload` | existing payload validation tests; planned `.mdfignore` inactive-resource tests; planned host propagation tests | 🟡 partial | Existing unit tests cover restricted-resource suppression and payload validation. `.mdfignore` inactive-resource suppression and broader replay/host cases remain E17. |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | `extension/src/markdown-flavor.test.ts`; `extension/src/language-mode.test.ts`; planned host tests | 🟢 unit covered | Non-`markdown` language ids, including `mdx`, remain inactive for flavor application. |
| `Extension.MarkdownFlavor.Refresh` | `extension/src/language-mode.test.ts`; planned refresh-trigger tests | 🟡 partial | Server-ready, rebuild, and marker-change refresh wiring is present; exhaustive host refresh proof remains E17. |
| `Extension.Contributions.FlavorScoped` | `extension/test/contributions/keybindings.test.ts`; `extension/test/contributions/ofmarkdown-isolation.test.ts`; remaining snippets/language-configuration tests | 🟡 partial | Command keybindings now use built-in `markdown` plus `flavorGrenade.markdownFlavorActive`. Snippets and language configuration remain isolated on legacy `ofmarkdown` until equivalent context gating exists. |
| `Extension.Marketplace.OFMProof` | E16/TASK-309 updates `extension/test/marketplace/readme-assets.test.ts` (`EXT-MF-I-005`) and `extension/test/marketplace/vsix-assets.test.ts` (`EXT-MF-I-006`) for selector proof | 🔴 failing | README proof must show Markdown flavor behavior; final verification keeps the selector-proof handoff explicit. |
| `Extension.Tests.HostCoverage` | Existing host suite plus planned `markdown-flavor.test.js`, `EXT-MF-VF-008`, and validation host evidence | 🔴 failing | Host suite needs selector, persistence, propagation, package-target, stale-`ofmarkdown`, and language-preservation scenarios. CI must run host tests or fail without documented blocker evidence. |
| `Extension.Activation.MarkerEvents` | `EXT-MF-U-014`, `EXT-MF-I-007` | 🔴 failing | Manifest activation and `LanguageClient.clientOptions.documentSelector` must serve file-backed `markdown` and reject stale `ofmarkdown`. `EXT-MF-I-006` remains VSIX asset proof only. |
| `Extension.Packaging.ServerModuleValidation` | `EXT-MF-VF-007`, `EXT-MF-VA-005`, `extension/docs/tests/evidence/markdown-flavor-package-targets.md` | 🔴 failing | Package-target validation evidence is required before extension flavor validation signoff. |

## Test-Level Matrix

| Level | Evidence | Status | Required outcome |
|---|---|---|---|
| Unit | `.mdfattributes` resolver/persistence tests; `extension/src/markdown-flavor-evidence.test.ts`; `extension/src/language-mode.test.ts`; contribution tests | 🟡 partial | Pure extension logic covers selector, flavor ids, `.mdfattributes` evidence, independent Auto Detect evidence, persistence, propagation calls, document scope, language preservation, and keybinding context scoping. Host-level selector and structured-profile proof remain planned. |
| Integration | `extension/src/activation-gate.test.ts`; `extension/src/client-options.test.ts`; `extension/test/marketplace/readme-assets.test.ts`; `extension/test/marketplace/vsix-assets.test.ts`; server refresh wiring tests | 🔴 needs update | Extension startup, document selector, propagation, server-unavailable, restricted/virtual workspace, and package evidence align with Markdown flavor selection instead of custom language mode. |
| E2E | `extension/src/test/suite/markdown-flavor.test.js` | 📋 planned | VS Code host proves user-visible selector, `.mdfattributes` persistence across selected-file and directory targets, `.mdfignore` inactive state, invalid fallback/precedence, propagation, language preservation, generic Markdown fallback, config-absent syntax inference, ambiguous fallback, structured-profile flags, and smoketest root README boundary behavior. |
| Verification | `npm test`; `npm run compile`; `npm run test:host`; `npm run verify:marketplace-assets`; `npm run verify:package-targets`; CI workflow checks; `bun run lint:docs` for `extension/docs/**/*.md` | 🔴 needs update | Local and CI gates run the new flavor tests, protect marketplace selector proof through E16/TASK-309, verify VSIX target payloads, and fail on stale `ofmarkdown` assumptions. |
| Validation | BDD scenarios plus research-source trace review, inference smoke review, structured-profile smoke review, package-target evidence, stale expectation scan, and sanitized logs/artifacts | 🔴 needs step updates | Acceptance evidence proves required flavor ids, extension contract compatibility, `.mdfattributes` scope writes, `.mdfignore` inactive state, syntax inference behavior, structured-profile behavior, package-target proof, stale `ofmarkdown` retirement, and redaction of user paths, vault content, config file contents, environment variables, and API-like tokens. Server dialect semantics remain owned by root/server phases. |

## Legacy Tests To Retire Or Rewrite

| Existing test | Required action |
|---|---|
| `extension/src/language-mode.test.ts` | Replace with `extension/src/markdown-flavor.test.ts`. |
| `extension/src/test/suite/activation-language-mode.test.js` | Replace with host Markdown flavor scenarios. |
| `extension/test/contributions/snippets.test.ts` | Rewrite for flavor/context-key scoping. |
| `extension/test/contributions/language-configuration.test.ts` | Rewrite or retire custom-language assumptions. |
| `extension/test/contributions/keybindings.test.ts` | Rewritten for `markdown` plus `flavorGrenade.markdownFlavorActive` preconditions. |
| `extension/test/contributions/ofmarkdown-isolation.test.ts` | Rewritten for generic Markdown isolation under flavor selection. |
