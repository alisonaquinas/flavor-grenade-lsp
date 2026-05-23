---
title: "Config Domain Model — flavor-grenade-lsp"
tags:
  - ddd/domain-model
  - ddd/config
  - architecture
aliases:
  - config domain model
  - FlavorConfig model
  - ConfigCascade
---

# Config Domain Model — flavor-grenade-lsp

This document is the authoritative model for the configuration system in `flavor-grenade-lsp`. Config is a cross-cutting concern, not a full bounded context — it has no aggregate root and no domain events. It is a supporting module (`ConfigModule` in NestJS) that provides read-only `FlavorConfig` values and the shared Markdown flavor contract consumed by BC4, BC2, BC5, and BC6.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[docs/design/markdown-flavor-auto-detection]], [[docs/design/markdown-structured-profile-flags]], [[docs/ddd/vault/domain-model]], [[docs/ddd/lsp-protocol/domain-model]].

> [!NOTE]
> Config is intentionally thin. It does not know about documents, refs, or the LSP wire. Its job is to merge TOML files in the correct priority order, validate Markdown flavor selectors, and expose typed immutable values. BC4 owns the resulting `EffectiveMarkdownFlavor` state.

---

## FlavorConfig

`FlavorConfig` is the fully merged configuration value for one `VaultFolder`. It is an immutable value object — replacing the config means constructing a new `FlavorConfig` from a new `ConfigCascade` resolution.

### Schema

```toml
[core]
# File extensions treated as Markdown documents
markdown.file_extensions = ["md"]

# LSP text synchronisation mode
# "full"        — each didChange carries the entire document text
# "incremental" — each didChange carries Range-based content changes
text_sync = "full"

# Which detection signal triggers vault mode
# "obsidian"   — only .obsidian/ directory
# "toml-only"  — only .flavor-grenade.toml
# "both"       — either signal
vault_detection = "obsidian"

# Markdown flavor selector for this project.
# "auto" means BC4 resolves the effective flavor through MarkdownFlavorCascade.
# Explicit values must be supported MarkdownFlavorId values.
markdown.flavor = "auto"

# Optional structured-document profile flags layered over the base flavor.
# "auto" infers from filename/folder/content, "none" disables flags, and arrays
# force specific supported StructuredMarkdownProfileId values.
markdown.structured_profiles = "auto"
# markdown.structured_profiles = ["keep-a-changelog"]

[completion]
# Maximum number of completion candidates returned per request
# Must be > 0; invalid values log a warning and fall back to 50
candidates = 50

# Style used to generate the wikilink target text in completion items
# "file-stem"        — bare filename without extension: "my-note"
# "title-slug"       — slugified document title from frontmatter: "my-note-title"
# "file-path-stem"   — vault-relative path without extension: "folder/my-note"
wiki.style = "file-stem"

# Whether to offer callout type completions inside '> [!' blocks
callout.enabled = true

[code_action]
# Table of contents insertion / update code action
toc.enabled = true
toc.include = [1, 2, 3, 4, 5, 6]   # heading levels to include

# Offer "Create missing file" quick fix for unresolved wikilinks
create_missing_file.enabled = true

# Offer "Convert #tags to YAML front-matter tags" code action
tag_to_yaml.enabled = true

[diagnostics]
# Diagnose unresolved block references (![[doc#^anchor]] with missing anchor)
block_ref.enabled = true

# Diagnose unresolved embed links (![[doc]] where doc does not exist)
embed.enabled = true
```

### Typed Representation

