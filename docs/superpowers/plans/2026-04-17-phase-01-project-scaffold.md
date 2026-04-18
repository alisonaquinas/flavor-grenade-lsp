---
title: Phase 1 Project Scaffold Plan
tags:
  - plans/phase-01
aliases:
  - Phase 1 Scaffold Plan
status: active
date: 2026-04-17
---

# Phase 1: Project Scaffold Implementation Plan

> [!NOTE]
> This plan supersedes [[2026-04-16-phase-01-project-scaffold]] and is the current Phase 1 source of truth.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Complete every checkbox before declaring the task done. Do not skip the TDD steps — write the failing test before writing any implementation code.

**Goal:** Bootstrap a compilable NestJS + Bun + TypeScript project skeleton with a verified module graph, aggressively strict quality gates, and pre-commit enforcement — ready to receive LSP transport code in Phase 2.

**Architecture:** NestJS application context (no HTTP server) bootstrapped by `src/main.ts`. A single `LspModule` as the root module; all future modules register into it. Module directories are namespace boundaries — cross-module imports only through barrel `index.ts` files. One class per file (enforced by ESLint). Bun is the runtime, package manager, and test runner. TypeScript strict mode with `--max-warnings 0` enforces correctness from day one.

**Tech Stack:** Bun ≥ 1.1, Node ≥ 20, TypeScript 5.x (strict), NestJS 10.x (`@nestjs/core`, `@nestjs/common`), `vscode-languageserver-protocol` (LSP type definitions), ESLint 9 flat config with `typescript-eslint` strict-type-checked + `eslint-plugin-jsdoc` + `eslint-plugin-import`, Prettier, lefthook (pre-commit), markdownlint-obsidian (docs/), markdownlint-cli2 (other markdown).

**Gate:** `bun run gate:1` exits 0 — this runs `typecheck`, `lint`, `format:check`, `test`, and `build` in sequence. All 5 sub-commands must pass with zero warnings before any CI run.

> **Branch:** All work on a feature branch cut from `develop`. Commit using conventional commit messages. Push to `develop` only after the gate passes locally.

---

## Scope Note

This plan covers Phase 1 only — the project scaffold. No LSP message handling is written here. The gate is: `bun run gate:1` exits 0 (typecheck clean, lint clean with 0 warnings, format check passes, 2 tests pass, build succeeds). Phase 2 (LSP Transport) gets its own plan.

---

## File Map

All files created or modified in this phase:

| Path | Action | Responsibility |
|------|--------|---------------|
| `.gitignore` | Verify + update | Exclude build artifacts, node_modules, coverage, tmp/ |
| `.gitattributes` | Verify + update | LF enforcement, git-lfs binary patterns |
| `.editorconfig` | Create | Line-ending normalization (LF on all platforms) |
| `.env.example` | Create | Documents the .env pattern; empty initially |
| `lefthook.yml` | Create | Pre-commit hooks: typecheck, lint, format:check, test |
| `package.json` | Create/update | Project metadata, scripts, dependency declarations |
| `bunfig.toml` | Create | Bun test runner config, install settings |
| `tsconfig.json` | Create | TypeScript compiler options (strict, ESNext, decorators, paths) |
| `tsconfig.test.json` | Create | Extends tsconfig.json, includes tests/ |
| `eslint.config.js` | Create | ESLint 9 flat config — strict, jsdoc, import plugins |
| `.prettierrc.json` | Create | Formatter config |
| `.prettierignore` | Create | Exclude dist/, node_modules/, generated files |
| `.obsidian-linter.jsonc` | Create | markdownlint-obsidian config for docs/ |
| `.markdownlint-cli2.jsonc` | Create | markdownlint-cli2 config for all other markdown |
| `scripts/set-version.sh` | Create | Version bumping automation |
| `scripts/lint-all.sh` | Create | Run all linters in sequence |
| `scripts/validate-docs.sh` | Create | Docs markdown linting only |
| `scripts/update-test-index.sh` | Create | Stub — update docs/test/index.md |
| `src/main.ts` | Create | Bootstrap entry point |
| `src/app.module.ts` | Create | Root AppModule |
| `src/lsp/lsp.module.ts` | Create | LspModule skeleton |
| `src/lsp/index.ts` | Create | Barrel export for lsp module |
| `tests/unit/lsp/lsp.module.spec.ts` | Create | Smoke test — module graph compiles |
| `tests/fixtures/vaults/empty/.gitkeep` | Create | Empty vault fixture for future tests |
| `docs/test/index.md` | Create/update | Add Phase 1 test entry |
| `docs/test/matrix.md` | Create/update | Mark Phase 1 test as planned→written |
| `docs/plans/execution-ledger.md` | Update | Mark Phase 1 as in-progress |

> **git-lfs note:** This plan does not add binary files. If any binary file is added in a future task, update `.gitattributes` with the appropriate `*.ext filter=lfs diff=lfs merge=lfs -text` pattern before committing. The `.gitattributes` file was already created in Phase 0.

---

## Task 1: Verify and harden `.gitignore` and `.gitattributes`

