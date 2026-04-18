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

This document is the authoritative model for the configuration system in `flavor-grenade-lsp`. Config is a cross-cutting concern, not a full bounded context — it has no aggregate root and no domain events. It is a supporting module (`ConfigModule` in NestJS) that provides read-only `FlavorConfig` values to BC4 and BC5.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[vault/domain-model]], [[lsp-protocol/domain-model]].

> [!NOTE]
> Config is intentionally thin. It does not know about documents, refs, or the LSP wire. Its only job is to merge TOML files in the correct priority order and expose a typed, immutable `FlavorConfig` value.

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
```

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

## Validation Rules

| Key | Validation | Failure behaviour |
|-----|-----------|-------------------|
| `completion.candidates` | Must be a positive integer (`> 0`) | Log warning at `warn` level; use built-in default (`50`) |
| `core.text_sync` | Must be `"full"` or `"incremental"` | Log warning; use `"full"` |
| `core.vault_detection` | Must be `"obsidian"`, `"toml-only"`, or `"both"` | Log warning; use `"obsidian"` |
| `completion.wiki.style` | Must be one of the three enum values | Log warning; use `"file-stem"` |
| `code_action.toc.include` | Each element must be an integer 1–6 | Remove out-of-range values; log warning if list becomes empty → use `[1,2,3,4,5,6]` |
| Any TOML parse error | Entire file is unparseable | Log at `debug` level; treat entire file as absent (do not crash) |

> [!NOTE]
> Validation failures never crash the server. Invalid configuration is silently replaced by the built-in default for that key, and a diagnostic log entry is emitted. This ensures that a malformed user config does not prevent the server from serving documents.

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
  VaultModule   ← FlavorConfig injected into VaultFolder at detection time
  LspModule     ← FlavorConfig read by LspServer during initialize (textSync mode)
  ReferenceModule ← (indirectly via VaultFolder config)
```

**Config reload flow:**

```text
1. FileWatcher detects change to {VaultRoot}/.flavor-grenade.toml
2. VaultModule calls ConfigCascadeService.reload(vaultRoot)
3. New FlavorConfig computed
4. VaultFolder.withConfig(folder, newConfig) → new VaultFolder stored in Workspace
5. LspServer optionally sends flavorGrenade/status notification to client
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
| `completion.candidates` | `50` |
| `completion.wiki.style` | `"file-stem"` |
| `completion.callout.enabled` | `true` |
| `code_action.toc.enabled` | `true` |
| `code_action.toc.include` | `[1, 2, 3, 4, 5, 6]` |
| `code_action.create_missing_file.enabled` | `true` |
| `code_action.tag_to_yaml.enabled` | `true` |
| `diagnostics.block_ref.enabled` | `true` |
| `diagnostics.embed.enabled` | `true` |
