# Website User Requirements

## Purpose

These requirements describe what the public Flavor Grenade website must help
users accomplish. Technical implementation requirements live in
[[website/docs/requirements/technical/index]].

## Audience

The website must serve:

- Obsidian users who want editor intelligence outside Obsidian.
- VS Code users writing in Obsidian Vaults.
- Developers evaluating an Obsidian Flavored Markdown language server.
- Tool authors studying OFM parsing and link-resolution behavior.
- LLM agents implementing or maintaining Karpathy-style wiki docs inside this
  repo.
- Search users with specific questions about wiki-links, vault navigation,
  diagnostics, rename, tags, embeds, and Markdown LSP workflows.

## Requirements

| Requirement | Summary | Source |
| --- | --- | --- |
| [[homepage]] | Explain the product and route users to the right next step. | [[website/docs/project-brief]] |
| [[quickstart]] | Help users install, verify, and try first useful actions. | [[website/docs/project-brief]] |
| [[website/docs/requirements/user/how-to]] | Provide task-focused guides for common user workflows. | [[website/docs/project-brief]] |
| [[website/docs/requirements/user/advanced-usage]] | Explain deeper configuration, integrations, and boundaries. | [[website/docs/project-brief]] |
| [[faq]] | Answer high-intent questions and objections directly. | [[website/docs/project-brief]] |
| [[website/docs/requirements/user/concepts]] | Teach the mental model through a linked LLM-wiki structure. | [[website/docs/project-brief]] |
| [[seo-discovery]] | Make pages discoverable for relevant search intent. | [[website/docs/project-brief]], [[website/docs/research/reference-site-research]] |
| [[accessibility-and-usability]] | Keep the site usable, navigable, and readable for all users. | [[website/docs/research/reference-site-research]] |

## Acceptance Model

Each requirement page defines:

- user need
- required experience
- minimum acceptance criteria
- useful follow-on pages

The website is acceptable when a first-time user can understand what Flavor
Grenade LSP is, install or evaluate it, complete at least one useful workflow,
and find deeper concept pages without reading internal project planning docs.
It is also acceptable when an LLM agent can use the requirements and concept
pages to maintain high-quality public wiki docs without diluting terminology,
SEO intent, examples, or safety boundaries.
