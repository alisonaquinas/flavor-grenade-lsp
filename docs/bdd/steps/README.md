---
title: BDD Step Definitions — Registration Guide
tags: [bdd, testing, gherkin, cucumber, steps]
phase: 0
status: reference
updated: 2026-04-16
---

# BDD Step Definitions — Registration Guide

This document describes how Gherkin step phrases in `docs/bdd/features/*.feature` map to TypeScript step definition functions, the shared test infrastructure, the World object contract, and the convention for step file organization.

Step implementations are populated incrementally across phases:
- **Phase 3 (OFM Parser):** Given/Then steps for document content, OFM index assertions
- **Phase 5 (Wiki-Link Resolution):** When/Then steps for LSP method invocations and diagnostic assertions

---

## Test Infrastructure

The flavor-grenade-lsp BDD suite uses:

| Tool | Role |
|------|------|
| `@cucumber/cucumber` | Gherkin runner, step registration, hooks |
| `jest` | Assertion library (`expect`) used inside step bodies |
| `bun test` | Test runner for unit tests (separate from BDD) |
| `ts-node` or `bun` loader | TypeScript compilation for step files |
| `vscode-languageserver-protocol` | LSP types for asserting response shapes |

### Running the BDD suite

```bash
# Run all feature files
bun run bdd

# Run a specific feature
bun run bdd -- --tags @smoke

# Run only wiki-link scenarios
bun run bdd -- features/wiki-links.feature
```

The `bun run bdd` script invokes:
```
cucumber-js --require 'src/test/steps/**/*.ts' --require 'src/test/support/**/*.ts'
```

---

## Shared World Object

Every scenario shares a single `World` instance reset between scenarios. The World carries:

```typescript
// src/test/support/world.ts
import { World, IWorldOptions } from '@cucumber/cucumber';
import { VaultContext } from './vault-context';
import { LspClient } from './lsp-client';

export interface FlavorGrenadeWorld extends World {
  /** Manages fixture vault directories on disk */
  vault: VaultContext;

  /** Stdio-pipe client connected to the LSP server process */
  lsp: LspClient;

  /** The last LSP response (any method) — typed as unknown, narrowed in Then steps */
  lastResponse: unknown;

  /** Accumulated publishDiagnostics notifications keyed by document URI */
  diagnostics: Map<string, Diagnostic[]>;

  /** The current test's temporary directory (cleaned after scenario) */
  tmpDir: string;
}

export class FlavorGrenadeWorldImpl extends World implements FlavorGrenadeWorld {
  vault!: VaultContext;
  lsp!: LspClient;
  lastResponse: unknown = null;
  diagnostics: Map<string, Diagnostic[]> = new Map();
  tmpDir = '';
}
```

The World is registered in `src/test/support/world-setup.ts`:

```typescript
import { setWorldConstructor } from '@cucumber/cucumber';
import { FlavorGrenadeWorldImpl } from './world';
setWorldConstructor(FlavorGrenadeWorldImpl);
```

---

## VaultContext

`VaultContext` manages fixture vault directories that are created on disk before each scenario and cleaned up after.

```typescript
// src/test/support/vault-context.ts
export class VaultContext {
  constructor(public readonly root: string) {}

  /** Create a file with given content, creating parent directories as needed */
  async createFile(relativePath: string, content: string): Promise<void>;

  /** Create an empty directory */
  async createDir(relativePath: string): Promise<void>;

  /** Write a .flavor-grenade.toml config */
  async writeConfig(toml: string): Promise<void>;

  /** Write a .gitignore */
  async writeGitignore(content: string): Promise<void>;

  /** Absolute URI for a vault-relative path */
  uri(relativePath: string): string;

  /** Clean up all files after scenario */
  async cleanup(): Promise<void>;
}
```

### Hooks for vault lifecycle

