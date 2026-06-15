---
tags: [plans, markdown-flavor, shared-library, mdfignore, mdfattributes]
created: 2026-06-08
updated: 2026-06-09
---

# Shared Markdown Flavor Library Plan

## Goal

Extract the Markdown flavor selection and Markdown flavor config-file behavior
from the LSP into a reusable package that can also be consumed by the
`obsidian-markdownlint` package.

The shared package should provide:

- supported Markdown flavor ids, labels, selector values, and guards;
- syntax-based Auto Detect inference;
- structured profile inference and selection;
- `.mdfignore` parsing and matching;
- `.mdfattributes` parsing and matching for `flavor` and
  `structured_profiles`;
- a filesystem-backed resolver for assigning effective flavor metadata to a
  file path.

## Non-Goals

- Do not extract LSP transport, NestJS modules, vault indexing, diagnostics,
  parser AST types, completions, code actions, or editor protocol behavior.
- Do not make the shared package depend on NestJS, VS Code, LSP types, Bun
  runtime APIs, or Obsidian-specific editor state.
- Do not inspect or modify sibling repositories in this LSP repository task.
  The `obsidian-markdownlint` integration should happen in a separate checkout
  or PR after the package API exists.

## Current Source

The code to extract currently lives in:

| Area | Current file |
|---|---|
| Flavor ids, labels, selectors | `src/markdown-flavor/markdown-flavor-contract.ts` |
| Syntax Auto Detect | `src/markdown-flavor/syntax-inference.ts` |
| Effective flavor resolution | `src/markdown-flavor/markdown-flavor-state.ts` |
| Structured profile selection | `src/markdown-flavor/structured-profiles.ts` |
| `.mdfignore` / `.mdfattributes` parsing and matching | `src/markdown-flavor/mdf-config-files.ts` |

`src/markdown-flavor/mdf-config-files.ts` currently mixes three concerns that
should be split during extraction:

- pure parsing of `.mdfignore` and `.mdfattributes`;
- pure pattern matching and cascading rule application;
- Node filesystem reads plus vault path confinement.

## Proposed Package

Create a workspace package:

```text
packages/markdown-flavor/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── flavors.ts
│   ├── structured-profiles.ts
│   ├── syntax-inference.ts
│   ├── flavor-resolution.ts
│   ├── mdfignore.ts
│   ├── mdfattributes.ts
│   ├── mdf-config-resolution.ts
│   └── node.ts
└── test/
    ├── syntax-inference.test.ts
    ├── flavor-resolution.test.ts
    ├── mdfignore.test.ts
    ├── mdfattributes.test.ts
    └── node-resolution.test.ts
```

Recommended package name:

```text
markdown-flavor-detection
```

Use the unscoped npm package name because `markdown-flavor-detection` is
available and directly describes the shared library behavior.

## Public API

Expose the stable shared concepts from `src/index.ts`:

```ts
export {
  MARKDOWN_FLAVOR_IDS,
  MARKDOWN_FLAVOR_SELECTIONS,
  MARKDOWN_FLAVOR_LABELS,
  isMarkdownFlavorId,
  isMarkdownFlavorSelection,
  type MarkdownFlavorId,
  type MarkdownFlavorSelection,
} from './flavors.js';

export {
  STRUCTURED_MARKDOWN_PROFILE_IDS,
  isStructuredMarkdownProfileId,
  isStructuredProfileSelection,
  resolveStructuredProfiles,
  type StructuredMarkdownProfileId,
  type StructuredProfileSelection,
} from './structured-profiles.js';

export {
  inferMarkdownFlavorFromSyntax,
  resolveMarkdownFlavor,
  type ResolveMarkdownFlavorInput,
  type MarkdownFlavorResolution,
} from './flavor-resolution.js';

export {
  parseMdfIgnore,
  matchMdfIgnore,
  shouldPruneDirectoryByMdfIgnore,
  type MdfIgnoreRule,
} from './mdfignore.js';

export {
  parseMdfAttributes,
  applyMdfAttributes,
  type mdfattributes,
  type MdfAttributeRule,
} from './mdfattributes.js';

export {
  resolveFlavorConfig,
  type FlavorConfigResolution,
  type FlavorConfigFileReader,
} from './mdf-config-resolution.js';
```

