# Website Design Requirements

## Purpose

This design specification defines the UI/UX, layout, and look/feel for the
Flavor Grenade public website. It applies to the GitHub Pages homepage, docs
pages, feature pages, quickstart, how-to content, concepts wiki, advanced usage,
and FAQ.

Root design context lives in:

- `PRODUCT.md`: strategic product, audience, personality, anti-references, and
  design principles.
- `DESIGN.md`: visual design system seed, tokens, components, and named rules.

This document turns those root context files into website-specific
requirements.

## Register

The website uses a brand-documentation register:

- Brand enough to make Flavor Grenade memorable and distinct.
- Documentation enough to keep setup, examples, and technical decisions easy to
  scan.
- Developer-tool enough to show real editor behavior instead of decorative
  abstraction.

The design must not feel like a generic SaaS landing page. It must feel like a
sharp, warm, technically credible documentation site for people who write and
maintain Obsidian Vaults.

## Creative North Star

The website uses the north star from `DESIGN.md`: "The Vault Field Guide".

That means every major design choice should feel like a careful technical field
guide for Obsidian Vault work:

- exact enough for commands and diagnostics
- warm enough for long-form reading
- concrete enough to show real product behavior
- linked enough for humans and LLM agents to follow the knowledge graph
- strict enough to keep LLM-maintained Karpathy wiki pages consistent,
  concrete, and useful
- generous enough to visibly credit the inspirations behind the project:
  Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP
- compact enough to remain usable on mobile devices without hiding core setup
  instructions

## Physical Scene

A VS Code user is comparing Markdown language tooling in a quiet work session,
with docs on one side and a real vault on the other. The site should feel calm
in light mode, comfortable in dark mode, and precise enough for command copying,
examples, and troubleshooting.

## Design Principles

- Show the product immediately: name, category, value, and next action must be
  visible in the first viewport.
- Prefer concrete tool evidence: editor screenshots, code snippets, vault paths,
  wiki-links, diagnostics, and command examples.
- Use space as structure. Group related controls tightly and separate sections
  generously.
- Avoid endless identical card grids. Use cards for distinct features, guide
  entries, and repeated entities only.
- Keep content scannable. Every section should answer a user question.
- Keep public docs separate from internal project planning language.
- Use warm brand continuity from Alison Aquinas and LLM Skills Marketplace, but
  make Flavor Grenade its own product surface.
- Honor the `PRODUCT.md` anti-references by name. The design must reject generic
  SaaS landing-page clichés, purple-blue AI gradients, abstract hero
  illustrations, decorative glassmorphism, and endless identical card grids.
- Treat attribution as part of the user experience. Inspiration links must be
  visible, descriptive, and integrated into the homepage, concepts, or footer.
- Treat creator credit as part of the user experience. The footer must include
  a compact byline similar to Alison's LLM Skills Marketplace, including
  "Vibe-coded by: Alison Aquinas" and links to Alison's public profiles.
- Treat product identity as part of the user experience. Existing Flavor
  Grenade logo and icon assets must appear intentionally in the header, hero,
  social preview, or footer.

## Information Architecture

The primary navigation must expose:

- Home
- Quickstart
- How-To
- Concepts
- Advanced Usage
- FAQ
- GitHub

Secondary navigation may expose:

- VS Code extension
- Visual Studio Marketplace
- Feature overview
- Troubleshooting
- Releases or changelog

Docs pages must support breadcrumb context or a visible section marker so users
never lose their place.

## Page Templates

| Template | Purpose | Required Elements |
| --- | --- | --- |
| Homepage | Explain product and route users. | Hero, primary CTAs, product demo visual, feature overview, install paths, docs links. |
| Quickstart | Get users to first success. | Prerequisites, install path, copyable commands, verification, first workflows. |
| How-to | Complete one task. | Goal, when to use, steps, expected result, common failure, concept link. |
| Concept | Teach one mental model. | Definition, why it matters, example, related concepts, related tasks. |
| Advanced | Explain deep behavior. | Configuration, integration boundaries, safety model, current vs planned behavior. |
| FAQ | Answer objections. | Direct questions, direct answers, links to next steps. |

## Visual Direction

Use a restrained but opinionated developer-docs look:

