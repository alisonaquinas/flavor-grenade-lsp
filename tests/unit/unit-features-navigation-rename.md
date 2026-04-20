---
title: Unit Tests — Navigation and Rename Services
tags: [test/unit, test/tdd, module/features, feature/navigation, feature/rename]
aliases: [Unit Tests Navigation, Unit Tests Rename, DefinitionService Tests, RenameService Tests]
---

> [!INFO] DefinitionService and ReferencesService delegate entirely to Oracle — unit tests focus on correct LSP Location construction. RenameService tests verify WorkspaceEdit shape and StyleBinding preservation (ADR005).

Related: [[requirements/navigation]] | [[requirements/rename]] | [[adr/ADR005-wiki-style-binding]] | [[architecture/layers]] | [[adr/ADR010-tests-directory-structure]]

---

## Overview

This file covers three Feature Layer services: `DefinitionService`, `ReferencesService`, and `RenameService`. All Oracle interactions are replaced with mocks. `RenameService` tests additionally verify `WorkspaceEdit` structure and the StyleBinding invariant from [[adr/ADR005-wiki-style-binding]].

---

## DefinitionService

### TC-UNIT-NAV-001 — DefinitionService: resolved CrossDoc ref → Location at target doc start

**Class / Service:** `DefinitionService`
**Spec file:** `tests/unit/features/definition-service.spec.ts`
**Linked FR:** `FR-NAV-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns a single Location at the target document start for a resolved CrossDoc ref', () => {
  // arrange
  const targetUri = 'file:///vault/target.md';
  const def: DocDef = {
    slug: 'target',
    uri: targetUri,
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
    aliases: [],
  };
  const ref: CrossDocRef = {
    kind: 'CrossDoc',
    range: { start: { line: 3, character: 2 }, end: { line: 3, character: 14 } },
  };
  const oracle = {
    defsForRef: (_ref: CrossDocRef) => [def],
  } as unknown as Oracle;
  const svc = new DefinitionService(oracle);

  // act
  const locations = svc.definition(ref);

  // assert
  expect(locations).toHaveLength(1);
  expect(locations[0].uri).toBe(targetUri);
  expect(locations[0].range).toEqual(def.range);
});
```

**GREEN — Implementation satisfies when:**

- `DefinitionService.definition(ref)` calls `Oracle.defsForRef(ref)` and maps each result to an LSP `Location { uri, range }`.

---

### TC-UNIT-NAV-002 — DefinitionService: resolved CrossSection ref → Location at heading position in target doc

**Class / Service:** `DefinitionService`
**Spec file:** `tests/unit/features/definition-service.spec.ts`
**Linked FR:** `FR-NAV-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns a Location pointing to the heading range for a resolved CrossSection ref', () => {
  // arrange
  const targetUri = 'file:///vault/guide.md';
  const headingRange = {
    start: { line: 5, character: 0 },
    end:   { line: 5, character: 14 },
  };
  const def: HeaderDef = {
    uri: targetUri,
    text: 'Introduction',
    level: 2,
    range: headingRange,
  };
  const oracle = {
    defsForRef: () => [def],
  } as unknown as Oracle;
  const ref: CrossSectionRef = {
    kind: 'CrossSection',
    targetSlug: 'guide',
    anchor: 'Introduction',
    range: { start: { line: 2, character: 0 }, end: { line: 2, character: 24 } },
  };
  const svc = new DefinitionService(oracle);

  // act
  const locations = svc.definition(ref);

  // assert
  expect(locations).toHaveLength(1);
  expect(locations[0].uri).toBe(targetUri);
  expect(locations[0].range).toEqual(headingRange);
});
```

**GREEN — Implementation satisfies when:**

- The `Location.range` corresponds to the heading's own position, not the file start.

---

### TC-UNIT-NAV-003 — DefinitionService: unresolved ref → empty array (no throw)

