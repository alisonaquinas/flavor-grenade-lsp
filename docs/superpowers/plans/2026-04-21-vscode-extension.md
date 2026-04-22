# VS Code Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a VS Code extension that bundles the flavor-grenade-lsp server binary and provides Obsidian Flavored Markdown intelligence with zero separate installation.

**Architecture:** Thin extension client (~200 lines) using `vscode-languageclient@9.x` to spawn the bundled Bun-compiled server binary over stdio. Platform-specific VSIXs for 7 targets. Extension lives in a new `extension/` directory at the repo root, with its own `package.json`, `tsconfig.json`, and build tooling independent from the server.

**Tech Stack:** TypeScript, `vscode-languageclient@^9.0.1`, `@types/vscode@~1.93.0`, esbuild (client bundling), `@vscode/vsce` (packaging/publishing), Bun (server cross-compilation).

**Spec:** [[superpowers/specs/2026-04-21-vscode-extension-design]]
**ADR:** [[ADR015-platform-specific-vsix]]

---

## Phase Overview

| Phase | Name | Deliverable | Gate |
|---|---|---|---|
| E1 | Extension Scaffold | `extension/` directory with package.json, tsconfig, esbuild config. `npm run build:extension` exits 0. | Build produces `dist/extension.js` |
| E2 | LanguageClient Core | `extension.ts` with binary resolution, LanguageClient config, activate/deactivate lifecycle. | Extension activates and spawns server in VS Code Extension Development Host |
| E3 | Status Bar & Commands | Status bar widget, 3 palette commands, config change watcher. | Commands appear in palette; status bar shows server state |
| E4 | Packaging & Local Test | `.vscodeignore`, `vsce package` for host platform, local VSIX install test. | `vsce package` produces installable VSIX |
| E5 | CI/CD Pipeline | `extension-release.yml` with 7-target matrix build and publish job. | All 7 VSIXs build on tag push |

---

## Phase E1 — Extension Scaffold

### File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/package.json` | Create | Extension manifest — identity, activation, contributes, scripts |
| `extension/tsconfig.json` | Create | TypeScript config for extension client (Node target) |
| `extension/src/extension.ts` | Create | Stub entry point — exports empty activate/deactivate |
| `extension/.vscodeignore` | Create | Exclude non-shipping files from VSIX |
| `extension/.gitignore` | Create | Exclude build output, node_modules, server binaries, VSIXs |

---

### Task E1.1: Create extension directory and package.json

**Files:**
- Create: `extension/package.json`

- [ ] **Step 1: Create `extension/` directory**

```bash
cd flavor-grenade-lsp && mkdir -p extension
```

- [ ] **Step 2: Write `extension/package.json`**

