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

---

## CI/CD Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `CICD.Workflow.PRGate` | Every PR must pass all CI checks before merge | — | ⏳ planned | Phase 13 | Enforced by GitHub branch protection; not a unit test |
| `CICD.Markdown.DocsFolderLinting` | `docs/` markdown linted by markdownlint-obsidian in CI | — | ⏳ planned | Phase 13 | Verified by CI `markdown-lint-docs` job |
| `CICD.Markdown.SourceLinting` | Non-docs markdown linted by markdownlint-cli2 in CI | — | ⏳ planned | Phase 13 | Verified by CI `markdown-lint-other` job |
| `CICD.Publish.OIDC` | Publishing uses OIDC provenance attestation | — | ⏳ planned | Phase 13 | Verified by `npm audit signatures` post-publish |
| `CICD.Publish.Trigger` | Publish triggered only by semver tag push to `main` | — | ⏳ planned | Phase 13 | Enforced by `release.yml` `on: push: tags:` trigger |
| `CICD.PreCommit.Gate` | `lefthook` pre-commit runs typecheck + lint + format + test | — | ⏳ planned | Phase 1 | Verified by `lefthook install` + commit attempt |

---

## Development Process Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Process.Branching.MainReleasesOnly` | `main` receives only release/hotfix merges | — | ⏳ planned | Phase 13 | Enforced by branch protection; not a unit test |
| `Process.Testing.DirectoryStructure` | All tests under `tests/`, never under `src/` | — | ⏳ planned | Phase 1 | Verified by `find src/ -name '*.spec.ts'` returning empty |
| `Process.TestIndex.Matrix` | `docs/test/matrix.md` updated for every new test file | — | ⏳ planned | Phase 1 | Enforced by PR review checklist in `.github/CONTRIBUTING.md` |
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
| `Embed.BlockEmbed.Resolution` | `![[doc#^blockid]]` validates anchor exists in target | `src/resolution/__tests__/embed-resolver.test.ts`, `docs/bdd/features/embeds.feature` | ✅ passing | Phase 7 | Unit evidence passes; targeted BDD scenarios pass, while the full BDD suite still has unrelated pending steps |

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
| `Block.CrossRef.Diagnostic` | `[[doc#^nonexistent]]` produces FG005; suppressed in single-file mode | `src/resolution/__tests__/block-ref-resolver.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `docs/bdd/features/block-references.feature` | ✅ passing | Phase 8 | Unit evidence passes; targeted BDD scenarios pass, while the full BDD suite still has unrelated pending steps |
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
| `Security.Parser.ReDoS` | All OFM parser regexes audited for catastrophic backtracking; super-linear patterns prohibited | — | ⬜ not-yet-written | Phase 3 | Static audit + fuzz tests; see ADR012 |
| `Security.Parser.ParseTimeout` | Any single vault file must complete parsing within 200 ms; timeouts produce empty results | — | ⬜ not-yet-written | Phase 3 | Requires timer injection in parser; see ADR012 |
| `Security.Parser.YAMLLimits` | YAML parsed with alias cap 50, size limit 64 KB, safe mode; parse failures are malformed frontmatter | — | ⬜ not-yet-written | Phase 3 | `js-yaml` safeLoad + maxAliases; see ADR012 |
| `Security.Parser.EmbedDepth` | Embed resolution detects cycles and enforces max depth 10; circular embeds produce FG005 | — | ⬜ not-yet-written | Phase 3 | Visited-URI set in recursive resolver; see ADR012 |
| `Security.Parser.VaultFileLimit` | Initial vault indexing stops at 50,000 files (configurable); client notified via `window/showMessage` | — | ⬜ not-yet-written | Phase 3 | Count in VaultIndex.buildIndex(); see ADR012 |

---

## Security Requirements — Vault Confinement

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Vault.PathConfinement` | All file paths from vault content or LSP params canonicalized and vault-root-checked before I/O | `src/resolution/__tests__/markdown-target-classifier.test.ts`, `src/vault/__tests__/file-operation-planner.test.ts`, `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | ✅ passing | Phase 16 | Phase 14 covers Markdown target traversal underflow; Phase 16 adds file-operation URI canonicalization and detected vault-root confinement |
| `Security.Vault.SymlinkConfinement` | Out-of-vault symlinks treated as non-existent; `fs.realpath()` checked, not symlink path | — | ⬜ not-yet-written | Phase 4 | `fs.realpath()` call in `confineToVaultRoot()`; see ADR013 |
| `Security.Vault.URISchemeAllowlist` | Only `file://` URIs accepted; non-`file://` URIs return InvalidParams (-32602) | `src/lsp/handlers/__tests__/initialize.handler.test.ts`, `src/lsp/handlers/__tests__/initialized.handler.test.ts` | ✅ passing | Phase 18 | Shared file URI guard rejects non-file initialize and initialized root URIs before vault scanning or lifecycle state mutation |
| `Security.Vault.RenameConfinement` | Rename edit targets must pass vault-root confinement; escaping URIs cancel entire rename | `src/vault/__tests__/file-operation-planner.test.ts`, `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | ✅ passing | Phase 16 | Escaping old or new file-operation URI rejects the whole plan before edits or refresh |

---

## Security Requirements — Input Validation

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Input.PositionValidation` | All `Position`/`Range` params validated as non-negative integers within document bounds | `src/handlers/__tests__/selection-range.handler.test.ts`, `src/transport/json-rpc-dispatcher.test.ts` | ✅ passing | Phase 17 | Phase 17 rejects invalid `selectionRange` position batches with JSON-RPC InvalidParams instead of returning partial results |
| `Security.Input.PayloadSize` | Oversized JSON-RPC headers and bodies rejected before JSON parsing | `src/transport/stdio-reader.test.ts` | ✅ passing | Phase 2 | Current caps: 8 KiB header, 16 MiB body, and combined frame buffer cap |
| `Security.Input.PrototypePollution` | JSON-RPC bodies schema-validated before any merge; `__proto__` / `constructor.prototype` keys rejected | — | ⬜ not-yet-written | Phase 2 | Zod schema strips dangerous keys; see ADR013 |

