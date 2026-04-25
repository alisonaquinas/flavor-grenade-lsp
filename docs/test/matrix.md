---
title: Requirements × Tests Matrix
tags:
  - test/matrix
aliases:
  - Traceability Matrix
  - Requirements Coverage Matrix
---

# Requirements × Tests Matrix

> [!NOTE] Auto-update
> Auto-update via `scripts/update-test-index.sh` (stub until Phase 3; fully implemented in Phase 3). Always commit matrix updates in the same commit as the test that triggered them.

This matrix maps every Planguage requirement tag to the test files that provide evidence for it, the current coverage status, the phase in which coverage was introduced, and any notes about partial coverage or deferred work.

**Status legend:**

| Status | Meaning |
|---|---|
| ⏳ planned | Requirement defined; no test written yet |
| 🔴 failing | Test written; currently fails (RED phase) |
| ✅ passing | Test written and passing (GREEN phase) |
| ⬜ not-yet-written | Phase for this requirement not started |

---

## Code Quality Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Quality.SOLID.SingleResponsibility` | Each class has exactly one reason to change | — | ⏳ planned | Phase 1 | Verified by design review and ESLint rules, not by a dedicated test file |
| `Quality.SOLID.DependencyInversion` | Cross-module deps point to abstractions, not concretes | — | ⏳ planned | Phase 1 | Enforced by ESLint `import/no-internal-modules`; no separate test file |
| `Quality.Coherence.OneClassPerFile` | Each non-barrel `.ts` file exports exactly one primary entity | — | ⏳ planned | Phase 1 | Enforced by ESLint; no separate test file |
| `Quality.Coupling.ModuleBoundaries` | Cross-module imports only via barrel `index.ts` | — | ⏳ planned | Phase 1 | Enforced by ESLint `import/no-internal-modules` |
| `Quality.Docs.Docstrings` | All exported symbols carry JSDoc docstrings | — | ⏳ planned | Phase 1 | Enforced by `eslint-plugin-jsdoc`; verified by `bun run lint` |
| `Quality.Lint.ZeroWarnings` | All linters produce 0 errors and 0 warnings | — | ⏳ planned | Phase 1 | Verified by `bun run lint --max-warnings 0`; gate script |
| `Quality.Types.StrictMode` | TypeScript strict mode; `tsc --noEmit` exits 0 | — | ⏳ planned | Phase 1 | Verified by `bun run typecheck`; gate script |
| `Quality.TDD.StrictRedGreen` | Every implementation preceded by a failing test | — | ⏳ planned | Phase 1 | Verified by git log discipline; red commit before green commit |

---

## CI/CD Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `CICD.Workflow.PRGate` | Every PR must pass all CI checks before merge | — | ⏳ planned | Phase 13 | Enforced by GitHub branch protection; not a unit test |
| `CICD.Markdown.DocsFolderLinting` | `docs/` markdown linted by markdownlint-obsidian in CI | — | ⏳ planned | Phase 13 | Verified by CI `markdown-lint-docs` job |
| `CICD.Markdown.SourceLinting` | Non-docs markdown linted by markdownlint-cli2 in CI | — | ⏳ planned | Phase 13 | Verified by CI `markdown-lint-other` job |
| `CICD.Publish.OIDC` | Publishing uses OIDC provenance attestation | — | ⏳ planned | Phase 13 | Verified by `npm audit signatures` post-publish |
| `CICD.Publish.Trigger` | Publish triggered only by semver tag push to `main` | — | ⏳ planned | Phase 13 | Enforced by `publish.yml` `on: push: tags:` trigger |
| `CICD.PreCommit.Gate` | `lefthook` pre-commit runs typecheck + lint + format + test | — | ⏳ planned | Phase 1 | Verified by `lefthook install` + commit attempt |

---

