---
id: "TASK-267"
title: "Add Commonloom tooling scaffold"
type: task
status: in-review
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["FEAT-041"]
tags: [tickets/task, "phase/W8", website, tooling]
aliases: ["TASK-267"]
---

# Add Commonloom Tooling Scaffold

> [!INFO] `TASK-267` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `in-review`

## Description

Add the directory and command scaffold for the internal Commonloom compiler
without wiring page rendering yet.

## Work Scope

- Create the internal Commonloom source location under the website workspace.
- Add dependency choices from the W8 research: `unified`, `remark-parse`,
  `remark-gfm`, `remark-rehype`, `rehype-raw`, `rehype-sanitize`,
  `rehype-stringify`, `gray-matter`, `zod`, and `tsx`.
- Add initial command entry points for `content:generate` and `content:check`.
- Keep the Commonloom core isolated from Svelte, route files, and product data.

## Implementation Notes

Create:

- `website/src/content/pipeline/commonloom/index.ts`
- `website/src/content/pipeline/commonloom/compiler.ts`
- `website/src/content/pipeline/commonloom/types.ts`
- `website/scripts/content/generate.ts`
- `website/scripts/content/check.ts`

Modify:

- `website/package.json`
- `website/package-lock.json`

Initial API:

```ts
export interface CommonloomConfig {
  copyRoot: string;
  mediaRoot: string;
  generatedRoot: string;
}

export interface CommonloomResult {
  diagnostics: CommonloomDiagnostic[];
}

export async function compileCommonloom(config: CommonloomConfig): Promise<CommonloomResult>;
```

The scaffold commands must exit `0` when no manifests are configured and print
a clear informational message. Later tasks will replace the stub result with
real manifest input.

## Linked Requirements

- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]
- [[../../../website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-scripts.test.ts` | `content:generate` and `content:check` scripts exist in `website/package.json`. |
| `website/tests/content-pipeline-core.test.ts` | Commonloom scaffold exports `compileCommonloom`. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Website package scripts include `content:generate` and `content:check`.
- [ ] Commonloom source files compile under website TypeScript settings.
- [ ] The scaffold can run and report "no manifests found" or equivalent
  non-destructive diagnostics.
- [ ] No generated files are committed.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for `content:generate`, `content:check`, and the
> Commonloom compiler scaffold. Status: `red`.

> [!SUCCESS] Green · 2026-05-10
> Added Commonloom scaffold modules, content command entry points, package
> scripts, and documented W8 dependency choices. Targeted tests pass. Status:
> `green`.

> [!NOTE] Refactor · 2026-05-10
> Lint found an unused scaffold config parameter. Cleaned the stub without
> changing behavior. Status: `refactor`.

> [!INFO] In review · 2026-05-10
> `npm test -- --run content-pipeline tooling`, `npm run lint`, and
> `npm run typecheck` pass from `website/`. Status: `in-review`.
