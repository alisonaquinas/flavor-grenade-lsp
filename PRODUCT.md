# Product

## Register

brand

## Users

Flavor Grenade serves Obsidian users, VS Code users, and developer-tool
evaluators who write in Obsidian Vaults and want editor intelligence outside
Obsidian. They are often comparing language tooling while working in a real
workspace, with an Obsidian Vault open and a docs page beside it.

Primary users need to understand what the LSP does, install the VS Code
extension or server, verify that indexing works, and complete a useful workflow
such as wiki-link completion, broken-link diagnosis, reference lookup, or safe
rename.

The VS Code extension is a first-class adoption path. The website must link to
the Marketplace listing and provide clear instructions for installation,
activation, configuration, and troubleshooting.

Secondary users include editor integrators, plugin authors, and tool builders
who need precise information about Obsidian Flavored Markdown parsing, vault
indexing, link resolution, and safety boundaries.

Another important user is an LLM agent implementing or maintaining a
Karpathy-style LLM wiki inside the repo. The site and docs should help that
agent preserve high standards: short linked pages, correct terminology,
consistent metadata, examples grounded in Obsidian Vault behavior, and clear
separation between public docs and internal planning.

## Product Purpose

The website explains Flavor Grenade LSP, a language server and VS Code
extension for Obsidian Flavored Markdown. It exists to turn discovery into
understanding, and understanding into a successful first workflow.

Success means a first-time visitor can answer four questions quickly:

- What is Flavor Grenade LSP?
- Does it help my Obsidian Vault workflow?
- How do I install or evaluate it?
- Where do I go for deeper concepts, how-to pages, and advanced usage?

The site is public product documentation, not an internal planning vault. It
must be search-friendly, link-rich, and useful to both humans and LLM agents.

The site must also be generous about inspiration. It should properly credit and
link Andrej Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP as
influences for the project's public docs, OFM model, and Markdown language
server direction.

## Brand Personality

Warm, mechanical, precise.

The voice should feel technically credible without becoming cold. The site
should sound like a careful field guide for people who maintain living Obsidian
vaults: direct, specific, and quietly opinionated.

Emotionally, it should create confidence and momentum. Visitors should feel
that the tool understands their vault workflow and that setup will be bounded,
observable, and reversible.

## Anti-references

- Generic SaaS landing-page clichés.
- Purple-blue AI gradients and decorative glow effects.
- Abstract hero illustrations that do not show the tool.
- Portfolio-first layouts that hide docs navigation.
- Dense internal planning pages presented as public documentation.
- Endless identical card grids with icon, heading, and paragraph.
- Decorative glassmorphism, blobs, or bokeh backgrounds.
- Terminal cosplay where monospace type replaces actual product evidence.
- Over-promising language that hides unsupported behavior or planned work.

## Design Principles

- Show the tool, not a vibe. Use editor states, command snippets, vault paths,
  wiki-links, diagnostics, and concrete workflows.
- Use the product identity. The site should use the existing Flavor Grenade
  logos and icon assets effectively across the header, hero, social previews,
  and footer.
- Credit the lineage. Public pages should clearly acknowledge Karpathy's LLM
  Wiki concept, Obsidian, and Marksman LSP where their influence is relevant.
- Teach by linking. Pages should be short, named, and densely connected like an
  LLM-readable wiki.
- Raise the floor for LLM-maintained docs. Requirements, design rules, and
  concept pages should make it hard for agents to generate vague, generic, or
  inconsistent Karpathy-style wiki content.
- Make the first useful action obvious. The homepage and quickstart must move
  users toward install, verification, and one successful workflow.
- Separate public value from internal process. Keep phase plans, tickets, and
  implementation ledger language out of user-facing pages.
- Be honest at boundaries. Unsupported URI schemes, vault confinement, planned
  behavior, and extension/server limits must be stated plainly.

## Accessibility & Inclusion

The website must meet WCAG AA for text, controls, focus states, and code blocks
in both light and dark themes. It must support keyboard navigation, a skip link,
reduced motion expectations, no-JS meaningful content, and a theme control with
light, dark, and system modes.

The website must be mobile friendly. Mobile users must be able to navigate,
read docs, inspect examples, copy commands, and reach the VS Code extension
instructions without layout overlap or horizontal page overflow.

The default theme mode is system. Users can force light or dark mode, then
return to system mode. Theme changes must preserve focus and must not cause
layout shift.
