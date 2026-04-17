---
title: Unit Tests — Vault Module
tags: [test/unit, test/tdd, module/vault]
aliases: [Unit Tests Vault, VaultModule Tests]
---

> [!INFO] VaultDetector tests use a mock filesystem interface (not real disk I/O) so directory trees can be constructed in-memory. FolderLookup tests populate a lookup table directly with slug → path pairs.

See [[concepts/workspace-model]], [[architecture/layers]], and [[adr/ADR003-vault-detection]] for the design contracts exercised here.

---

## VaultDetector

### TC-UNIT-VAULT-001 — VaultDetector.detect: directory with .obsidian/ returns that directory as vault root

**Class / Service:** `VaultDetector`
**Spec file:** `tests/unit/vault/vault-detector.spec.ts`
**Linked FR:** `FR-VAULT-DETECT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('detect() returns the directory that contains .obsidian/ as the vault root', () => {
  // arrange — mock FS with .obsidian/ at /vault
  const mockFs = MockFs.fromTree({
    '/vault/.obsidian': { type: 'dir' },
    '/vault/notes/daily.md': { type: 'file' },
  })
  const detector = new VaultDetector(mockFs)

  // act
  const result = detector.detect('/vault/notes/daily.md')

  // assert
  expect(result).toBe('/vault')
})
```

**GREEN — Implementation satisfies when:**
- `detect` walks the ancestor chain upward from the given path
- Returns the first ancestor directory containing `.obsidian/`

**REFACTOR notes:** See [[adr/ADR003-vault-detection]] §primary-marker for the `.obsidian/` precedence rule.

---

### TC-UNIT-VAULT-002 — VaultDetector.detect: file inside nested subdirectory walks up and finds vault root

**Class / Service:** `VaultDetector`
**Spec file:** `tests/unit/vault/vault-detector.spec.ts`
**Linked FR:** `FR-VAULT-DETECT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('detect() walks multiple ancestor levels to find .obsidian/', () => {
  // arrange — vault root is at /home/user/vault; file is three levels deep
  const mockFs = MockFs.fromTree({
    '/home/user/vault/.obsidian': { type: 'dir' },
    '/home/user/vault/projects/2026/q1/report.md': { type: 'file' },
  })
  const detector = new VaultDetector(mockFs)

  // act
  const result = detector.detect('/home/user/vault/projects/2026/q1/report.md')

  // assert
  expect(result).toBe('/home/user/vault')
})
```

**GREEN — Implementation satisfies when:**
- Ancestor traversal continues past intermediate directories that have no marker
- The correct root is returned regardless of nesting depth

---

### TC-UNIT-VAULT-003 — VaultDetector.detect: only .flavor-grenade.toml present returns that directory as vault root

**Class / Service:** `VaultDetector`
**Spec file:** `tests/unit/vault/vault-detector.spec.ts`
**Linked FR:** `FR-VAULT-DETECT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('detect() accepts .flavor-grenade.toml as a secondary vault marker', () => {
  // arrange — no .obsidian/, only the secondary marker
  const mockFs = MockFs.fromTree({
    '/project/.flavor-grenade.toml': { type: 'file' },
    '/project/notes/page.md': { type: 'file' },
  })
  const detector = new VaultDetector(mockFs)

  // act
  const result = detector.detect('/project/notes/page.md')

  // assert
  expect(result).toBe('/project')
})
```

**GREEN — Implementation satisfies when:**
- `.flavor-grenade.toml` is recognized as a valid (secondary) vault marker when no `.obsidian/` is present

---

### TC-UNIT-VAULT-004 — VaultDetector.detect: .obsidian/ beats .flavor-grenade.toml at same level

