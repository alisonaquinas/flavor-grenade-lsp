---
title: Unit Tests — Resolution Module
tags: [test/unit, test/tdd, module/resolution]
aliases: [Unit Tests Resolution, RefGraph Tests, Oracle Tests]
---

> [!INFO] RefGraph is immutable — every test that calls update() checks that the original graph is unmodified. SymbolExtractor tests use synthetic OFMIndex values constructed directly, with no parser needed.

See [[concepts/connection-graph]] and [[design/domain-layer]] for the data model behind `ScopedSym`, `Scope`, and `RefGraph`. See [[architecture/layers]] for the module boundary rules. See [[adr/ADR010-tests-directory-structure]] for the spec file layout convention.

---

## SymbolExtractor

### TC-UNIT-RES-001 — SymbolExtractor: wiki-link produces CrossDoc ScopedSym with Doc scope

**Class / Service:** `SymbolExtractor`
**Spec file:** `tests/unit/resolution/SymbolExtractor.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('extracts one CrossDoc ScopedSym with Doc(docId) scope from an OFMIndex with one wiki-link', () => {
  const docId = DocId.ofUri('file:///vault/note.md', AbsPath.of('/vault'))
  const index: OFMIndex = {
    ...emptyIndex(),
    wikiLinks: [{ target: 'other-note', anchor: null, label: null, range: stubRange() }],
  }

  const syms = SymbolExtractor.extract(docId, index)

  expect(syms).toHaveLength(1)
  const s = syms[0]
  expect(s.sym.kind).toBe('CrossDoc')
  expect(s.scope).toEqual({ tag: 'Doc', docId })
})
```

**GREEN — Implementation satisfies when:**

- `SymbolExtractor.extract` iterates `index.wikiLinks` and emits one `ScopedSym` per link whose `sym` is a `CrossDoc` Ref and whose `scope` is `Doc(docId)`

---

### TC-UNIT-RES-002 — SymbolExtractor: tag produces TagRef ScopedSym with Global scope

**Class / Service:** `SymbolExtractor`
**Spec file:** `tests/unit/resolution/SymbolExtractor.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('extracts one TagRef ScopedSym with Global scope from an OFMIndex with one tag', () => {
  const docId = DocId.ofUri('file:///vault/note.md', AbsPath.of('/vault'))
  const index: OFMIndex = {
    ...emptyIndex(),
    tags: [{ name: 'project/alpha', range: stubRange() }],
  }

  const syms = SymbolExtractor.extract(docId, index)

  expect(syms).toHaveLength(1)
  const s = syms[0]
  expect(s.sym.kind).toBe('TagRef')
  expect(s.scope).toEqual({ tag: 'Global' })
})
```

**GREEN — Implementation satisfies when:**

- Tags are assigned `Global` scope (not `Doc`) — every other symbol type uses `Doc(docId)`

---

### TC-UNIT-RES-003 — SymbolExtractor: heading produces HeaderDef ScopedSym

**Class / Service:** `SymbolExtractor`
**Spec file:** `tests/unit/resolution/SymbolExtractor.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('extracts one HeaderDef ScopedSym from an OFMIndex with one heading', () => {
  const docId = DocId.ofUri('file:///vault/note.md', AbsPath.of('/vault'))
  const index: OFMIndex = {
    ...emptyIndex(),
    headings: [{ text: 'Introduction', level: 2, range: stubRange() }],
  }

  const syms = SymbolExtractor.extract(docId, index)

  expect(syms).toHaveLength(1)
  const s = syms[0]
  expect(s.sym.kind).toBe('HeaderDef')
  expect(s.scope).toEqual({ tag: 'Doc', docId })
})
```

**GREEN — Implementation satisfies when:**

- Each entry in `index.headings` produces a `HeaderDef` Def symbol scoped to `Doc(docId)`

---

### TC-UNIT-RES-004 — SymbolExtractor: frontmatter alias produces AliasDef ScopedSym

**Class / Service:** `SymbolExtractor`
**Spec file:** `tests/unit/resolution/SymbolExtractor.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('extracts one AliasDef ScopedSym per frontmatter alias entry', () => {
  const docId = DocId.ofUri('file:///vault/note.md', AbsPath.of('/vault'))
  const index: OFMIndex = {
    ...emptyIndex(),
    frontmatter: { aliases: ['alias1'] },
  }

  const syms = SymbolExtractor.extract(docId, index)

  expect(syms).toHaveLength(1)
  const s = syms[0]
  expect(s.sym.kind).toBe('AliasDef')
  expect((s.sym as AliasDef).alias).toBe('alias1')
  expect(s.scope).toEqual({ tag: 'Doc', docId })
})
```