```json
{
  "name": "flavor-grenade",
  "displayName": "Flavor Grenade — Obsidian Markdown Support",
  "description": "Language intelligence for Obsidian Flavored Markdown: wiki-links, tags, embeds, block references, and more.",
  "version": "0.1.0",
  "publisher": "alisonaquinas",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/alisonaquinas/flavor-grenade-lsp"
  },
  "engines": {
    "vscode": "^1.93.0"
  },
  "categories": ["Programming Languages", "Linters"],
  "keywords": ["obsidian", "markdown", "wiki-links", "lsp", "zettelkasten", "llm-wiki"],
  "extensionKind": ["workspace"],
  "main": "./dist/extension.js",
  "icon": "images/icon.png",
  "activationEvents": ["onLanguage:markdown"],
  "contributes": {
    "commands": [
      {
        "command": "flavorGrenade.restartServer",
        "title": "Flavor Grenade: Restart Server"
      },
      {
        "command": "flavorGrenade.rebuildIndex",
        "title": "Flavor Grenade: Rebuild Index"
      },
      {
        "command": "flavorGrenade.showOutput",
        "title": "Flavor Grenade: Show Output"
      }
    ],
    "configuration": {
      "title": "Flavor Grenade",
      "properties": {
        "flavorGrenade.server.path": {
          "type": "string",
          "default": "",
          "description": "Custom path to the language server binary. Leave empty to use the bundled binary."
        },
        "flavorGrenade.linkStyle": {
          "type": "string",
          "enum": ["file-stem", "relative-path"],
          "default": "file-stem",
          "description": "Wiki-link completion style."
        },
        "flavorGrenade.completion.candidates": {
          "type": "number",
          "default": 50,
          "description": "Maximum number of completion items returned."
        },
        "flavorGrenade.diagnostics.suppress": {
          "type": "array",
          "items": { "type": "string" },
          "default": [],
          "description": "Diagnostic codes to suppress (e.g., [\"AmbiguousLink\"])."
        },
        "flavorGrenade.trace.server": {
          "type": "string",
          "enum": ["off", "messages", "verbose"],
          "default": "off",
          "description": "Trace communication between VS Code and the language server."
        }
      }
    }
  },
  "capabilities": {
    "untrustedWorkspaces": {
      "supported": false,
      "description": "Flavor Grenade spawns a language server binary and cannot run in Restricted Mode."
    },
    "virtualWorkspaces": {
      "supported": false,
      "description": "Flavor Grenade requires file-system access for vault indexing."
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run build:extension",
    "build:extension": "esbuild src/extension.ts --bundle --platform=node --external:vscode --outfile=dist/extension.js --minify --sourcemap",
    "watch": "esbuild src/extension.ts --bundle --platform=node --external:vscode --outfile=dist/extension.js --sourcemap --watch",
    "test": "echo 'No tests yet'"
  },
  "dependencies": {
    "vscode-languageclient": "^9.0.1"
  },
  "devDependencies": {
    "@types/vscode": "~1.93.0",
    "@vscode/vsce": "^3.0.0",
    "esbuild": "^0.24.0",
    "typescript": "^5.6.0"
  }
}
```

> **Design note:** `vscode:prepublish` intentionally runs only `build:extension`, not `build:server`. The server binary is cross-compiled separately — in CI by the matrix job (with `--target`), and locally by the developer before running `vsce package`. This diverges from the spec's combined prepublish script because `$BUN_TARGET` is a CI-injected variable. See spec "Build Scripts" section.

> **Publisher ID:** The `publisher` field must be the Marketplace-registered publisher ID (typically lowercase, no spaces). Register at https://marketplace.visualstudio.com/manage if not done already. The display name "Alison Aquinas" is set on the Marketplace publisher profile, not in `package.json`.

- [ ] **Step 3: Install dependencies**

```bash
cd extension && npm install
```

Expected: `node_modules/` created, `package-lock.json` generated, zero errors.

- [ ] **Step 4: Commit**

```bash
git add extension/package.json extension/package-lock.json
git commit -m "feat(ext): scaffold extension directory with package.json manifest"
```

---

### Task E1.2: Create tsconfig.json for extension

**Files:**
- Create: `extension/tsconfig.json`

- [ ] **Step 1: Write `extension/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": false,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

> **Note:** Uses `Node16` module resolution (not `bundler`) because the extension runs in VS Code's Node.js extension host. esbuild handles bundling — TypeScript just typechecks.

- [ ] **Step 2: Verify typecheck passes with empty src**

We need a stub file first. Create in next task.

- [ ] **Step 3: Commit**

```bash
git add extension/tsconfig.json
git commit -m "feat(ext): add tsconfig.json for extension client"
```

---

### Task E1.3: Create stub extension.ts and verify build

**Files:**
- Create: `extension/src/extension.ts`

- [ ] **Step 1: Write stub `extension/src/extension.ts`**

```typescript
import type { ExtensionContext } from 'vscode';

export function activate(_context: ExtensionContext): void {
    // TODO: Phase E2 — LanguageClient setup
}

