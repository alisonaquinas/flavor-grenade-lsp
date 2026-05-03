---
adr: "016"
title: Dynamic OFMarkdown language mode for VS Code vault documents
status: accepted
date: 2026-05-03
tags: [adr, ADR016, vscode, extension, language-mode]
aliases: [ADR016, ofmarkdown language mode, dynamic language mode]
---

# ADR 016 — Dynamic OFMarkdown language mode for VS Code vault documents

## Context

The VS Code extension currently activates for the built-in `markdown` language and starts the Flavor Grenade language server for Markdown files. This gives vault-aware LSP features, but it does not give VS Code a distinct language identity for Obsidian Flavored Markdown (OFM) documents. Users cannot target settings, keybindings, snippets, syntax grammar, or future theme rules specifically at documents that Flavor Grenade has recognized as vault documents.

VS Code supports custom language identities through `contributes.languages`, language-specific activation events such as `onLanguage:<id>`, language-feature selectors through `DocumentSelector`, TextMate grammars through `contributes.grammars`, and changing an open document's language id through `vscode.languages.setTextDocumentLanguage(document, languageId)`. The last API triggers a close/open event pair for the document, so the extension must guard against loops and stale client state.

The requested behavior is:

- Add a new VS Code language mode named **OFMarkdown**.
- Apply it when Flavor Grenade detects that an open document is part of an Obsidian vault and/or belongs to the server's index.
- Do not globally claim every `.md` file as OFMarkdown.

## Decision

Add a VS Code language id `ofmarkdown` with aliases `OFMarkdown` and `Obsidian Flavored Markdown`. The language contribution must not bind `.md` globally via `extensions`, `filenames`, or `firstLine`; `.md` files continue to open as VS Code's built-in `markdown` until the extension determines that the document qualifies.

The extension owns language-mode assignment because VS Code language ids are editor-client state, not LSP server state. The server remains authoritative for vault/index membership. Detection has two stages:

1. **Client-side early signal:** if a file document's ancestor directory contains `.obsidian/`, the extension may immediately promote `markdown` to `ofmarkdown`.
2. **Server-authoritative signal:** after the language server is running and indexing status is available, the extension asks the server whether a document URI is indexed or belongs to a vault. A positive answer promotes the document to `ofmarkdown`; a negative answer leaves it as `markdown`.

The extension must register the `LanguageClient` for both `markdown` and `ofmarkdown` documents so the server can participate during detection and continue serving after promotion:

```json
[
  { "scheme": "file", "language": "markdown" },
  { "scheme": "file", "language": "ofmarkdown" }
]
```

The extension must use a loop guard around `setTextDocumentLanguage` because VS Code reopens the document after the language id changes. It must never override a user-selected language id other than `markdown` or `ofmarkdown`.

The extension must provide Markdown-compatible grammar and language configuration for `ofmarkdown` so promotion does not degrade highlighting, comments, brackets, or editor behavior. OFM-specific semantic tokens continue to come from the language server.

## Consequences

**Positive:**

- Users can target `"[ofmarkdown]"` VS Code settings separately from generic Markdown.
- Future OFM snippets, syntax grammar extensions, and command enablement can target a stable language id.
- Non-vault Markdown files remain unaffected.
- The LSP server remains editor-agnostic and does not gain VS Code-only responsibilities.

**Negative:**

- Changing language mode reopens the document from VS Code's perspective, so client logic must avoid activation and notification loops.
- There is a brief startup window where a qualifying document may still display as `markdown` until detection completes.
- The extension must maintain a Markdown-compatible grammar/configuration for the custom language id.

## Rejected Options

### Globally associate `.md` with `ofmarkdown`

Rejected because it would hijack every Markdown file in VS Code, including non-vault project READMEs and generic Markdown documents. Flavor Grenade is OFM-oriented, but the extension must not make non-vault Markdown behave like OFM.

### Keep only `markdown` and expose vault status through the status bar

Rejected because status alone does not let users configure VS Code behavior per OFM document.

### Have the server send a command to change language mode

Rejected because language mode is VS Code client state. The server can report membership, but the extension must call VS Code APIs.

## Cross-References

- [[features/ofmarkdown-language-mode]]
- [[requirements/ofmarkdown-language-mode]]
- `docs/bdd/features/ofmarkdown-language-mode.feature`
- [[ddd/editor-client/domain-model]]
- [[superpowers/specs/2026-04-21-vscode-extension-design]]
- [[adr/ADR015-platform-specific-vsix]]
