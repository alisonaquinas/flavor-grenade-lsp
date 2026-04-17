---
title: Path Model — Identity and Path Types
tags: [concepts, path-model, identity, docid, slug, vaultpath]
aliases: [path-types, docid, slug, vaultroot, path-resolution, wiki-encoded]
---

# Path Model — Identity and Path Types

`flavor-grenade-lsp` uses a hierarchy of distinct path and identity types rather than raw strings. This prevents the class of bugs that arise from mixing absolute paths, vault-relative paths, URI strings, and wiki-link text — all of which are superficially similar but semantically incompatible. Every type in the path model is defined in `PathModule` and is available throughout the system.

---

## Type Hierarchy

```
AbsPath         — absolute filesystem path (OS-native separators internally)
  │
  ├── VaultRoot — AbsPath known to be a vault root (contains .obsidian/ or .flavor-grenade.toml)
  │
  └── VaultPath — (VaultRoot × RelPath) — vault-relative path string
        │
        └── DocId — (URI × VaultPath) — canonical document identity

Slug            — case-folded match key derived from VaultPath stem or heading text
WikiEncoded     — wiki-link text as it appears between [[ and ]] (pre-decode)
```

---

## `VaultRoot`

```typescript
type VaultRoot = { _tag: 'VaultRoot'; absPath: AbsPath }
```

`VaultRoot` is an `AbsPath` that has been validated to contain either a `.obsidian/` subdirectory or a `.flavor-grenade.toml` file. It is constructed only by `VaultDetector` — nowhere else in the system creates a `VaultRoot` directly.

`VaultRoot` carries semantic weight: it is the reference point from which all `VaultPath` values are computed. Two documents with the same `VaultRoot` are in the same vault; cross-vault resolution is never performed.

---

## `DocId`

```typescript
type DocId = {
  uri:          string     // LSP URI — "file:///C:/vault/notes/daily.md" or "file:///home/user/vault/notes/daily.md"
  vaultRelPath: VaultPath  // vault-relative — "notes/daily.md"
}
```

`DocId` is the canonical identity of a document. It is used as:

- The primary key in `VaultFolder`'s document map
- The `Scope` identifier in `ScopedSym` (when scope is `Doc(docId)`)
- The lookup key in `RefGraph.refDeps`
- The value returned by `DefinitionService` and `ReferencesService`

`DocId.ofUri(uri, vaultRoot)` is the canonical constructor. It converts the LSP URI to an absolute path, then computes the vault-relative path by stripping the `VaultRoot.absPath` prefix.

### URI Encoding

LSP URIs use percent-encoding (`%20` for spaces, etc.). `DocId.ofUri` decodes the URI before constructing the `VaultPath`. The stored `uri` field retains the original encoded form — it is returned verbatim in LSP responses.

---

## `VaultPath`

```typescript
type VaultPath = { _tag: 'VaultPath'; value: string }
```

A `VaultPath` is a vault-relative path string using forward slashes as separators, regardless of OS. Examples:

- `notes/daily/2026-04-16.md`
- `projects/flavor-grenade-lsp/README.md`
- `daily.md` (top-level file)

### Case Handling on Windows

On Windows, the NTFS filesystem is case-insensitive by default. `VaultPath` values are stored in their **original case** (as reported by the OS) but comparisons for wiki-link resolution use `Slug` (case-folded). This means:

- Two files that differ only in case on Windows are treated as the same slug target.
- A wiki-link `[[Daily Notes]]` matches both `notes/Daily Notes.md` and `notes/daily notes.md` on Windows (via slug matching).
- On Unix, these would be different files with different slugs.

`VaultPath.of(root, absPath)` handles the platform-specific path separator and normalization.

---

## `Slug`

```typescript
type Slug = { _tag: 'Slug'; value: string }

// Canonical constructor
Slug.ofString(s: string): Slug
```

`Slug` is the **match key** used for approximate wiki-link resolution. It is derived from a file name (without extension) or a heading text by applying a sequence of transformations:

1. Strip file extension (`.md`)
2. Lowercase all characters (`toLocaleLowerCase('en')`)
3. Trim leading and trailing whitespace
4. Collapse internal whitespace runs to a single space
5. *(For heading slugs only)* Replace spaces with hyphens; strip non-alphanumeric characters except `-`

Example slug transformations:

| Input | Type | Slug |
|-------|------|------|
| `Daily Notes.md` | filename | `daily notes` |
| `2026-04-16.md` | filename | `2026-04-16` |
| `## My Heading Text` | heading | `my-heading-text` |
| `Q1 Review & Planning` | heading | `q1-review--planning` |
| `meeting notes` | alias | `meeting notes` |

`Slug.ofString` is the **only** way to produce a `Slug`. No other code is permitted to construct the string directly, preventing inconsistent normalization.

### Slug Matching in `FolderLookup`