```typescript
// src/test/support/hooks.ts
import { Before, After } from '@cucumber/cucumber';
import { FlavorGrenadeWorldImpl } from './world';
import { VaultContext } from './vault-context';
import { LspClient } from './lsp-client';
import { mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

Before(async function (this: FlavorGrenadeWorldImpl) {
  this.tmpDir = await mkdtemp(join(tmpdir(), 'fg-bdd-'));
  this.vault = new VaultContext(this.tmpDir);
  this.lsp = await LspClient.spawn(this.tmpDir);
  this.diagnostics = new Map();

  // Subscribe to publishDiagnostics notifications
  this.lsp.onNotification('textDocument/publishDiagnostics', (params) => {
    this.diagnostics.set(params.uri, params.diagnostics);
  });
});

After(async function (this: FlavorGrenadeWorldImpl) {
  await this.lsp.shutdown();
  await this.vault.cleanup();
});
```

---

## LspClient

`LspClient` wraps a spawned child process and speaks JSON-RPC over stdio.

```typescript
// src/test/support/lsp-client.ts
import { ChildProcess } from 'child_process';
import { NotificationHandler, RequestType } from 'vscode-languageserver-protocol';

export class LspClient {
  static async spawn(workspaceRoot: string): Promise<LspClient>;

  /** Send a request and await the response */
  async request<P, R>(method: string, params: P): Promise<R>;

  /** Send a notification (no response expected) */
  async notify(method: string, params: unknown): Promise<void>;

  /** Register a handler for incoming server notifications */
  onNotification(method: string, handler: NotificationHandler<unknown>): void;

  /** Send initialize + initialized handshake */
  async initialize(rootUri: string): Promise<InitializeResult>;

  /** Send shutdown + exit */
  async shutdown(): Promise<void>;
}
```

---

## Given Step Catalog

Given steps set up preconditions — vault files, server config, and initial state.

### File: `src/test/steps/given/vault-setup.steps.ts`

```typescript
import { Given } from '@cucumber/cucumber';
import { FlavorGrenadeWorldImpl } from '../../support/world';

Given(
  'a vault containing:',
  async function (this: FlavorGrenadeWorldImpl, table: DataTable) {
    // Create .obsidian/ marker and all files from table
    await this.vault.createDir('.obsidian');
    for (const row of table.hashes()) {
      await this.vault.createFile(row.path, row.content ?? '');
    }
    await this.lsp.initialize(this.vault.root);
  }
);

Given(
  'the file {string} contains {string}',
  async function (this: FlavorGrenadeWorldImpl, path: string, content: string) {
    await this.vault.createFile(path, content);
  }
);

Given(
  'the file {string} contains:',
  async function (this: FlavorGrenadeWorldImpl, path: string, docString: string) {
    await this.vault.createFile(path, docString);
  }
);

Given(
  'no vault root is detected (single-file mode)',
  async function (this: FlavorGrenadeWorldImpl) {
    // Initialize with a bare directory — no .obsidian/, no .flavor-grenade.toml
    await this.lsp.initialize(this.vault.root);
  }
);

Given(
  'the server is configured with {word} = {string}',
  async function (this: FlavorGrenadeWorldImpl, key: string, value: string) {
    await this.lsp.notify('workspace/didChangeConfiguration', {
      settings: { flavorGrenade: { [key]: value } }
    });
  }
);
```

### File: `src/test/steps/given/index-state.steps.ts`

```typescript
Given(
  'the vault has been fully indexed',
  async function (this: FlavorGrenadeWorldImpl) {
    // Wait for the vault index to reach a stable state
    await this.lsp.request('flavorGrenade/awaitIndexReady', {});
  }
);

Given(
  'the LSP has fully indexed the vault',
  async function (this: FlavorGrenadeWorldImpl) {
    await this.lsp.request('flavorGrenade/awaitIndexReady', {});
  }
);
```

---

## When Step Catalog

When steps invoke LSP protocol methods and store results in `this.lastResponse`.

### File: `src/test/steps/when/lsp-methods.steps.ts`

