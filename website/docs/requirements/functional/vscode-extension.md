# VS Code Extension Functional Requirements

## Website.VSCodeExtension.MarketplaceLink

Tag: `Website.VSCodeExtension.MarketplaceLink`

Gist: Link users to the VS Code extension Marketplace listing.

Ambition: Users who prefer the extension path can install Flavor Grenade from
the official Marketplace without hunting through GitHub.

Scale: Presence and reachability of the Visual Studio Marketplace link from
required public pages.

Marketplace URL:

`https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp`

Required pages or areas:

- homepage
- quickstart
- VS Code extension how-to
- footer or project links area

Meter: Inspect generated public pages. Count a page or area as satisfied when
it contains a descriptive link to the Marketplace URL.

Fail: Any required page or area lacks the Marketplace link.

Goal: 100% of required pages or areas contain a descriptive Marketplace link.

Stretch: Goal level plus the link text includes "Visual Studio Marketplace" or
"VS Code Marketplace".

Wish: Stretch level plus the link is tracked in sitemap-adjacent link audits or
link-check CI.

Stakeholders: VS Code users, first-time visitors, project maintainer.

Owner: Website implementation.

Source: [[project-brief]], [[requirements/user/quickstart]]

Open questions:

- Should the site also link to Open VSX if the extension is published there?

## Website.VSCodeExtension.InstallInstructions

Tag: `Website.VSCodeExtension.InstallInstructions`

Gist: Provide clear VS Code extension install and activation instructions.

Ambition: A VS Code user can install the extension, open an Obsidian Vault, and
confirm activation without reading repository internals.

Scale: Percentage of required VS Code extension setup steps documented in the
quickstart or VS Code extension how-to.

Required setup steps:

- install from Visual Studio Marketplace
- open an Obsidian Vault folder in VS Code
- open a vault `.md` file
- confirm the language mode is OFMarkdown
- observe indexing or readiness status
- try one first feature such as wiki-link completion or diagnostics
- find troubleshooting entry points for server path, activation, workspace
  trust, and indexing issues

Meter: Review quickstart and VS Code extension how-to content. Count a setup
step as documented when a user-facing instruction exists with enough context to
complete or verify the step.

Fail: Any required setup step is missing.

Goal: 100% of required setup steps are documented.

Stretch: Goal level plus setup steps include screenshots or product evidence
for activation and indexing.

Wish: Stretch level plus setup steps include copyable settings snippets where
configuration is needed.

Stakeholders: VS Code users, support maintainers.

Owner: Website content.

Source: [[requirements/user/quickstart]], Visual Studio Marketplace listing.

Open questions:

- Which troubleshooting topics should be first-class pages versus sections?
- Should extension settings be documented on quickstart or advanced usage?

## Website.VSCodeExtension.ExtensionServerDistinction

Tag: `Website.VSCodeExtension.ExtensionServerDistinction`

Gist: Distinguish the VS Code extension from the underlying LSP server.

Ambition: Users understand when they need the extension, when they need the
server, and how the two relate.

Scale: Presence of explanatory copy that identifies extension role, server
role, and the relationship between them.

Meter: Inspect homepage, quickstart, VS Code extension how-to, and advanced
usage pages.

Fail: Any page that discusses both extension and server leaves their roles
ambiguous.

Goal: Pages that discuss both extension and server explain that the extension is
the VS Code client/adoption path and the server provides LSP behavior.

Stretch: Goal level plus direct LSP usage is linked separately from extension
usage.

Wish: Stretch level plus FAQ includes an answer distinguishing extension,
server, Obsidian plugin, and Marksman LSP.

Stakeholders: VS Code users, editor integrators, support maintainers.

Owner: Website content.

Source: [[project-brief]], [[requirements/user/advanced-usage]]

Open questions:

- Which direct LSP clients will be documented at launch?
