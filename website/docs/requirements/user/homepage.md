# Homepage User Requirements

## User Need

Users must understand what Flavor Grenade LSP is within the first viewport and
choose a useful next action without reading internal documentation.

## Required Experience

The homepage must present Flavor Grenade LSP as a language server and VS Code
extension for Obsidian Flavored Markdown. It must explain the practical value:
editor intelligence for Obsidian Vaults, including diagnostics,
completions, rename, references, navigation, tags, embeds, and OFM-aware
parsing.

The page must feel like the start of the product docs, not a placeholder
marketing page.

## Acceptance Criteria

- The first viewport identifies the product name: Flavor Grenade LSP.
- The first viewport states the category: Obsidian Flavored Markdown language
  server and VS Code extension.
- The first viewport links to quickstart, VS Code extension guidance, feature
  overview, and the GitHub repository.
- The first viewport or primary CTA area links to
  [Flavor Grenade LSP on the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp).
- Primary CTA links include recognizable icons that reinforce Quickstart,
  Marketplace, and GitHub actions.
- Primary CTA links use equal widths when stacked on narrow viewports.
- On narrow mobile viewports, the long hero category label can be hidden when
  it makes the first viewport feel crowded or visually out of place.
- The homepage includes a concrete screenshot, terminal demo, or editor demo
  visual.
- The homepage screenshot or product proof visual loads without a broken-image
  indicator.
- The homepage uses the existing Flavor Grenade logo or icon as a meaningful
  product identity element.
- The homepage includes a compact feature grid for diagnostics, completions,
  navigation, rename, references, tags, embeds, and block references.
- Homepage feature cards are selectable and reveal deeper practical detail
  about how Markdown linting, LSP indexing, diagnostics, completions, and safe
  edits work in real Obsidian Vault documents.
- On desktop, selecting a homepage feature card can update a shared detail
  panel below the row.
- On mobile, selecting a homepage feature card expands that card inline with
  its practical detail so users do not lose the card context.
- Homepage feature cards use consistent default borders so the section feels
  cohesive; selected and focused states may provide a shared visual accent.
- The homepage explains that the tool is OFM-aware and vault-aware.
- The homepage includes visible inspiration links to Karpathy's LLM Wiki
  concept, Obsidian, and Marksman LSP.
- The homepage footer includes a compact creator byline similar to Alison's LLM
  Skills Marketplace, including "Vibe-coded by: Alison Aquinas" and links to
  Alison's website, GitHub, and LinkedIn.
- The homepage links to public docs pages, not internal engineering plans.
- The homepage has one H1, a unique title, a unique description, canonical
  metadata, and social preview metadata.

## Follow-On Pages

- [[quickstart]]
- [[how-to]]
- [[concepts]]
- [[faq]]