```typescript
interface FlavorConfig {
  core: {
    markdownFileExtensions: string[]    // default: ["md"]
    textSync:               'full' | 'incremental'
    vaultDetection:         'obsidian' | 'toml-only' | 'both'
    markdownFlavor:         MarkdownFlavorSelection
    markdownStructuredProfiles: StructuredProfileSelection
  }
  completion: {
    candidates:    number               // must be > 0
    wikiStyle:     'file-stem' | 'title-slug' | 'file-path-stem'
    calloutEnabled: boolean
  }
  codeAction: {
    toc: {
      enabled: boolean
      include: number[]               // heading levels 1–6
    }
    createMissingFile: { enabled: boolean }
    tagToYaml:         { enabled: boolean }
  }
  diagnostics: {
    blockRef: { enabled: boolean }
    embed:    { enabled: boolean }
  }
}

type MarkdownFlavorId =
  | 'original'
  | 'commonmark'
  | 'gfm'
  | 'obsidian'
  | 'glfm'
  | 'pandoc'
  | 'multimarkdown'
  | 'mdx'
  | 'kramdown'
  | 'markdown-extra'
  | 'r-markdown'
  | 'reddit'
  | 'stack-overflow'

type MarkdownFlavorSelection = 'auto' | MarkdownFlavorId

type StructuredMarkdownProfileId =
  | 'keep-a-changelog'
  | 'common-changelog'
  | 'madr'

type StructuredProfileSelection =
  | 'auto'
  | 'none'
  | readonly StructuredMarkdownProfileId[]

// Explicit arrays must be unique and must not contain both changelog profiles.

interface MarkdownFlavorProfile {
  id: MarkdownFlavorId
  label: string
  displayOrder: number
  syntaxSurfaces: MarkdownSyntaxSurface[]
  hostBoundaries: HostSpecificBoundary[]
  unsupportedConstructs: string[]
  sourceTrace: string[]
}

interface EffectiveMarkdownContext {
  flavor: MarkdownFlavorId
  structuredProfiles: readonly StructuredMarkdownProfileId[]
}

interface MarkdownSyntaxSurface {
  id: string
  category:
    | 'commonmark-core'
    | 'table'
    | 'task-list'
    | 'metadata'
    | 'reference'
    | 'attribute'
    | 'math'
    | 'diagram'
    | 'code-execution'
    | 'component'
    | 'host-reference'
    | 'platform-rendering'
  localAnalysis:
    | 'parse-only'
    | 'semantic-token'
    | 'diagnostic'
    | 'completion'
    | 'navigation'
}

interface HostSpecificBoundary {
  surface: string
  host: 'github' | 'gitlab' | 'reddit' | 'stack-overflow' | 'pandoc' | 'r-markdown' | 'mdx' | 'other'
  boundary: 'classify-only' | 'renderer-dependent' | 'execution-forbidden' | 'requires-integration'
}
```

---

## Shared Markdown Flavor Contract

`MarkdownFlavorId`, labels, display order, and `MarkdownFlavorProfile` metadata are shared Config contract, not parser-owned UI state.

Consumers:

- BC4 uses `MarkdownFlavorSelection` and `MarkdownFlavorProfile` metadata to resolve and store `EffectiveMarkdownFlavor`.
- BC2 consumes only the explicit `EffectiveMarkdownFlavor` and relevant profile capability flags in `ParseContext`.
- BC5 validates LSP configuration payloads against the supported selector set before dispatching to BC4/Config.
- BC6 displays labels/order from the same contract and sends selector values; it does not define new ids.

Rules:

- `auto` is allowed only as a `MarkdownFlavorSelection`.
- `auto` is not a `MarkdownFlavorId` and has no `MarkdownFlavorProfile`.
- Unknown ids are invalid in both TOML and LSP configuration payloads.
- Structured document profiles are independent flags. `keep-a-changelog`,
  `common-changelog`, and `madr` are valid
  `StructuredMarkdownProfileId` values, not valid `MarkdownFlavorId` values.
- Structured profile flags are carried in `EffectiveMarkdownContext` alongside
  the base flavor and may be mixed with any supported base flavor.
- Profile metadata is deterministic and source-backed so tests can compare ids, labels, order, and trace coverage.
- Feature pages in `docs/features/*-flavor.md` are the product-facing source for profile behavior. The Config contract converts those pages into machine-readable ids, syntax surfaces, unsupported constructs, and host boundaries.
- Host references are not local vault references by default. GitHub/GitLab/Reddit/Stack Overflow object refs, Pandoc conversion behavior, R Markdown execution, and MDX language-mode ownership remain bounded unless a future integration explicitly crosses that boundary.

### Supported Profile Corpus

