# GitHub Pages Website Project Brief

## Purpose

Build a public GitHub Pages website for Flavor Grenade LSP. The site should
explain the language server, the VS Code extension, and the Obsidian Flavored
Markdown workflow in clear search-friendly pages.

The website is a product and documentation surface, not an internal engineering
vault. It should help people decide whether Flavor Grenade fits their note
workflow, then get them from installation to productive use quickly.

## Goals

- Publish a homepage for the project on GitHub Pages.
- Create a Karpathy-style LLM wiki: short linked pages, strong concepts, direct
  explanations, and examples that teach the model of the tool.
- Use that wiki to keep standards high for LLM agents implementing and
  maintaining public docs in this repo.
- Cover the LSP server and the VS Code extension together, while keeping their
  responsibilities distinct.
- Properly credit and link the inspirations behind the project: Andrej
  Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP.
- Optimize for search queries around Obsidian Flavored Markdown, wiki-links,
  Markdown language servers, VS Code Obsidian extensions, diagnostics,
  completions, rename, references, and vault navigation.
- Keep the docs source linted with `markdownlint-obsidian` because this tree is
  allowed to use Obsidian-style documentation conventions.

## Audience

- Obsidian users who want editor intelligence outside Obsidian.
- VS Code users writing in Obsidian Vaults.
- Developers evaluating an LSP for Obsidian Flavored Markdown.
- Plugin and tool authors looking for OFM parsing and resolution behavior.
- Search users asking narrow questions like "VS Code Obsidian wiki-link
  completion" or "Markdown LSP for Obsidian Vaults".

## Content Principles

- Lead with concrete outcomes: broken link diagnostics, wiki-link completion,
  references, rename, document navigation, tag intelligence, and OFM parsing.
- Prefer task pages over abstract feature pages when the user intent is action.
- Use plain language first, protocol and architecture terms second.
- Link concepts densely, wiki-style, so each page answers one question and
  points to the next useful question.
- Include visible attribution for inspiration and prior art where relevant.
- Write requirements and concept pages so LLM agents can maintain a
  Karpathy-style wiki without drifting into vague, generic, or inconsistent
  documentation.
- Avoid internal ticket language, implementation ledger details, and release
  process content unless it helps a public user.
- Write titles and descriptions as search snippets: specific nouns, clear
  verbs, no clever ambiguity.

## Initial Information Architecture

| Page | Intent | Search Targets |
| --- | --- | --- |
| `index.md` | Homepage and project overview | Flavor Grenade LSP, Obsidian Markdown LSP |
| `quickstart.md` | Install and verify the server or extension | install Obsidian Markdown VS Code extension |
| `how-to/index.md` | Task index | Obsidian wiki-link completion, rename Markdown note |
| `how-to/use-vscode-extension.md` | Set up and use the VS Code extension | VS Code Obsidian extension |
| `how-to/configure-vault.md` | Configure workspace and vault behavior | Obsidian vault language server config |
| `how-to/fix-broken-links.md` | Use diagnostics and quick fixes | Obsidian broken wiki links |
| `how-to/rename-notes-safely.md` | Rename files, headings, and references | rename Obsidian note references |
| `advanced-usage.md` | Advanced workflows and integrations | Markdown LSP advanced configuration |
| `faq.md` | High-intent questions and objections | Flavor Grenade FAQ |
| `concepts/index.md` | LLM-wiki concept map | Obsidian Flavored Markdown concepts |
| `concepts/ofm.md` | Explain OFM scope | Obsidian Flavored Markdown |
| `concepts/vault-index.md` | Explain vault-wide indexing | Obsidian vault index |
| `concepts/wiki-link-resolution.md` | Explain link resolution | Obsidian wiki-link resolution |

## Homepage Brief

The homepage should show the product immediately in the first viewport:

- Name: Flavor Grenade LSP.
- Category: language server and VS Code extension for Obsidian Flavored
  Markdown.
- Primary value: editor intelligence for Obsidian Vaults.
- Main proof points: diagnostics, completions, rename, references, navigation,
  tags, embeds, and OFM-aware parsing.
- Primary actions: quickstart, VS Code extension guide, feature overview, GitHub
  repository.
- Attribution links: Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP.

The page should not read like a marketing placeholder. It should be usable as
the entry point into docs.

## Quickstart Page Brief

The quickstart should cover:

- Prerequisites for server and extension users.
- Install path for the VS Code extension.
- Install path for direct LSP server use.
- Minimal vault setup.
- How to confirm the server indexed the workspace.
- First useful actions: complete a wiki-link, hover a link, find references,
  rename a note, see a broken-link diagnostic.
- Troubleshooting links for activation, workspace trust, and binary path
  problems.

## How-To Page Brief

How-to pages should use one task per page. Each page should include:

- User goal.
- When to use it.
- Steps.
- Expected result.
- Common failure mode.
- Link to the deeper concept page.

Initial how-to topics:

- Install and activate the VS Code extension.
- Configure a vault workspace.
- Complete wiki-links and headings.
- Navigate to notes, headings, blocks, embeds, and attachments.
- Find references and document highlights.
- Rename notes and headings safely.
- Fix broken links with diagnostics and code actions.
- Use tags and tag completion.
- Work with OFM callouts, math, comments, frontmatter, and Templater regions.

## Advanced Usage Page Brief

Advanced usage should explain:

- Server configuration model.
- Editor integration beyond VS Code.
- Vault indexing behavior and performance expectations.
- Single-file mode versus vault mode.
- Unsupported URI schemes and vault confinement.
- OFM parser boundaries, including opaque regions.
- CI or scripted diagnostics workflows once supported.
- Extension/server version compatibility.

## FAQ Brief

FAQ should answer:

- What is Flavor Grenade LSP?
- Is this an Obsidian plugin?
- How is it different from Marksman?
- Does it require Obsidian to be installed?
- Does it edit my vault automatically?
- Which Markdown syntax does it understand?
- Does it support embeds, block references, tags, and callouts?
- Can it run in Neovim or other LSP clients?
- How does rename avoid changing external files?
- Why are some links not resolved?
- How do I report a bug with a minimal vault?

## SEO Notes

- Each public page needs one H1, a direct first paragraph, and descriptive link
  text.
- Prefer page titles that include "Obsidian", "Markdown", "LSP", "VS Code",
  or the specific feature when accurate.
- Use examples with realistic vault paths and wiki-links.
- Add metadata when the eventual site generator is chosen.
- Keep canonical public content separate from internal plans in `docs/`.
- Include an attribution or inspiration section with outbound links to
  canonical sources:
  - [Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
  - [Obsidian](https://obsidian.md/)
  - [Marksman LSP](https://github.com/artempyanykh/marksman)

## Open Decisions

- Site generator: plain GitHub Pages, VitePress, Astro, MkDocs, or another
  static generator.
- Visual direction for homepage screenshots and extension demo media.
- Whether `website/docs` is the canonical public docs source or a staging area
  before generated pages move under `website/src`.
- Whether concept pages should use Obsidian wiki-links in source or standard
  Markdown links for generated output.
- URL structure for quickstart, how-to, advanced usage, and FAQ.
