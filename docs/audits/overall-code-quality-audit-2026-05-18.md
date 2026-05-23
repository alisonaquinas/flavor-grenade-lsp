---
title: Overall Code Quality Audit 2026-05-18
tags: [audits, code-quality, process, extension, website, server]
aliases: [Overall code quality audit]
updated: 2026-05-18
---

# Overall Code Quality Audit 2026-05-18

## Scope

Audited the current `flavor-grenade-lsp` repository only. Sibling repositories
were out of scope per the root `AGENTS.md` instruction.

In scope:

- `src/`
- `extension/`
- `website/`
- `scripts/`
- `.github/workflows/`
- `docs/plans/`
- `docs/test/`
- `docs/audits/`

Out of scope:

- Sibling repositories under `C:\Users\aaqui\obsidian-stack\`.
- Fixing findings. This audit records issues and remediation paths only.

## Method

1. Confirmed the worktree was clean on `develop`.
2. Split review across subagents:
   - server core, parser, handlers, and LSP architecture;
   - extension, website, scripts, packaging, and CI;
   - docs, plans, test evidence, and prior audits.
3. Ran local read-only sweeps for large files, stale TODO/stub signals, disabled
   checks, brittle test patterns, and package/script gates.
4. Verified each accepted finding with direct source references before writing
   this audit.

## Executive Summary

The highest-risk issues are not formatting problems. They are state freshness,
release packaging, and evidence integrity problems:

- open-document edits appear to update `ParseCache` without updating the
  vault-wide index/ref graph used by navigation and rename;
- the npm package bin likely lacks an executable Node entrypoint on Unix;
- an extension release workflow verifies VSIX package contents before building
  the server binary it expects;
- website generated-content checks can be neutralized by regenerating before
  checking;
- the claimed authoritative test inventory is materially stale.

The codebase has strong tests and detailed phase evidence, but several quality
gates rely on manually maintained docs or scripts that no longer match current
reality.

## Findings

| ID | Severity | Area | Finding | Evidence | Recommended correction |
|---|---|---|---|---|---|
| AUD-CQ-001 | High | Server state | Open/change handlers update `ParseCache` but do not appear to upsert the parsed document into `VaultIndex`, leaving ref graph, tags, oracle, references, CodeLens, and rename surfaces stale after editor edits. | `src/lsp/handlers/did-open.handler.ts:54`, `src/lsp/handlers/did-open.handler.ts:57`, `src/lsp/handlers/did-change.handler.ts:48`, `src/lsp/handlers/did-change.handler.ts:51` | Introduce one document-state update service that writes parsed docs into the single source of truth, refreshes tag/ref graph/oracle state, and republishes diagnostics. Add integration tests where `didChange` alters references, headings, tags, and rename results. |
| AUD-CQ-002 | High | URI safety | `FileWatcher` manually builds file URIs with string interpolation, which is brittle for Windows paths and characters such as spaces or `#`. | `src/vault/file-watcher.ts:102`; scanner already uses URL-safe conversion elsewhere. | Use `pathToFileURL(absPath).toString()` everywhere file URIs are generated. Add watcher tests for spaces, hash characters, and Windows-style paths. |
| AUD-CQ-003 | High | Packaging | The root npm bin points to `dist/main.js`, but `src/main.ts` has no shebang. A globally installed package may execute the JS file as shell text on Unix. | `package.json:6`, `package.json:7`, `src/main.ts:1` | Add a Node shebang to the built entrypoint or ship a small bin wrapper. Add `npm pack` plus installed-bin smoke coverage. |
| AUD-CQ-004 | High | Extension release | The extension release workflow runs package-target VSIX verification before building the server binary that the package inspection expects. | `.github/workflows/extension-release.yml:25`, `.github/workflows/extension-release.yml:39`, `.github/workflows/extension-release.yml:41`; build/package steps appear later at `.github/workflows/extension-release.yml:116` and `.github/workflows/extension-release.yml:127`. | Build the required server binary before `verify:package-targets`, or split pure mapping tests from VSIX payload inspection. |
| AUD-CQ-005 | High | Website pipeline | Website scripts run `content:generate` before `content:check`, so stale committed generated files are rewritten before validation. Missing generated files are silently ignored by the check path. | `website/package.json:13`, `website/package.json:14`, `website/src/content/pipeline/website/build.ts:59`, `website/src/content/pipeline/website/build.ts:64` | Make `content:check` fail on missing generated files and run it before generation in CI, or assert `git diff --exit-code` after generation. |
| AUD-CQ-006 | High | Test inventory | `docs/test/index.md` claims to be authoritative but is stale. A normalized scan found 149 test files across `src`, `extension`, `website`, and `scripts`, with 63 absent from the index. It also lists a nonexistent `tests/unit/lsp/lsp.module.spec.ts`. | `docs/test/index.md:12`, `docs/test/index.md:46`; missing examples include `src/code-actions/__tests__/code-action.handler.test.ts`, `src/handlers/__tests__/rename.handler.test.ts`, and `src/vault/__tests__/vault-index.test.ts`. | Regenerate the inventory from actual test files and add a CI guard that fails on missing or stale entries. |
| AUD-CQ-007 | Medium | LSP ranges | Entity hit testing documents and implements inclusive end positions even though LSP ranges are end-exclusive. Cursor positions immediately after an entity can still select it. | `src/handlers/cursor-entity.ts:32`, `src/handlers/cursor-entity.ts:35`, downstream callers at `src/handlers/cursor-entity.ts:63` through `src/handlers/cursor-entity.ts:116` | Change end checks to half-open semantics and add boundary tests for cursor at token end. |
| AUD-CQ-008 | Medium | Document symbols | Child symbols are attached by heading text lookup, so duplicate headings can mis-nest tables, tasks, anchors, or flavor symbols under the first matching heading name. | `src/handlers/document-symbol.handler.ts:507`, `src/handlers/document-symbol.handler.ts:513` | Track the selected parent by heading index or range, not display text. Add duplicate-heading fixtures. |
| AUD-CQ-009 | Medium | URI utilities | File URI/path conversion is duplicated across handlers and services, with custom `new URL().pathname` and manual file URI handling. | `src/handlers/definition.handler.ts:286`, `src/handlers/references.handler.ts:259`, `src/handlers/rename.handler.ts:137`, `src/completion/completion-router.ts:633`, `src/vault/file-watcher.ts:102` | Centralize URI conversion on `fileURLToPath`, `pathToFileURL`, and the existing local `fileUriToPath` helper. Ban manual `file://` assembly in tests. |
| AUD-CQ-010 | Medium | Server architecture | Flavor-specific behavior is concentrated in large central classes, increasing change coupling as flavors grow. `CompletionRouter` has flavor `if` chains and inline snippet providers; `LspModule` manually mirrors every parser count in `queryOpenDoc`. | `src/completion/completion-router.ts:88`, `src/completion/completion-router.ts:292`, `src/lsp/lsp.module.ts:327`, `src/lsp/lsp.module.ts:333` through `src/lsp/lsp.module.ts:393` | Move flavor completions to providers keyed by flavor/context. Move open-document summary/counting to a parser or debug-summary helper, and consider route registration tables for LSP handlers. |
| AUD-CQ-011 | Medium | Extension host tests | Extension host tests can pass once a client object or startup promise exists, before proving the server handshake/index readiness has completed. | `extension/src/extension.ts:223`, `extension/src/extension.ts:224`, `extension/src/extension.ts:262`, `extension/src/extension.ts:307`, `extension/src/test/suite/activation-language-mode.test.js:55` | Expose a real ready signal or query server/index state from host tests. Assert a successful server round trip instead of only `isClientStarted()`. |
| AUD-CQ-012 | Medium | Extension flavor migration | Current extension package contributions still depend on retired `ofmarkdown` language activation and keybinding scopes while extension docs track this as failing follow-up work. | `extension/package.json:49`, `extension/package.json:72`, `extension/package.json:134`, `extension/package.json:140`, `extension/package.json:146`, `extension/docs/tests/matrix.md:31`, `extension/docs/tests/matrix.md:34` | Complete E16 contribution migration: replace custom-language-scoped snippets/keybindings with flavor/context-based affordances or retire the custom contribution path. |
| AUD-CQ-013 | Medium | Dependency policy | Exact dependency policy checks root and extension manifests, but not the website. The website has its own package boundary and dependency lock. | `scripts/check-exact-dependencies.mjs:6` | Include `website/package.json` in the policy or document why website dependencies are exempt. |
| AUD-CQ-014 | Medium | CI/lint gates | Root `lint` and `format:check` cover only `src/`, while CI labels the lint job as zero-warning lint. Scripts, workflow files, and config are not covered by the root quality gate. | `package.json:31`, `package.json:37`, `.github/workflows/ci.yml:42` | Add `--max-warnings 0` to the lint script and extend lint/format coverage to scripts/config/workflows where practical. |
| AUD-CQ-015 | Medium | Test evidence stability | Markdown flavor validation evidence records integration tests as passing, but a subagent observed the exact focused integration command fail once with initialize timeouts and pass on immediate rerun. The timeout is hard-coded. | `docs/test/evidence/markdown-flavor-validation-run.md:30`, `docs/test/evidence/markdown-flavor-validation-run.md:33`, `src/test/integration/markdown-flavor.test.ts:76` | Make spawned-server startup deterministic, add an explicit ready signal, or increase cold-start tolerance. Record CI run IDs and cold/warm conditions in validation evidence. |
| AUD-CQ-016 | Medium | Matrix semantics | `docs/test/matrix.md` defines red as currently failing, but server flavor rows remain red while aggregate unit/integration rows say those same server surfaces pass. | `docs/test/matrix.md:22`, `docs/test/matrix.md:371` through `docs/test/matrix.md:378`, `docs/test/matrix.md:395`, `docs/test/matrix.md:396` | Split true failing status from partial status such as `server passing / extension pending`, or add a documented partial status. |
| AUD-CQ-017 | Medium | Prior audit lifecycle | Existing audits contain findings that appear resolved in current plans but remain listed as active findings. | `docs/audits/test-bdd-ddd-roadmap-spec-audit.md:54` vs `docs/plans/phase-20-markdown-flavor-server-propagation/TASK-292.md:53`; `docs/audits/server-flavor-roadmap-requirements-audit.md:66` vs `docs/plans/phase-20-markdown-flavor-server-propagation/FEAT-043.md:65` | Add finding lifecycle fields: `open`, `resolved`, `superseded`, resolved date, and remediation link. Periodically refresh audit status. |
| AUD-CQ-018 | Low | Automation honesty | `scripts/update-test-index.sh` is documented as implemented automation but is still a green no-op stub. | `docs/test/index.md:18`, `docs/test/matrix.md:13`, `scripts/update-test-index.sh:7`, `scripts/update-test-index.sh:36`, `scripts/update-test-index.sh:46` | Implement the script or make it fail loudly until implemented. Update docs if the inventory is manual-only. |