| Flavor id | Feature page | Primary syntax surfaces | Boundary notes |
|-----------|--------------|-------------------------|----------------|
| `original` | [[docs/features/original-markdown-flavor]] | Original headings, lists, blockquotes, inline/reference links, images, raw HTML | Modern syntax is unsupported unless another profile is active. |
| `commonmark` | [[docs/features/commonmark-flavor]] | CommonMark block/inline structure, fenced code, reference labels, headings | Default fallback when no vault/config signal exists. |
| `gfm` | [[docs/features/github-flavored-markdown-flavor]] | Tables, task lists, strikethrough, autolinks, GitHub alerts | GitHub issue refs, mentions, emoji, highlighting, and sanitization are host behavior. |
| `glfm` | [[docs/features/gitlab-flavored-markdown-flavor]] | GFM-compatible core, `[~]` tasks, footnotes, description lists, math/diagram fences, TOC/include tags | GitLab object refs require project/group context. |
| `obsidian` | [[docs/features/obsidian-markdown-flavor]] | Wiki-links, embeds, block anchors, tags, callouts, frontmatter, opaque regions | `.obsidian/` marker resolves `auto` to this profile. |
| `pandoc` | [[docs/features/pandoc-markdown-flavor]] | Metadata, citations, footnotes, math, attributes, tables, cross-references | Conversion depends on Pandoc CLI extensions, filters, templates, citeproc, and output format. |
| `multimarkdown` | [[docs/features/multimarkdown-flavor]] | Metadata, tables, footnotes, citations, labels/cross-references, math | Export/rendering parity is outside local analysis. |
| `mdx` | [[docs/features/mdx-flavor]] | Markdown plus JSX, expressions, ESM declarations, component identifiers | Dedicated `mdx` language mode remains owned by MDX tooling; Flavor Grenade handles Markdown-mode docs only. |
| `kramdown` | [[docs/features/kramdown-flavor]] | Attribute lists, definition lists, tables, footnotes, math, explicit header IDs | Attribute IDs become addressable only under this profile. |
| `markdown-extra` | [[docs/features/markdown-extra-flavor]] | Tables, definition lists, footnotes, abbreviations, fenced code, attribute blocks | Abbreviations and attributes are profile-gated. |
| `r-markdown` | [[docs/features/r-markdown-flavor]] | YAML metadata, chunks, inline R, chunk labels, citations, cross-references | R code is never executed by the LSP. |
| `reddit` | [[docs/features/reddit-markdown-flavor]] | Reddit prose Markdown, spoilers, superscript, tables, platform links | Subreddit/user/comment references are classified, not live-resolved. |
| `stack-overflow` | [[docs/features/stack-overflow-markdown-flavor]] | CommonMark base, code authoring, tables, spoilers, post/comment profiles, platform links | Stack Exchange question/user/tag refs require host context. |

### Structured Profile Flags

Structured profile flags are not part of the supported profile corpus above.
They add document-structure rules on top of the active base flavor.

| Profile id | Research | Applies to | Notes |
|---|---|---|---|
| `keep-a-changelog` | [[docs/research/keep-a-changelog-analysis]] | Keep a Changelog 1.1.0 files | May mix with any base Markdown flavor; mutually exclusive with `common-changelog`. |
| `common-changelog` | [[docs/research/common-changelog-analysis]] | Common Changelog files | May mix with any base Markdown flavor; mutually exclusive with `keep-a-changelog`. |
| `madr` | [[docs/research/madr-analysis]] | Markdown Architectural Decision Records | May mix with any base Markdown flavor and with non-changelog structured profiles. |

---

## ConfigCascade

`ConfigCascade` defines the ordered search path for configuration sources. Sources are applied from lowest to highest priority — higher priority sources override lower priority sources on a key-by-key basis (deep merge).

### Resolution Order

```text
Priority 1 (lowest) — Built-in defaults
  Hardcoded in ConfigCascadeService.
  Always present. Cannot fail.

Priority 2 — User config
  Path: ~/.config/flavor-grenade/config.toml
  (or %APPDATA%\flavor-grenade\config.toml on Windows)
  Loaded once at server startup.
  Missing file is silently ignored (not an error).

Priority 3 (highest) — Project config
  Path: {VaultRoot}/.flavor-grenade.toml
  Loaded when a VaultFolder is detected.
  Reloaded when the file changes (FileWatcher monitors it).
  Missing file is silently ignored.
```

### Merge Diagram

```text
Built-in defaults
       │
       ▼
  deep merge ◄── User config (~/.config/flavor-grenade/config.toml)
       │
       ▼
  deep merge ◄── Project config ({VaultRoot}/.flavor-grenade.toml)
       │
       ▼
  FlavorConfig   (fully resolved, typed, immutable)
```

### Merge Semantics

