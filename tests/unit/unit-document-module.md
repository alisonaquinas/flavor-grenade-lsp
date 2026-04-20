---
title: Unit Tests — Document Module
tags: [test/unit, test/tdd, module/document]
aliases: [Unit Tests Document, DocumentModule Tests]
---

> [!INFO] OFMDoc is immutable. Every test that modifies a doc verifies that the OLD doc is unchanged and the NEW doc is a fresh value. Tests use in-memory text strings — no LSP client needed.

See [[concepts/document-model]] for the full field contract and [[adr/ADR004-text-sync-strategy]] for the two sync mode definitions.

---

## OFMDoc Construction

### TC-UNIT-DOC-001 — DocLifecycle.open: creates OFMDoc with correct uri, version, and non-null index

**Class / Service:** `DocLifecycle`
**Spec file:** `tests/unit/document/doc-lifecycle.spec.ts`
**Linked FR:** `FR-DOC-OPEN`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('open() returns OFMDoc with correct uri, version 0, and non-null index', () => {
  // arrange
  const uri = 'file:///vault/notes/daily.md'
  const text = '# Daily Note\n\nSome content here.\n'

  // act
  const doc = DocLifecycle.open(uri, 'markdown', 0, text)

  // assert
  expect(doc.id).toBe(uri)
  expect(doc.version).toBe(0)
  expect(doc.text).toBe(text)
  expect(doc.index).not.toBeNull()
})
```

**GREEN — Implementation satisfies when:**

- `DocLifecycle.open` constructs an `OFMDoc` where `id === uri`, `version === version` parameter, `text === text` parameter
- `index` is a non-null `OFMIndex` (even if internally empty for plain text)

---

### TC-UNIT-DOC-002 — DocLifecycle.open: empty string produces valid OFMDoc with empty index

**Class / Service:** `DocLifecycle`
**Spec file:** `tests/unit/document/doc-lifecycle.spec.ts`
**Linked FR:** `FR-DOC-OPEN`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('open() with empty string returns valid OFMDoc with empty (not null) index', () => {
  // arrange
  const uri = 'file:///vault/notes/empty.md'

  // act
  const doc = DocLifecycle.open(uri, 'markdown', 0, '')

  // assert
  expect(doc).not.toBeNull()
  expect(doc.text).toBe('')
  expect(doc.index).not.toBeNull()
  expect(doc.index.wikiLinks).toHaveLength(0)
  expect(doc.index.headings).toHaveLength(0)
})
```

**GREEN — Implementation satisfies when:**

- Empty text does not throw and does not produce a null index
- `index.wikiLinks` and `index.headings` are empty arrays (not undefined or null)

---

### TC-UNIT-DOC-003 — DocLifecycle.close: version becomes null, text unchanged

**Class / Service:** `DocLifecycle`
**Spec file:** `tests/unit/document/doc-lifecycle.spec.ts`
**Linked FR:** `FR-DOC-CLOSE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('close() returns new OFMDoc with version null and same text', () => {
  // arrange
  const uri = 'file:///vault/notes/page.md'
  const text = '# Page\n\nContent.\n'
  const openDoc = DocLifecycle.open(uri, 'markdown', 3, text)

  // act
  const closedDoc = DocLifecycle.close(openDoc)

  // assert
  expect(closedDoc.version).toBeNull()
  expect(closedDoc.text).toBe(text)
  expect(closedDoc.id).toBe(uri)
  // must be a new object
  expect(closedDoc).not.toBe(openDoc)
})
```

**GREEN — Implementation satisfies when:**

- `close()` returns a new `OFMDoc` value (not the same reference)
- `version` is `null` on the returned doc
- `text` and `id` are preserved

---

## TextChangeApplicator — Full Sync

### TC-UNIT-DOC-004 — TextChangeApplicator.apply (replaceAll): new text, new index, version incremented

