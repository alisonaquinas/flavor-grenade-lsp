---
title: "Compatibility and Direct LSP Integration | Flavor Grenade LSP"
description: "Use the supported VS Code extension path first; direct LSP clients own advanced setup."
h1: "Compatibility and Direct LSP Integration"
summary: "Use the VS Code extension for the smooth path; use direct LSP integration when your editor can own the setup."
related: ["howToVsCodeExtension","advancedConfigurationModel","advancedVaultSingleFileMode"]
---

# Compatibility and Direct LSP Integration

Use the VS Code extension for the smooth path; use direct LSP integration when your editor can own the setup.

## Supported path

The VS Code extension packages the server, handles activation, and is the recommended setup for most users.

The extension path should be boring in the best way: install, open a vault or configured Markdown project, wait for ready status, and start using completion or diagnostics. Current releases use a bundled JavaScript server module at `server/main.js` instead of platform-specific native server payloads.

## Install the server from npm

For direct LSP use, install the language server package with npm in the environment where your editor client will launch it. This does not install the VS Code extension or configure an editor by itself.

Use a local project install when you want the server pinned with the workspace, or use `npx` for a quick test. Your client still needs to start the command over stdio and send a usable `rootUri`.

```text
npm install --save-dev flavor-grenade-lsp
npx flavor-grenade-lsp
```

## Direct LSP clients

Direct clients must launch the server, provide a usable file `rootUri`, send configuration, and handle file watching.

The root URI is not cosmetic. It decides whether Flavor Grenade can find `.obsidian/`, `.fgignore`, or `.fgattributes`, build a vault index, confine local paths, and provide vault-wide features such as note completion, references, and rename.

```json
{
  "rootUri": "file:///Users/alex/MyVault",
  "workspaceFolders": [
    { "uri": "file:///Users/alex/MyVault", "name": "MyVault" }
  ],
  "initializationOptions": {
    "linkStyle": "file-stem",
    "completionCandidates": 50,
    "diagnosticsSuppress": [],
    "fgConfigMaxBytes": 8192
  },
  "capabilities": {
    "workspace": {
      "configuration": true,
      "didChangeWatchedFiles": { "dynamicRegistration": true }
    }
  }
}
```

If your client sends workspace configuration after initialize, use the server notification shape. VS Code exposes the public setting as `flavorGrenade.fgConfig.maxBytes`; direct clients send the server-facing `fgConfigMaxBytes` value:

```json
{
  "settings": {
    "flavorGrenade": {
      "fgConfigMaxBytes": 8192
    }
  }
}
```

Direct server options such as `linkStyle`, `completionCandidates`, `diagnosticsSuppress`, and the `.fgignore` / `.fgattributes` read cap `fgConfigMaxBytes` belong in `initializationOptions`. Flavor and structured-profile persistence belongs in `.fgattributes`. A client may also send `fgConfigMaxBytes` in `workspace/didChangeConfiguration` when exposing a live settings UI.

For a project-level override, put `.fgattributes` at the project root:

```gitattributes
*.md flavor=commonmark
docs/api/*.md flavor=pandoc
docs/decisions/*.md flavor=commonmark structured_profiles=madr
CHANGELOG.md flavor=gfm structured_profiles=keep-a-changelog
```

Use `.fgignore` for Markdown that should not enter the index:

```gitignore
generated/
private/
!private/README.md
```

Use `structured_profiles=none` when a repository should not apply structured-document behavior.

## Initialize shape

A minimal direct-client flow is:

```text
spawn: npx flavor-grenade-lsp
send: initialize with file rootUri and workspaceFolders
send: initialized
watch: Markdown files, .obsidian/, .fgignore, and .fgattributes
send: didOpen/didChange/didClose for open documents
```

The server accepts normal LSP initialize parameters. Flavor-specific initialization data is not read from initialize options; direct clients with a selector UI should write `.fgattributes` or ask the user to edit it.

```json
{
  "processId": 12345,
  "rootUri": "file:///Users/alex/DocsProject",
  "workspaceFolders": [
    { "uri": "file:///Users/alex/DocsProject", "name": "DocsProject" }
  ]
}
```

## Compatibility boundary

The server speaks LSP, but non-VS-Code clients may need custom transport and configuration work.

If a direct client can launch a Node-based stdio language server and send normal LSP initialize parameters, it has the right starting point. If it cannot provide a stable file root, expect single-file behavior and CommonMark fallback rather than full vault behavior.

## Practical check

A direct-client example should include both the command that launches the npm-installed server and the initialize data the client sends afterward. Installing the package is only half the work; the client still owns stdio transport, workspace folders, root URI selection, configuration, file watching, and restart behavior.

Keep the VS Code article linked from here because it is the supported path for most readers. Direct integration is for editor maintainers, advanced users, and test harnesses that already understand LSP wiring.
