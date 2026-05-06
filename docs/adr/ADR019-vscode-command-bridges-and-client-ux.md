---
adr: "019"
title: VS Code extension uses client-owned command bridges and OFMarkdown UX
status: accepted
date: 2026-05-06
tags: [adr, ADR019, vscode, extension, command-bridges]
aliases: [ADR019, VS Code command bridges, extension parity UX]
---

# ADR 019 - VS Code extension uses client-owned command bridges and OFMarkdown UX

## Context

Marksman VSCode is a thin LanguageClient wrapper but still adds VS Code-specific
command bridges for showing references and following links. Flavor Grenade's VS
Code extension currently wraps the language server, shows status, registers
three commands, and assigns `ofmarkdown` language mode. The extension parity
research identified client-owned UX as the main remaining extension gap.

The LSP server must remain editor-agnostic. VS Code-specific UI behavior belongs
in the extension, but it should not duplicate OFM intelligence already owned by
the server.

## Decision

The VS Code extension owns command bridges and OFMarkdown editor UX.

The extension may register VS Code commands that adapt server-provided data to
native VS Code UI, including:

- show references using `editor.action.showReferences`
- follow a resolved target using VS Code location pickers
- open embed targets
- show backlinks and outlinks
- reveal the active vault root
- copy diagnostic information

The server may return command identifiers and JSON-serializable payloads in code
lens, code actions, or custom responses. The extension translates those payloads
into VS Code API calls. The server must not know about VS Code APIs, command
names outside the agreed `flavorGrenade.*` namespace, or extension internals.

The extension may also contribute OFMarkdown-specific snippets, language
configuration, keybindings, and status-bar quick actions scoped to the
`ofmarkdown` language id.

## Consequences

**Positive:**

- Native VS Code UI is used where it improves references, location pickers, and
  troubleshooting.
- The server stays portable across Neovim, Helix, Zed, Emacs, and other LSP
  clients.
- The `ofmarkdown` language id becomes useful for user-facing editor behavior,
  not only classification.

**Negative:**

- Command payload contracts become another client/server integration surface.
- Extension-host tests are required to prevent VS Code API regressions.
- Other editors will not automatically receive VS Code-only UX affordances.

## Rejected Options

### Put VS Code behavior in the server

Rejected because it violates the editor-agnostic LSP architecture.

### Avoid command bridges entirely

Rejected because plain LSP responses cannot always invoke the best VS Code UI
surface, especially for references and custom vault actions.

## Cross-References

- [[research/marksman-vscode-feature-parity-ofmarkdown]]
- [[features/vscode-extension-parity]]
- [[requirements/vscode-extension-parity]]
- [[ddd/editor-client/domain-model]]
- `extension/docs/index.md`
