---
id: "{{TICKET-ID}}"
title: "{{TICKET-TITLE}}"
type: spike
# status: open | in-progress | blocked | concluded | output-delivered | done | inconclusive | cancelled
status: open
priority: "{{PRIORITY}}"
phase: "{{PHASE-NUMBER}}"
time-box: "{{TIME-BOX-DESCRIPTION}}"
created: "{{DATE}}"
updated: "{{DATE}}"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/spike, "phase/{{PHASE-NUMBER}}"]
aliases: ["{{TICKET-ID}}"]
---

# {{TICKET-TITLE}}

> [!INFO] `{{TICKET-ID}}` · Spike · Phase {{PHASE-NUMBER}} · Time-box: `{{TIME-BOX-DESCRIPTION}}` · Status: `open`

> [!NOTE] A spike is a time-boxed investigation. It produces a **concrete output** (an ADR, a design doc update, or a follow-on task) — not implementation code. If the time-box expires without a conclusion, document what was learned and open a second spike or an ADR capturing the decision under uncertainty.

---

## Question

> The single, precisely-stated question this spike must answer. A spike that cannot be summarised as one question is too broad.

**Q:** {{RESEARCH-QUESTION}}

---

## Hypothesis

> Optional. The agent's prior belief going in. Documenting the hypothesis makes it possible to identify whether the spike confirmed or refuted expectations.

{{HYPOTHESIS}}

---

## Context

> Why this question must be answered before implementation can proceed. Reference the phase plan, requirement, or ADR that raised the uncertainty.

{{CONTEXT}}

- Phase reference: [[plans/phase-{{NN}}-{{PHASE-SLUG}}]]
- Raised by: [[tickets/{{RAISING-TICKET-ID}}]] (or [[adr/ADR{{NNN}}-{{SLUG}}]])

---

## Investigation Scope

> What the agent *should* explore within the time-box. Keep this narrow. If exploring option A takes the full time-box, options B and C can be separate spikes.

**In scope:**

- {{SCOPE-ITEM-1}}
- {{SCOPE-ITEM-2}}

**Out of scope:**

- {{OUT-OF-SCOPE-ITEM-1}}

---

## Related Requirements

> Requirements whose implementation depends on the outcome of this spike. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| `{{FR-TAG}}` | {{FR-GIST}} | [[requirements/{{FEATURE-FILE}}]] |

---

## Related ADRs

> Existing ADRs this spike may supersede, extend, or inform.

| ADR | Relation |
|---|---|
| [[adr/ADR{{NNN}}-{{SLUG}}]] | {{HOW-RELATED}} |

---

## Dependencies

> Other tickets, spikes, or ADR decisions that must exist before this investigation can start or conclude. Also list tickets unblocked by this spike's output. Update the `dependencies` frontmatter list to match **Blocked by** entries.

**Blocked by:**

- [[tickets/{{BLOCKING-TICKET-ID}}]] — {{REASON}}

**Unblocks:**

- [[tickets/{{UNBLOCKED-TICKET-ID}}]] — {{REASON}}

---

## Expected Output

> What artifact the spike *must* produce when complete. Choose exactly one primary output.

- [ ] New ADR: `docs/adr/ADR{{NNN}}-{{SLUG}}.md` — decision recorded and accepted
- [ ] Updated design doc: [[design/{{DESIGN-FILE}}]] — section `{{SECTION}}` rewritten
- [ ] New follow-on task: `TASK-NNN` — {{TASK-DESCRIPTION}}
- [ ] Updated requirement: [[requirements/{{FEATURE-FILE}}]] — {{WHAT-CHANGES}}

---

## Acceptance Criteria

A spike is `done` when:

- [ ] The question above is answered with a documented rationale
- [ ] At least one output artifact listed above is written and committed
- [ ] All options considered are recorded in the **Findings** section (even rejected ones)
- [ ] Any follow-on tasks or ADRs needed are created and linked

---

## Findings

> Populated by the LLM agent when the spike is complete. This section must exist and be non-empty before the ticket can be marked `done`. Do not fill this in at creation time.

> [!NOTE] Agent fills this section in. Leave blank at ticket creation.

---

## Decision / Recommendation

> The agent's conclusion, written as an actionable recommendation. Will become the basis of the output artifact.

> [!NOTE] Agent fills this section in. Leave blank at ticket creation.

---

## Notes

{{NOTES}}

---

## Lifecycle

Full state machine, time-box discipline, and output artifact rules: [[templates/tickets/lifecycle/spike-lifecycle]]

**State path:** `open` → `in-progress` → `concluded` → `output-delivered` → `done`
**Alternate terminal:** `inconclusive` (time-box expired; partial findings documented; follow-on created)
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Question posed; no research started | Read linked requirements + ADRs; confirm question is answerable within time-box |
| `in-progress` | Investigation underway | Take notes in Findings incrementally; track time against time-box |
| `blocked` | Required source or dependency unavailable | Append `[!WARNING]` with named blocker |
| `concluded` | Question answered; findings complete | Fill Findings + Decision sections; identify output artifact type |
| `output-delivered` | Output artifact written and committed | Check Expected Output checkbox; link artifact |
| `done` | Artifact accepted | Append `[!CHECK]` with artifact link |
| `inconclusive` | Time-box expired; no clear answer | Document partial findings; create follow-on spike or ADR-under-uncertainty |
| `cancelled` | Abandoned; question superseded | Append `[!CAUTION]`; note where question should be addressed |

> [!NOTE] `inconclusive` is not failure. A spike that documents partial findings and spawns a follow-on has succeeded at the process level. A spike that expires silently is a documentation defect.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/spike-lifecycle]] for callout-type conventions and full transition rules.

<!-- TEMPLATE USAGE: Replace the entry below with a real date when creating the ticket. -->

> [!INFO] Opened — {{DATE}}
> Spike created. Status: `open`. Time-box: `{{TIME-BOX-DESCRIPTION}}`. Question: {{RESEARCH-QUESTION}}