**Class / Service:** `DefinitionService`
**Spec file:** `tests/unit/features/definition-service.spec.ts`
**Linked FR:** `FR-NAV-002`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns an empty array for an unresolved ref and does not throw', () => {
  // arrange
  const oracle = {
    defsForRef: () => [],
  } as unknown as Oracle;
  const ref: CrossDocRef = {
    kind: 'CrossDoc',
    range: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
  };
  const svc = new DefinitionService(oracle);

  // act + assert
  expect(() => svc.definition(ref)).not.toThrow();
  expect(svc.definition(ref)).toEqual([]);
});
```

**GREEN — Implementation satisfies when:**

- An empty `defsForRef` result is returned as `[]` without throwing.

---

### TC-UNIT-NAV-004 — DefinitionService: ambiguous ref (two defs) → two Locations

**Class / Service:** `DefinitionService`
**Spec file:** `tests/unit/features/definition-service.spec.ts`
**Linked FR:** `FR-NAV-003`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns two Locations when Oracle yields two defs for an ambiguous ref', () => {
  // arrange
  const defs: DocDef[] = [
    { slug: 'notes/daily', uri: 'file:///vault/notes/daily.md', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }, aliases: [] },
    { slug: 'archive/daily', uri: 'file:///vault/archive/daily.md', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }, aliases: [] },
  ];
  const oracle = { defsForRef: () => defs } as unknown as Oracle;
  const ref: CrossDocRef = {
    kind: 'CrossDoc',
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 9 } },
  };
  const svc = new DefinitionService(oracle);

  // act
  const locations = svc.definition(ref);

  // assert
  expect(locations).toHaveLength(2);
  expect(locations.map((l) => l.uri)).toContain('file:///vault/notes/daily.md');
  expect(locations.map((l) => l.uri)).toContain('file:///vault/archive/daily.md');
});
```

**GREEN — Implementation satisfies when:**

- All defs returned by Oracle are converted to Locations; no truncation for multi-def results.

---

## ReferencesService

### TC-UNIT-NAV-005 — ReferencesService: def with two CrossDoc refs → two Locations

**Class / Service:** `ReferencesService`
**Spec file:** `tests/unit/features/references-service.spec.ts`
**Linked FR:** `FR-NAV-004`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns two Locations for a def referenced by two CrossDoc refs', () => {
  // arrange
  const refs: CrossDocRef[] = [
    { kind: 'CrossDoc', sourceUri: 'file:///vault/a.md', range: { start: { line: 2, character: 0 }, end: { line: 2, character: 12 } } },
    { kind: 'CrossDoc', sourceUri: 'file:///vault/b.md', range: { start: { line: 7, character: 4 }, end: { line: 7, character: 16 } } },
  ];
  const oracle = { refsForDef: () => refs } as unknown as Oracle;
  const def: DocDef = { slug: 'target', uri: 'file:///vault/target.md', aliases: [] };
  const svc = new ReferencesService(oracle);

  // act
  const locations = svc.references(def, { includeDeclaration: false });

  // assert
  expect(locations).toHaveLength(2);
  expect(locations[0].uri).toBe('file:///vault/a.md');
  expect(locations[1].uri).toBe('file:///vault/b.md');
});
```

**GREEN — Implementation satisfies when:**

- `ReferencesService.references(def, context)` calls `Oracle.refsForDef(def)` and maps each `CrossDocRef` to `Location { uri: ref.sourceUri, range: ref.range }`.

---

### TC-UNIT-NAV-006 — ReferencesService: includeDeclaration true → def's own Location included

**Class / Service:** `ReferencesService`
**Spec file:** `tests/unit/features/references-service.spec.ts`
**Linked FR:** `FR-NAV-005`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('prepends the def Location when includeDeclaration is true', () => {
  // arrange
  const refLoc: CrossDocRef = {
    kind: 'CrossDoc',
    sourceUri: 'file:///vault/caller.md',
    range: { start: { line: 3, character: 0 }, end: { line: 3, character: 10 } },
  };
  const oracle = { refsForDef: () => [refLoc] } as unknown as Oracle;
  const def: DocDef = {
    slug: 'target',
    uri: 'file:///vault/target.md',
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
    aliases: [],
  };
  const svc = new ReferencesService(oracle);

  // act
  const locations = svc.references(def, { includeDeclaration: true });

  // assert
  expect(locations).toHaveLength(2);
  // def's own location must appear in the result
  const uris = locations.map((l) => l.uri);
  expect(uris).toContain('file:///vault/target.md');
  expect(uris).toContain('file:///vault/caller.md');
});
```

**GREEN — Implementation satisfies when:**

- When `includeDeclaration: true`, a `Location { uri: def.uri, range: def.range }` is included in the result alongside the reference locations.

---

### TC-UNIT-NAV-007 — ReferencesService: def with no refs → empty array