export function deactivate(): void {
    // TODO: Phase E2 — client.stop()
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd extension && npx tsc --noEmit
```

Expected: exits 0, no errors.

- [ ] **Step 3: Run esbuild**

```bash
cd extension && npm run build:extension
```

Expected: `dist/extension.js` and `dist/extension.js.map` created. File size ~1-2 KB (stub only).

- [ ] **Step 4: Verify output exists**

```bash
ls -la extension/dist/extension.js
```

Expected: file exists, non-zero size.

- [ ] **Step 5: Create `extension/.gitignore`**

```gitignore
dist/
node_modules/
server/
*.vsix
```

> **Note:** `server/` is excluded because the compiled binary is build output placed here during local dev and CI. It is never committed.

- [ ] **Step 6: Commit**

```bash
git add extension/src/extension.ts extension/.gitignore
git commit -m "feat(ext): add stub extension.ts and .gitignore, verify esbuild produces dist/extension.js"
```

---

### Task E1.4: Create .vscodeignore

**Files:**
- Create: `extension/.vscodeignore`

- [ ] **Step 1: Write `extension/.vscodeignore`**

```text
.github/**
src/**
docs/**
node_modules/**
*.ts
!dist/**
tsconfig.json
.eslintrc*
.prettierrc*
**/*.test.*
**/__tests__/**
.vscode/**
.gitignore
package-lock.json
```

Only `dist/extension.js`, `server/`, `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `images/` will ship.

- [ ] **Step 2: Commit**

```bash
git add extension/.vscodeignore
git commit -m "feat(ext): add .vscodeignore for VSIX package hygiene"
```

---

## Phase E2 — LanguageClient Core

### File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/src/extension.ts` | Modify | Full activate/deactivate with LanguageClient |
| `extension/src/server-path.ts` | Create | 2-tier binary resolution logic |

---

### Task E2.1: Implement binary resolution

**Files:**
- Create: `extension/src/server-path.ts`

- [ ] **Step 1: Write `extension/src/server-path.ts`**

```typescript
import { type ExtensionContext, Uri, workspace } from 'vscode';

/**
 * Resolves the path to the flavor-grenade-lsp server binary.
 *
 * Resolution order (2-tier):
 * 1. User setting `flavorGrenade.server.path` — escape hatch for local dev builds.
 * 2. Bundled binary at `server/flavor-grenade-lsp[.exe]` — default for all users.
 *
 * No PATH fallback, no env var, no download. Platform-specific VSIXs guarantee
 * the binary is present at tier 2.
 */
export function resolveServerPath(context: ExtensionContext): string {
    const config = workspace.getConfiguration('flavorGrenade');
    const custom = config.get<string>('server.path');

    if (custom && custom.trim().length > 0) {
        return custom;
    }

    const binaryName = process.platform === 'win32'
        ? 'flavor-grenade-lsp.exe'
        : 'flavor-grenade-lsp';

    return Uri.joinPath(context.extensionUri, 'server', binaryName).fsPath;
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd extension && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add extension/src/server-path.ts
git commit -m "feat(ext): add 2-tier server binary resolution"
```

---

### Task E2.2: Implement LanguageClient activation

**Files:**
- Modify: `extension/src/extension.ts`

- [ ] **Step 1: Replace stub `extension/src/extension.ts` with full implementation**

```typescript
import {
    type ExtensionContext,
    commands,
    window,
    workspace,
} from 'vscode';
import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
} from 'vscode-languageclient/node';
import { resolveServerPath } from './server-path.js';

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext): Promise<void> {
    const serverPath = resolveServerPath(context);
    const config = workspace.getConfiguration('flavorGrenade');

    // Executable form — stdio is the default transport for `command`.
    const serverOptions: ServerOptions = {
        run:   { command: serverPath },
        debug: { command: serverPath },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'markdown' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/*.md'),
        },
        initializationOptions: {
            linkStyle: config.get('linkStyle'),
            completionCandidates: config.get('completion.candidates'),
            diagnosticsSuppress: config.get('diagnostics.suppress'),
        },
    };

    client = new LanguageClient(
        'flavorGrenade',
        'Flavor Grenade',
        serverOptions,
        clientOptions,
    );

    await client.start();

    // LanguageClient implements Disposable — pushing to subscriptions handles
    // stop() on deactivation. No explicit stop() in deactivate() needed.
    context.subscriptions.push(client);
}

export function deactivate(): void {
    // Client cleanup is handled by context.subscriptions disposal.
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd extension && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Verify build**

```bash
cd extension && npm run build:extension
```

Expected: `dist/extension.js` produced, includes bundled `vscode-languageclient`. File size ~200-400 KB.

- [ ] **Step 4: Commit**

```bash
git add extension/src/extension.ts
git commit -m "feat(ext): implement LanguageClient activation with binary resolution"
```

---

### Task E2.3: Manual smoke test in Extension Development Host

This task has no code changes — it's a manual verification gate.

- [ ] **Step 1: Build the server binary for the host platform**

```bash
cd flavor-grenade-lsp
bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp
```

On Windows:
```bash
bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp.exe
```

- [ ] **Step 2: Create `extension/.vscode/launch.json`**

```bash
mkdir -p extension/.vscode
```

Write `extension/.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run Extension",
            "type": "extensionHost",
            "request": "launch",
            "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
            "outFiles": ["${workspaceFolder}/dist/**/*.js"]
        }
    ]
}
```

- [ ] **Step 3: Open the extension in VS Code Extension Development Host**

Open the `extension/` directory in VS Code. Press `F5` (or Run → Start Debugging). This launches a new VS Code window with the extension loaded.

- [ ] **Step 4: Open a `.md` file in the Extension Development Host**

Expected: extension activates, server spawns, output channel "Flavor Grenade" shows LSP initialization trace (if `trace.server` is set to `verbose`).

- [ ] **Step 5: Commit the launch config**

```bash
git add extension/.vscode/launch.json
git commit -m "chore(ext): add launch.json for Extension Development Host debugging"
```

---

## Phase E3 — Status Bar & Commands

### File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/src/extension.ts` | Modify | Wire up status bar and commands in activate() |
| `extension/src/status-bar.ts` | Create | Status bar widget — listens to flavorGrenade/status |
| `extension/src/commands.ts` | Create | Command registrations (restart, rebuild, show output) |