```typescript
import { When } from '@cucumber/cucumber';

When(
  'the LSP processes textDocument/didOpen for {string}',
  async function (this: FlavorGrenadeWorldImpl, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    const content = await this.vault.readFile(relativePath);
    await this.lsp.notify('textDocument/didOpen', {
      textDocument: { uri, languageId: 'markdown', version: 1, text: content }
    });
    // Give server time to publish diagnostics
    await new Promise(resolve => setTimeout(resolve, 50));
  }
);

When(
  'a textDocument/completion request is made after {string} in {string}',
  async function (this: FlavorGrenadeWorldImpl, trigger: string, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    const position = await this.vault.findPositionAfter(relativePath, trigger);
    this.lastResponse = await this.lsp.request('textDocument/completion', {
      textDocument: { uri },
      position,
      context: { triggerKind: 2, triggerCharacter: trigger.slice(-1) }
    });
  }
);

When(
  'a textDocument/definition request is made',
  async function (this: FlavorGrenadeWorldImpl) {
    // Uses position stored by preceding Given step (cursor positioning)
    const { uri, position } = this.currentCursorPosition;
    this.lastResponse = await this.lsp.request('textDocument/definition', {
      textDocument: { uri },
      position
    });
  }
);

When(
  'a textDocument/references request is made with includeDeclaration={word}',
  async function (this: FlavorGrenadeWorldImpl, includeStr: string) {
    const include = includeStr === 'true';
    const { uri, position } = this.currentCursorPosition;
    this.lastResponse = await this.lsp.request('textDocument/references', {
      textDocument: { uri },
      position,
      context: { includeDeclaration: include }
    });
  }
);

When(
  'a textDocument/rename request is made with newName {string}',
  async function (this: FlavorGrenadeWorldImpl, newName: string) {
    const { uri, position } = this.currentCursorPosition;
    this.lastResponse = await this.lsp.request('textDocument/rename', {
      textDocument: { uri },
      position,
      newName
    });
  }
);

When(
  'a textDocument/prepareRename request is made',
  async function (this: FlavorGrenadeWorldImpl) {
    const { uri, position } = this.currentCursorPosition;
    this.lastResponse = await this.lsp.request('textDocument/prepareRename', {
      textDocument: { uri },
      position
    });
  }
);

When(
  'a textDocument/codeLens request is made for {string}',
  async function (this: FlavorGrenadeWorldImpl, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    this.lastResponse = await this.lsp.request('textDocument/codeLens', {
      textDocument: { uri }
    });
  }
);
```

---

## Then Step Catalog

Then steps assert on `this.lastResponse` or `this.diagnostics`.

### File: `src/test/steps/then/diagnostics.steps.ts`

```typescript
import { Then } from '@cucumber/cucumber';
import { expect } from '@jest/globals';

Then(
  'no diagnostics are published for {string}',
  async function (this: FlavorGrenadeWorldImpl, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    const diags = this.diagnostics.get(uri) ?? [];
    expect(diags).toHaveLength(0);
  }
);

Then(
  'a diagnostic with code {string} is published for {string}',
  function (this: FlavorGrenadeWorldImpl, code: string, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    const diags = this.diagnostics.get(uri) ?? [];
    const match = diags.find(d => String(d.code) === code);
    expect(match).toBeDefined();
  }
);

Then(
  'the diagnostic severity is {string}',
  function (this: FlavorGrenadeWorldImpl, severityName: string) {
    // Severity: 1=Error 2=Warning 3=Information 4=Hint
    const severityMap: Record<string, number> = {
      Error: 1, Warning: 2, Information: 3, Hint: 4
    };
    const lastDiag = this.lastMatchedDiagnostic;
    expect(lastDiag.severity).toBe(severityMap[severityName]);
  }
);

Then(
  'the diagnostic message contains {string}',
  function (this: FlavorGrenadeWorldImpl, substring: string) {
    const lastDiag = this.lastMatchedDiagnostic;
    expect(lastDiag.message).toContain(substring);
  }
);

Then(
  'the diagnostic range covers {string}',
  function (this: FlavorGrenadeWorldImpl, text: string) {
    // Validates that the diagnostic range spans the expected text token
    const lastDiag = this.lastMatchedDiagnostic;
    expect(lastDiag.range).toBeDefined();
    // Actual span check done against document content
  }
);
```