Expose Node-only filesystem helpers from a separate export path:

```ts
export {
  NodeFlavorConfigResolver,
  type NodeFlavorConfigResolverOptions,
} from './node.js';
```

`package.json` should make the split explicit:

```json
{
  "name": "markdown-flavor-detection",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./node": "./dist/node.js"
  },
  "types": "./dist/index.d.ts",
  "files": ["dist/", "README.md", "LICENSE"]
}
```

## Core API Shape

Use path-based inputs for shared consumers. The LSP can adapt from URI to path;
markdownlint consumers usually already operate on paths.

```ts
export interface ResolveMarkdownFlavorInput {
  path: string;
  languageId?: string;
  hasObsidianMarker?: boolean;
  mdfAttributesFlavor?: MarkdownFlavorSelection;
  mdfAttributesStructuredProfiles?: StructuredProfileSelection;
  syntaxText?: string;
}

export type MarkdownFlavorResolution =
  | {
      kind: 'active';
      selected: MarkdownFlavorSelection;
      effective: MarkdownFlavorId;
      source:
        | 'mdfattributes'
        | 'obsidian-marker'
        | 'syntax-inference'
        | 'commonmark-fallback';
      structuredProfiles: readonly StructuredMarkdownProfileId[];
      structuredProfileSource:
        | 'explicit-selection'
        | 'mdfattributes'
        | 'structured-profile-inference'
        | 'none';
    }
  | {
      kind: 'inactive';
      reason: 'non-markdown-language' | 'unsupported-path' | 'mdfignore';
    };
```

For `.mdfignore` and `.mdfattributes`, keep parsing independent from filesystem:

```ts
const ignoreRules = parseMdfIgnore(content);
const ignored = matchMdfIgnore(ignoreRules, 'docs/private/note.md');

const attributeRules = parseMdfAttributes(content);
const attributes = applyMdfAttributes(attributeRules, 'docs/guide.md');
```

Then provide cascading config resolution for real trees:

```ts
const config = await resolveFlavorConfig({
  root: '/vault',
  path: '/vault/docs/guide.md',
  readFile: async (absolutePath) => fs.promises.readFile(absolutePath, 'utf8'),
  stat: async (absolutePath) => fs.promises.stat(absolutePath),
  maxConfigBytes: 8192,
});
```

The Node adapter can preserve the current LSP convenience:

```ts
const resolver = new NodeFlavorConfigResolver({ maxConfigBytes: 8192 });
const config = await resolver.resolveForFile(vaultRoot, filePath);
const prune = await resolver.shouldPruneDirectory(vaultRoot, directoryPath);
```

## LSP Migration

1. Add the workspace package and move pure code first.
2. Keep compatibility wrappers in `src/markdown-flavor/` so LSP call sites
   change gradually.
3. Replace `MarkdownFlavorState` internals with calls to
   `resolveMarkdownFlavor`.
4. Replace `MarkdownFlavorConfigFiles` internals with `NodeFlavorConfigResolver`
   or a small LSP wrapper around it.
5. Update imports in:
   - `src/vault/vault-scanner.ts`
   - `src/vault/file-watcher.ts`
   - `src/lsp/handlers/configuration.handler.ts`
   - `src/lsp/handlers/did-open.handler.ts`
   - `src/lsp/handlers/did-change.handler.ts`
6. Keep `src/markdown-flavor/markdown-flavor.module.ts` as NestJS wiring only.
   It should provide LSP services, not own shared algorithm code.

## Consumer Migration

For `obsidian-markdownlint`, target this usage pattern:

```ts
import {
  resolveMarkdownFlavor,
  NodeFlavorConfigResolver,
} from 'markdown-flavor-detection/node';

const config = await resolver.resolveForFile(vaultRoot, filePath);
if (config.ignored) return;

const flavor = resolveMarkdownFlavor({
  path: filePath,
  mdfAttributesFlavor: config.attributes.flavor,
  mdfAttributesStructuredProfiles: config.attributes.structuredProfiles,
  syntaxText: markdownText,
  hasObsidianMarker,
});
```

