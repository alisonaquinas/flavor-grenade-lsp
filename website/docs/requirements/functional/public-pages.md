# Public Page Functional Requirements

## Website.Pages.RequiredSet

Tag: `Website.Pages.RequiredSet`

Gist: Publish the required public docs pages for the GitHub Pages website.

Ambition: Users can move from discovery to setup, task completion, deeper
concepts, and objections without reading internal project planning docs.

Scale: Percentage of required public page categories that have at least one
published route with meaningful user-facing content.

Required page categories:

- homepage
- quickstart
- how-to index
- VS Code extension how-to
- vault configuration how-to
- broken-link how-to
- safe rename how-to
- wiki-link and heading completion how-to
- navigation and attachment how-to
- references and document highlights how-to
- tags and tag completion how-to
- OFM opaque-region how-to for callouts, math, comments, frontmatter, and
  Templater-aware parsing
- advanced usage
- advanced configuration article
- advanced vault modes article
- advanced indexing and performance article
- advanced URI confinement article
- advanced parser boundaries article
- advanced compatibility article
- FAQ
- concept index
- inspiration and prior art concept
- Obsidian Flavored Markdown concept
- vault index concept
- wiki-link resolution concept
- DocId and vault-relative paths concept
- opaque regions concept
- diagnostics concept
- completions concept
- rename safety concept
- references, navigation, tags, and embeds concept

Meter: Inspect generated website routes after production build. Count a
category as present when the route exists, contains a single H1, and includes
content matching the category intent in [[project-brief]].

Fail: Less than 100% of required page categories are present.

Goal: 100% of required page categories are present.

Stretch: 100% of required page categories are present, and each page links to at
least one next-step page.

Wish: 100% of required page categories are present, each page links to at least
one next-step page, and each page includes a concrete Obsidian Vault example.

Hub-page requirements:

- How-to index list items must link to task articles instead of remaining
  static bullets.
- How-to workflow groups must be represented as links to subpage articles.
- Concepts index entries must link to concept article pages.
- The concepts LLM-maintainer section must also present linked concept article
  entries rather than one static paragraph.
- Advanced Usage sections must link to advanced-topic article pages.

Stakeholders: Obsidian users, VS Code users, LLM agents, project maintainer.

Owner: Website implementation.

Source: [[project-brief]], [[requirements/user/index]]

Open questions:

- Which site generator will own route generation?
- Which pages should ship in the first GitHub Pages release versus later
  iterations?

## Website.Homepage.FirstViewport

Tag: `Website.Homepage.FirstViewport`

Gist: Make the homepage communicate product identity, category, value, and next
actions immediately.

Ambition: First-time visitors should know whether Flavor Grenade LSP matters to
their Obsidian Vault workflow before they scroll deeply.

Scale: Percentage of required first-viewport elements visible at initial page
load on representative mobile and desktop viewports.

Required first-viewport elements:

- product name
- product category
- primary value statement
- quickstart link or button
- VS Code extension guide link or button
- GitHub repository link or button
- product evidence visual or demo element
- hint of next section content

Meter: Render the production build at one mobile viewport and one desktop
viewport. Inspect the initial viewport before scrolling.

Fail: Fewer than 100% of required first-viewport elements are visible on either
representative viewport.

Goal: 100% of required first-viewport elements are visible on both
representative viewports.

Stretch: Goal level plus no text overlap, no clipped controls, and no
horizontal page overflow on the tested viewports.

Wish: Stretch level plus the product evidence visual shows an actual Flavor
Grenade workflow, not a decorative placeholder.

Stakeholders: First-time visitors, search visitors, project maintainer.

Owner: Website implementation.

Source: [[requirements/user/homepage]], [[requirements/design/index]]

Open questions:

- Which product demo visual will be available for first release?
- Which desktop and mobile viewport sizes become the canonical acceptance
  fixture?
