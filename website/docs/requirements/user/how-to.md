# How-To User Requirements

## User Need

Users must be able to solve specific tasks without reading architecture docs or
reverse-engineering feature descriptions.

## Required Experience

How-to pages must be task-focused. Each page should answer one user goal and
link to deeper concepts only after the task is clear.

## Acceptance Criteria

- The how-to index groups tasks by workflow.
- The how-to index presents workflow topics as links to subpage articles, not
  static bullet points.
- The how-to index "Workflow groups" content is broken into subpage articles
  and linked from the hub.
- Each how-to page has one clear user goal.
- Each how-to page includes:
  - when to use it
  - steps
  - expected result
  - common failure mode
  - deeper concept link
- Initial how-to pages cover:
  - installing and activating the VS Code extension
  - installing from the Visual Studio Marketplace
  - confirming OFMarkdown activation in VS Code
  - configuring a vault workspace
  - completing wiki-links and headings
  - navigating notes, headings, blocks, embeds, and attachments
  - finding references and document highlights
  - renaming notes and headings safely
  - fixing broken links with diagnostics and code actions
  - using tags and tag completion
  - working with callouts, math, comments, frontmatter, and Templater regions
- How-to pages use concrete vault paths and Markdown examples.
- How-to pages use descriptive link text and avoid internal ticket references.
- The desktop How-To navigation item provides a hover and focus dropdown linking
  to the how-to subpage articles.

## Follow-On Pages

- [[website/docs/requirements/user/concepts]]
- [[website/docs/requirements/user/advanced-usage]]
- [[faq]]