**Files:**

- Modify: `.gitignore`
- Modify: `.gitattributes`

Both files were created in Phase 0. This task verifies they are complete and adds any missing patterns required by the new toolchain.

- [ ] **Step 1.1: Verify `.gitignore` contains all required patterns**

Open `.gitignore` and confirm the following entries are present. Add any that are missing:

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
bun-debug.log*

# Coverage and reports
coverage/
reports/
.nyc_output/

# Bun internals
.bun/
bun.lockb.bak

# TypeScript build info
*.tsbuildinfo

# Editor artifacts
.vscode/
.idea/
*.swp
*.swo
.DS_Store
Thumbs.db

# Source maps (generated)
*.js.map
*.d.ts.map

# Scratch / temp
tmp/

# lefthook local override
.lefthook-local.yml
```

> **Note:** `tmp/` is git-ignored — it is for scratch material only. Nothing in `tmp/` should ever be committed.

- [ ] **Step 1.2: Verify `.gitattributes` contains LF enforcement and git-lfs stubs**

Open `.gitattributes` and confirm the following entries are present. Add any that are missing:

```gitattributes
# Default: normalize line endings to LF
* text=auto eol=lf

# Explicitly text files
*.ts        text eol=lf
*.tsx       text eol=lf
*.js        text eol=lf
*.json      text eol=lf
*.jsonc     text eol=lf
*.toml      text eol=lf
*.yaml      text eol=lf
*.yml       text eol=lf
*.md        text eol=lf
*.sh        text eol=lf
*.feature   text eol=lf
*.gitignore text eol=lf
*.env       text eol=lf

# Binary files — git-lfs tracked (add specific patterns here when binary assets are added)
# Example (uncomment when needed):
# *.png filter=lfs diff=lfs merge=lfs -text
# *.wasm filter=lfs diff=lfs merge=lfs -text
```

- [ ] **Step 1.3: Commit if any changes were made**

```bash
cd /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp
git add .gitignore .gitattributes
git diff --cached --stat
# Only commit if there are staged changes:
git commit -m "chore: harden gitignore and gitattributes for phase-01 toolchain"
```

Expected: exits 0. If no changes were needed, skip the commit.

---

## Task 2: Create `.editorconfig` and `.env.example`

**Files:**

- Create: `.editorconfig`
- Create: `.env.example`

- [ ] **Step 2.1: Create `.editorconfig`**

This prevents CRLF line-ending noise in git diffs. The project is developed on Windows but targets Linux CI.

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

[*.sh]
end_of_line = lf
```

- [ ] **Step 2.2: Create `.env.example`**

This file documents that a `.env` file is needed but stays empty for Phase 1. Future phases will add entries here as new environment variables are introduced.

```bash
# .env.example — copy to .env and fill in values
# Phase 1 requires no environment variables.
# Future phases will add entries here.
```

- [ ] **Step 2.3: Commit**

```bash
git add .editorconfig .env.example
git commit -m "chore: add editorconfig and env.example"
```

---

## Task 3: Install all dependencies

**Files:**

- Modify: `package.json` (dependency sections added by `bun add`)
- Create: `bun.lockb`

- [ ] **Step 3.1: Initialize the Bun project**

```bash
cd /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp
bun init -y
```

Expected: `package.json` created with `"name": "flavor-grenade-lsp"`. If `package.json` already exists, skip this step and proceed to Step 3.2.

- [ ] **Step 3.2: Install NestJS runtime dependencies**

```bash
bun add @nestjs/core @nestjs/common reflect-metadata rxjs
```

Expected: packages appear in `"dependencies"` in `package.json`.

> **Note:** `@nestjs/platform-express` is NOT installed — we use `NestFactory.createApplicationContext` (no HTTP), so no Express platform is needed.

- [ ] **Step 3.3: Install LSP protocol type definitions**

```bash
bun add vscode-languageserver-protocol vscode-languageserver-types
```

These provide the full LSP 3.17 type system (Position, Range, TextDocumentItem, CompletionItem, Diagnostic, etc.) without pulling in VS Code itself.

- [ ] **Step 3.4: Install TypeScript and Node types**

```bash
bun add --dev typescript @types/node
```

- [ ] **Step 3.5: Install ESLint stack**

```bash
bun add --dev @eslint/js typescript-eslint eslint-plugin-jsdoc eslint-import-resolver-typescript eslint-plugin-import
```

> **Note:** This uses the modern unified `typescript-eslint` package (not the older split `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser`). The ESLint config in Task 5 references this package directly.

- [ ] **Step 3.6: Install Prettier and eslint-config-prettier**

```bash
bun add --dev prettier eslint-config-prettier
```

- [ ] **Step 3.7: Install lefthook (pre-commit hooks)**

```bash
bun add --dev lefthook
```

- [ ] **Step 3.8: Verify installs**

```bash
bun --version        # must be ≥ 1.1
bunx tsc --version   # must show TypeScript 5.x
bunx eslint --version # must show 9.x
```

- [ ] **Step 3.9: Set `package.json` to the canonical form**

