---
id: "TASK-354"
title: "Add shared non-local boundary classification"
type: task
status: open
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-290", "TASK-293"]
tags: [tickets/task, "phase/20", markdown-flavor, boundary]
aliases: ["TASK-354"]
---

# Add Shared Non-Local Boundary Classification

## Description

Add a shared server classification path for host-specific, conversion-bound,
renderer-bound, bibliography-bound, MDX/JSX, and execution-bound references so
diagnostics, navigation, hover, semantic tokens, and rename do not treat them as
local vault/file targets.

## Work Scope

- Classify non-local reference shapes before broken-link diagnostics,
  definition/references/document-link resolution, hover metadata, semantic-token
  projection, or rename edits run.
- Cover GitHub/GitLab, Pandoc, MultiMarkdown, MDX, R Markdown, Reddit, and
  Stack Overflow boundary examples from
  [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]].
- Keep the classifier local and deterministic; authenticated or networked
  platform lookup remains deferred unless a later integration ticket adds it.
- The classifier must not perform network access, process execution, dynamic
  module import, or file reads outside the workspace/vault root.
- Expose a shared disposition that per-flavor Phase 22-34 tickets can reuse:
  `local`, `non-local-host`, `conversion-bound`, `renderer-bound`,
  `bibliography-bound`, `execution-bound`, or `unsupported`.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `FlavorLSP.HostBoundary.NonLocalReferences` | `AUD-S-004` |
| `FlavorLSP.Navigation.ProfileResolution` | `AUD-S-003` |
| `FlavorLSP.Hover.ProfileMetadata` | `AUD-X-002` |
| `FlavorLSP.Rename.ProfileSafety` | `AUD-S-002` |
| `Security.Vault.PathConfinement` | `AUD-SEC-004` |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec]] | Boundary fixture rows classify non-local examples without local diagnostics, navigation, or rename edits. |
| [[docs/test/markdown-flavor-integration-spec#MF-I-008 - Host Boundary Integration|MF-I-008]] | Spawned-server analysis preserves boundary disposition after effective flavor refresh. |

## Implementation Notes

- Create `src/markdown-flavor/non-local-boundary-classifier.ts`.
- Export `classifyMarkdownBoundaryReference(flavor, text)` and disposition types.
- Keep classifier string-only and deterministic: no network, process, dynamic import, or filesystem reads.
- Integration coverage will call a debug request to prove classifications survive the spawned server boundary.

## Definition of Done

- [ ] Shared classifier is reusable by diagnostics, navigation, hover, semantic
      tokens, and rename.
- [ ] Host/conversion fixtures never become broken vault diagnostics, local
      definition targets, or speculative rename edits.
- [ ] Host/conversion fixtures perform no network requests, process execution,
      dynamic imports, or out-of-root file reads.
- [ ] Per-flavor tickets can cite the shared classifier instead of duplicating
      classification rules.
- [ ] Spawned-server integration evidence covers at least one boundary example
      after effective-flavor propagation.
- [ ] [[docs/plans/markdown-flavor-lsp-applicability-matrix]],
      [[docs/test/index]], [[docs/test/matrix]], and validation evidence are
      updated when boundary categories change.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.
