# Flavor Grenade Troubleshooting

Use **Flavor Grenade: Show Status Actions** first. The status menu exposes
recovery commands that match the current state. Use **Flavor Grenade: Copy
Diagnostic Info** before opening a support issue. The copied text includes
status, version, platform, vault count, document count, and a sanitized server
path summary. It does not include tokens, environment variables, or raw
command-line arguments.

## Missing Server Binary

Status: `FG: Config` or `FG: Error`.

Actions:

- Run **Flavor Grenade: Show Output** and check the resolved server path.
- Reinstall the platform-specific VSIX if the bundled binary is missing.
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

- Reinstall the latest platform-specific VSIX if the warning appears after an
  extension update.
- Run **Flavor Grenade: Restart Server** after reinstalling.
- Include copied diagnostics when reporting persistent mismatches; the warning
  includes extension and server versions without exposing raw paths.

## No OFMarkdown Promotion

Expected vault Markdown should switch from `markdown` to `ofmarkdown`.
Membership refresh runs after server `ready`, rebuild-index completion,
workspace folder changes, visible editor changes, and file-open events.
Existing `ofmarkdown` documents return to `markdown` only when no local vault
marker applies and the server explicitly reports that the document is outside
the indexed vault.

Actions:

- Confirm the workspace has `.obsidian/` or `.flavor-grenade.toml` at or above
  the note.
- Run **Flavor Grenade: Rebuild Index** if the vault marker or file moved while
  VS Code was already open.
- Run **Flavor Grenade: Restart Server**.
- Use **Flavor Grenade: Copy Diagnostic Info** and include whether the note is
  inside the expected vault root.

## No Completions

Actions:

- Wait for the status to leave `FG: Indexing`.
- Run **Flavor Grenade: Rebuild Index**.
- Confirm the current file is Markdown or OFMarkdown and belongs to a vault.
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

Status: `FG: Starting`, `FG: Indexing`, then `FG: N docs` for supported
file-backed WSL, SSH, and Dev Container workspaces.

Flavor Grenade runs in the workspace extension host, so the bundled server
binary must match the host where the files live, not necessarily the desktop UI
operating system. Use [workspace environment smoke tests](features/workspace-environments.md)
when validating a release candidate.

Actions:

- Confirm the workspace is trusted and file-backed.
- Run **Flavor Grenade: Copy Diagnostic Info** and verify `platform` matches the
  remote host or container.
- Reinstall the platform-specific VSIX for the host if the server binary is
  missing.
