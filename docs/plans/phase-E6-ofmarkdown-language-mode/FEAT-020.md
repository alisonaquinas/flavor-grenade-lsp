---
id: "FEAT-020"
title: "Dynamic OFMarkdown language mode"
type: feature
status: done
priority: "high"
phase: "E6"
created: "2026-05-03"
updated: "2026-05-07"
dependencies: ["FEAT-019"]
tags: [tickets/feature, "phase/E6"]
aliases: ["FEAT-020"]
---

# Dynamic OFMarkdown language mode

> [!INFO] `FEAT-020` · Feature · Phase E6 · Priority: `high` · Status: `done`

## Goal

When a VS Code user opens an Obsidian vault note, the editor recognizes it as **OFMarkdown** automatically. Generic Markdown remains Markdown, and manual language mode choices are preserved.

---

## Scope

**In scope:**

- VS Code language contribution for `ofmarkdown`

- Dynamic promotion from `markdown` to `ofmarkdown`

- Server-authoritative membership query for vault/index detection

- Markdown-compatible grammar/configuration for OFMarkdown

- Unit, integration, and manual smoke coverage

**Out of scope:**

- Changing server parser semantics

- Claiming all `.md` files as OFMarkdown

- Web extension support

- New user-visible commands unless needed for test harness support

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| User.Extension.RecognizeOFMarkdown | Have VS Code recognize vault notes as OFMarkdown | [[vscode-language-mode]] |
| User.Extension.PreserveMarkdown | Keep generic Markdown files in normal Markdown mode | [[vscode-language-mode]] |
| User.Extension.PreserveManualMode | Preserve manual language mode choices | [[vscode-language-mode]] |
| User.Extension.StableModeSwitch | Avoid flicker or restart loops during automatic recognition | [[vscode-language-mode]] |
| User.Extension.PreserveMarkdownEditing | Keep Markdown editing behavior after OFMarkdown promotion | [[vscode-language-mode]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| Extension.LanguageMode.Contribution | Contribute `ofmarkdown` without globally claiming `.md` files | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.DynamicAssignment | Promote qualifying vault/index documents | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.NonVaultIsolation | Preserve generic Markdown mode | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.UserOverrideSafety | Preserve manual non-Markdown selections | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.LoopSafety | Avoid assignment and restart loops | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.MarkdownParity | Preserve baseline Markdown editing behavior | [[requirements/ofmarkdown-language-mode]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | OFMarkdown language mode assignment scenarios |
| `docs/bdd/features/vscode-extension.feature` | Existing extension lifecycle scenarios updated for `ofmarkdown` selector coverage |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E6-ofmarkdown-language-mode]]

- ADR: [[adr/ADR016-ofmarkdown-language-mode]]

- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

- [x] `ofmarkdown` appears in VS Code language picker as **OFMarkdown**

- [x] `.md` files are not globally associated with `ofmarkdown`

- [x] Obsidian vault documents promote automatically

- [x] Server-indexed `.flavor-grenade.toml` vault documents promote automatically

- [x] Generic Markdown remains `markdown`

- [x] Manual non-Markdown language modes are preserved

- [x] No language assignment or LanguageClient restart loops occur

- [x] Markdown-compatible highlighting/editing remains available after promotion

- [x] All linked tests and smoke checks pass; PR #38 CI passed before merge

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-151]] | Contribute OFMarkdown language metadata | `done` |
| [[TASK-152]] | Implement LanguageModeController | `done` |
| [[TASK-153]] | Add document membership request | `done` |
| [[TASK-154]] | Add OFMarkdown tests and smoke coverage | `done` |
| [[TASK-155]] | Update release docs and Marketplace notes | `done` |

---

## Dependencies

**Blocked by:**

- [[FEAT-019]] — CI/CD pipeline and extension packaging baseline complete

**Unblocks:**

- Future OFMarkdown snippets, keybindings, grammar refinements, and language-specific settings

---

## Notes

This feature is intentionally client-first. The server reports membership; the extension changes VS Code language state.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

---

## Workflow Log

> [!INFO] Opened — 2026-05-03
> Ticket created. Status: `draft`. Documentation and plan created; implementation not started.

> [!INFO] Review sync — 2026-05-07
> Implementation and local evidence are present on `develop`; ticket status moved to `in-review` pending phase PR CI.

> [!INFO] Done — 2026-05-07
> PR #38 CI passed. Feature and child tickets moved to `done`; execution ledger and roadmap marked complete.

## Retrospective

> Written after Step L passes. Date: 2026-05-07.

### What went as planned

The implementation already satisfied the E6 behavior surface: the extension contributes `ofmarkdown`, promotes vault/index Markdown documents, preserves generic Markdown and manual non-Markdown modes, and the server answers `flavorGrenade/documentMembership`.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| N/A | N/A | No new sweep tickets were needed. The only adjustment was adding automated evidence for Markdown grammar/config parity before closing E6. | +0.25 h |

### Process observations

The phase ticket frontmatter, index, and test matrix drifted after implementation landed on `develop`. Closing an already-implemented phase still needs a short reconciliation pass before the PR gate.

### Carry-forward actions

- [ ] Start E7 from updated `develop` after PR #38 merges.
- [ ] Keep E7 ticket frontmatter, phase index, matrix, and ledger in sync as status changes occur.

### Rule / template amendments

- [ ] none
