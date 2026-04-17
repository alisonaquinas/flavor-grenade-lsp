---
title: Verification — Code Quality
tags: [test/verification, "requirements/code-quality"]
aliases: [Verify Code Quality]
---

# Verification — Code Quality

## Purpose

This document covers scripted and agent-driven test cases that verify the eight Planguage requirements governing source code quality in `flavor-grenade-lsp`. Unlike workspace or configuration tests, code quality requirements are verified entirely through static analysis and tooling — ESLint, `tsc`, git log inspection — rather than through LSP protocol interactions. All test cases apply to every TypeScript file under `src/` and must pass as a gate before any implementation commit is merged. Source requirements are in [[requirements/code-quality]]; enforcement tooling is defined in [[adr/ADR009-precommit-hooks-zero-warnings]].

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Quality.SOLID.SingleResponsibility` | Each injectable class has exactly one cohesive responsibility group | All phases |
| `Quality.SOLID.DependencyInversion` | All cross-module dependencies target interfaces or injection tokens, never concrete classes | All phases |
| `Quality.Coherence.OneClassPerFile` | Each non-barrel `.ts` file exports exactly one primary entity | All phases |
| `Quality.Coupling.ModuleBoundaries` | Cross-module imports only cross via the target module's `index.ts` barrel | All phases |
| `Quality.Docs.Docstrings` | Every exported class, public method, and public property carries a JSDoc docstring | All phases |
| `Quality.Lint.ZeroWarnings` | ESLint, `tsc`, and Prettier produce zero errors and zero warnings | All phases |
| `Quality.Types.StrictMode` | TypeScript strict mode is enabled; `tsc --noEmit` exits 0 with zero errors | All phases |
| `Quality.TDD.StrictRedGreen` | Every implementation commit is preceded in git history by a failing-test commit | All phases |

## Test Cases

### TC-VER-QUAL-001 — Quality.SOLID.SingleResponsibility

**Planguage Tag:** `Quality.SOLID.SingleResponsibility`
**Gist:** Each class or service must have exactly one reason to change — a single cohesive set of related behaviours.
**Type:** Scripted
**BDD Reference:** **BDD gap** — single-responsibility is a design-review concern not expressible as an LSP scenario.
**Phase:** All phases

**Setup:** All TypeScript implementation files under `src/` present and buildable. A design-review checklist derived from [[ddd/bounded-contexts]] that maps each bounded context to the expected single responsibility of each injectable class.

**Scripted steps:**
```bash
# 1. List all @Injectable() and @Module() classes
grep -rn "@Injectable\|@Module" src/ --include="*.ts" -l

# 2. For each file, extract public method names to identify responsibility groups
grep -n "^\s*public " src/**/*.ts

# 3. Run the design-review checklist: each class should map to one entry in
#    ddd/bounded-contexts. Any class with methods spanning two or more
#    distinct domain concepts is flagged as a violation.
# (This step is agent-driven; see Agent-driven steps below.)

# 4. Zero violations expected — exit non-zero if any class has multiple
#    responsibility groups.
```

**Agent-driven steps:**
1. Enumerate all files in `src/` matching `*.ts` that contain `@Injectable()` or `@Module()`.
2. For each class, list its `public` methods and group them by the domain concept they serve (referencing [[ddd/bounded-contexts]] and [[ddd/ubiquitous-language]] for concept names).
3. Flag any class whose public methods span two or more distinct domain concepts as a violation.
4. Produce a report: class name, file path, method groups found, verdict (pass/violation).
5. Confirm violation count is zero.

**Pass criterion:** 0% violations — every injectable class has exactly one reason to change as determined by design review.
**Fail criterion:** Any class with two or more unrelated public method groups detected by design review.

---

### TC-VER-QUAL-002 — Quality.SOLID.DependencyInversion

**Planguage Tag:** `Quality.SOLID.DependencyInversion`
**Gist:** All cross-module dependencies must point toward abstractions (NestJS injection tokens or TypeScript interfaces), never toward concrete implementation classes from another module.
**Type:** Scripted
**BDD Reference:** **BDD gap** — dependency inversion is a static-analysis concern not expressible as an LSP scenario.
**Phase:** All phases

**Setup:** All TypeScript implementation files under `src/` present and the module directory structure established per [[architecture/layers]].

**Scripted steps:**
```bash
# 1. Enumerate all cross-module import statements
#    (imports that cross from one src/<module>/ directory to another)
grep -rn "^import " src/ --include="*.ts" | \
  grep -v "from '\.\./\?[^/]*'" | \
  grep "from '\.\./\.\."

