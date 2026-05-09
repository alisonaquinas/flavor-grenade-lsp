# Concepts User Requirements

## User Need

Users and LLM agents must be able to learn the mental model of Flavor Grenade
through short, linked concept pages.

## Required Experience

Concept pages must form a Karpathy-style LLM wiki: compact pages with strong
terms, direct explanations, examples, and dense internal links. They must also
give LLM agents enough structure to implement and maintain the repo's public
docs at a high standard.

## Acceptance Criteria

- The concept index maps the core vocabulary of the tool.
- The concept index entries link to concept subpage articles instead of
  remaining static bullets.
- The "For LLM maintainers" section presents a linked list of relevant concept
  articles for generated-docs maintenance, not one static paragraph.
- Each concept page answers one question.
- Concept pages prefer concrete examples over abstract claims.
- Concept pages link densely to related concepts and how-to pages.
- Initial concept pages cover:
  - inspiration and prior art
  - Obsidian Flavored Markdown
  - vault index
  - wiki-link resolution
  - DocId and vault-relative paths
  - opaque regions
  - diagnostics
  - completions
  - rename safety
  - references and navigation
  - tags and embeds
- Concept pages distinguish LSP server behavior from VS Code extension behavior.
- Concept pages are public-facing and do not depend on internal phase plans.
- Concept pages give LLM agents stable terms, examples, and cross-links to
  preserve quality across future generated or maintained docs.
- Concept pages credit and link canonical inspiration sources:
  - [Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
  - [Obsidian](https://obsidian.md/)
  - [Marksman LSP](https://github.com/artempyanykh/marksman)
- The desktop Concepts navigation item provides a hover and focus dropdown
  linking to the concept subpage articles.

## Follow-On Pages

- [[how-to]]
- [[advanced-usage]]
- [[faq]]
