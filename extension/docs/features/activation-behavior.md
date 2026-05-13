---
title: VS Code Activation Behavior
tags: [extension/docs, features, vscode, activation]
aliases: [Extension Activation Behavior, Activation Precision]
---

# VS Code Activation Behavior

Flavor Grenade is active for vault-shaped workspaces and idle for generic
Markdown startup. The behavior is intentionally narrower than "start whenever a
Markdown file opens" so ordinary Markdown editing stays lightweight.

## Active Startup

The extension activates automatically when the workspace contains either vault
marker:

| Signal | User-visible result |
|---|---|
| `.obsidian/` | Extension activates and starts vault membership detection. |
| `.flavor-grenade.toml` | Extension activates and starts vault membership detection. |

Once the server confirms vault membership, matching Markdown documents keep the
built-in `markdown` language id and resolve to the `obsidian` Markdown flavor.
Generic Markdown stays `markdown` and auto-detects conservatively; manually
selected non-Markdown modes are preserved.

Effective flavor precedence is defined by the root
[Markdown flavor auto-detection algorithm](../../../docs/design/markdown-flavor-auto-detection.md).

## Idle Startup

If a workspace contains Markdown files but has no `.obsidian/` directory and no
`.flavor-grenade.toml` file, Flavor Grenade stays idle at startup. The extension
may be activated by VS Code language events, but it must not start vault
indexing until a positive vault signal appears.

This means opening a README or other ordinary `.md` file outside a vault keeps
VS Code's normal Markdown behavior.

## Language Wake

Opening `markdown` files can wake the extension so it can run
the same startup checks used for vault-marker activation. Language wake is not a
shortcut around those checks:

- `markdown` documents can participate in Flavor Grenade behavior when their
  effective flavor is detected or selected.
- `markdown` documents remain generic unless vault membership detection or an
  explicit selector override says otherwise.
- No vault marker means no automatic vault indexing.

## Command Wake

Explicit `flavorGrenade.*` commands can wake the extension from idle:

| Command | Wake behavior |
|---|---|
| `flavorGrenade.restartServer` | Wakes the extension and reruns startup checks before restart work. |
| `flavorGrenade.rebuildIndex` | Wakes the extension and asks the server to rebuild any indexable vault it can detect. |
| `flavorGrenade.showOutput` | Wakes the extension enough to show troubleshooting output. |
| `flavorGrenade.showStatusActions` | Wakes the extension enough to show available recovery actions for the current status. |
| `flavorGrenade.openTroubleshooting` | Opens the extension troubleshooting document without starting the server. |
| `flavorGrenade.copyDiagnosticInfo` | Copies sanitized extension status and support details. |
| `flavorGrenade.revealVaultRoot` | Reveals the active vault root when one is known. |

Command wake should not be read as proof that a vault exists. A command can
start extension-side handling, but indexing still depends on `.obsidian/`,
`.flavor-grenade.toml`, or another positive vault signal.

## Trace

This page documents Phase E7 activation precision. It supports the extension
parity requirements `Extension.Activation.VaultPrecision` and
`Extension.Activation.MarkerEvents`.

Related root docs:

- `docs/plans/phase-E7-activation-precision.md`
- `docs/design/markdown-flavor-auto-detection.md`
- `docs/requirements/functional/vscode-extension-parity.md`
- `docs/features/vscode-extension-parity.md`