# 2. For each cross-module import, check whether it imports a concrete
#    class or an interface / injection token.
#    A concrete class import is one that:
#      - does NOT end in ".interface" or ".token" by convention, AND
#      - imports a PascalCase symbol that is not re-exported from index.ts
#        as an interface or token.

# 3. Count violations (direct concrete-class cross-module imports).
#    Exit non-zero if count > 0.
bun run lint --rule "import/no-restricted-paths" --max-warnings 0
```

**Agent-driven steps:**
1. List all `import` statements in `src/**/*.ts` that reference a path outside the importing file's own module directory.
2. For each such import, check whether the imported symbol is a TypeScript interface, an injection token constant, or a concrete class.
3. Cross-module imports of concrete classes that are not re-exported through the target module's `index.ts` barrel as an interface or token are violations.
4. Confirm zero violations.

**Pass criterion:** 0% cross-module concrete imports — 100% of cross-module dependencies reference interfaces or injection tokens.
**Fail criterion:** Any direct cross-module import of a concrete implementation class.

---

### TC-VER-QUAL-003 — Quality.Coherence.OneClassPerFile

**Planguage Tag:** `Quality.Coherence.OneClassPerFile`
**Gist:** Each non-barrel `.ts` file in `src/` must export exactly one primary entity; barrel `index.ts` files are the sole exception.
**Type:** Scripted
**BDD Reference:** **BDD gap** — one-class-per-file is a structural lint rule, not an LSP protocol scenario.
**Phase:** All phases

**Setup:** All TypeScript implementation files under `src/` present. ESLint configured with the `no-extraneous-class` rule and any custom rule enforcing single-export-per-file per [[adr/ADR011-one-class-per-file-namespaces]].

**Scripted steps:**
```bash
# 1. Enumerate all non-barrel .ts files
find src/ -name "*.ts" ! -name "index.ts"

# 2. For each file, count primary exported entities
#    (export class, export interface, export enum, export type for domain concepts)
grep -c "^export \(class\|interface\|enum\|type\)" src/**/*.ts | grep -v ":0$" | grep -v ":1$"
# Any file with count > 1 is a violation

# 3. Enforce via ESLint (must already be configured)
bun run lint --max-warnings 0
# The lint step fails if any file has multiple primary exports
```

**Agent-driven steps:**
1. List all `.ts` files under `src/` excluding `index.ts` files.
2. For each file, count the lines matching `^export (class|interface|enum|type)` that represent domain concepts (not local helper types).
3. Flag any file with a count greater than 1 as a violation.
4. Run `bun run lint --max-warnings 0` and confirm exit code 0.
5. Confirm total violation count is zero.

**Pass criterion:** 0% violations — ESLint exits 0; no non-barrel file exports more than one primary entity.
**Fail criterion:** Any non-barrel file with more than one primary exported entity; `bun run lint --max-warnings 0` exits non-zero.

---

### TC-VER-QUAL-004 — Quality.Coupling.ModuleBoundaries

**Planguage Tag:** `Quality.Coupling.ModuleBoundaries`
**Gist:** Cross-module imports must only cross via a module's public `index.ts` barrel; no import may reference an internal module path.
**Type:** Scripted
**BDD Reference:** **BDD gap** — module-boundary enforcement is a static-analysis concern not expressible as an LSP scenario.
**Phase:** All phases

**Setup:** All TypeScript implementation files under `src/` present. ESLint configured with `import/no-internal-modules` rule per [[adr/ADR011-one-class-per-file-namespaces]].

**Scripted steps:**
```bash
# 1. Detect internal cross-module path imports
#    Pattern: import from '../<other-module>/<non-index-file>'
grep -rn "from '\.\./[a-z-]*/[^']*'" src/ --include="*.ts" | \
  grep -v "from '\.\./[a-z-]*/index'"
# Any match is a violation

