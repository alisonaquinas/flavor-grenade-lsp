---
id: "FEAT-021"
title: "Markdown Link Intelligence"
type: feature
status: done
priority: high
phase: 14
created: "2026-05-06"
updated: "2026-05-06"
dependencies: []
tags: [tickets/feature, "phase/14"]
aliases: ["FEAT-021"]
---

# Markdown Link Intelligence

> [!INFO] `FEAT-021` · Feature · Phase 14 · Priority: `high` · Status: `done`

## Goal

Vault authors can use local standard Markdown links alongside wiki-links and
embeds. Inline links, reference-style links, link definitions, image links, and
same-document anchors resolve, diagnose, navigate, reference, and rename through
the same vault-aware rules without producing noise for external URLs.

---

## Scope

**In scope:**

- Parse inline Markdown links, image links, reference link uses, collapsed and
  shortcut references, and reference definitions.
- Classify local file targets, file-plus-fragment targets, same-document
  fragments, external URLs, and unknown schemes.
- Add Markdown link, Markdown image, and label symbols to the reference graph.
- Resolve Markdown local links to documents and headings through vault rules.
- Diagnose missing and ambiguous Markdown heading anchors.
- Include Markdown local links in definition, references, and heading rename.
- Extend completion coverage for Markdown link URL contexts.

**Out of scope (explicitly excluded):**

- Attachment metadata and image hover support beyond local target recognition.
- Markdown image definition, diagnostics, hover, and attachment completion beyond
  image reference indexing; these belong to [[docs/plans/phase-15-attachment-intelligence]].
