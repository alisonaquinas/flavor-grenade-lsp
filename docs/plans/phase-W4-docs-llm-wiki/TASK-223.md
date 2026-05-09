---
id: "TASK-223"
title: "Author quickstart and VS Code extension pages"
type: task
status: in-review
priority: high
phase: W4
parent: "FEAT-037"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-036"]
tags: [tickets/task, "phase/W4", website, docs]
aliases: ["TASK-223"]
---

# Author Quickstart And VS Code Extension Pages

> [!INFO] `TASK-223` · Task · Phase W4 · Parent: [[FEAT-037]] · Status: `in-review`

## Description

Author public quickstart and VS Code extension setup pages that get users from
install to first verified OFMarkdown workflow.

## Implementation Details

Create and wire:

- `website/src/content/pages.ts`
- `website/src/App.svelte`
- `website/src/styles/global.scss`
- `website/tests/quickstart-docs.test.ts`

Expected API/content shape:

- `websitePages` has detailed `quickstart` and `howToVsCodeExtension` records.
- `quickstart` covers prerequisites, Marketplace install, Obsidian Vault open,
  OFMarkdown activation, first workflow verification, and troubleshooting.
- `howToVsCodeExtension` covers install, activation, vault open, verification,
  and the extension/server distinction.

Add RED coverage in `website/tests/quickstart-docs.test.ts` before content
implementation.

## Definition of Done

- [x] Quickstart lists prerequisites.
- [x] Quickstart links to Visual Studio Marketplace.
- [x] VS Code page explains install, activation, vault open, and verification.
- [x] First useful workflows include completion, navigation, references,
  rename, and broken-link diagnostics.
- [x] Troubleshooting links are present.
- [x] Parent feature child row is updated.

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/quickstart-docs.test.ts` | Unit | `Website.VSCodeExtension.InstallInstructions` | ✅ passing |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Quickstart/VS Code source paths, expected content shape, and RED test target
> were recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/quickstart-docs.test.ts`, which expects detailed
> quickstart and VS Code extension setup content before it exists. Status:
> `red`.

> [!SUCCESS] Green · 2026-05-09
> Added detailed quickstart and VS Code extension setup content plus the first
> docs-page renderer. `website/tests/quickstart-docs.test.ts` passes. Status:
> `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/quickstart-docs.test.ts`. Definition of Done is satisfied
> locally. Status: `in-review`.