After all `bun add` commands run, edit `package.json` to ensure the `scripts` section and metadata are correct. The final `package.json` must contain exactly these scripts:

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
    "test:unit": "bun test tests/unit/",
    "lint": "eslint src/ tests/ --max-warnings 0",
    "lint:fix": "eslint src/ tests/ --fix",
    "lint:md:docs": "markdownlint-obsidian --config .obsidian-linter.jsonc docs/",
    "lint:md:other": "markdownlint-cli2 \"**/*.md\" \"!docs/**\" \"!.github/**\" \"!node_modules/**\"",
    "lint:md": "bun run lint:md:docs && bun run lint:md:other",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"tests/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "typecheck:test": "tsc --project tsconfig.test.json --noEmit",
    "gate:1": "bun run typecheck && bun run lint && bun run format:check && bun test && bun run build"
  },
  "keywords": ["lsp", "obsidian", "markdown", "language-server"],
  "license": "MIT"
}
```

> **Key notes on `gate:1`:**
>
> - Runs `typecheck` first — catches type errors before linting
> - `lint` uses `--max-warnings 0` — any warning is a build failure
> - `format:check` is non-destructive — verifies format without writing
> - `bun test` runs all tests in `tests/`
> - `build` is last — only emit compiled output if everything else passes

- [ ] **Step 3.10: Commit lockfile and updated `package.json`**

```bash
git add package.json bun.lockb
git commit -m "chore(deps): install nestjs, lsp types, eslint stack, prettier, lefthook"
```

---

## Task 4: Configure TypeScript

**Files:**

- Create: `tsconfig.json`
- Create: `tsconfig.test.json`

- [ ] **Step 4.1: Write `tsconfig.json`**

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
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "paths": {
      "@src/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

> **`paths` alias:** `@src/*` maps to `./src/*`. This allows `import { LspModule } from '@src/lsp'` from test files without requiring relative `../../` paths. The alias is resolved in ESLint by `eslint-import-resolver-typescript`.

- [ ] **Step 4.2: Write `tsconfig.test.json`**

This config extends the root and adds `tests/` to the compilation scope. It does NOT set `rootDir` (removing it allows both `src/` and `tests/` to coexist without "rootDir must contain all source files" errors).

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": undefined,
    "outDir": "dist-test",
    "noEmit": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

> **Note:** `rootDir` is intentionally omitted (not set to `undefined` — remove the line entirely in the actual file). The JSON shown above uses `undefined` for documentation clarity only.

The actual `tsconfig.test.json` content written to disk:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4.3: Verify typecheck runs (deferred until source exists)**

> TypeScript cannot typecheck with no input files. The full `bun run typecheck` verification is deferred to Task 13 after source files are created in Tasks 9–10.

- [ ] **Step 4.4: Commit TypeScript configs**

```bash
git add tsconfig.json tsconfig.test.json
git commit -m "chore: add typescript strict config with decorator support and test tsconfig"
```

---

## Task 5: Configure ESLint

**Files:**

- Create: `eslint.config.js`

The ESLint config must be maximally strict: `typescript-eslint` strict-type-checked preset, JSDoc requirements on all exports, barrel-only cross-module import enforcement, and zero tolerance for any warnings.

- [ ] **Step 5.1: Write `eslint.config.js`**

Write the following file exactly as shown:

```javascript
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // Base recommended rules
  eslint.configs.recommended,

  // TypeScript strict type-checked preset
  // This enables: no-explicit-any, no-unsafe-*, explicit-function-return-type warnings, etc.
  ...tseslint.configs.strictTypeChecked,

  // Project-wide language options
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Source files: src/ — strict rules with JSDoc and import enforcement
  {
    files: ['src/**/*.ts'],
    plugins: {
      jsdoc,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // ── TypeScript strictness ────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // ── JSDoc on all exports ─────────────────────────────────────────────
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          publicOnly: true,
          checkConstructors: false,
        },
      ],
      'jsdoc/require-description': ['error', { checkConstructors: false }],
      'jsdoc/require-returns': 'error',
      'jsdoc/require-param': 'error',

      // ── Cross-module import enforcement ─────────────────────────────────
      // Prevent importing internal files from other modules — use barrel index.ts instead
      'import/no-internal-modules': [
        'error',
        {
          // Allow imports within the same module directory
          allow: [
            'src/*',
            '@src/*',
            '@nestjs/**',
            'rxjs/**',
            'reflect-metadata',
            'vscode-languageserver-*',
            'bun:*',
          ],
        },
      ],

      // Prevent bypassing barrels via relative ../../ paths across module boundaries
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message:
                'Cross-module imports must go through the barrel index.ts — use @src/<module> instead.',
            },
          ],
        },
      ],
    },
  },

  // Test files: tests/ — relaxed JSDoc, same TypeScript strictness
  {
    files: ['tests/**/*.ts'],
    plugins: {
      jsdoc,
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.test.json',
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // JSDoc not required in test files
      'jsdoc/require-jsdoc': 'off',
    },
  },

  // Global ignores
  {
    ignores: [
      'dist/**',
      'dist-test/**',
      'node_modules/**',
      'eslint.config.js',
      'scripts/**',
      'coverage/**',
      'tmp/**',
    ],
  },
);
```

- [ ] **Step 5.2: Verify ESLint config loads**

```bash
bunx eslint --print-config src/main.ts 2>&1 | head -20
```

Expected: prints a JSON config object. If it errors, check for missing dependencies from Task 3.

- [ ] **Step 5.3: Commit**

```bash
git add eslint.config.js
git commit -m "chore: add aggressively strict eslint flat config with jsdoc and import enforcement"
```

---

## Task 6: Configure Prettier, `bunfig.toml`, and `lefthook.yml`

**Files:**

- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `bunfig.toml`
- Create: `lefthook.yml`

- [ ] **Step 6.1: Write `.prettierrc.json`**

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

- [ ] **Step 6.2: Write `.prettierignore`**

```text
dist/
dist-test/
node_modules/
coverage/
tmp/
*.md
bun.lockb
```

- [ ] **Step 6.3: Write `bunfig.toml`**

```toml
[test]
root = "tests"
coverage = true
coverageReporter = ["text", "lcov"]
coverageDir = "coverage"

