---
id: "FEAT-021"
title: "Markdown Link Intelligence"
type: feature
status: draft
priority: high
phase: 14
created: "2026-05-06"
updated: "2026-05-06"
dependencies: []
tags: [tickets/feature, "phase/14"]
aliases: ["FEAT-021"]
---

# Markdown Link Intelligence

> [!INFO] `FEAT-021` · Feature · Phase 14 · Priority: `high` · Status: `draft`

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
- File and folder move refactors.
- `textDocument/documentLink`, folding ranges, and selection ranges.
- CLI check/export tooling.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Author.UseStandardMarkdownLinks` | Use standard Markdown links with vault-aware behavior | [[requirements/functional/ofmarkdown-parity]] |
| `User.Diagnose.SpotAmbiguousHeadingAnchors` | Catch duplicate heading anchors before navigation is ambiguous | [[requirements/functional/ofmarkdown-parity]] |
| `User.Navigate.JumpToNote` | Jump from a link to its target | [[requirements/user/navigating-notes]] |
| `User.Navigate.FindAllReferences` | See every reference to a note or heading | [[requirements/user/navigating-notes]] |
| `User.Rename.RenameHeadingEverywhere` | Rename a heading and update all heading links | [[requirements/user/renaming-safely]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.LocalResolution` | Local standard Markdown links resolve through vault rules | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.ParseCoverage` | Supported Markdown link forms become typed parser/index data | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.TargetClassification` | Targets are classified before resolution and diagnostics | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.ReferenceGraph` | Markdown links, images, labels, and definitions join RefGraph | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.Completion` | Markdown link URL contexts return document and heading completion candidates | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Same-document Markdown anchors support definition, diagnostics, references, and rename | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.HeadingAmbiguity.Diagnostics` | Duplicate or ambiguous heading anchors produce diagnostics with related locations | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.NavigationAndReferences` | Markdown link and label forms support definition and references | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.RenameAnchors` | Markdown heading anchors update during heading rename | [[requirements/functional/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Definition supports Markdown local links | [[requirements/navigation]] |
| `Navigation.References.Completeness` | References include Markdown local links | [[requirements/navigation]] |
| `Rename.Refactoring.Completeness` | Heading rename updates Markdown heading anchors | [[requirements/rename]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Local Markdown links, reference links, external URL suppression, same-document anchors, missing anchors, and duplicate heading anchors |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-14-markdown-link-intelligence]]
- Execution ledger row: [[plans/execution-ledger]]

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
- [ ] Parser behavior respects [[ofm-spec/markdown-links]] and opaque regions
  from [[ofm-spec/index]].
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-156]] | Parse standard Markdown link syntax | `open` |
| [[TASK-157]] | Classify Markdown link targets | `open` |
| [[TASK-180]] | Complete Markdown link URL targets | `open` |
| [[TASK-158]] | Index Markdown link references in RefGraph | `open` |
| [[TASK-159]] | Resolve Markdown links through Oracle | `open` |
| [[TASK-160]] | Diagnose Markdown heading anchors | `open` |
| [[TASK-161]] | Navigate Markdown links and labels | `open` |
| [[TASK-162]] | Rename Markdown heading anchors | `open` |
| [[CHORE-044]] | Phase 14 Lint Sweep | `open` |
| [[CHORE-045]] | Phase 14 Test Matrix Sweep | `open` |
| [[CHORE-046]] | Phase 14 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- Phase 13 (see [[plans/execution-ledger]]) - CI and delivery gate must be
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
[[templates/tickets/lifecycle/feature-lifecycle]]

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
> See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type
> conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `draft`. Child tasks and chores defined for Phase 14.