---

### Task E3.1: Implement status bar widget

**Files:**
- Create: `extension/src/status-bar.ts`

- [ ] **Step 1: Write `extension/src/status-bar.ts`**

```typescript
import { type StatusBarItem, StatusBarAlignment, window } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

interface FlavorGrenadeStatus {
    state: 'initializing' | 'indexing' | 'ready' | 'error';
    vaultCount: number;
    docCount: number;
    message?: string;
}

/**
 * Creates a status bar item that reflects the server's indexing state.
 *
 * Listens to the non-standard `flavorGrenade/status` notification
 * defined in the API layer (see docs/design/api-layer.md).
 * Clicking the status bar item opens the output channel.
 */
export function createStatusBar(client: LanguageClient): StatusBarItem {
    const item = window.createStatusBarItem(
        'flavorGrenade.status',
        StatusBarAlignment.Left,
        -1,
    );

    item.name = 'Flavor Grenade';
    item.command = 'flavorGrenade.showOutput';
    item.text = '$(loading~spin) FG: Starting...';
    item.show();

    client.onNotification(
        'flavorGrenade/status',
        (params: FlavorGrenadeStatus) => {
            switch (params.state) {
                case 'initializing':
                    item.text = '$(loading~spin) FG: Starting...';
                    item.tooltip = 'Flavor Grenade: Initializing server';
                    break;
                case 'indexing':
                    item.text = '$(loading~spin) FG: Indexing...';
                    item.tooltip = `Flavor Grenade: Indexing ${params.docCount} docs across ${params.vaultCount} vaults`;
                    break;
                case 'ready':
                    item.text = `$(check) FG: ${params.docCount} docs`;
                    item.tooltip = `Flavor Grenade: Ready — ${params.docCount} docs in ${params.vaultCount} vaults`;
                    break;
                case 'error':
                    item.text = '$(error) FG: Error';
                    item.tooltip = `Flavor Grenade: ${params.message ?? 'Unknown error'}`;
                    break;
            }
        },
    );

    return item;
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd extension && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add extension/src/status-bar.ts
git commit -m "feat(ext): add status bar widget listening to flavorGrenade/status"
```

