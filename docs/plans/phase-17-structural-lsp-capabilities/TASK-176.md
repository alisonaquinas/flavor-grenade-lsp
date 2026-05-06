---
id: "TASK-176"
title: "Implement document links"
type: task
status: open
priority: medium
phase: 17
parent: "FEAT-024"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-175"]
tags: [tickets/task, "phase/17"]
aliases: ["TASK-176"]
---

# Implement document links

> [!INFO] `TASK-176` - Task - Phase 17 - Parent: [[FEAT-024]] - Status: `open`

## Description

Implement `textDocument/documentLink` so unambiguous local OFMarkdown and Markdown references become LSP `DocumentLink` values. Ambiguous links must not receive misleading targets; diagnostics and related information remain the source of ambiguity details.

---

## Implementation Notes

- Reuse existing resolver output instead of forking definition logic
- Include wiki-links, embeds, local Markdown links, reference definitions, and attachment references
- Return no target for ambiguous references
- Do not produce links for external URLs, non-file schemes, or vault-escaping paths
- See also: [[design/api-layer]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.Coverage` | Document links must reflect OFMarkdown structure | [[requirements/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Use the same targets as definition where unambiguous | [[requirements/navigation]] |
| `Diagnostic.Ambiguous.RelatedInfo` | Ambiguous links rely on diagnostics/related information | [[requirements/diagnostics]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Local Markdown inline links resolve like wiki-links |
| `docs/bdd/features/ofmarkdown-parity.feature` | Reference-style links resolve through their link definitions |
| `docs/bdd/features/ofmarkdown-parity.feature` | Attachment references support completion, definition, and hover |
| `docs/bdd/features/navigation.feature` | Go-to-definition on `[[doc]]` navigates to target document |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/handlers/document-link-handler.spec.ts` | Unit | `Parity.StructuralLSP.Coverage` | 🔴 failing |
| `tests/integration/document-links/document-links.integration.spec.ts` | Integration | `Navigation.Definition.AllLinkTypes` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| - | N/A |

---

## Parent Feature

[[FEAT-024]] - Structural LSP Capabilities

---

## Dependencies

**Blocked by:**

- [[TASK-175]] - structural capabilities must be registered first

**Unblocks:**

- [[TASK-179]] - structural test suite covers document links after implementation

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Document links are returned for unambiguous local OFM and Markdown references
- [ ] Ambiguous references receive no misleading document-link target
- [ ] External URLs and non-file schemes are ignored
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-024]] child task row updated to `in-review`

---

## Notes

The handler should preserve the same URI discipline used by definition and references responses.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-024]].