[install]
exact = true
```

> **Note:** `root = "tests"` tells Bun to discover test files under `tests/` (not `src/`). This is correct for the `tests/` layout required by the 23 operational requirements.

- [ ] **Step 6.4: Write `lefthook.yml`**

```yaml
pre-commit:
  parallel: false
  commands:
    typecheck:
      run: bun run typecheck
    lint:
      run: bun run lint
    format-check:
      run: bun run format:check
    test:
      run: bun test
```

> **Why `parallel: false`:** The commands must run in order — typecheck first to catch type errors before the linter runs type-aware checks. Parallel execution would interleave output and may produce false positives.

- [ ] **Step 6.5: Install lefthook hooks**

```bash
cd /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp
bunx lefthook install
```

Expected output:

```text
LEFTHOOK  v1.x.x
SUMMARY
  ✓ pre-commit hook installed
```

- [ ] **Step 6.6: Commit**

```bash
git add .prettierrc.json .prettierignore bunfig.toml lefthook.yml
git commit -m "chore: add prettier, bunfig, and lefthook pre-commit hooks"
```

---

## Task 7: Configure markdown linting

**Files:**

- Create: `.obsidian-linter.jsonc`
- Create: `.markdownlint-cli2.jsonc`

Two separate markdown linting tools are used because docs/ markdown is Obsidian Flavored Markdown (which has wiki-links, callouts, and other OFM syntax that standard markdownlint doesn't understand), while other markdown (README, .github/) is standard GFM.

- [ ] **Step 7.1: Write `.obsidian-linter.jsonc`**

This config governs `markdownlint-obsidian` when run against `docs/`. It relaxes rules that conflict with OFM syntax (wiki-links, callout blocks, embedded images).

```jsonc
{
  // markdownlint-obsidian config for docs/
  // Used by: bun run lint:md:docs
  "config": {
    "default": true,
    // MD013: line-length — disabled; long lines are common in OFM frontmatter and tables
    "MD013": false,
    // MD033: no-inline-html — disabled; OFM callouts use HTML-like syntax
    "MD033": false,
    // MD041: first-line-heading — disabled; many docs files start with frontmatter
    "MD041": false,
    // MD051: link-fragments — disabled; wiki-link anchors use OFM [[file#section]] syntax
    "MD051": false
  }
}
```

- [ ] **Step 7.2: Write `.markdownlint-cli2.jsonc`**

This config governs `markdownlint-cli2` when run against non-docs markdown (README, .github/, root-level .md files).

```jsonc
{
  // markdownlint-cli2 config for non-docs markdown
  // Used by: bun run lint:md:other
  // Excludes docs/ (handled by markdownlint-obsidian), .github/, node_modules/, tmp/
  "config": {
    "default": true,
    // MD013: line-length — disabled; long lines in GH Flavored Markdown tables and code blocks
    "MD013": false,
    // MD033: no-inline-html — disabled; GitHub badges in README use inline HTML
    "MD033": false,
    // MD041: first-line-heading — warn only; README files vary
    "MD041": false
  },
  "ignores": [
    "docs/**",
    ".github/**",
    "node_modules/**",
    "tmp/**",
    "dist/**"
  ]
}
```

- [ ] **Step 7.3: Commit markdown lint configs**

```bash
git add .obsidian-linter.jsonc .markdownlint-cli2.jsonc
git commit -m "chore: add markdownlint-obsidian and markdownlint-cli2 configs"
```

> **CI note:** The `lint:md:docs` and `lint:md:other` scripts are also run in `.github/workflows/ci.yml` (configured by a separate agent). The scripts in `package.json` are the source of truth for the exact commands CI runs.

---

## Task 8: Create `scripts/` files

**Files:**

- Create: `scripts/set-version.sh`
- Create: `scripts/lint-all.sh`
- Create: `scripts/validate-docs.sh`
- Create: `scripts/update-test-index.sh`

All scripts must be executable. On Windows with Git Bash, use `chmod +x` after creating each file.

- [ ] **Step 8.1: Create `scripts/set-version.sh`**

```bash
#!/usr/bin/env bash
# set-version.sh — Bump the project version in package.json
# Usage: ./scripts/set-version.sh <major|minor|patch|x.y.z>
set -euo pipefail

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <major|minor|patch|x.y.z>" >&2
  exit 1