## Development Process Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Process.Branching.MainReleasesOnly` | `main` receives only release/hotfix merges | — | ⏳ planned | Phase 13 | Enforced by branch protection; not a unit test |
| `Process.Testing.DirectoryStructure` | All tests under `tests/`, never under `src/` | — | ⏳ planned | Phase 1 | Verified by `find src/ -name '*.spec.ts'` returning empty |
| `Process.TestIndex.Matrix` | `docs/test/matrix.md` updated for every new test file | — | ⏳ planned | Phase 1 | Enforced by PR review checklist in `.github/CONTRIBUTING.md` |
| `Process.Scripts.Automation` | Repetitive procedures automated in `scripts/` | — | ⏳ planned | Phase 1 | Advisory metric; verified by `scripts/` directory content |
| `Process.BinaryFiles.LFS` | All binary files tracked via Git LFS | — | ⏳ planned | Phase 1 | Verified by `git lfs ls-files` vs `git ls-files` cross-check |

---

## Wiki-Link Resolution Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Link.Wiki.StyleBinding` | Completions/renames match configured wiki link style | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Wiki.AliasResolution` | YAML `aliases:` values are valid link targets | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Resolution.ModeScope` | Single-file mode suppresses cross-file link resolution | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Inline.URLSkip` | Inline links to non-markdown URLs produce no FG001 | — | ⬜ not-yet-written | Phase 5 | |
| `Link.Resolution.IgnoreGlob` | `.gitignore`-matched files absent from completions | — | ⬜ not-yet-written | Phase 5 | |

---

## Embed Resolution Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Embed.Resolution.MarkdownTarget` | `![[file.md]]` embeds resolve to VaultIndex docs | — | ⬜ not-yet-written | Phase 7 | |
| `Embed.Resolution.ImageTarget` | `![[image.png]]` embeds produce no FG001 | — | ⬜ not-yet-written | Phase 7 | |
| `Embed.HeadingEmbed.Resolution` | `![[doc#heading]]` validates both doc and heading | — | ⬜ not-yet-written | Phase 7 | |
| `Embed.BlockEmbed.Resolution` | `![[doc#^blockid]]` validates anchor exists in target | — | ⬜ not-yet-written | Phase 7 | |

---

## Tag Indexing Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Tag.Index.Completeness` | All `#tag` occurrences indexed by VaultIndex | — | ⬜ not-yet-written | Phase 6 | |
| `Tag.Hierarchy.Awareness` | Tag index supports parent-tag queries | — | ⬜ not-yet-written | Phase 6 | |
| `Tag.YAML.Equivalence` | `tags:` frontmatter indexed identically to inline tags | — | ⬜ not-yet-written | Phase 6 | |
| `Tag.Completion.Unicode` | Tag completion supports Unicode and emoji | — | ⬜ not-yet-written | Phase 6 | |

---

## Block Reference Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Block.Anchor.Indexing` | All `^blockid` anchors appear in OFMIndex.blockAnchors | — | ⬜ not-yet-written | Phase 8 | |
| `Block.CrossRef.Diagnostic` | `[[doc#^nonexistent]]` produces FG005; suppressed in single-file mode | — | ⬜ not-yet-written | Phase 8 | |
| `Block.Completion.Offer` | After `[[doc#^`, completion offers known block IDs | — | ⬜ not-yet-written | Phase 8 | |
| `Block.Anchor.Lineend` | Only `^id` at end-of-line treated as block anchors | — | ⬜ not-yet-written | Phase 8 | |

---

## Completion Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Completion.Candidates.Cap` | Candidate list capped at `completion.candidates` config value | — | ⬜ not-yet-written | Phase 9 | |
| `Completion.Trigger.Coverage` | All trigger characters return candidates in context | — | ⬜ not-yet-written | Phase 9 | |
| `Completion.CalloutType.Coverage` | 13 primary Obsidian callout types offered at `> [!` | — | ⬜ not-yet-written | Phase 9 | |
| `Completion.WikiStyle.Binding` | Completion items conform to active wiki link style | — | ⬜ not-yet-written | Phase 9 | |

---

## Diagnostic Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Diagnostic.Severity.WikiLink` | FG001/FG002 carry Error severity | — | ⬜ not-yet-written | Phase 5 | |
| `Diagnostic.Severity.Embed` | FG004 carries Warning severity | — | ⬜ not-yet-written | Phase 7 | |
| `Diagnostic.Code.Assignment` | Each diagnostic carries its assigned FG-prefixed code | — | ⬜ not-yet-written | Phase 5 | |
| `Diagnostic.Debounce.Latency` | Diagnostics published within 500 ms of last change | — | ⬜ not-yet-written | Phase 5 | Performance test; requires instrumented LSP client |
| `Diagnostic.Ambiguous.RelatedInfo` | FG002 lists all duplicate definition locations in `relatedInformation` | — | ⬜ not-yet-written | Phase 5 | |
| `Diagnostic.SingleFile.Suppression` | All cross-file diagnostics suppressed in single-file mode | — | ⬜ not-yet-written | Phase 5 | |

