---
id: "FEAT-019"
title: "CI/CD Pipeline for Multi-Platform Extension Publishing"
type: feature
# status: draft | ready | in-progress | blocked | in-review | done | cancelled
status: draft
priority: "high"
phase: "E5"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["FEAT-018"]
tags: [tickets/feature, "phase/E5"]
aliases: ["FEAT-019"]
---

# CI/CD Pipeline for Multi-Platform Extension Publishing

> [!INFO] `FEAT-019` · Feature · Phase E5 · Priority: `high` · Status: `draft`

## Goal

When a maintainer pushes an `ext-v*` tag, the CI/CD pipeline automatically builds platform-specific VS Code extension packages for all seven supported targets (Linux x64, Linux ARM64, Alpine x64, macOS x64, macOS ARM64, Windows x64, Windows ARM64) and publishes them to the VS Code Marketplace. Vault authors on any supported platform can install the extension from the Marketplace and receive a pre-compiled server binary — no local build step required.

---

## Scope

**In scope:**

- GitHub Actions workflow `extension-release.yml` triggered by `ext-v*` tags
- 7-target build matrix cross-compiling server binaries on `ubuntu-latest` via Bun
- Platform-specific VSIX packaging using `vsce package --target`
- Gated publish job that uploads all 7 VSIXs to the VS Code Marketplace using `VSCE_PAT`
- `fail-fast: true` so nothing publishes unless all 7 targets build successfully
- YAML syntax validation of the workflow file
- Roadmap and execution ledger updates marking extension phases complete
- Manual configuration of `VSCE_PAT` repository secret and Marketplace publisher identity

**Out of scope (explicitly excluded):**

- Release-please integration for automated extension tagging (deferred)
- Extension integration tests or E2E tests in CI (separate concern)
- OpenVSX or alternative marketplace publishing
- Self-hosted runner setup

---

## Linked User Requirements

> User requirements are implementation-agnostic goals from the vault author's perspective. Source: [[requirements/user/index]].

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Vault authors can install the extension from the VS Code Marketplace on any supported platform without building from source | [[requirements/user/index]] |

---

## Linked Functional Requirements

> Planguage requirements that this feature must satisfy. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Automated multi-platform VSIX build and publish pipeline | [[requirements/ci-cd]] |

---

## Linked BDD Features

> Gherkin feature files whose scenarios constitute the acceptance test surface for this feature.

| Feature File | Description |
|---|---|
| — | N/A -- CI/CD pipeline configuration has no BDD scenarios; verification is through successful workflow execution on tag push |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E5-ci-cd-pipeline]]
- ADR: [[adr/ADR015-platform-specific-vsix]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] `.github/workflows/extension-release.yml` exists and parses as valid YAML
- [ ] Workflow triggers on `ext-v*` tag push
- [ ] Build matrix covers all 7 platform targets (linux-x64, linux-arm64, alpine-x64, darwin-x64, darwin-arm64, win32-x64, win32-arm64)
- [ ] All 7 targets cross-compile on `ubuntu-latest` via Bun
- [ ] Publish job is gated on all 7 build jobs completing successfully
- [ ] `VSCE_PAT` secret is referenced correctly in the publish job
- [ ] `docs/roadmap.md` updated with extension phase completion dates
- [ ] `docs/plans/execution-ledger.md` updated if extension phases tracked there
- [ ] All child TASK and CHORE tickets are in `done` state
- [ ] No new linter warnings introduced
- [ ] [[plans/execution-ledger]] row for Phase E5 updated to `done`

---

## Child Tasks

> List all `TASK-NNN` tickets that implement this feature. Create the task tickets before beginning implementation.

| Ticket | Title | Status |
|---|---|---|
| [[TASK-149]] | Create extension-release.yml GitHub Actions workflow | `open` |
| [[TASK-150]] | Update roadmap and execution ledger with extension phase completion | `open` |
| [[CHORE-043]] | Configure VSCE_PAT repository secret and verify Marketplace publisher | `open` |

---

## Dependencies

> Tickets or phases that must complete before this feature can start, and tickets that this feature unblocks.

**Blocked by:**

- [[FEAT-018]] — Phase E4 (Packaging & Local Test) must be complete before CI/CD pipeline phase begins; the workflow depends on a verified `vsce package` process and extension manifest.

**Unblocks:**

- Nothing — this is the final extension phase. After E5, the extension is fully automated for release.

---

## Notes

All 7 targets are cross-compiled on `ubuntu-latest` — no macOS or Windows runners are needed. Bun supports cross-compilation natively via `--target` flags (e.g., `bun-darwin-arm64`, `bun-windows-x64`). The `--bytecode` flag is used in CI builds for faster startup but is omitted in local development builds. The tag convention is `ext-v0.1.0` for extension releases, independent from the server's `v0.1.0` release tags. Release-please integration for automated tagging is deferred to a future phase.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | — |
| `blocked` | All active tasks blocked | Blocker resolved → back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `draft`. Phase E5 CI/CD Pipeline feature defined; all child tasks (TASK-149, TASK-150) and chore (CHORE-043) created. Blocked by FEAT-018 (Phase E4).
