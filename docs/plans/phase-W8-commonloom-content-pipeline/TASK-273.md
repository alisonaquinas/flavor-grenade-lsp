---
id: "TASK-273"
title: "Generate TypeScript content records"
type: task
status: red
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-272"]
tags: [tickets/task, "phase/W8", website, generated-typescript]
aliases: ["TASK-273"]
---

# Generate TypeScript Content Records

> [!INFO] `TASK-273` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `red`

## Description

Emit deterministic generated TypeScript modules for the website renderer.

## Work Scope

- Write `website/src/content/generated/*.generated.ts` from manifest groups.
- Export typed records compatible with existing page contracts.
- Include sanitized `bodyHtml`, metadata, headings, links, images, and source
  trace data.
- Preserve generated JSON only as optional diagnostics or audit output, not as
  the renderer input.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/website/emitter.ts`
- `website/src/content/pipeline/website/adapter.ts`
- `website/src/content/generated/index.generated.ts`
- `website/src/content/generated/routes.generated.ts`
- `website/src/content/generated/pages.generated.ts`
- `website/src/content/generated/navigation.generated.ts`
- `website/src/content/generated/media.generated.ts`
- `website/tests/content-pipeline-generated-ts.test.ts`

Emitter API:

```ts
export interface WebsiteGeneratedModules {
  routes: string;
  pages: string;
  navigation: string;
  media: string;
  index: string;
}

export function emitWebsiteGeneratedModules(
  records: WebsiteCompiledContent,
): WebsiteGeneratedModules;
```

Generated modules must include a header pointing authors to Markdown copy and
manifests. JSON output is allowed only for diagnostics or audit artifacts.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-generated-ts.test.ts` | Generated TypeScript modules are deterministic and include a generated-file header. |
| `website/tests/content-pipeline-generated-ts.test.ts` | Generated JSON is not the renderer input. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Generated TypeScript imports cleanly from existing page code.
- [ ] Output is stable across repeated generation.
- [ ] Generated modules include a "do not edit" banner.
- [ ] Generated files are reproducible from Markdown and manifests alone.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for deterministic generated TypeScript module strings,
> generated-file headers, stable re-exports, and excluding generated JSON from
> renderer inputs. Status: `red`.