**GREEN — Implementation satisfies when:**

- `SymbolExtractor.extract` reads `index.frontmatter.aliases` (array) and emits one `AliasDef` per entry

---

## RefGraph.mk — Full Rebuild

### TC-UNIT-RES-005 — RefGraph.mk: resolved ref not in unresolvedRefs when matching def exists

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.mk.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('places a CrossDoc ref in resolved and not in unresolvedRefs when a matching DocDef exists', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const defSym = scopedSym(DocDef({ slug: Slug.ofString('b'), docId: docB }), Doc(docB))
  const refSym = scopedSym(CrossDoc({ target: Slug.ofString('b') }), Doc(docA))
  const oracle = mockOracle({ defs: [defSym], refs: [refSym] })

  const graph = RefGraph.mk(oracle, [defSym, refSym])

  expect(graph.resolved.has(refSym)).toBe(true)
  expect(graph.resolved.get(refSym)).toContain(defSym)
  expect(graph.unresolvedRefs.has(refSym)).toBe(false)
})
```

**GREEN — Implementation satisfies when:**

- `RefGraph.mk` resolves every ref that has at least one matching def; the ref key maps to an array containing that def

---

### TC-UNIT-RES-006 — RefGraph.mk: unresolvable ref placed in unresolvedRefs

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.mk.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('places a CrossDoc ref in unresolvedRefs when no matching def exists', () => {
  const docA = makeDocId('file:///vault/a.md')
  const refSym = scopedSym(CrossDoc({ target: Slug.ofString('missing') }), Doc(docA))
  const oracle = mockOracle({ defs: [], refs: [refSym] })

  const graph = RefGraph.mk(oracle, [refSym])

  expect(graph.unresolvedRefs.has(refSym)).toBe(true)
  expect(graph.resolved.has(refSym)).toBe(false)
})
```

**GREEN — Implementation satisfies when:**

- Refs that match no def are added to `unresolvedRefs` and absent from `resolved`

---

### TC-UNIT-RES-007 — RefGraph.mk: ambiguous ref resolves to multiple defs

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.mk.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('maps the ref to both defs when two defs share the same slug (ambiguous resolution)', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const docC = makeDocId('file:///vault/c.md')
  const slug = Slug.ofString('notes')
  const def1 = scopedSym(DocDef({ slug, docId: docB }), Doc(docB))
  const def2 = scopedSym(DocDef({ slug, docId: docC }), Doc(docC))
  const ref  = scopedSym(CrossDoc({ target: slug }), Doc(docA))
  const oracle = mockOracle({ defs: [def1, def2], refs: [ref] })

  const graph = RefGraph.mk(oracle, [def1, def2, ref])

  const resolved = graph.resolved.get(ref)
  expect(resolved).toHaveLength(2)
  expect(resolved).toContain(def1)
  expect(resolved).toContain(def2)
  expect(graph.unresolvedRefs.has(ref)).toBe(false)
})
```

**GREEN — Implementation satisfies when:**

- The resolved value array for a ref contains ALL matching defs, not just the first one found

---

### TC-UNIT-RES-008 — RefGraph.mk: refDeps populated for cross-document refs

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.mk.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('adds docB to refDeps[docA] when doc A has a CrossDoc ref that resolves to a def in doc B', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const def  = scopedSym(DocDef({ slug: Slug.ofString('b'), docId: docB }), Doc(docB))
  const ref  = scopedSym(CrossDoc({ target: Slug.ofString('b') }), Doc(docA))
  const oracle = mockOracle({ defs: [def], refs: [ref] })

  const graph = RefGraph.mk(oracle, [def, ref])

  expect(graph.refDeps.get(docA.uri)?.has(docB.uri)).toBe(true)
})
```

**GREEN — Implementation satisfies when:**

- Every resolved cross-doc edge `(refDoc → defDoc)` where the two docs differ is recorded in `refDeps`

---

## RefGraph.update — Incremental Delta