## Additional Observations

- Large files are not automatically defects, but several files have become
  aggregation points: `src/test/integration/markdown-flavor.test.ts`,
  `src/resolution/diagnostic-service.ts`, `src/completion/completion-router.ts`,
  `src/parser/types.ts`, `src/markdown-flavor/markdown-flavor-profiles.ts`,
  and `extension/src/extension.ts`.
- Generated website files are very large, which is expected, but they need a
  strong stale-generated-content gate because they are committed artifacts.
- Existing extension docs already recognize some stale `ofmarkdown`
  contribution risks. This audit treats them as active quality risks because
  current package contributions still contain the stale scopes.

## Suggested Remediation Order

1. Fix live document state freshness (`AUD-CQ-001`) and add regression tests.
2. Fix release/package blockers (`AUD-CQ-003`, `AUD-CQ-004`, `AUD-CQ-005`).
3. Repair test inventory automation and evidence semantics (`AUD-CQ-006`,
   `AUD-CQ-015`, `AUD-CQ-016`, `AUD-CQ-018`).
4. Centralize URI conversion and fix range/document-symbol edge cases
   (`AUD-CQ-002`, `AUD-CQ-007`, `AUD-CQ-008`, `AUD-CQ-009`).
5. Refactor flavor registries/providers after correctness issues are covered
   (`AUD-CQ-010`, `AUD-CQ-012`).

## Verification

This audit is documentation-only. No product code was changed by this audit.
Run these checks after editing this document:

```bash
bun run lint:docs
```
