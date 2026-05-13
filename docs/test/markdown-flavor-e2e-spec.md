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

## Test Cases

| Spec ID | Feature file | Scenario coverage |
|---|---|---|
| MF-E-001 | `docs/bdd/features/ofmarkdown-language-mode.feature` | `.md` files stay `markdown`; selector exposes every required flavor; workspace-folder/workspace/user overrides persist; auto-detection clears and recomputes; `workspace/didChangeConfiguration` propagation is recorded with configured and effective flavor. |
| MF-E-002 | `docs/bdd/features/markdown-flavor-dialects.feature` | Original Markdown and CommonMark planned behavior contracts; every researched flavor has a source-backed planned profile and signature behavior until the product registry/server engine replace harness fixtures. |
| MF-E-003 | `docs/bdd/features/vscode-extension.feature`, `docs/bdd/features/ofmarkdown-language-mode.feature` | LanguageClient serves Markdown documents while flavor state changes; selector enumeration, target-specific override persistence, configuration propagation, and manual non-Markdown language safety execute without relying on custom language ids. |

## Exit Criteria

- BDD feature files cover selector behavior, dialect profiles, and language preservation.
- Step definitions are updated so the BDD suite can execute the flavor scenarios.
- Server propagation scenarios assert recorded notification payloads rather than
  only recomputed harness state.
- E2E acceptance remains independent from internal implementation class names.
