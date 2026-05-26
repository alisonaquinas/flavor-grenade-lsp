---
name: Flavor Grenade LSP Website
description: Public product documentation for an Obsidian Flavored Markdown language server and VS Code extension.
colors:
  brand-50: "#FFF2F6"
  brand-100: "#FFE1EA"
  brand-200: "#FFC1D2"
  brand-300: "#FF91AC"
  brand-400: "#FF536E"
  brand-500: "#F72549"
  brand-600: "#D91B4D"
  brand-700: "#A91457"
  brand-800: "#6F164F"
  brand-900: "#3E1239"
  brand-950: "#1F0B24"
  grenade-red: "#FF243D"
  shell-magenta: "#D92D83"
  fuse-purple: "#7B1FA2"
  deep-plum: "#2A0D3A"
  ink-black: "#0B0B0D"
  graphite: "#2F3033"
  metal: "#8B8F98"
  spark-yellow: "#FFE85A"
  enamel-highlight: "#FFF7F1"
  light-bg: "#FFF7FA"
  light-surface: "#FFFCF9"
  light-surface-subtle: "#FFEAF1"
  light-border: "#E7C9D6"
  light-text: "#171016"
  light-text-muted: "#74616B"
  dark-bg: "#08060B"
  dark-bg-warm: "#160B16"
  dark-surface: "#211020"
  dark-surface-subtle: "#32132F"
  dark-border: "#4C2945"
  dark-text: "#FFF3F6"
  dark-text-muted: "#CDB8C4"
  diagnostic: "#FF243D"
  completion: "#7B1FA2"
  tag: "#D92D83"
  warning: "#D6A600"
typography:
  display:
    fontFamily: "Recursive, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 5.25rem)"
    fontWeight: 750
    lineHeight: 0.95
    letterSpacing: "normal"
  headline:
    fontFamily: "Recursive, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  title:
    fontFamily: "Recursive, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Recursive, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  section: "clamp(3rem, 8vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.brand-600}"
    textColor: "{colors.light-surface}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.brand-50}"
    textColor: "{colors.brand-800}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  code-block:
    backgroundColor: "{colors.light-surface-subtle}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.md}"
    padding: "1rem"
---

# Design System: Flavor Grenade LSP Website

## 1. Overview

Creative north star: "The Vault Field Guide".

The Flavor Grenade website is a warm technical field guide for people who live
in Obsidian Vaults. It should feel built from real editor states, careful
examples, and compact explanations rather than decorative product marketing.

The system takes its color direction from the Flavor Grenade mark: red casing,
berry-magenta transitions, ultraviolet shadow, black enamel outlines, graphite
hardware, and tiny yellow-white glints. It must still stand apart through strong
product evidence: wiki-links, vault paths, diagnostics, code actions, and
copyable setup commands. The visual tone is precise, grounded, and a little
punchy. The brand strategy is restrained field-guide with volatile accents:
quiet surfaces do the reading work, the grenade ramp marks action and identity,
and product evidence carries the drama.

It explicitly rejects generic SaaS landing-page clichés, purple-blue AI
gradients, abstract hero illustrations, glassmorphism, and endless identical
card grids.

The site should include visible, respectful attribution for three inspirations:
Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP. Attribution should feel
like part of the documentation lineage, not a legal footnote hidden from users.

The existing Flavor Grenade logo and icon assets should anchor the product
identity in the header, hero, footer, and social preview materials. Product
screenshots from the VS Code extension should be used as real evidence where
they help users understand the tool.

The footer should echo the simple creator-credit pattern from Alison's LLM
Skills Marketplace: project metadata, a "Vibe-coded by: Alison Aquinas" byline,
and compact links to Alison's website, GitHub, and LinkedIn.

**Key Characteristics:**

