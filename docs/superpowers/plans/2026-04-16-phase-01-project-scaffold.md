---
title: Phase 1 Project Scaffold Plan
tags:
  - plans/phase-01
aliases:
  - Phase 1 Scaffold Plan
status: superseded
date: 2026-04-16
---

# Phase 1: Project Scaffold Implementation Plan

> [!NOTE]
> Superseded by [[2026-04-17-phase-01-project-scaffold]].

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap a compilable NestJS + Bun + TypeScript project skeleton with a verified module graph, ready to receive LSP transport code in Phase 2.

**Architecture:** NestJS application context (no HTTP server) bootstrapped by `src/main.ts`; a single `LspModule` as the root module; all future modules register into it. Bun is the runtime and test runner; TypeScript strict mode enforces correctness from day one.

**Tech Stack:** Bun ≥ 1.1, Node ≥ 20, TypeScript 5.x (strict), NestJS 10.x (`@nestjs/core`, `@nestjs/common`), `vscode-languageserver-protocol` (LSP type definitions), ESLint + Prettier, Bun test runner.

---

## Scope Note

This plan covers Phase 1 only — the project scaffold. No LSP message handling is written here. The gate is: `bun run build` and `bun test` both exit 0. Phase 2 (LSP Transport) gets its own plan.

---

## File Map

All files created in this phase:

| Path | Responsibility |
|------|---------------|
| `package.json` | Project metadata, scripts, dependency declarations |
| `bunfig.toml` | Bun test runner config, install settings |
| `tsconfig.json` | TypeScript compiler options (strict, ESNext, decorator support) |
| `.editorconfig` | Line-ending normalization (LF on all platforms) |
| `.gitignore` | Exclude build artifacts, node_modules, coverage |
| `.prettierrc.json` | Formatter config |
| `eslint.config.js` | ESLint flat config with TypeScript rules |
| `.flavor-grenade.toml` | Project-level LSP config marker (vault detection + server config) |
| `src/main.ts` | Bootstrap entry point — creates NestJS application context |
| `src/app.module.ts` | Root AppModule — composes all sub-modules |
| `src/lsp/lsp.module.ts` | LspModule skeleton — will host LspServer in Phase 2 |
| `src/lsp/lsp.module.spec.ts` | Smoke test — verifies the module compiles and wires up |

---

## Task 1: Initialize Bun project

**Files:**

- Create: `package.json`
- Create: `bunfig.toml`
- Create: `.gitignore`
- Create: `.editorconfig`

- [ ] **Step 1.1: Run `bun init`**

```bash
bun init -y
```

Expected: `package.json` created with `"name": "flavor-grenade-lsp"` and `"version": "0.0.1"`.

- [ ] **Step 1.2: Set `package.json` to ESM and add scripts**

Edit `package.json` to match exactly:

```json
{
  "name": "flavor-grenade-lsp",
  "version": "0.0.1",
  "description": "LSP server for Obsidian Flavored Markdown",
  "type": "module",
  "main": "dist/main.js",
  "scripts": {
    "dev": "bun --watch src/main.ts",
    "build": "tsc --project tsconfig.json",
    "start": "node dist/main.js",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "typecheck": "tsc --noEmit",
    "gate:1": "bun run build && bun test"
  },
  "keywords": ["lsp", "obsidian", "markdown", "language-server"],
  "license": "MIT"
}
```

- [ ] **Step 1.3: Create `bunfig.toml`**

```toml
[test]
root = "src"
coverage = true
coverageReporter = ["text", "lcov"]

[install]
exact = true
```

- [ ] **Step 1.4: Create `.gitignore`**

```text
node_modules/
dist/
.env
*.log
reports/
coverage/
.bun/
*.js.map
```

- [ ] **Step 1.5: Create `.editorconfig`**

This prevents CRLF line-ending noise in git diffs (the repo is developed on Windows):

