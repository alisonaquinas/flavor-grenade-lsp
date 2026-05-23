---
title: Markdown Flavor Gap Analysis
tags:
  - gaps
  - markdown-flavor
  - requirements
  - tests
aliases:
  - Markdown Flavor Server Gap Analysis
  - Markdown Flavor Requirements Gap Register
---

# Markdown Flavor Gap Analysis

Date: 2026-05-13

Scope: repository-level requirements, server code, BDD coverage, and test
specifications for Markdown flavor support. Extension-specific application gaps
are detailed in
`extension/docs/gaps/markdown-flavor-gap-analysis.md`.

## Executive Summary

The current requirements define Markdown flavor as product state, not VS Code
language mode. Required behavior includes a selector, `auto` detection,
project/user override persistence, server propagation, and source-backed
dialect profiles for every researched flavor.

The current server implementation is still an Obsidian Flavored Markdown parser
and vault intelligence server. It has strong OFM parsing and vault behavior, but
it does not yet have a Markdown flavor model. Every document is parsed through
the same OFM parser pipeline, no server data structure records effective
flavor, and no LSP configuration path accepts `flavorGrenade.markdownFlavor`.

Net state:

| Area | Current state | Gap severity |
|---|---|---|
| Requirements docs | Updated to Markdown flavor selector model | None for current pass |
| Research corpus | Present for required flavors | Low |
| Server flavor enum/profile registry | Missing | High |
| Parser/diagnostics flavor awareness | Missing | High |
| Server configuration propagation | Missing | High |
| BDD step implementation | Stale `ofmarkdown` assumptions remain | High |
| Unit/integration/e2e flavor tests | Specified but not implemented | High |
| Verification gates | General gates exist, flavor-specific file coverage does not | Medium |

## Requirement Baseline

Primary current requirements:

- `docs/adr/ADR020-markdown-flavor-selection.md`
- `docs/requirements/functional/ofmarkdown-language-mode.md`
- `docs/requirements/user/vscode-language-mode.md`
- `docs/features/ofmarkdown-language-mode.md`
- `docs/features/vscode-extension-parity.md`

Required flavor ids:

