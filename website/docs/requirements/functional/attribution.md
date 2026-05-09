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
