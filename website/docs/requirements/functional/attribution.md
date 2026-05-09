# Attribution Functional Requirements

## Website.Attribution.InspirationLinks

Tag: `Website.Attribution.InspirationLinks`

Gist: Visibly credit the project's inspirations and prior art.

Ambition: The website acknowledges its lineage instead of presenting the docs
model, OFM domain, or Markdown LSP direction as context-free inventions.

Scale: Percentage of required inspiration sources linked with descriptive text
from at least one visible public page or footer.

Required inspiration sources:

- [Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Obsidian](https://obsidian.md/)
- [Marksman LSP](https://github.com/artempyanykh/marksman)

Meter: Inspect the production build and verify that each required source has a
visible descriptive outbound link on the homepage, concepts section, or footer.

Fail: Any required inspiration source is missing or linked with generic text
such as "here" or "source".

Goal: 100% of required inspiration sources have visible descriptive outbound
links.

Stretch: Goal level plus each link is accompanied by one sentence explaining
the inspiration.

Wish: Stretch level plus the concept section includes a dedicated inspiration
and prior-art page.

Stakeholders: Project maintainer, readers, upstream project communities.

Owner: Website implementation.

Source: [[project-brief]], `PRODUCT.md`

Open questions:

- Should inspiration links live in the homepage body, footer, concepts section,
  or all three?

## Website.Attribution.NoConfusion

Tag: `Website.Attribution.NoConfusion`

Gist: Credit inspiration without implying endorsement, affiliation, or
ownership.

Ambition: Users understand which projects inspired Flavor Grenade while also
understanding that Flavor Grenade is its own project.

Scale: Presence of clarifying language near attribution links.

Meter: Inspect the page or component containing inspiration links. Verify that
the surrounding copy identifies the links as inspiration, prior art, or lineage,
not endorsement or official affiliation.

Fail: Attribution copy implies official affiliation or leaves affiliation
ambiguous.

Goal: Attribution copy identifies the links as inspiration, prior art, or
lineage.

Stretch: Goal level plus any trademark-sensitive names are used descriptively.

Wish: Stretch level plus the FAQ answers how Flavor Grenade differs from
Obsidian plugins and Marksman LSP.

Stakeholders: Project maintainer, readers, upstream project communities.

Owner: Website implementation.

Source: [[requirements/user/faq]], `PRODUCT.md`

Open questions:

- Does the project need a formal trademark or affiliation disclaimer?

## Website.Attribution.CreatorByline

Tag: `Website.Attribution.CreatorByline`

Gist: Credit Alison Aquinas in the website footer.

Ambition: The Flavor Grenade website preserves the creator-credit pattern from
Alison's LLM Skills Marketplace while fitting the Flavor Grenade product
identity.

Scale: Presence and quality of creator byline content in the global footer.

Required footer creator-credit elements:

- Project metadata such as product name or current version when available.
- The byline text "Vibe-coded by: Alison Aquinas".
- Link to Alison's website.
- Link to Alison's GitHub profile or organization.
- Link to Alison's LinkedIn profile.

Meter: Inspect the production build footer on homepage and docs pages. Count a
footer as passing when the byline is visible, the creator name is present, and
each required public profile link is reachable with descriptive link text.

Fail: The footer omits the creator byline, hides it from normal readers, or
uses generic link text such as "link" or "profile" for the public links.

Goal: The global footer includes the required creator-credit elements on all
public website pages.

Stretch: Goal level plus the footer remains compact and readable on mobile
without pushing primary page content into awkward overflow.

Review polish requirements:

- Creator links must include recognizable icons for website, GitHub, and
  LinkedIn.
- Project links must include recognizable icons for the GitHub repository and
  Visual Studio Marketplace.
- Icons must supplement visible descriptive text rather than replacing it.
- Footer brand image and byline must have enough space on narrow viewports and
  must not collapse into an unreadable column.

Wish: Stretch level plus current package or website version metadata is
automatically populated from the release source of truth.

Stakeholders: Project maintainer, website visitors, users familiar with
Alison's LLM Skills Marketplace.

Owner: Website implementation.

Source: [[project-brief]], `PRODUCT.md`, `DESIGN.md`,
[Alison's LLM Skills Marketplace](https://llm-skills.alisonaquinas.com/)

Open questions:

- Which GitHub and LinkedIn URLs should be canonical for the public footer?
- Should current version come from `package.json`, extension metadata, or a
  generated site build value?
