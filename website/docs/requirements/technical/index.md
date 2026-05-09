# Website Technical Requirements

## Scope

The Flavor Grenade website must be a static site generated for GitHub Pages. It
will live under `website/` and publish compiled assets only. Source content and
implementation must stay independent from the LSP server runtime.

## Core Technology Stack

| Technology | Requirement |
| --- | --- |
| Vite | Required build tool and development server. |
| Svelte | Required UI component framework for the main website shell and docs-oriented interactions. |
| TypeScript | Required scripting language; all website scripts must be strictly typechecked and linted. |
| SCSS | Required styling authoring format for site-level styles, tokens, layout, and component styling. |
| GitHub Pages | Required static hosting target. |

## Static Site Output

- The website must build to static HTML, CSS, JavaScript, and assets.
- The production output directory must be `website/dist` unless the final site
  generator requires a different directory and the deployment workflow documents
  that choice.
- The build must not require a server process at runtime.
- Any dynamic behavior must run in the browser after static assets load.
- The generated site must support direct GitHub Pages hosting.

## Vite Requirements

- Use Vite as the only frontend build pipeline for the website.
- Configure `root` to the website app directory once the implementation starts.
- Configure `base` for the final hosting target:
  - Use `/` for a custom domain or root-domain deployment.
  - Use `/flavor-grenade-lsp/` for repository GitHub Pages at
    `https://alisonaquinas.github.io/flavor-grenade-lsp/`.
- Keep build output deterministic for CI and Pages deployment.
- Use Vite plugins for framework integration instead of custom bundler glue.
- Support local development with Vite HMR.

## Svelte Requirements

- Use Svelte for the primary app shell: layout, navigation, theme controls,
  docs chrome, search/filter UI, and low-level interactive controls.
- Use `@sveltejs/vite-plugin-svelte` for Vite integration.
- Keep Svelte components under a dedicated source tree such as
  `website/src/svelte/` or `website/src/components/`.
- Use Svelte compiler output through Vite only. Do not add a separate Svelte
  build pipeline.
- If TypeScript is enabled for Svelte components, configure Svelte preprocessing
  through the Vite/Svelte plugin path.

## TypeScript Requirements

- All website scripting must be written in TypeScript.
- TypeScript must run in strict mode.
- The website must provide a dedicated typecheck command.
- The website must provide a dedicated lint command.
- CI must fail on TypeScript type errors, lint errors, and lint warnings.
- Avoid `any`; use precise types, `unknown`, or validated data structures.
- Shared route, metadata, content, and SEO data must have typed schemas or typed
  interfaces.
- Build scripts, content transforms, and deployment helpers under `website/`
  must also be TypeScript unless a tool only supports configuration in another
  format.

## Component Architecture Requirements

- Svelte owns the page shell, routing/navigation, theme controls, search/filter
  UI, and interactive documentation controls.
- Shared UI tokens, copy, routes, and metadata must live in framework-neutral
  modules when they are consumed outside Svelte components.
- Do not add another UI framework unless a later ADR documents the need and
  migration cost.

## SCSS Requirements

- Author global styles, design tokens, mixins, and layout utilities in SCSS.
- Install a Sass implementation supported by Vite, preferably
  `sass-embedded` unless compatibility requires `sass`.
- Keep SCSS source under `website/src/styles/`.
- Define brand tokens from the reference-site research:
  - coral accent ramp
  - neutral light surfaces
  - warm dark surfaces
  - semantic status colors for diagnostics, warnings, completions, and tags
- Avoid component-specific styling duplication.
- Compiled CSS must be emitted by the Vite build.

## Content And SEO Requirements

- Public pages must render meaningful static HTML for crawlers and no-JS users.
- Each page must have one H1, a unique title, and a unique description.
- Generate or maintain `robots.txt` and `sitemap.xml`.
- Add Open Graph and Twitter preview metadata for the homepage.
- Add JSON-LD where useful:
  - WebSite
  - SoftwareApplication
  - FAQPage
  - HowTo
  - BreadcrumbList
- Use static routes for quickstart, how-to, advanced usage, concepts, FAQ, and
  feature pages.

## Accessibility Requirements

- Navigation must be keyboard usable.
- Theme controls, copy buttons, menus, accordions, and search/filter controls
  must expose accessible labels and states.
- Color contrast must pass WCAG AA for text and controls in light and dark
  themes.
- The site must include a skip link to main content.
- Images and screenshots must include useful alt text.
- Existing product logo and extension imagery must be reused where suitable
  instead of creating duplicate brand assets.

## GitHub Pages Deployment Requirements

- Add a CI workflow or job that builds the website and publishes the static
  output to GitHub Pages.
- Deployment must run from a protected branch strategy chosen later, likely
  `main` for published releases.
- The workflow must install website dependencies, run lint/type/build checks,
  and upload the static artifact.
- If using repository Pages instead of a custom domain, Vite `base` must match
  the repository subpath.
- The deployed site must not expose source maps unless intentionally enabled.

## Local Development Requirements

- Provide package scripts for:
  - `dev`
  - `build`
  - `preview`
  - `lint`
  - `typecheck`
- Document local startup from the repository root and from `website/`.
- Keep website dependencies scoped to `website/package.json` unless a later
  decision intentionally shares root tooling.

## Open Decisions

- Whether to use Vite alone, SvelteKit static adapter, or another static-site
  layer on top of Vite.
- Whether docs content is Markdown, MDsveX, generated JSON, or another source
  format.
- Whether search is build-time generated, client-side indexed, or deferred.
- Whether GitHub Pages uses a custom domain or repository subpath.
