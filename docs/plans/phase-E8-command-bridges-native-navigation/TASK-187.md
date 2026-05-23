---
id: "TASK-187"
title: "Add OFMarkdown Graph Action Bridges"
type: task
status: done
priority: high
phase: E8
parent: "FEAT-026"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-186"]
tags: [tickets/task, "phase/E8"]
aliases: ["TASK-187"]
---

# Add OFMarkdown Graph Action Bridges

> [!INFO] `TASK-187` - Task - Phase E8 - Parent: [[FEAT-026]] - Status: `done`

## Description

Register the OFMarkdown-native command bridges for embeds, backlinks, outlinks,
vault reveal, and diagnostic copy actions. Each bridge should adapt validated
client-owned payloads into native VS Code commands or APIs.

---

## Implementation Notes

- Register `flavorGrenade.openEmbedTarget`
- Register `flavorGrenade.showBacklinks`
- Register `flavorGrenade.showOutlinks`
- Register `flavorGrenade.revealVaultRoot`
- Register or preserve `flavorGrenade.copyDiagnosticInfo`
- Reuse validation helpers from [[TASK-186]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.GraphActions` | Required graph and diagnostic bridge commands are present | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.PayloadValidation` | Graph action payloads fail safely when invalid | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | OFMarkdown graph bridge commands are registered (planned scenario) (planned scenario) |
| `bdd/features/vscode-extension-parity.feature` | Graph bridge payloads are validated before navigation (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/command-bridges.test.ts` | Unit | `Extension.CommandBridges.GraphActions` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | OFMarkdown graph actions bridge through the VS Code client |

---

## Parent Feature

[[FEAT-026]] - Command Bridges And Native Navigation

---

## Dependencies

**Blocked by:**

- [[TASK-186]] - graph actions should reuse validated payload helpers

**Unblocks:**

- [[TASK-188]] - docs should describe final bridge command contracts

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Failing graph bridge registration tests are written first
- [x] Embed, backlink, outlink, vault reveal, and diagnostic commands exist
- [x] Graph commands call the expected native VS Code surface
- [x] Invalid graph command payloads fail safely
- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [x] [[docs/test/matrix]] and [[docs/test/index]] updated for new coverage

---

## Notes

This task should not add custom graph views. Native command surfaces are enough
for Phase E8.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. See [[docs/requirements/technical/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-026]].

> [!INFO] Red - 2026-05-07
> Added failing OFMarkdown graph command bridge tests in
> `extension/src/command-bridges.test.ts`.

> [!INFO] Green - 2026-05-07
> Registered embed, backlink, outlink, vault reveal, and diagnostic copy bridge
> commands and verified their native adapter behavior.

> [!INFO] In Review - 2026-05-07
> Local phase gate passed and graph action coverage is ready for PR review.

> [!SUCCESS] Done - 2026-05-07
> PR #40 CI passed; OFMarkdown graph action bridge work is complete.
