---
id: "FEAT-022"
title: "Attachment Intelligence"
type: feature
status: draft
priority: high
phase: 15
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["FEAT-021"]
tags: [tickets/feature, "phase/15"]
aliases: ["FEAT-022"]
---

# Attachment Intelligence

> [!INFO] `FEAT-022` · Feature · Phase 15 · Priority: `high` · Status: `draft`

## Goal

Vault authors can treat non-Markdown files as first-class attachment targets.
Embeds and Markdown image links complete existing assets, diagnose missing
assets, jump to existing files, and show lightweight metadata without adding
attachments to the parsed document index.

---

## Scope

**In scope:**

- Index non-Markdown vault files as attachment targets under each vault folder.
- Complete attachment paths in `![[...]]` and `![alt](...)` contexts.
- Diagnose broken attachment references with the documented embed severity.
- Return definition locations for attachment references.
- Show hover metadata for attachment targets: vault-relative path, file type,
  file size, and image dimensions when cheaply available.
- Respect configured attachment folder hints when available.

**Out of scope (explicitly excluded):**

- Moving, copying, or rewriting attachment files.
- Workspace file-operation refactors for attachment moves.
- Preview rendering inside hover.
- Heavyweight PDF parsing or blocking metadata extraction.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Embed.ManageAttachments` | Manage attachments with editor help | [[requirements/user/ofmarkdown-parity]] |
| `User.Embed.DetectBrokenEmbed` | See missing embeds immediately | [[requirements/user/embedding-content]] |
| `User.Embed.PreviewLinkedContent` | Preview embed targets on hover | [[requirements/user/embedding-content]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.Intelligence` | Core attachment intelligence | [[requirements/ofmarkdown-parity]] |
| `Embed.Resolution.ImageTarget` | Image embeds resolve as attachment targets | [[requirements/embed-resolution]] |
| `Embed.Resolution.MarkdownTarget` | Distinct target classes | [[requirements/embed-resolution]] |
| `Diagnostic.Severity.Embed` | Broken embeds use LSP warning severity | [[requirements/diagnostics]] |
| `Navigation.Definition.AllLinkTypes` | Definition works for supported link forms | [[requirements/navigation]] |
| `HV-002` | Embed hover includes resolved path and detected file type | [[requirements/hover]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Attachment references support completion, definition, and hover |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-15-attachment-intelligence]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Relevant attachment scenarios in `docs/bdd/features/ofmarkdown-parity.feature` pass.
- [ ] Existing embed resolution scenarios remain green.
- [ ] Existing attachment references produce no missing-reference diagnostic.
- [ ] Missing attachment references produce diagnostics with FG004 warning severity.
- [ ] Attachment indexing does not add parsed OFMDoc entries for non-Markdown files.
- [ ] [[test/matrix]] updated with every new test file introduced.
- [ ] [[test/index]] updated with every new test file introduced.
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`).
- [ ] `tsc --noEmit` exits 0.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-163]] | Index vault attachments | `open` |
| [[TASK-164]] | Complete attachment references | `open` |
| [[TASK-165]] | Diagnose broken attachment references | `open` |
| [[TASK-166]] | Navigate to attachment targets | `open` |
| [[TASK-167]] | Show attachment hover metadata | `open` |
| [[TASK-168]] | Polish attachment configuration | `open` |
| [[CHORE-047]] | Phase 15 Lint Sweep | `open` |
| [[CHORE-048]] | Phase 15 Test Matrix Sweep | `open` |
| [[CHORE-049]] | Phase 15 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[FEAT-021]] — Phase 14 Markdown link intelligence must be available first.

**Unblocks:**

- Phase 16 — file-operation refactors can rely on addressable attachment targets.

---

## Notes

Implementation sequencing is intentional: build the vault attachment index first,
then layer completion, diagnostics, navigation, and hover on top. Configuration
polish comes last so it can adapt to the final index and provider contracts.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to
> complete the spec and create all child `TASK-NNN` tickets before transitioning
> to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `draft`. Phase 15 child tasks and chores defined.
