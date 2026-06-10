---
title: Extension Markdown Flavor Validation Test Specification
tags: [extension/docs, tests, validation, markdown-flavor]
aliases: [Extension Markdown Flavor Validation Tests]
---

# Extension Markdown Flavor Validation Test Specification

Validation proves the extension behavior matches user-facing product intent.

## Test Cases

| Spec ID | Planned/generated evidence | Acceptance criteria |
|---|---|---|
| EXT-MF-VA-001 | `extension/docs/tests/evidence/markdown-flavor-selector-smoke.md` | User can identify the effective Markdown flavor without using VS Code's language picker. |
| EXT-MF-VA-002 | `extension/docs/tests/evidence/markdown-flavor-mdfattributes-scope.md` | `.mdfattributes` receives the expected selected-file or directory-scope rule for override flows. |
| EXT-MF-VA-003 | `extension/docs/tests/evidence/markdown-flavor-host-log.md` | No call changes a Markdown document to `ofmarkdown` or another custom Markdown language id. |
| EXT-MF-VA-004 | `extension/docs/tests/evidence/markdown-flavor-research-review.md` | Every displayed flavor has a source-backed profile and no unresearched flavor is exposed. |
| EXT-MF-VA-005 | `extension/docs/tests/evidence/markdown-flavor-package-targets.md` | Marketplace selector proof and package-target verification evidence are present for validation signoff. |
| EXT-MF-VA-006 | `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md` | Current extension tests, package activation, client selectors, and host waits no longer assert `ofmarkdown` language promotion. |
| EXT-MF-VA-007 | `extension/docs/tests/evidence/markdown-flavor-inference-smoke.md` | User-visible Auto Detect behavior is validated for config-absent inference fixtures, ambiguous fallback, and the root smoketest README negative control. |
| EXT-MF-VA-008 | `extension/docs/tests/evidence/markdown-structured-profile-smoke.md` | User-visible structured profile behavior is validated for Keep a Changelog, Common Changelog, and MADR fixtures in `.mdfattributes`-configured and config-absent inference smoke workspaces. |

## Planned Evidence Artifacts

These paths are generated validation artifacts, not current proof. A validation
row cannot move to passing until the artifact exists, is dated, names the
reviewer or command that produced it, and links the verification output.

| Artifact path | Required content |
|---|---|
| `extension/docs/tests/evidence/markdown-flavor-selector-smoke.md` | Screenshot path or manual smoke notes showing the selector next to Markdown language state and all required flavor labels. |
| `extension/docs/tests/evidence/markdown-flavor-mdfattributes-scope.md` | `.mdfattributes` inspection for selected-file override, directory `/*.md` override, standalone selected-file override, and Auto Detect reset. |
| `extension/docs/tests/evidence/markdown-flavor-host-log.md` | `npm run test:host` log excerpt proving selector choices do not change `languageId` away from `markdown`. |
| `extension/docs/tests/evidence/markdown-flavor-package-targets.md` | `npm run verify:package-targets` log excerpt plus VSIX target list proving packaged server payload checks ran before release or validation signoff. |
| `extension/docs/tests/evidence/markdown-flavor-research-review.md` | Displayed flavor id and label table traced to `docs/research/` or `docs/ofm-spec/`. |
| `extension/docs/tests/evidence/markdown-flavor-stale-ofmarkdown-scan.md` | Command output or reviewer notes listing allowed historical `ofmarkdown` mentions and proving current activation, document selector, package, contribution, and host tests do not depend on language promotion. |
| `extension/docs/tests/evidence/markdown-flavor-inference-smoke.md` | Host smoke notes or screenshot paths for config-absent inference fixtures, expected inferred flavor or CommonMark fallback, root README boundary behavior, command output, commit SHA, and pass/fail status. |
| `extension/docs/tests/evidence/markdown-structured-profile-smoke.md` | Host smoke notes or screenshot paths for Keep a Changelog, Common Changelog, and MADR fixtures under `.mdfattributes`-configured and config-absent inference workspaces, expected profile flags, selector non-expansion evidence, command output, commit SHA, and pass/fail status. |

Evidence artifacts must be sanitized before commit. They must not include note
body text, frontmatter values, `.mdfignore` or `.mdfattributes` contents, environment
variables, API-like tokens, local usernames, home-directory paths, or raw server
stderr/stdout that contains vault content. Use repository-relative paths and
redacted excerpts when command output is needed.

## Exit Criteria

- Product review validates selector behavior in VS Code.
- Screenshots or smoke records show Markdown flavor behavior.
- Review evidence confirms the extension does not retcon language mode state.
- Package-target evidence confirms packaged VSIX payload checks were run.
- Stale `ofmarkdown` expectation evidence distinguishes historical docs from
  current extension behavior and tests.
- Inference smoke evidence distinguishes `.mdfattributes` configuration from
  syntax inference and proves root fixture README remains generic.
- Structured profile smoke evidence proves both changelog variants and MADR
  remain separate from base flavor selection across `.mdfattributes`-configured
  and config-absent inference smoke workspaces.
- Planned evidence artifacts exist at the paths above before validation rows
  move from planned/failing to passing.