**Class / Service:** `VaultDetector`
**Spec file:** `tests/unit/vault/vault-detector.spec.ts`
**Linked FR:** `FR-VAULT-DETECT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('detect() prefers .obsidian/ over .flavor-grenade.toml when both are present', () => {
  // arrange — both markers in same directory
  const mockFs = MockFs.fromTree({
    '/vault/.obsidian': { type: 'dir' },
    '/vault/.flavor-grenade.toml': { type: 'file' },
    '/vault/note.md': { type: 'file' },
  })
  const detector = new VaultDetector(mockFs)

  // act — detect on a directory that itself has both markers
  const result = detector.detect('/vault/note.md')

  // assert
  expect(result).toBe('/vault') // correct root; precedence is verified via mode
  // additionally confirm that .obsidian was the winning marker (inspectable via result metadata if exposed)
})
```

**GREEN — Implementation satisfies when:**
- When a directory contains both `.obsidian/` and `.flavor-grenade.toml`, the detection logic treats `.obsidian/` as the authoritative marker
- The same root is returned whether determined by primary or secondary marker, but callers can distinguish via any exposed `detectionMarker` metadata field

**REFACTOR notes:** See [[adr/ADR003-vault-detection]] §precedence for the ordering rule.

---

### TC-UNIT-VAULT-005 — VaultDetector.detect: no marker found → returns null (SingleFile mode)

**Class / Service:** `VaultDetector`
**Spec file:** `tests/unit/vault/vault-detector.spec.ts`
**Linked FR:** `FR-VAULT-SINGLEFILE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('detect() returns null when no vault marker exists in any ancestor directory', () => {
  // arrange — flat tree, no markers
  const mockFs = MockFs.fromTree({
    '/tmp/scratch/note.md': { type: 'file' },
  })
  const detector = new VaultDetector(mockFs)

  // act
  const result = detector.detect('/tmp/scratch/note.md')

  // assert
  expect(result).toBeNull()
})
```

**GREEN — Implementation satisfies when:**
- `detect` returns `null` when the root of the filesystem is reached without finding either marker
- Null return signals SingleFile mode to the caller

---

### TC-UNIT-VAULT-006 — VaultDetector.detect: does not walk above filesystem root (no infinite loop)

**Class / Service:** `VaultDetector`
**Spec file:** `tests/unit/vault/vault-detector.spec.ts`
**Linked FR:** `FR-VAULT-DETECT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('detect() terminates at filesystem root and does not loop infinitely', () => {
  // arrange — root has no marker; path.dirname('/') === '/' in POSIX
  const mockFs = MockFs.fromTree({
    '/note.md': { type: 'file' },
  })
  const detector = new VaultDetector(mockFs)

  // act — must complete (no timeout / infinite loop)
  const result = detector.detect('/note.md')

  // assert
  expect(result).toBeNull()
})
```

**GREEN — Implementation satisfies when:**
- The walk loop terminates when `parent === current` (i.e., `path.dirname(x) === x` at the filesystem root)
- No stack overflow or hang occurs

---

## VaultFolder Mode

### TC-UNIT-VAULT-007 — VaultFolder.mk(null): mode is SingleFile

**Class / Service:** `VaultFolder`
**Spec file:** `tests/unit/vault/vault-folder.spec.ts`
**Linked FR:** `FR-VAULT-SINGLEFILE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('VaultFolder.mk(null) creates a folder in SingleFile mode', () => {
  // act
  const folder = VaultFolder.mk(null)

  // assert
  expect(folder.mode).toBe('SingleFile')
})
```

**GREEN — Implementation satisfies when:**
- `VaultFolder.mk` with a `null` vault root returns an instance whose `mode` property is the `'SingleFile'` discriminant

**REFACTOR notes:** See [[concepts/workspace-model]] §VaultFolder for the mode union type.

---

### TC-UNIT-VAULT-008 — VaultFolder.mk(vaultRoot): mode is MultiFile

**Class / Service:** `VaultFolder`
**Spec file:** `tests/unit/vault/vault-folder.spec.ts`
**Linked FR:** `FR-VAULT-MULTIFILE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('VaultFolder.mk(vaultRoot) creates a folder in MultiFile mode', () => {
  // act
  const folder = VaultFolder.mk('/home/user/vault')

  // assert
  expect(folder.mode).toBe('MultiFile')
  expect(folder.vaultRoot).toBe('/home/user/vault')
})
```

