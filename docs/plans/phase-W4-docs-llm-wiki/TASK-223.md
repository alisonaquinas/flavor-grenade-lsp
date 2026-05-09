---
id: "TASK-223"
title: "Author quickstart and VS Code extension pages"
type: task
status: open
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

> [!INFO] `TASK-223` · Task · Phase W4 · Parent: [[FEAT-037]] · Status: `open`

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

- [ ] Quickstart lists prerequisites.
- [ ] Quickstart links to Visual Studio Marketplace.
- [ ] VS Code page explains install, activation, vault open, and verification.
- [ ] First useful workflows include completion, navigation, references,
  rename, and broken-link diagnostics.
- [ ] Troubleshooting links are present.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Quickstart/VS Code source paths, expected content shape, and RED test target
> were recorded before implementation.
