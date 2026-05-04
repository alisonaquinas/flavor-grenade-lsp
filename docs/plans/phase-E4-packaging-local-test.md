---
title: "Phase E4: Packaging & Local Test"
phase: E4
status: planned
tags: [extension, packaging, vsix, marketplace, testing]
updated: 2026-04-21
---

# Phase E4: Packaging & Local Test

| Field      | Value |
|------------|-------|
| Phase      | E4 |
| Title      | Packaging & Local Test |
| Status     | ⏳ planned |
| Gate       | `vsce package` produces an installable VSIX; manual test passes with completions, diagnostics, commands, and status bar all working |
| Depends on | Phase E3 (Status Bar & Commands) |

---

## Objective

Add Marketplace assets (README, CHANGELOG, LICENSE, icon), package the extension with `vsce package` for the host platform, verify VSIX contents, install locally, and smoke test end-to-end. Gate: `vsce package` produces an installable VSIX; manual test passes with completions, diagnostics, commands, and status bar all working.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/README.md` | Create | Marketplace-facing README |
| `extension/CHANGELOG.md` | Create | Extension changelog |
| `extension/LICENSE` | Create | MIT license text (copy from repo root) |
| `extension/images/icon.png` | Create | 256x256 extension icon (placeholder for dev) |

---

## Task List

- [ ] **1. Add Marketplace assets**

  Write `extension/README.md` with this exact content:

  ```markdown
  # Flavor Grenade — Obsidian Markdown Support

  Language intelligence for [Obsidian Flavored Markdown](https://help.obsidian.md/Editing+and+formatting/Obsidian+Flavored+Markdown) in Visual Studio Code. Powered by the [flavor-grenade-lsp](https://github.com/alisonaquinas/flavor-grenade-lsp) language server.

  ## Features

  - **Completions** — `[[` triggers wiki-link completions across the vault; `#` triggers tag completions; heading and block-anchor completions inside links
  - **Diagnostics** — Broken wiki-links (`BrokenLink`), ambiguous links (`AmbiguousLink`), broken embeds (`BrokenEmbed`), malformed frontmatter (`MalformedFrontmatter`)
  - **Go to Definition** — Navigate from `[[wiki-link]]` to the target document, heading, or block anchor
  - **Rename** — Rename a document or heading and update all incoming references across the vault
  - **Code Actions** — Quick-fix to create a missing linked document; extract selection to new note
  - **Code Lens** — Inline reference counts on headings and documents
  - **Semantic Tokens** — Syntax highlighting for wiki-links, tags, embeds, and block references

  ## Configuration

  | Setting | Type | Default | Description |
  |---------|------|---------|-------------|
  | `flavorGrenade.server.path` | `string` | `""` | Custom path to the language server binary. Leave empty to use the bundled binary. |
  | `flavorGrenade.linkStyle` | `string` | `"file-stem"` | Wiki-link completion style. Options: `file-stem`, `relative-path`. |
  | `flavorGrenade.completion.candidates` | `number` | `50` | Maximum number of completion items returned. |
  | `flavorGrenade.diagnostics.suppress` | `string[]` | `[]` | Diagnostic codes to suppress (e.g. `["AmbiguousLink", "BrokenEmbed"]`). |
  | `flavorGrenade.trace.server` | `string` | `"off"` | Trace communication between VS Code and the language server. Options: `off`, `messages`, `verbose`. |

  ## Getting Started

  1. Install **Flavor Grenade** from the [VS Code Marketplace](https://marketplace.visualstudio.com/).
  2. Open an Obsidian vault folder in VS Code.
  3. Open any `.md` file — the language server starts automatically.

  That's it. Wiki-link completions, diagnostics, go-to-definition, and all other features activate as soon as the server finishes indexing your vault. The status bar shows indexing progress.

  ## Commands

  Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type "Flavor Grenade":

  - **Flavor Grenade: Restart Server** — Stop and restart the language server
  - **Flavor Grenade: Rebuild Index** — Re-scan the vault and rebuild the document index
  - **Flavor Grenade: Show Output** — Open the language server output channel for troubleshooting

  ## Requirements

  - VS Code 1.93.0 or later
  - An Obsidian vault (any folder containing `.md` files works)

  ## Links

  - [Source code](https://github.com/alisonaquinas/flavor-grenade-lsp)
  - [Issue tracker](https://github.com/alisonaquinas/flavor-grenade-lsp/issues)
  - [Changelog](CHANGELOG.md)

  ## License

  [MIT](LICENSE)
  ```

  Write `extension/CHANGELOG.md` with this exact content:

  ```markdown
  # Changelog

  ## [0.1.0] — Unreleased

  ### Added

  - Initial release: LanguageClient wrapper for flavor-grenade-lsp
  - Status bar showing vault indexing state and document count
  - Commands: Restart Server, Rebuild Index, Show Output
  - Configuration: server path override, link style, completion candidates, diagnostics suppress, trace level
  ```

  Copy LICENSE from the repo root:

  ```bash
  cp LICENSE extension/LICENSE
  ```

  Create placeholder icon directory and 256x256 PNG:

  ```bash
  mkdir -p extension/images
  ```

  Then create a 256x256 PNG at `extension/images/icon.png`. This can be a minimal placeholder (e.g. a solid-color square with a letter "FG"). The icon must be PNG format, at least 128x128 pixels. SVG is not allowed by the Marketplace.

  Commit.

- [ ] **2. Package and test VSIX locally**

  Build server binary for host platform:

  - Linux / macOS:

    ```bash
    bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp
    ```

  - Windows:

    ```bash
    bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp.exe
    ```

  Note: local builds omit `--bytecode` (CI-only optimization for faster startup) and `--target` (compiles for host platform).

  Build extension client:

  ```bash
  cd extension && npm run build:extension
  ```

  Package VSIX:

  ```bash
  cd extension && npx vsce package
  ```

  Expected: produces `flavor-grenade-0.1.0.vsix`.

  Inspect VSIX contents:

  ```bash
  unzip -l extension/flavor-grenade-0.1.0.vsix | head -30
  ```

  Expected entries:
  - `extension/dist/extension.js`
  - `extension/server/flavor-grenade-lsp`
  - `extension/package.json`
  - `extension/README.md`
  - `extension/LICENSE`
  - `extension/CHANGELOG.md`
  - `extension/images/icon.png`

  Must NOT contain:
  - `src/`
  - `node_modules/`
  - `tsconfig.json`
  - `*.ts`
  - `*.test.*`

  Note: VSIX internal paths use `extension/` prefix because `vsce` wraps contents in an `extension/` subdirectory. This is the VSIX root, not the repo's `extension/` directory.

  Install locally:

  ```bash
  code --install-extension extension/flavor-grenade-0.1.0.vsix
  ```

  Open a vault directory in VS Code, open a `.md` file.

  Expected behavior:
  - Extension activates
  - Status bar shows "FG: Starting..." then "FG: Indexing..." then "FG: N docs"
  - Completions appear on `[[`, `#`, etc.

  Verify commands via Command Palette (`Ctrl+Shift+P`):

  - **"Flavor Grenade: Restart Server"** — server restarts, status bar cycles through Starting/Indexing/Ready states
  - **"Flavor Grenade: Rebuild Index"** — status bar flashes "Indexing..." then returns to document count
  - **"Flavor Grenade: Show Output"** — output channel opens showing server logs

  Add `*.vsix` to `extension/.gitignore` if not already present. Check the current content of `extension/.gitignore` — if it already contains `*.vsix`, skip this step.

  Commit.

---

## Gate Verification

```bash
cd extension && npx vsce package
code --install-extension extension/flavor-grenade-0.1.0.vsix
# Open a vault in VS Code → open .md file → verify status bar, completions, commands
```

---

## References

- `[[plans/phase-E1-extension-scaffold]]`
- `[[plans/phase-E3-status-bar-commands]]`
- `[[docs/research/vscode-extension-publishing]]`
- `[[plans/phase-13-ci-delivery]]`
