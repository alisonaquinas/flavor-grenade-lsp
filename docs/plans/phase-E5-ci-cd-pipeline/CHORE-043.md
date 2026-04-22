---
id: "CHORE-043"
title: "Configure VSCE_PAT repository secret and verify Marketplace publisher"
type: chore
# status: open | in-progress | blocked | in-review | done | cancelled
status: open
priority: "high"
phase: "E5"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/chore, "phase/E5"]
aliases: ["CHORE-043"]
---

# Configure VSCE_PAT repository secret and verify Marketplace publisher

> [!INFO] `CHORE-043` · Chore · Phase E5 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Register the publisher identity `alisonaquinas` on the VS Code Marketplace (if not already registered), create a Personal Access Token (PAT) in Azure DevOps scoped to Marketplace `Manage`, and add it as the `VSCE_PAT` repository secret in the GitHub repository settings. This is a manual/operational step — no code changes are involved. The CI publish job in `extension-release.yml` requires this secret to authenticate with the Marketplace.

---

## Motivation

The `extension-release.yml` workflow's publish job references `${{ secrets.VSCE_PAT }}` to authenticate with the VS Code Marketplace. Without this secret configured, the gated publish step will fail silently or error on the first `ext-v*` tag push. Completing this chore before the first release ensures the pipeline works end-to-end.

- Motivated by: [[plans/phase-E5-ci-cd-pipeline]] publish job requirement

---

## Linked Requirements

> Quality, process, CI/CD, or security requirements this chore addresses. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | CI/CD publish job requires authenticated Marketplace access via PAT | [[requirements/ci-cd]] |

---

## Scope of Change

> List every file or directory that will be modified, created, or deleted. Keep this section honest — if the scope grows during execution, update this list and note the expansion in the Workflow Log.

**Files modified:**

- None — this is a manual/operational step performed in external services (Azure DevOps, VS Code Marketplace, GitHub Settings)

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

> ADRs whose implementation constraints apply to this chore.

| ADR | Constraint |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Extension ships platform-specific VSIXs; the publish step requires Marketplace authentication |

---

## Dependencies

> Other tickets or phase gates that must complete before this chore can start. Also list tickets this chore unblocks. Update the `dependencies` frontmatter list to match **Blocked by** entries.

**Blocked by:**

- None — this can be done in parallel with TASK-149 (workflow creation)

**Unblocks:**

- [[FEAT-019]] — the feature cannot be fully verified until the VSCE_PAT secret is in place and a tag push triggers a successful publish

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Publisher `alisonaquinas` is registered on the VS Code Marketplace (https://marketplace.visualstudio.com/manage)
- [ ] A PAT exists in Azure DevOps scoped to Marketplace `Manage` for the `alisonaquinas` publisher
- [ ] The PAT is stored as `VSCE_PAT` in the GitHub repository's Settings > Secrets and variables > Actions > Repository secrets
- [ ] `VSCE_PAT` secret is accessible to workflows running on the default branch
- [ ] No code changes in `src/` or `extension/` (manual/operational only)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] `bun test` passes (no regressions introduced) — verify no accidental code changes

---

## Notes

**Step-by-step checklist for the human operator:**

1. **Verify or register publisher identity:**
   - Go to https://marketplace.visualstudio.com/manage
   - Sign in with the Microsoft account associated with `alisonaquinas`
   - If the publisher `alisonaquinas` does not exist, create it (Publisher name: `alisonaquinas`, Display name as desired)

2. **Create a Personal Access Token (PAT):**
   - Go to https://dev.azure.com/ and sign in with the same Microsoft account
   - Navigate to User Settings > Personal Access Tokens
   - Create a new token with:
     - **Organization:** All accessible organizations
     - **Scopes:** Marketplace > Manage
     - **Expiration:** Set an appropriate expiry (recommend 1 year; set a calendar reminder to rotate)
   - Copy the token value immediately (it will not be shown again)

3. **Add the secret to GitHub:**
   - Go to the GitHub repository Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `VSCE_PAT`
   - Value: paste the PAT from step 2
   - Click "Add secret"

4. **Verify:**
   - Optionally run `npx vsce verify-pat alisonaquinas` locally with the PAT exported as `VSCE_PAT` to confirm it works before the first CI publish

The PAT should be rotated before its expiry date. Consider adding a reminder or documenting the expiry date in a secure location.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-21
> Chore created. Status: `open`. Motivation: CI publish job requires VSCE_PAT repository secret scoped to Marketplace Manage; must be configured before first extension release.