- Warm technical surfaces.
- Concrete editor evidence.
- Short linked explanations.
- Visible attribution for inspiration and prior art.
- Creator byline and public profile links in the footer.
- High standards for LLM-maintained Karpathy wiki pages.
- Strong light and dark theme parity.
- Mobile-friendly layouts that keep docs and commands usable.
- Copyable, inspectable command and Markdown examples.

## 2. Colors

The palette echoes the logo through controlled shade families: explosive red,
berry magenta, deep plum, enamel black, graphite metal, and small yellow-white
sparks. It should feel tied to the product mark without turning the interface
into an illustration.

### Primary

- **Grenade Red** (`brand-500`, `grenade-red`): The main accent for primary
  actions, destructive diagnostics, selected states, and high-energy identity.
- **Berry Fuse** (`brand-600`, `shell-magenta`): The default light-mode link,
  secondary action, and active navigation color.
- **Deep Plum** (`brand-800`, `deep-plum`): Strong emphasis, pressed states,
  dark-mode panels, and dramatic section contrast.

### Secondary

- **Fuse Purple** (`fuse-purple`): Completion, navigation, and editor
  intelligence affordances when red would be too urgent.
- **Graphite Metal** (`graphite`, `metal`): Shell hardware, dividers,
  secondary chrome, and inactive controls.
- **Spark Yellow** (`spark-yellow`, `warning`): Warnings, setup notes, hover
  glints, and tiny attention cues. Use sparingly.
- **Enamel Highlight** (`enamel-highlight`): Soft highlight fill for badges,
  selected code lines, and small areas that need logo-like shine without pure
  white.

### Neutral

- **Blush Paper** (`light-bg`): Light-mode page background with a faint red
  cast.
- **Enamel Surface** (`light-surface`): Cards, command areas, and top-level
  surfaces.
- **Soft Flare** (`light-surface-subtle`): Code block and quiet callout
  backgrounds.
- **Ink Enamel** (`light-text`): Light-mode primary text.
- **Black Pin** (`dark-bg`, `ink-black`): Dark-mode page background inspired by
  the logo outline.
- **Plum Night** (`dark-bg-warm`): Dark-mode section background.
- **Charred Plum** (`dark-surface`): Dark-mode card and navigation surface.
- **Highlight Text** (`dark-text`): Dark-mode primary text.

### Named Rules

**The Grenade Heat Rule.** Red and magenta are product heat, not wallpaper.
They should call attention to actions, links, selected states, and diagnostics,
not flood every surface.

**The Purple Shadow Rule.** Purple belongs in shadows, dark surfaces,
completion affordances, and gradients inside controlled assets. It must not
become a generic AI gradient or the dominant page wash.

**The Spark Rule.** Yellow and enamel highlights are small reflective moments:
warning icons, hover glints, selected badges, and logo-adjacent details. They
must stay rare enough to feel intentional.

**The No Pure Neutral Rule.** Pure black and pure white are prohibited. Every
surface and text neutral must carry a small warm tint.

**The Status Has Shape Rule.** Status colors must pair with labels, icons, or
text. Color alone is never the only signal.

## 3. Typography

**Display Font:** Recursive, with Atkinson Hyperlegible Next and system fallback
**Body Font:** Atkinson Hyperlegible Next, with system fallback
**Label/Mono Font:** Recursive for labels and UI chrome; use a real monospace
only for code, commands, and literal Markdown

**Character:** Type should feel like a well-made technical manual, warm enough
for long reading and sharp enough for API-style specificity. Avoid default
developer-font reflexes unless they are deliberately justified.

Recursive gives the site a variable, technical, slightly mechanical display
voice without falling into terminal costume. Atkinson Hyperlegible Next gives
docs, examples, and dense quickstart text a readable body face with strong
character distinction.

### Hierarchy

- **Display** (750, `clamp(2.5rem, 7vw, 5.25rem)`, 0.95): Homepage H1 and rare
  campaign-scale moments.
- **Headline** (700, `clamp(1.75rem, 4vw, 3rem)`, 1.1): Major page and section
  headings.
