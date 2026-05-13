---
title: Roadmap And Test Plan Audit Index
tags: [audits, roadmap, test-plan, markdown-flavor]
updated: 2026-05-13
---

# Roadmap And Test Plan Audit Index

This folder records the May 13, 2026 gap analysis between the pending roadmap,
current requirements, and current test plans.

## Audit Files

| Audit | Scope | Highest-risk findings |
|---|---|---|
| [Server roadmap requirements gap analysis](server-roadmap-requirements-gap-analysis.md) | Pending server phases 18-34 against root requirements and flavor feature sets. | `FlavorLSP.*` requirements are not explicitly linked from Phase 19-34 tickets; rename and full navigation coverage are weakly planned. |
| [Extension roadmap requirements gap analysis](extension-roadmap-requirements-gap-analysis.md) | Pending extension phases E15-E17 against extension/root requirements. | E15 needs a resource-aware propagation contract; project-config auto-detection ownership is ambiguous. |
| [Cross-cutting roadmap traceability gap analysis](cross-cutting-roadmap-traceability-gap-analysis.md) | Pending roadmap traceability across requirements, tests, BDD, DDD, and operational chores. | Phase 22-34 traceability to `FlavorLSP.*` is the largest cross-cutting gap. |
| [Root test plan gap analysis](root-test-plan-gap-analysis.md) | `docs/test/` plans against root/server requirements and pending phases. | `FlavorLSP.*` lacks first-class matrix rows and per-flavor/per-LSP-surface fixture matrices. |
| [Extension test plan gap analysis](extension-test-plan-gap-analysis.md) | `extension/docs/tests/` plans against extension requirements and E15-E17. | Document selector guard coverage is missing, `EXT-MF-I-006` is overloaded, and real propagation coverage is too thin. |

## Priority Themes

1. Add explicit `FlavorLSP.*` requirement trace to Phase 19-34 plans, tickets,
   and test matrices.
2. Add rename, full navigation, hover, semantic-token, and host-boundary
   dispositions to the flavor applicability and per-flavor phase plans.
3. Define the extension-to-server effective-flavor payload for multi-root,
   standalone, and multiple-open-document cases.
4. Split root Phase 21 BDD/validation evidence from E17 VS Code host evidence.
5. Repair extension test-plan ID conflicts and add package-target, stale
   `ofmarkdown`, and document-selector verification evidence.
