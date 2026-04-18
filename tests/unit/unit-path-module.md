---
title: Unit Tests — Path Module
tags: [test/unit, test/tdd, module/path]
aliases: [Unit Tests Path, PathModule Tests]
---

> [!INFO] PathModule is the foundation layer — pure functions, no I/O. All tests are synchronous. RED tests should fail at the type/assertion level before any implementation exists.

See [[architecture/layers]] for the module dependency hierarchy and [[adr/ADR010-tests-directory-structure]] for the spec file layout convention.

---

## TC-UNIT-PATH-001 — AbsPath: accepts a valid POSIX absolute path

**Class / Service:** `AbsPath`
**Spec file:** `tests/unit/path/AbsPath.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('wraps a valid POSIX absolute path without error', () => {
  const result = AbsPath.of('/home/user/vault/note.md')
  expect(result.value).toBe('/home/user/vault/note.md')
})
```

**GREEN — Implementation satisfies when:**

- `AbsPath.of` accepts any string beginning with `/` and returns an opaque wrapper exposing the original string via `.value`

---

## TC-UNIT-PATH-002 — AbsPath: accepts a valid Windows absolute path

**Class / Service:** `AbsPath`
**Spec file:** `tests/unit/path/AbsPath.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('wraps a valid Windows absolute path without error', () => {
  const result = AbsPath.of('C:\\Users\\aaqui\\vault\\note.md')
  expect(result.value).toBe('C:\\Users\\aaqui\\vault\\note.md')
})
```

**GREEN — Implementation satisfies when:**

- `AbsPath.of` also accepts strings matching the `[A-Za-z]:\` prefix pattern, treating them as absolute

---

## TC-UNIT-PATH-003 — AbsPath: rejects a relative path

**Class / Service:** `AbsPath`
**Spec file:** `tests/unit/path/AbsPath.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('throws when given a relative path', () => {
  expect(() => AbsPath.of('relative/path/note.md')).toThrow()
})
```

**GREEN — Implementation satisfies when:**

- `AbsPath.of` throws a typed error (e.g. `InvalidPathError`) for any string that does not begin with `/` or a Windows drive prefix

---

## TC-UNIT-PATH-004 — AbsPath: rejects an empty string

**Class / Service:** `AbsPath`
**Spec file:** `tests/unit/path/AbsPath.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('throws when given an empty string', () => {
  expect(() => AbsPath.of('')).toThrow()
})
```

**GREEN — Implementation satisfies when:**

- `AbsPath.of` throws before any path-prefix check when the input is the empty string

---

## TC-UNIT-PATH-005 — VaultPath: computes vault-relative path for a file inside the vault

**Class / Service:** `VaultPath`
**Spec file:** `tests/unit/path/VaultPath.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns the vault-relative path for a file inside the vault root', () => {
  const root = AbsPath.of('/home/user/vault')
  const file = AbsPath.of('/home/user/vault/notes/daily.md')
  const vp = VaultPath.of(root, file)
  expect(vp.relative).toBe('notes/daily.md')
})
```

**GREEN — Implementation satisfies when:**

- `VaultPath.of` strips the root prefix (plus any trailing separator) from the absolute file path and exposes the remainder as `.relative`

---

## TC-UNIT-PATH-006 — VaultPath: rejects a file outside the vault root

**Class / Service:** `VaultPath`
**Spec file:** `tests/unit/path/VaultPath.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('throws when the file path is outside the vault root', () => {
  const root = AbsPath.of('/home/user/vault')
  const outside = AbsPath.of('/home/user/other/note.md')
  expect(() => VaultPath.of(root, outside)).toThrow()
})
```

**GREEN — Implementation satisfies when:**

- `VaultPath.of` throws a typed error (e.g. `OutsideVaultError`) when the absolute file path does not begin with the root prefix

---

## TC-UNIT-PATH-007 — VaultPath: normalizes path separators to forward slashes

**Class / Service:** `VaultPath`
**Spec file:** `tests/unit/path/VaultPath.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('normalizes backslash separators to forward slashes in the relative portion', () => {
  const root = AbsPath.of('C:\\Users\\aaqui\\vault')
  const file = AbsPath.of('C:\\Users\\aaqui\\vault\\notes\\daily.md')
  const vp = VaultPath.of(root, file)
  expect(vp.relative).toBe('notes/daily.md')
})
```

**GREEN — Implementation satisfies when:**

- The `.relative` value always uses `/` regardless of the separator style in the input strings

---

## TC-UNIT-PATH-008 — Slug: lowercases ASCII input

**Class / Service:** `Slug`
**Spec file:** `tests/unit/path/Slug.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('case-folds ASCII letters to lowercase', () => {
  expect(Slug.ofString('Daily Notes').value).toBe('daily notes')
})
```

**GREEN — Implementation satisfies when:**

- `Slug.ofString` calls `String.prototype.toLowerCase()` (or equivalent Unicode case-fold) on the trimmed input

---

## TC-UNIT-PATH-009 — Slug: trims leading/trailing whitespace and collapses internal runs

**Class / Service:** `Slug`
**Spec file:** `tests/unit/path/Slug.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('trims surrounding whitespace and collapses multiple internal spaces', () => {
  expect(Slug.ofString('  My  Daily   Note  ').value).toBe('my daily note')
})
```

**GREEN — Implementation satisfies when:**

- `Slug.ofString` trims both ends and replaces every run of whitespace characters with a single space before case-folding

---

## TC-UNIT-PATH-010 — Slug: applies Unicode lowercasing

**Class / Service:** `Slug`
**Spec file:** `tests/unit/path/Slug.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('lowercases non-ASCII Unicode characters', () => {
  expect(Slug.ofString('Ünterwegs').value).toBe('ünterwegs')
})
```

**GREEN — Implementation satisfies when:**

- The fold uses locale-aware or Unicode-aware lowercasing so that characters like `Ü → ü` are handled correctly

---

## TC-UNIT-PATH-011 — Slug: returns empty slug for empty string input

**Class / Service:** `Slug`
**Spec file:** `tests/unit/path/Slug.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns an empty slug value for an empty input string', () => {
  expect(Slug.ofString('').value).toBe('')
})
```

**GREEN — Implementation satisfies when:**

- `Slug.ofString` does not throw on empty input; it produces a slug whose `.value` is `''`

---

## TC-UNIT-PATH-012 — WikiEncoded.decode: target-only link

**Class / Service:** `WikiEncoded`
**Spec file:** `tests/unit/path/WikiEncoded.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('decodes a target-only wikilink', () => {
  const result = WikiEncoded.decode('Note')
  expect(result).toEqual({ target: 'Note', anchor: null, label: null })
})
```

**GREEN — Implementation satisfies when:**

- `WikiEncoded.decode` splits on `#` and `|`, returns `anchor: null` when no `#` is present, and `label: null` when no `|` is present

