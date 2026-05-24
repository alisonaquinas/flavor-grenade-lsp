# Contributing to Flavor Grenade LSP

Thanks for helping improve Flavor Grenade LSP. This project ships two related
artifacts:

| Artifact | Location | Current version |
|---|---:|---:|
| LSP server | repository root | `0.4.2` |
| VS Code extension | `extension/` | `0.2.2` |

> [!IMPORTANT]
> Open feature and fix pull requests against `develop`. Open release pull
> requests against `main`. Maintainers merge with merge commits.

## Development Setup

```sh
git clone https://github.com/alisonaquinas/flavor-grenade-lsp.git
cd flavor-grenade-lsp
bun install
```

The VS Code extension has a separate Node toolchain:

```sh
cd extension
npm install
```

### Tooling

| Tool | Purpose |
|---|---|
| Bun `1.3.13` or newer | Server build, tests, BDD, and CI parity |
| Node.js `20` or newer | VS Code extension tooling |
| lefthook | Local pre-commit checks |
| GitHub CLI | Maintainer PR and release workflow |

Install hooks after dependencies are present:

```sh
lefthook install
```

## Branching

| Branch | Purpose | PR target |
|---|---|---|
| `main` | Released, tagged versions only | Not for feature PRs |
| `develop` | Integration branch | Feature and fix work |
| `feature/<short-name>` | Feature work | `develop` |
| `fix/<short-name>` | Bug fixes | `develop` |
| `release/<version>` | Maintainer release work | `main` |

```sh
git switch develop
git pull origin develop
git switch -c feature/my-change
```

All contributors, including AI-assisted workflows, must use the git-flow branch
families above. Do not open repository PRs from tool-specific branch prefixes
such as `codex/`.

## Required Checks

Run the server checks from the repository root:

```sh
bun run build
bun run typecheck
bun run lint
bun test
bun run bdd
```

Run extension checks from `extension/` when a change touches the extension:

```sh
npm run compile
npm test
npm run test:host
npm run verify:marketplace-assets
npm run verify:package-targets
```

Run dependency and documentation checks when relevant:

```sh
bun run lint:dependencies
bun run lint:docs
bunx markdownlint-cli2 "**/*.md" "!docs/**" "!website/docs/**" "!.github/**" "!node_modules/**" "!extension/node_modules/**" "!extension/.vscode-test/**"
```

> [!NOTE]
> CI uses `markdownlint-obsidian` for `docs/` and `website/docs/`, and
> `markdownlint-cli2` for root and other non-OFM Markdown. `.github/` Markdown
> is GitHub-facing and may use GitHub Flavored Markdown features.

## Test Expectations

Every behavior change needs tests.

| Change type | Expected evidence |
|---|---|
| Parser or resolver behavior | Unit tests near the changed module |
| LSP handler behavior | Handler unit tests and integration coverage when protocol behavior changes |
| Cross-feature workflow | BDD scenario or integration test |
| VS Code extension behavior | Extension unit test or host test |
| Marketplace/package behavior | Marketplace asset or package-target verification |
| Documentation-only change | Markdown lint where applicable |

Update [the test matrix](../docs/test/matrix.md) when new requirement coverage is
added or existing coverage moves.

## Documentation Expectations

- Root-level Markdown should stay portable and use standard Markdown syntax.
- Files in `.github/` may use GitHub Flavored Markdown, including tables,
  task lists, details, and alerts.
- Documentation under `docs/` follows the OFM-aware documentation conventions
  used by `markdownlint-obsidian`.
- Public website documentation under `website/docs/` follows the same
  OFM-aware linting conventions before it is rendered for static website
  publishing.
- Documentation under `extension/docs/` should remain coherent with the server
  specs when extension behavior depends on LSP capabilities.
- Do not use Obsidian wiki-links in `.github/` files. Use standard Markdown
  links instead.

## Code Style

Externally consumed exported symbols need JSDoc comments. Internal exports used
only for NestJS dependency injection or same-package tests should still be named
clearly and documented at the module or folder level when their behavior is not
obvious.

```typescript
/**
 * Resolves a wiki-link target to a vault document.
 *
 * @param target - Raw wiki-link target without surrounding brackets.
 * @returns The resolution result and any diagnostic code.
 */
export function resolveTarget(target: string): ResolutionResult {
  // ...
}
```

Internal symbols should be commented only when the logic is not obvious.

## Commit Messages

Use Conventional Commits:

```text
<type>(<optional scope>): <short summary>
```

| Type | Use for |
|---|---|
| `feat` | New behavior |
| `fix` | Bug fixes |
| `docs` | Documentation-only changes |
| `test` | Test additions or updates |
| `refactor` | Behavior-preserving code changes |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |
| `chore` | Tooling, release, or maintenance work |

Examples:

```text
feat(markdown): resolve same-document anchors
fix(extension): block startup in untrusted workspaces
docs(readme): refresh release status
test(rename): cover Markdown heading anchor updates
```

Breaking changes must use `!` or a `BREAKING CHANGE:` footer.

## Pull Request Checklist

- [ ] Branch was created from the correct base.
- [ ] PR targets `develop` for feature and fix work, or `main` for release work.
- [ ] Merge strategy is a merge commit.
- [ ] Server checks pass when server code changed.
- [ ] Extension checks pass when extension code changed.
- [ ] New behavior has focused tests.
- [ ] Test matrix is updated when requirement coverage changes.
- [ ] Exported symbols have JSDoc.
- [ ] Documentation is updated for user-visible behavior changes.
- [ ] No Obsidian wiki-links were added to `.github/` files.
- [ ] No sibling repositories were changed.

## Code Of Conduct

This project follows the
[Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
By participating, you agree to abide by its terms.