fi

CURRENT=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT"

if [[ "$VERSION" == "major" || "$VERSION" == "minor" || "$VERSION" == "patch" ]]; then
  # Use npm version for semver bumping (works without npm install)
  NEW=$(npx --yes semver -i "$VERSION" "$CURRENT")
else
  NEW="$VERSION"
fi

# Update package.json using node
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  pkg.version = '${NEW}';
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo "Version bumped: $CURRENT → $NEW"
echo ""
echo "Next steps:"
echo "  git add package.json"
echo "  git commit -m \"chore: bump version to $NEW\""
echo "  git tag v$NEW"
```

```bash
chmod +x /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/scripts/set-version.sh
```

- [ ] **Step 8.2: Create `scripts/lint-all.sh`**

```bash
#!/usr/bin/env bash
# lint-all.sh — Run all linters (TypeScript, ESLint, Prettier, Markdown)
# Exits non-zero if any linter fails.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== TypeScript typecheck ==="
bun run typecheck

echo "=== ESLint (max-warnings 0) ==="
bun run lint

echo "=== Prettier format check ==="
bun run format:check

echo "=== Markdown lint: docs/ (markdownlint-obsidian) ==="
bun run lint:md:docs

echo "=== Markdown lint: other (markdownlint-cli2) ==="
bun run lint:md:other

echo ""
echo "All linters passed."
```

```bash
chmod +x /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/scripts/lint-all.sh
```

- [ ] **Step 8.3: Create `scripts/validate-docs.sh`**

```bash
#!/usr/bin/env bash
# validate-docs.sh — Lint only docs/ markdown using markdownlint-obsidian
# Use this for quick docs validation without running the full lint suite.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Validating docs/ with markdownlint-obsidian ==="
bun run lint:md:docs

echo "Docs validation passed."
```

```bash
chmod +x /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/scripts/validate-docs.sh
```

- [ ] **Step 8.4: Create `scripts/update-test-index.sh`**

```bash
#!/usr/bin/env bash
# update-test-index.sh — Stub: update docs/test/index.md with new test entries
# TODO Phase 1: implement automatic test index generation from test files
set -euo pipefail

echo "update-test-index.sh: not yet implemented (Phase 1 stub)"
echo "Manually update docs/test/index.md and docs/test/matrix.md for now."
exit 0
```

```bash
chmod +x /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/scripts/update-test-index.sh
```

- [ ] **Step 8.5: Commit scripts**

```bash
git add scripts/
git commit -m "chore: add scripts/ — set-version, lint-all, validate-docs, update-test-index"
```

---

## Task 9: Write the FIRST FAILING TEST

**Files:**

- Create: `tests/unit/lsp/lsp.module.spec.ts`
- Create: `tests/fixtures/vaults/empty/.gitkeep`

This is the TDD step. The test must be written and verified to FAIL before any implementation code is written. Skipping this step violates the TDD contract.

- [ ] **Step 9.1: Create the test directory structure**

```bash
mkdir -p /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/tests/unit/lsp
mkdir -p /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/tests/fixtures/vaults/empty
touch /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/tests/fixtures/vaults/empty/.gitkeep
```

- [ ] **Step 9.2: Write `tests/unit/lsp/lsp.module.spec.ts`**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { NestFactory } from '@nestjs/core';
import type { INestApplicationContext } from '@nestjs/common';
import { LspModule } from '@src/lsp';

describe('LspModule', () => {
  let app: INestApplicationContext;

  beforeAll(async (): Promise<void> => {
    app = await NestFactory.createApplicationContext(LspModule, {
      logger: false,
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });

  it('should compile the module graph without errors', (): void => {
    expect(app).toBeDefined();
  });

  it('should resolve LspModule from the application context', (): void => {
    const module = app.get(LspModule);
    expect(module).toBeInstanceOf(LspModule);
  });
});
```

> **Import note:** The test imports `LspModule` from `@src/lsp` (the barrel), not from `@src/lsp/lsp.module`. This enforces the barrel-only cross-module import rule from the start. The `@src` path alias is configured in `tsconfig.json`.

- [ ] **Step 9.3: Run the test — verify it FAILS**

```bash
cd /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp
bun test tests/unit/lsp/lsp.module.spec.ts
```

Expected output: **FAIL**

```text
error: Cannot find module '@src/lsp'
```

or

```text
FAIL tests/unit/lsp/lsp.module.spec.ts
  × LspModule > should compile the module graph without errors
```

This confirms the test is wired correctly and failing for the right reason. Do NOT proceed to Task 10 until this fail is confirmed.

