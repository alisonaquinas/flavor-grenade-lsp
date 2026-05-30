---
title: Markdown Flavor LSP Requirements
tags:
  - requirements/functional/markdown-flavor-lsp
aliases:
  - Markdown Flavor LSP Requirements
  - Flavor-Aware Server Requirements
---

# Markdown Flavor LSP Requirements

Scope: These requirements govern server-side flavor-aware language behavior
derived from [[docs/features/markdown-flavor-feature-sets]] and the
flavor-specific feature pages under `docs/features/*-flavor.md`. Client
selection, persistence, and propagation remain governed by
[[docs/requirements/functional/ofmarkdown-language-mode]] and
[[docs/requirements/functional/vscode-extension-parity]].

Required explicit flavors: `original`, `commonmark`, `obsidian`, `gfm`, `glfm`,
`pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`,
`reddit`, and `stack-overflow`.

Persistent file and directory flavor assignment is provided by `.fgattributes`.
File visibility is provided by `.fgignore`. Files ignored by `.fgignore` are
outside server analysis scope.

Structured profiles are separate flags, not required explicit flavors. Keep a
Changelog, Common Changelog, and MADR may be layered onto any required explicit
flavor through [[docs/design/markdown-structured-profile-flags]].

---

## FlavorLSP.ConfigFiles.VisibilityAndAttributes

**Tag:** FlavorLSP.ConfigFiles.VisibilityAndAttributes
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** The server must resolve `.fgignore` and `.fgattributes` before parsing or indexing a Markdown file.
**Ambition:** Flavor configuration should be deterministic and shared by every editor client. Ignored files must not leak into `VaultIndex`, `RefGraph`, diagnostics, completion, navigation, semantic tokens, hover, or rename. Attributed files must parse under the configured flavor before any language feature runs.
**Scale:** Percentage of config-file fixtures whose visibility and effective flavor match the Git-style cascade.
**Meter:**

1. Create fixture vaults with root and nested `.fgignore` and `.fgattributes` files.
2. Cover anchored patterns, unanchored patterns, directory patterns, `*`, `?`, character classes, `**`, comments, escaped comment/negation characters, later-rule precedence, nested-file precedence, and negation.
3. Verify ignored Markdown files are not parsed, indexed, diagnosed, completed, navigated, semantically tokenized, hovered, renamed, or used as reference targets.
4. Verify visible files receive the expected `EffectiveMarkdownContext` from `.fgattributes`.
5. Verify invalid patterns or values are isolated to their line and do not crash the server.
6. Compute: (correct config-file outcomes / total config-file outcomes) x 100.
**Fail:** Any ignored file enters server analysis, any attributed file uses the wrong flavor, or any invalid config line crashes the server.
**Goal:** 100% config-file resolution correctness.
**Stakeholders:** Markdown authors, vault authors, server maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-config-files]], [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]], [[docs/design/markdown-flavor-auto-detection]].

---

## FlavorLSP.Profile.SignatureCoverage

**Tag:** FlavorLSP.Profile.SignatureCoverage
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Every explicit Markdown flavor must have a server profile that declares active, inert, and host-specific syntax surfaces.
**Ambition:** The server should not treat flavor selection as a label only. Parser, diagnostics, completion, hover, navigation, semantic tokens, folding, document symbols, and rename need one profile contract per flavor.
**Scale:** Percentage of required explicit flavors whose profile matches the corresponding feature page signature.
**Meter:**

1. Inspect the server flavor profile registry.
2. Verify profiles exist for `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`.
3. For each profile, compare active, inert, and host-specific surfaces against its `docs/features/*-flavor.md` page.
4. Verify Obsidian-only wiki-links, embeds, tags, callouts, and vault behavior are inactive outside `obsidian` unless a flavor page explicitly enables the construct.
5. Compute: (profiles matching their feature page signatures / 13 required profiles) x 100.
**Fail:** Any required explicit flavor lacks a profile, or a profile enables a construct forbidden by its feature page.
**Goal:** 100% profile signature coverage.
**Stakeholders:** Markdown authors, vault authors, server maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/features/original-markdown-flavor]], [[docs/features/commonmark-flavor]], [[docs/features/obsidian-markdown-flavor]], [[docs/features/github-flavored-markdown-flavor]], [[docs/features/gitlab-flavored-markdown-flavor]], [[docs/features/pandoc-markdown-flavor]], [[docs/features/multimarkdown-flavor]], [[docs/features/mdx-flavor]], [[docs/features/kramdown-flavor]], [[docs/features/markdown-extra-flavor]], [[docs/features/r-markdown-flavor]], [[docs/features/reddit-markdown-flavor]], [[docs/features/stack-overflow-markdown-flavor]].

---

## FlavorLSP.Parser.ProfileDispatch

