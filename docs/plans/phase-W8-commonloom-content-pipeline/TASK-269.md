---
id: "TASK-269"
title: "Parse Markdown and frontmatter"
type: task
status: red
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-268"]
tags: [tickets/task, "phase/W8", website, markdown, frontmatter]
aliases: ["TASK-269"]
---

# Parse Markdown And Frontmatter

> [!INFO] `TASK-269` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `red`

## Description

Implement Commonloom Markdown parsing with frontmatter extraction and full public
Markdown formatting support.

## Work Scope

- Parse CommonMark and GFM syntax, including headings, emphasis, strong text,
  blockquotes, ordered and unordered lists, task lists, tables, code fences,
  inline code, links, images, thematic breaks, and nested blocks.
- Extract frontmatter with `gray-matter`.
- Validate frontmatter through adapter-supplied `zod` schemas.
- Produce heading metadata for ids, labels, levels, and source positions where
  available.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/commonloom/markdown.ts`
- `website/src/content/pipeline/commonloom/frontmatter.ts`
- `website/src/content/pipeline/commonloom/types.ts`
- `website/tests/content-pipeline-markdown.test.ts`

Parser API:

```ts
export interface ParseMarkdownInput<Frontmatter> {
  sourcePath: string;
  markdown: string;
  frontmatterSchema: z.ZodType<Frontmatter>;
}

export interface ParsedMarkdown<Frontmatter> {
  frontmatter: Frontmatter;
  bodyMarkdown: string;
  headings: CommonloomHeading[];
  mdast: Root;
  diagnostics: CommonloomDiagnostic[];
}

export async function parseMarkdown<Frontmatter>(
  input: ParseMarkdownInput<Frontmatter>,
): Promise<ParsedMarkdown<Frontmatter>>;
```

Code fences render as plain escaped code blocks in W8. Syntax highlighting is
deferred; no highlighter dependency is added in this phase.

## Linked Requirements

- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]
- [[../../../website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-markdown.test.ts` | CommonMark and GFM constructs parse and produce heading metadata. |
| `website/tests/content-pipeline-markdown.test.ts` | Invalid frontmatter returns a diagnostic. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Unit tests cover representative CommonMark and GFM constructs.
- [ ] Invalid frontmatter reports a diagnostic instead of crashing generation.
- [ ] Heading extraction supports route anchors and content quality checks.
- [ ] Markdown body output is stable across repeated runs.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing Markdown/frontmatter parser coverage for CommonMark headings,
> GFM tables/task lists, and invalid frontmatter diagnostics. Status: `red`.