- [ ] **Step 9.4: Commit the failing test**

```bash
git add tests/
git commit -m "test(lsp): add failing smoke test for LspModule — RED phase"
```

---

## Task 10: Implement the module graph

**Files:**

- Create: `src/lsp/lsp.module.ts`
- Create: `src/lsp/index.ts`
- Create: `src/app.module.ts`
- Create: `src/main.ts`

Now implement the minimum code to make the failing test pass. No extra logic — only what the test requires.

- [ ] **Step 10.1: Create `src/lsp/lsp.module.ts`**

```typescript
import { Module } from '@nestjs/common';

/**
 * LspModule — root module for all LSP protocol handling.
 *
 * This is the top-level NestJS module for the LSP subsystem.
 * Phase 2 will register `LspServer` as a provider here.
 * All future LSP-related providers, controllers, and sub-modules
 * are registered into this module.
 */
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class LspModule {}
```

- [ ] **Step 10.2: Create `src/lsp/index.ts` — the barrel**

```typescript
/**
 * Barrel export for the lsp module.
 *
 * All public exports from the lsp module are re-exported here.
 * External modules must import from this barrel, not from internal files directly.
 *
 * @module lsp
 */
export { LspModule } from './lsp.module.js';
```

- [ ] **Step 10.3: Run the test — verify it PASSES**

```bash
bun test tests/unit/lsp/lsp.module.spec.ts
```

Expected output:

```text
bun test v1.x
tests/unit/lsp/lsp.module.spec.ts:
✓ LspModule > should compile the module graph without errors [Xms]
✓ LspModule > should resolve LspModule from the application context [Xms]

2 pass, 0 fail
```

If the test does not pass, do NOT proceed. Debug until it passes.

- [ ] **Step 10.4: Create `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { LspModule } from './lsp/index.js';

/**
 * AppModule — root composition module.
 *
 * Imports all bounded-context modules into the NestJS dependency
 * injection container. This module is the entry point for
 * `NestFactory.createApplicationContext`.
 *
 * Modules are added here as they are implemented in subsequent phases.
 */
@Module({
  imports: [LspModule],
})
export class AppModule {}
```

- [ ] **Step 10.5: Create `src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * Bootstrap the flavor-grenade LSP server.
 *
 * Creates a NestJS application context (no HTTP server).
 * Phase 2 will attach the stdio JSON-RPC transport here.
 *
 * @returns A promise that resolves when the server is ready, or rejects on fatal error.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  await app.init();

  // Keep the process alive until the LSP client disconnects.
  // Phase 2: replace this with stdin.on('end', ...) handler.
  process.on('SIGTERM', async (): Promise<void> => {
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((err: unknown): never => {
  console.error('Fatal: failed to bootstrap LSP server', err);
  process.exit(1);
});
```

- [ ] **Step 10.6: Run the full test suite**

```bash
bun test
```

Expected:

```text
bun test v1.x
tests/unit/lsp/lsp.module.spec.ts:
✓ LspModule > should compile the module graph without errors
✓ LspModule > should resolve LspModule from the application context

2 pass, 0 fail
```

- [ ] **Step 10.7: Commit the GREEN phase**

```bash
git add src/
git commit -m "feat(lsp): implement LspModule skeleton, barrel, AppModule, and bootstrap — GREEN"
```

---

## Task 11: Verify pre-commit hooks

**Files:**

- Modify: `lefthook.yml` (already created in Task 6 — just verify)

- [ ] **Step 11.1: Confirm lefthook is installed**

```bash
cd /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp
bunx lefthook install
```

Expected: reports that the pre-commit hook is installed (or already installed).

- [ ] **Step 11.2: Verify the hook runs on a dry-run commit**

```bash
bunx lefthook run pre-commit
```

Expected: all four commands run in sequence (typecheck, lint, format-check, test) and exit 0. If any fails, fix it before proceeding.

- [ ] **Step 11.3: Verify `--max-warnings 0` is enforced**

Temporarily add a warning-producing line to a source file, then run lint:

```bash
# This should produce a lint error because --max-warnings 0 is set
echo "const x = 1;" >> /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp/src/main.ts
bun run lint
# Expected: non-zero exit (unused variable warning treated as error)
```

Then revert:

```bash
git checkout -- src/main.ts
```

Expected: `bun run lint` exits 0 after revert.

---

## Task 12: Create `docs/test/` index and matrix

**Files:**

- Create: `docs/test/index.md`
- Create: `docs/test/matrix.md`

The `docs/test/` directory is the test documentation home. All test suites are catalogued here so the test coverage story is visible without reading source code.

- [ ] **Step 12.1: Create `docs/test/index.md`**