- Warm neutral surfaces.
- Coral-red accent ramp from the reference sites.
- Dark mode with warm black surfaces, not pure black.
- Light mode with warm off-white sections, not pure white.
- Real editor or terminal imagery.
- Solid color emphasis, never gradient text.
- Subtle borders and shadows only when they clarify grouping.

The site should feel like a technical field guide: exact, approachable, and a
little punchy.

## Color Requirements

Use tokenized color values in implementation. `DESIGN.md` frontmatter is the
seed token source. OKLCH may be used in SCSS implementation, but public design
docs should keep the token names and roles stable.

### Brand Accent Ramp

| Token | Reference Hex | Intended Role |
| --- | --- | --- |
| `brand-50` | `#FFF4EF` | pale accent wash |
| `brand-100` | `#FFE4DA` | subtle badge and hover |
| `brand-200` | `#FFCABA` | accent border |
| `brand-300` | `#FFA58F` | dark-mode accent text |
| `brand-400` | `#FF7C61` | hover border and decoration |
| `brand-500` | `#F46043` | core accent |
| `brand-600` | `#DD4C31` | light-mode link |
| `brand-700` | `#B73A27` | strong action and border |
| `brand-800` | `#7F2D25` | deep accent text |
| `brand-900` | `#4A1D1E` | dark accent surface |
| `brand-950` | `#281112` | deepest accent surface |

### Semantic Colors

Flavor Grenade needs secondary semantic roles so the palette does not become
one-note coral:

- Diagnostics and broken links: brand red/coral.
- Completion and navigation: cool cyan or blue.
- Tags and indexing: green.
- Warnings and configuration: amber.
- Neutral docs chrome: warm gray/stone.

### Color Bans

- Do not use pure `#000` or pure `#fff`.
- Do not use gradient text.
- Do not rely on color alone for status.
- Do not make every section a variation of coral.
- Do not use side-stripe borders thicker than 1px as card accents.

### Named Color Rules

- **The Coral Rarity Rule:** Coral calls attention to actions, links, and
  diagnostics. It must not flood every surface.
- **The No Pure Neutral Rule:** Pure black and pure white are prohibited.
- **The Status Has Shape Rule:** Status colors must pair with labels, icons, or
  text.

## Theme Requirements

The site must support:

- System default.
- Manual light mode.
- Manual dark mode.
- Return to system mode.

Light mode:

- Warm off-white page background.
- Slightly warmer section backgrounds.
- Dark neutral text with coral links.
- Clear code block contrast.

Dark mode:

- Warm near-black background.
- Tinted dark surfaces.
- Soft coral accents.
- Slightly increased line-height for long reading passages.

Theme transition must avoid flashes and must not shift layout.

## Typography Requirements

The typography should be technical, warm, and opinionated. Avoid defaulting to
training-data dev-tool fonts as the final choice.

Brand voice words:

- warm
- mechanical
- precise

Requirements:

- Use one committed sans family or one sans plus one restrained display family.
- Avoid reflex defaults such as Inter, Roboto, Open Sans, IBM Plex, Space Mono,
  and Space Grotesk unless a later design decision explicitly justifies them.
- Body text must be at least `1rem`.
- Body line length must stay between 65 and 75 characters for long-form docs.
- Headings must use a clear scale with at least a 1.25 ratio between major
  steps.
- Display headings may use fluid `clamp()` sizing.
- Body text should use fixed `rem` sizing.
- Use uppercase only for short labels.
- Load only the font weights used by the site.

Named rules:

- **The Manual Page Rule:** Body copy must read comfortably before it looks
  clever.
- **The No Costume Mono Rule:** Monospace is for code, commands, and literal
  Markdown examples, not brand personality.

## Layout Requirements

The layout must support documentation scanning and product discovery.

Homepage:

- First viewport contains H1, value statement, primary CTA, secondary CTA, and
  product signal.
- A hint of the next section must be visible on mobile and desktop.
- Hero visual must show the actual product state: editor, terminal, diagnostics,
  wiki-link completion, or vault navigation.
- Hero or header must use the existing product logo or icon without crowding
  the product name.
- Feature overview must avoid identical icon-card monotony. Mix compact rows,
  bento blocks, screenshots, and short examples.

Docs pages:

- Use a readable content column.
- Provide local navigation for page groups.
- Keep command and code examples visually stable.
- Use accordions only for progressive detail, not for essential setup steps.
- Avoid nested cards.

