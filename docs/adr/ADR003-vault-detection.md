---
adr: "003"
title: Vault detection via .obsidian/ directory with .flavor-grenade.toml fallback
status: accepted
date: 2026-04-16
---

# ADR 003 — Vault detection via .obsidian/ directory with .flavor-grenade.toml fallback

## Context

The LSP server operates in one of two modes: **vault mode**, in which an entire directory tree of Markdown files is indexed and cross-file features (diagnostics, completions, find-references) are fully enabled; and **single-file mode**, in which only the currently open document is analysed and cross-file features are suppressed.

Vault mode requires knowing the root of the vault — the directory that contains all notes and forms the namespace for wiki-link resolution. Without a reliable detection mechanism, the server cannot know whether the folder containing the current `.md` file is a deliberate collection or just a directory.

Three detection strategies were evaluated:

**Strategy 1 — Require `.obsidian/` directory.** Obsidian always creates a `.obsidian/` directory at vault root when it opens a folder. This directory contains `app.json`, `workspace.json`, plugin data, and theme settings. It is the most authoritative signal that a directory is an Obsidian vault. However, users who write OFM with other tools (Foam, Logseq exports, custom scripts) will not have this directory.

**Strategy 2 — Require `.flavor-grenade.toml`.** An explicit opt-in configuration file created by the user signals intent. This is the most conservative approach and avoids accidentally treating any directory with `.md` files as a vault. However, it creates friction for the primary target user (Obsidian users) who just open their vault and expect things to work.

**Strategy 3 — Either signal is sufficient.** Vault mode is activated if either `.obsidian/` or `.flavor-grenade.toml` is found by walking up from the workspace root provided via the LSP `initialize` request. This satisfies both Obsidian users (zero configuration) and non-Obsidian OFM users (explicit opt-in).

The LSP `initialize` request provides a `rootUri` (or `workspaceFolders`). Detection walks up from `rootUri` looking for either signal. If neither is found anywhere in the directory chain, the server enters single-file mode.

## Decision

**Primary detection:** presence of a `.obsidian/` directory in or above `rootUri`.
**Secondary detection:** presence of a `.flavor-grenade.toml` file in or above `rootUri`.
**Either signal** triggers vault mode. **Neither signal** → single-file mode.

The directory that contains the detected signal is the vault root. The vault index (see [[plans/phase-04-vault-index]]) is built from all `.md` files recursively under the vault root, respecting any `exclude` patterns defined in `.flavor-grenade.toml`.

Configuration values from `.flavor-grenade.toml` are merged on top of built-in defaults regardless of whether `.obsidian/` was the triggering signal. If `.flavor-grenade.toml` is absent, all defaults apply.

## Consequences

**Positive:**
- Obsidian users get vault mode with zero configuration. Opening the vault folder in their editor is sufficient.
- Non-Obsidian OFM users (Foam, Logseq export workflows, custom toolchains) can opt in by creating `.flavor-grenade.toml`.
- Single-file mode is a safe, usable fallback: diagnostics that require cross-file resolution are suppressed per [[features/diagnostics]] rather than producing false positives.
- Detection is deterministic and stateless — no heuristics, no content sampling.

**Negative:**
- A directory that contains `.obsidian/` that is NOT the intended vault root (e.g., a nested archive folder) could trigger vault mode for the wrong root. This is an edge case; Obsidian does not normally create nested `.obsidian/` directories.
- Users in single-file mode who expect broken-link diagnostics will be confused. Documentation must clearly explain the fallback.

**Neutral:**
- `.flavor-grenade.toml` is also the project-wide configuration file. Its presence as a vault-detection signal is a useful side-effect of requiring users to create it for configuration purposes.

## Related

- [[ADR001-stdio-transport]]
- [[concepts/workspace-model]]
- [[plans/phase-04-vault-index]]
- [[requirements/workspace]]
- [[ADR002-ofm-only-scope]]
