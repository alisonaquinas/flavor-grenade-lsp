---
id: "TASK-029"
title: "Write TDD integration tests using stdio pipe"
type: task
status: open
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-028"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-029"]
---

# Write TDD integration tests using stdio pipe

> [!INFO] `TASK-029` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Create the integration test suite at `tests/integration/smoke-transport.md` by writing `src/test/integration/transport.test.ts`. The tests spawn the LSP server as a child process, communicate over its stdio pipes using a thin `LspClient` test helper, and assert that the full `initialize` → `initialized` → `shutdown` → `exit` lifecycle completes correctly. A second scenario asserts that an unknown method returns a JSON-RPC `-32601` Method Not Found error. These integration tests constitute the Phase 2 gate.

---

## Implementation Notes

- `LspClient.spawn()` launches the server, wraps its stdio with `StdioReader`/`StdioWriter` logic, and returns a typed client
- `client.initialize(rootUri)` sends `initialize`, waits for the response, then sends `initialized`
- `client.shutdown()` sends `shutdown`, asserts `null` result, sends `exit`, and awaits clean process exit
- Test file path: `src/test/integration/transport.test.ts`
- BDD smoke transport scenario file: `tests/integration/smoke-transport.md`
- See also: [[adr/ADR001-stdio-transport]]

```typescript
// src/test/integration/transport.test.ts
describe('LSP Transport', () => {
  test('initialize → initialized → shutdown → exit', async () => {
    const client = await LspClient.spawn();
    const result = await client.initialize('file:///tmp/test-vault');
    expect(result.capabilities).toBeDefined();
    expect(result.serverInfo?.name).toBe('flavor-grenade-lsp');
    await client.shutdown();
    // Process exits cleanly
  });

  test('unknown method returns Method Not Found error', async () => {
    const client = await LspClient.spawn();
    await client.initialize('file:///tmp/test-vault');
    await expect(client.request('unknown/method', {}))
      .rejects.toMatchObject({ code: -32601 });
  });
});
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Phase 2 gate verification | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `Server completes LSP handshake` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/test/integration/transport.test.ts` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Use stdio with Content-Length framing for LSP transport |

---

## Parent Feature

[[tickets/FEAT-003]] — LSP Transport

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-028]] — Full `LspModule` must be wired before end-to-end tests can run

**Unblocks:**

- Phase 2 gate: `bun run gate:2` requires these tests to pass

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] `bun test src/test/integration/transport.test.ts` passes
- [ ] `bun run gate:2` passes
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-003]] child task row updated to `in-review`

---

## Notes

The `LspClient` helper should time-box all awaits with a reasonable timeout (e.g., 5 seconds) to prevent tests from hanging if the server deadlocks.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-003]].
