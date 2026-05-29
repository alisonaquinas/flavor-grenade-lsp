# Flavor Grenade Troubleshooting

Use **Flavor Grenade: Show Status Actions** first. The status menu exposes
recovery commands that match the current state. Use **Flavor Grenade: Copy
Diagnostic Info** before opening a support issue. The copied text includes
status, version, platform, vault count, document count, and a sanitized server
path summary. It does not include tokens, environment variables, or raw
command-line arguments.

## Missing Bundled Server

Status: `FG: Config` or `FG: Error`.

Actions:

- Run **Flavor Grenade: Show Output** and check the resolved server path.
- Reinstall the latest extension if the bundled server module is missing.
- Clear `flavorGrenade.server.path` unless you intentionally use a custom
  development server.
- Use **Flavor Grenade: Copy Diagnostic Info** when reporting the failure.

## Crash Loop

Status: `FG: Crashed` or repeated server restart messages in output.

Actions:

- Run **Flavor Grenade: Show Output** and review the most recent server exit.
- Run **Flavor Grenade: Restart Server** after fixing the underlying issue.
- If the crash started after an update, include copied diagnostics and the
  extension version in the report.

## Version Mismatch

Status tooltip or copied diagnostics may include:
`versionWarning: extension ... differs from server ...`.

Actions:

- Reinstall the latest extension if the warning appears after an extension
  update.
- Run **Flavor Grenade: Restart Server** after reinstalling.
- Include copied diagnostics when reporting persistent mismatches; the warning
  includes extension and server versions without exposing raw paths.

## Wrong Markdown Flavor

Expected vault Markdown should stay in VS Code's `markdown` language mode while
the Flavor Grenade Markdown flavor selector resolves to the correct flavor.
No OFMarkdown promotion should occur in the default Markdown language mode path.
Membership refresh runs after server `ready`, rebuild-index completion,
workspace folder changes, visible editor changes, and file-open events.
`Auto Detect` should resolve Obsidian vault notes to Obsidian and generic
standalone Markdown to CommonMark.

Actions:

- Confirm the workspace has `.obsidian/`, `.fgignore`, or `.fgattributes` at or
  above the note when vault indexing is expected.
- Inspect the nearest applicable `.fgattributes`. If no `flavor` attribute
  applies, Auto Detect applies from the opened directory tree.
- For precedence details, see the root
  [Markdown flavor auto-detection algorithm](../../docs/design/markdown-flavor-auto-detection.md).
- Run **Flavor Grenade: Rebuild Index** if the vault marker or file moved while
  VS Code was already open.
- Run **Flavor Grenade: Restart Server**.
- Use **Flavor Grenade: Copy Diagnostic Info** and include whether the note is
  inside the expected vault root and which flavor the selector shows.

## No Completions

Actions:

- Wait for the status to leave `FG: Indexing`.
- Run **Flavor Grenade: Rebuild Index**.
- Confirm the current file is Markdown and belongs to a vault.
- Open **Flavor Grenade: Show Output** if completions remain empty.

## Stale Index

Actions:

- Run **Flavor Grenade: Rebuild Index**.
- If files were moved externally, reopen the workspace after rebuild.
- Confirm ignored folders or attachment settings do not exclude the target.

## Restricted Mode

Status: `FG: Disabled`.

Flavor Grenade does not start the language server in Restricted Mode because
the server reads workspace files. Trust the workspace before enabling server
features. Diagnostics should report `serverPath: not started`.

Actions:

- Trust the workspace from VS Code's Workspace Trust prompt.
- Reopen the vault after trust is granted.

## Virtual Workspace

Status: `FG: Disabled`.

Flavor Grenade requires a file-system workspace so the server can scan and
watch vault files. Virtual workspaces such as web-only or readonly providers are
disabled until a file-backed workspace is opened. Diagnostics should report
`serverPath: not started`.

Actions:

- Open a local, WSL, SSH, or Dev Container folder backed by files.
- Use **Flavor Grenade: Copy Diagnostic Info** if VS Code reports a file-backed
  workspace but Flavor Grenade still shows disabled.

## Remote Workspaces

Status: `FG: Starting`, `FG: Indexing`, then `FG: Ready` for supported
file-backed WSL, SSH, and Dev Container workspaces.

Flavor Grenade runs in the workspace extension host. The Marketplace package
ships a bundled JavaScript server module that runs under the extension host's
Node runtime, so releases no longer require a platform-specific native server
binary. Use [workspace environment smoke tests](features/workspace-environments.md)
when validating a release candidate.

Actions:

- Confirm the workspace is trusted and file-backed.
- Run **Flavor Grenade: Copy Diagnostic Info** and verify `platform` matches the
  remote host or container.
- Reinstall the latest extension if the bundled server module is missing.
