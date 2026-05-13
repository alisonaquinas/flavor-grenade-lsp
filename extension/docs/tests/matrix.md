---
title: Extension Tests Matrix
tags: [extension/docs, tests, matrix, markdown-flavor]
aliases: [Extension Test Matrix, VS Code Extension Tests Matrix]
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
| `Extension.MarkdownFlavor.ServerPropagation` | Planned extension refresh tests and server configuration tests | ⏳ planned | Must cover every required explicit flavor id. |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | Planned unit and host tests | ⏳ planned | Must preserve non-`markdown` language ids, including `mdx`. |
| `Extension.MarkdownFlavor.Refresh` | Planned refresh-trigger tests | ⏳ planned | Replaces retired membership refresh behavior. |
| `Extension.Contributions.FlavorScoped` | Existing contribution tests require rewrite | 🔴 failing | Replace `ofmarkdown` language scopes with flavor/context keys. |
| `Extension.Marketplace.OFMProof` | Existing marketplace asset tests require selector proof update | 🔴 failing | README proof must show Markdown flavor behavior. |
| `Extension.Tests.HostCoverage` | Existing host suite plus planned `markdown-flavor.test.js` | 🔴 failing | Host suite needs selector, persistence, and language-preservation scenarios. |

## Test-Level Matrix

| Level | Evidence | Status | Required outcome |
|---|---|---|---|
| Unit | `extension/src/markdown-flavor.test.ts`; updated contribution tests | 📋 planned | Pure extension logic covers selector, flavor ids, auto-detection, persistence, propagation calls, refresh triggers, and flavor-scoped contributions. |
| Integration | `extension/src/activation-gate.test.ts`; marketplace/package tests; server refresh wiring tests | 🔴 needs update | Extension startup and package evidence align with Markdown flavor selection instead of custom language mode. |
| E2E | `extension/src/test/suite/markdown-flavor.test.js` | 📋 planned | VS Code host proves user-visible selector, settings persistence, language preservation, and generic Markdown fallback. |
| Verification | `npm test`; `npm run compile`; `npm run test:host`; CI workflow checks | 🔴 needs update | Local and CI gates run the new flavor tests and fail on stale `ofmarkdown` assumptions. |
| Validation | BDD scenarios plus research-source trace review | 🔴 needs step updates | Acceptance evidence proves required flavor ids and dialect profiles match the research corpus. |

## Legacy Tests To Retire Or Rewrite

| Existing test | Required action |
|---|---|
| `extension/src/language-mode.test.ts` | Replace with `extension/src/markdown-flavor.test.ts`. |
| `extension/src/test/suite/activation-language-mode.test.js` | Replace with host Markdown flavor scenarios. |
| `extension/test/contributions/snippets.test.ts` | Rewrite for flavor/context-key scoping. |
| `extension/test/contributions/language-configuration.test.ts` | Rewrite or retire custom-language assumptions. |
| `extension/test/contributions/keybindings.test.ts` | Rewrite for flavor/context-key preconditions. |
| `extension/test/contributions/ofmarkdown-isolation.test.ts` | Rewrite for generic Markdown isolation under flavor selection. |
