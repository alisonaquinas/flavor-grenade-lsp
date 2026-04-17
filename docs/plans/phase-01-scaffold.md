---
title: "Phase 1: Project Scaffold"
phase: 1
status: planned
tags: [scaffold, nestjs, bun, typescript, setup]
updated: 2026-04-16
---

# Phase 1: Project Scaffold

| Field      | Value |
|------------|-------|
| Phase      | 1 |
| Title      | Project Scaffold |
| Status     | ⏳ planned |
| Gate       | `bun run build` exits 0; `bun test` exits 0 (no failing tests) |
| Depends on | Phase 0 (Documentation Scaffold) |

---

## Objective

Bootstrap a working NestJS + Bun + TypeScript monolith that compiles cleanly, has the correct project structure, and is ready to receive LSP transport code in Phase 2. No LSP logic is implemented in this phase — only the project skeleton.

---

## Prerequisites

- Bun ≥ 1.1 installed (`bun --version`)
- Node ≥ 20 installed (for NestJS compatibility; `node --version`)
- Git initialized in the project root (`git init` if not already done)
- The `docs/` tree from Phase 0 is already committed

---

## Task List

- [ ] **1. Initialize Bun project**

  ```bash
  bun init -y
  ```

  Ensure `package.json` is created with `"type": "module"` and `"name": "flavor-grenade-lsp"`.

- [ ] **2. Install NestJS core packages**

  ```bash
  bun add @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs
  ```

  NestJS requires `reflect-metadata`. Add `import 'reflect-metadata'` as the first line of `src/main.ts`.

- [ ] **3. Install LSP protocol types**

  ```bash
  bun add vscode-languageserver-protocol vscode-languageserver-types
  bun add --dev @types/node
  ```

  These packages provide the full LSP type definitions without pulling in a full VS Code dependency.

- [ ] **4. Install development tooling**

  ```bash
  bun add --dev typescript eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier
  ```

- [ ] **5. Install test dependencies**

  ```bash
  bun add --dev @cucumber/cucumber jest @jest/globals ts-node
  ```

- [ ] **6. Configure `tsconfig.json`**

  Create `tsconfig.json` at the project root:

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
    "exclude": ["node_modules", "dist", "src/test/**/*"]
  }
  ```

- [ ] **7. Configure `bunfig.toml`**

  ```toml
  [test]
  root = "src"
  coverage = true

  [install]
  exact = true
  ```

- [ ] **8. Create `src/main.ts` — NestJS bootstrap**

  ```typescript
  import 'reflect-metadata';
  import { NestFactory } from '@nestjs/core';
  import { LspModule } from './lsp/lsp.module';

  async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(LspModule, {
      logger: ['error', 'warn'],
    });
    await app.init();
  }

  bootstrap().catch(console.error);
  ```

- [ ] **9. Create `LspModule` skeleton**

  Create `src/lsp/lsp.module.ts`:

  ```typescript
  import { Module } from '@nestjs/common';

  @Module({
    imports: [],
    providers: [],
    exports: [],
  })
  export class LspModule {}
  ```

- [ ] **10. Create `.flavor-grenade.toml` project config marker**

  Create `.flavor-grenade.toml` at the project root. This file serves as the vault detection marker for the project itself and also as the LSP server configuration schema reference:

  ```toml
  [vault]
  # Extensions treated as markdown documents (default: [".md"])
  extensions = [".md"]

  [lsp]
  # Maximum number of completion candidates returned
  completion.candidates = 100

  # Wiki-link style: "file-stem" | "title-slug" | "path-relative"
  linkStyle = "file-stem"

  [diagnostics]
  # Disable specific diagnostic codes globally
  suppress = []
  ```

- [ ] **11. Configure ESLint**

  Create `eslint.config.js`:

  ```javascript
  import tseslint from '@typescript-eslint/eslint-plugin';
  import tsparser from '@typescript-eslint/parser';

  export default [
    {
      files: ['src/**/*.ts'],
      languageOptions: { parser: tsparser },
      plugins: { '@typescript-eslint': tseslint },
      rules: {
        ...tseslint.configs.recommended.rules,
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'warn',
      },
    },
  ];
  ```

- [ ] **12. Configure Prettier**

  Create `.prettierrc.json`:

  ```json
  {
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2
  }
  ```

- [ ] **13. Create `package.json` scripts**

  Ensure `package.json` contains:

  ```json
  {
    "scripts": {
      "dev": "bun --watch src/main.ts",
      "build": "tsc --project tsconfig.json",
      "start": "node dist/main.js",
      "test": "bun test",
      "bdd": "cucumber-js",
      "lint": "eslint src/",
      "lint:fix": "eslint src/ --fix",
      "format": "prettier --write src/",
      "gate:1": "bun run build && bun test"
    }
  }
  ```

- [ ] **14. Create project directory structure**

  ```
  src/
  ├── main.ts
  ├── lsp/
  │   └── lsp.module.ts
  ├── parser/         (Phase 3)
  ├── vault/          (Phase 4)
  └── test/
      ├── support/
      └── steps/
  ```

- [ ] **15. Create `.gitignore`**

  ```
  node_modules/
  dist/
  .env
  *.log
  reports/
  coverage/
  .bun/
  ```

---

## Gate Verification

```bash
# Primary gate — must both pass
bun run build
bun test

# Secondary checks
bun run lint
bun run format --check
```

Expected output:
- `tsc` exits 0 with no errors
- `bun test` exits 0 (no test files yet, this is expected)
- `eslint` exits 0 (no lint errors on skeleton code)

---

## References

- `[[adr/ADR001-stdio-transport]]`
- `[[architecture/layers]]`
- `[[plans/phase-02-lsp-transport]]`
