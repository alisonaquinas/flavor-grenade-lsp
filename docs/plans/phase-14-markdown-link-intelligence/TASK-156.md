---
id: "TASK-156"
title: "Parse standard Markdown link syntax"
type: task
status: done
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: []
tags: [tickets/task, "phase/14"]
aliases: ["TASK-156"]
---

# Parse standard Markdown link syntax

> [!INFO] `TASK-156` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `done`

## Description

Extend the OFM parser and index model so standard Markdown inline links, image
links, reference link uses, collapsed references, shortcut references, and link
definitions are represented as parsed document symbols. The parser must preserve
existing precedence for opaque regions, embeds, and wiki-links.

---

## Implementation Notes

- Implement parser coverage for `[text](target)`, `![alt](target)`,
  `[text][label]`, `[label][]`, `[label]`, and `[label]: target "title"`.
- Add `MarkdownLinkRef`, `MarkdownImageRef`, `LinkLabelRef`, and
  `LinkLabelDef` ranges needed by later RefGraph, navigation, diagnostics,
  completion, attachment, and rename work.
- Match reference labels case-insensitively while keeping definitions
  document-local.
- Respect [[ofm-spec/markdown-links]] rule codes `OFM-MDLINK-001` through
  `OFM-MDLINK-005`.

## Implementation Details

- Create `src/parser/markdown-link-parser.ts` with a static
  `MarkdownLinkParser.parse(text, opaqueRegions)` API matching existing parser
  classes.
- Extend `src/parser/types.ts` with `MarkdownLinkRef`,
  `MarkdownImageRef`, `LinkLabelRef`, and `LinkLabelDef` entry types. Each type
  must include full token `range` plus target/text/label ranges needed by
  downstream navigation and rename.
- Extend `OFMIndex` with `markdownLinks`, `markdownImages`, `linkLabelRefs`,
  and `linkLabelDefs` arrays.
- Wire `MarkdownLinkParser` into `src/parser/ofm-parser.ts` after opaque region
  marking and alongside the existing token parser stage.
- Add RED tests in `src/parser/__tests__/markdown-link-parser.test.ts`; extend
  `src/parser/__tests__/ofm-parser.integration.test.ts` only after the parser
  model exists.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.ParseCoverage` | Parser emits typed symbols and ranges for all supported Markdown link forms | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.LocalResolution` | Parse local inline links, reference links, link definitions, and image links | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Parse same-document fragment links for later anchor behavior | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Local Markdown inline links resolve like wiki-links` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Reference-style links resolve through their link definitions` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors behave like heading references` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/markdown-links.test.ts` | Unit | `Parity.MarkdownLinks.LocalResolution` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Markdown link syntax becomes a first-class OFM reference source |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-157]] - target classification needs parsed target ranges.
- [[TASK-158]] - RefGraph indexing needs parsed Markdown link and label nodes.
- [[TASK-180]] - completion needs Markdown link URL target ranges.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Parser tests cover every in-scope Markdown link form.
- [ ] Tokens inside code, math, comments, templater regions, embeds, and
  wiki-links are skipped.
- [ ] Parsed ranges identify link text, target, label use, and definition target.
- [ ] Markdown image links produce `MarkdownImageRef` parser data for local
  image and attachment targets.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenarios pass or are ready for downstream resolver work.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

This is the first implementation task for the phase. Do not add diagnostics,
navigation, or rename behavior here except as needed to expose parser data.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order.
> Do not edit previous entries. Update the `status` frontmatter field to match
> the current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-021]].

> [!INFO] Detailed - 2026-05-06
> Step C implementation details added. Parser write scope is
> `src/parser/types.ts`, `src/parser/markdown-link-parser.ts`,
> `src/parser/ofm-parser.ts`, and parser tests. Status: `open`.

> [!WARNING] Red - 2026-05-06
> RED tests added for Markdown link parser coverage before implementation.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Implemented Markdown link parser entries, OFMIndex wiring, parser unit tests,
> and OFM parser integration coverage. `bun test
> src/parser/__tests__/markdown-link-parser.test.ts
> src/parser/__tests__/ofm-parser.integration.test.ts`, `bun run typecheck`,
> and `bun run lint -- --max-warnings 0` pass. Status: `green`.

> [!SUCCESS] Review Ready - 2026-05-06
> Local phase gates pass after implementation and sweep fixes. Status: `in-review`.

> [!SUCCESS] Done - 2026-05-06
> PR #30 passed CI and the Phase 14 gate is ready to merge. Status: `done`.