**Class / Service:** `ReferencesService`
**Spec file:** `tests/unit/features/references-service.spec.ts`
**Linked FR:** `FR-NAV-004`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns an empty array when the def has no incoming refs', () => {
  // arrange
  const oracle = { refsForDef: () => [] } as unknown as Oracle;
  const def: DocDef = { slug: 'orphan', uri: 'file:///vault/orphan.md', aliases: [] };
  const svc = new ReferencesService(oracle);

  // act
  const locations = svc.references(def, { includeDeclaration: false });

  // assert
  expect(locations).toEqual([]);
});
```

**GREEN — Implementation satisfies when:**

- An empty `refsForDef` result is returned as `[]` without error.

---

## RenameService

### TC-UNIT-NAV-008 — RenameService: prepareRename on wiki-link target → returns range of target text

**Class / Service:** `RenameService`
**Spec file:** `tests/unit/features/rename-service.spec.ts`
**Linked FR:** `FR-REN-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns the range of the wiki-link target when cursor is on target text', () => {
  // arrange
  const targetRange = {
    start: { line: 4, character: 2 },
    end:   { line: 4, character: 10 },
  };
  const oracle = {
    refAtPosition: () => ({
      kind: 'CrossDoc',
      targetRange,
    }),
  } as unknown as Oracle;
  const svc = new RenameService(oracle);
  const params = {
    textDocument: { uri: 'file:///vault/note.md' },
    position: { line: 4, character: 5 },
  };

  // act
  const result = svc.prepareRename(params);

  // assert
  expect(result).not.toBeNull();
  expect(result).toEqual(targetRange);
});
```

**GREEN — Implementation satisfies when:**

- `prepareRename` queries `Oracle.refAtPosition` and returns `targetRange` when a wiki-link ref is found at the cursor.

---

### TC-UNIT-NAV-009 — RenameService: prepareRename on plain prose → returns null

**Class / Service:** `RenameService`
**Spec file:** `tests/unit/features/rename-service.spec.ts`
**Linked FR:** `FR-REN-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns null when the cursor is on plain prose with no wiki-link ref', () => {
  // arrange
  const oracle = {
    refAtPosition: () => null,
  } as unknown as Oracle;
  const svc = new RenameService(oracle);
  const params = {
    textDocument: { uri: 'file:///vault/note.md' },
    position: { line: 1, character: 3 },
  };

  // act
  const result = svc.prepareRename(params);

  // assert
  expect(result).toBeNull();
});
```

**GREEN — Implementation satisfies when:**

- A `null` from `Oracle.refAtPosition` causes `prepareRename` to return `null`.

---

### TC-UNIT-NAV-010 — RenameService: note rename → WorkspaceEdit with one TextEdit per CrossDoc ref site

**Class / Service:** `RenameService`
**Spec file:** `tests/unit/features/rename-service.spec.ts`
**Linked FR:** `FR-REN-002`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('produces a WorkspaceEdit with one TextEdit per CrossDoc ref when renaming a note', () => {
  // arrange
  const refA: CrossDocRef = {
    kind: 'CrossDoc',
    sourceUri: 'file:///vault/a.md',
    targetRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 9 } },
  };
  const refB: CrossDocRef = {
    kind: 'CrossDoc',
    sourceUri: 'file:///vault/b.md',
    targetRange: { start: { line: 3, character: 0 }, end: { line: 3, character: 7 } },
  };
  const def: DocDef = {
    slug: 'old-name',
    uri: 'file:///vault/old-name.md',
    aliases: [],
  };
  const oracle = {
    defAtPosition: () => def,
    refsForDef: () => [refA, refB],
  } as unknown as Oracle;
  const svc = new RenameService(oracle);

  // act
  const edit = svc.rename({
    textDocument: { uri: 'file:///vault/old-name.md' },
    position: { line: 0, character: 0 },
    newName: 'new-name',
  });

  // assert — two edits, one per ref site
  const allEdits = Object.values(edit.changes ?? {}).flat();
  expect(allEdits).toHaveLength(2);
  // each edit replaces with the new slug
  expect(allEdits.every((e) => e.newText === 'new-name')).toBe(true);
});
```

**GREEN — Implementation satisfies when:**

- `rename` collects all `CrossDoc` refs via `Oracle.refsForDef` and produces a `WorkspaceEdit` with a `TextEdit` for each ref's `targetRange`.
- `TextEdit.newText` is the new slug only (not wrapped in `[[...]]` — the edit targets only the slug portion inside the brackets).

