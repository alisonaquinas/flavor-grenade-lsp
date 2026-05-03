---
id: "{{TICKET-ID}}"
title: "{{TICKET-TITLE}}"
type: bug
# status: open | triaged | in-progress | blocked | in-review | verified | done | wont-fix | duplicate
status: open
priority: "{{PRIORITY}}"
severity: "{{SEVERITY}}"
phase: "{{PHASE-NUMBER}}"
introduced-in: "{{PHASE-OR-COMMIT-WHERE-BUG-APPEARED}}"
created: "{{DATE}}"
updated: "{{DATE}}"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/bug, "phase/{{PHASE-NUMBER}}"]
aliases: ["{{TICKET-ID}}"]
---

# {{TICKET-TITLE}}

> [!INFO] `{{TICKET-ID}}` · Bug · Phase {{PHASE-NUMBER}} · Severity: `{{SEVERITY}}` · Priority: `{{PRIORITY}}` · Status: `open`

> [!WARNING] Severity levels: `critical` (server crash / data loss) · `high` (incorrect LSP response, broken requirement) · `medium` (degraded behaviour, wrong diagnostic code) · `low` (cosmetic, non-blocking)

---

## Summary

> One sentence: what is broken, for which input, and what the incorrect outcome is.

{{SUMMARY}}

---

## Reproduction Steps

> Deterministic numbered steps that reproduce the bug from a clean state. Include the exact vault content, LSP method call, and cursor position where relevant.

1. {{STEP-1}}

2. {{STEP-2}}

3. {{STEP-3}}

**Minimal reproducing vault content:**

```markdown
{{VAULT-FILE-CONTENT}}
```

**LSP method / trigger:** `{{LSP-METHOD-OR-USER-ACTION}}`

---

## Expected Behaviour

> What the system *should* do according to the linked requirement or BDD scenario.

{{EXPECTED-BEHAVIOUR}}

---

## Actual Behaviour

> What the system *actually* does. Include diagnostic codes, LSP response payloads, or error messages verbatim where available.

{{ACTUAL-BEHAVIOUR}}

---

## Violated Requirement

> The Planguage requirement this defect violates. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| `{{FR-TAG}}` | {{FR-GIST}} | `[[requirements/{{FEATURE-FILE}}]]` |

---

## Linked BDD Scenario

> The Gherkin scenario that *should have* caught this defect, or that needs to be added to prevent regression.

| Feature File | Scenario Title | Gap? |
|---|---|---|
| `[[bdd/features/{{FEATURE-NAME}}]]` | `{{SCENARIO-TITLE}}` | {{YES-SCENARIO-MISSING / NO-SCENARIO-EXISTS-BUT-DID-NOT-CATCH}} |

---

## Linked Test

> The failing unit/integration test that proves the bug, if it exists. If no test exists, one must be written as part of fixing this bug (RED before GREEN).

| Test File | Type | Status |
|---|---|---|
| `tests/{{TYPE}}/{{MODULE}}/{{FILE}}.spec.ts` | {{Unit/Integration/BDD}} | 🔴 failing |

---

## Affected ADRs

> Architecture decisions whose implementation may be the source of the bug.

| ADR | Relevance |
|---|---|
| `[[adr/ADR{{NNN}}-{{SLUG}}]]` | {{HOW-THIS-ADR-RELATES}} |

---

## Dependencies

> Other tickets or phase gates that must resolve before this fix can proceed. Also list tickets that this fix unblocks. Update the `dependencies` frontmatter list to match **Blocked by** entries.

**Blocked by:**

- `[[tickets/{{BLOCKING-TICKET-ID}}]]` — {{REASON}}

**Unblocks:**

- `[[tickets/{{UNBLOCKED-TICKET-ID}}]]` — {{REASON}}

---

## Proposed Fix

> Optional. If the root cause is known, describe the fix approach. Reference the ubiquitous language and module boundaries from [[architecture/overview]].

{{PROPOSED-FIX}}

---

## Regression Guard

> What must be added or updated to prevent this bug from recurring:

- [ ] Failing test added before fix (RED commit in git log)

- [ ] BDD scenario added or updated in `[[bdd/features/{{FEATURE-NAME}}]]`

- [ ] [[test/matrix]] row updated to `✅ passing` after fix

- [ ] [[test/index]] updated if a new test file is added

---

## Notes

{{NOTES}}

---

## Lifecycle

Full state machine, triage rules, regression guard obligations, and terminal states: [[templates/tickets/lifecycle/bug-lifecycle]]

**State path:** `open` → `triaged` → `in-progress` → `in-review` → `verified` → `done`
**Terminal alternatives:** `wont-fix`, `duplicate`
**Lateral states:** `blocked` (from `in-progress`)

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Reported; root cause unknown | Reproduce defect; identify violated requirement |
| `triaged` | Root cause confirmed; not duplicate/wontfix | Fill Violated Requirement + BDD Scenario sections |
| `in-progress` | Fix in progress (RED regression test first) | Commit regression test alone before any fix code |
| `blocked` | Fix cannot proceed | Append `[!WARNING]` with named blocker |
| `in-review` | Fix + regression test done; lint+type pass | Verify Regression Guard; update matrix/index |
| `verified` | CI green; regression test present in suite | Confirm BDD gap closed |
| `done` | Fix merged; regression guard complete | Append `[!CHECK]` with evidence |
| `wont-fix` | Deliberate non-fix with documented rationale | Append `[!CAUTION]` with full reason |
| `duplicate` | Same defect as existing ticket | Link canonical; add `duplicate-of` to frontmatter |

> [!WARNING] `wont-fix` requires a documented rationale in the Workflow Log. A `wont-fix` with no reason is a documentation defect.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/bug-lifecycle]] for callout-type conventions and full transition rules.

<!-- TEMPLATE USAGE: Replace the entry below with a real date when creating the ticket. -->

> [!INFO] Opened — {{DATE}}
> Bug reported. Status: `open`. Severity: `{{SEVERITY}}`. Violated requirement: `` `{{FR-TAG}}` ``.
