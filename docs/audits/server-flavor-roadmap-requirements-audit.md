---
title: Server Flavor Roadmap Requirements Audit
tags: [audits, markdown-flavor, roadmap, requirements, server]
updated: 2026-05-13
---

# Server Flavor Roadmap Requirements Audit

## Scope

Audited the current server flavor roadmap and plans against root/server
requirements and specifications.

In scope:

- [[docs/roadmap]]
- [[docs/plans/phase-19-markdown-flavor-model-profiles]]
- [[docs/plans/phase-20-markdown-flavor-server-propagation]]
- [[docs/plans/phase-21-markdown-flavor-bdd-validation]]
- [[docs/plans/phase-22-original-markdown-language-support]]
- [[docs/plans/phase-23-commonmark-language-support]]
- [[docs/plans/phase-24-obsidian-flavor-language-support]]
- [[docs/plans/phase-25-gfm-language-support]]
- [[docs/plans/phase-26-glfm-language-support]]
- [[docs/plans/phase-27-pandoc-markdown-language-support]]
- [[docs/plans/phase-28-multimarkdown-language-support]]
- [[docs/plans/phase-29-mdx-flavor-language-support]]
- [[docs/plans/phase-30-kramdown-language-support]]
- [[docs/plans/phase-31-markdown-extra-language-support]]
- [[docs/plans/phase-32-r-markdown-language-support]]
- [[docs/plans/phase-33-reddit-markdown-language-support]]
- [[docs/plans/phase-34-stack-overflow-markdown-language-support]]
- [[docs/plans/markdown-flavor-lsp-applicability-matrix]]
- `docs/requirements/**`
- `docs/features/**`
- `docs/design/**`
- `docs/test/**`
- `docs/research/**`

Out of scope:

- Source implementation under `src/`, `extension/`, and `website/`.
- Fixing any roadmap, requirements, feature, test, or plan gaps.
- Sibling repositories.

## Method

1. Enumerated the scoped docs with `rg --files docs`.
2. Read the controlling server requirements, especially
   [[docs/requirements/functional/markdown-flavor-lsp]] and
   [[docs/requirements/ofmarkdown-language-mode]].
3. Compared roadmap phases 19-34, their phase plan files, and their ticket
   indexes/tasks against the required server-side LSP surfaces:
   diagnostics, completion, definition, references, document links, document
   symbols, folding, hover, semantic tokens, rename, and host/conversion
   boundary classification.
4. Compared the applicability matrix and test matrix against the requirement
   meters in [[docs/requirements/functional/markdown-flavor-lsp]].
5. Checked feature pages under `docs/features/*-flavor.md` against the shared
   feature-set contract in [[docs/features/markdown-flavor-feature-sets]].

## Findings

