---
title: Integration Smoke Test Plans — Index
tags: [test/integration, test/smoke, test/index]
aliases: [Integration Test Index, Smoke Test Index]
---

# Integration Smoke Test Plans — Index

> [!INFO] Smoke tests are minimal end-to-end checks — happy path plus one critical failure case per capability area. They exercise the running LSP server over JSON-RPC stdio and assert protocol-level correctness. Each plan includes both a **scripted** path (Gherkin scenario) and an **agent-driven** path (LLM agent spawns the server with Bash and pipes requests).

Each file covers one capability area. Phase gate indicates the earliest phase at which the server must support that capability.

---

## Smoke Plan Catalog

| File | Capability | TC-SMOKE IDs | # Tests | Phase Gate |
|---|---|---|---|---|
| [[tests/integration/smoke-transport]] | LSP JSON-RPC Handshake | 001 – 002 | 2 | Phase 1 |
| [[tests/integration/smoke-vault-detection]] | Vault Root Detection | 003 – 004 | 2 | Phase 1 |
| [[tests/integration/smoke-wiki-links]] | Wiki-Link Round-Trip | 005 – 006 | 2 | Phase 2 |
| [[tests/integration/smoke-embeds]] | Embed Round-Trip | 007 – 008 | 2 | Phase 2 |
| [[tests/integration/smoke-diagnostics]] | Diagnostic Publishing | 009 – 010 | 2 | Phase 2 |
| [[tests/integration/smoke-completions]] | Completion Trigger | 011 – 012 | 2 | Phase 2 |
| [[tests/integration/smoke-navigation]] | Go-to-Definition and Find-References | 013 – 014 | 2 | Phase 3 |
| [[tests/integration/smoke-rename]] | Rename Heading | 015 – 016 | 2 | Phase 3 |
| [[tests/integration/smoke-tags]] | Tag Indexing | 017 – 018 | 2 | Phase 2 |
| [[tests/integration/smoke-block-references]] | Block Anchor and FG005 | 019 – 020 | 2 | Phase 2 |

**Total test cases:** 20 (2 per plan × 10 plans)

---

## ID Scheme

`TC-SMOKE-NNN` — sequential, assigned in the order plans were authored.

---

## Coverage by Phase

| Phase | Capability Areas | TC-SMOKE IDs |
|---|---|---|
| Phase 1 | Transport, Vault Detection | 001 – 004 |
| Phase 2 | Wiki-Links, Embeds, Diagnostics, Completions, Tags, Block References | 005 – 012, 017 – 020 |
| Phase 3 | Navigation, Rename | 013 – 016 |

---

## Related Indexes

- [[tests/verification/index]] — FR-level verification plans (TC-VER-*)
- [[tests/validation/index]] — User-level validation plans (TC-VAL-*)
- [[test/matrix]] — Pass/fail tracking for all test files
- [[test/index]] — Master list of all test files in the suite

---

## Running Smoke Tests

> [!NOTE] Phase 0 (current): No `src/` implementation exists. All agent-driven smoke tests will fail at the server-spawn step. This is expected. Smoke plans document the target behaviour, not current state.

**Scripted path** (when implementation exists):

```bash
bun test tests/integration/
```

**Agent-driven path:** Each smoke plan's agent-driven section provides the exact numbered procedure. The agent must:

1. Spawn the server: `bun run start 2>/dev/null &`
2. Pipe a JSON-RPC request via stdin
3. Assert the response payload matches the expected shape
4. Send `shutdown` + `exit` to tear down cleanly