---

## TC-UNIT-PATH-013 — WikiEncoded.decode: target with heading anchor

**Class / Service:** `WikiEncoded`
**Spec file:** `tests/unit/path/WikiEncoded.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('decodes a target + heading anchor', () => {
  const result = WikiEncoded.decode('Note#Heading')
  expect(result).toEqual({ target: 'Note', anchor: '#Heading', label: null })
})
```

**GREEN — Implementation satisfies when:**

- The anchor field preserves the `#` sigil and everything between the `#` and either the `|` or end of string

---

## TC-UNIT-PATH-014 — WikiEncoded.decode: target with block anchor, label, and full form

**Class / Service:** `WikiEncoded`
**Spec file:** `tests/unit/path/WikiEncoded.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('decodes a block anchor link', () => {
  const block = WikiEncoded.decode('Note#^blockid')
  expect(block).toEqual({ target: 'Note', anchor: '#^blockid', label: null })
})

it('decodes a target + label link', () => {
  const labelled = WikiEncoded.decode('Note|Display Text')
  expect(labelled).toEqual({ target: 'Note', anchor: null, label: 'Display Text' })
})

it('decodes the full form: target + anchor + label', () => {
  const full = WikiEncoded.decode('Note#Heading|Label')
  expect(full).toEqual({ target: 'Note', anchor: '#Heading', label: 'Label' })
})
```

**GREEN — Implementation satisfies when:**

- All three forms parse without error; `^` is preserved as part of the anchor string; label is the text after the last `|`

**REFACTOR notes:** These three related assertions may be split into individual `it` blocks in the final spec file for clearer failure reporting.

---

## TC-UNIT-PATH-015 — WikiEncoded.decode: edge cases (empty brackets, whitespace around pipe)

**Class / Service:** `WikiEncoded`
**Spec file:** `tests/unit/path/WikiEncoded.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns empty target for an empty bracket string', () => {
  const empty = WikiEncoded.decode('')
  expect(empty).toEqual({ target: '', anchor: null, label: null })
})

it('trims whitespace around the pipe-separated label', () => {
  const result = WikiEncoded.decode('Note | Display Text ')
  expect(result.label).toBe('Display Text')
  expect(result.target).toBe('Note')
})
```

**GREEN — Implementation satisfies when:**

- Empty input is handled without throwing, yielding an empty target
- Whitespace immediately adjacent to `|` is stripped from both target and label

---

## TC-UNIT-PATH-016 — DocId: constructs from a valid file:// URI

**Class / Service:** `DocId`
**Spec file:** `tests/unit/path/DocId.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('constructs a DocId from a valid file:// URI', () => {
  const vaultRoot = AbsPath.of('/home/user/vault')
  const doc = DocId.ofUri('file:///home/user/vault/notes/daily.md', vaultRoot)
  expect(doc.uri).toBe('file:///home/user/vault/notes/daily.md')
  expect(doc.vaultRelPath.relative).toBe('notes/daily.md')
})
```

**GREEN — Implementation satisfies when:**

- `DocId.ofUri` decodes the URI to an absolute path, constructs an `AbsPath`, then delegates to `VaultPath.of` for the relative portion

---

## TC-UNIT-PATH-017 — DocId: decodes percent-encoded characters in URI

**Class / Service:** `DocId`
**Spec file:** `tests/unit/path/DocId.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('decodes %20 and other percent-encoded characters in the URI path', () => {
  const root = AbsPath.of('/home/user/my vault')
  const doc = DocId.ofUri('file:///home/user/my%20vault/notes/my%20note.md', root)
  expect(doc.vaultRelPath.relative).toBe('notes/my note.md')
})
```

**GREEN — Implementation satisfies when:**

- The URI is decoded with `decodeURIComponent` (or equivalent) before being converted to an `AbsPath`

---

## TC-UNIT-PATH-018 — DocId: rejects a non-file URI scheme

**Class / Service:** `DocId`
**Spec file:** `tests/unit/path/DocId.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('throws when given a non-file URI scheme', () => {
  const root = AbsPath.of('/home/user/vault')
  expect(() => DocId.ofUri('http://example.com/note.md', root)).toThrow()
})
```

**GREEN — Implementation satisfies when:**

- `DocId.ofUri` validates the scheme before processing and throws a typed error (e.g. `UnsupportedUriSchemeError`) for anything other than `file:`
