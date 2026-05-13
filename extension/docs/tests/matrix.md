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
| `Extension.MarkdownLanguage.PreserveDefault` | `docs/bdd/features/ofmarkdown-language-mode.feature`; planned `extension/src/markdown-flavor.test.ts`; planned `extension/src/test/suite/markdown-flavor.test.js` | 🔴 failing | Current extension tests still expect `ofmarkdown` promotion. |
| `Extension.MarkdownFlavor.Selector` | Planned `extension/src/markdown-flavor.test.ts`; planned host selector test | ⏳ planned | Must verify visible selector and quick-pick labels. |
| `Extension.MarkdownFlavor.RequiredCoverage` | `docs/bdd/features/ofmarkdown-language-mode.feature`; planned selector enum/schema tests | 🔴 failing | Must include all researched flavor ids, not only Original/CommonMark/Obsidian. |
| `Extension.MarkdownFlavor.DialectProfiles` | `docs/bdd/features/markdown-flavor-dialects.feature`; planned server/profile registry tests | 🔴 failing | Server-side profile tests live outside `extension/`, but extension selector must accept each profile id. |
| `Extension.MarkdownFlavor.AutoDetection` | Existing `src/vault/__tests__/document-membership.test.ts`; planned extension resolver tests | 🔴 failing | Membership evidence exists; effective flavor resolver does not. |
| `Extension.MarkdownFlavor.OverridePersistence` | Planned unit and host settings-target tests | ⏳ planned | Must distinguish workspace-folder/workspace/user targets. |
| `Extension.MarkdownFlavor.ServerPropagation` | Planned `EXT-MF-U-009`, `EXT-MF-I-008`, `EXT-MF-I-009`, and host propagation tests | ⏳ planned | Must cover every required explicit flavor id, resource-specific effective flavor state, server-unavailable replay/recompute, and real client-to-server payload shape. |
| `Security.Input.FlavorPropagationPayload` | Planned `EXT-MF-U-009`, `EXT-MF-I-008`, `EXT-MF-I-010`, and host propagation tests | ⏳ planned | Extension must not send oversized maps, unsafe resource keys, dangerous object keys, stale resources, or propagation from restricted/virtual/untrusted contexts. |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | Planned unit and host tests | ⏳ planned | Must preserve non-`markdown` language ids, including `mdx`. |
| `Extension.MarkdownFlavor.Refresh` | Planned refresh-trigger tests | ⏳ planned | Replaces retired membership refresh behavior. |
| `Extension.Contributions.FlavorScoped` | Existing contribution tests require rewrite | 🔴 failing | Replace `ofmarkdown` language scopes with flavor/context keys. |
| `Extension.Marketplace.OFMProof` | E16/TASK-309 updates `extension/test/marketplace/readme-assets.test.ts` (`EXT-MF-I-005`) and `extension/test/marketplace/vsix-assets.test.ts` (`EXT-MF-I-006`) for selector proof | 🔴 failing | README proof must show Markdown flavor behavior; final verification keeps the selector-proof handoff explicit. |
| `Extension.Tests.HostCoverage` | Existing host suite plus planned `markdown-flavor.test.js`, `EXT-MF-VF-008`, and validation host evidence | 🔴 failing | Host suite needs selector, persistence, propagation, package-target, stale-`ofmarkdown`, and language-preservation scenarios. CI must run host tests or fail without documented blocker evidence. |
| `Extension.Activation.MarkerEvents` | `EXT-MF-U-014`, `EXT-MF-I-007` | 🔴 failing | Manifest activation and `LanguageClient.clientOptions.documentSelector` must serve file-backed `markdown` and reject stale `ofmarkdown`. `EXT-MF-I-006` remains VSIX asset proof only. |
| `Extension.Packaging.TargetBinaryValidation` | `EXT-MF-VF-007`, `EXT-MF-VA-005`, `extension/docs/tests/evidence/markdown-flavor-package-targets.md` | 🔴 failing | Package-target validation evidence is required before extension flavor validation signoff. |

## Test-Level Matrix

| Level | Evidence | Status | Required outcome |
|---|---|---|---|
| Unit | `extension/src/markdown-flavor.test.ts`; `extension/src/client-options.test.ts`; updated contribution tests | 📋 planned | Pure extension logic covers selector, flavor ids, auto-detection, persistence, propagation calls, refresh triggers, documentSelector guards, and flavor-scoped contributions. |
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
