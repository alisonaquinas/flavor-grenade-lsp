---
title: Feature — OFMarkdown Language Mode
tags: [features/, ofmarkdown, vscode, extension, language-mode]
aliases: [OFMarkdown language mode, ofmarkdown, VS Code OFMarkdown mode]
---

# Feature — OFMarkdown Language Mode

OFMarkdown language mode is a VS Code extension feature that assigns a distinct language id, `ofmarkdown`, to open documents that Flavor Grenade recognizes as Obsidian Flavored Markdown vault documents. The feature gives users a VS Code-level handle for OFM-specific settings and future extension contributions without claiming every `.md` file globally.

This feature is editor-client behavior. The language server remains the source of OFM intelligence and vault membership; the extension owns VS Code language id assignment.

## User-Visible Behavior

When a user opens a Markdown document in a VS Code workspace:

| Document context | Initial VS Code mode | Settled VS Code mode |
|---|---|---|
| Inside a directory with `.obsidian/` | `markdown` | `ofmarkdown` |
| Inside a server-indexed Flavor Grenade vault | `markdown` | `ofmarkdown` |
| Generic Markdown outside any vault/index | `markdown` | `markdown` |
| User manually selected another language id | user-selected mode | user-selected mode |

The language picker should display **OFMarkdown** for promoted documents.

## Language Contribution

The extension manifest contributes a new language:

```json
{
  "id": "ofmarkdown",
  "aliases": ["OFMarkdown", "Obsidian Flavored Markdown"],
  "configuration": "./language-configuration.json"
}
```

The contribution intentionally omits `.md` from `extensions`. VS Code should continue opening `.md` files as built-in `markdown` until the extension promotes only qualifying documents.

The extension also contributes Markdown-compatible grammar support for `ofmarkdown` so promotion preserves baseline Markdown highlighting. OFM-specific highlighting remains the responsibility of LSP semantic tokens, documented in [[features/semantic-tokens]].

## Detection Signals

Language-mode assignment uses two signals.

### Early Client Signal

The extension may walk ancestor directories for the active file URI and detect `.obsidian/`. This is a fast startup optimization that lets standard Obsidian vault documents become `ofmarkdown` before the server finishes indexing.

This signal is positive-only. If `.obsidian/` is not found, the extension must wait for server-authoritative membership before deciding.

### Server-Authoritative Signal

The server owns the actual workspace model and index. After the LanguageClient starts, the extension asks whether each visible or newly opened document URI is a Flavor Grenade document.

The planned custom request is:

```typescript
// Client -> server
// Method: "flavorGrenade/documentMembership"
interface DocumentMembershipParams {
  uri: string;
}

interface DocumentMembershipResult {
  isOfMarkdown: boolean;
  indexed: boolean;
  vaultRoot?: string;
  reason: 'obsidian-vault' | 'flavor-config-vault' | 'single-file' | 'not-indexed';
}
```

`isOfMarkdown` is true when the URI belongs to a multi-file `VaultFolder` or is otherwise present in the server's index as an OFM document. `single-file` does not promote by default because the user asked for vault/index-triggered language mode, not generic standalone Markdown assignment.

## Assignment Rules

The extension calls `vscode.languages.setTextDocumentLanguage(document, 'ofmarkdown')` only when all of these are true:

1. `document.uri.scheme === 'file'`
2. `document.languageId === 'markdown'`
3. Detection has produced a positive early or server-authoritative signal
4. No assignment is already in flight for the document URI

The extension may call `setTextDocumentLanguage(document, 'markdown')` only when the document is currently `ofmarkdown`, the server reports it is not indexed, and no `.obsidian/` ancestor exists. Reversion is optional in the first implementation; if implemented, it must obey the same loop guard.

The extension must not change documents whose language id is neither `markdown` nor `ofmarkdown`.

## LanguageClient Selector

The LanguageClient must include both language ids:

```typescript
const documentSelector = [
  { scheme: 'file', language: 'markdown' },
  { scheme: 'file', language: 'ofmarkdown' },
];
```

This lets the server receive the initial `markdown` open event before promotion and continue serving the document after VS Code reopens it as `ofmarkdown`.

## Loop Safety

VS Code's `setTextDocumentLanguage` API closes and reopens the document internally. The extension must guard against loops by tracking in-flight assignments per URI and ignoring the synthetic reopen if the document already has the desired language id.

Language mode changes must not restart the LanguageClient. Server restarts remain reserved for explicit restart commands, server crashes, custom server path changes, and initialization option changes.

## Commands and Diagnostics

No user-facing command is required for v1. The implementation may add an internal refresh function used by activation, visible editor changes, workspace folder changes, and status readiness events.

No new server diagnostics are required. Failure to promote should be surfaced through extension tests and logs, not document diagnostics.

## Acceptance Summary

- `ofmarkdown` appears as a selectable VS Code language mode.
- `.md` files are not globally claimed.
- Vault/index Markdown documents are promoted automatically.
- Generic Markdown stays `markdown`.
- Manual non-Markdown language selections are preserved.
- Markdown grammar/highlighting parity is preserved.
- LSP features continue before and after promotion.

## Related

- [[adr/ADR016-ofmarkdown-language-mode]]
- [[requirements/ofmarkdown-language-mode]]
- `docs/bdd/features/ofmarkdown-language-mode.feature`
- [[ddd/editor-client/domain-model]]
- [[superpowers/specs/2026-04-21-vscode-extension-design]]
- [[features/semantic-tokens]]