# 2. Enforce via ESLint
bun run lint --max-warnings 0
# import/no-internal-modules rule catches all such imports at lint time
```

**Agent-driven steps:**
1. List all `import` statements in `src/**/*.ts` that cross module directory boundaries (i.e., the path contains `../` into a different module directory).
2. For each such import, verify the resolved path ends at `index.ts` or the module directory itself.
3. Any import of the form `import { X } from '../other-module/internal-file'` is a violation.
4. Run `bun run lint --max-warnings 0`. Confirm exit code 0.
5. Confirm total violation count is zero.

**Pass criterion:** 0% violations — `bun run lint --max-warnings 0` exits 0; no cross-module import bypasses a module's `index.ts` barrel.
**Fail criterion:** Any cross-module import that bypasses the module's `index.ts` barrel; `bun run lint --max-warnings 0` exits non-zero.

---

### TC-VER-QUAL-005 — Quality.Docs.Docstrings

**Planguage Tag:** `Quality.Docs.Docstrings`
**Gist:** Every exported class, public method, and public property must carry a JSDoc docstring describing its purpose, parameters, and return value.
**Type:** Scripted
**BDD Reference:** **BDD gap** — docstring coverage is a lint metric not expressible as an LSP scenario.
**Phase:** All phases

**Setup:** All TypeScript implementation files under `src/` present. ESLint configured with `jsdoc/require-jsdoc` for `FunctionDeclaration`, `MethodDefinition`, and `ClassDeclaration` per [[requirements/code-quality]].

**Scripted steps:**
```bash
# 1. Run lint with jsdoc/require-jsdoc enabled
bun run lint --max-warnings 0
# Any jsdoc/require-jsdoc violation causes exit code non-zero

# 2. Count total jsdoc violations explicitly for reporting
bun run lint --format json 2>/dev/null | \
  jq '[.[].messages[] | select(.ruleId == "jsdoc/require-jsdoc")] | length'
# Expected output: 0
```

**Agent-driven steps:**
1. Run `bun run lint --max-warnings 0` and capture the output.
2. Parse the lint output for any messages with rule ID `jsdoc/require-jsdoc`.
3. For each violation, record the file path, line number, and entity type (class, method, property).
4. Confirm violation count is zero.
5. Optionally: run `bun run lint --format json` and use `jq` to count `jsdoc/require-jsdoc` rule hits as a machine-readable metric.

**Pass criterion:** 100% of exported classes, public methods, and public properties carry JSDoc docstrings; `bun run lint --max-warnings 0` exits 0.
**Fail criterion:** Any `jsdoc/require-jsdoc` lint violation; `bun run lint --max-warnings 0` exits non-zero.

---

### TC-VER-QUAL-006 — Quality.Lint.ZeroWarnings

**Planguage Tag:** `Quality.Lint.ZeroWarnings`
**Gist:** All linters — ESLint, TypeScript compiler, Prettier check — must produce zero errors and zero warnings.
**Type:** Scripted
**BDD Reference:** **BDD gap** — zero-warnings enforcement is a CI gate not expressible as an LSP scenario.
**Phase:** All phases

**Setup:** All TypeScript implementation files under `src/` present. `bun run lint` configured to invoke ESLint with `--max-warnings 0` per [[adr/ADR009-precommit-hooks-zero-warnings]].

**Scripted steps:**
```bash
# 1. Run the full lint suite
bun run lint --max-warnings 0
# Expected exit code: 0
# Expected output: zero errors, zero warnings

# 2. Run Prettier check (if configured separately)
bun run format:check
# Expected exit code: 0

# 3. Record total warning and error counts
bun run lint --format compact 2>&1 | tail -1
# Expected: "0 problems (0 errors, 0 warnings)"
```

**Agent-driven steps:**
1. Run `bun run lint --max-warnings 0` from the repository root.
2. Capture the total number of warnings and errors from the lint output.
3. Assert warning count = 0 and error count = 0.
4. Assert exit code = 0.
5. If any warnings or errors are present, record the file, line, rule ID, and severity for each; report as failures.

**Pass criterion:** 0 warnings, 0 errors — `bun run lint --max-warnings 0` exits 0.
**Fail criterion:** Any warning or error produced by `bun run lint`; exit code non-zero.

---

### TC-VER-QUAL-007 — Quality.Types.StrictMode

**Planguage Tag:** `Quality.Types.StrictMode`
**Gist:** TypeScript strict mode is enabled (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`); `tsc --noEmit` exits 0 with zero errors.
**Type:** Scripted
**BDD Reference:** **BDD gap** — TypeScript strict mode is a compiler configuration concern not expressible as an LSP scenario.
**Phase:** All phases

