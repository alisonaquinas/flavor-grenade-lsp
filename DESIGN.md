---
name: Flavor Grenade LSP Website
description: Public product documentation for an Obsidian Flavored Markdown language server and VS Code extension.
colors:
  brand-50: "#FFF4EF"
  brand-100: "#FFE4DA"
  brand-200: "#FFCABA"
  brand-300: "#FFA58F"
  brand-400: "#FF7C61"
  brand-500: "#F46043"
  brand-600: "#DD4C31"
  brand-700: "#B73A27"
  brand-800: "#7F2D25"
  brand-900: "#4A1D1E"
  brand-950: "#281112"
  light-bg: "#FFF8F4"
  light-surface: "#FFFFFC"
  light-surface-subtle: "#FFF2EA"
  light-border: "#EAD8CF"
  light-text: "#17120F"
  light-text-muted: "#746A66"
  dark-bg: "#030712"
  dark-bg-warm: "#14100F"
  dark-surface: "#1C1614"
  dark-surface-subtle: "#291F1C"
  dark-border: "#3D302C"
  dark-text: "#F7F1EE"
  dark-text-muted: "#B8ADA8"
  diagnostic: "#DD4C31"
  completion: "#227C9D"
  tag: "#2F855A"
  warning: "#B7791F"
typography:
  display:
    fontFamily: "TBD warm technical sans, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 5.25rem)"
    fontWeight: 750
    lineHeight: 0.95
    letterSpacing: "normal"
  headline:
    fontFamily: "TBD warm technical sans, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  title:
    fontFamily: "TBD warm technical sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "TBD warm readable sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "TBD warm technical sans, system-ui, sans-serif"
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

The system borrows the coral brand family from Alison Aquinas and the LLM
Skills Marketplace, but it must stand apart through stronger product evidence:
wiki-links, vault paths, diagnostics, code actions, and copyable setup commands.
The visual tone is precise, grounded, and a little punchy.

It explicitly rejects generic SaaS landing-page clichés, purple-blue AI
gradients, abstract hero illustrations, glassmorphism, and endless identical
card grids.

The site should include visible, respectful attribution for three inspirations:
Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP. Attribution should feel
like part of the documentation lineage, not a legal footnote hidden from users.

**Key Characteristics:**

- Warm technical surfaces.
- Concrete editor evidence.
- Short linked explanations.
- Visible attribution for inspiration and prior art.
- High standards for LLM-maintained Karpathy wiki pages.
- Strong light and dark theme parity.
- Copyable, inspectable command and Markdown examples.

## 2. Colors

The palette is warm-neutral with one coral accent ramp and a small set of
semantic support colors.

### Primary

- **Grenade Coral** (`brand-500`): The main accent for primary actions, active
  states, and diagnostic identity.
- **Link Coral** (`brand-600`): The default light-mode link and action color.
- **Deep Grenade** (`brand-700`): Strong emphasis, borders, and pressed states.

### Secondary

- **Completion Blue** (`completion`): Completion, navigation, and editor
  intelligence affordances.
- **Vault Green** (`tag`): Tags, indexing, readiness, and successful state.
- **Config Amber** (`warning`): Warnings, setup notes, and configuration
  attention.

### Neutral

- **Warm Paper** (`light-bg`): Light-mode page background.
- **Paper Surface** (`light-surface`): Cards, command areas, and top-level
  surfaces.
- **Soft Paper** (`light-surface-subtle`): Code block and quiet callout
  backgrounds.
- **Warm Ink** (`light-text`): Light-mode primary text.
- **Night Vault** (`dark-bg`): Dark-mode page background.
- **Warm Night** (`dark-bg-warm`): Dark-mode section background.
- **Charred Surface** (`dark-surface`): Dark-mode card and navigation surface.
- **Ash Text** (`dark-text`): Dark-mode primary text.

### Named Rules

**The Coral Rarity Rule.** Coral is the product accent, not the wallpaper. It
should call attention to actions, links, and diagnostics, not flood every
surface.

**The No Pure Neutral Rule.** Pure black and pure white are prohibited. Every
surface and text neutral must carry a small warm tint.

**The Status Has Shape Rule.** Status colors must pair with labels, icons, or
text. Color alone is never the only signal.

## 3. Typography

**Display Font:** TBD warm technical sans, with system fallback  
**Body Font:** TBD readable sans, with system fallback  
**Label/Mono Font:** TBD only if code or UI labels need a distinct technical
voice

**Character:** Type should feel like a well-made technical manual, warm enough
for long reading and sharp enough for API-style specificity. Avoid default
developer-font reflexes unless they are deliberately justified.

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