`FolderLookup` indexes documents by their slug. When resolving `[[some target]]`, the wiki-link text is normalized to a slug via `Slug.ofString("some target")` and matched against the suffix tree of document slugs. Approximate (unanchored) matching allows `[[daily]]` to match `notes/daily/2026-04-16.md` if no document with stem `daily` exists at the top level.

Resolution mode precedence:

| Mode | Trigger | Example |
|------|---------|---------|
| `ExactAbs` | Starts with `/` | `[[/notes/daily]]` |
| `ExactRel` | Contains `./` or `../` | `[[../meeting]]` |
| `Approx` | No path prefix | `[[daily]]` |

---

## `WikiEncoded`

```typescript
type WikiEncoded = { _tag: 'WikiEncoded'; value: string }
```

`WikiEncoded` represents the raw text content of a wiki-link as it appears between the `[[` and `]]` brackets, before any interpretation. This is distinct from `VaultPath` and `Slug` because:

- Wiki-link text may contain aliases after `|`: `[[target|alias text]]` — the `WikiEncoded` is `target|alias text`.
- Wiki-link text preserves spaces as spaces (Obsidian does not percent-encode spaces in `[[link]]`).
- Special characters like `#` (for heading anchors) and `^` (for block refs) have structural meaning within `WikiEncoded` values.

`WikiLinkParser` splits a `WikiEncoded` value into its components:

```typescript
type WikiLinkParts = {
  target:  string          // the document path portion
  anchor?: string          // "#heading" or "#^blockid" — optional
  label?:  string          // "alias text" after "|" — optional
}
```

---

## Path Resolution Modes

When a wiki-link is encountered, `FolderLookup` resolves it using one of three modes:

### `ExactAbs` (rooted path)

Trigger: wiki-link target starts with `/`.

```
[[/notes/daily]]  →  looks for VaultPath("notes/daily.md") exactly
```

The leading `/` is stripped and the remainder is treated as a vault-relative path. If no document exists at that exact path, the ref is unresolved — no approximate fallback.

### `ExactRel` (relative path)

Trigger: wiki-link target contains `./` or `../`.

```
[[./sibling]]     →  resolved relative to current document's directory
[[../parent]]     →  resolved relative to parent directory
```

Relative resolution uses the containing document's `VaultPath` directory as the base. If the resolved path does not exist, no approximate fallback.

### `Approx` (unanchored match)

Trigger: no path prefix characters.

```
[[daily]]         →  matches any document whose slug = "daily", anywhere in vault
```

Approx mode uses the suffix tree in `FolderLookup`. The suffix tree is built from all vault-relative path components, allowing partial path matching. Resolution order:

1. Exact stem match at vault root
2. Exact stem match at any depth
3. Longest-suffix match (most specific path wins)
4. If still ambiguous, all matches are returned and `Oracle.resolveInScope` reports an ambiguous resolution

---

## `.obsidian/` and `.flavor-grenade.toml` Detection Logic

`VaultDetector` traverses the filesystem upward from the document's absolute path, checking each ancestor directory for vault markers:

```
Algorithm VaultDetector.detect(docAbsPath):
  current = parent(docAbsPath)
  while current != filesystem_root:
    if exists(current / ".obsidian") AND isDirectory(current / ".obsidian"):
      return VaultRoot(current)   ← primary signal
    if exists(current / ".flavor-grenade.toml"):
      return VaultRoot(current)   ← secondary signal
    current = parent(current)
  return None                     ← single-file mode
```

`.obsidian/` takes precedence over `.flavor-grenade.toml` if both exist in the same directory. If they exist in different ancestor directories, the closer one (lower in the directory tree, i.e., shorter distance to the document) wins.

---

## Windows vs Unix Path Handling

| Concern | Unix | Windows |
|---------|------|---------|
| Path separator | `/` | `\` internally; normalized to `/` in `VaultPath` |
| Case sensitivity | Case-sensitive | Case-insensitive (NTFS default) |
| Drive letters | Not applicable | Stripped from `VaultPath`; retained in `AbsPath` |
| URI format | `file:///home/user/...` | `file:///C:/Users/...` |
| Slug matching | Exact case after fold | Slug folding handles case differences |
| Max path length | OS-limited | 260 chars (legacy); 32767 with long-path enabled |

`AbsPath.of(s)` normalizes the input string to the OS-native format on construction. `VaultPath.value` always uses forward slashes regardless of OS — it is a logical identifier, not a filesystem call argument.

---

## Cross-References

- [[concepts/document-model]] — DocId usage in OFMDoc
- [[concepts/symbol-model]] — How DocId appears in Scope and ScopedSym
- [[concepts/workspace-model]] — VaultRoot and VaultDetector
- [[concepts/connection-graph]] — How Slug is used for approximate ref resolution
- [[architecture/layers]] — PathModule as the foundation layer
