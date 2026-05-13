---
id: "TASK-313"
title: "Retire obsolete language-mode host tests"
type: task
status: open
priority: high
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-310"]
tags: [tickets/task, "phase/E17", vscode, tests]
aliases: ["TASK-313"]
---

# Retire Obsolete Language-Mode Host Tests

## Description

Remove or rewrite host tests that still assert OFMarkdown language-mode
promotion.

## Work Scope

- Before rewriting or removing completed `ofmarkdown` host tests, preserve
  archival/supersession evidence by recording the old test file path, last
  passing command or commit/CI run if available, and the replacement Markdown
  flavor test/spec that supersedes each assertion in the E17 evidence log.
- Replace `activation-language-mode.test.js` expectations with flavor selector
  behavior or move remaining startup checks elsewhere.
- Run a current-test stale `ofmarkdown` expectation scan across host tests,
  host fixtures, package activation waits, and host evidence files. Historical
  filenames may remain only when classified as historical containers.
- Write scan results to
  `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md` for
  `EXT-MF-VA-006`, or link the evidence file from [[TASK-312]] if validation
  ownership remains there.
- Keep manual non-Markdown preservation coverage.
- Ensure host runner has no stale `ofmarkdown` promotion waits.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-E-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/src/test/suite/activation-language-mode.test.js` | Retired or rewritten without promotion expectations. |
| `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md` | EXT-MF-VA-006 and EXT-MF-VF-009 stale expectation evidence. |

## Definition of Done

- [ ] No host test waits for `document.languageId === "ofmarkdown"`.
- [ ] Stale host-scan results classify every remaining current `ofmarkdown`
      expectation as removed, rewritten, historical, or follow-up bug.
- [ ] `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md`
      is created or linked from the E17 validation evidence.
- [ ] Completed `ofmarkdown` host-test assertions have archival/supersession
      evidence before rewrite or removal.
- [ ] Remaining activation coverage still passes.
- [ ] Manual language preservation remains tested.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