---

## Navigation Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Navigation.Definition.AllLinkTypes` | Go-to-definition works for all link types | — | ⬜ not-yet-written | Phase 10 | |
| `Navigation.References.Completeness` | Find-references returns all references in folder | — | ⬜ not-yet-written | Phase 10 | |
| `Navigation.CodeLens.Count` | Each heading displays accurate reference count code lens | — | ⬜ not-yet-written | Phase 10 | |

---

## Rename Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Rename.Refactoring.Completeness` | All cross-document references updated in single workspace edit | — | ⬜ not-yet-written | Phase 11 | |
| `Rename.Prepare.Rejection` | `prepareRename` returns `null` for non-renameable positions | — | ⬜ not-yet-written | Phase 11 | |
| `Rename.StyleBinding.Consistency` | Rename updates only references bound via active wiki style | — | ⬜ not-yet-written | Phase 11 | |

---

## Workspace Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Workspace.VaultDetection.Primary` | Directories with `.obsidian/` auto-detected as vault roots | `tests/unit/lsp/lsp.module.spec.ts` | ⏳ planned | Phase 1 | Module smoke test only; full vault detection in Phase 4 |
| `Workspace.VaultDetection.Fallback` | Directories with `.flavor-grenade.toml` detected when `.obsidian/` absent | — | ⬜ not-yet-written | Phase 4 | |
| `Workspace.FileExtension.Filter` | Only configured-extension files enter the index | — | ⬜ not-yet-written | Phase 4 | |
| `Workspace.MultiFolder.Isolation` | Cross-root link resolution not performed between distinct vaults | — | ⬜ not-yet-written | Phase 4 | |

---

## Configuration Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Config.Precedence.Layering` | Project config overrides user config overrides built-in defaults | — | ⬜ not-yet-written | Phase 2 | |
| `Config.Validation.Candidates` | `completion.candidates` must be strictly positive; invalid values fall back | — | ⬜ not-yet-written | Phase 2 | |
| `Config.Fault.Isolation` | Malformed TOML dropped without crashing the server | — | ⬜ not-yet-written | Phase 2 | |
| `Config.TextSync.Default` | Absent `core.text_sync` defaults to `"full"` | — | ⬜ not-yet-written | Phase 2 | |

---

## Security Requirements — Parser Safety

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Parser.ReDoS` | All OFM parser regexes audited for catastrophic backtracking; super-linear patterns prohibited | — | ⬜ not-yet-written | Phase 3 | Static audit + fuzz tests; see ADR012 |
| `Security.Parser.ParseTimeout` | Any single vault file must complete parsing within 200 ms; timeouts produce empty results | — | ⬜ not-yet-written | Phase 3 | Requires timer injection in parser; see ADR012 |
| `Security.Parser.YAMLLimits` | YAML parsed with alias cap 50, size limit 64 KB, safe mode; parse failures are malformed frontmatter | — | ⬜ not-yet-written | Phase 3 | `js-yaml` safeLoad + maxAliases; see ADR012 |
| `Security.Parser.EmbedDepth` | Embed resolution detects cycles and enforces max depth 10; circular embeds produce FG005 | — | ⬜ not-yet-written | Phase 3 | Visited-URI set in recursive resolver; see ADR012 |
| `Security.Parser.VaultFileLimit` | Initial vault indexing stops at 50,000 files (configurable); client notified via `window/showMessage` | — | ⬜ not-yet-written | Phase 3 | Count in VaultIndex.buildIndex(); see ADR012 |

---

## Security Requirements — Vault Confinement

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Vault.PathConfinement` | All file paths from vault content or LSP params canonicalized and vault-root-checked before I/O | — | ⬜ not-yet-written | Phase 4 | `confineToVaultRoot()` function; see ADR013 |
| `Security.Vault.SymlinkConfinement` | Out-of-vault symlinks treated as non-existent; `fs.realpath()` checked, not symlink path | — | ⬜ not-yet-written | Phase 4 | `fs.realpath()` call in `confineToVaultRoot()`; see ADR013 |
| `Security.Vault.URISchemeAllowlist` | Only `file://` URIs accepted; non-`file://` URIs return InvalidParams (-32602) | — | ⬜ not-yet-written | Phase 2 | Transport-layer check before any resolver; see ADR013 |
| `Security.Vault.RenameConfinement` | Rename edit targets must pass vault-root confinement; escaping URIs cancel entire rename | — | ⬜ not-yet-written | Phase 11 | Defense-in-depth: independent of link resolver check; see ADR013 |

