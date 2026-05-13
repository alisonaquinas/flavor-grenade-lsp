---
id: "TASK-284"
title: "Add source-backed dialect profile registry"
type: task
status: in-review
priority: high
phase: 19
parent: "FEAT-042"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-283"]
tags: [tickets/task, "phase/19", markdown-flavor]
aliases: ["TASK-284"]
---

# Add Source-Backed Dialect Profile Registry

## Description

Create a shared registry for explicit Markdown flavor profiles with source
traces and structured syntax capability sections.

## Work Scope

- Define profile fields for core syntax, extension syntax, host behavior,
  unsupported constructs, labels/order, and research source.
- Define the minimum profile schema for active, inert, host-specific,
  opaque-region, diagnostic, completion, navigation, hover, semantic-token,
  folding, document-symbol, and rename surfaces.
- Define security fields for parser resource limits, ReDoS review status,
  no-network/no-execution boundary class, TOML/config interaction where
  relevant, and rename confinement disposition.
- Allow `planned` surface values only when they link the owning Phase 22-34
  implementation ticket.
- Add a profile for every explicit flavor id.
- Keep profile data deterministic and testable.
- Expose profile capability flags so BC2 parse context can gate dialect
  projections without owning labels or UI metadata.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-002` |
| `FlavorLSP.Profile.SignatureCoverage` | `AUD-S-005` |
| `Security.Parser.FlavorProfileResourceSafety` | `AUD-SEC-001` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | ✅ Passing coverage for explicit profile registry shape, source traces, LSP surfaces, parser capabilities, and security metadata. |

## Implementation Notes

- Create `src/markdown-flavor/markdown-flavor-profiles.ts`.
- Export `MARKDOWN_FLAVOR_PROFILES`, `getMarkdownFlavorProfile(id: MarkdownFlavorId)`, and profile schema types for syntax, LSP surfaces, source traces, and security metadata.
- Minimum profile schema must include `activeSyntax`, `inertSyntax`, `hostSpecificSyntax`, `opaqueRegions`, `surfaces.diagnostics`, `surfaces.completion`, `surfaces.navigation`, `surfaces.hover`, `surfaces.semanticTokens`, `surfaces.folding`, `surfaces.documentSymbols`, `surfaces.rename`, `sources`, `security`, and `parserCapabilities`.
- Surface status `planned` must include the owning Phase 22-34 ticket id.
- Security metadata must record parser size budget, ReDoS review disposition, no-network/no-execution boundaries, config/TOML interaction, and rename confinement.
- RED assertions live in `src/parser/__tests__/markdown-flavor-profiles.test.ts`.

## Definition of Done

- [x] All explicit flavors have profile entries.
- [x] Every profile has a research source or `ofm-spec` source.
- [x] Every profile includes the minimum server surface schema, including
      rename and host/conversion boundary disposition.
- [x] Every profile includes security metadata for parser resource safety,
      no-network/no-execution boundaries, and rename confinement.
- [x] `planned` surface values link to the later phase ticket that must replace
      them with implemented/deferred/not-applicable evidence.
- [x] Registry excludes `auto`.
- [x] Parser code can consume capability flags without becoming owner of profile labels/order.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing assertions added before `src/markdown-flavor/markdown-flavor-profiles.ts` exists.

> [!NOTE] GREEN - 2026-05-13
> Implemented the explicit profile registry in `src/markdown-flavor/markdown-flavor-profiles.ts`; focused profile test passes.

> [!INFO] In Review - 2026-05-13
> Lint, typecheck, unit, integration, BDD, docs lint, format, and build gates passed locally; awaiting PR CI.
