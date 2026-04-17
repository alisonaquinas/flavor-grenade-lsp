---
title: Unit Tests — Diagnostic Service
tags: [test/unit, test/tdd, module/features, feature/diagnostics]
aliases: [Unit Tests Diagnostics, DiagnosticService Tests]
---

> [!INFO] DiagnosticService is tested with a mock Oracle. No real RefGraph is constructed. Debounce tests use Bun's fake timer API (or a manual stub) to control elapsed time without real delays.

Related: [[requirements/diagnostics]] | [[architecture/layers]] | [[adr/ADR010-tests-directory-structure]]

---

## Overview

These test cases cover `DiagnosticService` in its entirety: diagnostic code and severity mapping, document-version gating, debounce coalescing, and selective republishing driven by `lastTouched`. All Oracle interactions are replaced with mock implementations. No `RefGraph` is constructed.

---

### TC-UNIT-DIAG-001 — DiagnosticService: unresolved CrossDoc ref produces FG001 Error

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('emits FG001 Error for an unresolved CrossDoc ref', () => {
  // arrange
  const ref = {
    kind: 'CrossDoc',
    range: { start: { line: 2, character: 5 }, end: { line: 2, character: 18 } },
  };
  const oracle = {
    unresolvedRefs: () => [ref],
  } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/note.md', version: 1 };

  const svc = new DiagnosticService(oracle, connection);

  // act
  svc.publishNow(doc);

  // assert
  const [call] = (connection.sendDiagnostics as Mock).mock.calls;
  const diag = call[0].diagnostics[0];
  expect(diag.code).toBe('FG001');
  expect(diag.severity).toBe(DiagnosticSeverity.Error);
  expect(diag.range).toEqual(ref.range);
});
```

**GREEN — Implementation satisfies when:**
- `DiagnosticService.publishNow` calls `oracle.unresolvedRefs()` for the given document.
- CrossDoc entries are mapped to severity `Error` with code `'FG001'`.
- The LSP `range` in the emitted diagnostic matches the ref's range exactly.

---

### TC-UNIT-DIAG-002 — DiagnosticService: unresolved CrossSection ref produces FG002 Warning

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('emits FG002 Warning for an unresolved CrossSection ref', () => {
  // arrange
  const ref = {
    kind: 'CrossSection',
    range: { start: { line: 4, character: 0 }, end: { line: 4, character: 20 } },
  };
  const oracle = { unresolvedRefs: () => [ref] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/note.md', version: 1 };

  const svc = new DiagnosticService(oracle, connection);
  svc.publishNow(doc);

  // assert
  const diag = (connection.sendDiagnostics as Mock).mock.calls[0][0].diagnostics[0];
  expect(diag.code).toBe('FG002');
  expect(diag.severity).toBe(DiagnosticSeverity.Warning);
});
```

**GREEN — Implementation satisfies when:**
- CrossSection unresolved refs are mapped to severity `Warning` with code `'FG002'`.

---

### TC-UNIT-DIAG-003 — DiagnosticService: ambiguous CrossDoc ref (two defs) produces FG003 Warning

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-002`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('emits FG003 Warning for an ambiguous CrossDoc ref', () => {
  // arrange
  const ref = {
    kind: 'CrossDoc',
    ambiguous: true,
    defCount: 2,
    range: { start: { line: 1, character: 0 }, end: { line: 1, character: 12 } },
  };
  const oracle = { unresolvedRefs: () => [ref] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/note.md', version: 2 };

  const svc = new DiagnosticService(oracle, connection);
  svc.publishNow(doc);

  // assert
  const diag = (connection.sendDiagnostics as Mock).mock.calls[0][0].diagnostics[0];
  expect(diag.code).toBe('FG003');
  expect(diag.severity).toBe(DiagnosticSeverity.Warning);
});
```

**GREEN — Implementation satisfies when:**
- Refs flagged `ambiguous: true` with `defCount > 1` are emitted as `FG003` Warning regardless of base kind.