---

## Security Requirements — Input Validation

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Input.PositionValidation` | All `Position`/`Range` params validated as non-negative integers within document bounds | — | ⬜ not-yet-written | Phase 2 | Validated at handler boundary before VaultIndex access; see ADR013 |
| `Security.Input.PayloadSize` | JSON-RPC messages exceeding 10 MB rejected at transport; stdin closed without buffering | — | ⬜ not-yet-written | Phase 2 | `Content-Length` header check; see threat model §Sub-threat-2.2 |
| `Security.Input.PrototypePollution` | JSON-RPC bodies schema-validated before any merge; `__proto__` / `constructor.prototype` keys rejected | — | ⬜ not-yet-written | Phase 2 | Zod schema strips dangerous keys; see ADR013 |

---

## Security Requirements — Supply Chain

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Supply.ExactPinning` | All `package.json` dependencies use exact versions; range specifiers fail CI linting | — | ⏳ planned | Phase 1 | `bunfig.toml exact = true` + CI lint; see ADR014 |
| `Security.Supply.FrozenLockfile` | All CI `bun install` uses `--frozen-lockfile`; lockfile drift fails the build | — | ⏳ planned | Phase 1 | Verified in `ci.yml`; see ADR014 |
| `Security.Supply.IgnoreScripts` | All CI `bun install` uses `--ignore-scripts` CLI flag; `.npmrc` alone insufficient (Bun bypass) | — | ⏳ planned | Phase 1 | CLI flag required per ADR014; not `.npmrc` |
| `Security.Supply.AdvisoryMonitoring` | Direct dependency upgrades reviewed against security advisories; documented in audit log | — | ⬜ not-yet-written | Phase 13 | Process requirement; `docs/security/dependency-audit-log.md` |
| `Security.Supply.NoDevtoolsIntegration` | `@nestjs/devtools-integration` never added; ESLint `no-restricted-imports` enforces this | — | ⏳ planned | Phase 1 | `eslint.config.js` rule; see ADR014, CVE-2025-54782 |

---