- **Scalar values**: Project overrides User overrides Default.
- **Array values**: Project **replaces** (not appends) the lower-priority array. Example: if Default has `toc.include = [1,2,3,4,5,6]` and Project has `toc.include = [1,2]`, the result is `[1,2]`.
- **Missing keys**: Absent keys in higher-priority sources do not remove lower-priority values. Only explicitly provided keys override.

---

## MarkdownFlavorCascade

`MarkdownFlavorCascade` is the named server-side resolution order for `EffectiveMarkdownFlavor`. It runs inside BC4, using validated Config values. The full resource-specific algorithm is specified in [[docs/design/markdown-flavor-auto-detection]]; this section records the config-domain view of the same cascade.

```text
Priority 1 (highest) — VS Code explicit override
  Source: workspace/didChangeConfiguration settings.flavorGrenade.markdownFlavor
  Scope: document-specific selector when BC6 writes one, otherwise active folder/user scope
  Values: 'auto' or supported MarkdownFlavorId

Priority 2 — VS Code workspace-folder/workspace setting
  Source: workspace/didChangeConfiguration settings.flavorGrenade.markdownFlavor
  Scope: workspace-folder value wins over workspace value; workspace wins over user/default
  Values: 'auto' or supported MarkdownFlavorId

Priority 3 — Project TOML
  Source: {VaultRoot}/.flavor-grenade.toml [core].markdown.flavor
  Values: 'auto' or supported MarkdownFlavorId

Priority 4 — Vault marker
  Source: VaultDetector result
  Rule: .obsidian/ marker resolves to 'obsidian'

Priority 5 (lowest) — CommonMark fallback
  Rule: generic Markdown resolves to 'commonmark'
```

Tie-breakers:

- Explicit VS Code override beats every auto-detection and project source.
- If a VS Code workspace-folder/workspace setting and `.flavor-grenade.toml` both exist, the VS Code setting wins. This lets the active editor/workspace override repository defaults without editing project files.
- If both VS Code workspace-folder and workspace values exist, workspace-folder wins for documents under that folder.
- A value of `auto` does not itself become effective state; it delegates to the next lower source.
- Invalid values at any layer are rejected/ignored for that layer and do not mutate current `EffectiveMarkdownFlavor`; resolution continues to the next valid lower-priority source.
- `EffectiveMarkdownFlavor` is always an explicit `MarkdownFlavorId`, never `auto`.

Structured profile flags are resolved after `MarkdownFlavorCascade` and are
document-specific. Explicit VS Code structured-profile settings beat TOML
structured-profile settings; TOML beats automatic detection; `none` disables
all structured profile behavior for the relevant scope.

Example:

```text
VS Code explicit override = auto
VS Code workspace-folder setting = gfm
.flavor-grenade.toml core.markdown.flavor = obsidian
.obsidian/ exists
=> EffectiveMarkdownFlavor = gfm
```

---

## Validation Rules

| Key | Validation | Failure behaviour |
|-----|-----------|-------------------|
| `completion.candidates` | Must be a positive integer (`> 0`) | Log warning at `warn` level; use built-in default (`50`) |
| `core.text_sync` | Must be `"full"` or `"incremental"` | Log warning; use `"full"` |
| `core.vault_detection` | Must be `"obsidian"`, `"toml-only"`, or `"both"` | Log warning; use `"obsidian"` |
| `core.markdown.flavor` | Must be `"auto"` or a supported `MarkdownFlavorId` | Log warning; treat this layer as absent for flavor cascade |
| `core.markdown.structured_profiles` | Must be `"auto"`, `"none"`, or a unique, compatible array of supported `StructuredMarkdownProfileId` values | Log warning; treat this layer as absent for structured-profile resolution |
| `flavorGrenade.markdownFlavor` from VS Code/LSP | Must be `"auto"` or a supported `MarkdownFlavorId` | Reject payload for flavor mutation; keep previous server state |
| `flavorGrenade.markdownStructuredProfiles` from VS Code/LSP | Must be `"auto"`, `"none"`, or a unique, compatible array of supported `StructuredMarkdownProfileId` values | Reject payload for structured-profile mutation; keep previous server state |
| `completion.wiki.style` | Must be one of the three enum values | Log warning; use `"file-stem"` |
| `code_action.toc.include` | Each element must be an integer 1–6 | Remove out-of-range values; log warning if list becomes empty → use `[1,2,3,4,5,6]` |
| Any TOML parse error | Entire file is unparseable | Log at `debug` level; treat entire file as absent (do not crash) |

