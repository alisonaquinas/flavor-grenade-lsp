---
title: Unit Tests — OFM Parser Pipeline
tags: [test/unit, test/tdd, module/parser]
aliases: [Unit Tests OFM Parser, OFMParser Tests]
---

> [!INFO] OFMParser.parse() is a pure function. All tests construct in-memory text strings — no file I/O. The key invariant: the same input always produces structurally equal output (immutability + purity).

## Overview

This document specifies the RED-phase unit tests for `OFMParser` and the 8-stage OFM parse pipeline. All test cases are written before any implementation exists. See [[concepts/document-model]], [[architecture/layers]], and [[adr/ADR010-tests-directory-structure]] for structural context.

Spec file: `tests/unit/parser/ofm-parser.spec.ts`
Source mirror: `src/parser/ofm-parser.ts`

---

### TC-UNIT-PARSE-001 — OFMParser: empty string yields empty OFMIndex

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `—`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('empty string → empty OFMIndex with no symbols and no errors', () => {
  const parser = new OFMParser()
  const index = parser.parseIndex('')

  expect(index.wikiLinks).toEqual([])
  expect(index.embeds).toEqual([])
  expect(index.blockAnchors).toEqual([])
  expect(index.tags).toEqual([])
  expect(index.headings).toEqual([])
  expect(index.callouts).toEqual([])
  expect(index.linkDefs).toEqual([])
  expect(index.ignoreRegions).toEqual([])
  expect(index.frontmatter).toEqual({})
})
```

**GREEN — Implementation satisfies when:**
- `parseIndex('')` returns an `OFMIndex` with every array empty and `frontmatter` an empty object.
- No exception is thrown.

---

### TC-UNIT-PARSE-002 — OFMParser: plain prose with no OFM elements

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `—`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('plain prose with no OFM elements → all symbol arrays empty', () => {
  const text = 'This is a paragraph.\n\nAnother paragraph with some text.'
  const parser = new OFMParser()
  const index = parser.parseIndex(text)

  expect(index.wikiLinks).toEqual([])
  expect(index.embeds).toEqual([])
  expect(index.tags).toEqual([])
  expect(index.blockAnchors).toEqual([])
  expect(index.callouts).toEqual([])
  expect(index.headings).toEqual([])
})
```

**GREEN — Implementation satisfies when:**
- A document containing only CommonMark prose produces no OFM-specific symbols in the index.
- `frontmatter` is an empty object (no YAML fence present).

---

### TC-UNIT-PARSE-003 — OFMParser: YAML frontmatter extracted, body parsed normally

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-FRONTMATTER`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('YAML frontmatter — title key present in frontmatter map; body wiki-link still indexed', () => {
  const text = [
    '---',
    'title: My Note',
    'tags: [project]',
    '---',
    '',
    'See [[OtherNote]] for details.',
  ].join('\n')
  const parser = new OFMParser()
  const index = parser.parseIndex(text)

  expect(index.frontmatter['title']).toBe('My Note')
  expect(index.frontmatter['tags']).toEqual(['project'])
  expect(index.wikiLinks).toHaveLength(1)
  expect(index.wikiLinks[0].target).toBe('OtherNote')
})
```

**GREEN — Implementation satisfies when:**
- Stage 2 (frontmatter extraction) strips the `---` block and exposes key-value pairs in `frontmatter`.
- The remaining body text continues through stages 3–8 and wiki-links in the body are indexed.

---

### TC-UNIT-PARSE-004 — OFMParser: math block marked as ignore region; wiki-link inside NOT indexed

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-IGNORE-MATH`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('math block $$...$$ — wiki-link inside math block is NOT in wikiLinks[]', () => {
  const text = [
    'Normal text with [[RealLink]].',
    '',
    '$$',
    '[[NotALink]]',
    '$$',
  ].join('\n')
  const parser = new OFMParser()
  const index = parser.parseIndex(text)

  const targets = index.wikiLinks.map((w) => w.target)
  expect(targets).toContain('RealLink')
  expect(targets).not.toContain('NotALink')
  expect(index.ignoreRegions.length).toBeGreaterThan(0)
})
```