```ini
root = true

[*]
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

- [ ] **Step 1.6: Add `.gitattributes` to enforce LF in git**

```text
* text=auto eol=lf
*.feature text eol=lf
*.md text eol=lf
*.ts text eol=lf
*.json text eol=lf
*.toml text eol=lf
```

- [ ] **Step 1.7: Commit**

```bash
git add package.json bunfig.toml .gitignore .editorconfig .gitattributes
git commit -m "chore: initialize bun project with scripts and editor config"
```

---

## Task 2: Install dependencies

**Files:**

- Modify: `package.json` (dependency sections added by bun add)

- [ ] **Step 2.1: Install NestJS runtime**

```bash
bun add @nestjs/core @nestjs/common reflect-metadata rxjs
```

Expected: packages appear in `dependencies` in `package.json`.

> **Note:** `@nestjs/platform-express` is NOT installed — we are using `NestFactory.createApplicationContext` (no HTTP), so no Express platform is needed.

- [ ] **Step 2.2: Install LSP protocol types**

```bash
bun add vscode-languageserver-protocol vscode-languageserver-types
```

These provide the full LSP 3.17 type system (Position, Range, TextDocumentItem, CompletionItem, Diagnostic, etc.) without pulling in VS Code itself.

- [ ] **Step 2.3: Install dev tooling**

```bash
bun add --dev typescript @types/node
bun add --dev @eslint/js typescript-eslint prettier eslint-config-prettier
```

> **Note:** This installs the modern unified `typescript-eslint` package (not the older split `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser`). Task 4's `eslint.config.js` references this package directly.

- [ ] **Step 2.4: Verify installs**

```bash
bun --version       # must be ≥ 1.1
bunx tsc --version  # must show TypeScript 5.x
```

- [ ] **Step 2.5: Commit lockfile and updated package.json**

```bash
git add package.json bun.lockb
git commit -m "chore: add nestjs, lsp types, and dev tooling dependencies"
```

---

## Task 3: Configure TypeScript

**Files:**

- Create: `tsconfig.json`

- [ ] **Step 3.1: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3.2: Commit `tsconfig.json` now — typecheck runs after source files exist**

```bash
git add tsconfig.json
git commit -m "chore: add typescript strict config with decorator support"
```

> **Deferred:** The full `tsc --noEmit` typecheck runs in Task 8 (Step 8.4), after source files are created in Tasks 5–6. Running it now with an empty `src/` can produce a TS18003 "no input files" error on some tsc versions.

- [ ] **Step 3.3: Commit** (already done in 3.2 — skip this step)

```bash
git add tsconfig.json
git commit -m "chore: add typescript strict config with decorator support"
```

---

## Task 4: Configure ESLint and Prettier

**Files:**

- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 4.1: Write `eslint.config.js`** (ESLint 9 flat config)

```javascript
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
  },
);
```

> **Note:** This requires `@eslint/js` and `typescript-eslint` (the new unified package). Update the dev install:
>
> ```bash
> bun add --dev @eslint/js typescript-eslint
> ```

- [ ] **Step 4.2: Write `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

- [ ] **Step 4.3: Write `.prettierignore`**

```text
dist/
node_modules/
*.md
```

- [ ] **Step 4.4: Verify linting passes on empty project**

```bash
bun run lint
```

Expected: exits 0 (no `.ts` files to lint yet).

- [ ] **Step 4.5: Commit**

```bash
git add eslint.config.js .prettierrc.json .prettierignore
git commit -m "chore: add eslint flat config and prettier"
```

---

## Task 5: Write the first failing test

**Files:**

- Create: `src/lsp/lsp.module.spec.ts`

This is the first TDD step. Write the test before the implementation exists so it fails for the right reason.

- [ ] **Step 5.1: Write `src/lsp/lsp.module.spec.ts`**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { NestFactory } from '@nestjs/core';
import { LspModule } from './lsp.module';
import type { INestApplicationContext } from '@nestjs/common';