Spacing:

- Use a named spacing scale.
- Related controls: tight gaps.
- Sections: generous separation.
- Use `gap` for sibling spacing.
- Use `clamp()` for section spacing on marketing/content pages.

Named rule:

- **The Tonal First Rule:** Use background, border, and spacing before shadow.
  If a shadow is the only thing separating two surfaces, the layout is
  underbuilt.

## Component Requirements

Required components:

- Sticky header with desktop navigation.
- Mobile navigation menu.
- Theme mode control: light, dark, system.
- Skip link.
- Product logo or icon component.
- Hero product demo.
- Copyable command block.
- Feature preview module.
- Guide list.
- Concept link list.
- FAQ item.
- Breadcrumb or page-group marker.
- Inspiration / attribution link group.
- Callout.
- Code block.
- Footer with GitHub, docs links, project metadata, creator byline, and public
  profile links.
- Visual Studio Marketplace link.

Components must expose accessible names and keyboard states where interactive.

## Interaction Requirements

- Copy buttons must preserve selectable command text.
- Copy feedback must be visible and announced accessibly.
- Menus and accordions must be keyboard usable.
- Theme changes must preserve focus.
- Hover styles must have equivalent focus styles.
- Motion must be subtle and purposeful.
- Do not animate layout properties.
- Use easing that feels quick and settled, not bouncy.

## Content Design Requirements

Copy must be direct and concrete:

- Use user outcomes as headings when appropriate.
- Prefer "Fix broken wiki-links" over "Diagnostics".
- Prefer "Rename notes safely" over "Rename support".
- Avoid filler and repeated section intros.
- Avoid internal ticket names, phase names, and implementation ledger language.
- Use realistic examples:
  - `notes/Project Ideas.md`
  - `[[Project Ideas]]`
  - `[[Project Ideas#Next steps]]`
  - `![[diagram.png]]`

Do not use em dashes in public-facing website copy.

## Accessibility Requirements

- Meet WCAG AA contrast for normal text, large text, links, controls, and code.
- All interactive controls must be keyboard reachable.
- Focus states must be visible in both themes.
- Screenshots must include useful alt text.
- Product demo visuals must not be the only source of critical information.
- Page content must remain meaningful without JavaScript.
- Text must reflow at mobile widths and browser zoom.

## SEO And Metadata Requirements

Every page must support the SEO requirements in [[../user/seo-discovery]].

Design must make SEO content visible and useful rather than hiding it in
metadata only:

- H1 and first paragraph must answer the page's search intent.
- Internal links must use descriptive text.
- FAQ and how-to pages must be structured for snippet extraction.
- Breadcrumbs must support both users and structured data.
- Screenshots and diagrams must have descriptive alt text.
- Attribution links must use descriptive names, not generic "source" or "here"
  links.

## Responsive Requirements

Mobile:

- Navigation collapses into a menu.
- CTAs stack cleanly.
- Code blocks scroll horizontally without page overflow.
- Text never overlaps controls.
- Hero visual remains inspectable.
- Product logo remains recognizable without consuming excessive vertical space.
- VS Code extension setup remains reachable from the main navigation or primary
  content.

Tablet:

- Docs navigation may become inline or side-adjacent depending on space.
- Feature modules may shift from stacked to two-column.

Desktop:

- Content must not stretch beyond comfortable reading width.
- Hero and product demo can use asymmetric layout.
- Sticky header must not consume excessive vertical space.

## Design Bans

- Gradient text.
- Decorative glassmorphism.
- Thick colored side-stripe card borders.
- Nested cards.
- Hero metric template.
- Identical card grids as the dominant page structure.
- Centered-stack hero with generic icon, title, subtitle, and card grid.
- Pure black or pure white surfaces.
- Decorative blobs, orbs, or bokeh backgrounds.
- Modals for first-run setup or core docs navigation.

## Verification Checklist

- First viewport communicates product, category, value, and next action.
- Light, dark, and system theme modes work without layout shift.
- The visual hierarchy is clear with a squint test.
- Long-form docs stay within 65 to 75 characters per line.
- Feature modules are not all identical cards.
- Copyable commands are selectable and accessible.
- Mobile layout has no text overlap.
- Metadata and visible content match the target search intent.
- The site still communicates core value without JavaScript.
