# Navigation And Routing Functional Requirements

## Website.Navigation.PrimaryRoutes

Tag: `Website.Navigation.PrimaryRoutes`

Gist: Provide predictable primary navigation for the public docs website.

Ambition: Users can reach the main docs areas without relying on search or
external links.

Scale: Percentage of required primary navigation destinations reachable from
the site header or mobile navigation.

Required destinations:

- Home
- Quickstart
- How-To
- Concepts
- Advanced Usage
- FAQ

Meter: Inspect the production build on desktop and mobile. Count a destination
as reachable when a keyboard user can navigate to it from the primary
navigation without scrolling page content.

Fail: Less than 100% of required destinations are reachable on desktop or
mobile.

Goal: 100% of required destinations are reachable on desktop and mobile.

Review polish requirements:

- On narrow viewports, the full primary navigation link list must collapse into
  one top-right hamburger or menu icon.
- The collapsed menu must expose every required primary destination.
- Desktop How-To, Concepts, and Advanced Usage primary navigation items must
  expose hover and focus dropdowns linking to their respective subpage article
  routes.
- The GitHub repository link must stay out of primary navigation and remain
  available through the homepage CTA and footer project links.
- The hamburger/menu control must expose an accessible name and expanded state.
- Desktop viewports must keep visible primary navigation links.

Stretch: Goal level plus the active or current section is visually indicated.

Wish: Stretch level plus every primary destination has descriptive accessible
text that matches the destination intent.

Stakeholders: All website visitors, keyboard users.

Owner: Website implementation.

Source: [[requirements/design/index]], [[requirements/user/index]]

Open questions:

- Should Releases or Changelog become a primary or secondary destination?

## Website.Navigation.SectionDropdowns

Tag: `Website.Navigation.SectionDropdowns`

Gist: Expose subpage article links from desktop navigation section dropdowns.

Ambition: Users can jump directly to task articles, concept articles, and
advanced topic articles from the header without first landing on an index page.

Scale: Percentage of section hub navigation items with a populated, accessible
dropdown menu.

Required dropdowns:

- How-To: links to every how-to article route.
- Concepts: links to every concept article route.
- Advanced Usage: links to every advanced topic article route.

Meter: Inspect the production build at a desktop viewport. Hover each required
section hub, then tab to each required section hub, and count whether the
expected subpage links become visible and keyboard reachable.

Fail: Any required dropdown is missing, cannot be opened by hover, cannot be
opened by keyboard focus, or omits a published subpage article.

Goal: 100% of required dropdowns are hoverable, focusable, and contain all
published article routes for their section.

Stretch: Goal level plus dropdowns include concise article descriptions without
wrapping awkwardly.

Wish: Stretch level plus mobile navigation exposes the same article links in a
tap-friendly nested menu.

Stakeholders: Documentation readers, keyboard users, returning users.

Owner: Website implementation.

Source: [[requirements/design/index]], [[requirements/user/how-to]],
[[requirements/user/concepts]], [[requirements/user/advanced-usage]]

Open questions:

- Should mobile expose article links inside the hamburger menu or rely on hub
  pages?

## Website.Routing.StaticDirectAccess

Tag: `Website.Routing.StaticDirectAccess`

Gist: Support direct access to public docs routes on GitHub Pages.

Ambition: Users and search engines can load a specific route directly without
needing to start from the homepage.

Scale: Percentage of public routes in the generated sitemap that return a
rendered page when loaded directly from the static build.

Meter: After production build, load each route listed in `sitemap.xml` using a
static preview server or Pages-equivalent static hosting.

Fail: Any sitemap route fails direct load or resolves to unrelated content.

Goal: 100% of sitemap routes load directly and render the intended page.

Stretch: Goal level plus direct-loaded routes preserve correct canonical URL
metadata.

Wish: Stretch level plus direct-loaded routes preserve breadcrumb or page-group
context.

Stakeholders: Search visitors, documentation readers, LLM agents.

Owner: Website implementation.

Source: [[requirements/technical/index]], [[requirements/user/seo-discovery]]

Open questions:

- Will the final deployment use a custom domain or repository subpath?
- Will routing use generated static HTML files, hash routing, or a static-site
  adapter?