describe('LspModule', () => {
  let app: INestApplicationContext;

  beforeAll(async () => {
    app = await NestFactory.createApplicationContext(LspModule, {
      logger: false,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should compile the module graph without errors', () => {
    expect(app).toBeDefined();
  });

  it('should resolve LspModule from the application context', () => {
    const module = app.get(LspModule);
    expect(module).toBeInstanceOf(LspModule);
  });
});
```

- [ ] **Step 5.2: Run the test — verify it fails**

```bash
bun test src/lsp/lsp.module.spec.ts
```

Expected output: **FAIL** — `Cannot find module './lsp.module'` or similar.

This confirms the test is wired correctly and failing for the right reason.

---

## Task 6: Implement the module graph

**Files:**

- Create: `src/lsp/lsp.module.ts`
- Create: `src/app.module.ts`
- Create: `src/main.ts`

- [ ] **Step 6.1: Create `src/lsp/lsp.module.ts`**

```typescript
import { Module } from '@nestjs/common';

/**
 * LspModule — root module for all LSP protocol handling.
 * Phase 2 will register LspServer as a provider here.
 */
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class LspModule {}
```

- [ ] **Step 6.2: Run the test — verify it passes**

```bash
bun test src/lsp/lsp.module.spec.ts
```

Expected output:

```text
bun test v1.x
src/lsp/lsp.module.spec.ts:
✓ LspModule > should compile the module graph without errors
✓ LspModule > should resolve LspModule from the application context

2 pass, 0 fail
```

- [ ] **Step 6.3: Create `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { LspModule } from './lsp/lsp.module';

/**
 * AppModule — root composition module.
 * Imports all bounded-context modules.
 */
@Module({
  imports: [LspModule],
})
export class AppModule {}
```

- [ ] **Step 6.4: Create `src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap entry point.
 * Creates a NestJS application context (no HTTP server).
 * Phase 2 will attach the stdio JSON-RPC transport here.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  // Placeholder: Phase 2 will call lspServer.listen(process.stdin, process.stdout) here
  await app.init();

  // Keep the process alive until the LSP client disconnects
  // Phase 2: replace with stdin.on('end', ...) handler
  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((err: unknown) => {
  console.error('Fatal: failed to bootstrap LSP server', err);
  process.exit(1);
});
```

- [ ] **Step 6.5: Commit**

```bash
git add src/
git commit -m "feat(lsp): add LspModule skeleton, AppModule, and bootstrap entry point"
```

---

## Task 7: Create the project config marker

**Files:**

- Create: `.flavor-grenade.toml`

- [ ] **Step 7.1: Create `.flavor-grenade.toml`**

This file serves two purposes: (1) vault detection marker for the LSP server itself when editing this repo's docs; (2) the canonical reference for the config schema.

```toml
# flavor-grenade-lsp project configuration
# This file marks a directory as a flavor-grenade-lsp project root.
# See docs/requirements/configuration.md for the full schema reference.

[core]
# File extensions treated as OFM documents
markdown.file_extensions = ["md"]

# Text sync mode: "full" | "incremental"
# "full" is the safe default; use "incremental" only for large vaults
text_sync = "full"

# Vault detection strategy: "obsidian" | "toml-only" | "both"
# "obsidian" requires .obsidian/ directory; "toml-only" uses this file only
vault_detection = "both"

[completion]
# Maximum number of completion candidates per request
candidates = 50

# Wiki-link completion style: "file-stem" | "title-slug" | "file-path-stem"
# "file-stem" matches Obsidian's native behaviour
wiki.style = "file-stem"

# Offer callout type completion after "> [!"
callout.enabled = true

[code_action]
toc.enabled = true
toc.include = [1, 2, 3, 4, 5, 6]
create_missing_file.enabled = true
tag_to_yaml.enabled = true

[diagnostics]
block_ref.enabled = true
embed.enabled = true
```

- [ ] **Step 7.2: Commit**

```bash
git add .flavor-grenade.toml
git commit -m "chore: add .flavor-grenade.toml project config marker"
```

---

## Task 8: Verify the build gate

- [ ] **Step 8.1: Run the full build**

```bash
bun run build
```

Expected: `dist/` directory created, exits 0, no TypeScript errors.

- [ ] **Step 8.2: Run the full test suite**

```bash
bun test
```

Expected:

```text
bun test v1.x
src/lsp/lsp.module.spec.ts:
✓ LspModule > should compile the module graph without errors
✓ LspModule > should resolve LspModule from the application context

2 pass, 0 fail
```

- [ ] **Step 8.3: Run the gate script**

```bash
bun run gate:1
```

Expected: both `build` and `test` exit 0 in sequence.

- [ ] **Step 8.4: Typecheck**

```bash
bun run typecheck
```

Expected: exits 0, no errors.

- [ ] **Step 8.5: Update the execution ledger**

In `docs/plans/execution-ledger.md`, mark Phase 1 as ✅ complete and fill in the completed date.

- [ ] **Step 8.6: Final commit**

```bash
git add docs/plans/execution-ledger.md
git commit -m "chore: mark phase-01-scaffold complete in execution ledger"
```

---

## Expected Final State

After this plan, the repo contains:

```text
flavor-grenade-lsp/
├── .editorconfig
├── .flavor-grenade.toml
├── .gitattributes
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── bun.lockb
├── bunfig.toml
├── eslint.config.js
├── package.json
├── tsconfig.json
├── dist/                    ← generated by `bun run build`
│   ├── main.js
│   ├── app.module.js
│   └── lsp/lsp.module.js
├── docs/                    ← from Phase 0 (unchanged)
└── src/
    ├── main.ts
    ├── app.module.ts
    └── lsp/
        ├── lsp.module.ts
        └── lsp.module.spec.ts
```

**Gate:** `bun run gate:1` exits 0. 2 tests pass.

---

## References

- [[adr/ADR001-stdio-transport]] — why no HTTP platform
- [[architecture/layers]] — NestJS module dependency order
- [[ddd/lsp-protocol/domain-model]] — what LspModule will host in Phase 2
- [[plans/phase-02-lsp-transport]] — next phase plan
- [[requirements/configuration]] — config schema driving `.flavor-grenade.toml`