---

### TC-UNIT-NAV-011 — RenameService: heading rename → anchor portion updated; target doc portion unchanged

**Class / Service:** `RenameService`
**Spec file:** `tests/unit/features/rename-service.spec.ts`
**Linked FR:** `FR-REN-003`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('updates only the anchor portion of CrossSection refs when renaming a heading', () => {
  // arrange
  const ref: CrossSectionRef = {
    kind: 'CrossSection',
    sourceUri: 'file:///vault/caller.md',
    // anchorRange covers only the text after # inside the wiki-link
    anchorRange: { start: { line: 2, character: 10 }, end: { line: 2, character: 22 } },
    targetRange: { start: { line: 2, character: 2  }, end: { line: 2, character: 8  } },
  };
  const def: HeaderDef = {
    uri: 'file:///vault/guide.md',
    text: 'Old Heading',
    level: 2,
    range: { start: { line: 5, character: 0 }, end: { line: 5, character: 14 } },
  };
  const oracle = {
    defAtPosition: () => def,
    refsForDef: () => [ref],
  } as unknown as Oracle;
  const svc = new RenameService(oracle);

  // act
  const edit = svc.rename({
    textDocument: { uri: 'file:///vault/guide.md' },
    position: { line: 5, character: 3 },
    newName: 'New Heading',
  });

  // assert — only anchorRange is edited, targetRange (doc slug) is untouched
  const allEdits = Object.values(edit.changes ?? {}).flat();
  expect(allEdits).toHaveLength(1);
  expect(allEdits[0].range).toEqual(ref.anchorRange);
  expect(allEdits[0].newText).toBe('New Heading');
});
```

**GREEN — Implementation satisfies when:**

- For `CrossSection` refs, only the `anchorRange` is included in the `TextEdit`; no edit is produced for the target-doc portion.
- The heading definition's own text is also updated via an edit at `def.range`.

---

### TC-UNIT-NAV-012 — RenameService: StyleBinding — approx-resolved `[[daily]]` renamed to new slug preserves shortest-unambiguous form

**Class / Service:** `RenameService`
**Spec file:** `tests/unit/features/rename-service.spec.ts`
**Linked FR:** `FR-REN-004`
**Linked ADR:** [[adr/ADR005-wiki-style-binding]]
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('preserves shortest-unambiguous form per ADR005 — renames [[daily]] to [[new-slug]], not [[notes/daily/new-slug]]', () => {
  // arrange
  // The existing ref uses the approx form "daily" (not the full path "notes/daily/2024")
  const ref: CrossDocRef = {
    kind: 'CrossDoc',
    sourceUri: 'file:///vault/index.md',
    // The ref text in source is just "daily" (approx-resolved)
    resolvedForm: 'approx',
    targetRange: { start: { line: 0, character: 2 }, end: { line: 0, character: 7 } },
  };
  const def: DocDef = {
    slug: 'notes/daily/2024-01-01',
    uri: 'file:///vault/notes/daily/2024-01-01.md',
    shortestUnambiguous: 'daily',
    aliases: [],
  };
  const oracle = {
    defAtPosition: () => def,
    refsForDef: () => [ref],
    // shortestUnambiguousForm returns the new approx form for the new slug
    shortestUnambiguousForm: (_newSlug: string) => 'new-slug',
  } as unknown as Oracle;
  const svc = new RenameService(oracle);

  // act
  const edit = svc.rename({
    textDocument: { uri: def.uri },
    position: { line: 0, character: 0 },
    newName: 'notes/daily/new-slug',
  });

  // assert — the edit must use the short form, not the full path
  const allEdits = Object.values(edit.changes ?? {}).flat();
  expect(allEdits).toHaveLength(1);
  expect(allEdits[0].newText).toBe('new-slug');
  expect(allEdits[0].newText).not.toBe('notes/daily/new-slug');
});
```

**GREEN — Implementation satisfies when:**

- When a ref's existing `resolvedForm` is `'approx'`, `RenameService` calls `Oracle.shortestUnambiguousForm(newSlug)` to determine the replacement text rather than using the full slug path.
- The `TextEdit.newText` is the shortest unambiguous form, not the fully qualified slug.

**REFACTOR notes:** StyleBinding logic may be extracted into a `StyleBindingResolver` helper to keep `RenameService` thin; that extraction is a refactor step only — the test target remains `RenameService`.