---

## Security Requirements — Supply Chain

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Supply.ExactPinning` | Exact dependency pinning target; remaining ranges tracked as supply-chain debt | — | ⏳ planned | Phase 1 | Current manifests still contain ranges; CI range linting has not landed |
| `Security.Supply.FrozenLockfile` | All CI `bun install` uses `--frozen-lockfile`; lockfile drift fails the build | `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/extension-release.yml` | ✅ passing | Phase 1 | Workflow inspection shows all Bun installs use `--frozen-lockfile` |
| `Security.Supply.IgnoreScripts` | All CI `bun install` uses `--ignore-scripts` CLI flag; `.npmrc` alone insufficient (Bun bypass) | `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/extension-release.yml` | ✅ passing | Phase 1 | Workflow inspection shows all Bun installs use `--ignore-scripts` |
| `Security.Supply.AdvisoryMonitoring` | Direct dependency upgrades reviewed against security advisories; documented in audit log | — | ⬜ not-yet-written | Phase 13 | Process requirement; `docs/security/dependency-audit-log.md` |
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
| `Extension.Activation.Markdown` | Extension can wake on `onLanguage:markdown` and run the startup gate | `extension/src/activation-gate.test.ts` | ✅ passing | Phase E7 | Phase E7 replaces unconditional server start with gated startup |
| `Extension.Activation.VaultPrecision` | Vault marker workspaces start while generic Markdown remains idle | `extension/src/activation-gate.test.ts`, `extension/src/test/suite/activation-language-mode.test.js` | ✅ passing | Phase E9 | Unit and host coverage verify `.obsidian/`, `.flavor-grenade.toml`, generic Markdown idle, `ofmarkdown`, and command wake decisions |
| `Extension.Activation.MarkerEvents` | Manifest and gate honor marker, language, and command activation signals | `extension/src/activation-gate.test.ts` | ✅ passing | Phase E7 | Manifest coverage verifies vault marker, language, and command activation events |
| `Extension.CommandBridges.NativeUI` | Server-provided locations invoke native VS Code reference and navigation UI | `extension/src/command-bridges.test.ts`, `extension/src/test/suite/command-bridges.test.js` | ✅ passing | Phase E9 | Unit and host coverage verify `editor.action.showReferences`, native document opening, and bridge command execution |
| `Extension.CommandBridges.PayloadValidation` | Command bridge payloads are validated before VS Code API calls | `extension/src/command-bridges.test.ts`, `extension/src/test/suite/command-bridges.test.js` | ✅ passing | Phase E9 | Invalid payloads return safe failure and do not call native APIs or throw uncaught host exceptions |
| `Extension.CommandBridges.GraphActions` | Required graph, vault, embed, and diagnostic bridge commands are registered | `extension/src/command-bridges.test.ts`, `extension/src/test/suite/command-bridges.test.js` | ✅ passing | Phase E9 | Coverage verifies command contributions, activation events, backlinks, outlinks, reveal, embed, and diagnostic copy bridges |
| `Extension.Tests.HostCoverage` | Extension-host tests cover required client behavior groups | `extension/src/test/suite/*.js` | ✅ passing | Phase E9 | `npm run test:host` runs all `.obsidian/`, `.flavor-grenade.toml`, and generic Markdown fixtures |
| `Extension.Binary.Resolution` | 2-tier binary resolution: user setting → bundled path | `extension/src/server-command.test.ts`, `extension/src/server-path.ts` | ✅ passing | Phase E2 | Workspace-level `server.path` values are ignored by `server-path.ts`; pure resolver behavior is unit-tested |
| `Extension.Binary.PlatformSuffix` | `.exe` suffix appended on Windows, omitted on Unix | `extension/src/server-command.test.ts` | ✅ passing | Phase E2 | Covers Windows and non-Windows bundled binary paths |
| `Extension.Marketplace.OFMProof` | Marketplace README shows required OFMarkdown screenshots or images | `extension/test/marketplace/readme-assets.test.ts` | ✅ passing | Phase E11 | Covers OFMarkdown mode, wiki-link completion, heading/block completion, embeds, tags, callouts, code lens, and status visuals |
| `Extension.Marketplace.AssetPackaging` | Referenced Marketplace README assets ship in packaged VSIX output | `extension/test/marketplace/readme-assets.test.ts`, `extension/test/marketplace/vsix-assets.test.ts` | ✅ passing | Phase E11 | Checks local README references, supported image formats, inventory coverage, and packaged VSIX archive output |
| `Extension.Contributions.OFMarkdownScoped` | Snippets, keybindings, and language configuration stay scoped to OFMarkdown | `extension/test/contributions/snippets.test.ts`, `extension/test/contributions/language-configuration.test.ts`, `extension/test/contributions/keybindings.test.ts`, `extension/test/contributions/ofmarkdown-isolation.test.ts` | ✅ passing | Phase E12 | Covers snippet language scope, language configuration scope, OFMarkdown-only keybinding guards, and generic Markdown isolation |
| `Extension.StatusBar.StateTransition` | Status bar text reflects known server and workspace states | `extension/src/status-bar.test.ts`, `extension/src/test/suite/status-failure.test.js` | ✅ passing | Phase E10 | Pure presentation tests cover initializing, indexing, ready, error, disabled, crashed, and misconfigured states; host test exercises the development-host status presentation hook |
| `Extension.Status.Diagnostics` | Extension exposes useful status and failure information | `extension/src/status-bar.test.ts`, `extension/src/troubleshooting.test.ts`, `extension/src/workspace-environment.test.ts`, `extension/src/test/suite/status-failure.test.js`, `extension/docs/features/workspace-environments.md` | ✅ passing | Phase E13 | Rich tooltip and diagnostic-copy tests cover extension/server versions, platform, vault counts, disabled environment states, sanitized server path summary, and troubleshooting topics |
| `Extension.Status.QuickActions` | Status UI exposes recovery and support actions when applicable | `extension/src/status-bar.test.ts`, `extension/src/status-actions.test.ts`, `extension/src/troubleshooting.test.ts`, `extension/src/test/suite/status-failure.test.js` | ✅ passing | Phase E10 | Quick actions cover restart, rebuild index, output, diagnostic copy, vault reveal, and troubleshooting command flow |
| `Extension.Workspace.EnvironmentModes` | Restricted, virtual, local, and remote workspace modes have explicit startup behavior and smoke evidence | `extension/src/workspace-environment.test.ts`, `extension/docs/features/workspace-environments.md` | ✅ passing | Phase E13 | Automated classifier tests cover no-spawn and host-relative platform behavior; manual smoke ledger covers WSL, SSH, Dev Container, and local OS verification |
| `Extension.StatusBar.RestartReset` | Status bar resets to "Starting..." on client restart | — | ⬜ not-yet-written | Phase E3 | Unit test; trigger `onDidChangeState` |
| `Extension.Commands.Registration` | All 3 commands registered and callable via palette | — | ⬜ not-yet-written | Phase E3 | Unit test + integration test |
| `Extension.Commands.RebuildIndex` | `rebuildIndex` sends `workspace/executeCommand` to server | — | ⬜ not-yet-written | Phase E3 | Unit test; verify `sendRequest` call shape |
| `Extension.Lifecycle.Restart` | `flavorGrenade.server.path` config change triggers restart | — | ⬜ not-yet-written | Phase E3 | Integration test |
| `Extension.Lifecycle.CrashRecovery` | Server crash triggers automatic restart (up to 4 in 3 minutes) | — | ⬜ not-yet-written | Phase E3 | Integration test; default error handler behavior |
| `Extension.Lifecycle.CleanShutdown` | Deactivation stops client, server exits cleanly | — | ⬜ not-yet-written | Phase E3 | Integration test |
| `Extension.Packaging.VSIXContents` | VSIX contains only dist/, server/, manifest, and assets | `.github/workflows/extension-release.yml`, `extension/.vscodeignore` | ✅ passing | Phase E4 | Release workflow inspects packaged VSIX contents and rejects nested VSIXs or a missing target binary |
| `Extension.Packaging.TargetBinaryValidation` | Platform VSIX output contains exactly one server binary matching the VSIX target | `extension/test/package-targets/server-binary.test.ts`, `.github/workflows/extension-release.yml` | ✅ passing | Phase E14 | Unit coverage checks target mapping and missing/duplicate/wrong-target rejection; package test inspects a real VSIX archive; release workflow runs the same validator for all seven targets |
| `Extension.Packaging.VSIXInstall` | Local VSIX install succeeds and extension functions | — | ⬜ not-yet-written | Phase E4 | Manual smoke test |
| `Extension.CICD.MatrixBuild` | All 7 platform-specific VSIXs build on tag push | — | ⬜ not-yet-written | Phase E5 | CI verification; not a unit test |
| `Extension.CICD.MarketplacePublish` | Publish job succeeds with VSCE_PAT | — | ⬜ not-yet-written | Phase E5 | CI verification; not a unit test |
| `Extension.LanguageMode.Contribution` | Extension contributes `ofmarkdown` without globally claiming `.md` files | `extension/src/language-mode.test.ts` | ✅ passing | Phase E6 | Unit coverage verifies manifest contribution, aliases, grammar registration, activation event, and lack of global `.md` binding |
| `Extension.LanguageMode.DynamicAssignment` | Qualifying vault/index Markdown documents promote to `ofmarkdown` | `extension/src/language-mode.test.ts`, `extension/src/test/suite/activation-language-mode.test.js`, `src/vault/__tests__/document-membership.test.ts`, `src/vault/__tests__/vault.module.test.ts` | ✅ passing | Phase E9 | Covers `.obsidian`, `.flavor-grenade.toml`, and server membership request paths |
| `Extension.LanguageMode.NonVaultIsolation` | Generic Markdown outside vault/index remains `markdown` | `extension/src/language-mode.test.ts`, `extension/src/test/suite/activation-language-mode.test.js`, `src/vault/__tests__/document-membership.test.ts` | ✅ passing | Phase E9 | Host fixture also verifies the LanguageClient remains idle |
| `Extension.LanguageMode.UserOverrideSafety` | Manual non-Markdown language selections are preserved | `extension/src/language-mode.test.ts`, `extension/src/test/suite/activation-language-mode.test.js` | ✅ passing | Phase E9 | |
| `Extension.LanguageMode.LoopSafety` | Language assignment does not create reopen or restart loops | `extension/src/language-mode.test.ts` | ✅ passing | Phase E6 | In-flight assignment guard unit-tested |
| `Extension.LanguageMode.MarkdownParity` | OFMarkdown mode preserves baseline Markdown editing behavior | `extension/src/language-mode.test.ts`, `extension/language-configuration.json`, `extension/syntaxes/ofmarkdown.tmLanguage.json` | ✅ passing | Phase E6 | Unit coverage verifies the Markdown grammar bridge and Markdown-compatible language configuration |
| `Extension.LanguageMode.MembershipRefresh` | Membership refresh follows server, index, workspace, editor, and file-open events without unsafe downgrade | `extension/src/language-mode.test.ts`, `extension/src/extension.ts`, `extension/src/commands.ts` | ✅ passing | Phase E14 | Unit coverage verifies open/visible Markdown and OFMarkdown refresh, explicit downgrade agreement, marker preservation, server-failure preservation, and manual non-Markdown isolation; extension wiring refreshes on ready and rebuild completion |

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
| **Total** | **140** | **59** | **42%** |

> [!NOTE]
> Coverage percentages will increase phase by phase. The goal at each phase gate is 100% coverage of requirements introduced in that phase.

---

## Related Documents

- [[test/index]] — Test file inventory (flat list by type)
- [[requirements/index]] — Master Planguage tag index
- [[requirements/code-quality]] — Code quality Planguage requirements
- [[requirements/ci-cd]] — CI/CD Planguage requirements
- [[requirements/development-process]] — Development process Planguage requirements
- [[plans/execution-ledger]] — Phase completion status
