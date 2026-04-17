---
title: Requirements — Code Quality
tags:
  - requirements/code-quality
aliases:
  - Code Quality Requirements
  - Quality Requirements
---

# Code Quality Requirements

> [!NOTE] Scope
> These requirements govern source code quality: SOLID adherence, module coherence, coupling limits, documentation standards, and linting policy. They apply to all TypeScript source files under `src/`. Compliance is enforced via ESLint, TypeScript strict mode, and the pre-commit gate defined in [[requirements/ci-cd]].

---

**Tag:** Quality.SOLID.SingleResponsibility
**Gist:** Each class or service must have exactly one reason to change — a single cohesive set of related behaviours.
**Ambition:** Classes with multiple unrelated responsibilities become the locus of unrelated change pressure: a fix to one concern risks breaking another. Single Responsibility keeps blast radius small, makes unit tests narrowly scoped, and is the prerequisite for all other SOLID principles. In a NestJS bounded-context architecture this means each `@Injectable()` owns one domain concept — not a domain concept plus persistence plus validation.
**Scale:** Percentage of injectable classes, modules, and services that have more than one primary responsibility group as identified by code review. A responsibility group is defined as a set of public methods that share a single domain concept. Classes whose public methods span two or more unrelated domain concepts are counted as violations.
**Meter:**
1. Enumerate all `@Injectable()` and `@Module()` classes in `src/`.
2. For each class, list its public methods and group them by the domain concept they serve.
3. A class with methods from two or more distinct domain concepts is a violation.
4. Compute: (classes with exactly one responsibility group / total classes) × 100.
**Fail:** Any class with two or more unrelated public method groups detected by design review.
**Goal:** 0% violations — every class has exactly one reason to change.
**Stakeholders:** All contributors, reviewers, future maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[architecture/layers]], [[ddd/bounded-contexts]], Robert C. Martin, *Clean Architecture* §7.

---

**Tag:** Quality.SOLID.DependencyInversion
**Gist:** All cross-module dependencies must point toward abstractions (NestJS injection tokens or TypeScript interfaces), never toward concrete implementation classes from another module.
**Ambition:** Direct concrete imports across module boundaries create hidden structural coupling — changing a concrete class in one module can silently break another. Dependency Inversion enforces that only stable interfaces and injection tokens cross module boundaries, making each module independently replaceable. In NestJS this means using `@Inject(TOKEN)` with interface types, not `import { ConcreteService }` from another module's internal path.
**Scale:** Percentage of cross-module import statements that reference a concrete class (not an interface type or injection token) directly from another module's non-barrel path.
**Meter:**
1. List all import statements in `src/` that cross module directory boundaries (e.g., `src/lsp/` importing from `src/vault/`).
2. For each cross-module import, check whether it imports a concrete class or an interface/token.
3. A cross-module import of a concrete class (not re-exported via the module's `index.ts` barrel as an interface or token) is a violation.
4. Compute: (cross-module imports referencing interface or token / total cross-module imports) × 100.
**Fail:** Any direct cross-module import of a concrete implementation class.
**Goal:** 0% cross-module concrete imports — 100% of cross-module dependencies are to interfaces or injection tokens.
**Stakeholders:** Contributors, architectural reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR011-one-class-per-file-namespaces]], [[architecture/layers]], LSP specification §3.17.

---