---

### Task E3.2: Implement command registrations

**Files:**
- Create: `extension/src/commands.ts`

- [ ] **Step 1: Write `extension/src/commands.ts`**

```typescript
import { type Disposable, commands } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

/**
 * Registers the three extension commands exposed in the Command Palette.
 *
 * - `flavorGrenade.restartServer` — restarts the LanguageClient (and server).
 * - `flavorGrenade.rebuildIndex` — sends `workspace/executeCommand` to the
 *   server, triggering a full RefGraph rebuild. The server must register this
 *   command via `executeCommandProvider` capabilities (already implemented —
 *   see docs/design/api-layer.md, "Workspace Commands").
 * - `flavorGrenade.showOutput` — reveals the LSP output channel.
 */
export function registerCommands(client: LanguageClient): Disposable[] {
    return [
        commands.registerCommand('flavorGrenade.restartServer', async () => {
            await client.restart();
        }),

        commands.registerCommand('flavorGrenade.rebuildIndex', async () => {
            await client.sendRequest('workspace/executeCommand', {
                command: 'flavorGrenade.rebuildIndex',
                arguments: [],
            });
        }),

        commands.registerCommand('flavorGrenade.showOutput', () => {
            client.outputChannel.show();
        }),
    ];
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd extension && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add extension/src/commands.ts
git commit -m "feat(ext): add palette commands (restart, rebuild index, show output)"
```

---

### Task E3.3: Wire status bar and commands into activate()

**Files:**
- Modify: `extension/src/extension.ts`

- [ ] **Step 1: Update `extension/src/extension.ts`**

Add imports and wire up after `client.start()`:

```typescript
import {
    type ExtensionContext,
    workspace,
} from 'vscode';
import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
} from 'vscode-languageclient/node';
import { resolveServerPath } from './server-path.js';
import { createStatusBar } from './status-bar.js';
import { registerCommands } from './commands.js';

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext): Promise<void> {
    const serverPath = resolveServerPath(context);
    const config = workspace.getConfiguration('flavorGrenade');

    const serverOptions: ServerOptions = {
        run:   { command: serverPath },
        debug: { command: serverPath },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'markdown' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/*.md'),
        },
        initializationOptions: {
            linkStyle: config.get('linkStyle'),
            completionCandidates: config.get('completion.candidates'),
            diagnosticsSuppress: config.get('diagnostics.suppress'),
        },
    };

    client = new LanguageClient(
        'flavorGrenade',
        'Flavor Grenade',
        serverOptions,
        clientOptions,
    );

    await client.start();

    // Status bar widget
    const statusBar = createStatusBar(client);
    context.subscriptions.push(statusBar);

    // Reset status bar text on restart cycles (e.g., after restartServer command)
    client.onDidChangeState(() => {
        statusBar.text = '$(loading~spin) FG: Starting...';
    });

    // Palette commands
    const commandDisposables = registerCommands(client);
    context.subscriptions.push(...commandDisposables);

    // Restart on server path change
    context.subscriptions.push(
        workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('flavorGrenade.server.path') && client) {
                await client.restart();
            }
        }),
    );

    // LanguageClient implements Disposable — pushing to subscriptions handles
    // stop() on deactivation. No explicit stop() in deactivate() needed.
    context.subscriptions.push(client);
}

export function deactivate(): void {
    // Client cleanup is handled by context.subscriptions disposal.
    // LanguageClient.dispose() calls stop() automatically.
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd extension && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Verify build**

```bash
cd extension && npm run build:extension
```

Expected: `dist/extension.js` produced. File size ~200-400 KB.

- [ ] **Step 4: Commit**

```bash
git add extension/src/extension.ts
git commit -m "feat(ext): wire status bar and commands into activate lifecycle"
```

---

## Phase E4 — Packaging & Local Test

### File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/README.md` | Create | Marketplace-facing README |
| `extension/CHANGELOG.md` | Create | Extension changelog |
| `extension/LICENSE` | Create (or symlink) | MIT license text |
| `extension/images/icon.png` | Create | 256x256 extension icon |

