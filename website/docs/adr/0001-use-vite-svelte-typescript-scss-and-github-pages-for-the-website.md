---
status: accepted
date: 2026-05-09
decision-makers: Alison Aquinas
consulted: Codex
informed: Future website contributors
---

# Use Vite Svelte TypeScript SCSS and GitHub Pages for the website

## Context and Problem Statement

Flavor Grenade needs a public website that can be hosted on GitHub Pages and
serve as both product homepage and documentation entry point. The site must
explain the LSP server, VS Code extension, Obsidian Flavored Markdown behavior,
quickstart, how-to pages, advanced usage, FAQ, and a Karpathy-style LLM wiki.

The implementation must produce static output, keep public pages SEO-friendly,
support mobile-friendly light and dark themes, reuse product assets, and remain
separate from the LSP server runtime. All website scripting must be strictly
typechecked and linted TypeScript.

The decision question is: which website technology stack should be used for
the first GitHub Pages implementation?

## Decision Drivers

- Static GitHub Pages hosting
- Strict TypeScript scripting
- Componentized docs interactions
- SEO-friendly public pages
- SCSS-based design token and component styling
- Small implementation surface for a repository that already contains a server
  package and a VS Code extension package
- Clear CI/CD fit with tag-triggered release publishing

## Considered Options

- Vite with Svelte TypeScript SCSS and GitHub Pages
- SvelteKit static adapter
- Astro content site
- Vite with React

## Decision Outcome

Chosen option: "Vite with Svelte TypeScript SCSS and GitHub Pages".

This option satisfies the explicit technical requirements with the smallest
durable architecture: Vite owns local development and static builds, Svelte
owns interactive documentation UI, TypeScript owns all scripting, SCSS owns the
visual system, and GitHub Pages owns static hosting.

React was removed from the requirements because the current interaction model
does not need a second UI framework. Svelte is sufficient for the app shell,
theme controls, navigation, copy buttons, FAQ disclosures, and future
docs-oriented controls.

### Consequences

- Good, because the website can be built and deployed as static assets without
  a runtime server.
- Good, because Svelte keeps interactive docs components compact and avoids
  adding React to the website bundle.
- Good, because Vite directly supports static builds and GitHub Pages base path
  configuration.
- Good, because SCSS can encode the existing design tokens without requiring a
  larger CSS framework decision.
- Bad, because a Vite-only static site may need custom content routing,
  metadata generation, and Markdown processing that a content framework would
  provide out of the box.
- Bad, because future search, MDsveX, or content graph needs may require
  additional build-time tooling.
- Neutral, because this decision does not yet choose whether content remains in
  `website/docs`, moves to `website/src/content`, or is generated into typed
  modules.

### Confirmation

The decision is confirmed when:

- `website/package.json` provides `dev`, `build`, `preview`, `lint`, and
  `typecheck` scripts.
- `website` builds static output to `website/dist` or a documented replacement
  directory.
- Vite `base` is configured for the selected GitHub Pages hosting mode.
- Svelte components use TypeScript where scripting is present.
- CI fails on website typecheck, lint warnings, unit test failures, and build
  failures.
- Generated public pages include required SEO metadata.
- GitHub Pages deployment is tag triggered from release commits on `main`.

## Pros and Cons of the Options

### Vite with Svelte TypeScript SCSS and GitHub Pages

Use Vite as the only frontend build pipeline, Svelte for components,
TypeScript for scripting, SCSS for styling, and GitHub Pages for static
hosting.

- Good, because it matches the current technical requirements exactly.
- Good, because it keeps runtime deployment simple: static files only.
- Good, because it leaves content-pipeline choices open while fixing the app
  shell and build architecture.
- Bad, because content indexing, Markdown transforms, route generation, and
  structured data generation must be designed by the project.

### SvelteKit static adapter

Use SvelteKit with static adapter to provide routing, page structure, and
static generation.

- Good, because it provides stronger routing and page conventions than a
  Vite-only app.
- Good, because it remains Svelte-native.
- Bad, because it adds framework architecture before the content model is
  settled.
- Bad, because the current requirements only require a static site and do not
  yet need SvelteKit server/load conventions.

### Astro content site

Use Astro as the content-first static site framework, with Svelte islands for
interactive controls.

- Good, because Astro is strong for content collections and static SEO pages.
- Good, because Svelte could still be used for isolated interactive islands.
- Bad, because it introduces a second page framework when the requirement has
  already selected Svelte for the primary app shell.
- Bad, because the team would need to define Astro and Svelte boundaries before
  the first implementation.

### Vite with React

Use Vite with React for the website shell and documentation controls.

- Good, because React has a broad ecosystem and many documentation-site
  examples.
- Bad, because React was explicitly removed from the technical requirements.
- Bad, because it would add a second UI framework direction without a current
  product need.
- Bad, because it would contradict the simpler Svelte-only component
  architecture.

## More Information

- [[website/docs/architecture/index]]
- [[website/docs/requirements/technical/index]]
- [[website/docs/requirements/operational/ci-cd]]
- [[website/docs/requirements/design/index]]
- Vite static deploy guidance for GitHub Pages documents `base` behavior for
  root-domain and repository-subpath deployments.
- Svelte TypeScript guidance documents `<script lang="ts">` and Vite
  preprocessing for TypeScript features inside Svelte components.

Revisit this decision if:

- the content pipeline requires framework-native content collections that make
  Vite-only routing too expensive,
- the site needs server rendering or runtime routes,
- search or generated LLM-wiki pages require a dedicated static-site framework,
  or
- GitHub Pages stops being the intended hosting target.