**Tag:** FlavorLSP.Parser.ProfileDispatch
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** The parser must dispatch to the effective flavor profile before emitting Markdown symbols, opaque regions, links, and extension tokens.
**Ambition:** Same text can mean different things in different Markdown dialects. Server analysis must be deterministic for the selected flavor instead of relying on one global parser surface.
**Scale:** Percentage of profile-specific parser fixtures that emit expected symbols and suppress inactive syntax.
**Meter:**

1. Create one parser fixture per required explicit flavor containing its signature constructs and at least three constructs inactive for that flavor.
2. Parse each fixture with its effective flavor.
3. Verify active constructs emit typed index entries with stable ranges.
4. Verify inactive constructs are plain text or portability candidates, not active symbols.
5. Verify opaque regions apply per profile, including Obsidian opaque regions, MDX JSX/ESM regions, R Markdown chunks, math regions, and fenced code blocks where defined.
6. Verify parser changes satisfy [[docs/requirements/technical/security-parser-safety#Security.Parser.FlavorProfileResourceSafety]].
7. Compute: (correct parser outcomes / total expected parser outcomes) x 100.
**Fail:** Any inactive construct is emitted as active profile syntax, any active signature construct is absent from parse output, or any profile parser lacks required resource-safety evidence.
**Goal:** 100% parser dispatch correctness for required fixtures.
**Stakeholders:** Markdown authors, LSP implementers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/requirements/functional/ofmarkdown-language-mode]].

---

## FlavorLSP.Diagnostics.ProfileRules

**Tag:** FlavorLSP.Diagnostics.ProfileRules
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Diagnostics must use flavor-specific grammar, portability, and boundary rules.
**Ambition:** Users should see useful broken-link and malformed-syntax diagnostics without Obsidian or host-platform noise leaking into other flavors.
**Scale:** Percentage of diagnostic fixtures that produce exactly the expected diagnostics for the effective flavor.
**Meter:**

1. Create diagnostics fixtures for broken local Markdown links, malformed tables, duplicate labels or IDs, dangling footnotes, malformed citations, malformed chunk headers, malformed MDX containers, and Obsidian wiki-link/embed errors.
2. Analyze each fixture under every relevant flavor.
3. Verify profile-supported malformed syntax is reported.
4. Verify inactive syntax is reported only as an opted-in portability issue where the profile allows it.
5. Verify host-specific references are not reported as missing vault files or broken wiki-links.
6. Compute: (correct diagnostic sets / total diagnostic fixture runs) x 100.
**Fail:** Any explicit non-Obsidian flavor emits Obsidian-only broken-link diagnostics, or any supported malformed signature construct is silent.
**Goal:** 100% diagnostic profile correctness.
**Stakeholders:** Markdown authors, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/requirements/functional/diagnostics]].

---

## FlavorLSP.Completion.ProfileCandidates

**Tag:** FlavorLSP.Completion.ProfileCandidates
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Completion must offer only candidates that are valid or explicitly helpful for the effective flavor context.
**Ambition:** Completion should teach the active dialect without polluting CommonMark or host-focused documents with unrelated vault or platform snippets.
**Scale:** Percentage of completion trigger positions that return the expected profile-scoped candidate classes.
**Meter:**

1. Create completion fixtures for local links, headings, reference labels, tables, task markers, callouts, tags, attachments, citations, labels, attributes, footnotes, abbreviations, JSX components, R chunk options, spoilers, and host reference prefixes.
2. Trigger completion at each fixture position under the relevant flavor.
3. Verify required candidates appear for the active flavor.
4. Verify Obsidian wiki-link, embed, tag, attachment, and callout completions appear only under `obsidian`.
5. Verify host-reference snippets appear only for `gfm`, `glfm`, `reddit`, or `stack-overflow` contexts that define them.
6. Compute: (correct completion responses / total completion requests) x 100.
**Fail:** Any active flavor completion context lacks its required candidate class, or a disabled flavor surface appears as a normal candidate.
**Goal:** 100% completion profile correctness for covered triggers.
**Stakeholders:** Markdown authors, vault authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/requirements/functional/completions]].

---

## FlavorLSP.Navigation.ProfileResolution

**Tag:** FlavorLSP.Navigation.ProfileResolution
**User Req:** User.Navigate.JumpToNote
**Gist:** Definition, references, document links, document symbols, and folding must resolve only the local symbols and structures defined by the effective flavor.
**Ambition:** Navigation should work for local links, headings, labels, footnotes, chunks, attributes, abbreviations, and Obsidian vault objects where supported, while leaving platform objects non-local.
**Scale:** Percentage of profile navigation fixtures that return correct local targets, references, symbols, and folds.
**Meter:**

