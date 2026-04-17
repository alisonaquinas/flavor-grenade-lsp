---
title: Unit Tests — LSP Module
tags: [test/unit, test/tdd, module/lsp]
aliases: [Unit Tests LSP, RequestRouter Tests, CapabilityNegotiator Tests]
---

> [!INFO] LspServer is NOT unit-tested at the stdio level. RequestRouter and CapabilityNegotiator are tested in isolation with mock handlers. No real stdin/stdout is touched in unit tests — that is the integration smoke layer's job.

See [[architecture/layers]] for the module boundary rules that prohibit direct stdio access in unit tests. See [[architecture/overview]] for the full LspModule provider graph. See [[adr/ADR010-tests-directory-structure]] for the spec file layout convention.

---

## RequestRouter

### TC-UNIT-LSP-001 — RequestRouter.dispatch: routes known method to registered handler

**Class / Service:** `RequestRouter`
**Spec file:** `tests/unit/lsp/RequestRouter.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('routes textDocument/hover to the registered HoverService mock and returns its result', async () => {
  const mockHandler = jest.fn().mockResolvedValue({ contents: 'hover text' })
  const router = RequestRouter.create({
    'textDocument/hover': mockHandler,
  })
  const params = { textDocument: { uri: 'file:///vault/note.md' }, position: { line: 0, character: 0 } }

  const result = await router.dispatch('textDocument/hover', params)

  expect(mockHandler).toHaveBeenCalledWith(params)
  expect(result).toEqual({ contents: 'hover text' })
})
```

**GREEN — Implementation satisfies when:**
- `RequestRouter.dispatch` looks up the method string in the registered handler map and calls the matching handler with the supplied params, returning its resolved value

---

### TC-UNIT-LSP-002 — RequestRouter.dispatch: unknown method returns MethodNotFound error

**Class / Service:** `RequestRouter`
**Spec file:** `tests/unit/lsp/RequestRouter.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('returns a JSON-RPC MethodNotFound error (code -32601) for an unregistered method', async () => {
  const router = RequestRouter.create({})

  const result = await router.dispatch('unknownMethod/foo', {})

  expect(result).toMatchObject({
    error: {
      code: -32601,
      message: expect.stringContaining('Method not found'),
    },
  })
})
```

**GREEN — Implementation satisfies when:**
- When no handler is registered for the given method string, `dispatch` returns a JSON-RPC error object with `code: -32601` and a non-empty `message`

---

### TC-UNIT-LSP-003 — RequestRouter.dispatch: handler InvalidParams rejection serialized correctly

**Class / Service:** `RequestRouter`
**Spec file:** `tests/unit/lsp/RequestRouter.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('serializes a handler InvalidParams rejection as a JSON-RPC error with code -32602', async () => {
  const mockHandler = jest.fn().mockRejectedValue(new InvalidParamsError('position is required'))
  const router = RequestRouter.create({
    'textDocument/completion': mockHandler,
  })

  const result = await router.dispatch('textDocument/completion', {})

  expect(result).toMatchObject({
    error: {
      code: -32602,
      message: expect.stringContaining('position is required'),
    },
  })
})
```

**GREEN — Implementation satisfies when:**
- `dispatch` catches handler rejections, inspects the error type, and maps `InvalidParamsError` → code `-32602`; the original error message is preserved in the `message` field

---

### TC-UNIT-LSP-004 — RequestRouter.dispatch: notification (no id) calls handler and returns nothing

**Class / Service:** `RequestRouter`
**Spec file:** `tests/unit/lsp/RequestRouter.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('calls the handler for a notification but returns undefined (fire-and-forget)', async () => {
  const mockHandler = jest.fn().mockResolvedValue(undefined)
  const router = RequestRouter.create({
    'textDocument/didChange': mockHandler,
  })
  const params = { textDocument: { uri: 'file:///vault/note.md', version: 2 }, contentChanges: [] }

  const result = await router.dispatchNotification('textDocument/didChange', params)

  expect(mockHandler).toHaveBeenCalledWith(params)
  expect(result).toBeUndefined()
})
```

**GREEN — Implementation satisfies when:**
- `dispatchNotification` invokes the handler and returns `undefined` regardless of the handler's resolved value — notifications never produce a JSON-RPC response

---

### TC-UNIT-LSP-005 — RequestRouter.dispatch: cancellation notification handled without error

**Class / Service:** `RequestRouter`
**Spec file:** `tests/unit/lsp/RequestRouter.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('handles $/cancelRequest notification without throwing or returning an error object', async () => {
  const router = RequestRouter.create({})

  await expect(
    router.dispatchNotification('$/cancelRequest', { id: 1 }),
  ).resolves.toBeUndefined()
})
```

**GREEN — Implementation satisfies when:**
- `$/cancelRequest` is treated as a built-in no-op notification; the router does not throw and does not emit an error response even though no user-registered handler exists for it

---

## CapabilityNegotiator

### TC-UNIT-LSP-006 — CapabilityNegotiator: default config advertises core capabilities