```markdown
---
title: Test Index
tags: [test, index, quality]
project: flavor-grenade-lsp
updated: 2026-04-17
---

# Test Index

This index catalogs all test suites in `flavor-grenade-lsp`.

Each entry links to the test file and documents what it covers, the test type (unit/integration/e2e/BDD), and its current status.

---

## Phase 1 — Project Scaffold

| Test File | Type | Covers | Status |
|-----------|------|--------|--------|
| `tests/unit/lsp/lsp.module.spec.ts` | Unit | LspModule compiles; NestJS context initializes | ✅ written |

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ written | Test file exists and passes locally |
| ⏳ planned | Test planned but not yet written |
| ❌ failing | Test exists but currently failing (tracked issue required) |
```

- [ ] **Step 12.2: Create `docs/test/matrix.md`**

```markdown
---
title: Test Coverage Matrix
tags: [test, matrix, coverage, phases]
project: flavor-grenade-lsp
updated: 2026-04-17
---

# Test Coverage Matrix

This matrix maps each implementation phase to its corresponding test files
and shows the progression from planned → written → passing.

---

## Coverage by Phase

| Phase | Feature | Test File | Status |
|-------|---------|-----------|--------|
| 1 | Project scaffold — module graph compiles | `tests/unit/lsp/lsp.module.spec.ts` | ✅ written |
| 2 | LSP initialize handshake | *(Phase 2 plan)* | ⏳ planned |
| 3 | OFM parser | *(Phase 3 plan)* | ⏳ planned |
| 4 | Vault index + vault detection | *(Phase 4 plan)* | ⏳ planned |
| 5 | Wiki-link resolution | *(Phase 5 plan)* | ⏳ planned |
| 6 | Tags | *(Phase 6 plan)* | ⏳ planned |
| 7 | Embeds | *(Phase 7 plan)* | ⏳ planned |
| 8 | Block references | *(Phase 8 plan)* | ⏳ planned |
| 9 | Completions | *(Phase 9 plan)* | ⏳ planned |
| 10 | Navigation | *(Phase 10 plan)* | ⏳ planned |
| 11 | Rename | *(Phase 11 plan)* | ⏳ planned |
| 12 | Code actions | *(Phase 12 plan)* | ⏳ planned |
| 13 | CI & Delivery | *(Phase 13 plan)* | ⏳ planned |

---

## Notes

- Test files live in `tests/` (not `src/`).
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/` *(added in Phase 2)*
- Fixtures: `tests/fixtures/`
- BDD scenarios: `docs/bdd/features/` *(step implementations added per phase)*
```

- [ ] **Step 12.3: Commit docs/test/**

```bash
git add docs/test/
git commit -m "docs(test): add test index and coverage matrix for phase 1"
```

---

## Task 13: Verify ALL gates locally

> **REQUIRED:** All gate checks must pass locally before any CI run. This is non-negotiable per operational requirement #20. If any gate fails, fix the root cause before pushing.

- [ ] **Step 13.1: Run typecheck**

```bash
cd /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp
bun run typecheck
```

Expected: exits 0, no errors, no warnings.

- [ ] **Step 13.2: Run lint with `--max-warnings 0`**

```bash
bun run lint
```

Expected: exits 0, output ends with:

```text
0 warnings
```

If there are ANY warnings, fix them before continuing. The `--max-warnings 0` flag makes any warning a build failure.

- [ ] **Step 13.3: Run format check**

```bash
bun run format:check
```

Expected: exits 0 — all files are formatted correctly.

If it fails, run `bun run format` to auto-fix, then re-check.

- [ ] **Step 13.4: Run all tests**

```bash
bun test
```

Expected:

```text
bun test v1.x
tests/unit/lsp/lsp.module.spec.ts:
✓ LspModule > should compile the module graph without errors
✓ LspModule > should resolve LspModule from the application context

2 pass, 0 fail
```

- [ ] **Step 13.5: Run build**

```bash
bun run build
```

Expected: exits 0, `dist/` directory created containing:

- `dist/main.js`
- `dist/app.module.js`
- `dist/lsp/lsp.module.js`
- `dist/lsp/index.js`

No TypeScript errors.

- [ ] **Step 13.6: Run the gate script**

```bash
bun run gate:1
```

Expected: all five sub-commands run in sequence and exit 0:

```text
$ bun run typecheck && bun run lint && bun run format:check && bun test && bun run build