1. Create navigation fixtures for local Markdown links, headings, labels, footnotes, citations with configured bibliographic context, explicit IDs, abbreviations, R chunks, MDX components, Obsidian wiki-links, embeds, blocks, tags, and host references.
2. Request definition, references, document links, document symbols, and folding ranges where applicable.
3. Verify local profile-supported symbols resolve to correct ranges.
4. Verify host-specific references are classified but not resolved as local targets.
5. Verify inactive dialect structures do not appear as document symbols or folds.
6. Compute: (correct navigation outcomes / total expected navigation outcomes) x 100.
**Fail:** Any local profile-supported reference cannot navigate, or any host-specific object is resolved as a vault file without integration context.
**Goal:** 100% navigation profile correctness.
**Stakeholders:** Markdown authors, LSP client users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/requirements/functional/navigation]], [[docs/requirements/functional/ofmarkdown-parity]].

---

## FlavorLSP.Hover.ProfileMetadata

**Tag:** FlavorLSP.Hover.ProfileMetadata
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Hover must describe profile-supported syntax, local target metadata, and host or conversion boundaries for the effective flavor.
**Ambition:** Hover should help users understand the selected dialect without claiming renderer, platform, or execution behavior the local server cannot verify.
**Scale:** Percentage of hover positions that return accurate profile-scoped metadata or no hover when no profile construct is present.
**Meter:**

1. Create hover fixtures for local links, headings, tables, task markers, citations, labels, footnotes, attributes, abbreviations, JSX, R chunks, spoilers, Obsidian objects, and host references.
2. Request hover at representative token positions under the relevant flavor.
3. Verify local targets include normalized local metadata.
4. Verify host-specific, conversion-bound, renderer-bound, and execution-bound constructs are labeled as such.
5. Verify inactive syntax does not receive hover that implies active support.
6. Compute: (correct hover responses / total hover positions) x 100.
**Fail:** Any hover claims local resolution, rendering parity, platform validation, or code execution that the server cannot provide.
**Goal:** 100% hover profile correctness for covered constructs.
**Stakeholders:** Markdown authors, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/requirements/functional/hover]].

---

## FlavorLSP.SemanticTokens.ProfileTokens

**Tag:** FlavorLSP.SemanticTokens.ProfileTokens
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Semantic tokens must mark only active flavor constructs and must respect profile opaque regions.
**Ambition:** Highlighting should communicate the active dialect without false color on syntax that is inert in the selected flavor.
**Scale:** Percentage of profile semantic-token fixtures whose token ranges and token classes match the effective flavor.
**Meter:**

1. Create semantic-token fixtures for headings, links, tables, task markers, strikethrough, autolinks, footnotes, attributes, abbreviations, citations, math, diagrams, JSX, ESM, R chunks, spoilers, Obsidian wiki-links, embeds, tags, blocks, and callouts.
2. Request semantic tokens under each relevant flavor.
3. Verify active constructs receive the expected token types and modifiers.
4. Verify inactive constructs and profile opaque-region contents do not receive misleading Markdown semantic tokens.
5. Compute: (correct semantic token ranges / total expected semantic token ranges) x 100.
**Fail:** Any inactive syntax receives an active flavor token, or any required active token range is missing.
**Goal:** 100% semantic token profile correctness for covered constructs.
**Stakeholders:** Markdown authors, theme authors, editor integrators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/requirements/functional/semantic-tokens]].

---

## FlavorLSP.Rename.ProfileSafety

**Tag:** FlavorLSP.Rename.ProfileSafety
**User Req:** User.Rename.RenameHeadingEverywhere
**Gist:** Rename must update only flavor-supported local symbols and references inside the selected profile's safe scope.
**Ambition:** Refactors should be complete for local Markdown targets while avoiding speculative edits to host-platform objects, renderer outputs, or executable contexts.
**Scale:** Percentage of rename fixtures that produce complete, syntax-preserving, profile-safe WorkspaceEdits or correct rejections.
**Meter:**

1. Create rename fixtures for headings, local Markdown links, reference labels, explicit IDs, labels, footnotes, abbreviations, R chunk labels, MDX local components, and Obsidian notes, blocks, tags, embeds, and attachments.
2. Request `textDocument/prepareRename` and `textDocument/rename` under the relevant flavor.
3. Verify supported local symbols produce complete WorkspaceEdits that preserve syntax family.
4. Verify every generated edit URI and range satisfies [[docs/requirements/functional/security-vault-confinement#Security.Vault.RenameConfinement]] before `workspace/applyEdit`.
5. Verify unsupported, inactive, host-specific, conversion-bound, and execution-bound targets are rejected atomically with no partial edit.
6. Compute: (correct rename outcomes / total rename cases) x 100.
**Fail:** Any supported local rename leaves stale references, any unsafe host/platform/execution target receives speculative edits, or any out-of-vault/stale-resource edit reaches `workspace/applyEdit`.
**Goal:** 100% rename profile safety.
**Stakeholders:** Markdown authors, vault authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-feature-sets]], [[docs/requirements/functional/rename]], [[docs/requirements/functional/ofmarkdown-parity]].

