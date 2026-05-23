---
title: Requirements Index — flavor-grenade-lsp
tags:
  - requirements/index
aliases:
  - FG Requirements
  - Planguage Index
---

# Requirements Index

This document is the master tag index for all Planguage requirements in the `flavor-grenade-lsp` project. It describes the format conventions used, the evidence policy that governs target levels, and a complete cross-reference table of every requirement defined across all feature files.

## Planguage Format

Each requirement in this layer uses the following fields, all of which are mandatory:

| Field | Purpose |
|---|---|
| **Tag** | Stable dot-notation identifier in `Feature.SubFeature.Aspect` form. Tags are unique across the entire requirements layer and are used to cross-reference requirements from design documents, BDD scenarios, and ADRs. |
| **Gist** | One sentence summarising the requirement outcome in plain language. |
| **Ambition** | One to two sentences explaining why the outcome matters — the business or user value being protected. |
| **Scale** | The measurable property being tracked, expressed in concrete units (percentage, count, milliseconds, boolean). The scale defines what is tested, not how. |
| **Meter** | A numbered, reproducible test procedure. Two different reviewers executing the Meter on the same system must arrive at the same measurement. |
| **Fail** | The threshold below which the requirement is considered failed. Crossing Fail triggers a blocking defect. |
| **Goal** | The target level expected for a production release. Crossing Goal without reaching Stretch is acceptable. |
| **Stakeholders** | Roles and parties who have an interest in this requirement being met. |
| **Owner** | flavor-grenade-lsp contributors (the implementation team responsible for delivering the requirement). |
| **Source** | The `docs/` files or external specifications that provide evidence for the requirement's existence and, where they exist, its numeric targets. |

## Evidence Policy

Target levels (Fail and Goal) are set **only when the source material provides evidence** that justifies the specific threshold. This is the same policy used in the marksman LSP project.

- If a threshold is industry-standard and unambiguous (e.g., 100% of references updated in an atomic rename), it is stated directly.
- If a threshold requires empirical measurement or stakeholder negotiation, the requirement skeleton is written with the Scale and Meter defined but Fail/Goal left as open questions, noted inline.
- Numeric targets that appear without source evidence are explicitly labelled as provisional.

## Master Tag Table

