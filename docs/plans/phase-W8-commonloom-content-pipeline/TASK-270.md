---
id: "TASK-270"
title: "Sanitize HTML and source trace content"
type: task
status: in-review
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-269"]
tags: [tickets/task, "phase/W8", website, html, diagnostics]
aliases: ["TASK-270"]
---

# Sanitize HTML And Source Trace Content

> [!INFO] `TASK-270` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `in-review`

## Description

Allow useful inline HTML in Markdown while enforcing the documented sanitized
allowlist and preserving source trace data for generated records.

## Work Scope

- Enable inline HTML parsing through the unified/rehype pipeline.
- Apply the approved `rehype-sanitize` schema.
- Reject or strip disallowed tags and attributes with diagnostics.
- Record source Markdown path, manifest path, content hash, headings, links,
  image references, and line numbers where available.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/commonloom/html.ts`
- `website/src/content/pipeline/commonloom/hash.ts`
- `website/src/content/pipeline/commonloom/source-trace.ts`
- `website/tests/content-pipeline-html.test.ts`

HTML API:

```ts
export interface RenderHtmlInput {
  parsed: ParsedMarkdown<unknown>;
  allowHtml: boolean;
}

export interface RenderHtmlResult {
  bodyHtml: string;
  diagnostics: CommonloomDiagnostic[];
}

export async function renderMarkdownHtml(input: RenderHtmlInput): Promise<RenderHtmlResult>;
```

Inline HTML is allowed only through the project sanitizer schema. Unsafe tags
and attributes must produce `HTML_UNSAFE` diagnostics and must not reach
`bodyHtml`.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-html.test.ts` | Allowed inline HTML survives sanitization. |
| `website/tests/content-pipeline-html.test.ts` | Scriptable or unsafe HTML produces diagnostics and is removed. |
| `website/tests/content-pipeline-html.test.ts` | Source traces include content hash and best-effort source positions. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Allowed inline HTML renders in generated `bodyHtml`.
- [x] Unsafe HTML cannot reach generated renderer input.
- [x] Diagnostics identify the file and element that caused sanitization failure.
- [x] Generated records include source trace metadata needed for audits and
  content debugging.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for safe inline HTML, unsafe HTML diagnostics, and
> stable source-trace content hashes. Status: `red`.

> [!SUCCESS] Green implementation · 2026-05-10
> Added `renderMarkdownHtml`, source hashing, and source trace helpers. Verified
> with `npm test -- --run content-pipeline`, `npm run lint`, and
> `npm run typecheck`. Status: `green`.