### TC-UNIT-RES-009 — RefGraph.update: new def resolves a previously unresolved ref

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.update.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('moves a ref from unresolvedRefs to resolved when a new matching def is added', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const ref  = scopedSym(CrossDoc({ target: Slug.ofString('b') }), Doc(docA))
  const initialGraph = RefGraph.mk(mockOracle({ defs: [], refs: [ref] }), [ref])

  expect(initialGraph.unresolvedRefs.has(ref)).toBe(true)

  const newDef = scopedSym(DocDef({ slug: Slug.ofString('b'), docId: docB }), Doc(docB))
  const updated = initialGraph.update(
    mockOracle({ defs: [newDef], refs: [ref] }),
    { added: [newDef], removed: [] },
  )

  expect(updated.unresolvedRefs.has(ref)).toBe(false)
  expect(updated.resolved.has(ref)).toBe(true)
  expect(updated.lastTouched.has(ref)).toBe(true)
})
```

**GREEN — Implementation satisfies when:**

- `update` re-attempts resolution of every member of `unresolvedRefs` against newly added defs; successful resolutions move the ref into `resolved` and into `lastTouched`

---

### TC-UNIT-RES-010 — RefGraph.update: removing a def orphans its refs

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.update.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('moves all refs that pointed at a removed def into unresolvedRefs; lastTouched contains those refs', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const def  = scopedSym(DocDef({ slug: Slug.ofString('b'), docId: docB }), Doc(docB))
  const ref  = scopedSym(CrossDoc({ target: Slug.ofString('b') }), Doc(docA))
  const initialGraph = RefGraph.mk(mockOracle({ defs: [def], refs: [ref] }), [def, ref])

  expect(initialGraph.resolved.has(ref)).toBe(true)

  const updated = initialGraph.update(
    mockOracle({ defs: [], refs: [ref] }),
    { added: [], removed: [def] },
  )

  expect(updated.resolved.has(ref)).toBe(false)
  expect(updated.unresolvedRefs.has(ref)).toBe(true)
  expect(updated.lastTouched.has(ref)).toBe(true)
})
```

**GREEN — Implementation satisfies when:**

- Removals are processed first: stale edges for the removed def are purged and their source refs added to `unresolvedRefs` and `lastTouched`

---

### TC-UNIT-RES-011 — RefGraph.update: new ref matching existing def placed in resolved

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.update.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('places a newly added CrossDoc ref directly in resolved when a matching def already exists', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const def  = scopedSym(DocDef({ slug: Slug.ofString('b'), docId: docB }), Doc(docB))
  const initialGraph = RefGraph.mk(mockOracle({ defs: [def], refs: [] }), [def])

  const newRef = scopedSym(CrossDoc({ target: Slug.ofString('b') }), Doc(docA))
  const updated = initialGraph.update(
    mockOracle({ defs: [def], refs: [newRef] }),
    { added: [newRef], removed: [] },
  )

  expect(updated.resolved.has(newRef)).toBe(true)
  expect(updated.unresolvedRefs.has(newRef)).toBe(false)
})
```

**GREEN — Implementation satisfies when:**

- New refs that immediately match an existing def are inserted into `resolved` without going through `unresolvedRefs`

---

### TC-UNIT-RES-012 — RefGraph.update: new ref with no matching def placed in unresolvedRefs

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.update.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('places a newly added CrossDoc ref in unresolvedRefs when no def matches; lastTouched contains it', () => {
  const docA = makeDocId('file:///vault/a.md')
  const initialGraph = RefGraph.mk(mockOracle({ defs: [], refs: [] }), [])

  const newRef = scopedSym(CrossDoc({ target: Slug.ofString('ghost') }), Doc(docA))
  const updated = initialGraph.update(
    mockOracle({ defs: [], refs: [newRef] }),
    { added: [newRef], removed: [] },
  )

  expect(updated.unresolvedRefs.has(newRef)).toBe(true)
  expect(updated.resolved.has(newRef)).toBe(false)
  expect(updated.lastTouched.has(newRef)).toBe(true)
})
```

**GREEN — Implementation satisfies when:**

- New refs with no matching def are added to `unresolvedRefs` and `lastTouched`

---

### TC-UNIT-RES-013 — RefGraph.update: returns a new object (immutability)