**Tag:** Quality.Coherence.OneClassPerFile
**Gist:** Each `.ts` source file must export exactly one primary class, service, module, or interface; barrel `index.ts` files that re-export from other files in the same directory are the sole exception.
**Ambition:** A one-entity-per-file discipline makes the codebase navigable — the filename is a reliable signal of what is inside. It also enforces that a class's full context (constructor, methods, injected dependencies) is contained in a single scrollable unit, reducing the cognitive overhead of cross-file reading. Files that contain multiple unrelated classes are harder to test in isolation, harder to rename, and harder to move between modules.
**Scale:** Percentage of non-barrel `.ts` files in `src/` that export more than one primary entity (class, interface, enum, or type alias that represents a domain concept — not a local helper type).
**Meter:**
1. Enumerate all `.ts` files in `src/` that are not named `index.ts`.
2. For each file, count the number of `export class`, `export interface`, `export enum`, and `export type` declarations that name a domain concept.
3. A file with more than one such export is a violation.
4. Compute: (files with exactly one primary export / total non-barrel files) × 100.
**Fail:** Any non-barrel file with more than one primary exported entity.
**Goal:** 0% violations — ESLint `no-extraneous-class` and custom rules enforce this at lint time (`bun run lint` must exit 0).
**Stakeholders:** All contributors, code reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR011-one-class-per-file-namespaces]], [[requirements/ci-cd]].

---

**Tag:** Quality.Coupling.ModuleBoundaries
**Gist:** Cross-module imports must only cross via a module's public `index.ts` barrel — never via internal paths such as `../../lsp/lsp.server`.
**Ambition:** Direct internal path imports bypass the module's public API and create invisible structural dependencies on internal implementation details. When the internal file is moved, renamed, or refactored, all callers break silently. Barrel-only cross-module imports enforce an explicit public API boundary: a module's `index.ts` is its contract, and nothing inside it is reachable from outside except through that barrel.
**Scale:** Percentage of cross-module import statements in `src/` that reference an internal module path (i.e., a path that traverses into another module directory without going through that module's `index.ts`).
**Meter:**
1. Enumerate all import statements in `src/` that cross module directory boundaries.
2. For each cross-module import, verify the path ends in `index.ts` or the module directory itself (which resolves to `index.ts`).
3. An import of the form `import { X } from '../other-module/internal-file'` is a violation.
4. Compute: (cross-module imports via barrel / total cross-module imports) × 100.
**Fail:** Any cross-module import that bypasses the module's `index.ts` barrel.
**Goal:** 0% violations — enforced by ESLint `import/no-internal-modules` rule; `bun run lint --max-warnings 0` must exit 0.
**Stakeholders:** All contributors, architectural reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR011-one-class-per-file-namespaces]], [[architecture/layers]].

---

**Tag:** Quality.Docs.Docstrings
**Gist:** Every exported class, public method, and public property must carry a JSDoc docstring that describes its purpose, parameters, and return value.
**Ambition:** Docstrings are the first line of API documentation for contributors and for future-self maintenance. An undocumented public export forces the reader to infer intent from implementation, which is error-prone and slow. In a NestJS project where many classes are resolved by injection tokens, the docstring on the class is often the only human-readable description of what the token provides. `eslint-plugin-jsdoc` enforces this at lint time so that documentation debt never accumulates silently.
**Scale:** Percentage of exported classes, public methods, and public properties in `src/` that have a non-empty JSDoc comment block.
**Meter:**
1. Run `bun run lint` with `jsdoc/require-jsdoc` rule enabled for `FunctionDeclaration`, `MethodDefinition`, `ClassDeclaration`.
2. Count the number of `jsdoc/require-jsdoc` violations reported.
3. Compute: (exports with docstrings / total exports) × 100.
**Fail:** Any `jsdoc/require-jsdoc` lint violation; `bun run lint --max-warnings 0` exits non-zero.
**Goal:** 100% of exported classes, public methods, and public properties carry JSDoc docstrings.
**Stakeholders:** Contributors, documentation consumers, IDE users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/ci-cd#CICD.PreCommit.Gate]], [[adr/ADR009-precommit-hooks-zero-warnings]].

---

