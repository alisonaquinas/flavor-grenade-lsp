---
title: Test Index
tags:
  - test/index
aliases:
  - Test Inventory
  - Test File Index
---

# Test Index

This file is the authoritative inventory of repository, extension, and website
test files. It is organized by test type and maps each file to its description,
the Planguage requirement tags it exercises, and the phase in which it was
introduced.

> [!NOTE] Maintenance
> This file is updated automatically by `scripts/update-test-index.sh` (stub in Phase 1; fully implemented in Phase 3). Until the script is implemented, update this file manually whenever a new test file is added under `tests/`, `src/**/__tests__/`, `extension/**`, or `website/tests`. Always commit index updates with the test file or with the ticket status update that brings older missing entries back into sync.

> [!TIP]
> For the full requirements × tests × work-performed traceability matrix, see [[docs/test/matrix]].
> Detailed Markdown flavor test cases live in [[docs/test/markdown-flavor-unit-spec]],
> [[docs/test/markdown-flavor-integration-spec]], [[docs/test/markdown-flavor-e2e-spec]],
> [[docs/test/markdown-flavor-verification-spec]], and [[docs/test/markdown-flavor-validation-spec]].

---

## How to Read This Index

| Column | Meaning |
|---|---|
| **Test File** | Path relative to the repository root |
| **Type** | `Unit`, `Integration`, or `BDD` |
| **Description** | What the test exercises in one sentence |
| **Requirements Tags** | Planguage `Tag` fields from `docs/requirements/` that this test provides evidence for |
| **Phase** | The plan phase in which this test was first introduced |

---

## Unit Tests

Unit tests live under `tests/unit/` and mirror the `src/` module structure. Each unit test file exercises exactly one class or module in isolation.

