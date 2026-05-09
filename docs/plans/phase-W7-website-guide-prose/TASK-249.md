---
id: "TASK-249"
title: "Concept Article: Inspiration and Prior Art"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-249"]
---

# Concept Article: Inspiration And Prior Art

> [!INFO] `TASK-249` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Text Scope

- Explain the Karpathy LLM Wiki inspiration and why predictable, linked concept
  pages help humans and LLM maintainers keep implementation knowledge coherent.
- Credit Obsidian for the Obsidian Vault workflow and Marksman LSP for Markdown
  language-server inspiration.
- State that credits identify lineage and prior art, not affiliation or
  endorsement.

## Asset Scope

- Include outbound links to Karpathy's LLM Wiki concept, Obsidian, and Marksman.
- Include a short "inspired by" link list suitable for reuse from the footer.

## Draft Article Copy

### Why does this site use short linked concept pages?

Flavor Grenade LSP uses a public concept wiki because language-server behavior is easier to maintain when the important nouns have one stable home. A wiki page should answer one question, define one idea, show one concrete example, and link to the next idea instead of restating the whole system.

Compact definition: this concept set is a Karpathy-inspired LLM wiki for Obsidian-aware Markdown tooling. It is not a private planning ledger. It is the public vocabulary that humans, maintainers, and LLM-assisted edits can reuse when discussing vault indexes, DocIds, wiki-link resolution, diagnostics, completions, rename safety, and navigation.

The format is inspired by [Andrej Karpathy's LLM Wiki concept](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): compact pages, dense internal links, examples over ceremony, and prose that gives an LLM enough stable context to avoid inventing new terms. The domain is inspired by [Obsidian](https://obsidian.md/), especially the way an Obsidian Vault turns Markdown files into a local knowledge graph. The language-server lineage is informed by [Marksman](https://github.com/artempyanykh/marksman), an important Markdown LSP project and prior-art reference for Markdown editor intelligence.

These credits identify lineage and prior art only. Flavor Grenade LSP is not affiliated with Karpathy, Obsidian, or Marksman, and these links do not imply endorsement by them.

Concrete OFM example:

```markdown
# Project Plan

This note links to [[Vault Index]], embeds ![[diagrams/resolution.png]],
and tags related work as #docs/concepts.
```

On a long docs site, the paragraph above could easily grow into repeated explanations of "vault index", "embed", and "tag". The concept wiki keeps those terms linkable. The article that explains `[[Vault Index]]` owns the definition. The guide that teaches broken-link repair can link back to it.

For maintainers: when adding or editing public docs, prefer an existing concept title over a near-synonym. Use "DocId" instead of "document key", "vault-relative path" instead of "local path" when that is the invariant, and "wiki-link resolution" instead of "link lookup" when the resolver behavior matters. This keeps generated prose and hand-written prose aligned.

Related-link intent: link this page from the Concepts hub, FAQ credit section, and any page that explains why the site is shaped like a small wiki. Its outgoing links should point to Obsidian Flavored Markdown, Vault Index, Wiki-link Resolution, and the external inspiration list.

Inspired by:

- [Karpathy's LLM Wiki concept](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Obsidian](https://obsidian.md/)
- [Marksman LSP](https://github.com/artempyanykh/marksman)

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Credits are clear, accurate, and non-implying of endorsement.
- [ ] Article explains why public concept pages matter for LLM maintenance.
- [ ] Route metadata, sitemap, and tests include the article.