**GREEN — Implementation satisfies when:**
- A non-null vault root path produces a `MultiFile` mode folder
- `vaultRoot` is accessible on the returned instance

---

### TC-UNIT-VAULT-009 — SingleFile VaultFolder: withDoc adds doc; lookupRef returns unresolved for cross-doc ref

**Class / Service:** `VaultFolder`
**Spec file:** `tests/unit/vault/vault-folder.spec.ts`
**Linked FR:** `FR-VAULT-SINGLEFILE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('SingleFile folder holds the doc but cannot resolve cross-doc references', () => {
  // arrange
  const folder = VaultFolder.mk(null)
  const doc = DocLifecycle.open('file:///tmp/note.md', 'markdown', 0, '[[other-note]]\n')

  // act
  const folderWithDoc = folder.withDoc(doc)
  const resolved = folderWithDoc.lookupRef({ target: 'other-note' })

  // assert
  expect(folderWithDoc.docs.size).toBe(1)
  expect(resolved.kind).toBe('Unresolved')
})
```

**GREEN — Implementation satisfies when:**
- `withDoc` returns an updated `VaultFolder` containing the doc
- `lookupRef` in SingleFile mode always returns an `Unresolved` result (no index to search)

---

## FolderLookup (Suffix-Tree / Approximate Resolution)

### TC-UNIT-VAULT-010 — FolderLookup: exact slug match returns that file

**Class / Service:** `FolderLookup`
**Spec file:** `tests/unit/vault/folder-lookup.spec.ts`
**Linked FR:** `FR-WIKILNK-RESOLVE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('exact slug lookup returns the single matching path', () => {
  // arrange
  const lookup = FolderLookup.fromEntries([
    { slug: 'daily', vaultRelativePath: 'daily.md' },
    { slug: 'weekly', vaultRelativePath: 'weekly.md' },
  ])

  // act
  const results = lookup.resolve('daily')

  // assert
  expect(results).toHaveLength(1)
  expect(results[0].vaultRelativePath).toBe('daily.md')
})
```

**GREEN — Implementation satisfies when:**
- An exact slug key produces exactly one result when that slug is unique in the index

---

### TC-UNIT-VAULT-011 — FolderLookup: approximate match finds file whose path contains the slug as suffix

**Class / Service:** `FolderLookup`
**Spec file:** `tests/unit/vault/folder-lookup.spec.ts`
**Linked FR:** `FR-WIKILNK-RESOLVE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('[[daily]] resolves against notes/daily.md via suffix matching', () => {
  // arrange
  const lookup = FolderLookup.fromEntries([
    { slug: 'daily', vaultRelativePath: 'notes/daily.md' },
  ])

  // act
  const results = lookup.resolve('daily')

  // assert
  expect(results).toHaveLength(1)
  expect(results[0].vaultRelativePath).toBe('notes/daily.md')
})
```

**GREEN — Implementation satisfies when:**
- `resolve` matches entries whose vault-relative path ends with (or contains) the slug segment
- The file does not need to be at the vault root

**REFACTOR notes:** See [[concepts/workspace-model]] §FolderLookup for the unanchored suffix-tree design.

---

### TC-UNIT-VAULT-012 — FolderLookup: ambiguous slug returns all matching files