| ID | Severity | Requirement/spec source | Roadmap/plan evidence | Gap | Impact | Recommended correction | Affected files/tickets |
|---|---|---|---|---|---|---|---|
| AUD-SF-001 | High | [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]] requires host/conversion references to stay separate from local targets. [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Navigation.ProfileResolution]], [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Hover.ProfileMetadata]], and [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Rename.ProfileSafety]] also depend on this boundary. | [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]] defines "Add shared non-local boundary classification" and links the required boundary/navigation/hover/rename requirements. [[docs/plans/phase-20-markdown-flavor-server-propagation/index]] lists [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]], and [[docs/roadmap#Phase 20 — Markdown Flavor Server Propagation]] states the phase owns server propagation and non-local boundary classification. But [[docs/plans/phase-20-markdown-flavor-server-propagation/FEAT-043#Child Tasks]] omits [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]]. | The Phase 20 feature ticket is not the single authoritative child-task list for the phase. The closeout chore depends on TASK-354, but FEAT-043 does not list it. | Phase 20 can be reviewed or advanced from the feature ticket while skipping the boundary classifier that later phases depend on. This risks false local diagnostics/navigation/rename edits for host or conversion references. | Add [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]] to FEAT-043's child-task table and make Phase 20 closeout explicitly block on its acceptance evidence. | [[docs/plans/phase-20-markdown-flavor-server-propagation/FEAT-043]], [[docs/plans/phase-20-markdown-flavor-server-propagation/index]], [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]], [[docs/plans/phase-20-markdown-flavor-server-propagation/CHORE-106]] |
| AUD-SF-002 | High | [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]] explicitly includes GitHub issues, commits, users, labels, and alerts. [[docs/features/github-flavored-markdown-flavor#Host-Specific Boundaries]] says GitHub object references must not be resolved without repository context. | [[docs/plans/phase-25-gfm-language-support/FEAT-051]] and [[docs/plans/phase-25-gfm-language-support/TASK-325]] link `FlavorLSP.HostBoundary.NonLocalReferences`; [[docs/plans/markdown-flavor-lsp-applicability-matrix]] requires GFM rename to reject GitHub host objects. But the matrix's "Non-Local Boundary Notes" table has no `gfm` row, and [[docs/test/matrix#Server Markdown Flavor LSP Requirements]] assigns host-boundary updates to "Phase 21 and Phases 26-34", excluding Phase 25. The validation artifact row likewise lists phases 26, 27, 28, 29, 32, 33, and 34, but not 25. | GFM host-boundary evidence is required by the requirement and feature page, but the disposition/evidence plan omits Phase 25 as an owner. | Phase 25 can close with a generic "host/conversion boundaries" checkbox while the root matrix and validation artifacts do not require GitHub-specific boundary fixtures or deferred live GitHub lookup disposition. | Add `gfm` to the non-local boundary notes with live GitHub repository/object lookup out of scope and local syntax/reference-shape support still required. Update [[docs/test/matrix]] so `FlavorLSP.HostBoundary.NonLocalReferences` and `docs/test/evidence/markdown-flavor-host-boundary-review.md` include Phase 25. | [[docs/plans/markdown-flavor-lsp-applicability-matrix]], [[docs/test/matrix]], [[docs/plans/phase-25-gfm-language-support/FEAT-051]], [[docs/plans/phase-25-gfm-language-support/TASK-325]], [[docs/plans/phase-25-gfm-language-support/TASK-326]] |
| AUD-SF-003 | Medium | [[docs/features/markdown-flavor-feature-sets#Shared Contract]] requires every flavor feature page to declare expected LSP behavior for diagnostics, completion, hover, navigation, document symbols, folding, semantic tokens, and rename. [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]] says profile signatures are compared against those feature pages. | Several feature pages do not declare all required LSP surfaces in their own LSP behavior tables. Examples: [[docs/features/github-flavored-markdown-flavor#LSP Behavior]] omits document symbols and rename; [[docs/features/gitlab-flavored-markdown-flavor#LSP Behavior]] omits document symbols, folding, and rename; [[docs/features/mdx-flavor#LSP Behavior]] omits document symbols, folding, and rename; [[docs/features/r-markdown-flavor#LSP Behavior]] omits document symbols, semantic tokens, and rename; [[docs/features/reddit-markdown-flavor#LSP Behavior]] omits document symbols, folding, and rename; [[docs/features/stack-overflow-markdown-flavor#LSP Behavior]] omits document symbols, folding, and rename. | The phase plans and applicability matrix now require these surfaces, but the feature pages are incomplete as comparison sources. | A profile can pass a "matches feature page signature" review while still failing required LSP surfaces that the feature page never declares. This weakens [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]]. | Update every flavor feature page to include explicit rows or dispositions for all shared-contract surfaces: diagnostics, completion, navigation, document symbols, folding, hover, semantic tokens, and rename. Where a surface is intentionally rejected or deferred, say so in the feature page and link the matrix/phase ticket. | [[docs/features/markdown-flavor-feature-sets]], [[docs/features/github-flavored-markdown-flavor]], [[docs/features/gitlab-flavored-markdown-flavor]], [[docs/features/mdx-flavor]], [[docs/features/r-markdown-flavor]], [[docs/features/reddit-markdown-flavor]], [[docs/features/stack-overflow-markdown-flavor]], likely also [[docs/features/obsidian-markdown-flavor]], [[docs/features/pandoc-markdown-flavor]], [[docs/features/multimarkdown-flavor]], [[docs/features/kramdown-flavor]], [[docs/features/markdown-extra-flavor]] for surface-completeness review |
| AUD-SF-004 | Medium | [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Navigation.ProfileResolution]] requires definition, references, document links, document symbols, and folding. [[docs/test/markdown-flavor-unit-spec#Per-LSP-Surface Fixture Expectations]] requires MF-NAV-001 expectations for all those sub-surfaces. | Phase 22-34 LSP task DoD lines require navigation coverage for definition, references, document links, document symbols, and folding. However the feature-page LSP behavior tables mostly use a single "Navigation" row and omit document symbols/folding details. The applicability matrix supplies these details, but feature pages are also declared as profile signature sources by [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Profile.SignatureCoverage]]. | Navigation sub-surfaces are split across docs: matrix and tickets are precise, feature pages are not. | Implementers may code and validate only go-to-definition/reference behavior from the feature page, missing document links, document symbols, or folding until late closeout. | Normalize the flavor feature pages to mirror the matrix's navigation sub-surfaces or link each feature-page "Navigation" row directly to the matrix row and state that document links, document symbols, and folding are required or explicitly deferred. | [[docs/features/*-flavor.md]], [[docs/plans/markdown-flavor-lsp-applicability-matrix]], Phase 22-34 LSP tasks such as [[docs/plans/phase-25-gfm-language-support/TASK-325]], [[docs/plans/phase-29-mdx-flavor-language-support/TASK-337]], [[docs/plans/phase-32-r-markdown-language-support/TASK-346]] |
| AUD-SF-005 | Medium | [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]] and [[docs/test/markdown-flavor-verification-spec#Markdown Flavor Verification Test Specification]] require matrix/gate evidence for every `FlavorLSP.*` tag and planned validation artifacts. | [[docs/test/matrix#Server Markdown Flavor LSP Requirements]] tracks `FlavorLSP.HostBoundary.NonLocalReferences`, but assigns phase ownership to Phase 21 and Phases 26-34. [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]] owns the reusable classifier, and Phase 25 owns GFM GitHub host references. | The test matrix does not align with the roadmap/tickets for boundary classification ownership. | CI or review gate checks can preserve the row while still pointing maintainers to the wrong phases. Boundary regressions may be treated as later dialect work instead of shared server infrastructure plus GFM work. | Change the matrix ownership to include Phase 20 shared classification and Phase 25 GFM. Keep Phase 21 as evidence scaffold and phases 26-34 as dialect-specific follow-up owners. | [[docs/test/matrix]], [[docs/test/markdown-flavor-verification-spec]], [[docs/plans/phase-20-markdown-flavor-server-propagation/TASK-354]], [[docs/plans/phase-25-gfm-language-support/TASK-325]] |

## Notes

- The phase 22-34 feature tickets are generally stronger than the older feature
  pages: they consistently cite the applicability matrix and require
  diagnostics, completion, navigation sub-surfaces, hover, semantic tokens,
  rename, and boundary disposition.
- The biggest audit risk is documentation drift between three sources of truth:
  flavor feature pages, the applicability matrix, and phase/ticket DoD. The
  requirement set already says profiles are compared to feature-page
  signatures, so feature-page omissions are not harmless.
- I did not fix findings.

## Docs Lint

Ran after writing this report:

```bash
bun run lint:docs
```

Result: passed.
