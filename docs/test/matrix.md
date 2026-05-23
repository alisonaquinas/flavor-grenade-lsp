---
title: Requirements × Tests Matrix
tags:
  - test/matrix
aliases:
  - Traceability Matrix
  - Requirements Coverage Matrix
---

# Requirements × Tests Matrix

> [!NOTE] Auto-update
> Auto-update via `scripts/update-test-index.sh` (stub until Phase 3; fully implemented in Phase 3). Always commit matrix updates in the same commit as the test that triggered them.

This matrix maps every Planguage requirement tag to the test files that provide evidence for it, the current coverage status, the phase in which coverage was introduced, and any notes about partial coverage or deferred work.

**Status legend:**

| Status | Meaning |
|---|---|
| ⏳ planned | Requirement defined; no test written yet |
| 🔴 failing | Test written; currently fails (RED phase) |
| ✅ passing | Test written and passing (GREEN phase) |
| ⬜ not-yet-written | Phase for this requirement not started |

---

## Code Quality Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Quality.SOLID.SingleResponsibility` | Each class has exactly one reason to change | — | ⏳ planned | Phase 1 | Verified by design review and ESLint rules, not by a dedicated test file |
| `Quality.SOLID.DependencyInversion` | Cross-module deps point to abstractions, not concretes | — | ⏳ planned | Phase 1 | Enforced by ESLint `import/no-internal-modules`; no separate test file |
| `Quality.Coherence.OneClassPerFile` | Each non-barrel `.ts` file exports exactly one primary entity | — | ⏳ planned | Phase 1 | Enforced by ESLint; no separate test file |
| `Quality.Coupling.ModuleBoundaries` | Cross-module imports only via barrel `index.ts` | — | ⏳ planned | Phase 1 | Enforced by ESLint `import/no-internal-modules` |
| `Quality.Docs.Docstrings` | All exported symbols carry JSDoc docstrings | — | ⏳ planned | Phase 1 | Enforced by `eslint-plugin-jsdoc`; verified by `bun run lint` |
| `Quality.Lint.ZeroWarnings` | All linters produce 0 errors and 0 warnings | — | ⏳ planned | Phase 1 | Verified by `bun run lint --max-warnings 0`; gate script |
| `Quality.Types.StrictMode` | TypeScript strict mode; `tsc --noEmit` exits 0 | — | ⏳ planned | Phase 1 | Verified by `bun run typecheck`; gate script |
| `Quality.TDD.StrictRedGreen` | Every implementation preceded by a failing test | — | ⏳ planned | Phase 1 | Verified by git log discipline; red commit before green commit |
| `Quality.SourceLayout.DocsBoundary` | Docs may contain specs but not raw source files or source-like BDD implementation notes | `src/test/bdd/bdd-layout.test.ts`, `src/test/bdd/step-definitions/STEP-MAP.md` | ✅ passing | Phase 18 | TASK-281 keeps `.feature` specs in `docs/bdd/features/` while moving step implementation notes to the BDD harness tree |

---

## CI/CD Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `CICD.Workflow.PRGate` | Every PR must pass all CI checks before merge | `.github/workflows/ci.yml`, `src/test/ci-workflow.test.ts`, `extension/test/host-update-wait.test.ts` | ✅ passing | Phase 13, Phase 18 | TASK-282 expands PR CI to root tests, BDD scenarios, extension checks, website checks, docs lint, dependency policy, format, and build; BUG-042 adds local host-gate preflight coverage for stale Windows VS Code updater processes |
| `CICD.Workflow.BDDGate` | Default Cucumber BDD gate executes all checked-in scenarios | `.github/workflows/ci.yml`, `src/test/ci-workflow.test.ts`, `cucumber.yaml`, `docs/bdd/features/**/*.feature`, `src/test/bdd/step-definitions/**/*.ts` | ✅ passing | Phase 18 | TASK-282 adds the `BDD scenarios` pull-request check; TASK-280 restored the default `bun run bdd` local gate |
| `CICD.Markdown.DocsFolderLinting` | `docs/` markdown linted by markdownlint-obsidian in CI | — | ⏳ planned | Phase 13 | Verified by CI `markdown-lint-docs` job |
| `CICD.Markdown.SourceLinting` | Non-docs markdown linted by markdownlint-cli2 in CI | — | ⏳ planned | Phase 13 | Verified by CI `markdown-lint-other` job |
| `CICD.Publish.OIDC` | Publishing uses OIDC provenance attestation | — | ⏳ planned | Phase 13 | Verified by `npm audit signatures` post-publish |
| `CICD.Publish.Trigger` | Publish triggered only by semver tag push to `main` | — | ⏳ planned | Phase 13 | Enforced by `release.yml` `on: push: tags:` trigger |
| `CICD.PreCommit.Gate` | `lefthook` pre-commit runs typecheck + lint + format + test | — | ⏳ planned | Phase 1 | Verified by `lefthook install` + commit attempt |

---

## Website Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Website.Technical.Stack` | Website uses Vite, Svelte, strict TypeScript, SCSS, and static build scripts | `website/tests/app-shell.test.ts`, `website/tests/tooling.test.ts` | ✅ passing | Phase W1 | W1 covers the starter app shell and package-script/tooling contract; later phases add route, SEO, and content tests |
| `Website.Technical.SourceLayout` | Website implementation source lives under `website/src` and tests live under `website/tests` | `website/tests/tooling.test.ts`, `website/tests/layout.test.ts` | ✅ passing | Phase W1 | Layout guard ignores generated output and docs while blocking implementation-like drift |
| `Website.Pages.RequiredSet` | Required public page categories are represented by generated routes and content records | `website/tests/routes.test.ts`, `website/tests/content-links.test.ts` | ✅ passing | Phase W2 | W2 provides typed route/content records; later phases render richer page bodies |
| `Website.Metadata.PageBasics` | Public pages have H1, title, description, and canonical URL metadata | `website/tests/routes.test.ts`, `website/tests/seo-files.test.ts` | ✅ passing | Phase W2 | Route metadata validation covers every route and homepage social metadata |
| `Website.StructuredData.RequiredTypes` | Required JSON-LD schema types are emitted for appropriate page intent | `website/tests/seo-files.test.ts` | ✅ passing | Phase W2 | Skeleton coverage includes WebSite, SoftwareApplication, FAQPage, HowTo, and BreadcrumbList |
| `Website.Indexing.SitemapRobots` | Crawl files exist and list intended public routes | `website/tests/seo-files.test.ts` | ✅ passing | Phase W2 | Maintained static files are checked against generated sitemap and robots output |
| `Website.Theme.ModeSelection` | Theme control exposes system, light, and dark modes | `website/tests/shell-theme.test.ts` | ✅ passing | Phase W3 | Unit coverage verifies the supported modes and resolver behavior |
| `Website.Theme.SystemDefault` | First-time visitors default to system preference | `website/tests/shell-theme.test.ts` | ✅ passing | Phase W3 | Theme helper defaults to `system` with no stored preference |
| `Website.Theme.Persistence` | Manual light and dark choices persist across reloads | `website/tests/shell-theme.test.ts` | ✅ passing | Phase W3 | Storage helper persists manual choices and clears system override |
| `Website.Homepage.FirstViewport` | Homepage communicates product, category, value, and actions immediately | `website/tests/homepage.test.ts` | ✅ passing | Phase W3 | Content model verifies H1, category, CTAs, and product proof |
| `Website.BrandAssets.LogoUse` | Existing Flavor Grenade assets are used in required placements | `website/tests/homepage.test.ts` | ✅ passing | Phase W3 | Header, hero, and social asset placements are modeled and rendered |
| `Website.BrandAssets.AccessibleText` | Product images and proof media have useful accessible text | `website/tests/homepage.test.ts` | ✅ passing | Phase W3 | Asset placement data requires descriptive alt text |
| `Website.Attribution.CreatorByline` | Footer credits Alison Aquinas with required profile links | `website/tests/footer.test.ts` | ✅ passing | Phase W3 | Footer test covers byline and Alison website/GitHub/LinkedIn links |
| `Website.Attribution.InspirationLinks` | Footer links Karpathy, Obsidian, and Marksman inspiration sources | `website/tests/footer.test.ts` | ✅ passing | Phase W3 | Footer test covers required descriptive inspiration links |
| `Website.Attribution.NoConfusion` | Attribution copy avoids implying endorsement or affiliation | `website/tests/footer.test.ts` | ✅ passing | Phase W3 | Footer rendering includes lineage/prior-art clarification copy |
| `Website.Mobile.CoreUseCases` | Mobile visitors can identify product, reach setup, and inspect proof without horizontal overflow | `website/tests/mobile-layout.test.ts`, `website/tests/docs-mobile-layout.test.ts` | ✅ passing | Phase W3, Phase W4 | Regression guards added after BUG-026 homepage and BUG-027 docs visual smoke findings |
| `Website.VSCodeExtension.MarketplaceLink` | VS Code extension install path links to the Visual Studio Marketplace | `website/tests/quickstart-docs.test.ts` | ✅ passing | Phase W4 | Quickstart and extension docs both expose the Marketplace path |
| `Website.VSCodeExtension.InstallInstructions` | Extension docs explain install, activation, vault open, and verification | `website/tests/quickstart-docs.test.ts` | ✅ passing | Phase W4 | Coverage requires prerequisites, OFMarkdown activation, first workflow, and troubleshooting |
| `Website.VSCodeExtension.ExtensionServerDistinction` | Public docs distinguish VS Code extension behavior from bundled language-server behavior | `website/tests/quickstart-docs.test.ts` | ✅ passing | Phase W4 | Extension page explains packaging, activation ownership, and server delegation |
| `Website.LLMWiki.PageShape` | Concept pages are compact, linked, focused, and example-driven | `website/tests/concept-wiki.test.ts` | ✅ passing | Phase W4 | Concept wiki validator checks question, answer length, examples, and related links |
| `Website.LLMWiki.Terminology` | Public concept content preserves stable Flavor Grenade, OFM, and Obsidian Vault vocabulary | `website/tests/concept-wiki.test.ts` | ✅ passing | Phase W4 | Concept records avoid deprecated or internal planning terminology |
| `Website.LLMWiki.PublicPrivateSeparation` | Public website docs avoid internal planning artifacts and ticket language | `website/tests/concept-wiki.test.ts` | ✅ passing | Phase W4 | Concept wiki validator rejects internal phase/ticket wording |
| `Website.CICD.PRGate` | Repository CI runs website install, lint, typecheck, tests, build, and artifact upload for PR and branch gates | `website/tests/ci-workflow.test.ts` | ✅ passing | Phase W5 | Workflow inspection verifies the `website-checks` job and `website-dist` artifact contract |
| `Website.CICD.PagesDeployment` | Website Pages deployment is tag triggered, main-branch guarded, minimally permissioned, and environment protected | `website/tests/pages-workflow.test.ts` | ✅ passing | Phase W5 | Workflow inspection verifies tag trigger, `git merge-base` guard, official Pages actions, permissions, environment, and concurrency |
| `Website.CICD.ReleaseEvidence` | Website release workflow preserves evidence, distinguishes test and production tags, and smoke-checks release output | `website/tests/release-evidence.test.ts` | ✅ passing | Phase W5 | Workflow inspection verifies test-tag dry runs, `website-release-evidence`, homepage/quickstart/sitemap/robots/Marketplace smoke terms, and changelog coverage |