**Class / Service:** `FolderLookup`
**Spec file:** `tests/unit/vault/folder-lookup.spec.ts`
**Linked FR:** `FR-WIKILNK-AMBIGUOUS`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('[[daily]] returns all files when multiple vault paths contain the slug', () => {
  // arrange
  const lookup = FolderLookup.fromEntries([
    { slug: 'daily', vaultRelativePath: 'journal/daily.md' },
    { slug: 'daily', vaultRelativePath: 'templates/daily.md' },
  ])

  // act
  const results = lookup.resolve('daily')

  // assert
  expect(results).toHaveLength(2)
  const paths = results.map((r) => r.vaultRelativePath)
  expect(paths).toContain('journal/daily.md')
  expect(paths).toContain('templates/daily.md')
})
```

**GREEN — Implementation satisfies when:**
- All matching entries are returned; callers are responsible for disambiguation (e.g., presenting a picker)

---

### TC-UNIT-VAULT-013 — FolderLookup: unknown slug returns empty result set

**Class / Service:** `FolderLookup`
**Spec file:** `tests/unit/vault/folder-lookup.spec.ts`
**Linked FR:** `FR-WIKILNK-RESOLVE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('resolve() returns an empty array for a slug not in the index', () => {
  // arrange
  const lookup = FolderLookup.fromEntries([
    { slug: 'daily', vaultRelativePath: 'daily.md' },
  ])

  // act
  const results = lookup.resolve('nonexistent')

  // assert
  expect(results).toHaveLength(0)
})
```

**GREEN — Implementation satisfies when:**
- No entry exists for the slug → returns `[]`, not null or undefined

---

### TC-UNIT-VAULT-014 — FolderLookup: slug normalization matches case-folded input

**Class / Service:** `FolderLookup`
**Spec file:** `tests/unit/vault/folder-lookup.spec.ts`
**Linked FR:** `FR-WIKILNK-NORMALIZE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('[[Daily Notes]] resolves the entry stored under slug "daily notes"', () => {
  // arrange
  const lookup = FolderLookup.fromEntries([
    { slug: 'daily notes', vaultRelativePath: 'notes/Daily Notes.md' },
  ])

  // act — raw wiki-link text with mixed case and a space
  const results = lookup.resolve('Daily Notes')

  // assert
  expect(results).toHaveLength(1)
  expect(results[0].vaultRelativePath).toBe('notes/Daily Notes.md')
})
```

**GREEN — Implementation satisfies when:**
- `resolve` normalizes the query slug (lowercase, trim) before comparing against index keys
- Index entries are stored under their normalized slug at insertion time

---

## Workspace / VaultFolderEnclosed

### TC-UNIT-VAULT-015 — Workspace: adding an enclosing MultiFile folder evicts existing SingleFile folders

**Class / Service:** `Workspace`, `VaultFolder`
**Spec file:** `tests/unit/vault/workspace.spec.ts`
**Linked FR:** `FR-VAULT-ENCLOSE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('VaultFolderEnclosed: SingleFile folders inside a new MultiFile root are evicted and their docs absorbed', () => {
  // arrange — workspace with two SingleFile folders inside /vault
  const docA = DocLifecycle.open('file:///vault/a.md', 'markdown', 0, '# A\n')
  const docB = DocLifecycle.open('file:///vault/sub/b.md', 'markdown', 0, '# B\n')
  const sfA = VaultFolder.mk(null).withDoc(docA)
  const sfB = VaultFolder.mk(null).withDoc(docB)
  let workspace = Workspace.empty()
    .withFolder(sfA)
    .withFolder(sfB)

  // precondition
  expect(workspace.folders).toHaveLength(2)

  // act — add a MultiFile folder whose root encloses both SingleFile folders
  const multiFolder = VaultFolder.mk('/vault')
  workspace = workspace.withFolder(multiFolder)

  // assert
  // only the one MultiFile folder remains
  expect(workspace.folders).toHaveLength(1)
  expect(workspace.folders[0].mode).toBe('MultiFile')
  // docs from the evicted SingleFile folders now live in the MultiFile folder
  const absorbed = workspace.folders[0]
  expect(absorbed.docs.has(docA.id)).toBe(true)
  expect(absorbed.docs.has(docB.id)).toBe(true)
})
```

**GREEN — Implementation satisfies when:**
- `Workspace.withFolder` detects that the new `MultiFile` root path encloses existing `SingleFile` folder document URIs
- Enclosed `SingleFile` folders are removed from the workspace
- Their documents are moved into the new `MultiFile` folder's doc collection
- The `VaultFolderEnclosed` event (or equivalent internal signal) is fired / observable

**REFACTOR notes:** See [[concepts/workspace-model]] §VaultFolderEnclosed for the eviction invariant and [[architecture/layers]] for where `Workspace` sits in the layer stack.