**Class / Service:** `TextChangeApplicator`, `DocLifecycle`
**Spec file:** `tests/unit/document/text-change-applicator.spec.ts`
**Linked FR:** `FR-SYNC-FULL`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('replaceAll produces new OFMDoc with new text, new index, and incremented version', () => {
  // arrange
  const uri = 'file:///vault/notes/doc.md'
  const original = DocLifecycle.open(uri, 'markdown', 0, '# Old\n')
  const newText = '# New\n\n[[some-link]]\n'
  const changeEvent = { text: newText } // full-text (no range)

  // act
  const updated = TextChangeApplicator.apply(original, [changeEvent], 1)

  // assert
  expect(updated.text).toBe(newText)
  expect(updated.version).toBe(1)
  expect(updated.index.wikiLinks).toHaveLength(1)
  expect(updated.index.wikiLinks[0].target).toBe('some-link')
  // identity must differ
  expect(updated).not.toBe(original)
})
```

**GREEN — Implementation satisfies when:**

- `replaceAll` path (change event with no `range` field) replaces entire text
- Returned doc version equals the supplied version argument
- A new `OFMIndex` is computed from the new text

**REFACTOR notes:** See [[adr/ADR004-text-sync-strategy]] §replaceAll for the dispatch rule.

---

### TC-UNIT-DOC-005 — TextChangeApplicator.apply (replaceAll): same text yields structurally equal index

**Class / Service:** `TextChangeApplicator`
**Spec file:** `tests/unit/document/text-change-applicator.spec.ts`
**Linked FR:** `FR-SYNC-FULL`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('replaceAll with identical text returns new object but structurally equal index', () => {
  // arrange
  const uri = 'file:///vault/notes/doc.md'
  const text = '# Title\n\n[[target-note]]\n'
  const original = DocLifecycle.open(uri, 'markdown', 0, text)

  // act
  const updated = TextChangeApplicator.apply(original, [{ text }], 1)

  // assert
  // new object identity
  expect(updated).not.toBe(original)
  expect(updated.index).not.toBe(original.index)
  // but structurally equivalent
  expect(updated.index.wikiLinks).toEqual(original.index.wikiLinks)
  expect(updated.index.headings).toEqual(original.index.headings)
})
```

**GREEN — Implementation satisfies when:**

- Even a no-op full sync returns a fresh `OFMDoc` and fresh `OFMIndex`
- Deep equality of `wikiLinks` and `headings` holds when text is identical

---

## TextChangeApplicator — Incremental Sync

### TC-UNIT-DOC-006 — TextChangeApplicator.apply (rangeReplace): single-range insert prepends text

**Class / Service:** `TextChangeApplicator`
**Spec file:** `tests/unit/document/text-change-applicator.spec.ts`
**Linked FR:** `FR-SYNC-INCREMENTAL`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('single-range insert at position 0 prepends the new text', () => {
  // arrange
  const uri = 'file:///vault/notes/doc.md'
  const original = DocLifecycle.open(uri, 'markdown', 0, 'Existing content\n')
  const insertChange = {
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
    text: '# New Heading\n',
  }

  // act
  const updated = TextChangeApplicator.apply(original, [insertChange], 1)

  // assert
  expect(updated.text).toBe('# New Heading\nExisting content\n')
  expect(updated.version).toBe(1)
  expect(updated.index.headings[0].text).toBe('New Heading')
})
```

**GREEN — Implementation satisfies when:**

- A zero-length range at offset 0 performs an insert without deleting any characters
- The heading is present in the recomputed index

**REFACTOR notes:** See [[adr/ADR004-text-sync-strategy]] §rangeReplace for LSP range-to-offset conversion.

---

### TC-UNIT-DOC-007 — TextChangeApplicator.apply (rangeReplace): single-range delete removes wiki-link from index

**Class / Service:** `TextChangeApplicator`
**Spec file:** `tests/unit/document/text-change-applicator.spec.ts`
**Linked FR:** `FR-SYNC-INCREMENTAL`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('deleting the range of a wiki-link removes it from the new index', () => {
  // arrange
  const uri = 'file:///vault/notes/doc.md'
  const text = 'See [[target-page]] for details.\n'
  const original = DocLifecycle.open(uri, 'markdown', 0, text)
  // range covering "[[target-page]]" (characters 4–19 on line 0)
  const deleteChange = {
    range: { start: { line: 0, character: 4 }, end: { line: 0, character: 19 } },
    text: '',
  }

  // act
  const updated = TextChangeApplicator.apply(original, [deleteChange], 1)

  // assert
  expect(updated.index.wikiLinks).toHaveLength(0)
  expect(updated.text).toBe('See  for details.\n')
})
```

**GREEN — Implementation satisfies when:**

- Range deletion collapses the specified span to empty
- Recomputed index contains no wiki-link entries for the deleted span

---

### TC-UNIT-DOC-008 — TextChangeApplicator.apply (rangeReplace): three non-overlapping changes applied in order