---

## FlavorLSP.HostBoundary.NonLocalReferences

**Tag:** FlavorLSP.HostBoundary.NonLocalReferences
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Host-specific and conversion-specific references must be classified separately from local vault, file, heading, label, and citation targets.
**Ambition:** GitHub, GitLab, Reddit, Stack Overflow, Pandoc, MultiMarkdown, MDX, and R Markdown behavior often depends on platform, renderer, project, bibliography, or execution context. The local server must not invent verification it does not have.
**Scale:** Percentage of non-local boundary fixtures classified without false local resolution, diagnostics, or edits.
**Meter:**

1. Create fixtures for GitHub issues, commits, users, labels, and alerts; GitLab issues, MRs, epics, labels, includes, diagrams, and TOC tags; Reddit subreddit, user, comment, and spoiler syntax; Stack Overflow tags, users, questions, answers, comments, spoilers, and language hints; Pandoc conversion extensions; MultiMarkdown export features; MDX JSX/ESM; and R Markdown chunks.
2. Analyze each fixture under its relevant flavor.
3. Verify host or conversion references are typed as non-local unless configured integration context exists.
4. Verify classification performs no network request, process execution, dynamic module import, or file read outside the vault/workspace root.
5. Verify broken-vault-link diagnostics, local navigation, and rename edits are not emitted for non-local references.
6. Verify hover explains the boundary.
7. Compute: (correct boundary classifications / total boundary fixtures) x 100.
**Fail:** Any host-specific or conversion-specific reference becomes a vault edit, broken vault diagnostic, local definition, network request, process execution, dynamic import, or out-of-root file read without verified local context.
**Goal:** 100% non-local boundary correctness.
**Stakeholders:** Markdown authors, security reviewers, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/github-flavored-markdown-flavor]], [[docs/features/gitlab-flavored-markdown-flavor]], [[docs/features/pandoc-markdown-flavor]], [[docs/features/multimarkdown-flavor]], [[docs/features/mdx-flavor]], [[docs/features/r-markdown-flavor]], [[docs/features/reddit-markdown-flavor]], [[docs/features/stack-overflow-markdown-flavor]], [[docs/requirements/functional/security-vault-confinement]].

---

## FlavorLSP.StructuredProfiles.Flags

**Tag:** FlavorLSP.StructuredProfiles.Flags
**User Req:** User.Flavor.ApplyStructuredProfiles
**Gist:** Structured Markdown profiles must be independent flags layered over the effective base flavor, not new flavor ids.
**Ambition:** Changelogs and ADRs should receive useful structure-aware diagnostics, symbols, hovers, completions, and navigation without forcing users to choose between document-structure support and their actual Markdown dialect.
**Scale:** Percentage of structured profile combinations that preserve base flavor behavior and apply only the requested or inferred structured-document rules.
**Meter:**

1. Inspect the shared flavor contract and verify `keep-a-changelog`, `common-changelog`, and `madr` are absent from `MarkdownFlavorId`.
2. Verify a separate `StructuredMarkdownProfileId` contract exists for `keep-a-changelog`, `common-changelog`, and `madr`.
3. Parse fixtures for `commonmark + keep-a-changelog`, `gfm + common-changelog`, `obsidian + madr`, and at least one additional base-flavor/profile combination.
4. Verify every configured and project-config-absent inference smoke-test workspace has colocated `structured/keep-a-changelog/CHANGELOG.md`, `structured/common-changelog/CHANGELOG.md`, and `structured/madr/docs/decisions/NNNN-*.md` examples under the same workspace as the base flavor or inference evidence.
5. Verify base-flavor syntax remains governed by the effective `MarkdownFlavorId`.
6. Verify structured diagnostics/symbols/folds apply only to matching changelog or MADR structure.
7. Verify `keep-a-changelog` and `common-changelog` are mutually exclusive during automatic inference and explicit configuration.
8. Verify no structured profile causes network access, process execution, renderer invocation, or out-of-workspace reads.
9. Compute: (correct structured profile outcomes / total structured profile outcomes) x 100.
**Fail:** Any structured profile is added to the base flavor selector, any structured flag disables base flavor parsing, or any automatic inference applies a changelog/ADR profile from weak evidence alone.
**Goal:** 100% structured profile flag correctness for supported profiles.
**Stakeholders:** Markdown authors, release maintainers, architecture decision authors, LSP implementers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/design/markdown-structured-profile-flags]], [[docs/research/keep-a-changelog-analysis]], [[docs/research/common-changelog-analysis]], [[docs/research/madr-analysis]].
