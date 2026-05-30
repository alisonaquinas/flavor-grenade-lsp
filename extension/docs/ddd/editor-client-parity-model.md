---
title: Editor Client Parity Model
tags: [extension/docs, ddd, editor-client, parity]
aliases: [Extension Client Parity Model]
---

# Editor Client Parity Model

This model extends the root Editor Client bounded context for VS Code parity.

## Components

| Component | Responsibility |
|---|---|
| ExtensionClient | Owns activation and LanguageClient lifecycle |
| ServerResolver | Resolves custom, development, or bundled server command |
| StatusBarWidget | Displays server and vault state only |
| MarkdownFlavorController | Owns visible selector state, writes scoped `.fgattributes` rules, sends refresh inputs, and preserves VS Code's `markdown` language mode |
| CommandBridgeRegistry | Registers VS Code commands that consume server payloads |
| MarketplaceEvidence | README screenshots and packaged visual assets |
| ExtensionHostTestHarness | Tests activation, commands, status, and failure states |

## CommandBridgeRegistry

The registry maps stable `flavorGrenade.*` command ids to VS Code API actions.
It validates payloads, shows user-visible errors for invalid payloads, and keeps
server-generated data out of VS Code-specific code until the bridge boundary.

## Invariants

- The extension does not import server-side TypeScript modules.
- Command bridge payloads are JSON-serializable.
- The server never imports VS Code APIs.
- Markdown flavor changes do not restart the LanguageClient.
- MarkdownFlavorController owns selector display and `.fgattributes` writes only; server BC4 owns authoritative `EffectiveMarkdownContext` state. StatusBarWidget owns server and vault state. Shared status bar placement does not merge the state machines.
- Structured profile ids are not Markdown flavor selector choices. They are configured through `structured_profiles` in `.fgattributes` or inferred from document naming and folder context.
- LanguageClient `clientOptions.documentSelector` is file-backed `markdown` only for current flavor behavior; `ofmarkdown` must not remain in the current selector.
- Non-`markdown` editor language ids such as `mdx` are outside current selector behavior; the extension must not steal them for Markdown flavor analysis.
- Restricted and virtual workspaces do not spawn the server.

## Auto-Detection Contract

MarkdownFlavorController owns selector display, scope prompting, scoped
`.fgattributes` writes, and refresh requests. BC4 owns the root
[Markdown flavor auto-detection algorithm](../../../docs/design/markdown-flavor-auto-detection.md)
and runs Auto Detect independently whenever no concrete `.fgattributes`
`flavor` applies.

When the user chooses a flavor, MarkdownFlavorController opens a second prompt:

1. Selected file
2. All files in this directory

It then writes the corresponding file-specific or `/*.md` rule to
`.fgattributes` in the active file's directory. Choosing Auto Detect removes or
resets the matching `flavor` attribute at the selected scope when possible.

## Structured Profile Contract

The extension mirrors the root structured-profile contract:

- `structured_profiles=auto` lets BC4 infer Keep a Changelog, Common Changelog,
  or MADR profile flags.
- `structured_profiles=none` disables structured profile behavior for the
  matched scope.
- Explicit attribute values may contain `keep-a-changelog`,
  `common-changelog`, and `madr`, but must be unique and cannot contain both
  changelog profiles.
- Opening a structured-profile fixture must not alter VS Code's
  `languageId`, must not expand the Markdown flavor selector, and must
  propagate resource-specific profile flags with the base flavor context.