**Class / Service:** `TextChangeApplicator`
**Spec file:** `tests/unit/document/text-change-applicator.spec.ts`
**Linked FR:** `FR-SYNC-INCREMENTAL`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('three non-overlapping range changes applied in LSP order produce correct final text', () => {
  // arrange
  const uri = 'file:///vault/notes/doc.md'
  // "aaa\nbbb\nccc\n"
  const original = DocLifecycle.open(uri, 'markdown', 0, 'aaa\nbbb\nccc\n')
  const changes = [
    // replace "aaa" → "AAA"
    { range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } }, text: 'AAA' },
    // replace "bbb" → "BBB"
    { range: { start: { line: 1, character: 0 }, end: { line: 1, character: 3 } }, text: 'BBB' },
    // replace "ccc" → "CCC"
    { range: { start: { line: 2, character: 0 }, end: { line: 2, character: 3 } }, text: 'CCC' },
  ]

  // act
  const updated = TextChangeApplicator.apply(original, changes, 1)

  // assert
  expect(updated.text).toBe('AAA\nBBB\nCCC\n')
})
```

**GREEN — Implementation satisfies when:**

- Changes are applied sequentially in the provided array order
- Each change's range is resolved against the state after all preceding changes

---

## Version and Diagnostic Gating

### TC-UNIT-DOC-009 — shouldPublishDiagnostics: disk-loaded doc (version null) returns false

**Class / Service:** `OFMDoc`
**Spec file:** `tests/unit/document/ofm-doc.spec.ts`
**Linked FR:** `FR-DIAG-GATE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('shouldPublishDiagnostics() is false when version is null (disk-loaded)', () => {
  // arrange
  const uri = 'file:///vault/notes/disk.md'
  const openDoc = DocLifecycle.open(uri, 'markdown', 0, '# Title\n')
  const diskDoc = DocLifecycle.close(openDoc) // version → null

  // assert
  expect(diskDoc.version).toBeNull()
  expect(diskDoc.shouldPublishDiagnostics()).toBe(false)
})
```

**GREEN — Implementation satisfies when:**

- `shouldPublishDiagnostics()` returns `false` whenever `this.version === null`

**REFACTOR notes:** See [[concepts/document-model]] §Diagnostic gating.

---

### TC-UNIT-DOC-010 — shouldPublishDiagnostics: editor-open doc (version 0) returns true

**Class / Service:** `OFMDoc`
**Spec file:** `tests/unit/document/ofm-doc.spec.ts`
**Linked FR:** `FR-DIAG-GATE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('shouldPublishDiagnostics() is true when version is 0 (freshly opened)', () => {
  // arrange
  const uri = 'file:///vault/notes/open.md'
  const doc = DocLifecycle.open(uri, 'markdown', 0, '# Title\n')

  // assert
  expect(doc.version).toBe(0)
  expect(doc.shouldPublishDiagnostics()).toBe(true)
})
```

**GREEN — Implementation satisfies when:**

- `shouldPublishDiagnostics()` returns `true` for any `version >= 0`

---

### TC-UNIT-DOC-011 — DocLifecycle.change: version increases monotonically across successive calls

**Class / Service:** `DocLifecycle`
**Spec file:** `tests/unit/document/doc-lifecycle.spec.ts`
**Linked FR:** `FR-DOC-CHANGE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('successive change() calls produce monotonically increasing versions', () => {
  // arrange
  const uri = 'file:///vault/notes/doc.md'
  const v0 = DocLifecycle.open(uri, 'markdown', 0, '# A\n')

  // act
  const v1 = DocLifecycle.change(v0, 1, [{ text: '# A\n\nMore.\n' }])
  const v2 = DocLifecycle.change(v1, 2, [{ text: '# A\n\nMore.\n\nEven more.\n' }])
  const v3 = DocLifecycle.change(v2, 3, [{ text: '# A\n\nFinal.\n' }])

  // assert
  expect(v1.version).toBe(1)
  expect(v2.version).toBe(2)
  expect(v3.version).toBe(3)
  expect(v3.version).toBeGreaterThan(v2.version!)
  expect(v2.version).toBeGreaterThan(v1.version!)
})
```

**GREEN — Implementation satisfies when:**

- `DocLifecycle.change` threads the supplied `version` argument directly into the returned doc's `version` field
- All intermediate docs retain their original version values (immutability)

---

## Immutability

### TC-UNIT-DOC-012 — TextChangeApplicator.apply: original OFMDoc unmodified after apply

**Class / Service:** `TextChangeApplicator`, `OFMDoc`
**Spec file:** `tests/unit/document/text-change-applicator.spec.ts`
**Linked FR:** `—`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('original OFMDoc text and index are unmodified after apply()', () => {
  // arrange
  const uri = 'file:///vault/notes/doc.md'
  const originalText = '# Original\n\n[[link-a]]\n'
  const original = DocLifecycle.open(uri, 'markdown', 0, originalText)
  const originalIndexSnapshot = {
    wikiLinks: [...original.index.wikiLinks],
    headings: [...original.index.headings],
  }

  // act — full-text replacement
  TextChangeApplicator.apply(original, [{ text: '# Replacement\n\n[[link-b]]\n' }], 1)

  // assert — original must be unchanged
  expect(original.text).toBe(originalText)
  expect(original.index.wikiLinks).toEqual(originalIndexSnapshot.wikiLinks)
  expect(original.index.headings).toEqual(originalIndexSnapshot.headings)
  expect(original.version).toBe(0)
})
```

**GREEN — Implementation satisfies when:**

- `apply()` never mutates `doc.text`, `doc.index`, or `doc.version` on the input doc
- The returned doc is an entirely new value; the original is a read-only record

**REFACTOR notes:** Snapshot the index arrays before the call to catch any accidental in-place mutation of the original's internal collections.
