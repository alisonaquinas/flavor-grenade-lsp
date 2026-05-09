# SEO And Discovery User Requirements

## User Need

Users searching for Obsidian Markdown, wiki-link, vault, VS Code, and LSP
workflows must be able to discover relevant public pages.

## Required Experience

The website must use search-friendly content structure and metadata. It must
target both broad product queries and narrow long-tail workflow queries.

## Acceptance Criteria

- Every public page has one H1, a unique title, and a unique description.
- Every public page uses descriptive internal link text.
- The site provides a canonical URL strategy.
- The site provides `robots.txt` and `sitemap.xml`.
- The homepage includes Open Graph and Twitter preview metadata.
- Pages use product keywords naturally:
  - Obsidian Flavored Markdown language server
  - Obsidian Markdown LSP
  - VS Code Obsidian Markdown extension
  - wiki-link completion
  - broken link diagnostics
  - rename Obsidian notes
  - Markdown references and navigation
- The site includes long-tail how-to pages for common search intents.
- The site uses JSON-LD where useful:
  - WebSite
  - SoftwareApplication
  - FAQPage
  - HowTo
  - BreadcrumbList
- The site links to GitHub, releases, issue reporting, quickstart, and
  extension guidance.
- The site links to
  [Flavor Grenade LSP on the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp)
  from relevant install and extension pages.
- The site includes descriptive outbound links to inspiration and prior art:
  Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP.
- Pages avoid internal ticket names as public search headings.

## Follow-On Pages

- [[homepage]]
- [[quickstart]]
- [[how-to]]
- [[faq]]
