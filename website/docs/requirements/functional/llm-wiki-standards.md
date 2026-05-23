# LLM Wiki Standards Functional Requirements

## Website.LLMWiki.PageShape

Tag: `Website.LLMWiki.PageShape`

Gist: Make concept pages maintainable as a Karpathy-style LLM wiki.

Ambition: Human readers and LLM agents can use concept pages as small, linked,
high-signal knowledge units.

Scale: Percentage of concept pages that include the required LLM wiki shape.

Required shape:

- one H1
- direct first paragraph
- one focused concept per page
- at least one concrete Obsidian Vault example when applicable
- at least two internal links to related concepts or tasks
- no internal ticket, phase, or implementation ledger language

Meter: Inspect each page under the public concepts section in the production
build or source content.

Fail: Any concept page misses a required shape item.

Goal: 100% of concept pages satisfy the required shape.

Stretch: Goal level plus every concept page links to at least one how-to page.

Wish: Stretch level plus every concept page links to one source, inspiration,
or reference page when relevant.

Stakeholders: LLM agents, documentation maintainers, advanced users.

Owner: Website content.

Source: [[website/docs/requirements/user/concepts]], `PRODUCT.md`

Open questions:

- Which source format will represent concept pages before generation?
- Should concept-page shape be enforced by a content lint rule?

## Website.LLMWiki.Terminology

Tag: `Website.LLMWiki.Terminology`

Gist: Keep public docs terminology consistent for LLM-maintained content.

Ambition: LLM agents should preserve correct project vocabulary instead of
drifting into vague or inconsistent names.

Scale: Percentage of terminology checks that pass across public website source
content.

Required terminology checks:

- Use "Obsidian Vault" or "Obsidian Vaults" for vault workflow language.
- Use "Obsidian Flavored Markdown" or "OFM" after expansion.
- Use "Flavor Grenade LSP" for the product name.
- Avoid deprecated phrasing such as "Markdown vaults" for the core user
  workflow.
- Avoid internal ticket and phase language in public pages.

Meter: Run a repository text check over `website/docs` and generated public
content once implementation exists.

Fail: Any required terminology check fails.

Goal: 100% of required terminology checks pass.

Stretch: Goal level plus checks run in CI.

Wish: Stretch level plus terminology checks offer suggested replacements.

Stakeholders: LLM agents, documentation maintainers, search visitors.

Owner: Website content.

Source: [[project-brief]], [[website/docs/requirements/user/concepts]], `PRODUCT.md`

Open questions:

- Should terminology rules be implemented as markdownlint custom rules, a
  TypeScript content test, or both?

## Website.LLMWiki.PublicPrivateSeparation

Tag: `Website.LLMWiki.PublicPrivateSeparation`

Gist: Keep public website docs separate from internal planning artifacts.

Ambition: Search visitors and LLM agents should not confuse public product docs
with internal tickets, phase plans, or implementation ledgers.

Scale: Percentage of public website pages that avoid internal planning language
and links to internal-only docs.

Meter: Review generated public pages and source content for internal ticket
names, phase plan labels, implementation ledger references, or links to
internal planning docs.

Fail: Any public page exposes internal planning language as user-facing content
without a clear public reason.

Goal: 100% of public pages avoid internal planning language and internal-only
links.

Stretch: Goal level plus content linting detects common internal planning terms.

Wish: Stretch level plus public/private content boundaries are enforced by
route generation.

Stakeholders: Search visitors, project maintainer, LLM agents.

Owner: Website content.

Source: [[project-brief]], `PRODUCT.md`

Open questions:

- Which current docs are public-source candidates and which remain internal
  planning only?
