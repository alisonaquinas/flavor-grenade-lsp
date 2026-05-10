---
id: "TASK-271"
title: "Validate links, wiki-links, and media references"
type: task
status: in-review
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-269", "TASK-270"]
tags: [tickets/task, "phase/W8", website, links, media]
aliases: ["TASK-271"]
---

# Validate Links, Wiki-links, And Media References

> [!INFO] `TASK-271` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `in-review`

## Description

Validate local Markdown links, images, and allowed wiki-link references before
the generated TypeScript is written.

## Work Scope

- Classify external URLs, same-document anchors, root-relative links,
  copy-relative links, media references, and wiki-links.
- Resolve local images through `website/src/content/media`.
- Let the website adapter resolve wiki-links only when they map to public routes.
- Fail diagnostics for missing images, unsafe paths, unsupported URI schemes,
  unresolved local links, and unresolvable public wiki-links.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/commonloom/links.ts`
- `website/src/content/pipeline/commonloom/media.ts`
- `website/src/content/pipeline/commonloom/paths.ts`
- `website/tests/content-pipeline-links-media.test.ts`

Resolver API:

```ts
export interface CommonloomLinkPolicy {
  resolvePublicRoute(target: string): string | null;
  resolveWikiLink(target: string): string | null;
}

export function classifyLinkTarget(rawTarget: string): CommonloomLinkReference;

export function validateMediaReference(
  reference: CommonloomImageReference,
  mediaRoot: string,
): CommonloomDiagnostic[];
```

Path confinement uses resolved absolute paths and verifies every resolved copy,
media, and generated path remains inside its approved root.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-links-media.test.ts` | Missing media files produce diagnostics. |
| `website/tests/content-pipeline-links-media.test.ts` | Traversal and unsupported URI schemes fail validation. |
| `website/tests/content-pipeline-links-media.test.ts` | Wiki-links resolve only through the adapter callback. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Valid Markdown image syntax generates a tracked image reference.
- [x] Missing image files fail `content:check`.
- [x] External HTTP and HTTPS links are preserved without local filesystem
  resolution.
- [x] Unsafe or unsupported link targets fail with actionable diagnostics.
- [x] Wiki-links do not become a hidden dependency on the LSP vault resolver.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for Markdown link/image extraction, adapter-owned
> wiki-link resolution, media existence checks, path traversal rejection, and
> required alt text. Status: `red`.

> [!SUCCESS] Green implementation · 2026-05-10
> Added Commonloom link extraction, adapter-owned wiki-link resolution, path
> confinement, and media validation helpers. Verified with `npm test -- --run
> content-pipeline-links-media`, `npm run lint`, and `npm run typecheck`.
> Status: `green`.
