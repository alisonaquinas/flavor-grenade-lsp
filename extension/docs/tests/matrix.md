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
| `Extension.MarkdownFlavor.AutoDetection` | `extension/src/markdown-flavor.test.ts`; existing server membership tests | 🟢 unit covered | Resolver covers project evidence, Obsidian marker/membership evidence, invalid values, and CommonMark fallback. |
| `Extension.MarkdownFlavor.OverridePersistence` | `extension/src/markdown-flavor.test.ts`; planned host settings-target tests | 🟢 unit covered | Unit tests distinguish workspace-folder/workspace/user targets and Auto clearing. |
| `Extension.MarkdownFlavor.ServerPropagation` | `extension/src/markdown-flavor.test.ts`; `extension/src/language-mode.test.ts`; planned host propagation tests | 🟢 unit covered | Unit tests cover every explicit flavor id and resource-specific payload shape; server-unavailable host behavior remains E17. |
| `Security.Input.FlavorPropagationPayload` | `extension/src/markdown-flavor.test.ts`; planned host propagation tests | 🟢 unit covered | Unit tests suppress restricted and inactive resources; broader replay/host cases remain E17. |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | `extension/src/markdown-flavor.test.ts`; `extension/src/language-mode.test.ts`; planned host tests | 🟢 unit covered | Non-`markdown` language ids, including `mdx`, remain inactive for flavor application. |
| `Extension.MarkdownFlavor.Refresh` | `extension/src/language-mode.test.ts`; planned refresh-trigger tests | 🟡 partial | Server-ready, rebuild, and marker-change refresh wiring is present; exhaustive host refresh proof remains E17. |
| `Extension.Contributions.FlavorScoped` | Existing contribution tests require rewrite | 🔴 failing | Replace `ofmarkdown` language scopes with flavor/context keys. |
| `Extension.Marketplace.OFMProof` | E16/TASK-309 updates `extension/test/marketplace/readme-assets.test.ts` (`EXT-MF-I-005`) and `extension/test/marketplace/vsix-assets.test.ts` (`EXT-MF-I-006`) for selector proof | 🔴 failing | README proof must show Markdown flavor behavior; final verification keeps the selector-proof handoff explicit. |
| `Extension.Tests.HostCoverage` | Existing host suite plus planned `markdown-flavor.test.js`, `EXT-MF-VF-008`, and validation host evidence | 🔴 failing | Host suite needs selector, persistence, propagation, package-target, stale-`ofmarkdown`, and language-preservation scenarios. CI must run host tests or fail without documented blocker evidence. |
| `Extension.Activation.MarkerEvents` | `EXT-MF-U-014`, `EXT-MF-I-007` | 🔴 failing | Manifest activation and `LanguageClient.clientOptions.documentSelector` must serve file-backed `markdown` and reject stale `ofmarkdown`. `EXT-MF-I-006` remains VSIX asset proof only. |
| `Extension.Packaging.ServerModuleValidation` | `EXT-MF-VF-007`, `EXT-MF-VA-005`, `extension/docs/tests/evidence/markdown-flavor-package-targets.md` | 🔴 failing | Package-target validation evidence is required before extension flavor validation signoff. |

## Test-Level Matrix

| Level | Evidence | Status | Required outcome |
|---|---|---|---|
| Unit | `extension/src/markdown-flavor.test.ts`; `extension/src/language-mode.test.ts`; updated contribution tests | 🟢 E15 covered | Pure extension logic covers selector, flavor ids, auto-detection, persistence, propagation calls, document scope, and language preservation. Contribution scoping remains E16. |
| Integration | `extension/src/activation-gate.test.ts`; `extension/src/client-options.test.ts`; `extension/test/marketplace/readme-assets.test.ts`; `extension/test/marketplace/vsix-assets.test.ts`; server refresh wiring tests | 🔴 needs update | Extension startup, document selector, propagation, server-unavailable, restricted/virtual workspace, and package evidence align with Markdown flavor selection instead of custom language mode. |
| E2E | `extension/src/test/suite/markdown-flavor.test.js` | 📋 planned | VS Code host proves user-visible selector, settings persistence across workspace-folder/workspace/user targets, invalid fallback/precedence, propagation, language preservation, and generic Markdown fallback. |
| Verification | `npm test`; `npm run compile`; `npm run test:host`; `npm run verify:marketplace-assets`; `npm run verify:package-targets`; CI workflow checks; `bun run lint:docs` for `extension/docs/**/*.md` | 🔴 needs update | Local and CI gates run the new flavor tests, protect marketplace selector proof through E16/TASK-309, verify VSIX target payloads, and fail on stale `ofmarkdown` assumptions. |
| Validation | BDD scenarios plus research-source trace review, package-target evidence, stale expectation scan, and sanitized logs/artifacts | 🔴 needs step updates | Acceptance evidence proves required flavor ids, extension contract compatibility, package-target proof, stale `ofmarkdown` retirement, and redaction of user paths, vault content, TOML content, environment variables, and API-like tokens. Server dialect semantics remain owned by root/server phases. |

## Legacy Tests To Retire Or Rewrite

| Existing test | Required action |
|---|---|
| `extension/src/language-mode.test.ts` | Replace with `extension/src/markdown-flavor.test.ts`. |
| `extension/src/test/suite/activation-language-mode.test.js` | Replace with host Markdown flavor scenarios. |
| `extension/test/contributions/snippets.test.ts` | Rewrite for flavor/context-key scoping. |
| `extension/test/contributions/language-configuration.test.ts` | Rewrite or retire custom-language assumptions. |
| `extension/test/contributions/keybindings.test.ts` | Rewrite for flavor/context-key preconditions. |
| `extension/test/contributions/ofmarkdown-isolation.test.ts` | Rewrite for generic Markdown isolation under flavor selection. |