---

### Task E4.1: Add Marketplace assets

**Files:**
- Create: `extension/README.md`
- Create: `extension/CHANGELOG.md`
- Create: `extension/LICENSE`
- Create: `extension/images/icon.png`

- [ ] **Step 1: Write `extension/README.md`**

Marketplace-facing. Include:
- One-paragraph description of what the extension does
- Feature list (completions, diagnostics, go-to-def, rename, code actions, code lens, semantic tokens)
- Configuration settings table (mirror from package.json contributes.configuration)
- "Getting Started" section (install from Marketplace, open a vault, done)
- Link to the flavor-grenade-lsp repo

- [ ] **Step 2: Write `extension/CHANGELOG.md`**

```markdown
# Changelog

## [0.1.0] — Unreleased

### Added

- Initial release: LanguageClient wrapper for flavor-grenade-lsp
- Status bar showing vault indexing state and document count
- Commands: Restart Server, Rebuild Index, Show Output
- Configuration: server path override, link style, completion candidates, diagnostics suppress, trace level
```

- [ ] **Step 3: Copy LICENSE**

```bash
cp LICENSE extension/LICENSE
```

- [ ] **Step 4: Create placeholder icon**

Create a 256x256 PNG at `extension/images/icon.png`. For initial development, a simple solid-color square is sufficient. Replace with designed icon before first Marketplace publish.

```bash
mkdir -p extension/images
```

> **Note:** The icon must be PNG, at least 128x128. SVG is not allowed by the Marketplace.

- [ ] **Step 5: Commit**

```bash
git add extension/README.md extension/CHANGELOG.md extension/LICENSE extension/images/
git commit -m "feat(ext): add Marketplace assets (README, CHANGELOG, LICENSE, icon)"
```

---

### Task E4.2: Package and test VSIX locally

**Files:**
- No new files — verification only.

- [ ] **Step 1: Build the server binary for host platform**

```bash
cd flavor-grenade-lsp
bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp
```

On Windows:
```bash
bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp.exe
```

> **Note:** Local builds omit `--bytecode` (used in CI for faster startup) to keep build times short during development. The `--target` flag is also omitted, compiling for the host platform.

- [ ] **Step 2: Build the extension client**

```bash
cd extension && npm run build:extension
```

- [ ] **Step 3: Package VSIX**

```bash
cd extension && npx vsce package
```

Expected: produces `flavor-grenade-0.1.0.vsix` in `extension/`. Output shows file list — verify no `src/`, `node_modules/`, or test files included.

- [ ] **Step 4: Inspect VSIX contents**

```bash
unzip -l extension/flavor-grenade-0.1.0.vsix | head -30
```

Expected entries:
- `extension/dist/extension.js`
- `extension/server/flavor-grenade-lsp` (or `.exe`)
- `extension/package.json`
- `extension/README.md`
- `extension/LICENSE`
- `extension/CHANGELOG.md`
- `extension/images/icon.png`

Unexpected entries (should NOT appear): `src/`, `node_modules/`, `tsconfig.json`, `*.ts`, `*.test.*`

- [ ] **Step 5: Install VSIX locally**

```bash
code --install-extension extension/flavor-grenade-0.1.0.vsix
```

- [ ] **Step 6: Open a vault directory in VS Code, open a `.md` file**

Expected: extension activates, status bar shows "FG: Starting..." → "FG: Indexing..." → "FG: N docs". Completions work on `[[`, `#`, etc.

- [ ] **Step 7: Verify commands**

Open Command Palette (`Ctrl+Shift+P`), search "Flavor Grenade":
- "Restart Server" — server restarts, status bar cycles back to ready
- "Rebuild Index" — status bar flashes "Indexing..." then returns to ready
- "Show Output" — output channel opens with LSP trace

- [ ] **Step 8: Clean up — add VSIX to .gitignore**

Add `*.vsix` to `extension/.gitignore`.

```bash
git add extension/.gitignore
git commit -m "chore(ext): add *.vsix to gitignore"
```

---

## Phase E5 — CI/CD Pipeline