---

## Development Process Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Process.Branching.MainReleasesOnly` | `main` receives only release/hotfix merges | — | ⏳ planned | Phase 13 | Enforced by branch protection; not a unit test |
| `Process.Testing.DirectoryStructure` | Tests and harnesses live in their package-owned trees; Gherkin specs remain in `docs/bdd/features/` | `src/test/bdd/bdd-layout.test.ts`, `src/test/bdd/step-definitions/**/*.ts`, `docs/bdd/features/**/*.feature` | ✅ passing | Phase 18 | Current layout allows source-adjacent unit tests, shared harnesses under `src/test/`, website tests under `website/tests/`, extension tests under `extension/`, and feature specs under docs |
| `Process.TestIndex.Matrix` | `docs/test/matrix.md` updated for every new test file | `docs/test/index.md`, `docs/test/matrix.md` | ✅ passing | Phase 18 | CHORE-102 backfills BDD harness and docs-boundary traceability for TASK-280/TASK-281 |
| `Process.Scripts.Automation` | Repetitive procedures automated in `scripts/` | — | ⏳ planned | Phase 1 | Advisory metric; verified by `scripts/` directory content |
| `Process.BinaryFiles.LFS` | All binary files tracked via Git LFS | — | ⏳ planned | Phase 1 | Verified by `git lfs ls-files` vs `git ls-files` cross-check |

---

## Wiki-Link Resolution Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Link.Wiki.StyleBinding` | Completions/renames match configured wiki link style | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Wiki.AliasResolution` | YAML `aliases:` values are valid link targets | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Resolution.ModeScope` | Single-file mode suppresses cross-file link resolution | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Inline.URLSkip` | Inline links to non-markdown URLs produce no FG001 | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Resolution.IgnoreGlob` | `.gitignore`-matched files absent from completions | — | ⬜ not-yet-written | Phase 5 | |

---

## Embed Resolution Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Embed.Resolution.MarkdownTarget` | `![[file.md]]` embeds resolve to VaultIndex docs | — | ⬜ not-yet-written | Phase 7 | |
| `Embed.Resolution.ImageTarget` | `![[image.png]]` embeds produce no FG001 | `src/resolution/__tests__/embed-resolver.test.ts`, `src/resolution/__tests__/attachment-diagnostics.test.ts` | ✅ passing | Phase 15 | Phase 15 verifies indexed attachments resolve through embed diagnostics, including non-image attachments |
| `Embed.HeadingEmbed.Resolution` | `![[doc#heading]]` validates both doc and heading | — | ⬜ not-yet-written | Phase 7 | |
| `Embed.BlockEmbed.Resolution` | `![[doc#^blockid]]` validates anchor exists in target | `src/resolution/__tests__/embed-resolver.test.ts`, `docs/bdd/features/embeds.feature` | ✅ passing | Phase 7 | Unit evidence passes and the full default BDD suite passes |

---

## Tag Indexing Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Tag.Index.Completeness` | All `#tag` occurrences indexed by VaultIndex | — | ⬜ not-yet-written | Phase 6 | |
| `Tag.Hierarchy.Awareness` | Tag index supports parent-tag queries | — | ⬜ not-yet-written | Phase 6 | |
| `Tag.YAML.Equivalence` | `tags:` frontmatter indexed identically to inline tags | — | ⬜ not-yet-written | Phase 6 | |
| `Tag.Completion.Unicode` | Tag completion supports Unicode and emoji | — | ⬜ not-yet-written | Phase 6 | |

---