[typecheck passes]
[lint: 0 warnings]
[format:check passes]
[test: 2 pass, 0 fail]
[build: dist/ created]
```

Gate: ✅ exits 0.

> **Blockers:** If `gate:1` fails, DO NOT push to develop. Fix the failure, re-run `gate:1` from scratch, and only push when it exits 0 cleanly.

---

## Task 14: Update execution ledger

**Files:**

- Modify: `docs/plans/execution-ledger.md`

- [ ] **Step 14.1: Update Phase 1 row in the ledger**

In `docs/plans/execution-ledger.md`, update the Phase 1 row:

Change:

```text
| 1     | Project Scaffold         | ⏳ planned     | `bun run build` exits 0; `bun test` exits 0        | —          | —         |
```

To:

```text
| 1     | Project Scaffold         | ✅ in-progress | `bun run gate:1` exits 0 (typecheck+lint+format+test+build) | 2026-04-17 | —         |
```

Also update the `updated:` frontmatter date to `2026-04-17`.

- [ ] **Step 14.2: Commit the ledger update**

```bash
git add docs/plans/execution-ledger.md
git commit -m "chore(ledger): begin Phase 1 — project scaffold"
```

---

## Task 15: Final commit and push to develop

- [ ] **Step 15.1: Verify clean working tree**

```bash
cd /c/Users/aaqui/obsidian-stack/flavor-grenade-lsp
git status
```

Expected: working tree is clean. If any files are untracked or modified, stage and commit them now.

- [ ] **Step 15.2: Verify gate passes one final time**

```bash
bun run gate:1
```

Expected: exits 0. This must pass before pushing.

- [ ] **Step 15.3: Push feature branch to develop**

```bash
git push --set-upstream origin develop
```

> **Note:** Per the git-flow workflow (ADR007), all work was done on the `develop` branch or a feature branch cut from `develop`. If a feature branch was used, open a PR targeting `develop` before merging.

- [ ] **Step 15.4: Verify CI picks up the push**

Check the GitHub Actions tab for the repository. The `ci.yml` workflow (configured by a separate agent) should trigger on push to `develop`. Verify the CI run completes green.

Once CI is green, update the Phase 1 ledger row status from `✅ in-progress` to `✅ complete` and set the `Completed` date.

```bash
# After CI confirms green:
# Edit docs/plans/execution-ledger.md — update Phase 1 row
git add docs/plans/execution-ledger.md
git commit -m "chore(ledger): mark Phase 1 complete — gate:1 passes in CI"
git push
```

---

## Expected Final State

After this plan is complete, the repository contains:

```text
flavor-grenade-lsp/
├── .editorconfig
├── .env.example
├── .gitattributes                    ← verified and updated
├── .gitignore                        ← verified and updated
├── .markdownlint-cli2.jsonc
├── .obsidian-linter.jsonc
├── .prettierignore
├── .prettierrc.json
├── bunfig.toml
├── bun.lockb
├── eslint.config.js
├── lefthook.yml
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── dist/                             ← generated by bun run build
│   ├── main.js
│   ├── app.module.js
│   └── lsp/
│       ├── lsp.module.js
│       └── index.js
├── docs/
│   ├── plans/
│   │   └── execution-ledger.md       ← Phase 1 marked in-progress → complete
│   └── test/
│       ├── index.md                  ← Phase 1 test catalogued
│       └── matrix.md                 ← Phase 1 matrix entry
├── scripts/
│   ├── lint-all.sh
│   ├── set-version.sh
│   ├── update-test-index.sh
│   └── validate-docs.sh
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   └── lsp/
│       ├── lsp.module.ts
│       └── index.ts                  ← barrel export
├── tests/
│   ├── fixtures/
│   │   └── vaults/
│   │       └── empty/
│   │           └── .gitkeep
│   └── unit/
│       └── lsp/
│           └── lsp.module.spec.ts
└── tmp/                              ← git-ignored scratch directory
```

**Gate:** `bun run gate:1` exits 0.

- `bun run typecheck` — 0 errors, 0 warnings
- `bun run lint` — 0 errors, 0 warnings (enforced by `--max-warnings 0`)
- `bun run format:check` — all files formatted
- `bun test` — 2 tests pass, 0 fail
- `bun run build` — `dist/` emitted cleanly

---

## Design Decisions Recorded in This Phase

| Decision | Rationale |
|----------|-----------|
| `tests/` at root (not `src/__tests__/`) | Clean separation; matches operational requirement #5; `tsconfig.test.json` includes both `src/` and `tests/` |
| Barrel `index.ts` per module | `import/no-internal-modules` + `no-restricted-imports` enforce this; cross-module coupling goes through a single public API |
| `--max-warnings 0` on ESLint | Warnings silently accumulate into tech debt; errors are immediately visible; enforced by CI and pre-commit |
| `lefthook` over `husky` | lefthook is faster (parallel-capable), has zero npm script dependencies, and works reliably on Windows |
| `tsconfig.test.json` without `rootDir` | Allows `src/` and `tests/` to be compiled together without TS18047 "rootDir must contain all source files" errors |
| `@src/*` path alias | Prevents `../../` proliferation in test files; resolved by `eslint-import-resolver-typescript` |
| `git-flow` — feature branches from `develop` | ADR007; develop is the integration branch; main is only touched on release |
| OIDC publishing | ADR008; npm and Bun registry publishing uses OIDC trusted publishing (no long-lived tokens) — configured in Phase 13 |

---

## References

- [[adr/ADR001-stdio-transport]] — why no HTTP platform
- [[adr/ADR007-git-flow-branching]] — branch strategy
- [[adr/ADR008-oidc-publishing]] — OIDC publishing plan
- [[adr/ADR009-precommit-hooks-zero-warnings]] — why `--max-warnings 0`
- [[architecture/layers]] — NestJS module dependency order
- [[ddd/lsp-protocol/domain-model]] — what LspModule will host in Phase 2
- [[plans/execution-ledger]] — phase status tracker
- [[plans/phase-02-lsp-transport]] — next phase plan
