---
id: "CHORE-134"
title: "Phase 31 verification and closeout sweep"
type: chore
status: open
priority: medium
phase: 31
parent: "FEAT-057"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-057"]
tags: [tickets/chore, "phase/31", markdown-flavor, "markdown-extra"]
aliases: ["CHORE-134"]
---

# Phase 31 verification and closeout sweep

## Description

Perform the operational sweep for Markdown Extra language-support phase closure.

## Work Scope

- Review lint, test-command evidence, validation artifacts, and phase closeout notes for markdown-extra.
- Confirm profile registry tests, [[docs/test/index]], [[docs/test/matrix]], and validation evidence were updated for any markdown-extra profile surface changes.
- Confirm the applicability-matrix surface disposition table covers diagnostics, completion, navigation, hover, semantic tokens, rename, and host/conversion boundaries.
- Confirm [[docs/research/markdown-extra-analysis]] remains the source trace for the phase.
- Update the phase index and roadmap status when completion evidence exists.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-011 |
| FlavorLSP.Profile.SignatureCoverage | AUD-X-003 |
| FlavorLSP.Rename.ProfileSafety | AUD-S-002 |
| FlavorLSP.HostBoundary.NonLocalReferences | AUD-S-004 |

## Definition of Done

- [ ] Documentation trace is complete for markdown-extra.
- [ ] Required verification evidence is attached or linked.
- [ ] Test matrix/index and validation evidence reflect every profile surface introduced, changed, deferred, or rejected in this phase.
- [ ] Phase closeout notes identify any deferred work explicitly.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
