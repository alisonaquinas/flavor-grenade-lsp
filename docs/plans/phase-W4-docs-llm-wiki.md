---
title: "Phase W4: Documentation Pages And LLM Wiki"
phase: W4
status: complete
tags: [plans, website, docs, llm-wiki]
aliases: [Phase W4, Website Docs Wiki]
updated: 2026-05-09
---

# Phase W4: Documentation Pages And LLM Wiki

| Field | Value |
|---|---|
| Phase | W4 |
| Title | Documentation Pages And LLM Wiki |
| Status | complete |
| Gate | Quickstart, how-to, advanced usage, FAQ, and concept wiki pages build and pass content checks |
| Depends on | Phase W3 |

## Objective

Author and wire the public documentation pages promised by the project brief:
quickstart, VS Code extension setup, how-to pages, advanced usage, FAQ, and a
Karpathy-style LLM wiki for core concepts.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [requirements/user/quickstart](../../website/docs/requirements/user/quickstart.md) | Publish install and first-success guidance |
| [requirements/user/how-to](../../website/docs/requirements/user/how-to.md) | Publish task-focused how-to pages |
| [requirements/user/advanced-usage](../../website/docs/requirements/user/advanced-usage.md) | Publish advanced workflows and boundaries |
| [requirements/user/faq](../../website/docs/requirements/user/faq.md) | Publish high-intent answers |
| [requirements/functional/llm-wiki-standards](../../website/docs/requirements/functional/llm-wiki-standards.md) | Keep concept pages short, linked, and precise |
| [requirements/functional/vscode-extension](../../website/docs/requirements/functional/vscode-extension.md) | Make VS Code extension install path first-class |

## Scope

### In Scope

- Quickstart page.
- VS Code extension how-to page.
- How-to index and initial task pages.
- Advanced usage page.
- FAQ page.
- Concept index and initial concept pages.
- Internal docs links and related-page navigation.

### Out of Scope

- Full search index.
- Analytics.
- Non-VS Code editor setup pages beyond explicit advanced-usage boundaries.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Quickstart | Install, verify, and first workflow page |
| How-to | Task-oriented docs pages |
| Concepts | LLM-wiki concept map and focused concept pages |
| FAQ | Direct support and comparison answers |

## Acceptance

- Public docs cover quickstart, how-to, advanced usage, FAQ, and concepts.
- VS Code Marketplace link and extension instructions are reachable from
  quickstart and relevant docs pages.
- Concept pages follow LLM-wiki standards.
- Required attribution links remain visible.
- Content and link validation tests pass.

## Gate Verification

```bash
cd website
npm test
npm run build
```

```bash
bun run lint:docs
```

## Tickets

- [[docs/plans/phase-W4-docs-llm-wiki/FEAT-037]]
- [[docs/plans/phase-W4-docs-llm-wiki/TASK-223]]
- [[docs/plans/phase-W4-docs-llm-wiki/TASK-224]]
- [[docs/plans/phase-W4-docs-llm-wiki/TASK-225]]
- [[docs/plans/phase-W4-docs-llm-wiki/CHORE-090]]

## Related

- [project-brief](../../website/docs/project-brief.md)
- [requirements/functional/llm-wiki-standards](../../website/docs/requirements/functional/llm-wiki-standards.md)