> [!NOTE]
> Validation failures never crash the server. Invalid scalar config is replaced by the built-in default for that key, and a diagnostic log entry is emitted. Invalid flavor cascade inputs are treated as absent for that layer so the next valid lower-priority layer can decide. This ensures that malformed config does not prevent the server from serving documents.

---

## Fault Isolation

```typescript
ConfigCascadeService.load(source: ConfigSource): Partial<FlavorConfig> | null

ConfigSource
  | { kind: 'user';    path: string }
  | { kind: 'project'; path: string }
  | { kind: 'default'              }
```

**Failure modes:**

| Failure | Response |
|---------|----------|
| File does not exist | Return `null` (treated as empty partial) |
| File is not valid UTF-8 | Log `debug`; return `null` |
| File is valid UTF-8 but not valid TOML | Log `debug`; return `null` |
| File is valid TOML but contains unknown keys | Unknown keys are ignored; known keys are parsed |
| File is valid TOML with invalid value types | Per-key validation applies; invalid keys use built-in defaults |

The phrase "dropped silently (logged at debug level)" means: the operator can see it in debug logs but end users see no error message and the server continues to function.

---

## NestJS Integration

```text
ConfigModule
  ├── ConfigCascadeService   — loads and merges config sources; provides FlavorConfig
  └── FlavorConfigService    — thin wrapper; exposes getConfig(root?) for consumers

Consumers:
  VaultModule   ← FlavorConfig injected into VaultFolder at detection time; owns EffectiveMarkdownFlavor
  LspModule     ← FlavorConfig read by LspServer during initialize (textSync mode); validates didChangeConfiguration payloads
  ReferenceModule ← (indirectly via VaultFolder config)
  DocumentModule ← (indirectly via BC4 ParseContext)
```

**Config reload flow:**

```text
1. FileWatcher detects change to {VaultRoot}/.flavor-grenade.toml
2. VaultModule calls ConfigCascadeService.reload(vaultRoot)
3. New FlavorConfig computed
4. VaultFolder.withConfig(folder, newConfig) → new VaultFolder stored in Workspace
5. BC4 re-runs MarkdownFlavorCascade and structured profile resolution for affected docs
6. If any EffectiveMarkdownContext changed, BC4 schedules reparse/diagnostic refresh
7. LspServer optionally sends flavorGrenade/status notification to client
```

**VS Code/LSP flavor update flow:**

```text
1. BC5 receives workspace/didChangeConfiguration
2. BC5 extracts settings.flavorGrenade.markdownFlavor and
   settings.flavorGrenade.markdownStructuredProfiles
3. BC5 validates values against MarkdownFlavorSelection and
   StructuredProfileSelection
4. Valid value:
   ConfigModule records the VS Code layer for the relevant workspace/folder scope
   BC4 Workspace.withMarkdownFlavorSelection(...) and
   Workspace.withStructuredProfileSelection(...) mutate Workspace/VaultFolder state
   BC4 recomputes EffectiveMarkdownContext and reparses affected docs if changed
5. Invalid value:
   BC5 logs warning; workspace/didChangeConfiguration is a notification, so no error response is sent
   ConfigModule and BC4 keep previous state
```

> [!TIP]
> Config is loaded eagerly at startup and refreshed on file change. There is no lazy-loading or per-request config lookup. All domain services receive a snapshot of `FlavorConfig` at construction time and hold a reference to it. When config changes, affected services receive a new `FlavorConfig` via the reload flow above.

---

## Built-in Defaults Reference

The following table documents every built-in default value. These are the values used when no config file is present at all.

| Key (TOML path) | Default value |
|----------------|--------------|
| `core.markdown.file_extensions` | `["md"]` |
| `core.text_sync` | `"full"` |
| `core.vault_detection` | `"obsidian"` |
| `core.markdown.flavor` | `"auto"` |
| `core.markdown.structured_profiles` | `"auto"` |
| `completion.candidates` | `50` |
| `completion.wiki.style` | `"file-stem"` |
| `completion.callout.enabled` | `true` |
| `code_action.toc.enabled` | `true` |
| `code_action.toc.include` | `[1, 2, 3, 4, 5, 6]` |
| `code_action.create_missing_file.enabled` | `true` |
| `code_action.tag_to_yaml.enabled` | `true` |
| `diagnostics.block_ref.enabled` | `true` |
| `diagnostics.embed.enabled` | `true` |
