# Static Site Runtime Architecture

## Overview

The website runtime is a static Vite application using Svelte components,
strict TypeScript modules, and SCSS styles. It is optimized for AWS S3
distribution: build once in CI, publish static files, and run only browser-side
enhancement at view time.

## Layers

| Layer | Planned Location | Responsibility |
| --- | --- | --- |
| App shell | `website/src/App.svelte` or equivalent entry shell | Header, footer, theme control, page chrome, and global layout. |
| Routes | `website/src/routes/` or typed route modules | Static route definitions for homepage, quickstart, how-to, concepts, advanced usage, FAQ, and feature pages. |
| Components | `website/src/components/` | Product demo panels, copyable command blocks, guide lists, FAQ items, footer, navigation, and theme controls. |
| Content data | `website/src/content/` and generated TypeScript modules | Typed content records derived from Markdown, frontmatter, media, and manifests. |
| Styles | `website/src/styles/` | SCSS tokens, resets, layout primitives, theme variables, and component styling. |
| Assets | `website/src/assets/`, `website/src/content/media`, and repository product assets | Product logos, icons, screenshots, document images, social images, and static media. |
| Tests | `website/tests/` | Unit, component, accessibility, routing, SEO, and build-output tests. |

## Vite Role

Vite is the build and development boundary:

- Local development uses Vite dev server and HMR.
- Production builds emit static assets to `website/dist` unless a later ADR
  changes the output directory.
- `base` must match the hosting target:
  - `/` for a custom domain or root-domain deployment.
  - a non-root path only when the S3 or CDN public URL intentionally serves the
    site from a subpath.
- Vite plugins handle Svelte integration. Custom bundler glue is out of scope.

## Svelte Role

Svelte owns interactive but static-site-friendly UI:

- theme mode control: light, dark, system
- mobile navigation
- copyable command blocks
- FAQ disclosure behavior
- docs filters or search once implemented
- product demo panels that show real editor behavior

Svelte components that use TypeScript must use `<script lang="ts">`.
Preprocessing should be configured through the Vite/Svelte integration path so
TypeScript and SCSS compile consistently.

## TypeScript Role

TypeScript is the language for all website scripting:

- component logic
- route definitions
- metadata schemas
- content transforms
- SEO data
- build helpers
- deployment helpers under `website/`

Strict typechecking is required. Lint warnings are CI failures.

## SCSS Role

SCSS owns the site styling system:

- design tokens from `DESIGN.md`
- light and dark theme variables
- layout primitives
- typography scales
- component styles
- responsive behavior

Compiled CSS is emitted by Vite. Runtime styling must not depend on a CSS
framework unless a later ADR accepts that dependency.

## Browser Enhancement Model

The site follows progressive enhancement:

1. Static HTML carries page content, headings, links, and metadata.
2. CSS provides usable layout in light and dark capable contexts.
3. Browser JavaScript enhances theme persistence, menus, copy buttons, and
   optional search.

Core docs content, install instructions, attribution links, and Marketplace
links must remain available without JavaScript.

## Asset Strategy

The website must reuse existing product assets where suitable:

- `docs/assets/flavor-grenade-lsp-logo-light.png`
- `docs/assets/flavor-grenade-lsp-logo-dark.png`
- `docs/assets/flavor-grenade-lsp-icon-light.png`
- `docs/assets/flavor-grenade-lsp-icon-dark.png`
- `extension/images/icon.png`

Generated or future screenshots should show actual VS Code extension behavior
and must include useful alt text.

Document-specific images referenced from public Markdown copy may live under
`website/src/content/media`. They must resolve through the Vite build and must
include useful alt text or an explicit decorative marker.
