---
title: Execution Ledger — Phase Status Tracker
tags: [planning, phases, ledger, status]
project: flavor-grenade-lsp
updated: 2026-05-13
---

# Execution Ledger

This ledger tracks the status of every implementation phase for `flavor-grenade-lsp`. Each phase has a single verifiable gate condition. A phase is **complete** only when its gate passes in CI, not just locally.

---

## Phase Status Table

| Phase | Title                    | Status        | Gate                                               | Started    | Completed |
|-------|--------------------------|---------------|----------------------------------------------------|------------|-----------|
| 0     | Documentation Scaffold   | ✅ complete    | All docs/ files written and committed              | 2026-04-16 | 2026-04-17 |
| 1     | Project Scaffold         | ✅ complete    | `bun run build` exits 0; `bun test` exits 0        | 2026-04-17 | 2026-04-17 |
| 2     | LSP Transport            | ✅ complete    | `initialize` handshake roundtrip passes            | 2026-04-17 | 2026-04-17 |
| 3     | OFM Parser               | ✅ complete    | `bun test src/parser/**` all pass; @smoke BDD pass | 2026-04-17 | 2026-04-17 |
| 4     | Vault Index              | ✅ complete    | `bun test src/vault/**` all pass; vault-detection @smoke pass | 2026-04-17 | 2026-04-17 |
| 5     | Wiki-Link Resolution     | ✅ complete    | wiki-links.feature all pass; FG001/FG002/FG003 pass | 2026-04-17 | 2026-04-17 |
| 6     | Tags                     | ✅ complete    | tags.feature all scenarios pass                    | 2026-04-17 | 2026-04-17 |
| 7     | Embeds                   | ✅ complete    | embeds.feature all scenarios pass                  | 2026-04-17 | 2026-04-17 |
| 8     | Block References         | ✅ complete    | block-references.feature all scenarios pass        | 2026-04-17 | 2026-04-17 |
| 9     | Completions              | ✅ complete    | completions.feature all scenarios pass             | 2026-04-17 | 2026-04-17 |
| 10    | Navigation               | ✅ complete    | navigation.feature all scenarios pass              | 2026-04-17 | 2026-04-17 |
| 11    | Rename                   | ✅ complete    | rename.feature all scenarios pass                  | 2026-04-17 | 2026-04-17 |
| 12    | Code Actions             | ✅ complete    | code-actions.feature pass; diagnostics.feature @FG006 pass; workspace-symbol and semantic-token unit tests pass | 2026-04-17 | 2026-04-17 |
| 13    | CI & Delivery            | ✅ complete    | CI green on all PRs; binary artifacts published    | 2026-04-17 | 2026-04-17 |
| 14    | Markdown Link Intelligence | ✅ complete | Local standard Markdown links resolve, diagnose, navigate, reference, and rename like OFM heading links | 2026-05-06 | 2026-05-06 |
| 15    | Attachment Intelligence  | ✅ complete | Attachment refs complete, diagnose, navigate, and hover with vault metadata | 2026-05-06 | 2026-05-06 |
| 16    | Vault File Operation Refactors | ✅ complete | File/folder moves rewrite local reference forms atomically | 2026-05-06 | 2026-05-06 |
| 17    | Structural LSP Capabilities | ✅ complete | Document links, folding ranges, and selection ranges reflect OFMarkdown structure | 2026-05-07 | 2026-05-07 |
| 18    | Security Hardening Audit | 🔎 in-review | Security audit findings have passing tests, exact pinning, and CI checks | 2026-05-08 | [PR #68](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/68) |
| 19    | Markdown Flavor Model And Profiles | 🔎 in-review | Canonical flavor id contract and source-backed dialect profile registry | 2026-05-13 | [PR #69](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/69) |
| 20    | Markdown Flavor Server Propagation | 🔎 in-review | Effective flavor reaches server configuration, parsing, diagnostics, and integration tests | 2026-05-13 | [PR #70](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/70) |
| 21    | Markdown Flavor BDD Verification And Validation | 🔎 in-review | BDD, verification, and validation evidence execute against flavor state | 2026-05-13 | [PR #71](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/71) |
| 22    | Original Markdown Language Support | 🔎 in-review | Historical Original Markdown parser and LSP behavior | 2026-05-13 | [PR #72](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/72) |
| 23    | CommonMark Language Support | 🔎 in-review | CommonMark parser and LSP behavior with standardized edge cases | 2026-05-13 | [PR #73](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/73) |
| 24    | Obsidian Flavor Language Support | 🔎 in-review | Existing OFM intelligence works as `obsidian` flavor without language-mode promotion | 2026-05-13 | [PR #75](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/75), stacked on [PR #74](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/74) |
| 25    | GitHub Flavored Markdown Language Support | 🔎 in-review | GFM tables, tasks, strikethrough, autolinks, and local LSP behavior | 2026-05-13 | [PR #76](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/76) |
| 26    | GitLab Flavored Markdown Language Support | 🔎 in-review | GLFM references, media conventions, and offline-testable GitLab syntax behavior | 2026-05-13 | [PR #77](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/77) |
| 27    | Pandoc Markdown Language Support | 🔎 in-review | Pandoc metadata, citations, math, attributes, and cross-reference intelligence | 2026-05-13 | [PR #78](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/78) |
| 28    | MultiMarkdown Language Support | 🔎 in-review | MultiMarkdown metadata, tables, footnotes, citations, and cross-references | 2026-05-13 | [PR #79](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/79) |
| 29    | MDX Flavor Language Support | 🔎 in-review | MDX flavor syntax support without taking over VS Code MDX language mode | 2026-05-13 | [PR #80](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/80) |
| 30    | kramdown Language Support | 🔎 in-review | kramdown attributes, definition lists, tables, math, and footnotes | 2026-05-13 | [PR #81](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/81) |
| 31    | Markdown Extra Language Support | 🔎 in-review | Markdown Extra tables, definition lists, footnotes, abbreviations, and attributes | 2026-05-13 | [PR #82](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/82) |
| 32    | R Markdown Language Support | 🔎 in-review | R Markdown metadata and chunk syntax without code execution | 2026-05-13 | [PR #83](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/83) |
| 33    | Reddit Markdown Language Support | 🔎 in-review | Reddit platform Markdown syntax awareness and portability diagnostics | 2026-05-13 | [PR #84](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/84) |
| 34    | Stack Overflow Markdown Language Support | 🔎 in-review | Stack Overflow technical-writing Markdown and platform syntax awareness | 2026-05-13 | [PR #85](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/85) |
| 35    | Markdown Flavor Config Files Implementation | 🚧 active | `.mdfignore` and `.mdfattributes` drive visibility and effective Markdown context end to end | — | `feature/mdf-config-implementation` |
| R     | Publishing Research      | ✅ complete    | Research report written and committed              | 2026-04-21 | 2026-04-21 |
| E1    | Extension Scaffold       | ✅ complete    | `npm run build:extension` exits 0; `dist/extension.js` produced | 2026-04-22 | 2026-04-22 |
| E2    | LanguageClient Core      | ✅ complete    | Extension activates and spawns server in Extension Development Host | 2026-04-22 | 2026-04-22 |
| E3    | Status Bar & Commands    | ✅ complete    | Commands in palette; status bar reflects server state | 2026-04-22 | 2026-04-22 |
| E4    | Packaging & Local Test   | ✅ complete    | `vsce package` produces installable VSIX; manual test passes | 2026-04-22 | 2026-04-22 |
| E5    | CI/CD Pipeline           | ✅ complete    | All 7 platform-specific VSIXs build on tag push    | 2026-04-22 | 2026-04-22 |
| E6    | OFMarkdown Language Mode | ✅ complete | Dynamic `ofmarkdown` mode for vault/index documents | 2026-05-06 | 2026-05-07 |
| E7    | Activation Precision And Startup Gating | ✅ complete | Vault-marker activation and generic Markdown idle startup | 2026-05-07 | 2026-05-07 |
| E8    | Command Bridges And Native Navigation | ✅ complete | Native VS Code references, follow-link, embed, backlink, outlink, and vault commands | 2026-05-07 | 2026-05-07 |
| E9    | Extension Host Regression Harness | ✅ complete | Extension-host tests cover activation, commands, language mode, status, and failure states | 2026-05-07 | 2026-05-07 |
| E10   | Status UX And Troubleshooting | ✅ complete | Rich status tooltip, error states, quick actions, and diagnostic collection | 2026-05-07 | 2026-05-07 |
| E11   | Marketplace Evidence And Packaging Proof | ✅ complete | OFMarkdown visuals are present, referenced, and included in packaged VSIXs | 2026-05-07 | 2026-05-07 |
| E12   | OFMarkdown Editor Contributions | ✅ complete | Snippets, keybindings, and language configuration are scoped to `ofmarkdown` | 2026-05-07 | 2026-05-07 |
| E13   | Workspace Environment Modes | ✅ complete | Restricted, virtual, remote, WSL, SSH, and Dev Container behavior is explicit | 2026-05-07 | 2026-05-07 |
| E14   | Membership Refresh And Compatibility Guardrails | ✅ complete | Language-mode refresh and packaged client/server compatibility checks pass | 2026-05-07 | PR #46 CI green |
| E15   | Markdown Flavor Selector And Settings | 🔎 in-review | Separate selector, settings schema, override persistence, auto detection, and server propagation | 2026-05-13 | [PR #74](https://github.com/alisonaquinas/flavor-grenade-lsp/pull/74) |
| E16   | Flavor-Scoped Contributions And Marketplace | ⏳ planned | Editor contributions and Marketplace proof align with Markdown flavor selection | — | — |
| E17   | Extension Flavor Host Verification | ⏳ planned | Extension-host, CI, and validation evidence prove selector behavior | — | — |
| W1    | Website Foundation And Toolchain | ✅ complete | Website dev, typecheck, lint, test, and build scripts pass from `website/` | 2026-05-09 | PR #51 CI green |
| W2    | Content Pipeline And SEO Skeleton | ✅ complete | Static pages build with typed routes, metadata, sitemap, robots, and SEO checks | 2026-05-09 | PR #52 CI green |
| W3    | Homepage And Design System | ✅ complete | Homepage, theme modes, responsive shell, product assets, and footer pass tests and visual smoke checks | 2026-05-09 | PR #53 CI green |
| W4    | Documentation Pages And LLM Wiki | ✅ complete | Quickstart, how-to, advanced usage, FAQ, and concept wiki pages build and pass content checks | 2026-05-09 | PR #54 CI green |
| W5    | Website CI And Pages Release | ✅ complete | Website CI and Pages release automation pass PR CI; production release execution was cancelled | 2026-05-09 | PR #55/#56 CI green; release tag cancelled |
| W6    | Website Review Polish | ✅ complete | Browser-reviewed homepage visual feedback is implemented, tested, and verified on mobile and desktop | 2026-05-09 | PR #58 CI green |
| W7    | Website Guide Prose And Article Hubs | ✅ complete | How-to, concept, and advanced article pages build with dropdown navigation, linked hub pages, concrete prose, and asset evidence | 2026-05-09 | PR #61 CI green |
| W8    | Commonloom Content Pipeline | ✅ complete | TASK-279 removed `website/src/content/pipeline/commonloom`; full local W8 gate and PR #65 CI run `25705556117` passed. Prior PR #64 merged at `9569e37` with green CI. | 2026-05-10 | 2026-05-12 |
| S1    | Flavor Grenade LSP Skill Product | ⏳ planned | Versioned skill artifacts install locally, wrap the native executable, and publish through a separate skill release flow | — | — |

---

## Near-Term Roadmap

Evaluated 2026-05-13. The most coherent order from the current stack point is:

1. Finish the server flavor chain in dependency order: Phase 27 → Phase 28 → Phase 29 → Phase 30 → Phase 31 → Phase 32 → Phase 33 → Phase 34.
2. Defer Phase E16 and Phase E17 until after Phase 34 unless a reviewer explicitly asks for extension flavor UX sooner.
3. Keep website phases closed; no W-phase work is on the critical path for flavor support.

Reason: Phases 27-34 share the same parser/profile/LSP surface pattern, and keeping them contiguous reduces profile drift. Phase E16/E17 depend on the flavor selector baseline from E15, which is already in review, but their marketplace and host-verification work is cleaner once all server flavor surfaces are stable.

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| 🔄 in-progress | Work has started; gate not yet passing |
| 🔎 in-review | PR open or review pending; final merge evidence not yet recorded |
| ✅ complete | Gate verified passing in CI |
| ⏳ planned | Work not yet started; prerequisites not met |
| 🚫 blocked | Blocked by an unresolved dependency or decision |
| ↩ rolled-back | Gate was failing; phase reverted for rework |

---

## How to Mark a Phase Complete

1. Verify the gate command passes in CI (not just locally):

   ```bash
   # Example for Phase 3
   bun test src/parser/**
   bun run bdd
   ```

2. Update the row in this table:
   - Change **Status** from `⏳ planned` / `🔄 in-progress` to `✅ complete`
   - Set **Completed** to today's date in `YYYY-MM-DD` format
   - Do NOT modify the **Started** date retroactively
3. Commit the ledger change with the message:

   ```text
   chore(ledger): mark Phase N complete — <gate summary>
   ```

4. Open a PR if the phase was worked on a feature branch. Link the PR number in the table's Notes column (add if needed).

A phase is **not** complete if:

- Gate passes locally but CI is red
- The PR CI gate in `.github/workflows/ci.yml` is red or pending
- A touched release, binary, extension, or platform package gate is red or pending on any required target platform
- BDD scenarios pass but unit tests are skipped

---

## How to Mark a Phase as Started

1. Update **Status** to `🔄 in-progress`
2. Set **Started** to today's date
3. Commit:

   ```text
   chore(ledger): begin Phase N — <title>
   ```

---

## Responsibility Model

| Task | Responsible Party |
|------|-------------------|
| Writing implementation code | AI agent (Claude Code) |
| Writing test assertions | AI agent (Claude Code) |
| Verifying gate in CI | Automated CI (GitHub Actions) |
| Human review of PR | Human reviewer (<alisonaquinas@gmail.com>) |
| Marking phase complete | AI agent after CI confirms green, human approves |
| Architectural decisions (ADRs) | Human reviewer, recorded in `docs/adr/` |
| Rollback decisions | Human reviewer |

The AI agent must NOT mark a phase complete without CI confirmation. The CI gate is authoritative.

---

## Phase Dependencies

```text
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
                                         │              │
                                         ▼              ▼
                                      Phase 5 ◄──── Phase 4
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
                 Phase 6             Phase 7             Phase 8
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         ▼
                                     Phase 9 ──► Phase 10 ──► Phase 11
                                                                    │
                                                                 Phase 12 ──► Phase 13
                                                                    │
                                                                 Phase 14 ──► Phase 15 ──► Phase 16 ──► Phase 17 ──► Phase 18
                                                                                                      │
                                                                                                      ▼
                                                                 Phase 19 ──► Phase 20 ──► Phase 21 ──► Phase 22 ──► Phase 23 ──► Phase E15 ──► Phase 24 ──► Phase 25 ──► Phase 26
                                                                                                      │
                                                                                                      ▼
                                             Phase 27 ──► Phase 28 ──► Phase 29 ──► Phase 30 ──► Phase 31 ──► Phase 32 ──► Phase 33 ──► Phase 34
```

Phases 6, 7, and 8 may proceed in parallel once Phase 5 is complete. Phase 9 requires Phases 6, 7, and 8.

```text
Extension Phases:

Phase R ──► Phase E1 ──► Phase E2 ──► Phase E3
                                          │
                                       Phase E4 ──► Phase E5 ──► Phase E6
                                                                  │
                                                                  ▼
                                      Phase E7 ──► Phase E8 ──► Phase E9
                                                                  │
                                                                  ▼
                                     Phase E10 ─► Phase E11 ─► Phase E12
                                                                  │
                                                                  ▼
                                                Phase E13 ───► Phase E14 ──► Phase E15 ──► Phase E16 ──► Phase E17

Server cross-links:
Phase 19 ──► Phase E15
Phase 20 ──► Phase E15
Phase E15 ─► Phase 24
Phase E15 ─► Phase 29
Phase 20 ──► Phase E17
```

Extension phases mostly track separately from the server phases, but the
Markdown flavor extension phases have explicit server dependencies: Phase E15
requires the Phase 19 flavor model and Phase 20 server propagation contract.
Phase 24 requires Phase E15 because Obsidian flavor support must be exercised
through the selector/settings contract rather than the retired `ofmarkdown`
language-mode promotion path. Phase 29 also requires Phase E15 because MDX is a
selector flavor while the VS Code language id remains unchanged. Phase E17
requires Phase 20 so host tests can verify client-to-server refresh behavior.
Phase R (Publishing Research) is the entry point. Phase E7-E14 are the Marksman
VSCode feature-parity continuation phases for OFMarkdown-specific client
behavior. Phase E15-E17 supersede the historical `ofmarkdown` promotion target
with the ADR020 Markdown flavor selector model.

```text
Website Phases:

Phase E14 ──► Phase W1 ──► Phase W2 ──► Phase W3 ──► Phase W4 ──► Phase W5 ──► Phase W6 ──► Phase W7 ──► Phase W8
```

Website phases use `W`-prefixed numbering to distinguish them from server and
extension implementation tracks. Phase W1 depends on the completed extension
baseline because the public website documents both the LSP server and VS Code
extension. Phase W8 depends on W7 because it migrates the existing article hubs
and public copy into the Commonloom Markdown pipeline.

```text
Skill Product Phases:

Phase 34 ──► Phase S1
Native executable release pipeline ──► Phase S1
```

Skill product phases use `S`-prefixed numbering to distinguish separately
versioned and separately released LLM skill artifacts from server, extension,
and website work. Phase S1 packages a runtime-specific native executable behind
agent-friendly wrappers and owns its own changelog, version, release tags, and
release workflow.

---

## Notes

- Phase 0 is the only phase that the AI agent can mark complete without CI (it is documentation-only).
- Phases 1–13 all require CI to be configured (Phase 13 bootstraps CI itself; phases 1–12 use a local gate script in the interim).
- If CI is not yet running, use `bun run gate:N` scripts defined in `package.json` as interim gates.
- Extension phases use `E`-prefixed numbering (E1–E17) to distinguish from server phases (0–34). Extension phases do not use the `bun run gate:N` pattern — gates are verified differently (npm scripts, manual smoke tests, CI workflow).
- Website phases use `W`-prefixed numbering (W1–W8). Their gates are verified
  with website-local npm scripts, repository docs lint, and GitHub Actions
  evidence once CI is wired.
- Skill product phases use `S`-prefixed numbering. Their gates are verified
  with skill-local tests, native executable install smoke tests, package
  assembly checks, and separate skill release workflow evidence.