| Tag | Gist | File |
|---|---|---|
| **Link.Wiki.StyleBinding** | Completion items and rename edits must match the configured wiki link style. | [[docs/requirements/wiki-link-resolution]] |
| **Link.Wiki.AliasResolution** | YAML `aliases:` frontmatter values must be valid link targets equivalent to the document's primary name. | [[docs/requirements/wiki-link-resolution]] |
| **Link.Resolution.ModeScope** | Single-file mode must suppress all cross-file link resolution. | [[docs/requirements/wiki-link-resolution]] |
| **Link.Inline.URLSkip** | Inline links whose URL is not a markdown file path must produce no FG001 diagnostic. | [[docs/requirements/wiki-link-resolution]] |
| **Link.Resolution.IgnoreGlob** | Files matching `.gitignore` patterns must be absent from completion and definition results. | [[docs/requirements/wiki-link-resolution]] |
| **Embed.Resolution.MarkdownTarget** | `![[file.md]]` embeds must resolve to documents in VaultIndex; absence produces FG004. | [[embed-resolution]] |
| **Embed.Resolution.ImageTarget** | `![[image.png]]` embeds to image files must not produce FG001; only FG004 applies. | [[embed-resolution]] |
| **Embed.HeadingEmbed.Resolution** | `![[doc#heading]]` embeds must validate that both the document and the heading exist. | [[embed-resolution]] |
| **Embed.BlockEmbed.Resolution** | `![[doc#^blockid]]` embeds must validate that the `^blockid` anchor exists in the target document. | [[embed-resolution]] |
| **Tag.Index.Completeness** | All `#tag` occurrences in vault body text must be indexed by VaultIndex. | [[tag-indexing]] |
| **Tag.Hierarchy.Awareness** | The tag index must support parent-tag queries that include all child tags. | [[tag-indexing]] |
| **Tag.YAML.Equivalence** | `tags:` frontmatter values must be indexed identically to inline `#tags`. | [[tag-indexing]] |
| **Tag.Completion.Unicode** | Tag completion must support Unicode letters and emoji in tag names. | [[tag-indexing]] |
| **Block.Anchor.Indexing** | All `^blockid` anchors in document body must appear in OFMIndex.blockAnchors. | [[docs/requirements/block-references]] |
| **Block.CrossRef.Diagnostic** | `[[doc#^nonexistent]]` must produce FG005 (BrokenBlockRef); suppressed in single-file mode. | [[docs/requirements/block-references]] |
| **Block.Completion.Offer** | After typing `[[doc#^`, completion must offer all known `^blockid` values from the resolved document. | [[docs/requirements/block-references]] |
| **Block.Anchor.Lineend** | Only `^id` patterns at end-of-line are treated as block anchors. | [[docs/requirements/block-references]] |
| **Completion.Candidates.Cap** | Completion candidate list must be capped at `completion.candidates` config value with `isIncomplete` set. | [[docs/requirements/completions]] |
| **Completion.Trigger.Coverage** | All trigger characters must return candidates when cursor is in appropriate context. | [[docs/requirements/completions]] |
| **Completion.CalloutType.Coverage** | The 13 primary standard Obsidian callout types must appear as candidates at `> [!` position. | [[docs/requirements/completions]] |
| **Completion.WikiStyle.Binding** | Completion items must conform to the active wiki link style configuration. | [[docs/requirements/completions]] |
| **Diagnostic.Severity.WikiLink** | FG001/FG002/FG003 must carry Error severity. | [[docs/requirements/diagnostics]] |
| **Diagnostic.Severity.Embed** | FG004 must carry Warning severity. | [[docs/requirements/diagnostics]] |
| **Diagnostic.Code.Assignment** | Each diagnostic type must carry its assigned FG-prefixed numeric code. | [[docs/requirements/diagnostics]] |
| **Diagnostic.Debounce.Latency** | Diagnostics must be published within 500 ms of last document change in a vault of ≤1000 documents. | [[docs/requirements/diagnostics]] |
| **Diagnostic.Ambiguous.RelatedInfo** | FG002 diagnostics must list all duplicate definition locations in `relatedInformation`. | [[docs/requirements/diagnostics]] |
| **Diagnostic.SingleFile.Suppression** | All cross-file diagnostics must be suppressed in single-file mode. | [[docs/requirements/diagnostics]] |
| **CA-001** | The server surfaces a `fg.createMissingFile` code action when a wiki-link target does not exist; execution creates the file and clears FG001. | [[docs/requirements/code-actions]] |
| **CA-002** | The server surfaces a `fg.toc` code action for documents with headings; execution inserts or replaces a correctly formatted TOC block. | [[docs/requirements/code-actions]] |
| **CA-003** | The server surfaces a `fg.tagToYaml` code action when the cursor is on an inline body tag; execution moves the tag to frontmatter and removes it from the body. | [[docs/requirements/code-actions]] |
| **HV-001** | Hovering a wiki-link returns the target document's title, vault-relative path, and first-paragraph preview truncated to `hover.preview_chars`. | [[docs/requirements/hover]] |
| **HV-002** | Hovering an embed link returns the embedded target's resolved vault-relative path and detected file type. | [[docs/requirements/hover]] |
| **ST-001** | The server emits semantic token ranges for wiki-links, embed links, block anchors, inline tags, and callout markers. | [[docs/requirements/semantic-tokens]] |
| **ST-002** | Semantic tokens are not emitted for OFM constructs inside fenced code blocks or display math blocks. | [[docs/requirements/semantic-tokens]] |
| **Navigation.Definition.AllLinkTypes** | Go-to-definition must work for wiki-links, embed links, block references, and tags. | [[docs/requirements/navigation]] |
| **Navigation.References.Completeness** | Find-references must return all references in the folder that resolve to the target. | [[docs/requirements/navigation]] |
| **Navigation.CodeLens.Count** | Each heading must display a "N references" code lens with an accurate count. | [[docs/requirements/navigation]] |
| **Rename.Refactoring.Completeness** | All cross-document references to the renamed element must be updated in a single workspace edit. | [[docs/requirements/rename]] |
| **Rename.Prepare.Rejection** | `textDocument/prepareRename` must return `null` for non-renameable cursor positions. | [[docs/requirements/rename]] |
| **Rename.StyleBinding.Consistency** | Rename only updates references bound via the active wiki style. | [[docs/requirements/rename]] |
| **Workspace.VaultDetection.Primary** | Directories containing `.obsidian/` must be automatically detected as vault roots. | [[workspace]] |
| **Workspace.VaultDetection.Fallback** | Directories containing `.flavor-grenade.toml` must be detected as vault roots when `.obsidian/` is absent. | [[workspace]] |
| **Workspace.FileExtension.Filter** | Only files with configured extensions enter the index; others are silently ignored. | [[workspace]] |
| **Workspace.MultiFolder.Isolation** | Cross-root link resolution must not be performed between distinct vault roots. | [[workspace]] |
| **Extension.MarkdownLanguage.PreserveDefault** | The VS Code extension must keep `.md` files in the built-in `markdown` language mode. | [[docs/requirements/ofmarkdown-language-mode]] |
| **Extension.MarkdownFlavor.Selector** | The VS Code extension must expose Markdown flavor through a separate selector. | [[docs/requirements/ofmarkdown-language-mode]] |
| **Extension.MarkdownFlavor.RequiredCoverage** | The selector, setting schema, and server-facing flavor model must include every researched Markdown flavor. | [[docs/requirements/ofmarkdown-language-mode]] |
| **Extension.MarkdownFlavor.DialectProfiles** | Every supported explicit flavor must have a documented dialect profile derived from research. | [[docs/requirements/ofmarkdown-language-mode]] |
| **Extension.MarkdownFlavor.AutoDetection** | Auto Detect must infer flavor from vault and workspace signals. | [[docs/requirements/ofmarkdown-language-mode]] |
| **Extension.MarkdownFlavor.OverridePersistence** | Flavor overrides must persist to project settings for folder contexts and user settings for standalone files. | [[docs/requirements/ofmarkdown-language-mode]] |
| **Extension.MarkdownFlavor.ServerPropagation** | The effective Markdown flavor must propagate to server analysis. | [[docs/requirements/ofmarkdown-language-mode]] |
| **Extension.MarkdownFlavor.ManualLanguageSafety** | The selector must not override manual non-Markdown language mode selections. | [[docs/requirements/ofmarkdown-language-mode]] |
| **FlavorLSP.Profile.SignatureCoverage** | Every explicit Markdown flavor must have a server profile declaring active, inert, and host-specific syntax. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.Parser.ProfileDispatch** | The parser must dispatch through the effective flavor profile. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.Diagnostics.ProfileRules** | Diagnostics must use flavor-specific grammar, portability, and boundary rules. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.Completion.ProfileCandidates** | Completion must offer candidates valid or explicitly helpful for the effective flavor. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.Navigation.ProfileResolution** | Navigation and structural LSP responses must resolve only local symbols and structures defined by the effective flavor. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.Hover.ProfileMetadata** | Hover must describe profile-supported syntax, local metadata, and host or conversion boundaries. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.SemanticTokens.ProfileTokens** | Semantic tokens must mark only active flavor constructs and respect profile opaque regions. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.Rename.ProfileSafety** | Rename must update only flavor-supported local symbols and references inside safe scope. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **FlavorLSP.HostBoundary.NonLocalReferences** | Host-specific and conversion-specific references must stay separate from local vault targets. | [[docs/requirements/functional/markdown-flavor-lsp]] |
| **Parity.MarkdownLinks.LocalResolution** | Local standard Markdown links must resolve through the same vault rules as wiki-links. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.MarkdownLinks.SameDocumentAnchor** | Same-document Markdown anchors must support definition, diagnostics, references, and heading rename behavior. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.HeadingAmbiguity.Diagnostics** | Duplicate or ambiguous heading anchors must produce diagnostics with related candidate locations. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.FileOperations.AtomicRefactor** | File and folder moves must update every local reference to moved targets in one workspace edit. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.Attachments.Intelligence** | Attachments referenced by embeds or Markdown image links must support completion, diagnostics, definition, and hover metadata. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.StructuralLSP.Coverage** | Document links, folding ranges, and selection ranges must reflect OFMarkdown structure. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.MarkdownLinks.ParseCoverage** | The OFM parser must expose every supported standard Markdown link form as typed index data. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.MarkdownLinks.TargetClassification** | Markdown link targets must be classified before resolution. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.MarkdownLinks.ReferenceGraph** | The reference graph must index Markdown document refs, image refs, label refs, and label definitions. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.MarkdownLinks.Completion** | Markdown link URL contexts must offer vault document and heading completions. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.MarkdownLinks.NavigationAndReferences** | Definition and references must include supported Markdown link and label forms. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.MarkdownLinks.RenameAnchors** | Heading rename must update Markdown same-document and file-plus-fragment anchors. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.Attachments.IndexCoverage** | Non-Markdown vault files must be indexed as attachment targets without parsed document entries. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.Attachments.Completion** | Embed and Markdown image contexts must complete indexed attachment paths. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.Attachments.Diagnostics** | Broken attachment references must produce diagnostics while existing attachments remain diagnostic-free. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.Attachments.NavigationHover** | Existing attachment references must support definition and lightweight hover metadata. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.Attachments.ConfigHints** | Attachment completion and indexing must respect configured attachment folder hints. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.FileOperations.CapabilityRegistration** | The server must advertise and handle LSP file-operation rename capability when supported. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.FileOperations.MovePlannerConfinement** | File-operation planning must canonicalize paths and reject moves escaping the vault root. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.FileOperations.ReferenceRewrite** | File-operation refactors must rewrite all resolved moved-target reference forms while preserving syntax family. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.FileOperations.SkippedAmbiguousReporting** | Ambiguous moved-target references must be reported without speculative edits. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.FileOperations.AtomicValidation** | WorkspaceEdit output must be validated as deterministic, non-overlapping, and all-or-nothing. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.FileOperations.IndexRefresh** | `workspace/didRenameFiles` must refresh affected index entries and diagnostics. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.StructuralLSP.CapabilityRegistration** | Structural LSP providers must be advertised only when handlers are implemented. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.StructuralLSP.DocumentLinks** | Document links must target unambiguous local OFMarkdown links and leave ambiguous links unresolved. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.StructuralLSP.FoldingRanges** | Folding ranges must expose OFMarkdown foldable constructs without crossing opaque regions. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Parity.StructuralLSP.SelectionRanges** | Selection ranges must expand through valid OFMarkdown construct boundaries. | [[docs/requirements/functional/ofmarkdown-parity]] |
| **Extension.Activation.VaultPrecision** | The extension must activate automatically for vaults while avoiding unnecessary work in generic Markdown workspaces. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.CommandBridges.NativeUI** | Server-provided reference and navigation payloads must be bridgeable to native VS Code UI commands. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Tests.HostCoverage** | Extension-host tests must cover activation, commands, status, and language-mode behavior. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Marketplace.OFMProof** | The Marketplace README must show OFMarkdown-specific features with current screenshots or GIFs. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Status.Diagnostics** | The status bar must expose actionable server, vault, and error state. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Activation.MarkerEvents** | The extension must react to vault markers, language activation, and explicit commands. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.CommandBridges.PayloadValidation** | Command bridges must validate JSON-serializable payloads before calling VS Code APIs. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.CommandBridges.GraphActions** | The extension must bridge references, links, embeds, graph actions, vault reveal, and diagnostic copy actions. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Status.QuickActions** | Status UI must expose restart, rebuild index, show output, copy diagnostics, and reveal vault root actions. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.MarkdownFlavor.Refresh** | Markdown flavor state must refresh after server, workspace, file, and selector events. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Workspace.EnvironmentModes** | Restricted, virtual, remote, WSL, SSH, and Dev Container workspaces must have explicit behavior. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Contributions.FlavorScoped** | Flavor-specific snippets, keybindings, commands, and theme examples must be scoped. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Extension.Marketplace.AssetPackaging** | Marketplace screenshots and README assets must be referenced and included in VSIX output. | [[docs/requirements/functional/vscode-extension-parity]] |
| **Config.Precedence.Layering** | Project config overrides user config overrides built-in defaults. | [[configuration]] |
| **Config.Validation.Candidates** | `completion.candidates` must be strictly positive; invalid values fall back to the built-in default. | [[configuration]] |
| **Config.Fault.Isolation** | Malformed TOML must be dropped without crashing the server. | [[configuration]] |
| **Config.TextSync.Default** | Absent `core.text_sync` must default to `"full"`. | [[configuration]] |
| **Quality.SOLID.SingleResponsibility** | Each class or service must have exactly one reason to change. | [[code-quality]] |
| **Quality.SOLID.DependencyInversion** | All cross-module dependencies must point toward abstractions, never concrete implementations. | [[code-quality]] |
| **Quality.Coherence.OneClassPerFile** | Each non-barrel `.ts` file exports exactly one primary entity. | [[code-quality]] |
| **Quality.Coupling.ModuleBoundaries** | Cross-module imports only via a module's public `index.ts` barrel. | [[code-quality]] |
| **Quality.Docs.Docstrings** | Every exported class, public method, and public property must carry a JSDoc docstring. | [[code-quality]] |
| **Quality.Lint.ZeroWarnings** | All linters must produce zero errors and zero warnings; `--max-warnings 0` enforced. | [[code-quality]] |
| **Quality.Types.StrictMode** | TypeScript strict mode enabled; `tsc --noEmit` must exit 0 with zero errors. | [[code-quality]] |
| **Quality.TDD.StrictRedGreen** | Every implementation commit must be preceded by a failing test that drives it; no code without a red test first. | [[code-quality]] |
| **Quality.SourceLayout.DocsBoundary** | Documentation folders may contain specs, but raw source files and source-like BDD implementation notes stay with source/test harnesses. | [[code-quality]] |
| **CICD.Workflow.PRGate** | Every PR to `main` or `develop` must pass all CI checks before merge. | [[docs/requirements/ci-cd]] |
| **CICD.Workflow.BDDGate** | The default Cucumber BDD gate must execute every checked-in scenario without undefined, pending, or failed steps. | [[docs/requirements/ci-cd]] |
| **CICD.Markdown.DocsFolderLinting** | `docs/` markdown linted by markdownlint-obsidian in CI; violations fail CI. | [[docs/requirements/ci-cd]] |
| **CICD.Markdown.SourceLinting** | Non-docs, non-.github markdown linted by markdownlint-cli2 in CI. | [[docs/requirements/ci-cd]] |
| **CICD.Publish.OIDC** | npm and Bun publishing use OIDC provenance; `npm publish --provenance` required. | [[docs/requirements/ci-cd]] |
| **CICD.Publish.Trigger** | Publishing triggered only by semver tag push to `main`. | [[docs/requirements/ci-cd]] |
| **CICD.PreCommit.Gate** | `lefthook` pre-commit runs typecheck + lint + format:check + test before each commit. | [[docs/requirements/ci-cd]] |
| **Process.Branching.MainReleasesOnly** | `main` receives only release/hotfix merges; direct pushes prohibited. | [[development-process]] |
| **Process.Testing.DirectoryStructure** | All tests under `tests/`; unit tests mirror `src/` under `tests/unit/`. | [[development-process]] |
| **Process.TestIndex.Matrix** | `docs/test/matrix.md` updated for every new test file added. | [[development-process]] |
| **Process.Scripts.Automation** | Repetitive procedures automated in `scripts/` shell scripts. | [[development-process]] |
| **Process.BinaryFiles.LFS** | All binary files tracked via Git LFS; no binary blobs committed directly. | [[development-process]] |
| **Security.Parser.ReDoS** | All OFM parser regexes must be audited for catastrophic backtracking; super-linear patterns are prohibited. | [[docs/requirements/security/parser-safety]] |
| **Security.Parser.ParseTimeout** | Any single vault file must complete parsing within 200 ms; timeouts produce empty results without crashing. | [[docs/requirements/security/parser-safety]] |
| **Security.Parser.YAMLLimits** | Frontmatter YAML parsed with alias cap (50), size limit (64 KB), safe mode; parse failures caught as malformed frontmatter. | [[docs/requirements/security/parser-safety]] |
| **Security.Parser.EmbedDepth** | Embed resolution detects cycles via visited-URI set and enforces max depth 10; circular embeds produce FG005. | [[docs/requirements/security/parser-safety]] |
| **Security.Parser.VaultFileLimit** | Initial vault indexing stops at 50,000 files (configurable); client notified via `window/showMessage`. | [[docs/requirements/security/parser-safety]] |
| **Security.Vault.PathConfinement** | All file paths from vault content or LSP params are canonicalized and vault-root-checked before any I/O. | [[docs/requirements/security/vault-confinement]] |
| **Security.Vault.SymlinkConfinement** | Symlinks resolving outside the vault root are treated as non-existent; real symlink target path is checked, not symlink path. | [[docs/requirements/security/vault-confinement]] |
| **Security.Vault.URISchemeAllowlist** | Only `file://` URIs are accepted; non-`file://` URIs return InvalidParams (-32602) before reaching any resolver. | [[docs/requirements/security/vault-confinement]] |
| **Security.Vault.RenameConfinement** | Rename edit targets must pass vault-root confinement; any escaping URI cancels the entire rename. | [[docs/requirements/security/vault-confinement]] |
| **Security.Input.PositionValidation** | All LSP `Position`/`Range` params validated as non-negative integers within document bounds before VaultIndex access. | [[docs/requirements/security/input-validation]] |
| **Security.Input.PayloadSize** | JSON-RPC messages exceeding 16 MiB, or headers exceeding 8 KiB, are rejected at the transport layer before JSON parsing. | [[docs/requirements/security/input-validation]] |
| **Security.Input.PrototypePollution** | Incoming JSON-RPC bodies schema-validated before object merge; `__proto__` and `constructor.prototype` keys must not pollute `Object.prototype`. | [[docs/requirements/security/input-validation]] |
| **Security.Supply.ExactPinning** | Exact dependency pinning is the target policy; remaining range specifiers are tracked supply-chain debt until CI range linting lands. | [[docs/requirements/security/supply-chain]] |
| **Security.Supply.FrozenLockfile** | All CI `bun install` uses `--frozen-lockfile`; lockfile drift fails the build. | [[docs/requirements/security/supply-chain]] |
| **Security.Supply.IgnoreScripts** | All CI `bun install` uses `--ignore-scripts` (CLI flag, not `.npmrc`, due to Bun bypass). | [[docs/requirements/security/supply-chain]] |
| **Security.Supply.AdvisoryMonitoring** | Direct dependency upgrades reviewed against security advisories; documented in `docs/security/dependency-audit-log.md`. | [[docs/requirements/security/supply-chain]] |
| **Security.Supply.SetupNodeCacheControl** | Scanner-covered `actions/setup-node` steps must disable automatic package-manager caching unless an explicit reviewed cache key is present. | [[docs/requirements/security/supply-chain]] |
| **Security.Supply.NoDevtoolsIntegration** | `@nestjs/devtools-integration` must remain absent from manifests, lockfiles, and source. | [[docs/requirements/security/supply-chain]] |
| **Security.Disclosure.LogSanitization** | Server logs never include vault document content; only paths, line numbers, and diagnostic codes permitted. | [[docs/requirements/security/information-disclosure]] |
| **Security.Disclosure.CompletionFilter** | Completion candidates from frontmatter values under sensitive key names (password, token, secret, api_key) are filtered out. | [[docs/requirements/security/information-disclosure]] |
| **Security.Config.NoCodeExecution** | `.flavor-grenade.toml` schema never includes command/script/executable fields; vault config never causes process spawning. | [[docs/requirements/security/information-disclosure]] |

## User Requirements

The user requirements layer lives in [[docs/requirements/user/index]]. It contains implementation-agnostic user goals across the current feature themes, each mapping to one or more functional requirements in this index. Every functional requirement that has a user-level mapping carries a `User Req:` field directly below its `Tag` field.

## Related Documents

- [[docs/design/domain-layer]] — domain model: VaultIndex, OFMIndex, document entities
- [[docs/design/api-layer]] — LSP method handlers and request/response contracts
- `docs/bdd/features/` — Gherkin scenarios that exercise requirements as acceptance tests
- [[docs/architecture/overview]] — system decomposition, NestJS module boundaries, Bun runtime constraints
- [[docs/ofm-spec/index]] — Obsidian Flavored Markdown specification used as primary evidence source
- [[roadmap]] — delivery milestones and requirement prioritisation
