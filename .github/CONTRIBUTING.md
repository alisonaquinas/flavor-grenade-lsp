# Contributing to Flavor Grenade LSP

Thank you for taking the time to contribute. Please read this document before opening a pull request or starting a feature branch.

---

## Development Setup

You will need [Bun](https://bun.sh/) (latest) and [lefthook](https://github.com/evilmartians/lefthook) installed.

```sh
# 1. Clone the repository
git clone https://github.com/aaquinas/flavor-grenade-lsp.git
cd flavor-grenade-lsp

# 2. Install lefthook (manages git hooks)
#    macOS / Linux via Homebrew:
brew install lefthook
#    Or via npm / Bun:
bun add -g @evilmartians/lefthook

# 3. Install project dependencies and register git hooks
lefthook install
bun install
```

---

## Branching Strategy (git-flow)

This project follows a simplified git-flow:

- `main` — released, tagged versions only. Never commit directly to `main`.
- `develop` — integration branch. All feature and fix branches merge here.
- Feature branches: `feat/<short-description>`
- Fix branches: `fix/<short-description>`
- Release branches: `release/<version>` (maintainers only)

**Always branch from `develop`:**

```sh
git switch develop
git pull origin develop
git switch -c feat/my-feature
```

**Open PRs against `develop`**, not `main`.

---

## Pre-commit Hooks

lefthook runs the following checks automatically before each commit:

1. **TypeScript typecheck** — `bun run typecheck`
   Fails the commit if there are any type errors.

2. **ESLint** — `bun run lint` (zero warnings allowed)
   Fails the commit if ESLint reports any warnings or errors.

3. **Prettier format check** — `bun run format:check`
   Fails the commit if any staged file is not formatted according to the Prettier config.

4. **Unit tests** — `bun test`
   Fails the commit if any test fails.

If a hook fails, fix the underlying issue and re-stage your changes — do not bypass hooks with `--no-verify`.

---

## Test Requirements

Every pull request that adds or changes behaviour **must include tests**.

- Test files live under `tests/` and follow the naming convention `<module>.spec.ts`.
- After adding a test file, add an entry for it in [`docs/test/matrix.md`](../docs/test/matrix.md). The matrix maps test files to the requirements they cover.
- Run the full test suite locally before pushing:

```sh
bun test --coverage
```

Coverage reports are written to `coverage/`. There is no hard coverage gate yet, but reviewers will ask for coverage of new code paths.

---

## Docstring Requirement

**All exported symbols must have JSDoc comments.** This includes functions, classes, interfaces, type aliases, and enum members.

```typescript
/**
 * Resolves a wiki-link target to an absolute vault path.
 *
 * @param link - The raw link text, e.g. `Note Title` or `Note Title#Heading`.
 * @param sourcePath - Absolute path of the file containing the link.
 * @param index - The current vault index.
 * @returns The resolved absolute path, or `null` if the target does not exist.
 */
export function resolveWikiLink(
  link: string,
  sourcePath: string,
  index: VaultIndex,
): string | null { ... }
```

Internal (non-exported) symbols should have comments when the logic is non-obvious, but are not required to have full JSDoc.

---

## Markdown Requirements

Two separate linting rules apply depending on the location of the Markdown file:

| Location | Linter | Config |
|---|---|---|
| `docs/` | `markdownlint-obsidian` | `.obsidian-linter.jsonc` |
| All other `.md` files (root, `.github/`, `scripts/`) | `markdownlint-cli2` | `.markdownlint-cli2.jsonc` |

Run both linters locally with:

```sh
./scripts/validate-docs.sh
```

Do **not** use Obsidian wiki-links (`[[...]]`) in `.github/` Markdown files. Use standard GFM links (`[text](url)`).

---

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional body>

<optional footer>
```

Allowed types:

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Tooling, config, dependency updates |
| `test` | Adding or updating tests |
| `refactor` | Code change that is neither a feature nor a fix |
| `perf` | Performance improvement |
| `ci` | CI/CD workflow changes |

Examples:

```
feat(wikilink): resolve aliases defined in frontmatter
fix(diagnostics): FG001 fires on self-referencing notes
docs(contributing): add docstring requirement
test(embed): cover circular embed detection
```

Breaking changes must include a `BREAKING CHANGE:` footer or append `!` after the type:

```
feat!: drop Node.js compatibility — Bun runtime only
```

---

## Pull Request Checklist

Before marking your PR as ready for review, verify each item:

- [ ] Branch was created from `develop` (not `main`)
- [ ] Pre-commit hook passes locally (run `lefthook run pre-commit` to verify)
- [ ] New test added for every new behaviour or bug fix
- [ ] Test file indexed in [`docs/test/matrix.md`](../docs/test/matrix.md)
- [ ] All new exported symbols have JSDoc comments
- [ ] [`docs/plans/execution-ledger.md`](../docs/plans/execution-ledger.md) updated if a phase gate was reached
- [ ] No Obsidian wiki-links in `.github/` Markdown files
- [ ] `bun run build` succeeds locally

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to abide by its terms. Instances of unacceptable behaviour may be reported to the maintainers at the email listed in the repository.
