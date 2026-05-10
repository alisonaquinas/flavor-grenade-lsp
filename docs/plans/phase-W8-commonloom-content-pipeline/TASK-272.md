---
id: "TASK-272"
title: "Add website adapter and typed manifests"
type: task
status: in-review
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-268", "TASK-271"]
tags: [tickets/task, "phase/W8", website, manifests]
aliases: ["TASK-272"]
---

# Add Website Adapter And Typed Manifests

> [!INFO] `TASK-272` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `in-review`

## Description

Implement the website-specific adapter that maps page-group manifests to
Commonloom inputs.

## Work Scope

- Define one typed manifest per page group.
- Validate manifest route ids, page groups, copy paths, expected frontmatter,
  and generated output names.
- Keep page-group and route-id authority in the website adapter.
- Add sample manifests for the first migrated content group.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/website/manifest.ts`
- `website/src/content/pipeline/website/route-registry.ts`
- `website/src/content/manifests.ts`
- `website/src/content/quickstart.manifest.ts`
- `website/tests/content-pipeline-manifest.test.ts`

Manifest API:

```ts
export type WebsitePageGroup =
  | "home"
  | "quickstart"
  | "how-to"
  | "concepts"
  | "advanced"
  | "faq";

export interface PageManifestEntry {
  routeId: RouteId;
  group: WebsitePageGroup;
  copy: string;
  order?: number;
  output: "pages" | "routes" | "navigation";
}

export interface PageGroupManifest {
  group: WebsitePageGroup;
  manifestPath: string;
  entries: PageManifestEntry[];
}
```

Manifest loading is explicit through `website/src/content/manifests.ts`. The
generator does not dynamically scan arbitrary TypeScript files.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-manifest.test.ts` | Duplicate route ids fail manifest validation. |
| `website/tests/content-pipeline-manifest.test.ts` | Manifests are loaded only through the explicit registry. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Manifest authors write TypeScript data, not generated output.
- [x] Duplicate ids and copy paths fail validation.
- [x] Invalid route ids fail before Svelte typecheck.
- [x] Commonloom remains reusable because website-specific route concepts stay
  outside the core.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for explicit manifest registry loading, duplicate
> route/copy validation, unknown route ids, page-group mismatches, and copy path
> confinement. Status: `red`.

> [!SUCCESS] Green implementation · 2026-05-10
> Added website-only manifest types, explicit manifest registry, route registry
> helpers, and the first quickstart page-group manifest. Verified with `npm
> test -- --run content-pipeline-manifest`, `npm run lint`, and `npm run
> typecheck`. Status: `green`.