- File and folder move refactors.
- `textDocument/documentLink`, folding ranges, and selection ranges.
- CLI check/export tooling.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Author.UseStandardMarkdownLinks` | Use standard Markdown links with vault-aware behavior | [[docs/requirements/functional/ofmarkdown-parity]] |
| `User.Diagnose.SpotAmbiguousHeadingAnchors` | Catch duplicate heading anchors before navigation is ambiguous | [[docs/requirements/functional/ofmarkdown-parity]] |
| `User.Navigate.JumpToNote` | Jump from a link to its target | [[docs/requirements/user/navigating-notes]] |
| `User.Navigate.FindAllReferences` | See every reference to a note or heading | [[docs/requirements/user/navigating-notes]] |
| `User.Rename.RenameHeadingEverywhere` | Rename a heading and update all heading links | [[docs/requirements/user/renaming-safely]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.LocalResolution` | Local standard Markdown links resolve through vault rules | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.ParseCoverage` | Supported Markdown link forms become typed parser/index data | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.TargetClassification` | Targets are classified before resolution and diagnostics | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.ReferenceGraph` | Markdown links, images, labels, and definitions join RefGraph | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.Completion` | Markdown link URL contexts return document and heading completion candidates | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Same-document Markdown anchors support definition, diagnostics, references, and rename | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.HeadingAmbiguity.Diagnostics` | Duplicate or ambiguous heading anchors produce diagnostics with related locations | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.NavigationAndReferences` | Markdown link and label forms support definition and references | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.RenameAnchors` | Markdown heading anchors update during heading rename | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Definition supports Markdown local links | [[docs/requirements/functional/navigation]] |
| `Navigation.References.Completeness` | References include Markdown local links | [[docs/requirements/functional/navigation]] |
| `Rename.Refactoring.Completeness` | Heading rename updates Markdown heading anchors | [[docs/requirements/functional/rename]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Local Markdown links, reference links, external URL suppression, same-document anchors, missing anchors, and duplicate heading anchors |

---

## Phase Plan Reference

- Phase plan: [[docs/plans/phase-14-markdown-link-intelligence]]
- Execution ledger row: [[docs/plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `Local Markdown inline links resolve like wiki-links` passes.
- [ ] `Reference-style links resolve through their link definitions` passes.
- [ ] `External Markdown links do not produce vault diagnostics` passes.
- [ ] `Same-document Markdown anchors behave like heading references` passes.
- [ ] `Same-document Markdown anchors diagnose missing headings` passes.
- [ ] `Duplicate heading anchors produce related information` passes.
- [ ] Markdown link URL contexts return document and heading completion
  candidates without regressing existing completion triggers.
- [ ] Existing wiki-link, embed, block-reference, tag, completion, diagnostics,
  navigation, and rename scenarios remain green.
- [ ] External URLs never produce FG001 or vault broken-link diagnostics.
- [ ] Parser behavior respects [[docs/ofm-spec/markdown-links]] and opaque regions
  from [[docs/ofm-spec/index]].
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-156]] | Parse standard Markdown link syntax | `done` |
| [[TASK-157]] | Classify Markdown link targets | `done` |
| [[TASK-180]] | Complete Markdown link URL targets | `done` |
| [[TASK-158]] | Index Markdown link references in RefGraph | `done` |
| [[TASK-159]] | Resolve Markdown links through Oracle | `done` |
| [[TASK-160]] | Diagnose Markdown heading anchors | `done` |
| [[TASK-161]] | Navigate Markdown links and labels | `done` |
| [[TASK-162]] | Rename Markdown heading anchors | `done` |
| [[CHORE-044]] | Phase 14 Lint Sweep | `done` |
| [[BUG-002]] | Markdown index fields crash legacy OFMDoc fixtures | `done` |
| [[BUG-003]] | Markdown path targets can escape above vault root | `done` |
| [[BUG-004]] | Malformed Markdown anchor escapes can crash heading resolution | `done` |
| [[BUG-005]] | Markdown completions lose folder context for nested documents | `done` |
| [[BUG-006]] | BDD smoke indexes files outside configured extension list | `done` |
| [[BUG-007]] | BDD smoke includes undefined extension-host scenario | `done` |
| [[BUG-008]] | BDD smoke includes pending scenarios | `done` |
| [[BUG-009]] | Documented BDD smoke command does not reproduce on PowerShell | `done` |
| [[BUG-010]] | Standalone Markdown link definitions are missing from RefGraph document refs | `done` |
| [[CHORE-056]] | Phase 14 Code Quality Sweep | `done` |
| [[CHORE-058]] | Document and split Phase 14 parser surfaces | `done` |
| [[CHORE-057]] | Phase 14 Security Sweep | `done` |
| [[CHORE-059]] | Reconcile final Phase 14 review trace | `done` |
| [[CHORE-045]] | Phase 14 Test Matrix Sweep | `done` |
| [[CHORE-046]] | Phase 14 Documentation Trace Sweep | `done` |

---

## Dependencies

**Blocked by:**

- Phase 13 (see [[docs/plans/execution-ledger]]) - CI and delivery gate must be
  available before Phase 14 is validated.

**Unblocks:**

- Later OFMarkdown parity phases for attachments, file operations, and
  structural LSP coverage.

---

## Notes

Primary design constraint: [[ADR017-standard-markdown-link-intelligence]].
Standard Markdown parsing must run after opaque region marking, embeds, and
wiki-links so existing OFM behavior is unchanged.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[docs/templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to
> complete the spec and create all child `TASK-NNN` tickets before transitioning
> to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order.
> Do not edit previous entries. Update the `status` frontmatter field to match
> the current state whenever adding an entry. See
> See [[docs/templates/tickets/lifecycle/feature-lifecycle]] for callout-type
> conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `draft`. Child tasks and chores defined for Phase 14.

> [!INFO] Started - 2026-05-06
> Steps A-C began. Phase prerequisites are complete in [[docs/plans/execution-ledger]];
> child task scope is present, implementation surfaces were audited, and linked
> test paths were normalized to the repository `.test.ts` convention. Status:
> `in-progress`.

> [!SUCCESS] Review Ready - 2026-05-06
> Phase 14 implementation and sweeps are locally green. `bun run build`,
> `bun run lint -- --max-warnings 0`, `bun run typecheck`, `bun test`,
> `bun run lint:docs`, and `bun --bun node_modules/@cucumber/cucumber/bin/cucumber-js --config cucumber.yaml --tags '@smoke'`
> pass. Status: `in-review`.

> [!NOTE] Final Review - 2026-05-06
> Fresh review findings [[BUG-009]], [[BUG-010]], and [[CHORE-059]] were
> ticketed before fixes. Markdown image links are parser and RefGraph inputs in
> Phase 14; attachment-facing navigation and hover remain Phase 15 scope.

## Retrospective

> Written after Step L passes. Date: 2026-05-06.

### What went as planned

The parser, classifier, RefGraph, Oracle, diagnostics, navigation, rename, and
completion slices followed the planned RED -> GREEN flow. Keeping Markdown link
support additive to the existing OFM index model worked well and avoided a
larger rewrite.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| [[BUG-002]] | Bug | Existing focused OFMDoc fixtures omitted newly-added Markdown index arrays | +1 h |
| [[BUG-003]] | Bug | Markdown path normalization did not reject traversal underflow | +1 h |
| [[BUG-004]] | Bug | Malformed percent escapes could throw during heading anchor normalization | +0.5 h |
| [[BUG-005]] | Bug | Markdown completions used URI stem fallback before vault index lookup | +0.5 h |
| [[BUG-006]] | Bug | Configured document extensions were specified but not implemented, and the BDD assertion stripped all extensions | +1 h |
| [[BUG-007]] | Bug | Server smoke tags included an extension-host scenario with no server-side steps | +0.25 h |
| [[BUG-008]] | Bug | Feature-level smoke tags included intentionally pending observability scenarios | +0.5 h |

### Process observations

The A-M checklist caught useful issues, but Step L exposed that the BDD smoke
tag was not itself maintained as a runnable gate. Future phases should check
`@smoke` tag health before relying on it as validation evidence.

### Carry-forward actions

- [ ] Keep Phase 15 attachment work separate from Markdown document-link
  behavior; Phase 14 deliberately treats local attachments as non-vault for
  document diagnostics.
- [ ] Add planned work for replacing the narrow `.flavor-grenade.toml`
  extension parser with the full configuration domain when configuration phases
  resume.

### Rule / template amendments

- [ ] Consider adding a checklist item that BDD gate tags must contain no
  pending scenarios before a phase begins.

> [!SUCCESS] Done - 2026-05-06
> PR #30 passed CI and the Phase 14 gate is ready to merge. Status: `done`.