**Class / Service:** `CapabilityNegotiator`
**Spec file:** `tests/unit/lsp/CapabilityNegotiator.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('default FlavorConfig produces ServerCapabilities with completionProvider, definitionProvider, referencesProvider, renameProvider, and diagnosticProvider', () => {
  const config = FlavorConfig.defaults()
  const negotiator = new CapabilityNegotiator(config)

  const caps = negotiator.buildCapabilities()

  expect(caps.completionProvider).toBeDefined()
  expect(caps.definitionProvider).toBe(true)
  expect(caps.referencesProvider).toBe(true)
  expect(caps.renameProvider).toBe(true)
  expect(caps.diagnosticProvider).toBeDefined()
})
```

**GREEN — Implementation satisfies when:**
- `CapabilityNegotiator.buildCapabilities` reads `FlavorConfig.defaults()` and includes all five core capability keys in the returned `ServerCapabilities` object

---

### TC-UNIT-LSP-007 — CapabilityNegotiator: semanticTokens: false excludes semanticTokensProvider

**Class / Service:** `CapabilityNegotiator`
**Spec file:** `tests/unit/lsp/CapabilityNegotiator.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('omits semanticTokensProvider from capabilities when FlavorConfig.semanticTokens is false', () => {
  const config: FlavorConfig = { ...FlavorConfig.defaults(), semanticTokens: false }
  const negotiator = new CapabilityNegotiator(config)

  const caps = negotiator.buildCapabilities()

  expect(caps.semanticTokensProvider).toBeUndefined()
})
```

**GREEN — Implementation satisfies when:**
- The `semanticTokensProvider` key is absent (not `null`, but truly `undefined` / not present) in the returned object when `config.semanticTokens` is `false`

---

### TC-UNIT-LSP-008 — CapabilityNegotiator: custom callout type adds trigger character

**Class / Service:** `CapabilityNegotiator`
**Spec file:** `tests/unit/lsp/CapabilityNegotiator.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('includes ">" in completionProvider.triggerCharacters when callouts.customTypes is non-empty', () => {
  const config: FlavorConfig = {
    ...FlavorConfig.defaults(),
    callouts: { customTypes: ['admonition'] },
  }
  const negotiator = new CapabilityNegotiator(config)

  const caps = negotiator.buildCapabilities()

  expect(caps.completionProvider?.triggerCharacters).toContain('>')
})
```

**GREEN — Implementation satisfies when:**
- When `config.callouts.customTypes` has at least one entry, `>` is added to `completionProvider.triggerCharacters` to support callout type completion after `> [!`

---

### TC-UNIT-LSP-009 — CapabilityNegotiator: initialize response shape

**Class / Service:** `CapabilityNegotiator`
**Spec file:** `tests/unit/lsp/CapabilityNegotiator.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('buildInitializeResult returns an object with capabilities and serverInfo.name/version fields', () => {
  const config = FlavorConfig.defaults()
  const negotiator = new CapabilityNegotiator(config)

  const result = negotiator.buildInitializeResult()

  expect(result).toHaveProperty('capabilities')
  expect(result.serverInfo).toMatchObject({
    name: expect.any(String),
    version: expect.any(String),
  })
  expect(result.serverInfo.name.length).toBeGreaterThan(0)
  expect(result.serverInfo.version.length).toBeGreaterThan(0)
})
```

**GREEN — Implementation satisfies when:**
- `buildInitializeResult` returns `{ capabilities: ServerCapabilities, serverInfo: { name: string, version: string } }` matching the LSP `InitializeResult` schema

---

## Error Serialization

### TC-UNIT-LSP-010 — Error serialization: VaultNotFoundError maps to InternalError (-32603)

**Class / Service:** `RequestRouter`
**Spec file:** `tests/unit/lsp/error-serialization.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('serializes VaultNotFoundError as JSON-RPC InternalError with code -32603', async () => {
  const mockHandler = jest.fn().mockRejectedValue(new VaultNotFoundError('/missing/vault'))
  const router = RequestRouter.create({
    'workspace/symbol': mockHandler,
  })

  const result = await router.dispatch('workspace/symbol', { query: '' })

  expect(result).toMatchObject({
    error: {
      code: -32603,
      message: expect.stringContaining('/missing/vault'),
    },
  })
})
```

**GREEN — Implementation satisfies when:**
- `VaultNotFoundError` (a domain error) is caught by `dispatch` and serialized as `{ code: -32603, message: <original message> }`; the vault path surfaces in the message to aid debugging

---

### TC-UNIT-LSP-011 — Error serialization: ValidationError maps to InvalidParams (-32602)

**Class / Service:** `RequestRouter`
**Spec file:** `tests/unit/lsp/error-serialization.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**
```typescript
it('serializes ValidationError as JSON-RPC InvalidParams with code -32602', async () => {
  const mockHandler = jest.fn().mockRejectedValue(
    new ValidationError('textDocument.uri is required'),
  )
  const router = RequestRouter.create({
    'textDocument/definition': mockHandler,
  })

  const result = await router.dispatch('textDocument/definition', {})

  expect(result).toMatchObject({
    error: {
      code: -32602,
      message: expect.stringContaining('textDocument.uri is required'),
    },
  })
})
```

**GREEN — Implementation satisfies when:**
- `ValidationError` is mapped to code `-32602` (InvalidParams) and the validation message is preserved verbatim in the `message` field

**REFACTOR notes:** The error-serialization spec may grow a table-driven test once the full domain error taxonomy is settled — parametrize over `[ErrorClass, expectedCode]` pairs rather than writing a separate `it` block per error type.
