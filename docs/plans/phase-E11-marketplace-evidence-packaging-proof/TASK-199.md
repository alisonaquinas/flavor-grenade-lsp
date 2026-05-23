---
id: "TASK-199"
title: "Add diagnostics, hover, tag, and callout visuals"
type: task
status: done
priority: high
phase: E11
parent: "FEAT-029"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-197"]
tags: [tickets/task, "phase/E11"]
aliases: ["TASK-199"]
---

# Add diagnostics, hover, tag, and callout visuals

> [!INFO] `TASK-199` - Task - Phase E11 - Parent: [[FEAT-029]] - Status: `done`

## Description

Add Marketplace README visuals for embed diagnostics and hover, tag completion
or tag references, and callout completion so the listing proves the OFMarkdown
editing surface beyond basic links.

---

## Implementation Notes

- Prefer one compact visual per required category unless a combined image is
  clearer.
- Verify every image remains readable at Marketplace README widths.
- See also: [[docs/features/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Marketplace.OFMProof` | README shows required OFMarkdown diagnostics, hover, tag, and callout visuals | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | `Marketplace README includes OFMarkdown proof` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/test/marketplace/readme-assets.test.ts` | Extension | `Extension.Marketplace.OFMProof` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]] | Client UX should expose server-provided OFMarkdown affordances through VS Code |

---

## Parent Feature

[[FEAT-029]] - Marketplace Evidence And Packaging Proof

---

## Dependencies

**Blocked by:**

- [[TASK-197]] - README visual section should exist before adding more images

**Unblocks:**

- [[TASK-200]] - Package verification needs all README asset references

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Embed diagnostics and hover visual is referenced from `extension/README.md`
- [x] Tag completion or tag reference visual is referenced
- [x] Callout completion visual is referenced
- [x] Linked verification test covers these required categories
- [x] `cd extension && npm test` passes
- [x] [[docs/test/matrix]] row updated for `Extension.Marketplace.OFMProof`
- [x] [[docs/test/index]] updated if a new test file is added
- [x] Parent feature [[FEAT-029]] child task row updated to `done`

---

## Notes

The E11 plan explicitly calls out embed diagnostics, hover, tags, and callouts.
Do not let a generic Markdown screenshot satisfy these OFMarkdown categories.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements and BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint, type, and test clean; awaiting CI | Verify Definition of Done |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING]
> `red` before `green` is non-negotiable. See [[docs/requirements/technical/code-quality]]
> `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-029]].

> [!WARNING] Red - 2026-05-07
> Extended Marketplace README asset coverage for embed diagnostics and hover,
> tag completion/references, and callout completion visuals.

> [!SUCCESS] Green - 2026-05-07
> Added README Marketplace visuals for embed diagnostics/hover, tag
> completion/references, and callout completion.

> [!SUCCESS] In Review - 2026-05-07
> Definition of Done is satisfied locally; awaiting PR CI and review.

> [!SUCCESS] Done - 2026-05-07
> PR #43 CI is green and the parent feature row is updated to `done`.
