---
id: "TASK-268"
title: "Define Commonloom core contracts"
type: task
status: red
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-267"]
tags: [tickets/task, "phase/W8", website, commonloom, types]
aliases: ["TASK-268"]
---

# Define Commonloom Core Contracts

> [!INFO] `TASK-268` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `red`

## Description

Define the reusable data contracts that separate Commonloom from the website
adapter.

## Work Scope

- Define compiler input types for copy roots, media roots, manifest entries,
  HTML policy, link policy, and output mode.
- Define output types for compiled documents, rendered HTML, headings,
  frontmatter, content hashes, diagnostics, links, images, and source traces.
- Define diagnostic severity and stable diagnostic codes.
- Keep route ids and page-group enums in the website adapter, not in Commonloom.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/commonloom/types.ts`
- `website/src/content/pipeline/commonloom/diagnostics.ts`
- `website/tests/content-pipeline-core.test.ts`

Core API shapes:

```ts
export type CommonloomSeverity = "error" | "warning" | "info";

export type CommonloomDiagnosticCode =
  | "COPY_NOT_FOUND"
  | "FRONTMATTER_INVALID"
  | "MARKDOWN_INVALID"
  | "HTML_UNSAFE"
  | "LINK_UNRESOLVED"
  | "MEDIA_UNRESOLVED"
  | "MEDIA_ALT_MISSING"
  | "PATH_OUTSIDE_ROOT";

export interface CommonloomDiagnostic {
  code: CommonloomDiagnosticCode;
  severity: CommonloomSeverity;
  message: string;
  sourcePath?: string;
  line?: number;
  column?: number;
}

export interface CommonloomSourceTrace {
  markdownPath: string;
  manifestPath?: string;
  contentHash: string;
  headings: CommonloomHeading[];
  links: CommonloomLinkReference[];
  images: CommonloomImageReference[];
}
```

Source line and column values are best-effort when unified positional data is
available. `markdownPath`, `contentHash`, and reference arrays are mandatory.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-core.test.ts` | Diagnostic codes and source trace fields are stable exported types. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Contract tests prove Commonloom accepts only adapter-supplied data.
- [ ] Type names and fields match the ADR and architecture terminology.
- [ ] Diagnostics carry enough source information for actionable author errors.
- [ ] Core contracts do not import from website route or Svelte modules.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for stable diagnostic codes, severities, and
> `CommonloomSourceTrace`. Status: `red`.