**Tag:** Quality.Lint.ZeroWarnings
**Gist:** All linters — ESLint, TypeScript compiler, Prettier check — must produce zero errors AND zero warnings; `--max-warnings 0` is enforced in CI and pre-commit.
**Ambition:** Warnings that accumulate without consequence become invisible. A codebase that tolerates hundreds of warnings trains contributors to ignore lint output entirely, eroding the signal value of the linting system. Zero-warnings enforcement transforms lint from an advisory tool into an enforceable quality gate. Every new warning is immediately visible as a regression.
**Scale:** Total warning count produced by `bun run lint` (ESLint with `--max-warnings 0`) across all files in `src/`. A count of zero is the only passing state.
**Meter:**
1. Run `bun run lint` from the repository root.
2. Count the total number of warnings and errors reported by ESLint.
3. A warning count > 0 is a failure. An error count > 0 is also a failure.
4. Record the exit code: non-zero exit = failure.
**Fail:** Any warning or error produced by `bun run lint`; exit code non-zero.
**Goal:** 0 warnings, 0 errors — `bun run lint --max-warnings 0` exits 0.
**Stakeholders:** All contributors, CI pipeline.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR009-precommit-hooks-zero-warnings]], [[requirements/ci-cd#CICD.PreCommit.Gate]].

---

**Tag:** Quality.Types.StrictMode
**Gist:** TypeScript strict mode is enabled (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`); compiler warnings are treated as errors (`noEmitOnError: true`).
**Ambition:** TypeScript's default settings permit a wide class of runtime errors — nullable dereferences, implicit `any`, unchecked array accesses — to pass type checking silently. Strict mode closes these gaps. `noUncheckedIndexedAccess` prevents array index access from producing `T` when it should produce `T | undefined`. `exactOptionalPropertyTypes` prevents assigning `undefined` to optional properties not declared to accept it. Together these settings mean that a passing typecheck provides genuine safety guarantees, not just syntactic validation.
**Scale:** TypeScript compiler (`tsc`) exit code when run with `--noEmit` against the full `src/` tree. A non-zero exit code indicates at least one error.
**Meter:**
1. Run `bun run typecheck` (which executes `tsc --noEmit --project tsconfig.json`).
2. Record the exit code and the number of diagnostic errors reported.
3. Exit code 0 with 0 errors = pass. Any other result = fail.
**Fail:** Any non-zero exit from `tsc --noEmit`; any compiler error or warning treated as error.
**Goal:** `tsc --noEmit` exits 0 with zero errors and zero `noEmitOnError`-blocked outputs.
**Stakeholders:** All contributors, CI pipeline, type safety reviewers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[plans/phase-01-scaffold]], [[adr/ADR009-precommit-hooks-zero-warnings]], TypeScript Handbook §Compiler Options.

---

**Tag:** Quality.TDD.StrictRedGreen
**Gist:** Every piece of production code must be preceded by a failing test; no implementation may be written without a red test that drives it.
**Ambition:** Test-Driven Development in its strict form — write the failing test, see it fail for the right reason, then write the minimal implementation to make it pass — is not optional in this project. Skipping the red phase breaks the causal chain between requirement and code: the test no longer proves the implementation is needed, only that it exists. Strict TDD also prevents test code from being retrofitted to match an implementation that may already be wrong. In a project where the correctness of the LSP wire protocol and vault index is non-negotiable, every new behaviour must be demonstrated to fail before it passes.
**Scale:** Percentage of implementation commits that are preceded in the git history by a failing-test commit covering the same behaviour. A "failing-test commit" is a commit where the test file exists, the implementation does not yet exist (or exists in stub-only form), and `bun test` on that test file would exit non-zero.
**Meter:**
1. For each implementation PR, verify the git log contains at least one commit with the pattern `test(red):` or equivalent that precedes the implementation commit.
2. Check that the plan task for the implemented behaviour includes a "run test — verify FAIL" step that was checked off before the implementation step.
3. Compute: (implementation commits with a preceding red-test commit / total implementation commits) × 100.
**Fail:** Any implementation commit with no preceding failing test commit for the same behaviour; any plan task where the red step was skipped.
**Goal:** 100% of new production code is preceded by a failing test in the git history.
**Stakeholders:** All contributors, code reviewers, phase auditors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** Kent Beck, *Test-Driven Development by Example*; [[plans/phase-01-scaffold#Task-9]], [[requirements/development-process#Process.Testing.DirectoryStructure]].
