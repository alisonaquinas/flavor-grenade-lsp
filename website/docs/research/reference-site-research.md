# Reference Site Research

Observed on 2026-05-09:

- [Alison Aquinas personal site](https://www.alisonaquinas.com/)
- [Alison's LLM Skills Marketplace](https://llm-skills.alisonaquinas.com/)

## Executive Summary

Both sites use a shared warm technical brand: neutral surfaces, dark-mode
support, compact navigation, and a coral-red accent ramp. The personal site is
portfolio-oriented and credibility-heavy. The LLM Skills Marketplace is
documentation/product-oriented and should be the closer model for the Flavor
Grenade homepage.

For Flavor Grenade LSP, reuse the same brand family but bias the implementation
toward the marketplace pattern: static pages, dense internal linking, copyable
commands, feature cards, guide pages, sitemap, RSS or changelog feed, structured
data, and long-tail pages for specific search intents.

## Color Scheme

### Shared Brand Ramp

The two sites share the same warm red/coral accent family:

| Token | Hex | Use |
| --- | --- | --- |
| `brand-50` | `#FFF4EF` | light callout backgrounds |
| `brand-100` | `#FFE4DA` | light hover and subtle badges |
| `brand-200` | `#FFCABA` | light borders and dark text accents |
| `brand-300` | `#FFA58F` | dark-mode accent text |
| `brand-400` | `#FF7C61` | hover borders and decoration |
| `brand-500` | `#F46043` | primary accent |
| `brand-600` | `#DD4C31` | primary link text |
| `brand-700` | `#B73A27` | strong link and border |
| `brand-800` | `#7F2D25` | dark red text |
| `brand-900` | `#4A1D1E` | dark border/background tint |
| `brand-950` | `#281112` | deepest warm dark tint |

### Personal Site Palette

Personal site uses:

- Light base: white backgrounds, warm off-white areas (`#fff8f4`,
  `#fff2ea`), warm border `#ead8cf`.
- Text: black primary, gray body (`#767676`), gray muted (`#999999`).
- Accent: `#F46043`, hover `#DD4C31`, alternate accent text `#D97757`.
- Dark mode: near-black navy `#030712`, warm black `#14100f`, surface
  `#1c1614`, border `#3d302c`, primary text `#f7f1ee`.

### LLM Skills Marketplace Palette

Marketplace uses Tailwind-like neutral classes:

- Light base: `white`, `gray-50`, `stone-50`, `stone-200`, `gray-950`.
- Dark base: `stone-950`, `stone-900`, `gray-900`, `gray-100`.
- Accent links/buttons: `brand-600`, `brand-700`, `brand-800`.
- Dark accent links/buttons: `brand-100`, `brand-200`, `brand-300`.
- Cards: white or `stone-950`, 1px stone border, subtle shadow.

### Flavor Grenade Recommendation

Use the shared warm red/coral ramp for brand continuity, but avoid letting the
page become one-note red. Pair it with neutral grays, code-editor darks, and
small status colors for diagnostics:

- Broken link/error: coral-red brand.
- Completion/navigation: cool blue or cyan accent.
- Tags/indexing: green accent.
- Warnings/config: amber accent.

## Functionality Patterns

### Personal Site

Observed functionality:

- Single-page app shell with left rail navigation.
- Routes for home, about, resume, projects, and project pages.
- Theme toggle with dark-mode support.
- Accessible menu controls and hamburger behavior for small screens.
- Social links and mail link.
- Fallback `noscript` content with headings, navigation, links, image, and
  summary copy.
- Portfolio/project pages are discoverable from both site navigation and
  sitemap.

Use for Flavor Grenade:

- Borrow the clear personal-brand tie-in, project credibility, and dark-mode
  compatibility.
- Do not copy the left-rail portfolio layout for the docs homepage. Flavor
  Grenade needs guide navigation and content scanning more than resume-style
  navigation.

### LLM Skills Marketplace

Observed functionality:

- Sticky top header with logo, main nav, RSS link, theme menu, and mobile nav.
- Homepage that immediately explains the product, audience, install path, and
  bundles.
- Hero image using a concrete terminal/demo visual, not abstract decoration.
- Copy buttons next to install commands.
- Open details accordions for install instructions.
- Bundle cards with versions, descriptions, command snippets, GitHub links,
  download links, and skill counts.
- Dedicated browse page with 329 skill entries and bundle filters.
- Dedicated guide pages for long-tail education and SEO.
- RSS feed for release notes.
- Download-all artifact link.
- Dark mode persisted with `localStorage` and system preference fallback.

Use for Flavor Grenade:

- Make the first screen a docs/product hybrid: what it is, why it matters,
  install or quickstart, and proof features.
- Include copyable install/config commands for VS Code and direct LSP usage.
- Use details sections for "VS Code extension" and "other LSP clients".
- Build browseable feature/concept pages similar to skill pages: diagnostics,
  completions, rename, references, tags, embeds, block refs, and vault index.
- Add an RSS or changelog feed if releases will matter to users.

## SEO Strategy

### Personal Site

Verified SEO elements:

- Canonical URL.
- Title and meta description.
- Meta keywords.
- `robots` set to `index, follow`.
- Language and author metadata.
- Open Graph profile metadata.
- Twitter card metadata.
- Person, WebSite, and ProfilePage JSON-LD.
- Google Analytics tag.
- `robots.txt` allows crawling and points at sitemap.
- Sitemap lists primary routes with priorities and change frequency.
- `noscript` fallback exposes important content to non-JS clients.

### LLM Skills Marketplace

Verified SEO elements:

- Canonical URL.
- Title and meta description.
- Application name, creator, publisher, and keyword metadata.
- `robots` and `googlebot` directives, including large image/snippet preview.
- Open Graph metadata with preview image.
- Twitter `summary_large_image`.
- Organization and WebSite JSON-LD.
- Homepage CollectionPage and ItemList JSON-LD.
- SoftwareApplication schema entries for bundles.
- Sitemap with homepage, browse page, guide pages, bundle pages, and skill
  pages.
- RSS feed for release notes.
- Server-rendered text for the page body, not client-only empty shells.
- Long-tail guide routes, including install and comparison topics.

### Flavor Grenade SEO Recommendations

- Use one canonical homepage: likely
  `https://alisonaquinas.github.io/flavor-grenade-lsp/` or a custom domain if
  chosen.
- Give every page a unique title and description.
- Use product keywords naturally:
  - Obsidian Flavored Markdown language server.
  - Obsidian Markdown LSP.
  - VS Code Obsidian Markdown extension.
  - wiki-link completion.
  - broken link diagnostics.
  - rename Obsidian notes.
  - Markdown references and navigation.
- Add JSON-LD:
  - WebSite for the docs site.
  - SoftwareApplication for Flavor Grenade LSP.
  - FAQPage for FAQ.
  - HowTo for quickstart and task pages.
  - BreadcrumbList for docs hierarchy.
- Generate sitemap and robots.txt.
- Include Open Graph and Twitter preview images.
- Prefer server-rendered or static HTML.
- Add guide pages for long-tail queries, not only feature pages.
- Link to GitHub, extension install docs, releases, and issue reporting.

## Page Model To Borrow

### Homepage

Recommended homepage sections:

- H1: "Flavor Grenade LSP" or "Obsidian Flavored Markdown LSP".
- Direct one-paragraph value statement.
- Concrete screenshot or terminal/editor demo.
- Primary CTA: Quickstart.
- Secondary CTA: VS Code extension guide.
- Feature grid: diagnostics, completions, navigation, rename, references, tags,
  embeds, block refs.
- Install panels with copy buttons.
- "How it works" section explaining vault indexing and OFM parsing.
- Guide links for common tasks.
- FAQ preview.

### Public Docs Wiki

Recommended IA:

- `/quickstart/`
- `/how-to/`
- `/how-to/fix-broken-wiki-links/`
- `/how-to/complete-wiki-links/`
- `/how-to/rename-notes-safely/`
- `/advanced-usage/`
- `/concepts/obsidian-flavored-markdown/`
- `/concepts/vault-index/`
- `/concepts/wiki-link-resolution/`
- `/faq/`

### Visual System

Recommended implementation:

- Light/dark theme toggle.
- Sticky header.
- Docs-first navigation.
- Copyable command blocks.
- Cards for repeated features and guides only.
- 1px neutral borders.
- 8px to 12px radii depending on final system.
- Warm brand accent for links and calls to action.
- Actual editor screenshots or generated demo assets showing OFM behavior.

## Risks

- The personal site is a Vue-style app shell. Flavor Grenade should not depend
  on client rendering for core docs content.
- The marketplace uses many rounded cards. Keep Flavor Grenade slightly more
  utilitarian so it feels like developer documentation, not a marketplace clone.
- Meta keywords are present on both reference sites, but modern search engines
  mostly ignore them. Use them only as a low-cost supplement, not a core SEO
  strategy.
- The shared coral ramp is strong. Use it sparingly with neutral surfaces.

## Source Evidence

- Personal site homepage HTML includes canonical, title, description, keywords,
  robots, author, JSON-LD, Open Graph, Twitter metadata, Google Analytics,
  theme toggle, navigation, and `noscript` content.
- Personal site `robots.txt` allows crawling and points to
  [personal sitemap](https://www.alisonaquinas.com/sitemap.xml).
- Marketplace homepage HTML includes canonical, metadata, Open Graph, Twitter,
  Organization/WebSite JSON-LD, CollectionPage/ItemList JSON-LD,
  SoftwareApplication schema entries, sticky navigation, theme controls,
  install accordions, copy buttons, and bundle cards.
- Marketplace `robots.txt` allows crawling and points to
  [marketplace sitemap](https://llm-skills.alisonaquinas.com/sitemap.xml).
- Marketplace exposes [RSS release notes](https://llm-skills.alisonaquinas.com/rss.xml).
