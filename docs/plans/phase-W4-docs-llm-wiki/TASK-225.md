---
id: "TASK-225"
title: "Author concept wiki pages and related navigation"
type: task
status: done
priority: high
phase: W4
parent: "FEAT-037"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-223"]
tags: [tickets/task, "phase/W4", website, llm-wiki]
aliases: ["TASK-225"]
---

# Author Concept Wiki Pages And Related Navigation

> [!INFO] `TASK-225` · Task · Phase W4 · Parent: [[FEAT-037]] · Status: `done`

## Description

Author the first Karpathy-style concept wiki pages and connect them to task
pages with related links.

## Implementation Details

Create and wire:

- `website/src/content/pages.ts`
- `website/src/content/wiki.ts`
- `website/src/App.svelte`
- `website/src/styles/global.scss`
- `website/tests/concept-wiki.test.ts`

Expected API/content shape:

- Concept records include a focused question, short direct answer, concrete OFM
  example, related task links, and adjacent concept links.
- Initial concepts cover Obsidian Flavored Markdown, vault index, wiki-link
  resolution, DocId/vault-relative paths, opaque regions, diagnostics,
  completions, rename safety, references/navigation, tags, and embeds.
- Public concept content credits Karpathy's LLM Wiki concept, Obsidian, and
  Marksman LSP without implying affiliation.

Add RED coverage in `website/tests/concept-wiki.test.ts` before content
implementation.

## Definition of Done

- [x] Concept index is published.
- [x] OFM, vault index, and wiki-link resolution concept pages are published.
- [x] Concept pages each answer one focused question.
- [x] Concept pages include realistic OFMarkdown examples.
- [x] Concepts link to related tasks and adjacent concepts.
- [x] Parent feature child row is updated.

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/concept-wiki.test.ts` | Unit | `Website.LLMWiki.PageShape` | ✅ passing |

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Concept wiki source paths, expected concept API, attribution requirements, and
> RED test target were recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/concept-wiki.test.ts`, which expects a dedicated concept
> wiki registry and validation before they exist. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added the concept wiki registry, validation, attribution source links, and
> concept-index content. `website/tests/concept-wiki.test.ts` passes. Status:
> `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/concept-wiki.test.ts`. Definition of Done is satisfied
> locally. Status: `in-review`.

> [!SUCCESS] Done · 2026-05-09
> PR #54 CI passed with the W4 completion gate. Status: `done`.