| Test File | Type | Description | Requirements Tags | Phase |
|---|---|---|---|---|
| `tests/unit/lsp/lsp.module.spec.ts` | Unit | NestJS module graph smoke test — verifies `LspModule` compiles and can be resolved from the application context | `Workspace.VaultDetection.Primary` | Phase 1 |
| `src/vault/__tests__/document-membership.test.ts` | Unit | Tests server-side `flavorGrenade/documentMembership` results used as Markdown flavor auto-detection input for Obsidian vaults, Flavor Grenade config vaults, indexed docs, single-file mode, and unsupported URI schemes | `Extension.MarkdownFlavor.AutoDetection` | Phase E6 |
| `src/vault/__tests__/vault.module.test.ts` | Unit | Verifies `VaultModule` registers `flavorGrenade/documentMembership` with the JSON-RPC dispatcher for client flavor auto-detection | `Extension.MarkdownFlavor.AutoDetection` | Phase E6 |
| `src/vault/__tests__/vault-scanner.test.ts` | Unit | Tests configured document-extension filtering, attachment metadata, and scan file-count limits for vault scans | `Workspace.FileExtension.Filter`, `Security.Parser.VaultFileLimit` | Phase 18 |
| `src/parser/__tests__/frontmatter-parser.test.ts` | Unit | Tests frontmatter parsing, malformed YAML handling, and security limits for frontmatter size and YAML aliases | `Security.Parser.YAMLLimits` | Phase 18 |
| `src/parser/__tests__/parser-safety.test.ts` | Unit | Tests parser size-budget fallback and adversarial unmatched-delimiter runtime behavior | `Security.Parser.ParseTimeout`, `Security.Parser.ReDoS` | Phase 18 |
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | Unit | Tests the ADR020 Markdown flavor contract, explicit-only source-backed profile registry, profile security metadata, and research-trace evidence for every supported flavor | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Profile.SignatureCoverage`, `Security.Parser.FlavorProfileResourceSafety` | Phase 19 |
| `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | Unit | Tests Original Markdown, CommonMark, Obsidian, GFM, GLFM, and Pandoc parser/profile behavior for headings, core syntax, active/inactive extension constructs, autolinks, vault syntax, GFM tables/tasks/strikethrough, GLFM task/description-list/footnote/TOC/host-reference syntax, Pandoc title/citation/footnote/attribute/fenced-Div/definition-list syntax, opaque regions, and implemented surface status | `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Profile.SignatureCoverage`, `FlavorLSP.Parser.ProfileDispatch` | Phase 22, Phase 23, Phase 24, Phase 25, Phase 26, Phase 27 |
| `src/lsp/handlers/__tests__/configuration.handler.test.ts` | Unit | Tests server Markdown flavor configuration validation, auto resolution, project TOML safety, open-document refresh, parser profile dispatch, and host-boundary classification | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.AutoDetection`, `Extension.MarkdownFlavor.Refresh`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.HostBoundary.NonLocalReferences`, `Security.Input.FlavorPropagationPayload`, `Security.Input.ProjectConfigTOMLSafety`, `Security.Vault.ProjectConfigConfinement` | Phase 20 |
| `src/parser/__tests__/markdown-link-parser.test.ts` | Unit | Tests inline Markdown links, image links, reference labels, definitions, and opaque-region suppression | `Parity.MarkdownLinks.ParseCoverage` | Phase 14 |
| `src/parser/__tests__/ofm-parser.integration.test.ts` | Unit | Verifies OFM parser integration includes Markdown link and label indexes alongside existing OFM constructs | `Parity.MarkdownLinks.ParseCoverage` | Phase 14 |
| `src/resolution/__tests__/markdown-target-classifier.test.ts` | Unit | Tests Markdown target classification for local docs, attachments, fragments, external URLs, unsupported schemes, and traversal underflow | `Parity.MarkdownLinks.TargetClassification`, `Security.Vault.PathConfinement` | Phase 14 |
| `src/resolution/__tests__/diagnostic-service.test.ts` | Unit | Tests wiki-link, block-reference, embed, Original FG101 portability diagnostics, CommonMark FG102 portability diagnostics, active Obsidian diagnostic behavior, GFM malformed-table diagnostics, GLFM malformed description-list diagnostics, and Pandoc malformed-attribute diagnostics | `Diagnostic.Severity.WikiLink`, `Diagnostic.Severity.Embed`, `FlavorLSP.Diagnostics.ProfileRules` | Phase 8, Phase 22, Phase 23, Phase 24, Phase 25, Phase 26, Phase 27 |
| `src/resolution/__tests__/ref-graph-markdown-links.test.ts` | Unit | Tests RefGraph indexing for Markdown document refs, standalone link definitions, image refs, label refs, and external URL suppression | `Parity.MarkdownLinks.ReferenceGraph`, `Parity.MarkdownLinks.LocalResolution` | Phase 14 |
| `src/resolution/__tests__/markdown-link-oracle.test.ts` | Unit | Tests Markdown document and heading resolution, same-document fragments, ambiguous headings, and malformed percent escape safety | `Parity.MarkdownLinks.LocalResolution`, `Parity.MarkdownLinks.SameDocumentAnchor`, `Parity.HeadingAmbiguity.Diagnostics` | Phase 14 |
| `src/resolution/__tests__/markdown-link-diagnostics.test.ts` | Unit | Tests external URL diagnostic suppression and missing or ambiguous Markdown heading anchor diagnostics | `Parity.MarkdownLinks.SameDocumentAnchor`, `Parity.HeadingAmbiguity.Diagnostics` | Phase 14 |
| `src/handlers/__tests__/markdown-link-navigation.test.ts` | Unit | Tests Markdown link definition and references for inline file links, same-document anchors, and label definitions | `Navigation.Definition.AllLinkTypes`, `Navigation.References.Completeness`, `Parity.MarkdownLinks.NavigationAndReferences` | Phase 14 |
| `src/handlers/__tests__/markdown-heading-rename.test.ts` | Unit | Tests heading rename updates same-document and file-plus-heading Markdown anchors | `Rename.Refactoring.Completeness`, `Parity.MarkdownLinks.RenameAnchors` | Phase 14 |
| `src/completion/__tests__/context-analyzer.test.ts` | Unit | Tests Markdown link URL and heading completion contexts before tag detection | `Completion.Trigger.Coverage`, `Parity.MarkdownLinks.Completion` | Phase 14 |
| `src/completion/__tests__/completion-router.test.ts` | Unit | Tests Markdown document and heading completion routing, external URL suppression, nested source path relativity, attachment completion ranking, non-Obsidian suppression for inactive Obsidian completions, active Obsidian completion routing, GFM table/task snippets, GLFM inapplicable-task/TOC snippets, and Pandoc citation/attribute snippets | `Completion.Trigger.Coverage`, `Parity.MarkdownLinks.Completion`, `Parity.Attachments.Completion`, `Parity.Attachments.ConfigHints`, `FlavorLSP.Completion.ProfileCandidates` | Phase 14, Phase 22, Phase 23, Phase 24, Phase 25, Phase 26, Phase 27 |
| `src/vault/__tests__/attachment-config.test.ts` | Unit | Tests Obsidian `.obsidian/app.json` attachment folder discovery and malformed-config fallback | `Parity.Attachments.ConfigHints`, `Parity.Attachments.Intelligence` | Phase 15 |
| `src/resolution/__tests__/attachment-diagnostics.test.ts` | Unit | Tests missing and existing attachment diagnostics for Markdown image links and embeds | `Parity.Attachments.Diagnostics`, `Diagnostic.Severity.Embed`, `Embed.Resolution.ImageTarget` | Phase 15 |
| `src/handlers/__tests__/attachment-navigation.test.ts` | Unit | Tests definition targets for Markdown image and embed attachments use indexed attachment URIs | `Parity.Attachments.NavigationHover`, `Navigation.Definition.AllLinkTypes` | Phase 15 |
| `src/handlers/__tests__/attachment-hover.test.ts` | Unit | Tests lightweight attachment hover metadata for Markdown image and embed attachments | `Parity.Attachments.NavigationHover`, `HV-002` | Phase 15 |
| `src/lsp/lsp.module.test.ts` | Unit | Tests file-operation capability advertisement and LSP handler registration | `Parity.FileOperations.CapabilityRegistration` | Phase 16 |
| `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | Unit | Tests will/did rename file-operation routing, detected vault-root confinement, rejected plans, and refresh invocation | `Parity.FileOperations.AtomicRefactor`, `Parity.FileOperations.CapabilityRegistration`, `Security.Vault.PathConfinement`, `Security.Vault.RenameConfinement` | Phase 16 |
| `src/lsp/handlers/__tests__/file-operation-refresh.service.test.ts` | Unit | Tests post-rename index, folder lookup, tag registry, reference graph, and diagnostic refresh | `Parity.FileOperations.IndexRefresh` | Phase 16 |
| `src/vault/__tests__/file-operation-planner.test.ts` | Unit | Tests vault-confined note, attachment, and folder move planning with escaping path and symlink realpath rejection | `Parity.FileOperations.MovePlannerConfinement`, `Security.Vault.PathConfinement`, `Security.Vault.RenameConfinement`, `Security.Vault.SymlinkConfinement` | Phase 18 |
| `src/resolution/__tests__/file-operation-rewriter.test.ts` | Unit | Tests syntax-preserving rewrites for moved document and attachment references | `Parity.FileOperations.ReferenceRewrite`, `Rename.Refactoring.Completeness` | Phase 16 |
| `src/resolution/__tests__/workspace-edit-validator.test.ts` | Unit | Tests all-or-nothing WorkspaceEdit validation, overlap rejection, deterministic ordering, and skipped-reference preservation | `Parity.FileOperations.AtomicValidation`, `Parity.FileOperations.SkippedAmbiguousReporting` | Phase 16 |
| `src/resolution/__tests__/file-operation-regression.test.ts` | Unit | Tests the nested vault-relative Markdown image rewrite regression discovered during Phase 16 | `Parity.FileOperations.ReferenceRewrite`, `Parity.FileOperations.AtomicRefactor` | Phase 16 |
| `src/handlers/__tests__/document-link.handler.test.ts` | Unit | Tests structural document links for unambiguous wiki, Markdown, reference-style, and attachment targets plus ambiguous/external suppression | `Parity.StructuralLSP.DocumentLinks`, `Parity.StructuralLSP.Coverage`, `Navigation.Definition.AllLinkTypes` | Phase 17 |
| `src/handlers/__tests__/folding-range.handler.test.ts` | Unit | Tests structural folding ranges for frontmatter, headings, callouts, opaque code, math, comments, Templater regions, GFM table blocks, GLFM description lists, and Pandoc fenced Divs/definition lists | `Parity.StructuralLSP.FoldingRanges`, `Parity.StructuralLSP.Coverage`, `ST-002`, `FlavorLSP.Navigation.ProfileResolution` | Phase 17, Phase 25, Phase 26, Phase 27 |
| `src/handlers/__tests__/selection-range.handler.test.ts` | Unit | Tests structural selection ranges, invalid-position rejection, opaque Templater boundaries, and CRLF offset handling | `Parity.StructuralLSP.SelectionRanges`, `Parity.StructuralLSP.Coverage`, `Security.Input.PositionValidation`, `ST-002` | Phase 17 |
| `src/lsp/handlers/__tests__/initialize.handler.test.ts` | Unit | Tests `initialize` rejects non-file root URIs before lifecycle state mutation | `Security.Vault.URISchemeAllowlist` | Phase 18 |
| `src/lsp/handlers/__tests__/initialized.handler.test.ts` | Unit | Tests `initialized` rejects non-file root URIs before vault scan starts | `Security.Vault.URISchemeAllowlist` | Phase 18 |
| `src/transport/json-rpc-dispatcher.test.ts` | Unit | Tests JSON-RPC routing, protocol errors, and rejection of dangerous prototype keys before handler dispatch | `Security.Input.PrototypePollution` | Phase 18 |
| `scripts/check-exact-dependencies.test.js` | Unit | Tests dependency range detection ignores compatibility engine ranges and reports dependency/devDependency ranges | `Security.Supply.ExactPinning` | Phase 18 |
| `src/test/ci-workflow.test.ts` | Unit | Verifies repository CI runs the root, BDD, extension, and website verification battery | `CICD.Workflow.PRGate`, `CICD.Workflow.BDDGate`, `Extension.Tests.HostCoverage` | Phase 18 |
| `src/test/bdd/bdd-layout.test.ts` | Unit | Verifies raw source files and BDD step implementation notes stay out of `docs/` while Gherkin feature specs remain in `docs/bdd/features/` | `Quality.SourceLayout.DocsBoundary`, `Process.Testing.DirectoryStructure` | Phase 18 |

---

## Integration Tests

Integration tests live under `src/test/integration/`. They test behaviour across
multiple modules or against a real filesystem fixture.

| Test File | Type | Description | Requirements Tags | Phase |
|---|---|---|---|---|
| `src/test/integration/transport.test.ts` | Integration | Tests real stdio LSP handshake, status notification, unknown-method response, shutdown, and exit | `Parity.FileOperations.CapabilityRegistration` | Phase 16 |
| `src/test/integration/navigation.test.ts` | Integration | Tests definition, references, and CodeLens through a spawned LSP server | `Navigation.Definition.AllLinkTypes`, `Navigation.References.Completeness`, `Navigation.CodeLens.Count` | Phase 10 |
| `src/test/integration/rename.test.ts` | Integration | Tests prepare-rename and rename behavior through a spawned LSP server | `Rename.Refactoring.Completeness`, `Rename.Prepare.Rejection` | Phase 11 |
| `src/test/integration/wiki-links.test.ts` | Integration | Tests wiki-link diagnostics, definition, and completion through a spawned LSP server | `Diagnostic.Severity.WikiLink`, `Navigation.Definition.AllLinkTypes`, `Completion.Trigger.Coverage` | Phase 5 |
| `src/test/integration/structural-lsp.test.ts` | Integration | Tests document links, folding ranges, and selection ranges through a spawned LSP server | `Parity.StructuralLSP.Coverage`, `Parity.StructuralLSP.DocumentLinks`, `Parity.StructuralLSP.FoldingRanges`, `Parity.StructuralLSP.SelectionRanges`, `ST-002` | Phase 17 |
| `src/test/integration/markdown-flavor.test.ts` | Integration | Tests spawned-server Markdown flavor propagation, open-document refresh, project TOML evidence, unsupported flavor rejection, Original/CommonMark parser-diagnostic-completion behavior, Obsidian parser/diagnostic behavior, GFM parser/diagnostic counts, GLFM parser/diagnostic counts, Pandoc parser/diagnostic counts, and host/bibliography-boundary classification | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.Refresh`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.HostBoundary.NonLocalReferences`, `Security.Input.ProjectConfigTOMLSafety` | Phase 20, Phase 22, Phase 23, Phase 24, Phase 25, Phase 26, Phase 27 |

---

## Website Tests

Website tests live under `website/tests/` and run from the website package with
`npm test`. They cover the static-site toolchain, local quality gate contracts,
and website-specific source layout rules.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `website/tests/app-shell.test.ts` | Unit | Verifies the starter website shell exposes a stable app summary for the Vite/Svelte/TypeScript/SCSS scaffold | `Website.Technical.Stack` | Phase W1 | ✅ implemented |
| `website/tests/tooling.test.ts` | Unit | Verifies website package scripts and required local tooling config exist for lint, typecheck, test, build, preview, and development | `Website.Technical.Stack`, `Website.Technical.SourceLayout` | Phase W1 | ✅ implemented |
| `website/tests/layout.test.ts` | Unit | Verifies implementation-like website source remains under `website/src` and tests remain under `website/tests` | `Website.Technical.SourceLayout` | Phase W1 | ✅ implemented |
| `website/tests/routes.test.ts` | Unit | Verifies required public routes have typed IDs, unique paths, SEO basics, canonical URLs, and related route links | `Website.Pages.RequiredSet`, `Website.Metadata.PageBasics` | Phase W2 | ✅ implemented |
| `website/tests/content-links.test.ts` | Unit | Verifies typed public content records cover every route and that route/outbound links validate against known routes and approved hosts | `Website.Pages.RequiredSet` | Phase W2 | ✅ implemented |
| `website/tests/seo-files.test.ts` | Unit | Verifies maintained sitemap and robots files match typed route metadata and that homepage metadata plus JSON-LD skeletons exist | `Website.Metadata.PageBasics`, `Website.StructuredData.RequiredTypes`, `Website.Indexing.SitemapRobots` | Phase W2 | ✅ implemented |
| `website/tests/shell-theme.test.ts` | Unit | Verifies required primary navigation labels plus system, light, and dark theme mode persistence helpers | `Website.Theme.ModeSelection`, `Website.Theme.SystemDefault`, `Website.Theme.Persistence` | Phase W3 | ✅ implemented |
| `website/tests/homepage.test.ts` | Unit | Verifies homepage first-viewport content, product proof, feature highlights, and accessible product asset placements | `Website.Homepage.FirstViewport`, `Website.BrandAssets.LogoUse`, `Website.BrandAssets.AccessibleText` | Phase W3 | ✅ implemented |
| `website/tests/footer.test.ts` | Unit | Verifies footer byline, Alison profile links, project links, and required inspiration attribution links | `Website.Attribution.CreatorByline`, `Website.Attribution.InspirationLinks`, `Website.Attribution.NoConfusion` | Phase W3 | ✅ implemented |
| `website/tests/mobile-layout.test.ts` | Unit | Verifies mobile homepage CSS includes overflow, wrapping, and shrink guards for narrow viewports | `Website.Mobile.CoreUseCases` | Phase W3 | ✅ implemented |
| `website/tests/docs-mobile-layout.test.ts` | Unit | Verifies docs-page CSS includes max-inline-size, hyphenation, and wrapping guards for narrow viewports | `Website.Mobile.CoreUseCases` | Phase W4 | ✅ implemented |
| `website/tests/quickstart-docs.test.ts` | Unit | Verifies quickstart and VS Code extension docs cover prerequisites, Marketplace install, activation, verification, first workflow, and troubleshooting | `Website.VSCodeExtension.MarketplaceLink`, `Website.VSCodeExtension.InstallInstructions`, `Website.VSCodeExtension.ExtensionServerDistinction` | Phase W4 | ✅ implemented |
| `website/tests/howto-faq-docs.test.ts` | Unit | Verifies how-to workflow groups, task-page shape, advanced usage boundaries, and FAQ question coverage | `Website.Pages.RequiredSet`, `Website.Metadata.PageBasics` | Phase W4 | ✅ implemented |
| `website/tests/concept-wiki.test.ts` | Unit | Verifies compact, linked, public, example-driven concept wiki records and required inspiration attribution | `Website.LLMWiki.PageShape`, `Website.LLMWiki.Terminology`, `Website.LLMWiki.PublicPrivateSeparation` | Phase W4 | ✅ implemented |
| `website/tests/ci-workflow.test.ts` | Unit | Verifies repository CI runs website install, lint, typecheck, tests, build, and build-artifact upload | `Website.CICD.PRGate` | Phase W5 | ✅ implemented |
| `website/tests/pages-workflow.test.ts` | Unit | Verifies website Pages deployment is tag triggered, guarded by main ancestry, permission scoped, and environment protected | `Website.CICD.PagesDeployment` | Phase W5 | ✅ implemented |
| `website/tests/release-evidence.test.ts` | Unit | Verifies website release workflow preserves evidence, distinguishes test and production tags, smoke-checks production output, and records changelog coverage | `Website.CICD.ReleaseEvidence` | Phase W5 | ✅ implemented |

---

## BDD Scenarios

BDD feature specs live under `docs/bdd/features/`. Step definitions and source-owned harness notes live under `src/test/bdd/step-definitions/`; `STEP-MAP.md` is the detailed phrase-to-implementation reference moved out of `docs/` by TASK-281.

| Step File | Feature File | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `src/test/bdd/step-definitions/common.steps.ts` | Shared across `docs/bdd/features/*.feature` | Provides shared vault setup, document open/change, diagnostics, completion, and assertion steps | `CICD.Workflow.BDDGate` | Phase 18 | ✅ implemented |
| `src/test/bdd/step-definitions/code-actions.steps.ts` | `docs/bdd/features/code-actions.feature` | Tests code-action availability and deterministic execution/edit expectations | `CICD.Workflow.BDDGate`, `CA-001`, `CA-002`, `CA-003` | Phase 18 | ✅ implemented |
| `src/test/bdd/step-definitions/extension-harness.steps.ts` | `docs/bdd/features/vscode-extension.feature`, `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature`, `docs/bdd/features/vscode-extension-parity.feature` | Provides deterministic extension acceptance state for activation, status, command, binary, crash, and Markdown flavor scenarios | `CICD.Workflow.BDDGate`, `Extension.Tests.HostCoverage`, `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles` | Phase 21 | ✅ implemented |
| `src/test/bdd/step-definitions/navigation.steps.ts` | `docs/bdd/features/navigation.feature` | Tests definition, reference, CodeLens, document highlight, and tag reference precision scenarios | `CICD.Workflow.BDDGate`, `Navigation.Definition.AllLinkTypes`, `Navigation.References.Completeness`, `Navigation.CodeLens.Count` | Phase 18 | ✅ implemented |
| `src/test/bdd/step-definitions/ofmarkdown-parity.steps.ts` | `docs/bdd/features/ofmarkdown-parity.feature` | Tests the structural LSP parity scenario for document links, folding ranges, and selection ranges | `Parity.StructuralLSP.Coverage`, `Parity.StructuralLSP.DocumentLinks`, `Parity.StructuralLSP.FoldingRanges`, `Parity.StructuralLSP.SelectionRanges` | Phase 17 | ✅ implemented |
| `src/test/bdd/step-definitions/tags.steps.ts` | `docs/bdd/features/tags.feature` | Tests tag indexing, hierarchy, completion, YAML equivalence, and nested-reference behavior | `CICD.Workflow.BDDGate`, `Tag.Index.Completeness`, `Tag.Hierarchy.Awareness`, `Tag.YAML.Equivalence` | Phase 18 | ✅ implemented |
| `src/test/bdd/step-definitions/vault-detection.steps.ts` | `docs/bdd/features/vault-detection.feature`, `docs/bdd/features/workspace.feature` | Tests vault detection, single-file mode, scanner, file watcher, and workspace assertions | `CICD.Workflow.BDDGate`, `Workspace.VaultDetection.Primary`, `Workspace.FileExtension.Filter` | Phase 18 | ✅ implemented |
| `src/test/bdd/step-definitions/STEP-MAP.md` | All `docs/bdd/features/*.feature` files | Documents step phrase groups next to the source-owned BDD harness instead of under `docs/bdd/steps/` | `Quality.SourceLayout.DocsBoundary` | Phase 18 | ✅ implemented |

---

## Extension Tests

Extension tests live under `extension/src/` and use a separate test
infrastructure from the server's Bun-based tests. Pure extension unit tests run
with Node's test runner and `tsx`; VS Code API integration tests run inside the
Extension Development Host through `@vscode/test-electron`.

> [!NOTE] Test Runner
> `npm test` runs pure extension tests from `extension/`. `npm run test:host`
> launches VS Code and runs all host fixtures: `.obsidian/`,
> `.flavor-grenade.toml`, and generic Markdown.

### Markdown Flavor Test Plan By Level

| Level | Planned coverage | Primary files | Status |
|---|---|---|---|
| Unit | Pure flavor enum/schema, selector state, auto-detection resolver, settings target choice, refresh triggers, dialect profile registry, contribution scoping, server configuration handling, and per-LSP-surface fixture expectations. | `extension/src/markdown-flavor.test.ts`, `extension/src/client-options.test.ts`, `src/parser/__tests__/markdown-flavor-profiles.test.ts`, `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/lsp/handlers/__tests__/configuration.handler.test.ts`, `extension/test/contributions/*.test.ts` | ✅ profile registry and server propagation implemented; remaining extension and parser fixture units planned |
| Integration | Spawned-server or multi-module tests that prove effective flavor reaches parser, diagnostics, completion, navigation, hover, semantic tokens, rename, host-boundary classification, and open-document refresh. | `src/test/integration/markdown-flavor.test.ts`, `src/test/integration/transport.test.ts`, `src/test/integration/navigation.test.ts` | ✅ server propagation implemented; per-surface dialect fixtures planned |
| E2E | Root BDD scenarios prove acceptance state; VS Code Extension Development Host scenarios prove visible selector behavior, quick-pick choices, workspace/user persistence, language preservation, and server refresh from real extension wiring. | `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature`, `extension/src/test/suite/markdown-flavor.test.js`, `extension/src/test/suite/index.js` | ✅ root BDD implemented; extension host planned |
| Verification | Automated gates that prove the test battery, `FlavorLSP.*` matrix rows, validation artifacts, and docs stay wired into CI and local checks. | `.github/workflows/ci.yml`, `src/test/ci-workflow.test.ts`, `cucumber.yaml`, `extension/package.json` scripts | ✅ root verification implemented |
| Validation | Acceptance-level evidence that the researched flavor list, dialect profiles, and non-local host-boundary dispositions match product requirements and source research. | `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature`, `docs/research/*.md`, `docs/test/evidence/markdown-flavor-*.md`, `extension/docs/tests/evidence/markdown-flavor-*.md` | ✅ root validation implemented; extension validation planned |

### Extension Unit Tests

Extension unit tests exercise extension-side logic only, usually through pure
helpers or injected VS Code facades.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `extension/src/language-mode.test.ts` | Unit | Legacy tests for the retired `ofmarkdown` language-mode controller; replace with Markdown flavor selector tests | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Refresh` | Phase E6, Phase E14 | 🔴 obsolete |
| `extension/src/markdown-flavor.test.ts` | Unit | Planned tests for Markdown flavor selector choices, required flavor ids, auto-detection, override persistence, server propagation, refresh triggers, and manual-language safety | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Selector`, `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.AutoDetection`, `Extension.MarkdownFlavor.OverridePersistence`, `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.ManualLanguageSafety`, `Extension.MarkdownFlavor.Refresh` | Markdown flavor requirements | 📋 planned |
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | Unit | Tests source-backed dialect profiles, profile security metadata, and research-trace evidence for every required explicit Markdown flavor | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Profile.SignatureCoverage`, `Security.Parser.FlavorProfileResourceSafety` | Phase 19 | ✅ implemented |
| `src/lsp/handlers/__tests__/configuration.handler.test.ts` | Unit | Tests effective Markdown flavor settings propagate to server analysis, refresh open documents, validate project TOML and resource payloads, and classify host boundaries | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.Refresh`, `FlavorLSP.HostBoundary.NonLocalReferences`, `Security.Input.FlavorPropagationPayload`, `Security.Input.ProjectConfigTOMLSafety` | Phase 20 | ✅ implemented |
| `extension/src/activation-gate.test.ts` | Unit | Tests activation manifest events, vault-marker detection, generic Markdown idle startup, Markdown wake, flavor selector command wake, and explicit command wake decisions | `Extension.Activation.MarkerEvents`, `Extension.Activation.VaultPrecision` | Phase E7 | 🔴 needs update |
| `extension/src/command-bridges.test.ts` | Unit | Tests command bridge manifest events, native reference and link bridge calls, payload validation, graph action bridges, vault reveal, and diagnostic copy behavior | `Extension.CommandBridges.NativeUI`, `Extension.CommandBridges.PayloadValidation`, `Extension.CommandBridges.GraphActions` | Phase E8 | ✅ implemented |
| `extension/src/server-command.test.ts` | Unit | Tests 2-tier binary resolution: user setting override, bundled path, Windows `.exe` suffix | `Extension.Binary.Resolution`, `Extension.Binary.PlatformSuffix` | Phase E2 | ✅ implemented |
| `extension/src/status-bar.test.ts` | Unit | Tests status text, rich tooltip detail, disabled/crashed/misconfigured states, quick actions, and sanitized diagnostic text | `Extension.Status.Diagnostics`, `Extension.Status.QuickActions` | Phase E10 | ✅ implemented |
| `extension/src/status-actions.test.ts` | Unit | Tests status quick-pick action item creation for restart, rebuild, output, diagnostic copy, and vault reveal actions | `Extension.Status.QuickActions` | Phase E10 | ✅ implemented |
| `extension/src/troubleshooting.test.ts` | Unit | Tests the troubleshooting document URL and required recovery topics | `Extension.Status.Diagnostics`, `Extension.Status.QuickActions` | Phase E10 | ✅ implemented |
| `extension/src/workspace-environment.test.ts` | Unit | Tests Restricted Mode, virtual workspace, local, and remote workspace environment classification | `Extension.Workspace.EnvironmentModes`, `Extension.Status.Diagnostics` | Phase E13 | ✅ implemented |
| `extension/src/extension-startup.test.ts` | Unit | Tests the shared command startup path checks disabled workspace status before spawning the server | `Extension.Workspace.EnvironmentModes` | Phase 18 | ✅ implemented |
| `extension/test/host-update-wait.test.ts` | Unit | Tests the extension host runner detects active Windows VS Code updater processes before launching the test Electron runtime | `Extension.Tests.HostCoverage`, `CICD.Workflow.PRGate` | Phase 18 | ✅ implemented |
| `extension/test/marketplace/readme-assets.test.ts` | Unit | Tests Marketplace README references every required OFMarkdown visual with supported local image formats | `Extension.Marketplace.OFMProof`, `Extension.Marketplace.AssetPackaging` | Phase E11 | ✅ implemented |
| `extension/test/marketplace/vsix-assets.test.ts` | Unit | Tests the Marketplace asset verification script and packaged output include every required README visual | `Extension.Marketplace.AssetPackaging` | Phase E11 | ✅ implemented |
| `extension/test/package-targets/server-binary.test.ts` | Unit | Tests package-target server binary mapping, wrong/missing/duplicate binary rejection, and real VSIX archive inspection | `Extension.Packaging.TargetBinaryValidation` | Phase E14 | ✅ implemented |
| `extension/test/contributions/snippets.test.ts` | Unit | Legacy tests for OFMarkdown-only snippet contribution scope; rewrite around Markdown flavor/context keys | `Extension.Contributions.FlavorScoped` | Phase E12 | 🔴 needs update |
| `extension/test/contributions/language-configuration.test.ts` | Unit | Legacy tests for OFMarkdown language configuration scope; rewrite or retire because flavor must not rely on a custom language id | `Extension.Contributions.FlavorScoped` | Phase E12 | 🔴 needs update |
| `extension/test/contributions/keybindings.test.ts` | Unit | Legacy tests for OFMarkdown-scoped keybindings; rewrite around selector/context-key preconditions | `Extension.Contributions.FlavorScoped` | Phase E12 | 🔴 needs update |
| `extension/test/contributions/ofmarkdown-isolation.test.ts` | Unit | Legacy tests for generic Markdown isolation from OFMarkdown-only contributions; rewrite for flavor-scoped isolation across required flavors | `Extension.Contributions.FlavorScoped` | Phase E12 | 🔴 needs update |
| `extension/src/commands.test.ts` | Unit | Tests command registration and that each command calls the correct LanguageClient method | `Extension.Commands.Registration` | Phase E3 | 📋 planned |

### Extension Integration Tests

Extension integration tests require the VS Code Extension Development Host launched via `@vscode/test-electron`.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `extension/src/test/suite/index.js` | Host runner | Runs all extension-host suites inside isolated temp copies of the fixture workspaces | `Extension.Tests.HostCoverage` | Phase E9 | ✅ implemented |
| `extension/src/test/suite/extension-host.test.js` | Integration | Verifies the development host loads Flavor Grenade and registers lifecycle plus bridge commands | `Extension.Tests.HostCoverage`, `Extension.Commands.Registration` | Phase E9 | ✅ implemented |
| `extension/src/test/suite/activation-language-mode.test.js` | Integration | Legacy host tests for vault startup, `.flavor-grenade.toml` startup, generic Markdown idle behavior, OFMarkdown promotion, and manual non-Markdown preservation; replace with Markdown flavor host coverage | `Extension.Activation.VaultPrecision`, `Extension.MarkdownFlavor.Refresh`, `Extension.Tests.HostCoverage` | Phase E9 | 🔴 obsolete |
| `extension/src/test/suite/markdown-flavor.test.js` | Integration | Planned host tests for selector UI, required flavor choices, workspace/user override persistence, generic CommonMark fallback, Obsidian auto-detection, and manual-language safety | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Selector`, `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.OverridePersistence`, `Extension.MarkdownFlavor.Refresh`, `Extension.Tests.HostCoverage` | Markdown flavor requirements | 📋 planned |
| `extension/src/test/suite/command-bridges.test.js` | Integration | Tests native bridge commands with valid payloads and invalid payload rejection in the VS Code host | `Extension.CommandBridges.NativeUI`, `Extension.CommandBridges.PayloadValidation`, `Extension.Tests.HostCoverage` | Phase E9 | ✅ implemented |
| `extension/src/test/suite/status-failure.test.js` | Integration | Tests troubleshooting command/settings visibility, development-host status presentation transitions, quick actions, and diagnostic copy text | `Extension.Status.Diagnostics`, `Extension.Status.QuickActions`, `Extension.Tests.HostCoverage` | Phase E10 | ✅ implemented |
| `extension/docs/features/workspace-environments.md` | Manual | Documents local Windows, macOS, Linux, WSL, SSH, Dev Container, Restricted Mode, and virtual workspace smoke checks | `Extension.Workspace.EnvironmentModes`, `Extension.Status.Diagnostics` | Phase E13 | ✅ implemented |
| `extension/src/__tests__/lifecycle.test.ts` | Integration | Tests clean deactivation, config change restart, crash recovery | `Extension.Lifecycle.Restart` | Phase E3 | 📋 planned |

### Extension BDD Scenarios

Extension BDD acceptance scenarios are implemented in the shared Cucumber
harness under `src/test/bdd/step-definitions/extension-harness.steps.ts`.
VS Code API execution remains covered by the extension host suite above.

| Feature File | Step File | Description | Phase | Status |
|---|---|---|---|---|
| `docs/bdd/features/vscode-extension.feature` | `src/test/bdd/step-definitions/extension-harness.steps.ts` | 13 acceptance scenarios covering activation, status bar, commands, binary resolution, crash recovery, and lifecycle behavior | Phase 18 | ✅ implemented |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `src/test/bdd/step-definitions/extension-harness.steps.ts` | 7 acceptance scenario groups covering Markdown language preservation, flavor selection, override persistence, auto-detection, and manual-language safety | Markdown flavor requirements | ✅ implemented |
| `docs/bdd/features/markdown-flavor-dialects.feature` | `src/test/bdd/step-definitions/extension-harness.steps.ts` | 5 acceptance scenario groups covering Original Markdown, CommonMark, researched profile signatures, LSP surface contracts, and host boundaries for every researched Markdown flavor | Markdown flavor requirements | ✅ implemented |
| `docs/bdd/features/vscode-extension-parity.feature` | `src/test/bdd/step-definitions/extension-harness.steps.ts` | 6 acceptance scenarios covering extension parity, activation precision, membership refresh, and package behavior | Phase 18 | ✅ implemented |

---

## Fixture Vaults

Test fixture vaults live under `tests/fixtures/vaults/`. Each subdirectory is a minimal vault structure used by integration and BDD tests.

| Fixture | Description | First Used |
|---|---|---|
| `tests/fixtures/vaults/empty/` | An empty vault directory (`.gitkeep` only) — used to verify vault detection boundary conditions | Phase 1 |

---

## Adding a New Test

When you add a new test file:

1. Add the file to this index in the appropriate section.
2. Add a row to [[docs/test/matrix]] mapping the new test to its Planguage requirement tags.
3. Commit both the test file and the updated index/matrix in the same commit.
4. Run `scripts/update-test-index.sh` if available to auto-populate (Phase 3+).

> [!WARNING]
> A test file that exists in `tests/` but does not appear in this index is an index maintenance violation (see [[docs/requirements/development-process#Process.TestIndex.Matrix]]). The matrix entry must exist before the PR is merged.

---

## Related Documents

- [[docs/test/matrix]] — Planguage requirements × test files × status traceability matrix
- [[docs/requirements/index]] — Master Planguage tag index (source of truth for tag names)
- [[docs/requirements/development-process#Process.Testing.DirectoryStructure]] — Test file location policy
- [[docs/requirements/development-process#Process.TestIndex.Matrix]] — Matrix maintenance requirement
- [[docs/plans/phase-01-scaffold]] — Phase 1 task list where first tests are introduced
