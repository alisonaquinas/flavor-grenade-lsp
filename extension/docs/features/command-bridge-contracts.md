---
title: Command Bridge Contracts
tags: [extension/docs, features, vscode, command-bridges]
aliases: [Command Bridge Contracts, Phase E8 Command Contracts]
---

# Command Bridge Contracts

Phase E8 command bridges adapt server-provided OFMarkdown intelligence to VS
Code UI. The server owns link, embed, reference, and graph intelligence. The
extension owns VS Code commands, payload validation, and native UI calls.

The extension must not re-resolve wiki-link target text. For example,
`[[sources/foo]]` may be resolved by the server to
`file:///vault/wiki/sources/foo.md` through Obsidian-style path-suffix matching.
Bridge handlers must open the supplied `JsonLocation.uri` exactly after payload
validation.

Bridge payloads must be plain JSON values. Do not pass VS Code `Uri`,
`Position`, `Range`, `Location`, class instances, functions, symbols, or other
non-serializable values across the command boundary.

Invalid payloads fail safely. A bridge rejects malformed data before calling VS
Code APIs, reports a command-payload error, and returns without throwing an
uncaught extension-host exception.

## Shared Payload Types

All positions are zero-based, non-negative integers.

```typescript
interface JsonPosition {
  line: number;
  character: number;
}

interface JsonRange {
  start: JsonPosition;
  end: JsonPosition;
}

interface JsonLocation {
  uri: string;
  range: JsonRange;
}
```

`uri` must be a non-empty `file:` URI string. `range.end` must not come before
`range.start`.

## Bridge Commands

| Command | Payload | Native VS Code surface |
|---|---|---|
| `flavorGrenade.showReferences` | `ReferencesPayload` | `editor.action.showReferences` |
| `flavorGrenade.followLink` | `TargetPayload` | Open target document with selection |
| `flavorGrenade.openEmbedTarget` | `TargetPayload` | Open target note or asset with selection |
| `flavorGrenade.showBacklinks` | `ReferencesPayload` | `editor.action.showReferences` |
| `flavorGrenade.showOutlinks` | `ReferencesPayload` | `editor.action.showReferences` |
| `flavorGrenade.revealVaultRoot` | `UriPayload` | `revealInExplorer` |
| `flavorGrenade.copyDiagnosticInfo` | `DiagnosticInfoPayload` | Clipboard write |

### ReferencesPayload

Used by `showReferences`, `showBacklinks`, and `showOutlinks`.

```typescript
interface ReferencesPayload {
  uri: string;
  position: JsonPosition;
  locations: JsonLocation[];
}
```

`uri` is the source document. `position` is the source position VS Code anchors
in the reference UI. `locations` must contain at least one target location.

### TargetPayload

Used by `followLink` and `openEmbedTarget`.

```typescript
interface TargetPayload {
  target: JsonLocation;
}
```

`target.uri` may point at a Markdown note or an embed asset, but it must still
be a `file:` URI string. `target.range` becomes the editor selection when VS
Code opens the document.

### UriPayload

Used by `revealVaultRoot`.

```typescript
interface UriPayload {
  uri: string;
}
```

`uri` is the vault root or folder to reveal in Explorer.

### DiagnosticInfoPayload

Used by `copyDiagnosticInfo`.

```typescript
interface DiagnosticInfoPayload {
  text: string;
}
```

`text` must be a non-empty string. The bridge copies it without requiring
server-specific diagnostic classes in the extension bundle.

## Trace

These contracts implement Phase E8 and the extension parity requirements:

- `docs/plans/phase-E8-command-bridges-native-navigation.md`
- `docs/requirements/functional/vscode-extension-parity.md`
- `docs/adr/ADR019-vscode-command-bridges-and-client-ux.md`