**GREEN — Implementation satisfies when:**
- Stage 3 identifies the `$$...$$` span as an `ignoreRegion`.
- Stage 5 (wiki-link tokenization) skips any positions that fall inside an `ignoreRegion`.

**REFACTOR notes:** The ignore-region check should be a shared utility so EmbedParser and TagParser can reuse it.

---

### TC-UNIT-PARSE-005 — OFMParser: OFM comment marked as ignore region; tag inside NOT indexed

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-IGNORE-COMMENT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('OFM comment %%...$$ — tag inside comment is NOT in tags[]', () => {
  const text = [
    'Visible #realTag here.',
    '%%',
    'This is a comment with #hiddenTag inside.',
    '%%',
  ].join('\n')
  const parser = new OFMParser()
  const index = parser.parseIndex(text)

  const tagNames = index.tags.map((t) => t.name)
  expect(tagNames).toContain('realTag')
  expect(tagNames).not.toContain('hiddenTag')
})
```

**GREEN — Implementation satisfies when:**
- Stage 3 identifies `%%...%%` as an `ignoreRegion`.
- Stage 8 (tag identification) skips tokens inside ignore regions.

---

### TC-UNIT-PARSE-006 — OFMParser: fenced code block contents not parsed for OFM elements

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-IGNORE-CODE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('fenced code block — wiki-links and tags inside are NOT indexed', () => {
  const text = [
    'Outside [[ValidLink]] and #validTag.',
    '',
    '```typescript',
    'const x = "[[NotALink]] #notATag"',
    '```',
  ].join('\n')
  const parser = new OFMParser()
  const index = parser.parseIndex(text)

  const wikiTargets = index.wikiLinks.map((w) => w.target)
  const tagNames = index.tags.map((t) => t.name)

  expect(wikiTargets).toContain('ValidLink')
  expect(wikiTargets).not.toContain('NotALink')
  expect(tagNames).toContain('validTag')
  expect(tagNames).not.toContain('notATag')
})
```

**GREEN — Implementation satisfies when:**
- Stage 3 marks the fenced code block as an `ignoreRegion`.
- Both wiki-link tokenization (stage 5) and tag identification (stage 8) skip positions inside the region.

---

### TC-UNIT-PARSE-007 — OFMParser: ATX heading extracted with correct level and slug

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-HEADINGS`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('ATX ## Heading → headings[0] with level 2 and correct slug', () => {
  const text = '## My Section Heading'
  const parser = new OFMParser()
  const index = parser.parseIndex(text)

  expect(index.headings).toHaveLength(1)
  expect(index.headings[0].level).toBe(2)
  expect(index.headings[0].text).toBe('My Section Heading')
  expect(index.headings[0].slug).toBe('my-section-heading')
})
```

**GREEN — Implementation satisfies when:**
- Stage 4 (block structure) identifies the ATX heading and records `level`, `text`, and `slug`.
- Slug is lowercase, spaces replaced with hyphens, special characters stripped.

---

### TC-UNIT-PARSE-008 — OFMParser: multiple headings in document order with levels preserved

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-HEADINGS`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('multiple ATX headings — returned in document order with correct levels', () => {
  const text = [
    '# Top Level',
    '',
    '## Sub Section',
    '',
    '### Deep Section',
    '',
    '## Another Sub',
  ].join('\n')
  const parser = new OFMParser()
  const index = parser.parseIndex(text)

  expect(index.headings).toHaveLength(4)
  expect(index.headings[0].level).toBe(1)
  expect(index.headings[0].text).toBe('Top Level')
  expect(index.headings[1].level).toBe(2)
  expect(index.headings[1].text).toBe('Sub Section')
  expect(index.headings[2].level).toBe(3)
  expect(index.headings[2].text).toBe('Deep Section')
  expect(index.headings[3].level).toBe(2)
  expect(index.headings[3].text).toBe('Another Sub')
})
```

**GREEN — Implementation satisfies when:**
- All four headings appear in `index.headings` in document order.
- Each `level` matches the number of `#` characters.

---

