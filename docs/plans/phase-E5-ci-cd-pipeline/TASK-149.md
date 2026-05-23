---
id: "TASK-149"
title: "Create extension-release.yml GitHub Actions workflow"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "E5"
parent: "FEAT-019"
created: "2026-04-21"
updated: "2026-05-06"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-148"]
tags: [tickets/task, "phase/E5"]
aliases: ["TASK-149"]
---

# Create extension-release.yml GitHub Actions workflow

> [!INFO] `TASK-149` · Task · Phase E5 · Parent: [[FEAT-019]] · Status: `done`

## Description

Create `.github/workflows/extension-release.yml` — a GitHub Actions workflow triggered by `ext-v*` tag pushes. The workflow uses a 7-target build matrix that cross-compiles server binaries on `ubuntu-latest` via Bun, packages platform-specific VSIXs using `vsce package --target`, uploads each as an artifact, and then runs a gated publish job that downloads all 7 VSIXs and publishes them to the VS Code Marketplace using the `VSCE_PAT` repository secret.

---

## Implementation Notes

- **Trigger:** `push.tags: ['ext-v*']`

- **Permissions:** `contents: read`

- **Build job:** `runs-on: ubuntu-latest` with `fail-fast: true` matrix strategy

- **7-target matrix:**

  | VS Code target | Bun `--target` | Binary name |
  |---|---|---|
  | `linux-x64` | `bun-linux-x64` | `flavor-grenade-lsp` |
  | `linux-arm64` | `bun-linux-arm64` | `flavor-grenade-lsp` |
  | `alpine-x64` | `bun-linux-x64-musl` | `flavor-grenade-lsp` |
  | `darwin-x64` | `bun-darwin-x64` | `flavor-grenade-lsp` |
  | `darwin-arm64` | `bun-darwin-arm64` | `flavor-grenade-lsp` |
  | `win32-x64` | `bun-windows-x64` | `flavor-grenade-lsp.exe` |
  | `win32-arm64` | `bun-windows-arm64` | `flavor-grenade-lsp.exe` |

- **Build steps:** checkout, setup-bun, setup-node, `bun install --frozen-lockfile`, cross-compile with `bun build --compile --minify --target=<bun-target>` into `extension/server/`, `npm ci` in extension/, `npm run build:extension` in extension/, `npx vsce package --target <vsce-target>` in extension/, upload VSIX artifact

- **Windows smoke test job:** `needs: build`, download `vsix-win32-x64`, extract the VSIX, launch `extension/server/flavor-grenade-lsp.exe` on `windows-latest`, and fail if the process exits non-zero

- **Publish job:** `needs: [build, smoke-test-windows-binary]`, download all `vsix-*` artifacts with `merge-multiple: true`, install `@vscode/vsce` globally, `vsce publish --packagePath vsix-artifacts/*.vsix` with `VSCE_PAT` env var

- **`--bytecode` flag:** not used for extension release binaries. Extension `0.1.2` showed that Linux Bun `1.3.13` cross-compiling Windows with `--bytecode` could produce a crashing executable.

- **Artifact naming:** `vsix-${{ matrix.vsce-target }}` with `if-no-files-found: error`

- **Validate YAML syntax after creation:**

  ```bash
  python3 -c "import yaml; yaml.safe_load(open('.github/workflows/extension-release.yml'))"
  ```

- See also: [[docs/plans/phase-E5-ci-cd-pipeline]], [[docs/adr/ADR015-platform-specific-vsix]], [[docs/research/vscode-extension-publishing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Automated multi-platform VSIX build and publish on tag push | [[docs/requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | N/A -- CI/CD workflow configuration is not covered by BDD scenarios; verification is through successful workflow execution |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `.github/workflows/extension-release.yml` | CI config | — | 🔴 failing |

> N/A for traditional TDD red/green cycle. The "test" for this task is YAML syntax validation and successful workflow execution on the first `ext-v*` tag push. The RED state represents the workflow file not yet existing; GREEN represents valid YAML that triggers correctly.

> After implementation, update the rows above and the corresponding rows in [[docs/test/matrix]] and [[docs/test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[docs/adr/ADR015-platform-specific-vsix]] | Extension ships platform-specific VSIXs with pre-compiled server binaries; all 7 targets cross-compiled on ubuntu-latest |

---

## Parent Feature

[[FEAT-019]] — CI/CD Pipeline for Multi-Platform Extension Publishing

---

## Dependencies

**Blocked by:**

- [[TASK-148]] — Phase E4 must be complete; the VSIX packaging process and extension manifest must be verified before automating it in CI

**Unblocks:**

- [[TASK-150]] — roadmap and execution ledger updates depend on the workflow being created

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `.github/workflows/extension-release.yml` exists at the correct path

- [ ] YAML parses without errors (`python3 -c "import yaml; yaml.safe_load(open(...))"`)

- [ ] Workflow triggers on `push.tags: ['ext-v*']` only

- [ ] Build matrix covers all 7 platform targets with correct Bun `--target` and binary name mappings

- [ ] All 7 build matrix entries run on `ubuntu-latest`

- [ ] Packaged `win32-x64` VSIX is smoke-tested on `windows-latest`

- [ ] `fail-fast: true` is set on the build matrix

- [ ] Publish job has `needs: [build, smoke-test-windows-binary]` dependency

- [ ] `VSCE_PAT` secret is correctly referenced via `${{ secrets.VSCE_PAT }}`

- [ ] `bun run lint --max-warnings 0` passes

- [ ] `tsc --noEmit` exits 0

- [ ] [[docs/test/matrix]] row(s) updated to `✅ passing`

- [ ] [[docs/test/index]] row(s) added for new test files

- [ ] Parent feature [[FEAT-019]] child task row updated to `in-review`

---

## Notes

This workflow is independent from the existing `ci.yml` (PR testing) and `release.yml` (server binary + npm publish). Extension and server have independent release cycles. The tag convention is `ext-v0.1.0` for extension releases — manual tags for now, with release-please integration deferred. Node.js is required for `vsce` tooling; Bun is used only for server compilation.

The `0.1.3` hotfix removed `--bytecode` from extension release builds after `0.1.2` shipped a Linux-cross-compiled Windows executable that segfaulted at startup. Keep `--bytecode` out of extension package builds unless every platform artifact is revalidated with a launch smoke test.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[docs/requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `open`. Parent: [[FEAT-019]].

> [!SUCCESS] Done — 2026-04-22
> Created `.github/workflows/extension-release.yml` matching reference implementation. Trigger: `ext-v*` tag push. 7-target build matrix (linux-x64, linux-arm64, alpine-x64, darwin-x64, darwin-arm64, win32-x64, win32-arm64) all on ubuntu-latest with `fail-fast: true`. Cross-compile via `bun build --compile --minify --bytecode --target=<bun-target>`. Gated publish job with `VSCE_PAT` secret. YAML validated via js-yaml. Status: `done`.

> [!WARNING] Amended — 2026-05-06
> Extension `0.1.2` proved the original `--bytecode` optimization unsafe for release packages: Linux Bun `1.3.13` cross-compiled a `win32-x64` executable that crashed before LSP initialization. Extension `0.1.3` removed `--bytecode` from release builds and added a `windows-latest` smoke test that extracts the packaged VSIX and launches the bundled server before Marketplace publish. Status remains `done`; implementation guidance above reflects the current workflow.
