---
id: "FEAT-026"
title: "Command Bridges And Native Navigation"
type: feature
status: done
priority: high
phase: E8
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-025"]
tags: [tickets/feature, "phase/E8"]
aliases: ["FEAT-026"]
---

# Command Bridges And Native Navigation

> [!INFO] `FEAT-026` - Feature - Phase E8 - Priority: `high` - Status: `done`

## Goal

Vault authors can use native VS Code reference and navigation UI for
server-provided OFMarkdown locations. References, links, embeds, backlinks,
outlinks, vault reveal, and diagnostics actions feel like editor commands while
language intelligence remains server-owned.

---

## Scope

**In scope:**

- Register `flavorGrenade.showReferences`
- Register `flavorGrenade.followLink`
- Register `flavorGrenade.openEmbedTarget`
- Register `flavorGrenade.showBacklinks`
- Register `flavorGrenade.showOutlinks`
- Register `flavorGrenade.revealVaultRoot`
- Register or preserve `flavorGrenade.copyDiagnosticInfo`
- Validate JSON-serializable payloads before VS Code API calls

**Out of scope (explicitly excluded):**

- Custom graph panels, tree views, or activity-bar views
- Server-side imports of VS Code APIs or client-owned types
- Marketplace screenshots and packaged asset work

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.UseNativeVSCodeActions` | Use familiar VS Code UI for server-provided navigation | [[docs/requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.NativeUI` | Server locations invoke native VS Code UI commands | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.PayloadValidation` | Bridge payloads are validated before VS Code API calls | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Required graph and diagnostic bridge commands are registered | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for command bridges |

---

## Phase Plan Reference

- Phase plan: [[docs/plans/phase-E8-command-bridges-native-navigation]]
- Execution ledger row: [[docs/plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Valid reference payloads call `editor.action.showReferences`
- [x] Valid link payloads call native VS Code location navigation
- [x] Embed, backlink, outlink, vault reveal, and diagnostic commands exist
- [x] Invalid payloads fail safely without uncaught extension-host exceptions
- [x] Payload contracts remain JSON-serializable and client-owned
- [x] Command contribution names match registered command names
- [x] Phase gate commands pass under `extension/`
- [x] [[docs/test/matrix]] and [[docs/test/index]] reflect new coverage

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-185]] | Register Native Reference And Link Bridges | `done` |
| [[TASK-186]] | Validate Command Bridge Payloads | `done` |
| [[TASK-187]] | Add OFMarkdown Graph Action Bridges | `done` |
| [[TASK-188]] | Document Command Bridge Contracts | `done` |
| [[CHORE-063]] | Phase E8 Lint Sweep | `done` |
| [[CHORE-064]] | Phase E8 Test Trace Sweep | `done` |
| [[CHORE-065]] | Phase E8 Documentation Trace Sweep | `done` |

---

## Dependencies

**Blocked by:**

- [[FEAT-025]] - command bridges should build on precise activation behavior

**Unblocks:**

- Later extension-host regression and status UX phases

---

## Notes

This feature follows the command bridge slice in
[[docs/research/marksman-vscode-feature-parity-ofmarkdown]] and
`extension/docs/plans/vscode-extension-parity.md`.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[docs/templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to
> complete the spec and create all child `TASK-NNN` tickets before transitioning
> to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E8 execution started on branch `codex/phase-e8-command-bridges`.

> [!INFO] Green - 2026-05-07
> Command bridge implementation and docs reached local green state:
> `cd extension && npm run check-types`, `cd extension && npm test`, and
> `cd extension && npm run build:extension` passed.

> [!INFO] In Review - 2026-05-07
> Full local gate passed: `bun run lint`, `bun run typecheck`,
> `bun run build`, `bun test`, `bun run format:check`, docs markdown lint,
> non-doc markdown lint, extension typecheck/test/build, and extension
> `npm audit --audit-level=low`.

> [!SUCCESS] Done - 2026-05-07
> PR #40 CI passed. Phase E8 completed with command bridge registration,
> native adapter coverage, payload validation, docs, and traceability updates.

## Retrospective

### What changed

- Added JSON-serializable command bridge payload contracts and validation.
- Registered native reference, link, embed, backlink, outlink, vault reveal,
  and diagnostic copy bridge commands.
- Added extension unit coverage through an injected VS Code facade so bridge
  logic can run without an extension host.
- Documented the bridge contracts in extension-facing docs.

### Follow-up

- Phase E9 should exercise these command bridges in a real VS Code extension
  host and verify the native command integrations against VS Code APIs.
