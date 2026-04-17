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
| **Link.Wiki.StyleBinding** | Completion items and rename edits must match the configured wiki link style. | [[wiki-link-resolution]] |
| **Link.Wiki.AliasResolution** | YAML `aliases:` frontmatter values must be valid link targets equivalent to the document's primary name. | [[wiki-link-resolution]] |
| **Link.Resolution.ModeScope** | Single-file mode must suppress all cross-file link resolution. | [[wiki-link-resolution]] |
| **Link.Inline.URLSkip** | Inline links whose URL is not a markdown file path must produce no FG001 diagnostic. | [[wiki-link-resolution]] |
| **Link.Resolution.IgnoreGlob** | Files matching `.gitignore` patterns must be absent from completion and definition results. | [[wiki-link-resolution]] |
| **Embed.Resolution.MarkdownTarget** | `![[file.md]]` embeds must resolve to documents in VaultIndex; absence produces FG004. | [[embed-resolution]] |
| **Embed.Resolution.ImageTarget** | `![[image.png]]` embeds to image files must not produce FG001; only FG004 applies. | [[embed-resolution]] |
| **Embed.HeadingEmbed.Resolution** | `![[doc#heading]]` embeds must validate that both the document and the heading exist. | [[embed-resolution]] |
| **Embed.BlockEmbed.Resolution** | `![[doc#^blockid]]` embeds must validate that the `^blockid` anchor exists in the target document. | [[embed-resolution]] |
| **Tag.Index.Completeness** | All `#tag` occurrences in vault body text must be indexed by VaultIndex. | [[tag-indexing]] |
| **Tag.Hierarchy.Awareness** | The tag index must support parent-tag queries that include all child tags. | [[tag-indexing]] |
| **Tag.YAML.Equivalence** | `tags:` frontmatter values must be indexed identically to inline `#tags`. | [[tag-indexing]] |
| **Tag.Completion.Unicode** | Tag completion must support Unicode letters and emoji in tag names. | [[tag-indexing]] |
| **Block.Anchor.Indexing** | All `^blockid` anchors in document body must appear in OFMIndex.blockAnchors. | [[block-references]] |
| **Block.CrossRef.Diagnostic** | `[[doc#^nonexistent]]` must produce FG005 (BrokenBlockRef); suppressed in single-file mode. | [[block-references]] |
| **Block.Completion.Offer** | After typing `[[doc#^`, completion must offer all known `^blockid` values from the resolved document. | [[block-references]] |
| **Block.Anchor.Lineend** | Only `^id` patterns at end-of-line are treated as block anchors. | [[block-references]] |
| **Completion.Candidates.Cap** | Completion candidate list must be capped at `completion.candidates` config value with `isIncomplete` set. | [[completions]] |
| **Completion.Trigger.Coverage** | All trigger characters must return candidates when cursor is in appropriate context. | [[completions]] |
| **Completion.CalloutType.Coverage** | The 23 standard Obsidian callout types must appear as candidates at `> [!` position. | [[completions]] |
| **Completion.WikiStyle.Binding** | Completion items must conform to the active wiki link style configuration. | [[completions]] |
| **Diagnostic.Severity.WikiLink** | FG001/FG002 must carry Error severity. | [[diagnostics]] |
| **Diagnostic.Severity.Embed** | FG004 must carry Warning severity. | [[diagnostics]] |
| **Diagnostic.Code.Assignment** | Each diagnostic type must carry its assigned FG-prefixed numeric code. | [[diagnostics]] |
| **Diagnostic.Debounce.Latency** | Diagnostics must be published within 500 ms of last document change in a vault of ≤1000 documents. | [[diagnostics]] |
| **Diagnostic.Ambiguous.RelatedInfo** | FG002 diagnostics must list all duplicate definition locations in `relatedInformation`. | [[diagnostics]] |
| **Diagnostic.SingleFile.Suppression** | All cross-file diagnostics must be suppressed in single-file mode. | [[diagnostics]] |
| **Navigation.Definition.AllLinkTypes** | Go-to-definition must work for wiki-links, embed links, block references, and tags. | [[navigation]] |
| **Navigation.References.Completeness** | Find-references must return all references in the folder that resolve to the target. | [[navigation]] |
| **Navigation.CodeLens.Count** | Each heading must display a "N references" code lens with an accurate count. | [[navigation]] |
| **Rename.Refactoring.Completeness** | All cross-document references to the renamed element must be updated in a single workspace edit. | [[rename]] |
| **Rename.Prepare.Rejection** | `textDocument/prepareRename` must return `null` for non-renameable cursor positions. | [[rename]] |
| **Rename.StyleBinding.Consistency** | Rename only updates references bound via the active wiki style. | [[rename]] |
| **Workspace.VaultDetection.Primary** | Directories containing `.obsidian/` must be automatically detected as vault roots. | [[workspace]] |
| **Workspace.VaultDetection.Fallback** | Directories containing `.flavor-grenade.toml` must be detected as vault roots when `.obsidian/` is absent. | [[workspace]] |
| **Workspace.FileExtension.Filter** | Only files with configured extensions enter the index; others are silently ignored. | [[workspace]] |
| **Workspace.MultiFolder.Isolation** | Cross-root link resolution must not be performed between distinct vault roots. | [[workspace]] |
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
| **CICD.Workflow.PRGate** | Every PR to `main` or `develop` must pass all CI checks before merge. | [[ci-cd]] |
| **CICD.Markdown.DocsFolderLinting** | `docs/` markdown linted by markdownlint-obsidian in CI; violations fail CI. | [[ci-cd]] |
| **CICD.Markdown.SourceLinting** | Non-docs, non-.github markdown linted by markdownlint-cli2 in CI. | [[ci-cd]] |
| **CICD.Publish.OIDC** | npm and Bun publishing use OIDC provenance; `npm publish --provenance` required. | [[ci-cd]] |
| **CICD.Publish.Trigger** | Publishing triggered only by semver tag push to `main`. | [[ci-cd]] |
| **CICD.PreCommit.Gate** | `lefthook` pre-commit runs typecheck + lint + format:check + test before each commit. | [[ci-cd]] |
| **Process.Branching.MainReleasesOnly** | `main` receives only release/hotfix merges; direct pushes prohibited. | [[development-process]] |
| **Process.Testing.DirectoryStructure** | All tests under `tests/`; unit tests mirror `src/` under `tests/unit/`. | [[development-process]] |
| **Process.TestIndex.Matrix** | `docs/test/matrix.md` updated for every new test file added. | [[development-process]] |
| **Process.Scripts.Automation** | Repetitive procedures automated in `scripts/` shell scripts. | [[development-process]] |
| **Process.BinaryFiles.LFS** | All binary files tracked via Git LFS; no binary blobs committed directly. | [[development-process]] |

## Related Documents

- [[design/domain-layer]] — domain model: VaultIndex, OFMIndex, document entities
- [[design/api-layer]] — LSP method handlers and request/response contracts
- [[bdd/features]] — Gherkin scenarios that exercise requirements as acceptance tests
- [[architecture/overview]] — system decomposition, NestJS module boundaries, Bun runtime constraints
- [[ofm-spec/index]] — Obsidian Flavored Markdown specification used as primary evidence source
- [[plans/roadmap]] — delivery milestones and requirement prioritisation
