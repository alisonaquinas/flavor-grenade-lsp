# Server Roadmap Requirements Gap Analysis

Date: 2026-05-13

## Scope

This audit compares pending server roadmap phases against current root and
server-side requirements. It focuses on Phase 18 and Phases 19-34, with emphasis
on Markdown flavor server behavior.

## Source Files Reviewed

- [docs/roadmap.md](../roadmap.md)
- [docs/plans/phase-18-security-hardening-audit.md](../plans/phase-18-security-hardening-audit.md) and tickets under [docs/plans/phase-18-security-hardening-audit/](../plans/phase-18-security-hardening-audit/)
- [docs/plans/phase-19-markdown-flavor-model-profiles.md](../plans/phase-19-markdown-flavor-model-profiles.md) through [docs/plans/phase-34-stack-overflow-markdown-language-support.md](../plans/phase-34-stack-overflow-markdown-language-support.md), including ticket directories
- [docs/plans/markdown-flavor-lsp-applicability-matrix.md](../plans/markdown-flavor-lsp-applicability-matrix.md)
- [docs/requirements/index.md](../requirements/index.md)
- [docs/requirements/functional/markdown-flavor-lsp.md](../requirements/functional/markdown-flavor-lsp.md)
- [docs/requirements/ofmarkdown-language-mode.md](../requirements/ofmarkdown-language-mode.md)
- [docs/requirements/functional/ofmarkdown-parity.md](../requirements/functional/ofmarkdown-parity.md)
- [docs/requirements/security/](../requirements/security/)
- [docs/requirements/user/markdown-flavors.md](../requirements/user/markdown-flavors.md)
- [docs/features/*-flavor.md](../features/)
- [docs/bdd/features/markdown-flavor-dialects.feature](../bdd/features/markdown-flavor-dialects.feature)
- [docs/test/markdown-flavor-unit-spec.md](../test/markdown-flavor-unit-spec.md), [docs/test/markdown-flavor-integration-spec.md](../test/markdown-flavor-integration-spec.md), [docs/test/markdown-flavor-e2e-spec.md](../test/markdown-flavor-e2e-spec.md), [docs/test/markdown-flavor-verification-spec.md](../test/markdown-flavor-verification-spec.md), [docs/test/markdown-flavor-validation-spec.md](../test/markdown-flavor-validation-spec.md)

## Executive Summary

Coverage exists for the major roadmap intent: Phase 18 maps to security
requirements; Phases 19-21 cover the shared flavor model, server propagation,
BDD, and validation; Phases 22-34 give each required explicit flavor a planned
parser, LSP-feature, and validation ticket.

The largest gap is traceability, not absence of phases. The new server-side
`FlavorLSP.*` requirements are mostly not linked from the actual Phase 19-34
tickets. Many flavor tickets still cite `Extension.MarkdownFlavor.*` as the
controlling requirement even when the work is server parser, diagnostics,
completion, navigation, hover, semantic token, and rename behavior.

The second largest gap is weak ownership for navigation and rename. The
applicability matrix requires navigation but not rename, while
[markdown-flavor-dialects.feature](../bdd/features/markdown-flavor-dialects.feature)
and [markdown-flavor-lsp.md](../requirements/functional/markdown-flavor-lsp.md)
require rename profile safety. Phase 22-34 LSP tickets commonly list diagnostic,
completion, document-link, folding, semantic-token, and hover paths, but do not
explicitly plan definition, references, document symbols, or rename handler work.

## Gap Table

| ID | Severity | Requirement tag(s) | Roadmap / ticket evidence | Gap | Impact | Recommended remediation |
|---|---|---|---|---|---|---|
| AUD-S-001 | High | `FlavorLSP.Profile.SignatureCoverage`, `FlavorLSP.Parser.ProfileDispatch`, `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Navigation.ProfileResolution`, `FlavorLSP.Hover.ProfileMetadata`, `FlavorLSP.SemanticTokens.ProfileTokens`, `FlavorLSP.Rename.ProfileSafety`, `FlavorLSP.HostBoundary.NonLocalReferences` | Phase 19-34 plans exist and broadly cover profiles, parser semantics, LSP behavior, tests, and validation. Example: [Phase 19](../plans/phase-19-markdown-flavor-model-profiles.md), [Phase 20](../plans/phase-20-markdown-flavor-server-propagation.md), [Phase 25 TASK-325](../plans/phase-25-gfm-language-support/TASK-325.md). | Tickets mostly link `Extension.MarkdownFlavor.*`, not the new server `FlavorLSP.*` requirements. | Trace matrices can report coverage while the actual server requirements remain unowned or unverifiable. | Add explicit `FlavorLSP.*` rows to Phase 19-34 feature and task `Linked Requirements` tables. Keep `Extension.MarkdownFlavor.*` only where client selection/propagation is actually in scope. |
| AUD-S-002 | High | `FlavorLSP.Rename.ProfileSafety` | [markdown-flavor-dialects.feature](../bdd/features/markdown-flavor-dialects.feature) asserts rename behavior for every flavor; [markdown-flavor-lsp.md](../requirements/functional/markdown-flavor-lsp.md) requires profile-safe rename. | [markdown-flavor-lsp-applicability-matrix.md](../plans/markdown-flavor-lsp-applicability-matrix.md) omits rename entirely, and Phase 22-34 LSP tickets do not name rename handler/source/test paths. | Flavor phases may close without implementing or intentionally deferring rename safety, leaving unsafe or stale refactor behavior. | Add a Rename column to the applicability matrix. Update each Phase 22-34 LSP ticket with rename scope, not-applicable/deferred rationale, or follow-up ticket. |
| AUD-S-003 | High | `FlavorLSP.Navigation.ProfileResolution` | Matrix requires navigation for each flavor; feature tickets say “navigation.” Example: [Phase 27 TASK-331](../plans/phase-27-pandoc-markdown-language-support/TASK-331.md). | LSP feature tickets list `document-link.handler`, `folding-range.handler`, `semantic-tokens.handler`, and `hover.handler`, but generally omit `definition`, `references`, `document-symbol`, and related navigation source/test paths. | “Navigation” may be interpreted as only document links/folding, missing go-to-definition, references, symbols, or cross-reference semantics required by requirements and BDD. | Add explicit navigation sub-surfaces to each Phase 22-34 LSP ticket: definition, references, document links, document symbols, folding. Mark unsupported host lookups as deferred with rationale. |
| AUD-S-004 | Medium | `FlavorLSP.HostBoundary.NonLocalReferences` | Matrix defers live GitLab/MDX/Reddit/Stack Overflow lookup; Phase 26/29/33/34 plans mention platform boundaries. | Boundary classification is scattered across flavor tickets and the matrix, but no shared host-boundary service/ticket owns non-local classification across all host/conversion flavors. | Per-flavor implementations can diverge, causing host references to leak into vault diagnostics, navigation, or rename differently by flavor. | Add a Phase 20 or Phase 22-34 cross-cutting ticket for a shared host/conversion boundary classifier and tests for all non-local examples in `FlavorLSP.HostBoundary.NonLocalReferences`. |
| AUD-S-005 | Medium | `FlavorLSP.Profile.SignatureCoverage`, flavor feature sets | Phase 19 creates profiles; Phase 22-34 each add parser/profile semantics; feature pages under [docs/features/](../features/) are the source. | Phase 19 profile tickets split initial profile registry from later per-flavor semantic implementation. It is unclear whether Phase 19 profiles are authoritative enough to satisfy `SignatureCoverage`, or placeholders refined later. | Phase 19 could pass with shallow profile entries, then later phases discover profile shape churn that breaks server propagation and selector contracts. | Define minimum profile schema in Phase 19 that includes every surface later phases must fill: active, inert, host-specific, opaque regions, diagnostics, completion, navigation, hover, semantic tokens, rename. Allow values to be `planned` only with linked phase tickets. |
| AUD-S-006 | Medium | `FlavorLSP.Diagnostics.ProfileRules`, `FlavorLSP.Completion.ProfileCandidates`, `FlavorLSP.Hover.ProfileMetadata`, `FlavorLSP.SemanticTokens.ProfileTokens` | Phase 22-34 tickets say tests cover “positive and portability/unsupported syntax cases.” | Acceptance does not require negative cross-flavor cases per feature set, except Obsidian-only gating. Other inactive constructs, such as GFM in CommonMark or kramdown attributes in Markdown Extra, are not consistently called out per phase. | False positives may remain: inactive syntax receives diagnostics, completions, hover, or tokens in the wrong flavor. | Add per-flavor negative fixture requirements from [markdown-flavor-dialects.feature](../bdd/features/markdown-flavor-dialects.feature) and [docs/features/*-flavor.md](../features/) to each parser and LSP ticket. |
| AUD-S-007 | Medium | `Extension.MarkdownFlavor.RequiredCoverage`, `FlavorLSP.Profile.SignatureCoverage` | Roadmap requires 13 explicit flavors; Phase 19 and Phase 22-34 enumerate all 13. | Requirements and tickets refer to `docs/test/...`; the user-supplied scope says `docs/tests`, but the repo uses [docs/test/](../test/). This is not a product gap, but it is an audit/trace naming inconsistency. | Future agents may miss the test specs or create duplicate `docs/tests/` content. | Standardize docs wording on `docs/test/` and avoid introducing `docs/tests/`. |
| AUD-S-008 | Low | Security requirements under `Security.*` | [Phase 18](../plans/phase-18-security-hardening-audit.md) links URI allowlist, parser limits, symlink confinement, input validation, exact pinning, and advisory monitoring. | Security coverage is strong, but Phase 18 is still in progress while Phase 19 depends on Phase 18. Roadmap does not explicitly state whether flavor phases are blocked on all Phase 18 bug tickets or only the phase gate. | Parallel flavor work could begin before path/parser hardening that flavor parsers must respect. | Clarify dependency wording: Phases 19-34 start after Phase 18 gate or identify Phase 18 tickets that are hard blockers for flavor parsing and host-boundary work. |
| AUD-S-009 | Low | `FlavorLSP.HostBoundary.NonLocalReferences`, `FlavorLSP.Hover.ProfileMetadata` | Matrix documents deferred live lookup for GLFM, MDX, Reddit, and Stack Overflow. | Pandoc, MultiMarkdown, and R Markdown also have conversion/execution/bibliography boundaries, but the “Deferred Platform Lookup Notes” section only names live platform lookups. | Reviewers may miss non-platform but non-local boundaries, especially citations, bibliography, conversion extensions, and executable chunks. | Expand the deferred/boundary notes into “Non-local Boundary Notes” covering conversion-bound and execution-bound references, not only network/platform lookup. |

## Coverage Notes By Area

- Root/server requirements from completed Phases 14-17 remain covered by completed roadmap entries and are outside the pending-gap focus.
- Phase 18 maps directly to current security requirement tags and has no obvious missing security requirement class in the reviewed scope.
- Phases 19-21 cover the foundational FlavorLSP needs, but their requirement links should be updated from extension-only tags to include the new server tags.
- Every required explicit flavor has a planned Phase 22-34 parser ticket, LSP-feature ticket, test/evidence ticket, trace chore, and closeout chore.
- Flavor feature-set coverage is broadly planned, but per-flavor ticket acceptance is too generic to prove each feature page’s active/inert/host-specific set.

