---
title: Overall Security Quality Audit 2026-05-18
tags: [audits, security, code-quality, release, extension, website, server]
aliases: [Overall security quality audit]
updated: 2026-05-18
---

# Overall Security Quality Audit 2026-05-18

## Scope

Audited the current `flavor-grenade-lsp` repository only. Sibling repositories
were out of scope per `AGENTS.md`.

In scope:

- `src/`
- `extension/`
- `website/`
- `scripts/`
- `.github/workflows/`
- package manifests and lockfiles
- existing audit and test evidence where relevant

Out of scope:

- sibling repositories under `C:\Users\aaqui\obsidian-stack\`
- fixing findings
- repository settings that are not visible in the checked-out source, such as
  GitHub tag protection, environment reviewers, and branch protection

## Method

This audit followed the Codex Security scan phases at repository scope:

1. Threat model: trusted local user, potentially malicious workspace content,
   file URI/path boundaries, extension process launch, release workflows, Pages
   deploys, and generated website content.
2. Finding discovery: split across server/LSP, extension packaging/runtime, and
   website/scripts/workflows using subagents plus local sink scans.
3. Validation: checked source-to-sink paths, ran `npm audit --omit=dev --json`
   in `website/`, and used a small `path.join` reproduction for rename path
   escape.
4. Attack-path analysis: calibrated each candidate against reachable product or
   release surfaces and downgraded hardening-only items.

Subagent split:

- server, parser, vault, resolver, and LSP handlers;
- VS Code extension activation, command bridges, server command selection, and
  package verification;
- website, scripts, package manifests, dependency locks, and GitHub workflows.

## Executive Summary

The most important issue is a vault confinement break in `textDocument/rename`:
the requested new name flows into a `RenameFile` URI without rejecting path
segments such as `..` or `/`. A local client applying the returned workspace
edit can move a vault note outside the vault boundary.

The next tier is release and supply-chain quality: semver tag releases do not
show a source-controlled main-ancestry gate, website production dependencies
currently have npm audit advisories, and standalone binary releases lack the
checksum/provenance treatment already used by the extension VSIX release path.

No hardcoded secrets, `pull_request_target`, runtime shell-injection sink, or
website raw-HTML rendering sink was found in the reviewed surfaces.

## Findings

| ID | Severity | Area | Finding | Evidence | Validation | Recommended correction |
|---|---|---|---|---|---|---|
| SEC-AUD-001 | High | Server rename confinement | `textDocument/rename` can emit a `RenameFile` outside the vault when `newName` contains path separators or `..`. This violates the local-vault edit boundary. | `src/handlers/rename.handler.ts:329`, `src/handlers/rename.handler.ts:336`, `src/handlers/rename.handler.ts:340`, `src/handlers/rename.handler.ts:342`, `src/vault/doc-id.ts:40`. | Static trace plus reproduction: `path.join("C:/vault", "notes/../../outside.md")` resolves to `C:\outside.md`, and `path.relative("C:/vault", target)` is `..\outside.md`. | Validate rename names before building DocIds. Reject absolute paths, separators, `.`/`..`, NUL, drive prefixes, and extension-changing names unless explicitly supported. Re-check final `newUri` with vault confinement before returning the workspace edit. |
| SEC-AUD-002 | Medium | Watcher path confinement | `FileWatcher` uses lexical `startsWith` confinement and then reads files with `fs.promises.readFile`, while the initial scanner uses realpath confinement. A symlinked `*.md` created under the vault after startup can be followed and indexed. | `src/vault/file-watcher.ts:57`, `src/vault/file-watcher.ts:63`, `src/vault/file-watcher.ts:101`; contrast scanner control at `src/vault/vault-scanner.ts:146`. | Code trace confirms watcher does not call `confineExistingPathToVaultRoot` before reading changed Markdown files. | Use the same realpath confinement helper in watcher upsert and attachment paths before reading or indexing. Add symlink regression tests for create/change events. |
| SEC-AUD-003 | Medium | Vault scan DoS | Workspace-controlled `.flavor-grenade.toml` can expand document extensions, and scanner reads each matching file fully into memory before the parser size limit can return an empty index. | `src/vault/vault-scanner.ts:180`, `src/vault/vault-scanner.ts:190`, `src/vault/vault-scanner.ts:221`, `src/vault/vault-scanner.ts:270`; parser limit starts after read at `src/parser/ofm-parser.ts:45`. | Static trace confirms the file-count cap does not cap bytes and `readFile(..., "utf8")` occurs before `OFMParser.parse` checks text length. | Add a pre-read `stat.size` budget for document files, restrict configured extensions to text-like extensions, and report skipped oversized files. |
| SEC-AUD-004 | Medium | Release integrity | npm publish and standalone GitHub binary release are triggered from semver tags without a source-controlled main-ancestry gate. Website deploy has such a gate; npm/GitHub release do not. | `.github/workflows/ci.yml:6`, `.github/workflows/ci.yml:293`, `.github/workflows/ci.yml:295`, `.github/workflows/release.yml:4`, `.github/workflows/release.yml:80`; compare `.github/workflows/website-pages.yml:35` through `.github/workflows/website-pages.yml:39`. | Repository evidence does not show a workflow-level `git merge-base --is-ancestor "$GITHUB_SHA" origin/main` check for npm or binary releases. Hidden environment or tag protection may reduce risk but is not auditable here. | Add a production-tag ancestry gate to npm and binary release workflows. Keep environment approvals/tag protection, but do not rely on invisible controls alone. |
| SEC-AUD-005 | Medium | Website dependencies | `npm audit --omit=dev` reports production advisories for website runtime dependencies: `svelte@5.55.5` moderate XSS/ReDoS advisories and transitive `devalue@5.8.0` high DoS advisory. | `website/package.json:18`, `website/package-lock.json` entries for `svelte` and `devalue`; audit output cites `GHSA-pr6f-5x2q-rwfp`, `GHSA-f3cj-j4f6-wq85`, `GHSA-rcqx-6q8c-2c42`, `GHSA-9rmh-mm8f-r9h6`, and `GHSA-77vg-94rm-hx3p`. | Verified locally with `npm audit --omit=dev --json`; command exits non-zero with one high and one moderate production package finding. Reachability of SSR-specific Svelte issues is not proven because this site appears static/SPA. | Upgrade to fixed versions, then add a website production audit gate. Document any unreachable advisory suppressions with exact rationale if a fix is not immediately available. |
| SEC-AUD-006 | Low | Binary release provenance | Standalone binary release attaches compiled binaries without checksums or provenance attestations, unlike the extension VSIX release path. | `.github/workflows/release.yml:56`, `.github/workflows/release.yml:79`; VSIX path has checksum and attestation steps in `.github/workflows/extension-release.yml`. | Static workflow review. | Generate SHA-256 checksums for standalone binaries and add build provenance attestation before creating the GitHub release. |
| SEC-AUD-007 | Low | Website dependency policy | Exact dependency policy excludes `website/package.json`, where `tsx` and `zod` use ranged specs. | `scripts/check-exact-dependencies.mjs:6`, `website/package.json:31`, `website/package.json:36`, `.github/workflows/ci.yml:57`. | Static policy review. | Include `website/package.json` in the exact-dependency checker or document why website dependency ranges are acceptable. |
| SEC-AUD-008 | Low | Website CI install scripts | Website CI/release uses `npm ci` without `--ignore-scripts`, while lockfile dependencies include install-script packages. The job has limited GitHub permissions, but install scripts can still influence generated static artifacts. | `.github/workflows/website-pages.yml:60`, `.github/workflows/ci.yml:178`, `website/package-lock.json` install-script package entries. | Static workflow and lockfile review. | Prefer `npm ci --ignore-scripts` where possible. If build tooling requires scripts, isolate and document the required packages. |
| SEC-AUD-009 | Low | Extension command bridge hardening | Command bridges accept any `file:` URI and pass it to `showTextDocument` or `revealInExplorer`, rather than checking workspace or vault containment. This is hardening-only because no current server-generated exploit path was found and another installed extension could open files directly. | `extension/src/command-bridges.ts:93`, `extension/src/command-bridges.ts:112`, `extension/src/command-bridges.ts:279`, `extension/src/test/suite/command-bridges.test.js:46`. | Static command path review. | Validate bridge payloads against current workspace folders or server-reported vault root before opening or revealing files. |
| SEC-AUD-010 | Low | Support info privacy | "Sanitized" diagnostic copy still includes full `vaultRoot` and raw `lastError`, which can expose local usernames, private directory names, or unredacted server error text in support logs. | `extension/src/status-presentation.ts:92`, `extension/src/status-presentation.ts:138`, `extension/src/status-presentation.ts:143`, `extension/src/extension.ts:340`. | Static trace from status population to copied diagnostics. | Redact home directory/user segments, shorten vault root to basename plus hash, and classify server errors before copying them. |

## Suppressed Or Non-Reportable Candidates

| Candidate | Disposition | Rationale |
|---|---|---|
| Website generated HTML XSS | Suppressed | The content compiler generates `bodyHtml`, but the Svelte app renders derived `sections` with normal escaped text and no `{@html}` or `innerHTML` sink was found. |
| Runtime shell injection | Suppressed | Extension runtime passes command/args through `LanguageClient` server options; reviewed scripts use fixed commands or argument arrays. No attacker-controlled shell string sink was found. |
| Workspace `flavorGrenade.server.path` hijack | Suppressed | Workspace values are ignored; the extension uses only the machine/global setting and warns on workspace-configured values. |
| Hardcoded secrets | Suppressed | Secret scans found documentation and workflow secret references only, not committed credential values. |
| `pull_request_target` workflow exposure | Suppressed | No `pull_request_target` trigger was found. |
| Package-target verification only proves Windows VSIX locally | Low hardening, not separate release vulnerability | The unit verifier packages only `win32-x64`, but the release build later inspects each matrix VSIX with the matrix target. The local verifier still gives incomplete pre-release confidence. |

## Positive Controls Observed

- GitHub Actions use pinned action SHAs.
- CI top-level permissions are read-only except for scoped publish/deploy jobs.
- Extension launch blocks restricted and virtual workspaces.
- Workspace `server.path` values are ignored.
- Markdown target classification rejects unsupported schemes and `..` paths.
- Create-missing-file code actions confine generated files under the detected
  vault root.
- Initial vault scan uses realpath confinement for existing files.
- Parser returns empty indexes for documents over the parser character budget.
- Website renderer does not use raw HTML rendering for docs pages.
- Extension VSIX release has checksums, provenance attestation, and a Windows
  binary smoke test.

## Recommended Remediation Order

1. Fix `textDocument/rename` name validation and final URI confinement.
2. Reuse scanner realpath confinement in the watcher.
3. Add file byte budgets before scanner reads and constrain custom document
   extensions.
4. Add main-ancestry gates and checksum/provenance controls to npm and binary
   release paths.
5. Upgrade vulnerable website production dependencies and add an audit gate.
6. Extend dependency policy and install-script controls to the website package.
7. Redact copied diagnostics and tighten extension command bridge file URI
   acceptance.

## Verification

- `npm audit --omit=dev --json` was run in `website/` and returned production
  dependency advisories.
- A Node path reproduction confirmed that an unvalidated DocId segment can
  escape `C:\vault` through `path.join`.
- Documentation lint should be run after this file is added:
  `bun run lint:docs`.
