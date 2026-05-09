---
id: "TASK-224"
title: "Author how-to advanced usage and FAQ pages"
type: task
status: done
priority: high
phase: W4
parent: "FEAT-037"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-223"]
tags: [tickets/task, "phase/W4", website, docs]
aliases: ["TASK-224"]
---

# Author How-To Advanced Usage And FAQ Pages

> [!INFO] `TASK-224` · Task · Phase W4 · Parent: [[FEAT-037]] · Status: `done`

## Description

Author task pages, advanced usage, and FAQ content for high-intent workflows and
questions.

## Implementation Details

Create and wire:

- `website/src/content/pages.ts`
- `website/src/seo/seo-files.ts`
- `website/src/App.svelte`
- `website/src/styles/global.scss`
- `website/tests/howto-faq-docs.test.ts`

Expected API/content shape:

- `howTo` groups task pages by workflow.
- How-to pages cover VS Code setup, vault configuration, broken links, and safe
  rename with goal, steps, expected result, failure mode, and concept link.
- `advancedUsage` explains configuration, indexing, parser boundaries, safety,
  direct LSP boundaries, and current/planned behavior.
- `faq` exposes direct question/answer sections suitable for FAQPage JSON-LD.

Add RED coverage in `website/tests/howto-faq-docs.test.ts` before content
implementation.

## Definition of Done

- [x] How-to index and initial task pages are published.
- [x] Advanced usage explains configuration, indexing, parser boundaries, and
  editor integration limits.
- [x] FAQ answers comparison and safety questions.
- [x] FAQ and how-to pages have structured metadata.
- [x] Parent feature child row is updated.

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/howto-faq-docs.test.ts` | Unit | `Website.Pages.RequiredSet` | ✅ passing |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> How-to, advanced usage, FAQ source paths, content shape, and RED test target
> were recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/howto-faq-docs.test.ts`, which expects detailed how-to,
> advanced usage, and FAQ content before it exists. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added task-focused how-to, advanced usage, and FAQ content.
> `website/tests/howto-faq-docs.test.ts` passes. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/howto-faq-docs.test.ts`. Definition of Done is satisfied
> locally. Status: `in-review`.

> [!SUCCESS] Done · 2026-05-09
> PR #54 CI passed with the W4 completion gate. Status: `done`.
