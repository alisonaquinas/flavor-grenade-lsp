---
id: "TASK-277"
title: "Compile generated page records from Markdown"
type: task
status: red
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-273", "TASK-274", "TASK-275"]
tags: [tickets/task, "phase/W8", website, generated-typescript, markdown]
aliases: ["TASK-277"]
---

# Compile Generated Page Records From Markdown

> [!INFO] `TASK-277` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `red`

## Description

Replace the current compatibility generator input with a real Markdown and
manifest compilation path. Generated page records must be built from
`website/src/content/copy`, page-group manifests, route metadata, and
Commonloom outputs, not from the old hand-authored `websitePages` body records.

## Work Scope

- Read every manifest entry from `website/src/content/manifests.ts`.
- Load the referenced Markdown file under `website/src/content/copy`.
- Validate frontmatter through the website page schema.
- Render sanitized `bodyHtml` from Markdown.
- Extract headings, links, images, and source traces from the parsed document.
- Generate compatibility `sections` only as derived output, not as source data.
- Remove `websitePages` as an input to `buildWebsiteCompiledContent`.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/website/build.ts`
- `website/src/content/pipeline/website/frontmatter.ts`
- `website/src/content/pipeline/website/sections.ts`
- `website/src/content/pipeline/website/content-compiler.ts`
- `website/tests/content-pipeline-generated-from-markdown.test.ts`
- `website/tests/content-pipeline-parity.test.ts`

Expected compiler shape:

```ts
export async function compileWebsiteContentFromManifests(): Promise<WebsiteContentBuildResult>;
```

Route metadata may still come from `website/src/content/routes.ts` in W8, but
page body content, summaries, headings, links, images, and source traces must
come from Markdown/frontmatter plus manifests.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-generated-from-markdown.test.ts` | Changing Markdown copy changes generated page output. |
| `website/tests/content-pipeline-generated-from-markdown.test.ts` | Generator does not import `websitePages` as source data. |
| `website/tests/content-pipeline-parity.test.ts` | Existing public routes still expose expected summaries and article links. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Generated page body records are compiled from Markdown and manifests.
- [ ] `websitePages` is no longer an input to the generated content builder.
- [ ] Compatibility sections are derived from generated content or removed from
  renderer inputs in the same change set.
- [ ] `content:generate`, `content:check`, `npm test`, and `npm run build`
  prove Markdown is the page body source of truth.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket added after PR #63 review preparation identified that generated modules
> are emitted and validated, but page body generation still depends on the old
> compatibility `websitePages` source data.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage proving generated page output must change when
> Markdown changes, and that the builder must not import old `websitePages`
> source data. Status: `red`.