---

### TC-UNIT-DIAG-004 — DiagnosticService: unresolved EmbedRef produces FG004 Error

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('emits FG004 Error for an unresolved EmbedRef', () => {
  // arrange
  const ref = {
    kind: 'EmbedRef',
    range: { start: { line: 6, character: 2 }, end: { line: 6, character: 22 } },
  };
  const oracle = { unresolvedRefs: () => [ref] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/note.md', version: 1 };

  const svc = new DiagnosticService(oracle, connection);
  svc.publishNow(doc);

  const diag = (connection.sendDiagnostics as Mock).mock.calls[0][0].diagnostics[0];
  expect(diag.code).toBe('FG004');
  expect(diag.severity).toBe(DiagnosticSeverity.Error);
});
```

**GREEN — Implementation satisfies when:**
- EmbedRef unresolved entries are mapped to severity `Error` with code `'FG004'`.

---

### TC-UNIT-DIAG-005 — DiagnosticService: unresolved CrossBlock ref produces FG005 Warning

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('emits FG005 Warning for an unresolved CrossBlock ref', () => {
  // arrange
  const ref = {
    kind: 'CrossBlock',
    range: { start: { line: 10, character: 0 }, end: { line: 10, character: 15 } },
  };
  const oracle = { unresolvedRefs: () => [ref] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/note.md', version: 3 };

  const svc = new DiagnosticService(oracle, connection);
  svc.publishNow(doc);

  const diag = (connection.sendDiagnostics as Mock).mock.calls[0][0].diagnostics[0];
  expect(diag.code).toBe('FG005');
  expect(diag.severity).toBe(DiagnosticSeverity.Warning);
});
```

**GREEN — Implementation satisfies when:**
- CrossBlock unresolved entries are mapped to severity `Warning` with code `'FG005'`.

---

### TC-UNIT-DIAG-006 — DiagnosticService: no unresolved refs → empty diagnostics array

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-001`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('sends an empty diagnostics array when the document has no unresolved refs', () => {
  // arrange
  const oracle = { unresolvedRefs: () => [] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/clean.md', version: 1 };

  const svc = new DiagnosticService(oracle, connection);
  svc.publishNow(doc);

  // assert
  const [call] = (connection.sendDiagnostics as Mock).mock.calls;
  expect(call[0].diagnostics).toEqual([]);
});
```

**GREEN — Implementation satisfies when:**
- `sendDiagnostics` is still called (clearing any previous diagnostics), with an empty array.

---

### TC-UNIT-DIAG-007 — DiagnosticService: disk-loaded doc (version null) → publishDiagnostics NOT called

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-003`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('skips publishing for a disk-loaded document with version null', () => {
  // arrange
  const oracle = {
    unresolvedRefs: mock(() => []),
  } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/disk-only.md', version: null };

  const svc = new DiagnosticService(oracle, connection);
  svc.publishNow(doc);

  // assert — neither oracle nor connection should be touched
  expect((oracle.unresolvedRefs as Mock).mock.calls.length).toBe(0);
  expect((connection.sendDiagnostics as Mock).mock.calls.length).toBe(0);
});
```

**GREEN — Implementation satisfies when:**
- `version === null` causes an early return before any Oracle or connection call.

---

### TC-UNIT-DIAG-008 — DiagnosticService: editor-open doc (version 0) → publishDiagnostics called

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-003`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('publishes diagnostics for an editor-open document with version 0', () => {
  // arrange
  const oracle = { unresolvedRefs: () => [] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  // version 0 is the minimum "editor-open" value
  const doc = { uri: 'file:///vault/open.md', version: 0 };

  const svc = new DiagnosticService(oracle, connection);
  svc.publishNow(doc);

  // assert — connection must have been called exactly once
  expect((connection.sendDiagnostics as Mock).mock.calls.length).toBe(1);
});
```

**GREEN — Implementation satisfies when:**
- Any document with `version >= 0` passes the version gate and triggers publication.

---

### TC-UNIT-DIAG-009 — DiagnosticService: two rapid calls within debounce window → only ONE publishDiagnostics emitted

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-004`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('coalesces two calls within the 200 ms debounce window into one publication', async () => {
  // arrange — use fake timers so the test does not actually wait
  using fakeTime = new FakeTime(); // Bun fake timer utility
  const oracle = { unresolvedRefs: () => [] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/busy.md', version: 1 };

  const svc = new DiagnosticService(oracle, connection);

  // act — two calls fired 50 ms apart (both inside the 200 ms window)
  svc.schedulePublish(doc);
  fakeTime.tick(50);
  svc.schedulePublish(doc);

  // advance past the debounce threshold
  fakeTime.tick(200);

  // assert — only one publication despite two schedule calls
  expect((connection.sendDiagnostics as Mock).mock.calls.length).toBe(1);
});
```

**GREEN — Implementation satisfies when:**
- `schedulePublish` resets (or replaces) the per-document timer on each call, so rapid successive calls collapse into a single publication after the debounce delay.

**REFACTOR notes:** Timer handle should be stored per `doc.uri` so that debounce for one document does not affect another.

---

### TC-UNIT-DIAG-010 — DiagnosticService: call after debounce window expires → new publishDiagnostics emitted

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-004`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('emits a second publication when a call arrives after the debounce window has expired', async () => {
  // arrange
  using fakeTime = new FakeTime();
  const oracle = { unresolvedRefs: () => [] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };
  const doc = { uri: 'file:///vault/note.md', version: 1 };

  const svc = new DiagnosticService(oracle, connection);

  // act — first edit + wait for debounce to fire
  svc.schedulePublish(doc);
  fakeTime.tick(250); // past the ~200 ms window → first publication fires

  // second edit arrives after the window has already expired
  svc.schedulePublish(doc);
  fakeTime.tick(250); // wait again → second publication fires

  // assert
  expect((connection.sendDiagnostics as Mock).mock.calls.length).toBe(2);
});
```

**GREEN — Implementation satisfies when:**
- After the debounce timer fires, a subsequent `schedulePublish` starts a fresh timer leading to a new publication.

---

### TC-UNIT-DIAG-011 — DiagnosticService: lastTouched contains only doc A → only doc A republished, doc B untouched

**Class / Service:** `DiagnosticService`
**Spec file:** `tests/unit/features/diagnostic-service.spec.ts`
**Linked FR:** `FR-DIAG-005`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('republishes only documents listed in lastTouched, leaving others untouched', () => {
  // arrange
  const uriA = 'file:///vault/a.md';
  const uriB = 'file:///vault/b.md';

  const oracle = { unresolvedRefs: () => [] } as unknown as Oracle;
  const connection = { sendDiagnostics: mock(() => {}) };

  const docA = { uri: uriA, version: 1 };
  const docB = { uri: uriB, version: 1 };

  const svc = new DiagnosticService(oracle, connection);

  // act — simulate RefGraph.update returning lastTouched = [uriA]
  svc.onRefGraphUpdate({ lastTouched: [uriA] }, [docA, docB]);

  // assert — sendDiagnostics called once for A, never for B
  const calls = (connection.sendDiagnostics as Mock).mock.calls;
  const publishedUris = calls.map((c: unknown[]) => (c[0] as { uri: string }).uri);
  expect(publishedUris).toContain(uriA);
  expect(publishedUris).not.toContain(uriB);
});
```

**GREEN — Implementation satisfies when:**
- `onRefGraphUpdate` accepts a `lastTouched` set and an open-document list, then schedules publication only for the intersection.
- Documents absent from `lastTouched` receive no `sendDiagnostics` call.

**REFACTOR notes:** `onRefGraphUpdate` may internally call `schedulePublish` for each affected URI; fake-timer interaction should be verified in a combined debounce + lastTouched test if needed.