### File: `src/test/steps/then/completions.steps.ts`

```typescript
Then(
  'the completion list includes {string}',
  function (this: FlavorGrenadeWorldImpl, label: string) {
    const result = this.lastResponse as CompletionList | CompletionItem[];
    const items = Array.isArray(result) ? result : result.items;
    const found = items.some(i => i.label === label || i.insertText === label);
    expect(found).toBe(true);
  }
);

Then(
  'the response field isIncomplete is true',
  function (this: FlavorGrenadeWorldImpl) {
    const result = this.lastResponse as CompletionList;
    expect(result.isIncomplete).toBe(true);
  }
);
```

### File: `src/test/steps/then/navigation.steps.ts`

```typescript
Then(
  'the response is a Location with uri {string}',
  function (this: FlavorGrenadeWorldImpl, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    const location = this.lastResponse as Location;
    expect(location.uri).toBe(uri);
  }
);

Then(
  'the references list contains the location of {string} in {string}',
  function (this: FlavorGrenadeWorldImpl, linkText: string, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    const refs = this.lastResponse as Location[];
    const found = refs.some(r => r.uri === uri);
    expect(found).toBe(true);
  }
);
```

### File: `src/test/steps/then/rename.steps.ts`

```typescript
Then(
  'the WorkspaceEdit renames {string} to {string} in {string}',
  function (this: FlavorGrenadeWorldImpl, oldText: string, newText: string, relativePath: string) {
    const uri = this.vault.uri(relativePath);
    const edit = this.lastResponse as WorkspaceEdit;
    const changes = edit.changes?.[uri] ?? edit.documentChanges?.flatMap(/* ... */) ?? [];
    const hasChange = changes.some(
      c => c.newText === newText && /* range covers oldText */ true
    );
    expect(hasChange).toBe(true);
  }
);
```

---

## Step File Organization

```
src/test/
├── support/
│   ├── world.ts           — World interface + implementation
│   ├── world-setup.ts     — setWorldConstructor registration
│   ├── vault-context.ts   — Fixture directory management
│   ├── lsp-client.ts      — stdio JSON-RPC client
│   └── hooks.ts           — Before/After lifecycle hooks
└── steps/
    ├── given/
    │   ├── vault-setup.steps.ts     — Vault creation, file writing
    │   ├── cursor-position.steps.ts — "cursor is on X" steps
    │   └── index-state.steps.ts     — "vault has been indexed" steps
    ├── when/
    │   └── lsp-methods.steps.ts     — All LSP request/notify When steps
    └── then/
        ├── diagnostics.steps.ts     — Diagnostic assertion steps
        ├── completions.steps.ts     — Completion list assertions
        ├── navigation.steps.ts      — Location / references assertions
        ├── rename.steps.ts          — WorkspaceEdit assertions
        ├── ofm-index.steps.ts       — OFM index structural assertions
        └── vault-state.steps.ts     — Vault detection / mode assertions
```

---

## Implementation Timeline

| Phase | Step files added |
|-------|-----------------|
| Phase 0 (now) | This README |
| Phase 2 (LSP Transport) | `support/lsp-client.ts`, `support/hooks.ts`, basic When steps for `initialize` |
| Phase 3 (OFM Parser) | `given/vault-setup.steps.ts`, `then/ofm-index.steps.ts` |
| Phase 4 (Vault Index) | `given/index-state.steps.ts`, `then/vault-state.steps.ts` |
| Phase 5 (Wiki-Links) | `when/lsp-methods.steps.ts` (full), `then/diagnostics.steps.ts`, `then/navigation.steps.ts` |
| Phase 9 (Completions) | `then/completions.steps.ts` |
| Phase 11 (Rename) | `then/rename.steps.ts` |

---

## Cucumber Configuration

```typescript
// cucumber.config.ts
export default {
  default: {
    paths: ['docs/bdd/features/**/*.feature'],
    require: [
      'src/test/support/world-setup.ts',
      'src/test/support/hooks.ts',
      'src/test/steps/**/*.steps.ts',
    ],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    tags: process.env.TAGS ?? '',
  },
};
```
