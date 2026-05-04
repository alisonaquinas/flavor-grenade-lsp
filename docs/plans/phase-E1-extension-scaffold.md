---
title: "Phase E1: Extension Scaffold"
phase: E1
status: planned
tags: [extension, scaffold, package-json, esbuild, tsconfig]
updated: 2026-04-21
---

# Phase E1: Extension Scaffold

| Field      | Value |
|------------|-------|
| Phase      | E1 |
| Title      | Extension Scaffold |
| Status     | ⏳ planned |
| Gate       | `npm run build:extension` produces `dist/extension.js` |
| Depends on | Phase R (Publishing Research) |

---

## Objective

Create the `extension/` directory at the repo root with its own `package.json` (VS Code extension manifest), `tsconfig.json` (Node16 target), esbuild bundling, a stub `extension.ts`, `.vscodeignore`, and `.gitignore`. Gate: `npm run build:extension` produces `dist/extension.js`.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/package.json` | Create | Extension manifest — identity, activation, contributes, scripts |
| `extension/tsconfig.json` | Create | TypeScript config for extension client (Node target) |
| `extension/src/extension.ts` | Create | Stub entry point — exports empty activate/deactivate |
| `extension/.vscodeignore` | Create | Exclude non-shipping files from VSIX |
| `extension/.gitignore` | Create | Exclude build output, node_modules, server binaries, VSIXs |

---

## Task List

- [ ] **1. Create extension directory and `package.json`**

  Create `extension/` directory at the repo root.

  Write `extension/package.json` with this exact content:

  ```json
  {
    "name": "flavor-grenade-lsp",
    "displayName": "Flavor Grenade LSP — Obsidian Markdown Support",
    "description": "Language intelligence for Obsidian Flavored Markdown: wiki-links, tags, embeds, block references, and more.",
    "version": "0.1.0",
    "publisher": "alisonaquinas",
    "license": "MIT",
    "repository": {
      "type": "git",
      "url": "https://github.com/alisonaquinas/flavor-grenade-lsp"
    },
    "engines": { "vscode": "^1.93.0" },
    "categories": ["Programming Languages", "Linters"],
    "keywords": ["obsidian", "markdown", "wiki-links", "lsp", "zettelkasten", "llm-wiki"],
    "extensionKind": ["workspace"],
    "main": "./dist/extension.js",
    "icon": "images/icon.png",
    "activationEvents": ["onLanguage:markdown"],
    "contributes": {
      "commands": [
        { "command": "flavorGrenade.restartServer", "title": "Flavor Grenade: Restart Server" },
        { "command": "flavorGrenade.rebuildIndex", "title": "Flavor Grenade: Rebuild Index" },
        { "command": "flavorGrenade.showOutput", "title": "Flavor Grenade: Show Output" }
      ],
      "configuration": {
        "title": "Flavor Grenade",
        "properties": {
          "flavorGrenade.server.path": {
            "type": "string", "default": "",
            "description": "Custom path to the language server binary. Leave empty to use the bundled binary."
          },
          "flavorGrenade.linkStyle": {
            "type": "string", "enum": ["file-stem", "relative-path"], "default": "file-stem",
            "description": "Wiki-link completion style."
          },
          "flavorGrenade.completion.candidates": {
            "type": "number", "default": 50,
            "description": "Maximum number of completion items returned."
          },
          "flavorGrenade.diagnostics.suppress": {
            "type": "array", "items": { "type": "string" }, "default": [],
            "description": "Diagnostic codes to suppress."
          },
          "flavorGrenade.trace.server": {
            "type": "string", "enum": ["off", "messages", "verbose"], "default": "off",
            "description": "Trace communication between VS Code and the language server."
          }
        }
      }
    },
    "capabilities": {
      "untrustedWorkspaces": { "supported": false, "description": "Spawns a language server binary." },
      "virtualWorkspaces": { "supported": false, "description": "Requires file-system access for vault indexing." }
    },
    "scripts": {
      "vscode:prepublish": "npm run build:extension",
      "build:extension": "esbuild src/extension.ts --bundle --platform=node --external:vscode --outfile=dist/extension.js --minify --sourcemap",
      "watch": "esbuild src/extension.ts --bundle --platform=node --external:vscode --outfile=dist/extension.js --sourcemap --watch",
      "test": "echo 'No tests yet'"
    },
    "dependencies": { "vscode-languageclient": "^9.0.1" },
    "devDependencies": {
      "@types/vscode": "~1.93.0",
      "@vscode/vsce": "^3.0.0",
      "esbuild": "^0.24.0",
      "typescript": "^5.6.0"
    }
  }
  ```

  Design notes:
  - `vscode:prepublish` intentionally omits `build:server`. Server binary is cross-compiled separately (in CI by matrix job, locally by developer). `$BUN_TARGET` is CI-injected.
  - `publisher` must be the Marketplace-registered ID (no spaces). Display name is set on the Marketplace profile.
  - `extensionKind: ["workspace"]` — extension runs on workspace host where vault files live.

  Run install and commit:

  ```bash
  cd extension && npm install
  ```

  Commit.

- [ ] **2. Create `tsconfig.json`**

  Write `extension/tsconfig.json`:

  ```json
  {
    "compilerOptions": {
      "target": "ES2022", "module": "Node16", "moduleResolution": "Node16",
      "lib": ["ES2022"], "strict": true, "strictNullChecks": true,
      "noImplicitAny": true, "esModuleInterop": true,
      "outDir": "dist", "rootDir": "src", "declaration": false,
      "sourceMap": true, "skipLibCheck": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  }
  ```

  Note: Uses Node16 module resolution because extension runs in VS Code's Node.js host. esbuild handles bundling.

  Commit.

- [ ] **3. Create stub `extension.ts` and verify build**

  Write `extension/src/extension.ts`:

  ```typescript
  import type { ExtensionContext } from 'vscode';

  export function activate(_context: ExtensionContext): void {
      // Phase E2 — LanguageClient setup
  }

  export function deactivate(): void {
      // Phase E2 — client.stop()
  }
  ```

  Create `extension/.gitignore`:

  ```text
  dist/
  node_modules/
  server/
  *.vsix
  ```

  Verify typecheck and build:

  ```bash
  cd extension && npx tsc --noEmit
  cd extension && npm run build:extension
  ```

  Verify `dist/extension.js` exists.

  Commit.

- [ ] **4. Create `.vscodeignore`**

  Write `extension/.vscodeignore`:

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

  Commit.

---

## Gate Verification

```bash
cd extension && npm run build:extension
ls extension/dist/extension.js
```

---

## References

- `[[docs/research/vscode-extension-publishing]]`
- `[[plans/phase-13-ci-delivery]]`
