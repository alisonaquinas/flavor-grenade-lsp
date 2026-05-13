---
title: "Phase 24: Obsidian Flavor Language Support"
phase: 24
status: planned
tags: [plans, markdown-flavor, obsidian, language-support]
aliases: [Phase 24, Obsidian Flavor Support]
updated: 2026-05-13
---

# Phase 24: Obsidian Flavor Language Support

| Field | Value |
|---|---|
| Phase | 24 |
| Title | Obsidian Flavor Language Support |
| Status | planned |
| Gate | Existing OFM behavior is represented as the `obsidian` flavor without language-mode promotion |
| Depends on | Phase 23, Phase E15 |

## Objective

Reframe existing Obsidian Flavored Markdown intelligence as actual support for
the `obsidian` flavor under the new selector model.

## Scope

Preserve wiki links, embeds, block anchors, tags, callouts, frontmatter, math,
comments, Templater opaque regions, vault-local resolution, completions,
diagnostics, navigation, rename, semantic tokens, document links, folding, and
selection ranges.

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/ofm-spec/index]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.LocalResolution]] | Preserve vault-aware wiki and Markdown link resolution in Obsidian flavor |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.MarkdownLinks.SameDocumentAnchor]] | Preserve same-document heading anchor behavior for Obsidian notes |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.HeadingAmbiguity.Diagnostics]] | Preserve ambiguous heading diagnostics under Obsidian normalization |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.Attachments.Intelligence]] | Preserve Obsidian embed and Markdown image attachment intelligence |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.FileOperations.AtomicRefactor]] | Preserve vault file-operation refactors for Obsidian references |
| [[docs/requirements/functional/ofmarkdown-parity#Parity.StructuralLSP.Coverage]] | Preserve document links, folding, and selection ranges for Obsidian structures |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]] | Keep the flavor profile signature aligned with implemented surfaces |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Parser.ProfileDispatch]] | Dispatch parser behavior through the effective profile |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Diagnostics.ProfileRules]] | Apply profile-specific diagnostics |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Completion.ProfileCandidates]] | Apply profile-specific completions |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Navigation.ProfileResolution]] | Cover definition, references, document links, document symbols, and folding |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Hover.ProfileMetadata]] | Apply profile-specific hover metadata and boundary wording |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.SemanticTokens.ProfileTokens]] | Apply profile-specific semantic tokens |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Rename.ProfileSafety]] | Implement or explicitly reject profile-safe rename surfaces |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]] | Classify host, conversion, renderer, bibliography, MDX/JSX, and execution boundaries before local resolution |
| [[docs/plans/markdown-flavor-lsp-applicability-matrix]] | Record per-surface implementation, deferral, or not-applicable disposition |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Phase evidence includes a surface disposition table for diagnostics, completion, navigation, hover, semantic tokens, rename, and host/conversion boundaries.
- Obsidian behavior works when effective flavor is `obsidian`.
- `.md` documents stay in VS Code `markdown` language mode.
- Tests prove Obsidian features are gated by flavor and no longer by
  `ofmarkdown`.

## Gate Verification

```bash
bun test src/parser/__tests__/markdown-flavor-profiles.test.ts
bun test src/test/integration/markdown-flavor.test.ts
bun run bdd
bun test src/test/ci-workflow.test.ts
bun run lint:docs
bun run typecheck
bun run lint
bun run build
```

Validation evidence must link the targeted unit/integration output,
`docs/test/evidence/markdown-flavor-validation-run.md`,
`docs/test/evidence/markdown-flavor-research-trace.md`, and
`docs/test/evidence/markdown-flavor-host-boundary-review.md` when boundary
dispositions are introduced, changed, deferred, or rejected.

Security evidence must also show the dialect parser/profile satisfies
`Security.Parser.FlavorProfileResourceSafety`; host, conversion, renderer,
bibliography, JSX/ESM, and execution-bound references perform no network access,
process execution, dynamic import, or out-of-root file reads; and rename evidence
satisfies `Security.Vault.RenameConfinement` before any workspace edit is sent.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-24-obsidian-flavor-language-support/index]]
