---
adr: "011"
title: One class per file with module namespaces for coherence management
status: accepted
date: 2026-04-16
---

# ADR 011 — One class per file with module namespaces for coherence management

## Context

NestJS projects commonly begin with a handful of focused files but accumulate logic over time into large service files containing multiple exported classes, utility functions, and type definitions. A single `vault.service.ts` that grows to contain `VaultService`, `VaultIndexer`, `VaultWatcher`, and `VaultCacheManager` becomes a high-change-frequency file with a wide blast radius: every feature touching the vault domain modifies the same file, merge conflicts increase, and code review diffs are hard to scope.

SOLID's Single Responsibility Principle states that a class should have one reason to change. High Coherence (see [[requirements/code-quality]]) requires that the elements of a module be strongly related in purpose. Both principles point toward small, focused files with narrow interfaces.

TypeScript offers two competing organisational tools for grouping related declarations:

**TypeScript `namespace` keyword.** Namespaces (`namespace Vault { ... }`) provide a compile-time grouping mechanism inherited from TypeScript's pre-ES-module era. They compile to IIFE-based module patterns in CommonJS output. In a modern ES module codebase running on Bun (which uses native ES modules), `namespace` is a CommonJS-era construct that adds no runtime value and can confuse bundlers. The TypeScript team's own style guide discourages `namespace` in ES module projects.

**ES module boundaries as namespaces.** Each directory in `src/` that corresponds to a NestJS module defines an implicit bounded-context namespace through its directory path and barrel file. `src/lsp/` is the LSP namespace; `src/parser/` is the parser namespace. This is the idiomatic TypeScript/NestJS pattern.

The NestJS module system already enforces bounded contexts at the framework level via `@Module()` decorators. Each `@Module()` owns a set of `providers`, `imports`, and `exports`. Over-populating a single module file with multiple service classes defeats the framework's organisational model.

The five bounded contexts identified in the DDD model (see [[ddd/bounded-contexts]]) are: `lsp`, `parser`, `vault`, `reference`, and `config`. These map directly to the five top-level directories under `src/`.

## Decision

Enforce **one primary export per file** across the entire `src/` tree.

The rules, in order of precedence:

1. **One `@Injectable()` service per file.** A file that exports `VaultService` contains only `VaultService`. If `VaultIndexer` is a separate injectable it lives in `vault-indexer.service.ts`, not alongside `VaultService`.

2. **One `@Module()` per file.** Each NestJS module has exactly one `*.module.ts` file. A module file declares `@Module()` metadata and imports its providers; it does not define provider class bodies inline.

3. **Barrel files (`index.ts`) are allowed per module directory.** A `src/vault/index.ts` may re-export the public surface of the vault module for consumption by other modules. Barrel files export only — they never define logic, implement classes, or declare constants.

4. **TypeScript `namespace` keyword is NOT used.** In an ES module project running on Bun, `namespace` adds no value and is a CommonJS relic. ES module boundaries (file + directory structure) provide all necessary namespacing. The ESLint rule `@typescript-eslint/no-namespace` is enabled to enforce this.

5. **Module directory = bounded-context namespace.** The five directories `src/lsp/`, `src/parser/`, `src/vault/`, `src/reference/`, and `src/config/` define the five bounded-context namespaces. Cross-context imports go through the NestJS `@Module()` `exports`/`imports` mechanism, not direct file imports across context boundaries.

6. **Shared value types go in `types.ts` per module.** Interfaces, type aliases, and enums that are used by multiple files within the same module may be co-located in a `src/<module>/types.ts` file. This is the one permitted exception to the one-definition-per-file rule. `types.ts` must not contain any class definitions or injectable providers.

7. **`@typescript-eslint/no-extraneous-class` is enabled.** This rule prevents empty classes and classes used purely as namespaces (a common anti-pattern when developers try to group static methods into a class instead of a module).

## Consequences

**Positive:**

- Each file has exactly one reason to change (SOLID SRP). Adding a new vault feature means creating a new `*.service.ts` file, not opening and modifying an existing large file.
- Code review is naturally scoped to a single responsibility per file. A PR that adds `VaultWatcher` touches `vault-watcher.service.ts` and its test — reviewers know immediately what changed.
- Barrel files (`index.ts`) keep import ergonomics clean for consumers: `import { VaultService } from '@src/vault'` rather than `import { VaultService } from '@src/vault/vault.service'`. The internal file structure is an implementation detail of the module.
- The absence of `namespace` declarations keeps the codebase aligned with modern TypeScript idioms and avoids CommonJS-specific compilation artifacts.
- Small, focused files are easier to navigate in editors and produce shorter, more reviewable diffs.

**Negative:**

- More files. A vault module with eight services has eight `*.service.ts` files instead of one large file. Some developers find many small files harder to navigate than fewer large ones. This is mitigated by consistent naming conventions and barrel files.
- The `types.ts` exception creates a second file to check when looking for type definitions in a module. Developers must remember that value types live in `types.ts`, not in the service file that first uses them.
- Enforcing the convention requires both ESLint rules and code review attention. ESLint can enforce structural rules (no `namespace`, no extraneous classes) but cannot automatically detect when a developer has added a second exported class to an existing service file. Pull request review is the backstop for the one-export-per-file rule itself.

**Neutral:**

- NestJS CLI scaffolding (`nest generate service`) produces one file per service by default. This decision aligns with the CLI's default behaviour, so generated files require no restructuring.

## Related

- [[ddd/bounded-contexts]]
- [[architecture/layers]]
- [[requirements/code-quality]]
- [[adr/ADR009-precommit-hooks-zero-warnings]]