## Security Requirements — Information Disclosure

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Security.Disclosure.LogSanitization` | Server logs never include vault document content; only paths, line numbers, codes permitted | — | ⬜ not-yet-written | Phase 2 | Logger wrapper strips content; see threat model §Sub-threat-4.1 |
| `Security.Disclosure.CompletionFilter` | Completion candidates from sensitive frontmatter keys (password, token, secret, api_key) filtered out | — | ⬜ not-yet-written | Phase 9 | Configurable blocked-key list; see threat model §Sub-threat-4.2 |
| `Security.Config.NoCodeExecution` | `.flavor-grenade.toml` schema never includes command/script/executable fields; no process spawning | — | ⏳ planned | Phase 1 | Schema inspection + crafted-config integration test; see ADR012 |

---

## VS Code Extension Requirements

| Planguage Tag | Requirement Gist | Test File(s) | Status | Phase | Notes |
|---|---|---|---|---|---|
| `Extension.Activation.Markdown` | Extension activates on `onLanguage:markdown` and spawns server | — | ⬜ not-yet-written | Phase E2 | Integration test; requires Extension Development Host |
| `Extension.Binary.Resolution` | 2-tier binary resolution: user setting → bundled path | — | ⬜ not-yet-written | Phase E2 | Unit test; mock `workspace.getConfiguration` |
| `Extension.Binary.PlatformSuffix` | `.exe` suffix appended on Windows, omitted on Unix | — | ⬜ not-yet-written | Phase E2 | Unit test; mock `process.platform` |
| `Extension.StatusBar.StateTransition` | Status bar text reflects all 4 server states (initializing, indexing, ready, error) | — | ⬜ not-yet-written | Phase E3 | Unit test; mock `flavorGrenade/status` notifications |
| `Extension.StatusBar.RestartReset` | Status bar resets to "Starting..." on client restart | — | ⬜ not-yet-written | Phase E3 | Unit test; trigger `onDidChangeState` |
| `Extension.Commands.Registration` | All 3 commands registered and callable via palette | — | ⬜ not-yet-written | Phase E3 | Unit test + integration test |
| `Extension.Commands.RebuildIndex` | `rebuildIndex` sends `workspace/executeCommand` to server | — | ⬜ not-yet-written | Phase E3 | Unit test; verify `sendRequest` call shape |
| `Extension.Lifecycle.Restart` | `flavorGrenade.server.path` config change triggers restart | — | ⬜ not-yet-written | Phase E3 | Integration test |
| `Extension.Lifecycle.CrashRecovery` | Server crash triggers automatic restart (up to 4 in 3 minutes) | — | ⬜ not-yet-written | Phase E3 | Integration test; default error handler behavior |
| `Extension.Lifecycle.CleanShutdown` | Deactivation stops client, server exits cleanly | — | ⬜ not-yet-written | Phase E3 | Integration test |
| `Extension.Packaging.VSIXContents` | VSIX contains only dist/, server/, manifest, and assets | — | ⬜ not-yet-written | Phase E4 | Manual verification; `unzip -l` inspection |
| `Extension.Packaging.VSIXInstall` | Local VSIX install succeeds and extension functions | — | ⬜ not-yet-written | Phase E4 | Manual smoke test |
| `Extension.CICD.MatrixBuild` | All 7 platform-specific VSIXs build on tag push | — | ⬜ not-yet-written | Phase E5 | CI verification; not a unit test |
| `Extension.CICD.MarketplacePublish` | Publish job succeeds with VSCE_PAT | — | ⬜ not-yet-written | Phase E5 | CI verification; not a unit test |

---

## Coverage Summary

| Phase | Total Tags in Scope | Tags with Tests | Coverage |
|---|---|---|---|
| Phase 1 (Scaffold) | 7 (quality gates) + 1 (vault detection smoke) + 5 (supply chain + no-exec) | 1 | 8% |
| Phase 2 (LSP Transport) | 4 (config) + 5 (input validation + URI scheme + log sanitization) | 0 | 0% |
| Phase 3 (OFM Parser) | 5 (parser safety) | 0 | 0% |
| Phase 4 (Vault Index) | 4 (workspace) + 2 (path + symlink confinement) | 0 | 0% |
| Phase 5 (Wiki-Links) | 5 + 6 (diagnostics) | 0 | 0% |
| Phase 6 (Tags) | 4 | 0 | 0% |
| Phase 7 (Embeds) | 4 | 0 | 0% |
| Phase 8 (Block Refs) | 4 | 0 | 0% |
| Phase 9 (Completions) | 4 + 1 (completion filter) | 0 | 0% |
| Phase 10 (Navigation) | 3 | 0 | 0% |
| Phase 11 (Rename) | 3 + 1 (rename confinement) | 0 | 0% |
| Phase 13 (CI/CD) | 5 + 1 (advisory monitoring) | 0 | 0% |
| Phase E1 (Extension Scaffold) | 0 | 0 | — (infrastructure only) |
| Phase E2 (LanguageClient Core) | 3 | 0 | 0% |
| Phase E3 (Status Bar & Commands) | 7 | 0 | 0% |
| Phase E4 (Packaging) | 2 | 0 | 0% |
| Phase E5 (CI/CD Pipeline) | 2 | 0 | 0% |
| **Total** | **94** | **1** | **1%** |

> [!NOTE]
> Coverage percentages will increase phase by phase. The goal at each phase gate is 100% coverage of requirements introduced in that phase.

---

## Related Documents

- [[test/index]] — Test file inventory (flat list by type)
- [[requirements/index]] — Master Planguage tag index
- [[requirements/code-quality]] — Code quality Planguage requirements
- [[requirements/ci-cd]] — CI/CD Planguage requirements
- [[requirements/development-process]] — Development process Planguage requirements
- [[plans/execution-ledger]] — Phase completion status