## Block Reference Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Block.Anchor.Indexing` | All valid `^blockid` anchors appear in OFMIndex.blockAnchors | `src/parser/__tests__/block-anchor-parser.test.ts`, `src/parser/__tests__/ofm-parser.integration.test.ts` | ✅ passing | Phase 8 | Covers line-end, heading, standalone, duplicate, and opaque-region behavior |
| `Block.CrossRef.Diagnostic` | `[[doc#^nonexistent]]` produces FG005; suppressed in single-file mode | `src/resolution/__tests__/block-ref-resolver.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `docs/bdd/features/block-references.feature` | ✅ passing | Phase 8 | Unit evidence passes and the full default BDD suite passes |
| `Block.Completion.Offer` | After `[[doc#^`, completion offers known block IDs | `src/completion/__tests__/context-analyzer.test.ts`, `src/completion/__tests__/completion-router.test.ts`, `docs/bdd/features/block-references.feature` | ✅ passing | Phase 8 | Covers intra-document and cross-document block completion contexts |
| `Block.Anchor.Lineend` | Only valid line-end or standalone `^id` patterns are treated as block anchors | `src/parser/__tests__/block-anchor-parser.test.ts` | ✅ passing | Phase 8 | Mid-line, invalid-character, and opaque-region tokens are rejected |

---

## Completion Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Completion.Candidates.Cap` | Candidate list capped at `completion.candidates` config value | — | ⬜ not-yet-written | Phase 9 | |
| `Completion.Trigger.Coverage` | All trigger characters return candidates in context | `src/completion/__tests__/context-analyzer.test.ts`, `src/completion/__tests__/completion-router.test.ts` | ✅ passing | Phase 14 | Phase 14 adds Markdown `(` URL and heading completion trigger coverage |
| `Completion.CalloutType.Coverage` | 13 primary Obsidian callout types offered at `> [!` | — | ⬜ not-yet-written | Phase 9 | |
| `Completion.WikiStyle.Binding` | Completion items conform to active wiki link style | — | ⬜ not-yet-written | Phase 9 | |

---

## Diagnostic Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Diagnostic.Severity.WikiLink` | FG001/FG002 carry Error severity | — | ⬜ not-yet-written | Phase 5 | |
| `Diagnostic.Severity.Embed` | FG004 carries Warning severity | `src/resolution/__tests__/attachment-diagnostics.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts` | ✅ passing | Phase 15 | Phase 15 covers missing Markdown image attachments and existing embed warning semantics |
| `Diagnostic.Code.Assignment` | Each diagnostic carries its assigned FG-prefixed code | — | ⬜ not-yet-written | Phase 5 | |
| `Diagnostic.Debounce.Latency` | Diagnostics published within 500 ms of last change | — | ⬜ not-yet-written | Phase 5 | Performance test; requires instrumented LSP client |
| `Diagnostic.Ambiguous.RelatedInfo` | FG002 lists all duplicate definition locations in `relatedInformation` | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/resolution/__tests__/markdown-link-diagnostics.test.ts`, `src/test/integration/wiki-links.test.ts` | ✅ passing | Phase 14 | Existing diagnostic coverage supplies the ambiguity evidence that Phase 17 document links intentionally defer to |
| `Diagnostic.SingleFile.Suppression` | All cross-file diagnostics suppressed in single-file mode | — | ⬜ not-yet-written | Phase 5 | |

---

## Navigation Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Navigation.Definition.AllLinkTypes` | Go-to-definition works for all link types | `src/handlers/__tests__/markdown-link-navigation.test.ts`, `src/handlers/__tests__/attachment-navigation.test.ts`, `src/test/integration/structural-lsp.test.ts` | ✅ passing | Phase 17 | Phase 14 covers Markdown links; Phase 15 adds embed and Markdown image attachment targets; Phase 17 adds document-link integration evidence |
| `Navigation.References.Completeness` | Find-references returns all references in folder | `src/handlers/__tests__/markdown-link-navigation.test.ts`, `src/resolution/__tests__/ref-graph-markdown-links.test.ts` | ✅ passing | Phase 14 | Phase 14 covers Markdown heading anchors and label references |
| `Navigation.CodeLens.Count` | Each heading displays accurate reference count code lens | — | ⬜ not-yet-written | Phase 10 | |

---

## Hover Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `HV-002` | Embed hover includes resolved path and detected file type | `src/handlers/__tests__/attachment-hover.test.ts`, `src/handlers/__tests__/hover.handler.test.ts` | ✅ passing | Phase 15 | Phase 15 adds lightweight metadata hover for embed and Markdown image attachments |

---

## Rename Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Rename.Refactoring.Completeness` | All cross-document references updated in single workspace edit | `src/handlers/__tests__/markdown-heading-rename.test.ts`, `src/resolution/__tests__/file-operation-rewriter.test.ts`, `src/test/integration/rename.test.ts` | ✅ passing | Phase 16 | Phase 14 covers Markdown heading anchor edits during heading rename; Phase 16 adds moved-target rewrite coverage |
| `Rename.Prepare.Rejection` | `prepareRename` returns `null` for non-renameable positions | — | ⬜ not-yet-written | Phase 11 | |
| `Rename.StyleBinding.Consistency` | Rename updates only references bound via active wiki style | — | ⬜ not-yet-written | Phase 11 | |

---

## Semantic Token Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `ST-002` | OFM constructs inside opaque regions are not treated as structural tokens | `src/parser/__tests__/opaque-region-marker.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts`, `src/handlers/__tests__/selection-range.handler.test.ts`, `src/test/integration/structural-lsp.test.ts` | ✅ passing | Phase 17 | Phase 17 extends opaque-region coverage to Templater blocks and structural LSP range boundaries |

---

## OFMarkdown Parity Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Parity.MarkdownLinks.ParseCoverage` | Supported standard Markdown link forms become typed parser/index data | `src/parser/__tests__/markdown-link-parser.test.ts`, `src/parser/__tests__/ofm-parser.integration.test.ts` | ✅ passing | Phase 14 | Covers inline links, image links, reference labels, definitions, and opaque-region suppression |
| `Parity.MarkdownLinks.TargetClassification` | Markdown link targets are classified before resolution and diagnostics | `src/resolution/__tests__/markdown-target-classifier.test.ts` | ✅ passing | Phase 14 | Covers local docs, fragments, attachments, external URLs, unsupported schemes, and traversal underflow |
| `Parity.MarkdownLinks.LocalResolution` | Local standard Markdown links resolve through vault rules | `src/resolution/__tests__/markdown-link-oracle.test.ts`, `src/resolution/__tests__/ref-graph-markdown-links.test.ts`, `src/handlers/__tests__/markdown-link-navigation.test.ts` | ✅ passing | Phase 14 | Covers file targets, file-plus-heading targets, and label-backed document refs |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Same-document Markdown anchors support definition, diagnostics, references, and rename | `src/resolution/__tests__/markdown-link-oracle.test.ts`, `src/resolution/__tests__/markdown-link-diagnostics.test.ts`, `src/handlers/__tests__/markdown-link-navigation.test.ts`, `src/handlers/__tests__/markdown-heading-rename.test.ts` | ✅ passing | Phase 14 | Covers heading lookup, missing heading diagnostics, references, and rename edits |
| `Parity.HeadingAmbiguity.Diagnostics` | Duplicate heading anchors produce diagnostics with related locations | `src/resolution/__tests__/markdown-link-oracle.test.ts`, `src/resolution/__tests__/markdown-link-diagnostics.test.ts` | ✅ passing | Phase 14 | Covers ambiguous same-document heading anchors |
| `Parity.MarkdownLinks.ReferenceGraph` | Markdown links, images, labels, and definitions join RefGraph | `src/resolution/__tests__/ref-graph-markdown-links.test.ts` | ✅ passing | Phase 14 | Covers standalone link definitions and image refs; attachment navigation remains Phase 15 |
| `Parity.MarkdownLinks.Completion` | Markdown URL contexts return document and heading completion candidates | `src/completion/__tests__/context-analyzer.test.ts`, `src/completion/__tests__/completion-router.test.ts` | ✅ passing | Phase 14 | Covers `(` trigger, same-document heading context, external URL suppression, and nested source relativity |
| `Parity.MarkdownLinks.NavigationAndReferences` | Markdown link and label forms support definition and references | `src/handlers/__tests__/markdown-link-navigation.test.ts` | ✅ passing | Phase 14 | Covers inline file links, same-document anchors, label definitions, and label uses; Markdown image attachment definition is Phase 15 |
| `Parity.MarkdownLinks.RenameAnchors` | Heading rename updates Markdown anchors | `src/handlers/__tests__/markdown-heading-rename.test.ts` | ✅ passing | Phase 14 | Covers same-document and file-plus-fragment Markdown anchors |
| `Parity.Attachments.Intelligence` | Attachments referenced by embeds or Markdown image links support completion, diagnostics, definition, and hover metadata | `src/vault/__tests__/vault-index.test.ts`, `src/vault/__tests__/vault-scanner.test.ts`, `src/vault/__tests__/file-watcher.test.ts`, `src/completion/__tests__/completion-router.test.ts`, `src/completion/__tests__/embed-completion-provider.test.ts`, `src/resolution/__tests__/attachment-diagnostics.test.ts`, `src/handlers/__tests__/attachment-navigation.test.ts`, `src/handlers/__tests__/attachment-hover.test.ts`, `src/vault/__tests__/attachment-config.test.ts` | ✅ passing | Phase 15 | End-to-end unit evidence across indexing, completion, diagnostics, definition, hover, and config hints |
| `Parity.Attachments.IndexCoverage` | Non-Markdown vault files are indexed as attachment targets without parsed document entries | `src/vault/__tests__/vault-index.test.ts`, `src/vault/__tests__/vault-scanner.test.ts`, `src/vault/__tests__/file-watcher.test.ts` | ✅ passing | Phase 15 | Attachment metadata stays separate from parsed `OFMDoc` entries |
| `Parity.Attachments.Completion` | Embed and Markdown image contexts complete indexed attachment paths | `src/completion/__tests__/context-analyzer.test.ts`, `src/completion/__tests__/completion-router.test.ts`, `src/completion/__tests__/embed-completion-provider.test.ts` | ✅ passing | Phase 15 | Includes Markdown image target contexts and attachment-only candidates |
| `Parity.Attachments.Diagnostics` | Broken attachment references produce diagnostics while existing attachments remain diagnostic-free | `src/resolution/__tests__/attachment-diagnostics.test.ts` | ✅ passing | Phase 15 | Missing attachment refs produce FG004 warnings; external image URLs stay clean |
| `Parity.Attachments.NavigationHover` | Existing attachment references support definition and lightweight hover metadata | `src/handlers/__tests__/attachment-navigation.test.ts`, `src/handlers/__tests__/attachment-hover.test.ts` | ✅ passing | Phase 15 | Uses indexed attachment URIs and metadata for embeds and Markdown image links |
| `Parity.Attachments.ConfigHints` | Attachment completion and indexing respect configured attachment folder hints | `src/vault/__tests__/attachment-config.test.ts`, `src/completion/__tests__/completion-router.test.ts` | ✅ passing | Phase 15 | Obsidian `attachmentFolderPath` ranks completions without filtering valid off-folder attachments |
| `Parity.FileOperations.AtomicRefactor` | File and folder moves return a single atomic WorkspaceEdit for local reference updates | `src/lsp/handlers/__tests__/file-operations.handler.test.ts`, `src/resolution/__tests__/file-operation-regression.test.ts` | ✅ passing | Phase 16 | Handler returns `null` for no-op or rejected plans and validated edits for safe plans |
| `Parity.FileOperations.CapabilityRegistration` | Server advertises and handles file-operation rename requests | `src/lsp/lsp.module.test.ts`, `src/lsp/handlers/__tests__/file-operations.handler.test.ts`, `src/test/integration/transport.test.ts` | ✅ passing | Phase 16 | Covers `workspace.fileOperations.willRename/didRename` capability shape, dispatcher registration, and real server boot |
| `Parity.FileOperations.MovePlannerConfinement` | File-operation planning expands only vault-confined note, attachment, and folder mappings | `src/vault/__tests__/file-operation-planner.test.ts`, `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | ✅ passing | Phase 16 | Covers direct files, folders, attachments, escaping path rejection, and detected vault-root use |
| `Parity.FileOperations.ReferenceRewrite` | Moved-target references are rewritten while preserving syntax family and target details | `src/resolution/__tests__/file-operation-rewriter.test.ts`, `src/resolution/__tests__/file-operation-regression.test.ts` | ✅ passing | Phase 16 | Covers wiki, embed, Markdown document, and vault-relative Markdown image rewrites |
| `Parity.FileOperations.SkippedAmbiguousReporting` | Ambiguous or unsafe references are reported without speculative edits | `src/resolution/__tests__/workspace-edit-validator.test.ts` | ✅ passing | Phase 16 | Validator preserves skipped-reference reports while rejecting invalid edit sets |
| `Parity.FileOperations.AtomicValidation` | File-operation WorkspaceEdit output is deterministic and all-or-nothing | `src/resolution/__tests__/workspace-edit-validator.test.ts` | ✅ passing | Phase 16 | Covers invalid range rejection, overlap rejection, and stable edit ordering |
| `Parity.FileOperations.IndexRefresh` | Post-rename notifications refresh index, lookup, graph, tags, and diagnostics | `src/lsp/handlers/__tests__/file-operation-refresh.service.test.ts`, `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | ✅ passing | Phase 16 | Covers `didRenameFiles` planning and post-apply in-memory refresh |
| `Parity.StructuralLSP.Coverage` | Document links, folding ranges, and selection ranges reflect OFMarkdown structure | `src/lsp/lsp.module.test.ts`, `src/handlers/__tests__/document-link.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts`, `src/handlers/__tests__/selection-range.handler.test.ts`, `src/test/integration/structural-lsp.test.ts`, `src/test/bdd/step-definitions/ofmarkdown-parity.steps.ts` | ✅ passing | Phase 17 | Covers capability registration, focused handlers, spawned-server integration, and tagged BDD trace |
| `Parity.StructuralLSP.CapabilityRegistration` | Structural providers are advertised only when handlers exist | `src/lsp/lsp.module.test.ts` | ✅ passing | Phase 17 | Covers `documentLinkProvider`, `foldingRangeProvider`, and `selectionRangeProvider` registration |
| `Parity.StructuralLSP.DocumentLinks` | Document links target unambiguous local OFMarkdown links and omit ambiguous/external targets | `src/handlers/__tests__/document-link.handler.test.ts`, `src/test/integration/structural-lsp.test.ts`, `src/test/bdd/step-definitions/ofmarkdown-parity.steps.ts` | ✅ passing | Phase 17 | Covers wiki, Markdown, same-document, attachment, ambiguous, and external target cases |
| `Parity.StructuralLSP.FoldingRanges` | Folding ranges expose OFMarkdown structures without crossing opaque regions | `src/handlers/__tests__/folding-range.handler.test.ts`, `src/test/integration/structural-lsp.test.ts`, `src/test/bdd/step-definitions/ofmarkdown-parity.steps.ts` | ✅ passing | Phase 17 | Covers frontmatter, headings, callouts, code, math, comments, and Templater regions |
| `Parity.StructuralLSP.SelectionRanges` | Selection ranges expand through valid OFMarkdown construct boundaries | `src/handlers/__tests__/selection-range.handler.test.ts`, `src/test/integration/structural-lsp.test.ts`, `src/test/bdd/step-definitions/ofmarkdown-parity.steps.ts` | ✅ passing | Phase 17 | Covers wiki-link nesting and opaque Templater boundary confinement |

---

## Workspace Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Workspace.VaultDetection.Primary` | Directories with `.obsidian/` auto-detected as vault roots | `tests/unit/lsp/lsp.module.spec.ts` | ⏳ planned | Phase 1 | Module smoke test only; full vault detection in Phase 4 |
| `Workspace.VaultDetection.Fallback` | Directories with `.flavor-grenade.toml` detected when `.obsidian/` absent | — | ⬜ not-yet-written | Phase 4 | |
| `Workspace.FileExtension.Filter` | Only configured-extension files enter the index | `src/vault/__tests__/vault-scanner.test.ts`, `docs/bdd/features/vault-detection.feature` | ✅ passing | Phase 14 | Phase 14 fixes and verifies `.flavor-grenade.toml` configured document extensions |
| `Workspace.MultiFolder.Isolation` | Cross-root link resolution not performed between distinct vaults | — | ⬜ not-yet-written | Phase 4 | |

---

## Configuration Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Config.Precedence.Layering` | Project config overrides user config overrides built-in defaults | — | ⬜ not-yet-written | Phase 2 | |
| `Config.Validation.Candidates` | `completion.candidates` must be strictly positive; invalid values fall back | — | ⬜ not-yet-written | Phase 2 | |
| `Config.Fault.Isolation` | Malformed TOML dropped without crashing the server | — | ⬜ not-yet-written | Phase 2 | |
| `Config.TextSync.Default` | Absent `core.text_sync` defaults to `"full"` | — | ⬜ not-yet-written | Phase 2 | |

---

## Security Requirements — Parser Safety

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Parser.ReDoS` | All OFM parser regexes audited for catastrophic backtracking; super-linear patterns prohibited | `src/parser/__tests__/parser-safety.test.ts` | ✅ passing | Phase 18 | Adversarial unmatched delimiter coverage protects Markdown-link parsing from bracket-only scans and math exclusion from display-region churn |
| `Security.Parser.ParseTimeout` | Any single vault file must complete parsing within 200 ms; timeouts produce empty results | `src/parser/__tests__/parser-safety.test.ts` | ✅ passing | Phase 18 | Oversized documents return an empty parse result before token parsers run; adversarial in-budget fixture completes below the 200 ms requirement |
| `Security.Parser.YAMLLimits` | YAML parsed with alias cap 50, size limit 64 KB, safe mode; parse failures are malformed frontmatter | `src/parser/__tests__/frontmatter-parser.test.ts` | ✅ passing | Phase 18 | Frontmatter parsing rejects YAML above 64 KiB or more than 50 alias references before `js-yaml` parsing |
| `Security.Parser.EmbedDepth` | Embed resolution detects cycles and enforces max depth 10; circular embeds produce FG005 | — | ⬜ not-yet-written | Phase 3 | Visited-URI set in recursive resolver; see ADR012 |
| `Security.Parser.VaultFileLimit` | Initial vault indexing stops at 50,000 files (configurable); client notified via `window/showMessage` | `src/vault/__tests__/vault-scanner.test.ts` | ✅ passing | Phase 18 | Scanner stops at the configured file budget and sends a warning notification when the limit is reached |

---

## Security Requirements — Vault Confinement

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Vault.PathConfinement` | All file paths from vault content or LSP params canonicalized and vault-root-checked before I/O | `src/resolution/__tests__/markdown-target-classifier.test.ts`, `src/vault/__tests__/file-operation-planner.test.ts`, `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | ✅ passing | Phase 16 | Phase 14 covers Markdown target traversal underflow; Phase 16 adds file-operation URI canonicalization and detected vault-root confinement |
| `Security.Vault.SymlinkConfinement` | Out-of-vault symlinks treated as non-existent; `fs.realpath()` checked, not symlink path | `src/vault/__tests__/file-operation-planner.test.ts` | ✅ passing | Phase 18 | Existing paths pass both lexical and `fs.realpathSync.native()` vault-root checks before file-operation planning or scanner indexing |
| `Security.Vault.URISchemeAllowlist` | Only `file://` URIs accepted; non-`file://` URIs return InvalidParams (-32602) | `src/lsp/handlers/__tests__/initialize.handler.test.ts`, `src/lsp/handlers/__tests__/initialized.handler.test.ts` | ✅ passing | Phase 18 | Shared file URI guard rejects non-file initialize and initialized root URIs before vault scanning or lifecycle state mutation |
| `Security.Vault.RenameConfinement` | Rename edit targets must pass vault-root confinement; escaping URIs cancel entire rename | `src/vault/__tests__/file-operation-planner.test.ts`, `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | ✅ passing | Phase 16 | Escaping old or new file-operation URI rejects the whole plan before edits or refresh |

---

## Security Requirements — Input Validation

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Input.PositionValidation` | All `Position`/`Range` params validated as non-negative integers within document bounds | `src/handlers/__tests__/selection-range.handler.test.ts`, `src/transport/json-rpc-dispatcher.test.ts` | ✅ passing | Phase 17 | Phase 17 rejects invalid `selectionRange` position batches with JSON-RPC InvalidParams instead of returning partial results |
| `Security.Input.PayloadSize` | Oversized JSON-RPC headers and bodies rejected before JSON parsing | `src/transport/stdio-reader.test.ts` | ✅ passing | Phase 2 | Current caps: 8 KiB header, 16 MiB body, and combined frame buffer cap |
| `Security.Input.PrototypePollution` | JSON-RPC bodies schema-validated before any merge; `__proto__` / `constructor.prototype` keys rejected | `src/transport/json-rpc-dispatcher.test.ts` | ✅ passing | Phase 18 | Dispatcher rejects dangerous prototype keys in request params and drops invalid notifications before handlers receive payloads |

---

## Security Requirements — Supply Chain

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Supply.ExactPinning` | Exact dependency pinning target; remaining ranges tracked as supply-chain debt | `scripts/check-exact-dependencies.test.js`, `scripts/check-exact-dependencies.mjs`, `.github/workflows/ci.yml` | ✅ passing | Phase 18 | Dependency range lint checks root and extension manifests; direct dependency specifiers are exact |
| `Security.Supply.FrozenLockfile` | All CI `bun install` uses `--frozen-lockfile`; lockfile drift fails the build | `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/extension-release.yml` | ✅ passing | Phase 1 | Workflow inspection shows all Bun installs use `--frozen-lockfile` |
| `Security.Supply.IgnoreScripts` | All CI `bun install` uses `--ignore-scripts` CLI flag; `.npmrc` alone insufficient (Bun bypass) | `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/extension-release.yml` | ✅ passing | Phase 1 | Workflow inspection shows all Bun installs use `--ignore-scripts` |
| `Security.Supply.AdvisoryMonitoring` | Direct dependency upgrades reviewed against security advisories; documented in audit log | `docs/security/dependency-audit-log.md` | ✅ passing | Phase 18 | Phase 18 recorded root and extension advisory scans and fixed the extension transitive `fast-uri` advisory |
| `Security.Supply.NoDevtoolsIntegration` | `@nestjs/devtools-integration` remains absent from manifests, lockfiles, and source | — | ⏳ planned | Phase 1 | Package/source audit passes; ESLint guard is still planned |

---

## Security Requirements — Information Disclosure

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Disclosure.LogSanitization` | Server logs never include vault document content; only paths, line numbers, codes permitted | — | ⬜ not-yet-written | Phase 2 | Logger wrapper strips content; see threat model §Sub-threat-4.1 |
| `Security.Disclosure.CompletionFilter` | Completion candidates from sensitive frontmatter keys (password, token, secret, api_key) filtered out | — | ⬜ not-yet-written | Phase 9 | Configurable blocked-key list; see threat model §Sub-threat-4.2 |
| `Security.Config.NoCodeExecution` | `.flavor-grenade.toml` schema never includes command/script/executable fields; no process spawning | — | ⏳ planned | Phase 1 | Schema inspection + crafted-config integration test; see ADR012 |

---

## VS Code Extension Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Extension.Activation.MarkerEvents` | Extension can wake on `onLanguage:markdown` and run the startup gate | `extension/src/activation-gate.test.ts` | ✅ passing | Phase E7 | Phase E7 replaces unconditional server start with gated startup |
| `Extension.Activation.VaultPrecision` | Vault marker workspaces start while generic Markdown remains idle | `extension/src/activation-gate.test.ts`, `extension/src/test/suite/activation-language-mode.test.js` | ✅ passing | Phase E9 | Existing startup-gate coverage remains relevant; expected follow-up removes `ofmarkdown` wake assumptions and adds flavor selector command wake coverage |
| `Extension.Activation.MarkerEvents` | Manifest and gate honor marker, language, and command activation signals | `extension/src/activation-gate.test.ts` | ✅ passing | Phase E7 | Manifest coverage verifies vault marker, language, and command activation events |
| `Extension.CommandBridges.NativeUI` | Server-provided locations invoke native VS Code reference and navigation UI | `extension/src/command-bridges.test.ts`, `extension/src/test/suite/command-bridges.test.js` | ✅ passing | Phase E9 | Unit and host coverage verify `editor.action.showReferences`, native document opening, and bridge command execution |
| `Extension.CommandBridges.PayloadValidation` | Command bridge payloads are validated before VS Code API calls | `extension/src/command-bridges.test.ts`, `extension/src/test/suite/command-bridges.test.js` | ✅ passing | Phase E9 | Invalid payloads return safe failure and do not call native APIs or throw uncaught host exceptions |
| `Extension.CommandBridges.GraphActions` | Required graph, vault, embed, and diagnostic bridge commands are registered | `extension/src/command-bridges.test.ts`, `extension/src/test/suite/command-bridges.test.js` | ✅ passing | Phase E9 | Coverage verifies command contributions, activation events, backlinks, outlinks, reveal, embed, and diagnostic copy bridges |
| `Extension.Tests.HostCoverage` | Extension-host tests cover required client behavior groups | `.github/workflows/ci.yml`, `src/test/ci-workflow.test.ts`, `extension/src/test/suite/*.js`, `extension/test/host-update-wait.test.ts`, `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature` | 🔴 failing | Markdown flavor requirements | Existing host gate runs, and BUG-042 covers stale Windows VS Code updater preflight behavior; required Markdown flavor selector, override persistence, and researched-flavor fixtures are not implemented yet |
| `Extension.ServerCommand.Resolution` | Server command resolution: user setting → development `dist/main.js` → packaged `server/main.js` | `extension/src/server-command.test.ts`, `extension/src/server-path.ts` | ✅ passing | Phase E2, Phase E14 | Workspace-level `server.path` values are ignored by `server-path.ts`; pure resolver behavior is unit-tested |
| `Extension.ServerCommand.PackagedModule` | Packaged extension starts the bundled JavaScript server module | `extension/test/package-targets/server-binary.test.ts`, `.github/workflows/extension-release.yml` | ✅ passing | Phase E14 | Package validator and release smoke test require exactly one `server/main.js` payload and reject native executables |
| `Extension.Marketplace.OFMProof` | Marketplace README shows required Markdown flavor and OFMarkdown screenshots or images | `extension/test/marketplace/readme-assets.test.ts` | 🔴 failing | Markdown flavor requirements | Existing proof checks focus on OFMarkdown mode; add/retarget proof for Markdown flavor selector and required researched flavor support |
| `Extension.Marketplace.AssetPackaging` | Referenced Marketplace README assets ship in packaged VSIX output | `extension/test/marketplace/readme-assets.test.ts`, `extension/test/marketplace/vsix-assets.test.ts` | ✅ passing | Phase E11 | Checks local README references, supported image formats, inventory coverage, and packaged VSIX archive output |
| `Extension.Contributions.FlavorScoped` | Snippets, keybindings, commands, and optional theme examples stay scoped by Markdown flavor/context | `extension/test/contributions/snippets.test.ts`, `extension/test/contributions/language-configuration.test.ts`, `extension/test/contributions/keybindings.test.ts`, `extension/test/contributions/ofmarkdown-isolation.test.ts` | 🔴 failing | Markdown flavor requirements | Existing tests are `ofmarkdown` language-scope tests; rewrite around selector/context keys and generic Markdown isolation |
| `Extension.Status.Diagnostics` | Status bar text reflects known server and workspace states | `extension/src/status-bar.test.ts`, `extension/src/test/suite/status-failure.test.js` | ✅ passing | Phase E10 | Pure presentation tests cover initializing, indexing, ready, error, disabled, crashed, and misconfigured states; host test exercises the development-host status presentation hook |
| `Extension.Status.Diagnostics` | Extension exposes useful status and failure information | `extension/src/status-bar.test.ts`, `extension/src/troubleshooting.test.ts`, `extension/src/workspace-environment.test.ts`, `extension/src/test/suite/status-failure.test.js`, `extension/docs/features/workspace-environments.md` | ✅ passing | Phase E13 | Rich tooltip and diagnostic-copy tests cover extension/server versions, platform, vault counts, disabled environment states, sanitized server path summary, and troubleshooting topics |
| `Extension.Status.QuickActions` | Status UI exposes recovery and support actions when applicable | `extension/src/status-bar.test.ts`, `extension/src/status-actions.test.ts`, `extension/src/troubleshooting.test.ts`, `extension/src/test/suite/status-failure.test.js` | ✅ passing | Phase E10 | Quick actions cover restart, rebuild index, output, diagnostic copy, vault reveal, and troubleshooting command flow |
| `Extension.Workspace.EnvironmentModes` | Restricted, virtual, local, and remote workspace modes have explicit startup behavior and smoke evidence | `extension/src/workspace-environment.test.ts`, `extension/src/extension-startup.test.ts`, `extension/docs/features/workspace-environments.md` | ✅ passing | Phase E13, Phase 18 | Automated classifier tests cover no-spawn and host-relative platform behavior; BUG-025 adds startup guard evidence for command-triggered server start in unsupported environments |
| `Extension.Status.QuickActions` | Status bar resets to "Starting..." on client restart | — | ⬜ not-yet-written | Phase E3 | Unit test; trigger restart quick action and `onDidChangeState` |
| `Extension.Commands.Registration` | All 3 commands registered and callable via palette | — | ⬜ not-yet-written | Phase E3 | Unit test + integration test |
| `Extension.Commands.RebuildIndex` | `rebuildIndex` sends `workspace/executeCommand` to server | — | ⬜ not-yet-written | Phase E3 | Unit test; verify `sendRequest` call shape |
| `Extension.Lifecycle.Restart` | `flavorGrenade.server.path` config change triggers restart | — | ⬜ not-yet-written | Phase E3 | Integration test |
| `Extension.Lifecycle.CrashRecovery` | Server crash triggers automatic restart (up to 4 in 3 minutes) | — | ⬜ not-yet-written | Phase E3 | Integration test; default error handler behavior |
| `Extension.Lifecycle.CleanShutdown` | Deactivation stops client, server exits cleanly | — | ⬜ not-yet-written | Phase E3 | Integration test |
| `Extension.Packaging.VSIXContents` | VSIX contains only dist/, server/, manifest, changelog, README, license, and assets | `.github/workflows/extension-release.yml`, `extension/.vscodeignore` | ✅ passing | Phase E4, Phase E14 | Release workflow inspects packaged VSIX contents and rejects nested VSIXs or a missing server module |
| `Extension.Packaging.ServerModuleValidation` | VSIX output contains exactly one bundled JavaScript server module and no native executable payload | `extension/test/package-targets/server-binary.test.ts`, `.github/workflows/extension-release.yml` | ✅ passing | Phase E14 | Unit coverage checks missing, duplicate, and native-executable rejection; package test inspects a real VSIX archive; release workflow runs the same validator before publishing |
| `Extension.Packaging.VSIXInstall` | Local VSIX install succeeds and extension functions | — | ⬜ not-yet-written | Phase E4 | Manual smoke test |
| `Extension.CICD.VSIXBuild` | Universal Marketplace VSIX builds on extension tag push | `.github/workflows/extension-release.yml` | ✅ passing | Phase E5, Phase E14 | CI builds one VSIX, verifies checksums, package contents, provenance, and bundled JS server startup |
| `Extension.CICD.MarketplacePublish` | Publish job succeeds with VSCE_PAT | — | ⬜ not-yet-written | Phase E5 | CI verification; not a unit test |
| `Extension.MarkdownLanguage.PreserveDefault` | `.md` documents stay in VS Code's built-in `markdown` language mode | `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/vscode-extension.feature`, planned `extension/src/markdown-flavor.test.ts`, planned `extension/src/test/suite/markdown-flavor.test.js` | 🔴 failing | Markdown flavor requirements | Existing implementation still has retired `ofmarkdown` promotion tests; replace with preserve-default tests |
| `Extension.MarkdownFlavor.Selector` | Extension exposes a separate Markdown flavor selector | `docs/bdd/features/ofmarkdown-language-mode.feature`, planned `extension/src/markdown-flavor.test.ts`, planned `extension/src/test/suite/markdown-flavor.test.js` | 🔴 failing | Markdown flavor requirements | Needs status item or equivalent selector tests plus quick-pick choice assertions |
| `Extension.MarkdownFlavor.RequiredCoverage` | Selector, settings schema, and server-facing model include every researched Markdown flavor | `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature`, planned `extension/src/markdown-flavor.test.ts` | 🔴 failing | Markdown flavor requirements | Must cover `auto`, `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow` |
| `Extension.MarkdownFlavor.DialectProfiles` | Every supported explicit flavor has a source-backed dialect profile | `docs/bdd/features/markdown-flavor-dialects.feature`, `src/parser/__tests__/markdown-flavor-profiles.test.ts` | ✅ passing | Phase 19 and Markdown flavor requirements | Phase 19 registry coverage proves every explicit ADR020 profile has sources, signatures, and security metadata; later parser behavior remains tracked by `FlavorLSP.Parser.ProfileDispatch`. |
| `Extension.MarkdownFlavor.AutoDetection` | Auto Detect infers flavor from vault and workspace signals | `docs/bdd/features/ofmarkdown-language-mode.feature`, `src/vault/__tests__/document-membership.test.ts`, `src/lsp/handlers/__tests__/configuration.handler.test.ts`, planned `extension/src/markdown-flavor.test.ts` | 🔴 failing | Markdown flavor requirements, Phase 20 | Server-side auto resolution now covers generic CommonMark, Obsidian markers, and project TOML evidence; extension-side selector resolution remains pending. |
| `Extension.MarkdownFlavor.OverridePersistence` | Folder-backed overrides persist to workspace-folder or workspace settings; standalone overrides persist to user settings | `docs/bdd/features/ofmarkdown-language-mode.feature`, planned `extension/src/markdown-flavor.test.ts`, planned `extension/src/test/suite/markdown-flavor.test.js` | 🔴 failing | Markdown flavor requirements | BDD distinguishes workspace-folder, workspace fallback, and user targets; needs VS Code configuration-target product tests |
| `Extension.MarkdownFlavor.ServerPropagation` | Effective Markdown flavor propagates to server analysis | `docs/bdd/features/ofmarkdown-language-mode.feature`, `src/lsp/handlers/__tests__/configuration.handler.test.ts`, `src/test/integration/markdown-flavor.test.ts`, planned `extension/src/markdown-flavor.test.ts` | 🔴 failing | Markdown flavor requirements, Phase 20 | Server-side propagation and spawned-server refresh pass in Phase 20; extension client propagation remains pending. |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | Manual non-Markdown language selections are preserved | `docs/bdd/features/ofmarkdown-language-mode.feature`, planned `extension/src/markdown-flavor.test.ts`, planned `extension/src/test/suite/markdown-flavor.test.js` | 🔴 failing | Markdown flavor requirements | Must preserve `plaintext`, `mdx`, and other user-selected language ids while still allowing `mdx` as a Markdown flavor id when language remains `markdown` |
| `Extension.MarkdownFlavor.Refresh` | Flavor state refreshes after server, index, workspace, editor, file-open, and selector events | `docs/bdd/features/ofmarkdown-language-mode.feature`, planned `extension/src/markdown-flavor.test.ts`, planned `extension/src/commands.test.ts` | 🔴 failing | Markdown flavor requirements | Replaces retired membership-refresh tests with flavor-state refresh tests |

---

## Server Markdown Flavor LSP Requirements

These rows are first-class server-side coverage for
[[docs/requirements/functional/markdown-flavor-lsp]]. They are separate from
extension selector rows: extension tests prove the selected/effective flavor
reaches the server; these rows prove each LSP surface consumes that flavor.

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `FlavorLSP.Profile.SignatureCoverage` | Every explicit flavor has a profile declaring active, inert, and host-specific syntax surfaces | `src/parser/__tests__/markdown-flavor-profiles.test.ts`; `docs/test/markdown-flavor-unit-spec.md`; `docs/test/evidence/markdown-flavor-research-trace.md` | ✅ passing | Phase 19 and Phases 22-34 | Phase 19 creates the shared registry and trace evidence; Phases 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, and 34 mark Original, CommonMark, Obsidian, GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, and Stack Overflow local LSP surfaces implemented. |
| `FlavorLSP.Parser.ProfileDispatch` | Parser dispatches through the effective flavor before emitting symbols, opaque regions, links, and extension tokens | `src/lsp/handlers/__tests__/configuration.handler.test.ts`; `src/test/integration/markdown-flavor.test.ts`; `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`; `docs/bdd/features/markdown-flavor-dialects.feature` | 🔴 failing | Phase 20 and Phases 22-34 | Phase 20 proves context propagation and Obsidian-token suppression for non-Obsidian profiles. Phases 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, and 34 add passing Original, CommonMark, Obsidian, GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, and Stack Overflow parser fixtures. Extension-side propagation remains tracked separately. |
| `FlavorLSP.Diagnostics.ProfileRules` | Diagnostics use flavor-specific grammar, portability, and boundary rules | `src/resolution/__tests__/diagnostic-service.test.ts`; `src/test/integration/markdown-flavor.test.ts`; `docs/test/markdown-flavor-unit-spec.md`; `docs/bdd/features/markdown-flavor-dialects.feature` | 🔴 failing | Phases 22-34 | Phase 22 adds Original Markdown FG101 portability diagnostics. Phase 23 adds CommonMark FG102 portability diagnostics. Phase 24 proves active Obsidian syntax avoids Original/CommonMark portability diagnostics. Phase 25 adds GFM malformed-table diagnostics. Phase 26 adds GLFM malformed description-list diagnostics. Phase 27 adds Pandoc malformed-attribute diagnostics. Phase 28 adds MultiMarkdown malformed-metadata diagnostics. Phase 29 adds MDX malformed-boundary diagnostics. Phase 30 adds kramdown malformed-attribute diagnostics. Phase 31 adds Markdown Extra malformed-attribute diagnostics. Phase 32 adds R Markdown malformed-chunk diagnostics. Phase 33 adds Reddit `FG701` and `FG702` portability diagnostics. Phase 34 adds Stack Overflow `FG801` malformed-language-directive diagnostics. |
| `FlavorLSP.Completion.ProfileCandidates` | Completion offers only valid or explicitly helpful candidates for the effective flavor | `src/completion/__tests__/completion-router.test.ts`; `src/test/integration/markdown-flavor.test.ts`; `docs/test/markdown-flavor-unit-spec.md` | 🔴 failing | Phases 22-34 | Phases 22 and 23 add passing suppression for inactive Obsidian completions outside the Obsidian flavor. Phase 24 proves Obsidian-only completions remain active for the Obsidian flavor. Phase 25 adds GFM table/task snippets. Phase 26 adds GLFM inapplicable-task and TOC snippets. Phase 27 adds Pandoc citation and attribute snippets. Phase 28 adds MultiMarkdown metadata, citation, and footnote snippets. Phase 29 adds MDX component, expression, and export snippets. Phase 30 adds kramdown attribute and footnote snippets. Phase 31 adds Markdown Extra table, footnote, abbreviation, and attribute snippets. Phase 32 adds R Markdown chunk, option, and inline snippets. Phase 33 adds Reddit spoiler and superscript snippets. Phase 34 adds Stack Overflow tag-reference and language-directive snippets. |
| `FlavorLSP.Navigation.ProfileResolution` | Definition, references, document links, symbols, and folding resolve only local structures defined by the effective flavor | `src/handlers/__tests__/document-symbol.handler.test.ts`; `src/handlers/__tests__/folding-range.handler.test.ts`; planned `src/test/integration/markdown-flavor.test.ts`; `docs/test/markdown-flavor-unit-spec.md` | 🔴 failing | Phases 22-34 | Phase 27 adds Pandoc title/label/footnote symbols and fenced-Div/definition-list folds. Phase 28 adds MultiMarkdown metadata, label, citation, and footnote symbols plus metadata/table folds. Phase 29 adds MDX ESM/JSX/expression symbols plus JSX/expression folds. Phase 30 adds kramdown attribute, definition-list, table, and footnote symbols plus definition-list, table, and math folds. Phase 31 adds Markdown Extra attribute, definition-list, table, footnote, and abbreviation symbols plus definition-list, table, and fenced-code folds. Phase 32 adds R Markdown chunk and inline symbols plus chunk folds. Phase 33 adds Reddit table and host-reference symbols plus table folds. Phase 34 adds Stack Overflow table and tag-reference symbols plus table folds. Host/platform references must be classified but not resolved as vault files without verified integration context. |
| `FlavorLSP.Hover.ProfileMetadata` | Hover describes supported syntax, local metadata, and host/conversion boundaries without overclaiming | planned `src/test/integration/markdown-flavor.test.ts`; `docs/test/markdown-flavor-unit-spec.md` | 🔴 failing | Phases 22-34 | Requires boundary text classes for host, renderer, conversion, and execution-bound constructs. |
| `FlavorLSP.SemanticTokens.ProfileTokens` | Semantic tokens mark only active flavor constructs and respect opaque regions | `src/handlers/__tests__/semantic-tokens.handler.test.ts`; planned `src/test/integration/markdown-flavor.test.ts`; `docs/test/markdown-flavor-unit-spec.md` | 🔴 failing | Phases 22-34 | Phase 27 adds Pandoc citation, footnote-label, and attribute tokens. Phase 28 adds MultiMarkdown metadata, label, citation, and footnote tokens. Phase 29 adds MDX ESM declaration, JSX element, and expression tokens. Phase 30 adds kramdown attribute-marker and footnote-label tokens. Phase 31 adds Markdown Extra attribute-marker, footnote-label, and abbreviation-label tokens. Phase 32 adds R Markdown chunk-engine, chunk-label, chunk-option, and inline-expression tokens. Phase 33 adds Reddit spoiler, superscript, and host-reference tokens. Phase 34 adds Stack Overflow tag, language, fence-hint, and spoiler tokens. |
| `FlavorLSP.Rename.ProfileSafety` | Rename updates only flavor-supported local symbols and rejects unsafe targets | planned `src/test/integration/markdown-flavor.test.ts`; `docs/test/markdown-flavor-unit-spec.md` | 🔴 failing | Phases 22-34 | Requires `prepareRename` and `rename` success/rejection cases for local, inactive, host, conversion, and execution-bound targets. |
| `FlavorLSP.HostBoundary.NonLocalReferences` | Host and conversion references stay separate from local vault/file/heading/label/citation targets | `src/lsp/handlers/__tests__/configuration.handler.test.ts`; `src/test/integration/markdown-flavor.test.ts`; `docs/test/evidence/markdown-flavor-host-boundary-review.md`; `docs/plans/markdown-flavor-lsp-applicability-matrix.md` | 🔴 failing | Phase 20, Phase 21, and Phases 25-34 | Phase 20 adds the shared classifier and spawned-server boundary smoke coverage. Phases 22 and 23 record that Original and CommonMark have no host-specific syntax and keep extension constructs inert or portability-only. Phase 25 adds GitHub host-reference coverage. Phase 26 adds GitLab host-reference coverage. Phase 27 adds Pandoc bibliography-bound citation coverage. Phase 28 adds MultiMarkdown conversion-bound cross-reference coverage. Phase 29 adds MDX renderer-bound component coverage. Phase 30 adds kramdown renderer/conversion output disposition. Phase 31 adds Markdown Extra renderer/conversion output disposition. Phase 32 adds R Markdown execution-bound chunk disposition. Phase 33 adds Reddit host-reference disposition. Phase 34 adds Stack Overflow host-reference disposition. |
| `Security.Parser.FlavorProfileResourceSafety` | Flavor parsers inherit resource-safety, timeout, and ReDoS gates | `src/parser/__tests__/markdown-flavor-profiles.test.ts`; planned pathological flavor fixtures | ✅ passing | Phase 19 and Phases 22-34 | Phase 19 profile registry records parser size budget, no-network/no-execution boundaries, and ReDoS disposition; each dialect phase adds pathological parser fixtures before closing. |
| `Security.Input.ProjectConfigTOMLSafety` | `.flavor-grenade.toml` is confined, size-limited, schema-validated, and log-redacted | `src/lsp/handlers/__tests__/configuration.handler.test.ts`; `src/test/integration/markdown-flavor.test.ts` | ✅ passing | Phase 20 | Project flavor evidence is read through a confined realpath path, capped, schema-filtered to `core.markdown.flavor`, and dangerous keys/invalid values are treated as absent configuration. |
| `Security.Input.FlavorPropagationPayload` | Resource-specific flavor payloads reject oversized maps, unsafe URIs, dangerous keys, stale resources, and invalid effective values | `src/lsp/handlers/__tests__/configuration.handler.test.ts`; planned extension propagation tests | 🔴 failing | Phase 20 and Phase E15 | Server payload validation passes for map size, enum, non-file URI, stale resource, and invalid effective values; extension-side validation remains pending. |
| `Security.Vault.ProjectConfigConfinement` | Project config discovery reads only in-root realpaths | `src/lsp/handlers/__tests__/configuration.handler.test.ts`; `src/markdown-flavor/project-markdown-flavor-config.ts` | ✅ passing | Phase 20 | Project config discovery uses the existing realpath vault confinement helper before file I/O; unsafe candidates are treated as absent configuration without logging content. |

---

## Markdown Flavor Test-Level Matrix

Detailed cases for these rows are specified in [[docs/test/markdown-flavor-unit-spec]],
[[docs/test/markdown-flavor-integration-spec]], [[docs/test/markdown-flavor-e2e-spec]],
[[docs/test/markdown-flavor-verification-spec]], and [[docs/test/markdown-flavor-validation-spec]].

| Test Level | Requirement Coverage | Planned Evidence | Status | Notes |
|---|---|---|---|---|
| Unit | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Selector`, `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.AutoDetection`, `Extension.MarkdownFlavor.OverridePersistence`, `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.ManualLanguageSafety`, `Extension.MarkdownFlavor.Refresh`, `Extension.Contributions.FlavorScoped` | `extension/src/markdown-flavor.test.ts`, `extension/test/contributions/*.test.ts`, `src/lsp/handlers/__tests__/configuration.handler.test.ts` | 🔴 failing | Server state transitions, auto resolution, propagation validation, and refresh calls pass in Phase 20; extension selector units remain planned. |
| Unit | `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates` | `src/parser/__tests__/markdown-flavor-profiles.test.ts`, `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `src/completion/__tests__/completion-router.test.ts` | ✅ passing | Covers profile registry for all researched explicit flavors plus Phase 22 Original Markdown, Phase 23 CommonMark, Phase 24 Obsidian, Phase 25 GFM, Phase 26 GLFM, Phase 27 Pandoc, Phase 28 MultiMarkdown, Phase 29 MDX, Phase 30 kramdown, Phase 31 Markdown Extra, Phase 32 R Markdown, Phase 33 Reddit, and Phase 34 Stack Overflow parser, diagnostics, and completion behavior. |
| Integration | `Extension.MarkdownFlavor.ServerPropagation`, `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates` | `src/test/integration/markdown-flavor.test.ts` | ✅ passing | Proves flavor config reaches spawned server analysis, project TOML evidence applies, refreshes diagnostics/features, and applies Original/CommonMark/Obsidian/GFM/GLFM/Pandoc/MultiMarkdown/MDX/kramdown/Markdown Extra/R Markdown/Reddit/Stack Overflow parser, diagnostic, local count, and boundary behavior across JSON-RPC. |
| E2E | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Selector`, `Extension.MarkdownFlavor.OverridePersistence`, `Extension.MarkdownFlavor.Refresh`, `Extension.Tests.HostCoverage` | `extension/src/test/suite/markdown-flavor.test.js` | 📋 planned | Runs through VS Code host UI/settings surfaces with real workspace and standalone-file contexts. |
| Verification | `CICD.Workflow.PRGate`, `CICD.Workflow.BDDGate`, `Extension.Tests.HostCoverage` | `.github/workflows/ci.yml`, `src/test/ci-workflow.test.ts`, `cucumber.yaml`, `extension/package.json` | ✅ passing | Root CI, BDD, docs, extension, website, and validation-artifact guard checks are wired. Real selector host proof remains tracked by Phase E17 rows. |
| Validation | `Extension.MarkdownFlavor.RequiredCoverage`, `Extension.MarkdownFlavor.DialectProfiles`, `FlavorLSP.Profile.SignatureCoverage`, `FlavorLSP.HostBoundary.NonLocalReferences`, validation evidence redaction | `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature`, `docs/test/evidence/markdown-flavor-research-trace.md`, `docs/test/evidence/markdown-flavor-product-review.md`, `docs/test/evidence/markdown-flavor-validation-run.md`, `docs/test/evidence/markdown-flavor-host-boundary-review.md` | ✅ passing | Root/server validation confirms the supported flavor list, server profile claims, non-local boundary dispositions, and sanitized evidence match `docs/research/`, feature pages, and ADR020. Extension-host validation remains tracked by Phase E17. |

## Validation Artifact Matrix

These evidence paths are protected by `src/test/ci-workflow.test.ts`. They must
cite commands, reviewer or generating command, commit, and source inputs.

| Artifact | Requirement Coverage | Owner Phase | Status | Notes |
|---|---|---|---|---|
| `docs/test/evidence/markdown-flavor-research-trace.md` | `Extension.MarkdownFlavor.RequiredCoverage`, `FlavorLSP.Profile.SignatureCoverage` | Phase 19, then Phases 22-34 updates | ✅ passing | Maps every displayed and server-supported explicit flavor id to feature, research/source, and owning implementation ticket; Phases 22-34 record implemented Original, CommonMark, Obsidian, GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, and Stack Overflow surface evidence. |
| `docs/test/evidence/markdown-flavor-product-review.md` | `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.ManualLanguageSafety` | Phase 21 | ✅ passing | Confirms `auto` is selector state and `mdx` flavor does not imply VS Code `mdx` language mode. |
| `docs/test/evidence/markdown-flavor-validation-run.md` | `CICD.Workflow.BDDGate`, `Process.TestIndex.Matrix` | Phase 21 | ✅ passing | Links `bun run bdd`, CI workflow guard tests, and the current Phase 21 gate output. |
| `docs/test/evidence/markdown-flavor-host-boundary-review.md` | `FlavorLSP.HostBoundary.NonLocalReferences`, `Security.Vault.PathConfinement` | Phase 20 shared classifier; Phase 21 scaffold; Phases 22-34 updates | ✅ passing | Records shared classifier evidence, Original/CommonMark no-host-syntax dispositions, per-platform/conversion false-local-resolution rules, and deferred lookup dispositions. |

---

## Coverage Summary

| Phase | Total Tags in Scope | Tags with Tests | Coverage |
|---|---|---|---|
| Phase 1 (Scaffold) | 7 (quality gates) + 1 (vault detection smoke) + 5 (supply chain + no-exec) | 3 | 23% |
| Phase 2 (LSP Transport) | 4 (config) + 5 (input validation + URI scheme + log sanitization) | 1 | 11% |
| Phase 3 (OFM Parser) | 5 (parser safety) | 0 | 0% |
| Phase 4 (Vault Index) | 4 (workspace) + 2 (path + symlink confinement) | 0 | 0% |
| Phase 5 (Wiki-Links) | 5 + 6 (diagnostics) | 0 | 0% |
| Phase 6 (Tags) | 4 | 0 | 0% |
| Phase 7 (Embeds) | 4 | 1 | 25% |
| Phase 8 (Block Refs) | 4 | 4 | 100% |
| Phase 9 (Completions) | 4 + 1 (completion filter) | 0 | 0% |
| Phase 10 (Navigation) | 3 | 0 | 0% |
| Phase 11 (Rename) | 3 + 1 (rename confinement) | 0 | 0% |
| Phase 13 (CI/CD) | 5 + 1 (advisory monitoring) | 0 | 0% |
| Phase 14 (Markdown Link Parity) | 9 | 9 | 100% |
| Phase 15 (Attachment Intelligence) | 6 | 6 | 100% |
| Phase 16 (Vault File Operation Refactors) | 7 | 7 | 100% |
| Phase 17 (Structural LSP Capabilities) | 6 | 6 | 100% |
| Phase E1 (Extension Scaffold) | 0 | 0 | — (infrastructure only) |
| Phase E2 (LanguageClient Core) | 3 | 2 | 67% |
| Phase E3 (Status Bar & Commands) | 7 | 0 | 0% |
| Phase E4 (Packaging) | 2 | 1 | 50% |
| Phase E5 (CI/CD Pipeline) | 2 | 0 | 0% |
| Phase E6 (OFMarkdown Language Mode) | 6 | 6 | 100% |
| Phase E7 (Activation Precision) | 3 | 3 | 100% |
| Phase E8 (Command Bridges) | 3 | 3 | 100% |
| Phase E10 (Status UX) | 2 | 2 | 100% |
| Phase E11 (Marketplace Proof) | 2 | 2 | 100% |
| Phase E12 (Editor Contributions) | 1 | 1 | 100% |
| Phase E13 (Workspace Environments) | 2 | 2 | 100% |
| Phase E14 (Membership And Compatibility) | 2 | 2 | 100% |
| Markdown Flavor Requirements | 10 | 0 | 0% |
| Phase W1 (Website Foundation) | 2 | 2 | 100% |
| Phase W2 (Content Pipeline And SEO) | 4 | 4 | 100% |
| Phase W3 (Homepage And Design System) | 10 | 10 | 100% |
| Phase W4 (Documentation Pages And LLM Wiki) | 6 | 6 | 100% |
| Phase W5 (Website CI And Pages Release) | 3 | 3 | 100% |
| **Total** | **165** | **84** | **51%** |

> [!NOTE]
> Coverage percentages will increase phase by phase. The goal at each phase gate is 100% coverage of requirements introduced in that phase.

---

## Related Documents

- [[docs/test/index]] — Test file inventory (flat list by type)
- [[docs/requirements/index]] — Master Planguage tag index
- [[docs/requirements/code-quality]] — Code quality Planguage requirements
- [[docs/requirements/ci-cd]] — CI/CD Planguage requirements
- [[docs/requirements/development-process]] — Development process Planguage requirements
- [[docs/plans/execution-ledger]] — Phase completion status