| Kind | IDs |
|---|---|
| Detection state | `auto` |
| Explicit flavors | `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, `stack-overflow` |

Required server-facing outcomes:

- accept only required flavor ids;
- derive `auto` to an effective explicit flavor;
- propagate effective flavor to analysis;
- keep dialect profiles traced to research;
- make diagnostics, completion, navigation, and semantic tokens able to become
  flavor-aware;
- reject unsupported flavor ids without corrupting active state.

## Current Server Evidence

| Evidence | Current behavior |
|---|---|
| `src/parser/ofm-parser.ts` | `parse(uri, text, version)` has no flavor parameter and always runs the OFM token parsers. |
| `src/parser/types.ts` | `OFMDoc` and `OFMIndex` have no `flavor`, `profile`, or dialect metadata. |
| `src/lsp/handlers/did-open.handler.ts` | Opens a document and calls `ofmParser.parse(uri, text, version)` directly. |
| `src/lsp/handlers/did-change.handler.ts` | Re-parses changed documents through the same flavorless parser path. |
| `src/vault/document-membership.ts` | Returns `isOfMarkdown`, not effective Markdown flavor. |
| `src/vault/vault.module.ts` | Registers `flavorGrenade/documentMembership`; no flavor-state endpoint is present. |
| `src/test/bdd/step-definitions/extension-harness.steps.ts` | Still simulates vault/indexed documents by assigning `ofmarkdown`. |

Reusable current assets:

- vault marker detection already distinguishes `.obsidian/`,
  `.flavor-grenade.toml`, and single-file contexts;
- `DocumentMembershipService` can become an input to `auto` detection;
- existing OFM token parsers can back the `obsidian` dialect profile;
- CommonMark-compatible Markdown link handling already exists for standard
  Markdown links, headings, and reference definitions;
- CI already runs root tests, BDD, extension tests, docs lint, build, and
  typecheck.

## Gap Register

| Gap ID | Requirement/test source | Current state | Required state | Severity |
|---|---|---|---|---|
| GAP-S-001 | `Extension.MarkdownFlavor.RequiredCoverage`; `MF-U-001` | No shared flavor enum or selector/server flavor list exists in `src/`. | A canonical flavor id list must include `auto` plus every explicit researched flavor. | High |
| GAP-S-002 | `Extension.MarkdownFlavor.DialectProfiles`; `MF-U-001` to `MF-U-005` | No dialect profile registry exists. | Each explicit flavor needs a source-backed profile with core syntax, extensions, host-specific behavior, and unsupported constructs. | High |
| GAP-S-003 | `Extension.MarkdownFlavor.ServerPropagation`; `MF-U-006`, `MF-I-001` | Server has no `flavorGrenade.markdownFlavor` state and no config handler for it. | Server accepts supported flavor ids, rejects unsupported ids, and exposes effective flavor to analysis. | High |
| GAP-S-004 | `Extension.MarkdownFlavor.Refresh`; `MF-U-007`, `MF-I-002` | Open document refresh is tied to normal didOpen/didChange parsing and vault rescans, not flavor changes. | Flavor changes must mark affected open documents for diagnostics and feature refresh. | High |
| GAP-S-005 | `Extension.MarkdownFlavor.AutoDetection` | `DocumentMembershipService` returns `isOfMarkdown` only. | Auto detection should derive `obsidian`, project-config flavor, or `commonmark` depending on context. | High |
| GAP-S-006 | `Extension.MarkdownLanguage.PreserveDefault` | Server-facing BDD harness still treats vault membership as `ofmarkdown` assignment. | Acceptance state should keep `languageId = markdown` while tracking effective flavor separately. | High |
| GAP-S-007 | `Extension.MarkdownFlavor.DialectProfiles`; `MF-I-001`, `MF-I-002` | Parser always extracts wiki links, embeds, block anchors, tags, and callouts. | Parser/diagnostics must be able to distinguish Obsidian-only constructs from CommonMark/Original behavior. | High |
| GAP-S-008 | `MF-I-003`, `MF-I-004` | No integration test file `src/test/integration/markdown-flavor.test.ts`. | Spawned-server tests must iterate supported ids and reject unsupported ids. | High |
| GAP-S-009 | `MF-E-001`, `MF-E-002` | Feature files exist, but step definitions are not updated for selector/flavor-profile scenarios. | BDD scenarios must execute against flavor state, not pass through stale placeholders. | High |
| GAP-S-010 | `MF-VF-001`, `MF-VF-002` | CI runs broad gates, but no flavor test files exist to be included. | CI should fail if flavor unit, integration, BDD, and extension host coverage disappears. | Medium |
| GAP-S-011 | `MF-VA-001` to `MF-VA-004` | Research docs exist and are referenced, but there is no executable validation tying profiles to research sources. | Validation must trace displayed/profiled flavors back to research or explicit exclusions. | Medium |

## Test Specification Gap

| Test level | Spec file | Current implementation gap |
|---|---|---|
| Unit | `docs/test/markdown-flavor-unit-spec.md` | `src/parser/__tests__/markdown-flavor-profiles.test.ts` and `src/lsp/handlers/__tests__/configuration.handler.test.ts` do not exist. |
| Integration | `docs/test/markdown-flavor-integration-spec.md` | `src/test/integration/markdown-flavor.test.ts` does not exist. |
| E2E | `docs/test/markdown-flavor-e2e-spec.md` | BDD feature files exist, but the extension harness still uses old `ofmarkdown` state and lacks flavor selector/profile steps. |
| Verification | `docs/test/markdown-flavor-verification-spec.md` | General CI checks exist; flavor-specific file and scenario presence is not enforced yet. |
| Validation | `docs/test/markdown-flavor-validation-spec.md` | No product review artifact or executable check validates research-to-profile coverage. |

## Required Server Work

1. Add a server-side Markdown flavor model:
   - flavor id type;
   - required flavor list;
   - label/source metadata;
   - explicit profile registry;
   - `auto` excluded from profile registry.
2. Add configuration handling:
   - read `flavorGrenade.markdownFlavor`;
   - validate allowed ids;
   - preserve previous state on invalid input;
   - refresh open documents when effective flavor changes.
3. Add effective flavor resolution:
   - `.obsidian/` -> `obsidian`;
   - `.flavor-grenade.toml` or workspace setting -> configured flavor;
   - generic/single-file Markdown -> `commonmark`;
   - explicit override wins over detection.
4. Thread flavor through parsing and analysis:
   - store effective flavor on parsed document or analysis context;
   - let diagnostics/completions/navigation read profile capabilities;
   - initially gate Obsidian-only syntax for `original` and `commonmark`.
5. Rewrite BDD step state:
   - separate `languageId` from `effectiveFlavor`;
   - stop treating vault membership as `ofmarkdown`;
   - implement profile-source and signature behavior assertions.
6. Implement the missing test files from the unit, integration, e2e,
   verification, and validation specs.

## Non-Gaps And Partial Coverage

| Area | Evidence | Why it helps |
|---|---|---|
| Vault detection | `src/vault/vault-detector.ts`, `src/vault/document-membership.ts` | Can feed `auto` detection with positive vault/config signals. |
| OFM parser | `src/parser/ofm-parser.ts` and parser tests | Can become the `obsidian` profile implementation baseline. |
| Standard Markdown links | `src/parser/markdown-link-parser.ts` and navigation tests | Useful for CommonMark/Original-compatible behavior. |
| CI skeleton | `.github/workflows/ci.yml`, `src/test/ci-workflow.test.ts` | Broad verification gates already exist. |
| Research corpus | `docs/research/*.md` | Sources are available for the profile registry and validation checks. |

## Acceptance Closure Checklist

The gap is closed only when all of these are true:

- no production path changes a `.md` file to `ofmarkdown`;
- every required flavor id is present in selector, setting schema, and server
  validation;
- every explicit flavor has a source-backed profile;
- server analysis can observe effective flavor for open documents;
- `original` and `commonmark` do not enable Obsidian-only constructs as core
  syntax;
- BDD scenarios in `ofmarkdown-language-mode.feature` and
  `markdown-flavor-dialects.feature` execute without stale step simulations;
- root unit, integration, e2e, verification, and validation specs have matching
  implemented evidence.