**Setup:** `tsconfig.json` at the repository root with `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noEmitOnError: true`. All TypeScript source files under `src/` present.

**Scripted steps:**
```bash
# 1. Verify tsconfig.json contains the required strict flags
grep -E "\"strict\"|\"noUncheckedIndexedAccess\"|\"exactOptionalPropertyTypes\"" tsconfig.json

# 2. Run the type-checker
bun run typecheck
# Executes: tsc --noEmit --project tsconfig.json
# Expected exit code: 0
# Expected output: zero diagnostic errors

# 3. Confirm no errors in output
bun run typecheck 2>&1 | grep -c "error TS" || true
# Expected: 0
```

**Agent-driven steps:**
1. Open `tsconfig.json` and verify the presence of `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`, and `"noEmitOnError": true`.
2. Run `bun run typecheck` (which executes `tsc --noEmit --project tsconfig.json`).
3. Capture the exit code and the count of `error TS` lines in the output.
4. Assert exit code = 0 and error count = 0.

**Pass criterion:** `tsc --noEmit` exits 0 with zero errors; all four strict compiler options are present in `tsconfig.json`.
**Fail criterion:** Any non-zero exit from `tsc --noEmit`; any compiler error; any required strict flag absent from `tsconfig.json`.

---

### TC-VER-QUAL-008 — Quality.TDD.StrictRedGreen

**Planguage Tag:** `Quality.TDD.StrictRedGreen`
**Gist:** Every piece of production code must be preceded in git history by a failing test commit; no implementation may be written without a red test that drives it.
**Type:** Scripted
**BDD Reference:** **BDD gap** — TDD commit ordering is a git-history audit concern not expressible as an LSP scenario.
**Phase:** All phases

**Setup:** All implementation commits on the active branch. The git log must be available and commit messages must follow the project's TDD commit convention (e.g., `test(red): <description>` for red-phase commits, `feat:` or `fix:` for implementation commits).

**Scripted steps:**
```bash
# 1. List all implementation commits (feat:, fix:, refactor: prefixes)
git log --oneline --no-merges | grep -E "^[a-f0-9]+ (feat|fix|refactor):"

# 2. For each implementation commit, find the nearest preceding test(red): commit
#    that covers the same behaviour (by subject keyword match or file overlap).
git log --oneline --no-merges | grep -E "^[a-f0-9]+ test\(red\):"

# 3. Verify every implementation commit is preceded by at least one test(red): commit
#    for the same feature area. Use file-overlap heuristic:
git log --all --oneline --follow -- src/ | \
  awk 'BEGIN{prev=""} /test\(red\):/{prev=$0; next} /feat:|fix:/{if(prev=="") print "MISSING RED for: "$0; prev=""}'

# 4. Exit non-zero if any implementation commit lacks a preceding red-phase commit.
```

**Agent-driven steps:**
1. Run `git log --oneline --no-merges` on the current branch to retrieve the full commit history.
2. For each commit with a `feat:`, `fix:`, or `refactor:` prefix, find the nearest commit earlier in history whose subject starts with `test(red):` and whose changed files overlap with the implementation commit's changed files.
3. Flag any implementation commit that has no preceding `test(red):` commit for the same behaviour.
4. Also verify that the corresponding implementation plan task (in `plans/`) shows the "run test — verify FAIL" step was checked off before the implementation step, where plan files are accessible.
5. Compute: (implementation commits with a preceding red-test commit / total implementation commits) = 100%.

**Pass criterion:** 100% of new production code commits are preceded in git history by a failing-test commit for the same behaviour; `git log` shows `test(red):` entries before every `feat:`/`fix:` entry for each feature area.
**Fail criterion:** Any implementation commit with no preceding failing-test commit for the same behaviour; any plan task where the red step was skipped or marked after the implementation step.
