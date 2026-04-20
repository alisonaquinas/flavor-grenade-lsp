---
title: Verification Test Plans — Index
tags: [test/verification, test/index]
aliases: [Verification Test Index, FR Verification Index]
---

# Verification Test Plans — Index

> [!INFO] Verification plans trace directly to Planguage functional requirement tags. Each plan contains one test case section per requirement tag (`TC-VER-DOMAIN-NNN`). Steps are derived from the requirement's `Meter` field; pass/fail criteria come from `Goal` and `Fail`. Plans include both **scripted** (Gherkin / Bash) and **agent-driven** (LLM agent over JSON-RPC) test cases.

Source requirements: [[requirements/index]]

---

## Verification Plan Catalog

| File | Domain | TC Prefix | Planguage Domains Covered | # TC-VER Entries |
|---|---|---|---|---|
| [[tests/verification/verify-wiki-link-resolution]] | Wiki-Link Resolution | `TC-VER-WIKI` | Link.Wiki.*, Link.Resolution.*, Link.Inline.* | 5 |
| [[tests/verification/verify-embed-resolution]] | Embed Resolution | `TC-VER-EMBD` | Embed.Resolution.*, Embed.HeadingEmbed.*, Embed.BlockEmbed.* | 4 |
| [[tests/verification/verify-tag-indexing]] | Tag Indexing | `TC-VER-TAG` | Tag.Index.*, Tag.Hierarchy.*, Tag.YAML.*, Tag.Completion.* | 4 |
| [[tests/verification/verify-block-references]] | Block References | `TC-VER-BLOK` | Block.Anchor.*, Block.CrossRef.*, Block.Completion.* | 4 |
| [[tests/verification/verify-completions]] | Completions | `TC-VER-COMP` | Completion.Candidates.*, Completion.Trigger.*, Completion.CalloutType.*, Completion.WikiStyle.* | 4 |
| [[tests/verification/verify-diagnostics]] | Diagnostics | `TC-VER-DIAG` | Diagnostic.Severity.*, Diagnostic.Code.*, Diagnostic.Debounce.*, Diagnostic.Ambiguous.*, Diagnostic.SingleFile.* | 6 |
| [[tests/verification/verify-navigation]] | Navigation | `TC-VER-NAV` | Navigation.Definition.*, Navigation.References.*, Navigation.CodeLens.* | 3 |
| [[tests/verification/verify-rename]] | Rename | `TC-VER-REN` | Rename.Refactoring.*, Rename.Prepare.*, Rename.StyleBinding.* | 3 |
| [[tests/verification/verify-workspace]] | Workspace | `TC-VER-WS` | Workspace.VaultDetection.*, Workspace.FileExtension.*, Workspace.MultiFolder.* | 4 |
| [[tests/verification/verify-configuration]] | Configuration | `TC-VER-CFG` | Config.Precedence.*, Config.Validation.*, Config.Fault.*, Config.TextSync.* | 4 |
| [[tests/verification/verify-code-quality]] | Code Quality | `TC-VER-QUAL` | Quality.SOLID.*, Quality.Coherence.*, Quality.Coupling.*, Quality.Docs.*, Quality.Lint.*, Quality.Types.*, Quality.TDD.* | 8 |
| [[tests/verification/verify-ci-cd]] | CI/CD | `TC-VER-CICD` | CICD.Workflow.*, CICD.Markdown.*, CICD.Publish.*, CICD.PreCommit.* | 6 |
| [[tests/verification/verify-development-process]] | Development Process | `TC-VER-PROC` | Process.Branching.*, Process.Testing.*, Process.TestIndex.*, Process.Scripts.*, Process.BinaryFiles.* | 5 |
| [[tests/verification/verify-security-parser]] | Security — Parser Safety | `TC-VER-SECP` | Security.Parser.* | 5 |
| [[tests/verification/verify-security-vault-confinement]] | Security — Vault Confinement | `TC-VER-SECV` | Security.Vault.* | 4 |
| [[tests/verification/verify-security-input-validation]] | Security — Input Validation | `TC-VER-SECI` | Security.Input.* | 3 |
| [[tests/verification/verify-security-supply-chain]] | Security — Supply Chain | `TC-VER-SECS` | Security.Supply.* | 5 |
| [[tests/verification/verify-security-information-disclosure]] | Security — Information Disclosure | `TC-VER-SECD` | Security.Disclosure.*, Security.Config.NoCodeExecution | 3 |

**Total entries:** 80 TC-VER cases across 18 plans

---

## ID Scheme

`TC-VER-<DOMAIN>-NNN` where `<DOMAIN>` is the 2–4 letter abbreviation shown in the TC Prefix column above. Numbers are local to each plan (001, 002, …).

---

## Verification by Category

### LSP Feature Verification (runtime — JSON-RPC)

| Domain | File | # Cases |
|---|---|---|
| Wiki-Link Resolution | [[tests/verification/verify-wiki-link-resolution]] | 5 |
| Embed Resolution | [[tests/verification/verify-embed-resolution]] | 4 |
| Tag Indexing | [[tests/verification/verify-tag-indexing]] | 4 |
| Block References | [[tests/verification/verify-block-references]] | 4 |
| Completions | [[tests/verification/verify-completions]] | 4 |
| Diagnostics | [[tests/verification/verify-diagnostics]] | 6 |
| Navigation | [[tests/verification/verify-navigation]] | 3 |
| Rename | [[tests/verification/verify-rename]] | 3 |
| Workspace | [[tests/verification/verify-workspace]] | 4 |
| Configuration | [[tests/verification/verify-configuration]] | 4 |

### Process / Static Verification (Bash / CI tooling)

| Domain | File | # Cases |
|---|---|---|
| Code Quality | [[tests/verification/verify-code-quality]] | 8 |
| CI/CD | [[tests/verification/verify-ci-cd]] | 6 |
| Development Process | [[tests/verification/verify-development-process]] | 5 |

### Security Verification (adversarial — agent-driven)

| Domain | File | # Cases |
|---|---|---|
| Parser Safety | [[tests/verification/verify-security-parser]] | 5 |
| Vault Confinement | [[tests/verification/verify-security-vault-confinement]] | 4 |
| Input Validation | [[tests/verification/verify-security-input-validation]] | 3 |
| Supply Chain | [[tests/verification/verify-security-supply-chain]] | 5 |
| Information Disclosure | [[tests/verification/verify-security-information-disclosure]] | 3 |

---

## BDD Gap Notes

The following plans contain test cases with no matching BDD scenario at time of authoring (flagged `BDD gap` within the file):

- [[tests/verification/verify-configuration]] — all 4 TC-VER-CFG entries (no `configuration.feature` exists yet)
- [[tests/verification/verify-diagnostics]] — TC-VER-DIAG-004 (latency timing; agent-driven only)
- [[tests/verification/verify-security-parser]] — some adversarial entries
- [[tests/verification/verify-security-vault-confinement]] — path-traversal entries
- [[tests/verification/verify-security-input-validation]] — all entries

See [[bdd/index]] for the current BDD feature file inventory.

---

## Related Indexes

- [[tests/integration/index]] — E2E smoke plans (TC-SMOKE-*)
- [[tests/validation/index]] — User-level validation plans (TC-VAL-*)
- [[requirements/index]] — Master Planguage requirement tag list
- [[test/matrix]] — Pass/fail tracking for all test files
- [[test/index]] — Master list of all test files in the suite