### File Map

| Path | Action | Responsibility |
|---|---|---|
| `.github/workflows/extension-release.yml` | Create | Tag-triggered matrix build + publish workflow |

---

### Task E5.1: Create extension-release.yml workflow

**Files:**
- Create: `.github/workflows/extension-release.yml`

- [ ] **Step 1: Write `.github/workflows/extension-release.yml`**

```yaml
name: Extension Release

on:
  push:
    tags:
      - 'ext-v*'

permissions:
  contents: read

jobs:
  build:
    name: Build VSIX (${{ matrix.vsce-target }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        include:
          - vsce-target: linux-x64
            bun-target: bun-linux-x64
            binary-name: flavor-grenade-lsp
          - vsce-target: linux-arm64
            bun-target: bun-linux-arm64
            binary-name: flavor-grenade-lsp
          - vsce-target: alpine-x64
            bun-target: bun-linux-x64-musl
            binary-name: flavor-grenade-lsp
          - vsce-target: darwin-x64
            bun-target: bun-darwin-x64
            binary-name: flavor-grenade-lsp
          - vsce-target: darwin-arm64
            bun-target: bun-darwin-arm64
            binary-name: flavor-grenade-lsp
          - vsce-target: win32-x64
            bun-target: bun-windows-x64
            binary-name: flavor-grenade-lsp.exe
          - vsce-target: win32-arm64
            bun-target: bun-windows-arm64
            binary-name: flavor-grenade-lsp.exe

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install server dependencies
        run: bun install --frozen-lockfile

      - name: Cross-compile server binary
        run: |
          mkdir -p extension/server
          bun build --compile --minify --bytecode \
            --target=${{ matrix.bun-target }} \
            src/main.ts \
            --outfile extension/server/${{ matrix.binary-name }}

      - name: Install extension dependencies
        working-directory: extension
        run: npm ci

      - name: Build extension client
        working-directory: extension
        run: npm run build:extension

      - name: Package VSIX
        working-directory: extension
        run: npx vsce package --target ${{ matrix.vsce-target }}

      - name: Upload VSIX artifact
        uses: actions/upload-artifact@v4
        with:
          name: vsix-${{ matrix.vsce-target }}
          path: extension/*.vsix
          if-no-files-found: error

  publish:
    name: Publish to Marketplace
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: vsix-artifacts
          pattern: vsix-*
          merge-multiple: true

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install vsce
        run: npm install -g @vscode/vsce

      - name: Publish all VSIXs
        run: vsce publish --packagePath vsix-artifacts/*.vsix
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

- [ ] **Step 2: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/extension-release.yml'))"
```

Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/extension-release.yml
git commit -m "ci(ext): add extension-release.yml — 7-target matrix build and publish"
```

---

### Task E5.2: Update roadmap and execution ledger

**Files:**
- Modify: `docs/roadmap.md`
- Modify: `docs/plans/execution-ledger.md`

- [ ] **Step 1: Update roadmap — mark VS Code Extension items**

In `docs/roadmap.md`, under "Active Work — VS Code Extension", update status of completed items as phases are finished.

- [ ] **Step 2: Commit**

```bash
git add docs/roadmap.md docs/plans/execution-ledger.md
git commit -m "docs: update roadmap and ledger with extension phase progress"
```

---

## Summary

| Phase | Tasks | Key Gate |
|---|---|---|
| E1 — Scaffold | E1.1–E1.4 | `npm run build:extension` exits 0 |
| E2 — LanguageClient | E2.1–E2.3 | Extension activates and spawns server in dev host |
| E3 — Status Bar & Commands | E3.1–E3.3 | Commands in palette, status bar reflects server state |
| E4 — Packaging | E4.1–E4.2 | `vsce package` produces installable VSIX, manual test passes |
| E5 — CI/CD | E5.1–E5.2 | `extension-release.yml` builds all 7 VSIXs on tag push |

Total: 13 tasks, ~45-60 steps. Extension client is ~200 lines across 4 files (`extension.ts`, `server-path.ts`, `status-bar.ts`, `commands.ts`).