The markdownlint package should not need LSP URI handling, document stores,
VaultIndex, or parser objects to answer: "is this file ignored, and what
Markdown flavor should lint rules assume?"

## Compatibility Rules

- Preserve current `.mdfignore` behavior exactly:
  - nested `.mdfignore` files cascade from root to target directory;
  - `!` negation re-includes;
  - directory pruning remains available;
  - config files larger than `maxConfigBytes` are ignored.
- Preserve current `.mdfattributes` behavior exactly:
  - nested `.mdfattributes` files cascade root to target directory;
  - later matching rules override earlier local rules;
  - nested directories can override parent attributes;
  - `!flavor` and `!structured_profiles` reset inherited attributes;
  - dangerous keys `__proto__`, `constructor`, and `prototype` are ignored;
  - `structured_profiles` and `structuredProfiles` both work.
- Preserve Auto Detect order:
  1. explicit `.mdfattributes` flavor;
  2. Obsidian marker;
  3. syntax inference;
  4. CommonMark fallback.

## Tests

Move or duplicate current tests into the shared package:

| Current tests | New package tests |
|---|---|
| `src/markdown-flavor/__tests__/mdf-config-files.test.ts` | `packages/markdown-flavor/test/mdfignore.test.ts`, `mdfattributes.test.ts`, `node-resolution.test.ts` |
| `src/markdown-flavor/__tests__/markdown-flavor-state.test.ts` | `packages/markdown-flavor/test/flavor-resolution.test.ts` |
| syntax inference assertions | `packages/markdown-flavor/test/syntax-inference.test.ts` |
| structured profile assertions | `packages/markdown-flavor/test/structured-profiles.test.ts` |

Keep LSP integration tests in place. They should prove the LSP still uses the
shared package correctly, not retest every matcher rule.

Required verification after extraction:

```bash
bun run build
bun run lint
bun run typecheck
bun test
bun run bdd
```

For package-level CI, add:

```bash
bun run test:markdown-flavor
bun run --cwd packages/markdown-flavor typecheck
```

Publishing uses the same `v*.*.*` release tag as the LSP server. CI validates
that the tag version, root `package.json` version, and
`packages/markdown-flavor/package.json` version all match before packing either
npm package. The shared package publishes as a separate npm artifact, but its
version remains linked to the server package to avoid parallel version streams.

## Release Plan

1. Land extraction behind compatibility wrappers.
2. Publish `markdown-flavor-detection` from the same `v*.*.*` tag used for
   `flavor-grenade-lsp`.
3. Update `flavor-grenade-lsp` to depend on the workspace package.
4. In a separate repository task, update `obsidian-markdownlint` to consume the
   shared package.
5. After both consumers are stable, remove any duplicate flavor/config logic
   left in the LSP.

## Risks

| Risk | Mitigation |
|---|---|
| Behavior drift in `.mdfignore` / `.mdfattributes` matching | Move existing test fixtures first; run before and after extraction. |
| Shared package accidentally imports NestJS or LSP types | Enforce package-local `tsconfig`, dependency lint, and import boundaries. |
| Path semantics differ between LSP and markdownlint | Public API uses paths; LSP does URI-to-path conversion outside the package. |
| Config resolver reads outside vault root | Keep confinement checks in Node adapter and add traversal/symlink tests. |
| Package API becomes too LSP-specific | Keep inputs small: path, content, marker flags, config attributes. |

## Suggested Work Breakdown

1. Create `packages/markdown-flavor` with package metadata, build config, and
   test config.
2. Move flavor contracts, syntax inference, and structured profile inference.
3. Split `.mdfignore` and `.mdfattributes` into pure parser/matcher modules.
4. Add generic cascading config resolution with injected filesystem reads.
5. Add Node filesystem adapter with vault confinement and size limits.
6. Wire LSP compatibility wrappers to the shared package.
7. Move unit tests and keep LSP integration coverage.
8. Add CI/package checks.
9. Publish package and use it from the LSP.
10. Integrate `obsidian-markdownlint` in a separate task.
