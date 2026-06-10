---
id: "TASK-312"
title: "Add extension validation evidence for selector behavior"
type: task
status: open
priority: medium
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-310"]
tags: [tickets/task, "phase/E17", validation, markdown-flavor]
aliases: ["TASK-312"]
---

# Add Extension Validation Evidence For Selector Behavior

## Description

Record validation evidence that users can see and change Markdown flavor without
using VS Code's language picker.

## Work Scope

- Add smoke record or screenshot reference for selector behavior at
  `extension/docs/tests/evidence/markdown-flavor-selector-smoke.md`.
- Record `.mdfattributes` scope evidence at
  `extension/docs/tests/evidence/markdown-flavor-mdfattributes-scope.md`.
- Record host log evidence at
  `extension/docs/tests/evidence/markdown-flavor-host-log.md` showing no `.md`
  document changes to `ofmarkdown`.
- Record research-backed flavor review at
  `extension/docs/tests/evidence/markdown-flavor-research-review.md`.
- Record package-target validation evidence at
  `extension/docs/tests/evidence/markdown-flavor-package-targets.md`, proving
  `npm run verify:package-targets` covered flavor-era VSIX output.
- Record stale `ofmarkdown` scan evidence at
  `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md`, or
  link to [[TASK-313]] as the artifact owner when the scan is produced there.
- Split validation evidence so extension work proves selector/`.mdfattributes`/profile
  compatibility while server dialect phases prove parser/profile semantics.
- Redact local usernames, absolute home paths, vault text,
  `.mdfignore`/`.mdfattributes` contents, environment variables, API-like tokens,
  and raw server output before evidence files are committed.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.Selector` | `GAP-E-014` |
| `Extension.MarkdownFlavor.OverridePersistence` | `GAP-E-014` |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | `GAP-E-014` |
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-E-014` |
| `Extension.Packaging.TargetBinaryValidation` | `AUD-E-006`, `AUD-ET-008`, `AUD-X-008` |
| `Extension.MarkdownFlavor.DialectProfiles` | `AUD-E-002`, `AUD-ET-010` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/docs/tests/markdown-flavor-validation-spec.md` | EXT-MF-VA-001 through EXT-MF-VA-006, where EXT-MF-VA-005 is package-target/VSIX evidence and EXT-MF-VA-006 is stale `ofmarkdown` scan evidence. |

## Definition of Done

- [ ] Validation evidence exists.
- [ ] Evidence is linked from extension docs.
- [ ] Manual-language and `.mdfattributes` scope evidence are included.
- [ ] Package-target evidence is included at
      `extension/docs/tests/evidence/markdown-flavor-package-targets.md`.
- [ ] Stale `ofmarkdown` scan evidence is included at
      `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md`
      or linked through [[TASK-313]].
- [ ] Research/profile evidence states the extension verifies contract
      compatibility only; server phases own dialect semantic proof.
- [ ] Evidence files use the artifact paths required by
      `extension/docs/tests/markdown-flavor-validation-spec.md`.
- [ ] Evidence files satisfy the redaction rules in
      `extension/docs/tests/markdown-flavor-validation-spec.md`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