### TC-UNIT-PARSE-009 — OFMParser: parse is pure — same input produces structurally equal OFMDoc

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `—`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('parse(text) called twice with same input → structurally equal OFMDoc (purity contract)', () => {
  const text = '# Title\n\nSome [[WikiLink]] and #tag.'
  const parser = new OFMParser()
  const doc1 = parser.parse(text)
  const doc2 = parser.parse(text)

  // Structural equality — not reference equality
  expect(doc1).not.toBe(doc2)
  expect(doc1.index.wikiLinks).toEqual(doc2.index.wikiLinks)
  expect(doc1.index.tags).toEqual(doc2.index.tags)
  expect(doc1.index.headings).toEqual(doc2.index.headings)
  expect(doc1.structure).toEqual(doc2.structure)
})
```

**GREEN — Implementation satisfies when:**
- `parse()` produces a new `OFMDoc` object on every call with no shared mutable state.
- The two results are deeply equal but not the same reference.

**REFACTOR notes:** If a cache is introduced later, the cache must use value-based keys and never return the same mutable object.

---

### TC-UNIT-PARSE-010 — OFMParser: version null on disk-loaded doc; numeric on editor-open doc

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-DOC-VERSION`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('disk-loaded doc has version null; editor-open doc with version number carries that version', () => {
  const text = 'Hello world.'
  const parser = new OFMParser()

  const diskDoc = parser.parse(text)
  expect(diskDoc.version).toBeNull()

  const editorDoc = parser.parse(text, { version: 3 })
  expect(editorDoc.version).toBe(3)
})
```

**GREEN — Implementation satisfies when:**
- `parse(text)` without options sets `OFMDoc.version` to `null`.
- `parse(text, { version: n })` sets `OFMDoc.version` to `n`.
- The version field does not affect any symbol extraction logic.

---

### TC-UNIT-PARSE-011 — OFMParser: OFMDoc.index always in sync with OFMDoc.structure

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-DOC-CONSISTENCY`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('OFMDoc.index is derived from structure — wiki-link count matches between index and structure walk', () => {
  const text = [
    '[[Alpha]] and [[Beta]] are mentioned.',
    '[[Gamma]] appears on a second line.',
  ].join('\n')
  const parser = new OFMParser()
  const doc = parser.parse(text)

  // Count wiki-links by walking the structure tree directly
  let structureWikiLinkCount = 0
  for (const block of doc.structure.blocks) {
    for (const inline of block.inlines ?? []) {
      if (inline.type === 'wikiLink') structureWikiLinkCount++
    }
  }

  expect(doc.index.wikiLinks).toHaveLength(structureWikiLinkCount)
  expect(doc.index.wikiLinks).toHaveLength(3)
})
```

**GREEN — Implementation satisfies when:**
- `OFMDoc.index` is always derived from `OFMDoc.structure` at parse time — never computed separately.
- There is no path that produces an index inconsistent with the structure.

**REFACTOR notes:** Consider making `index` a getter computed from `structure` to enforce this invariant at the type level.

---

### TC-UNIT-PARSE-012 — OFMParser: large document (500+ paragraphs) completes without timeout

**Class / Service:** `OFMParser`
**Spec file:** `tests/unit/parser/ofm-parser.spec.ts`
**Linked FR:** `FR-PERF-PARSE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('large document with 500+ paragraphs — parseIndex completes within 500ms', () => {
  const paragraphs = Array.from({ length: 500 }, (_, i) =>
    `Paragraph ${i}: see [[Note${i}]] and #tag${i % 20}.`
  )
  const text = paragraphs.join('\n\n')
  const parser = new OFMParser()

  const start = performance.now()
  const index = parser.parseIndex(text)
  const elapsed = performance.now() - start

  expect(elapsed).toBeLessThan(500)
  expect(index.wikiLinks).toHaveLength(500)
  expect(index.tags.length).toBeGreaterThan(0)
}, 1000)
```

**GREEN — Implementation satisfies when:**
- `parseIndex` on 500 paragraphs with 500 wiki-links and 25 unique tags completes in under 500 ms on a developer workstation.
- All 500 wiki-links are correctly indexed.

**REFACTOR notes:** If the naive implementation is too slow, introduce line-by-line streaming in stage 4 rather than building the full AST first.