**Class / Service:** `RefGraph`
**Spec file:** `tests/unit/resolution/RefGraph.update.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns a new RefGraph instance; the original resolved map is unchanged', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const def  = scopedSym(DocDef({ slug: Slug.ofString('b'), docId: docB }), Doc(docB))
  const ref  = scopedSym(CrossDoc({ target: Slug.ofString('b') }), Doc(docA))
  const original = RefGraph.mk(mockOracle({ defs: [def], refs: [ref] }), [def, ref])
  const originalResolvedSize = original.resolved.size

  const updated = original.update(
    mockOracle({ defs: [], refs: [] }),
    { added: [], removed: [def] },
  )

  expect(updated).not.toBe(original)
  expect(original.resolved.size).toBe(originalResolvedSize)
  expect(original.unresolvedRefs.has(ref)).toBe(false)
})
```

**GREEN — Implementation satisfies when:**

- `update` constructs and returns a fresh `RefGraph`; all internal collections on the original graph are structurally unchanged after the call

**REFACTOR notes:** Consider a shared `immutabilityHarness` helper that snapshots a graph's collection sizes before and after any mutation-candidate operation.

---

## Oracle Queries

### TC-UNIT-RES-014 — Oracle.defsForRef: returns matching defs for a resolved ref

**Class / Service:** `Oracle`
**Spec file:** `tests/unit/resolution/Oracle.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('defsForRef returns the def(s) that a resolved CrossDoc ref points to', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const def  = scopedSym(DocDef({ slug: Slug.ofString('b'), docId: docB }), Doc(docB))
  const ref  = scopedSym(CrossDoc({ target: Slug.ofString('b') }), Doc(docA))
  const graph = RefGraph.mk(mockOracle({ defs: [def], refs: [ref] }), [def, ref])
  const oracle = Oracle.fromGraph(graph)

  const result = oracle.defsForRef(ref)

  expect(result).toHaveLength(1)
  expect(result[0]).toBe(def)
})
```

**GREEN — Implementation satisfies when:**

- `Oracle.defsForRef` looks up `ref` in `graph.resolved` and returns the value array, or `[]` if absent

---

### TC-UNIT-RES-015 — Oracle.isUnresolved: returns true for an unresolved ref

**Class / Service:** `Oracle`
**Spec file:** `tests/unit/resolution/Oracle.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('isUnresolved returns true for a ref that could not be resolved', () => {
  const docA = makeDocId('file:///vault/a.md')
  const ref  = scopedSym(CrossDoc({ target: Slug.ofString('nowhere') }), Doc(docA))
  const graph = RefGraph.mk(mockOracle({ defs: [], refs: [ref] }), [ref])
  const oracle = Oracle.fromGraph(graph)

  expect(oracle.isUnresolved(ref)).toBe(true)
})
```

**GREEN — Implementation satisfies when:**

- `Oracle.isUnresolved` returns `graph.unresolvedRefs.has(ref)`

---

### TC-UNIT-RES-016 — Oracle.refsForDef: returns all refs pointing at a def across all docs

**Class / Service:** `Oracle`
**Spec file:** `tests/unit/resolution/Oracle.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('refsForDef returns every ref that resolves to the given def, across all source documents', () => {
  const docA = makeDocId('file:///vault/a.md')
  const docB = makeDocId('file:///vault/b.md')
  const docC = makeDocId('file:///vault/c.md')
  const def  = scopedSym(DocDef({ slug: Slug.ofString('target'), docId: docC }), Doc(docC))
  const ref1 = scopedSym(CrossDoc({ target: Slug.ofString('target') }), Doc(docA))
  const ref2 = scopedSym(CrossDoc({ target: Slug.ofString('target') }), Doc(docB))
  const graph = RefGraph.mk(
    mockOracle({ defs: [def], refs: [ref1, ref2] }),
    [def, ref1, ref2],
  )
  const oracle = Oracle.fromGraph(graph)

  const refs = oracle.refsForDef(def)

  expect(refs).toHaveLength(2)
  expect(refs).toContain(ref1)
  expect(refs).toContain(ref2)
})
```

**GREEN — Implementation satisfies when:**

- `Oracle.refsForDef` inverts `graph.resolved` — scanning all entries whose value array includes `def` — and returns the corresponding ref keys

**REFACTOR notes:** The inversion scan may be replaced by a pre-built reverse-index (`def → ref[]`) cached on `Oracle` construction if profiling shows it is a hot path.
