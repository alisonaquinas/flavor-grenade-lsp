---
title: "Phase W7: Website Guide Prose And Article Hubs"
phase: W7
status: complete
tags: [plans, website, prose, articles, navigation]
aliases: [Phase W7, Website Guide Prose, Guide Article Hubs]
updated: 2026-05-09
---

# Phase W7: Website Guide Prose And Article Hubs

| Field | Value |
|---|---|
| Phase | W7 |
| Title | Website Guide Prose And Article Hubs |
| Status | complete |
| Gate | How-to, concept, and advanced article pages build with dropdown navigation, linked hub pages, concrete prose, and asset evidence |
| Depends on | Phase W6 website review polish |

## Objective

Turn the current guide indexes into deeper public documentation. The How-To,
Concepts, and Advanced Usage hubs should route users into focused article pages,
and desktop navigation should provide hover and focus dropdowns for those
article groups.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [requirements/design/index](../../website/docs/requirements/design/index.md) | Add dropdown navigation and article hub behavior |
| [requirements/functional/navigation-and-routing](../../website/docs/requirements/functional/navigation-and-routing.md) | Route dropdowns to section subpage articles |
| [requirements/functional/public-pages](../../website/docs/requirements/functional/public-pages.md) | Publish required how-to, concept, and advanced article routes |
| [requirements/user/how-to](../../website/docs/requirements/user/how-to.md) | Author task-focused how-to articles |
| [requirements/user/concepts](../../website/docs/requirements/user/concepts.md) | Author Karpathy-style concept articles |
| [requirements/user/advanced-usage](../../website/docs/requirements/user/advanced-usage.md) | Author advanced topic articles |

## Scope

### In Scope

- Add desktop hover and focus dropdowns for How-To, Concepts, and Advanced Usage.
- Convert How-To, Concepts, and Advanced Usage hubs from static lists into
  linked article indexes.
- Author each required article with public-facing prose, concrete Markdown or
  vault examples, and at least one appropriate visual or text asset.
- Update typed routes, sitemap, route metadata, related links, and content tests.
- Preserve mobile readability and avoid hiding essential article links behind
  hover-only behavior.
- Use the route inventory in
  [[plans/phase-W7-website-guide-prose/TASK-266]] as the canonical source for
  sitemap, dropdown, hub, and route metadata coverage.

### Out of Scope

- Release/tag publishing changes.
- Major homepage redesign beyond links needed for article routing.
- New extension marketplace screenshots unless existing assets are insufficient.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Navigation | Dropdown menus for article groups |
| How-to prose | Task articles with steps, examples, and expected results |
| Concept prose | Wiki-style concept articles with dense links and examples |
| Advanced prose | Deep topic articles for configuration, indexing, safety, and compatibility |
| Assets | Reused screenshots, Markdown examples, snippets, and diagrams for each article |
| Verification | Website checks, route checks, content checks, and visual smoke |

## Article Copy Standard

Each article ticket owns a `Draft Article Copy` section that can be lifted into
website content during implementation. Draft copy should:

- Use public-facing article headings, not ticket terminology.
- Include concrete Obsidian Vault paths, OFM snippets, tables, or diagrams.
- State expected results and practical failure modes for task articles.
- Keep concept articles short, linked, and useful for LLM maintainers.
- Keep advanced articles conservative about supported behavior and direct LSP
  integration.
- Avoid internal phase, ticket, or planning language in final website prose.

## Acceptance

- How-To desktop nav exposes article links in a hover and focus dropdown.
- Concepts desktop nav exposes concept article links in a hover and focus
  dropdown.
- Advanced Usage desktop nav exposes advanced article links in a hover and
  focus dropdown.
- How-To hub list items link to how-to articles.
- Concepts hub entries link to concept articles.
- Advanced Usage hub sections link to advanced topic articles.
- Every article ticket includes `Draft Article Copy` ready for implementation.
- Every article ticket listed below has prose scope and asset scope implemented.
- Sitemap includes every Phase W7 article route from the TASK-266 canonical
  inventory.
- `website` lint, typecheck, tests, and build pass.
- Docs lint passes for `docs/` and `website/docs/`.

## Gate Verification

```bash
cd website
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Also run repository docs lint:

```bash
markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./docs "docs/**/*.md"
markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./website/docs "website/docs/**/*.md"
```

## Tickets

- [[plans/phase-W7-website-guide-prose/FEAT-040]]
- [[plans/phase-W7-website-guide-prose/TASK-239]]
- [[plans/phase-W7-website-guide-prose/TASK-240]]
- [[plans/phase-W7-website-guide-prose/TASK-241]]
- [[plans/phase-W7-website-guide-prose/TASK-242]]
- [[plans/phase-W7-website-guide-prose/TASK-243]]
- [[plans/phase-W7-website-guide-prose/TASK-244]]
- [[plans/phase-W7-website-guide-prose/TASK-245]]
- [[plans/phase-W7-website-guide-prose/TASK-246]]
- [[plans/phase-W7-website-guide-prose/TASK-247]]
- [[plans/phase-W7-website-guide-prose/TASK-248]]
- [[plans/phase-W7-website-guide-prose/TASK-249]]
- [[plans/phase-W7-website-guide-prose/TASK-250]]
- [[plans/phase-W7-website-guide-prose/TASK-251]]
- [[plans/phase-W7-website-guide-prose/TASK-252]]
- [[plans/phase-W7-website-guide-prose/TASK-253]]
- [[plans/phase-W7-website-guide-prose/TASK-254]]
- [[plans/phase-W7-website-guide-prose/TASK-255]]
- [[plans/phase-W7-website-guide-prose/TASK-256]]
- [[plans/phase-W7-website-guide-prose/TASK-257]]
- [[plans/phase-W7-website-guide-prose/TASK-258]]
- [[plans/phase-W7-website-guide-prose/TASK-259]]
- [[plans/phase-W7-website-guide-prose/TASK-260]]
- [[plans/phase-W7-website-guide-prose/TASK-261]]
- [[plans/phase-W7-website-guide-prose/TASK-262]]
- [[plans/phase-W7-website-guide-prose/TASK-263]]
- [[plans/phase-W7-website-guide-prose/TASK-264]]
- [[plans/phase-W7-website-guide-prose/TASK-265]]
- [[plans/phase-W7-website-guide-prose/TASK-266]]
- [[plans/phase-W7-website-guide-prose/CHORE-094]]

## Related

- [requirements/design/index](../../website/docs/requirements/design/index.md)
- [requirements/functional/navigation-and-routing](../../website/docs/requirements/functional/navigation-and-routing.md)
- [requirements/functional/public-pages](../../website/docs/requirements/functional/public-pages.md)
- [requirements/user/how-to](../../website/docs/requirements/user/how-to.md)
- [requirements/user/concepts](../../website/docs/requirements/user/concepts.md)
- [requirements/user/advanced-usage](../../website/docs/requirements/user/advanced-usage.md)
