---
title: Markdown Flavor E2E Test Specification
tags:
  - test/spec
  - e2e
  - markdown-flavor
aliases:
  - Markdown Flavor E2E Tests
---

# Markdown Flavor E2E Test Specification

Repository-level E2E coverage is expressed through BDD scenarios. VS Code host
E2E coverage is specified in `extension/docs/tests/markdown-flavor-e2e-spec.md`.

## Evidence Boundary

Phase 21 root BDD is acceptance evidence for flavor state, requirement
traceability, and validation artifacts inside the server repository. It may use
legacy feature filenames such as `ofmarkdown-language-mode.feature`, but current
assertions must prove `.md` documents keep `languageId = markdown`.

Phase E17 extension host proof is separate. It must run in the VS Code Extension
Development Host and prove document selectors, activation events,
`.fgattributes` writes, `.fgignore` inactive state, user-visible selector state,
and package/host behavior with the real extension. Passing Phase 21 BDD does
not count as E17 VS Code host proof.

## Test Cases

| Spec ID | Feature file | Scenario coverage |
|---|---|---|
| MF-E-001 | `docs/bdd/features/ofmarkdown-language-mode.feature` | `.md` files stay `markdown`; selector exposes every required flavor; selected-file and directory `.fgattributes` writes persist; Auto Detect clears/resets the chosen scope and recomputes from Obsidian marker, syntax inference, ambiguity fallback, and CommonMark fallback; server refresh is recorded with selected and effective flavor. |
| MF-E-002 | `docs/bdd/features/markdown-flavor-dialects.feature` | Original Markdown and CommonMark planned behavior contracts; every researched flavor has a source-backed planned profile and signature behavior until the product registry/server engine replace harness fixtures. |
| MF-E-003 | `docs/bdd/features/vscode-extension.feature`, `docs/bdd/features/ofmarkdown-language-mode.feature` | LanguageClient serves Markdown documents while flavor state changes; selector enumeration, selected-file/directory `.fgattributes` persistence, effective-context propagation, and manual non-Markdown language safety execute without relying on custom language ids. |
| MF-E-004 | `docs/bdd/features/markdown-flavor-dialects.feature` | Root acceptance scenarios record per-LSP-surface expectations for diagnostics, completion, navigation, hover, semantic tokens, rename, and host-boundary behavior before dialect phases claim validation evidence. |
| MF-E-005 | `docs/bdd/features/ofmarkdown-language-mode.feature`, planned inference feature scenarios | Config-absent inference samples infer the expected strong-syntax flavors through Auto Detect, ambiguous shared syntax remains CommonMark, and root smoketest README remains generic Markdown rather than OFM. |
| MF-E-006 | planned structured-profile feature scenarios | Keep a Changelog, Common Changelog, and MADR examples under `.fgattributes`-configured and config-absent inference smoke workspaces resolve as structured profile flags layered over the active base flavor, without adding selector choices or enabling both changelog variants for one document. |

## Exit Criteria

- BDD feature files cover selector behavior, dialect profiles, and language preservation.
- Step definitions are updated so the BDD suite can execute the flavor scenarios.
- Server propagation scenarios assert recorded notification payloads rather than
  only recomputed harness state.
- Auto-detection scenarios include syntax inference and boundary
  confinement, and prove Auto Detect is independent from `.fgattributes`
  configuration resolution.
- Structured profile scenarios include both changelog variants and MADR across
  `.fgattributes`-configured and config-absent inference smoke workspaces.
- E2E acceptance remains independent from internal implementation class names.
- Phase 21 evidence is labeled as root/server BDD and validation evidence, not
  VS Code host automation.
- E17 remains the owner of real VS Code host proof for document selector,
  activation, `.fgattributes` persistence, `.fgignore` inactive state,
  Marketplace/package-target checks, and stale `ofmarkdown` host-test
  retirement.
