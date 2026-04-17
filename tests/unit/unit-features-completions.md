---
title: Unit Tests — Completion Service
tags: [test/unit, test/tdd, module/features, feature/completions]
aliases: [Unit Tests Completions, CompletionService Tests]
---

> [!INFO] CompletionService tests use mock FolderLookup and mock OFMIndex values. Trigger-character routing is tested by calling the service with different cursor positions and surrounding text contexts.

Related: [[requirements/completions]] | [[architecture/layers]] | [[adr/ADR010-tests-directory-structure]]

---

## Overview

These test cases cover `CompletionService` end-to-end from trigger-character routing through candidate construction, kind assignment, insert-text formatting, count capping, and alias expansion. No real `VaultIndex` or `OFMIndex` is constructed — all data is supplied via mock objects.

---

### TC-UNIT-COMP-001 — CompletionService: `[[` trigger with empty prefix returns all doc name candidates

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('returns all doc candidates from FolderLookup when prefix is empty after [[', () => {
  // arrange
  const mockDocs: DocDef[] = [
    { slug: 'alpha', uri: 'file:///vault/alpha.md', aliases: [] },
    { slug: 'beta',  uri: 'file:///vault/beta.md',  aliases: [] },
    { slug: 'gamma', uri: 'file:///vault/gamma.md', aliases: [] },
  ];
  const folderLookup = { allDocs: () => mockDocs } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, {} as OFMIndex, defaultFlavorConfig());

  // act — cursor sits immediately after [[
  const items = svc.complete({ triggerPrefix: '[[', query: '' });

  // assert
  expect(items).toHaveLength(3);
  const labels = items.map((i) => i.label);
  expect(labels).toContain('alpha');
  expect(labels).toContain('beta');
  expect(labels).toContain('gamma');
});
```

**GREEN — Implementation satisfies when:**
- `complete({ triggerPrefix: '[[', query: '' })` calls `FolderLookup.allDocs()` and returns one item per `DocDef`.

---

### TC-UNIT-COMP-002 — CompletionService: `[[Note` prefix returns only slug-matching candidates

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('filters candidates to slugs matching the typed prefix', () => {
  // arrange
  const mockDocs: DocDef[] = [
    { slug: 'note-taking',  uri: 'file:///vault/note-taking.md',  aliases: [] },
    { slug: 'notebook',     uri: 'file:///vault/notebook.md',     aliases: [] },
    { slug: 'daily-review', uri: 'file:///vault/daily-review.md', aliases: [] },
  ];
  const folderLookup = {
    queryDocs: (q: string) => mockDocs.filter((d) => d.slug.startsWith(q.toLowerCase())),
  } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, {} as OFMIndex, defaultFlavorConfig());

  // act
  const items = svc.complete({ triggerPrefix: '[[', query: 'note' });

  // assert
  expect(items).toHaveLength(2);
  expect(items.map((i) => i.label)).not.toContain('daily-review');
});
```

**GREEN — Implementation satisfies when:**
- A non-empty `query` is forwarded to `FolderLookup.queryDocs` (or equivalent filter) so only matching slugs are returned.

---

### TC-UNIT-COMP-003 — CompletionService: `[[Note#` prefix returns heading candidates from Note's OFMIndex

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-002`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('returns heading candidates when cursor is after [[Note#', () => {
  // arrange
  const headings: HeaderDef[] = [
    { text: 'Introduction', level: 2, range: { start: { line: 1, character: 0 }, end: { line: 1, character: 15 } } },
    { text: 'Usage',        level: 2, range: { start: { line: 5, character: 0 }, end: { line: 5, character: 7  } } },
  ];
  const ofmIndex = {
    headingsFor: (_uri: string) => headings,
  } as unknown as OFMIndex;
  const folderLookup = {
    resolveSlug: () => ({ uri: 'file:///vault/note.md' }),
  } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, ofmIndex, defaultFlavorConfig());

  // act
  const items = svc.complete({ triggerPrefix: '[[Note#', query: '' });

  // assert
  expect(items).toHaveLength(2);
  expect(items[0].label).toBe('Introduction');
  expect(items[1].label).toBe('Usage');
});
```

**GREEN — Implementation satisfies when:**
- Detecting `#` in the trigger prefix causes a lookup of `OFMIndex.headingsFor` using the resolved note URI.
- Returned items represent `HeaderDef` entries.

---

### TC-UNIT-COMP-004 — CompletionService: `[[Note#^` prefix returns block anchor candidates

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-003`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('returns block anchor candidates when cursor is after [[Note#^', () => {
  // arrange
  const blocks: BlockAnchorDef[] = [
    { id: 'abc123', range: { start: { line: 8, character: 0 }, end: { line: 8, character: 30 } } },
    { id: 'def456', range: { start: { line: 12, character: 0 }, end: { line: 12, character: 20 } } },
  ];
  const ofmIndex = {
    blockAnchorsFor: (_uri: string) => blocks,
  } as unknown as OFMIndex;
  const folderLookup = {
    resolveSlug: () => ({ uri: 'file:///vault/note.md' }),
  } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, ofmIndex, defaultFlavorConfig());

  // act
  const items = svc.complete({ triggerPrefix: '[[Note#^', query: '' });

  // assert
  expect(items).toHaveLength(2);
  expect(items.map((i) => i.label)).toContain('abc123');
  expect(items.map((i) => i.label)).toContain('def456');
});
```

**GREEN — Implementation satisfies when:**
- Detecting `#^` in the trigger prefix causes a lookup via `OFMIndex.blockAnchorsFor`.
- Items correspond to `BlockAnchorDef.id` values.

---

### TC-UNIT-COMP-005 — CompletionService: `#` inline trigger returns tag candidates from vault-wide tag set

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-004`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('returns vault-wide tag candidates when the trigger prefix is #', () => {
  // arrange
  const tags = ['project/alpha', 'project/beta', 'status/done'];
  const folderLookup = {
    allTags: () => tags,
  } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, {} as OFMIndex, defaultFlavorConfig());

  // act
  const items = svc.complete({ triggerPrefix: '#', query: '' });

  // assert
  expect(items).toHaveLength(3);
  expect(items.map((i) => i.label)).toContain('project/alpha');
});
```

**GREEN — Implementation satisfies when:**
- A `#` trigger (outside a wiki-link context) routes to `FolderLookup.allTags()`.

---

### TC-UNIT-COMP-006 — CompletionService: `> [!` trigger returns callout type candidates

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-005`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('returns built-in and custom callout type candidates after > [!', () => {
  // arrange
  const config = {
    ...defaultFlavorConfig(),
    callouts: { custom: ['CUSTOM-A', 'CUSTOM-B'] },
  } as FlavorConfig;
  const svc = new CompletionService({} as FolderLookup, {} as OFMIndex, config);

  // act
  const items = svc.complete({ triggerPrefix: '> [!', query: '' });

  // assert — built-ins always present
  const labels = items.map((i) => i.label);
  expect(labels).toContain('NOTE');
  expect(labels).toContain('WARNING');
  expect(labels).toContain('INFO');
  expect(labels).toContain('TIP');
  // custom types also present
  expect(labels).toContain('CUSTOM-A');
  expect(labels).toContain('CUSTOM-B');
});
```

**GREEN — Implementation satisfies when:**
- `> [!` routing merges the built-in list `['NOTE', 'WARNING', 'INFO', 'TIP']` with `FlavorConfig.callouts.custom`.

---

### TC-UNIT-COMP-007 — CompletionService: CompletionItem.kind values are correct for each candidate type

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-006`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('assigns correct CompletionItemKind for doc, heading, tag, and callout candidates', () => {
  // arrange — test each kind in isolation via minimal mocks
  const docFolderLookup = {
    allDocs: () => [{ slug: 'my-note', uri: 'file:///vault/my-note.md', aliases: [] }],
  } as unknown as FolderLookup;
  const headingOFMIndex = {
    headingsFor: () => [{ text: 'Intro', level: 2 }],
  } as unknown as OFMIndex;
  const tagFolderLookup = { allTags: () => ['inbox'] } as unknown as FolderLookup;

  const docSvc     = new CompletionService(docFolderLookup, {} as OFMIndex, defaultFlavorConfig());
  const headingSvc = new CompletionService(
    { resolveSlug: () => ({ uri: 'file:///vault/note.md' }) } as unknown as FolderLookup,
    headingOFMIndex,
    defaultFlavorConfig(),
  );
  const tagSvc     = new CompletionService(tagFolderLookup, {} as OFMIndex, defaultFlavorConfig());
  const calloutSvc = new CompletionService({} as FolderLookup, {} as OFMIndex, defaultFlavorConfig());

  // act
  const [docItem]     = docSvc.complete({ triggerPrefix: '[[', query: '' });
  const [headingItem] = headingSvc.complete({ triggerPrefix: '[[Note#', query: '' });
  const [tagItem]     = tagSvc.complete({ triggerPrefix: '#', query: '' });
  const calloutItems  = calloutSvc.complete({ triggerPrefix: '> [!', query: '' });

  // assert
  expect(docItem.kind).toBe(CompletionItemKind.File);
  expect(headingItem.kind).toBe(CompletionItemKind.Property);
  expect(tagItem.kind).toBe(CompletionItemKind.Keyword);
  expect(calloutItems[0].kind).toBe(CompletionItemKind.Snippet);
});
```

**GREEN — Implementation satisfies when:**
- Doc refs use `CompletionItemKind.File`.
- Headings use `CompletionItemKind.Property`.
- Block anchors use `CompletionItemKind.Event`.
- Tags use `CompletionItemKind.Keyword`.
- Callout types use `CompletionItemKind.Snippet`.

---

### TC-UNIT-COMP-008 — CompletionService: candidate count capped at completion.candidates config value

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-007`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('caps the returned candidate list at FlavorConfig.completion.candidates (default 50)', () => {
  // arrange — mock 60 docs
  const mockDocs: DocDef[] = Array.from({ length: 60 }, (_, i) => ({
    slug: `note-${i}`,
    uri: `file:///vault/note-${i}.md`,
    aliases: [],
  }));
  const folderLookup = { allDocs: () => mockDocs } as unknown as FolderLookup;
  const config = { ...defaultFlavorConfig(), completion: { candidates: 50 } } as FlavorConfig;
  const svc = new CompletionService(folderLookup, {} as OFMIndex, config);

  // act
  const items = svc.complete({ triggerPrefix: '[[', query: '' });

  // assert
  expect(items).toHaveLength(50);
});
```

**GREEN — Implementation satisfies when:**
- The result array is sliced to at most `FlavorConfig.completion.candidates` entries before being returned.

---

### TC-UNIT-COMP-009 — CompletionService: insert text for doc completion is `[[Note]]`, not just "Note"

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-008`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('sets insertText to the complete [[slug]] form for a doc candidate', () => {
  // arrange
  const folderLookup = {
    allDocs: () => [{ slug: 'my-note', uri: 'file:///vault/my-note.md', aliases: [] }],
  } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, {} as OFMIndex, defaultFlavorConfig());

  // act
  const [item] = svc.complete({ triggerPrefix: '[[', query: '' });

  // assert
  expect(item.insertText).toBe('[[my-note]]');
});
```

**GREEN — Implementation satisfies when:**
- Doc candidate `insertText` is always `'[['  + slug + ']]'`.

---

### TC-UNIT-COMP-010 — CompletionService: insert text for heading completion is `[[Note#Heading Title]]`

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-008`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('sets insertText to [[Note#Heading Title]] for a heading candidate', () => {
  // arrange
  const ofmIndex = {
    headingsFor: () => [{ text: 'Getting Started', level: 2 }],
  } as unknown as OFMIndex;
  const folderLookup = {
    resolveSlug: () => ({ uri: 'file:///vault/guide.md' }),
  } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, ofmIndex, defaultFlavorConfig());

  // act — prefix includes the doc slug so service knows the target
  const [item] = svc.complete({ triggerPrefix: '[[guide#', query: '' });

  // assert
  expect(item.insertText).toBe('[[guide#Getting Started]]');
});
```

**GREEN — Implementation satisfies when:**
- Heading candidate `insertText` is `'[[' + noteSlug + '#' + heading.text + ']]'`.

---

### TC-UNIT-COMP-011 — CompletionService: empty vault → doc completion returns empty list

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('returns an empty list when the vault contains no documents', () => {
  // arrange
  const folderLookup = { allDocs: () => [] } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, {} as OFMIndex, defaultFlavorConfig());

  // act
  const items = svc.complete({ triggerPrefix: '[[', query: '' });

  // assert
  expect(items).toEqual([]);
});
```

**GREEN — Implementation satisfies when:**
- An empty doc list from `FolderLookup` propagates as an empty completion result with no error.

---

### TC-UNIT-COMP-012 — CompletionService: alias candidate appears alongside slug in doc completion

**Class / Service:** `CompletionService`
**Spec file:** `tests/unit/features/completion-service.spec.ts`
**Linked FR:** `FR-COMP-009`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('includes alias entries as separate candidates alongside the canonical doc slug', () => {
  // arrange
  const mockDocs: DocDef[] = [
    {
      slug: 'project-notes',
      uri: 'file:///vault/project-notes.md',
      aliases: ['pn', 'projects'],
    },
  ];
  const folderLookup = { allDocs: () => mockDocs } as unknown as FolderLookup;
  const svc = new CompletionService(folderLookup, {} as OFMIndex, defaultFlavorConfig());

  // act
  const items = svc.complete({ triggerPrefix: '[[', query: '' });

  // assert — slug + two aliases = 3 items
  const labels = items.map((i) => i.label);
  expect(labels).toContain('project-notes');
  expect(labels).toContain('pn');
  expect(labels).toContain('projects');
});
```

**GREEN — Implementation satisfies when:**
- Each alias in `DocDef.aliases` generates a distinct `CompletionItem` with its own `label` and an `insertText` wrapping the alias in `[[...]]`.
- All alias items carry `kind: CompletionItemKind.File`.