- **Title** (650, `1.25rem`, 1.25): Feature modules, guide entries, and
  component headings.
- **Body** (400, `1rem`, 1.65): Long-form docs, capped at 65 to 75 characters
  per line.
- **Label** (650, `0.8125rem`, 0.04em): Short navigation labels, badges, and
  metadata only.

### Named Rules

**The Manual Page Rule.** Body copy must read comfortably before it looks
clever. Display personality belongs in headings, labels, and structural
moments.

**The No Costume Mono Rule.** Monospace is for code, commands, and literal
Markdown examples. It must not be used as lazy shorthand for "developer".

## 4. Elevation

The system is flat by default and uses tonal layering first. Shadows are allowed
only for sticky navigation, lifted interactive elements, and product demo
surfaces where depth improves orientation.

### Shadow Vocabulary

- **Ambient Lift** (`0 8px 30px rgba(40, 17, 18, 0.10)`): Hoverable feature
  previews and product demo containers.
- **Sticky Header** (`0 1px 0 rgba(61, 48, 44, 0.24)`): Header separation from
  page content.

### Named Rules

**The Tonal First Rule.** Use background, border, and spacing before shadow.
If a shadow is the only thing separating two surfaces, the layout is underbuilt.

## 5. Components

### Buttons

- **Shape:** gently squared technical corners (8px).
- **Primary:** coral background with warm paper text, compact padding, and
  semibold label typography.
- **Secondary:** pale coral surface with deep coral text and a subtle border.
- **Hover / Focus:** border or tone shift plus visible focus ring. Never rely
  on color alone.

### Chips

- **Style:** small rounded labels for feature category, status, or guide type.
- **State:** selected chips use tonal fill plus text change; unselected chips
  remain flat.

### Cards / Containers

- **Corner Style:** 8px to 12px depending on size.
- **Background:** paper surface in light mode, charred surface in dark mode.
- **Shadow Strategy:** flat by default, ambient lift only on active or featured
  surfaces.
- **Border:** 1px warm neutral border.
- **Internal Padding:** 1rem to 1.5rem for normal modules.

### Inputs / Fields

- **Style:** warm surface, 1px border, 8px radius.
- **Focus:** visible outline or ring that works in both themes.
- **Error / Disabled:** text label plus semantic color, never color alone.

### Navigation

Navigation is compact and sticky. Desktop uses clear top-level docs routes.
Mobile collapses into a keyboard-accessible menu. Active state uses text weight,
color, and location context.

### Signature Component: Product Demo Panel

The product demo panel shows real editor or terminal states: wiki-link
completion, broken-link diagnostics, rename preview, references, tags, or vault
index readiness. It must be inspectable, not decorative.

### Signature Component: Field Guide Footer

The footer is compact product metadata, not a sitemap dump. It carries the
Flavor Grenade logo or icon, current project metadata when available, the
"Vibe-coded by: Alison Aquinas" byline, Alison public profile links, GitHub,
Visual Studio Marketplace, and inspiration links. On mobile it stacks into
short labeled groups without hiding the byline.

## 6. Do's and Don'ts

### Do

- **Do** show actual product behavior with editor states, commands, and
  realistic Markdown examples.
- **Do** use the coral ramp sparingly for actions, links, diagnostics, and
  selected states.
- **Do** keep long-form text inside comfortable reading widths.
- **Do** support light, dark, and system theme modes with equal care.
- **Do** make quickstart commands copyable and selectable.

### Don't

- **Don't** use generic SaaS landing-page clichés.
- **Don't** use purple-blue AI gradients or gradient text.
- **Don't** use abstract hero illustrations that do not show the tool.
- **Don't** use decorative glassmorphism, blobs, or bokeh backgrounds.
- **Don't** use endless identical card grids with icon, heading, and paragraph.
- **Don't** use thick colored side-stripe borders on cards or callouts.
- **Don't** hide public docs behind internal planning language.
