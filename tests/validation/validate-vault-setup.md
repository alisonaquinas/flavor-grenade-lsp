---
title: Validation — Vault Setup
tags: [test/validation, requirements/user]
aliases: [Validate Vault Setup]
---

# Validation — Vault Setup

## Purpose

This validation plan confirms that vault authors never have to manually tell the server where their vault is. A vault author should be able to open any Obsidian vault folder — or any folder configured for flavor-grenade-lsp — in their editor and immediately have all cross-file features available without touching a settings file. The plan also verifies that link resolution, completions, and diagnostics work across the entire vault regardless of how deeply notes are nested in subfolders, and that two separate vaults open at the same time never bleed into each other — a link in vault A must never resolve to a note that lives in vault B.

## User Requirements Covered

| User Req Tag | Goal | Mapped FRs | Verification Coverage |
|---|---|---|---|
| `User.Vault.AutoDetectVault` | Have the server automatically find and use the vault root | `Workspace.VaultDetection.Primary`, `Workspace.VaultDetection.Fallback` | TC-VER-WS-001, TC-VER-WS-002 |
| `User.Vault.WorkAcrossEntireVault` | Have links resolve across all notes in the vault | `Workspace.FileExtension.Filter`, `Workspace.MultiFolder.Isolation` | TC-VER-WS-003, TC-VER-WS-004 |

## Test Cases

### TC-VAL-VAULT-001 — User.Vault.AutoDetectVault

**User Req Tag:** `User.Vault.AutoDetectVault`
**Goal:** Have the server automatically find and use the vault root
**Type:** Both
**Mapped FRs:** `Workspace.VaultDetection.Primary`, `Workspace.VaultDetection.Fallback` — see [[tests/verification/verify-workspace]]
**Verification coverage:** TC-VER-WS-001, TC-VER-WS-002

**Scenario (user perspective):**
As a vault author, I open a folder in my editor and expect the language server to recognise it as a vault and activate all features without me doing anything extra. I have two common setups: one where the folder was already used with Obsidian directly (it has the `.obsidian` configuration folder inside it), and one where I set up a fresh workspace just for flavor-grenade-lsp editing (it has a `.flavor-grenade.toml` file but no `.obsidian` folder). In both cases I expect completions, link resolution, and diagnostics to be live as soon as my first note opens.

**Sub-scenario A — folder previously used with Obsidian:**

```gherkin
Feature: Server detects a standard Obsidian vault automatically

  Scenario: Author opens an Obsidian vault and features activate immediately
    Given a folder "Personal Knowledge Base/" containing:
      | path                                       | type      |
      | Personal Knowledge Base/.obsidian/         | directory |
      | Personal Knowledge Base/.obsidian/app.json | file      |
      | Personal Knowledge Base/Daily Notes/2026-04-17.md | file |
      | Personal Knowledge Base/Projects/obsidian-stack.md | file |
    When I open "Personal Knowledge Base/" in the editor
    Then the server recognises it as a vault without any manual configuration
    And cross-file link features are active
    And typing "[[" in "Daily Notes/2026-04-17.md" offers "obsidian-stack" as a completion candidate
```

**Sub-scenario B — folder set up for flavor-grenade-lsp only:**

```gherkin
Feature: Server detects a flavor-grenade-lsp workspace automatically

  Scenario: Author opens a non-Obsidian folder with a config file and features activate
    Given a folder "Technical Docs/" containing:
      | path                               | type |
      | Technical Docs/.flavor-grenade.toml | file |
      | Technical Docs/architecture/overview.md | file |
      | Technical Docs/architecture/decisions.md | file |
    And "Technical Docs/.obsidian/" does NOT exist
    When I open "Technical Docs/" in the editor
    Then the server recognises it as a vault without any manual configuration
    And cross-file link features are active
    And typing "[[" in "architecture/overview.md" offers "decisions" as a completion candidate
```

**Agent-driven walkthrough:**

1. Agent creates two separate temporary directories.

   Directory A — `Personal Knowledge Base/`: contains `.obsidian/` (as a directory with a minimal `app.json`), `Daily Notes/2026-04-17.md`, and `Projects/obsidian-stack.md`.

   Directory B — `Technical Docs/`: contains `.flavor-grenade.toml` (minimal valid TOML: `[vault]`) but no `.obsidian/`, plus `architecture/overview.md` and `architecture/decisions.md`.

2. Agent starts the server with `Personal Knowledge Base/` as the workspace root and waits for the indexing progress signal.
3. Agent opens `Daily Notes/2026-04-17.md` and triggers a completion request after `[[`. Agent confirms that `obsidian-stack` appears in the candidates, confirming cross-file indexing is active.
4. Agent confirms the server's internal vault-mode report is `obsidian`.
5. Agent restarts the server with `Technical Docs/` as the workspace root and waits for the indexing signal.
6. Agent opens `architecture/overview.md` and triggers a completion request after `[[`. Agent confirms `decisions` appears in the candidates.
7. Agent confirms the server's internal vault-mode report is `flavor-grenade`.
8. Agent verifies that in neither scenario did the vault author provide any path or configuration beyond opening the folder.

**Pass:** In sub-scenario A, a folder with `.obsidian/` activates vault mode and makes cross-file completions available immediately. In sub-scenario B, a folder with only `.flavor-grenade.toml` does the same. No manual path configuration is required in either case.
**Fail:** Either folder fails to be recognised as a vault; cross-file completions are absent or empty; the server requires the author to set a vault path manually; the server reports the wrong vault mode.

---

### TC-VAL-VAULT-002 — User.Vault.WorkAcrossEntireVault

**User Req Tag:** `User.Vault.WorkAcrossEntireVault`
**Goal:** Have links resolve across all notes in the vault
**Type:** Both
**Mapped FRs:** `Workspace.FileExtension.Filter`, `Workspace.MultiFolder.Isolation` — see [[tests/verification/verify-workspace]]
**Verification coverage:** TC-VER-WS-003, TC-VER-WS-004

**Scenario (user perspective):**
As a vault author, I organise my notes in subfolders — `Projects/`, `Areas/`, `Resources/`, `Archive/` — and I expect a link like `[[Meeting Notes]]` written anywhere in the vault to resolve to the correct note no matter which folder it lives in. I should never have to write a path prefix to make a link work. At the same time, I sometimes have two separate vaults open in the same editor window — for example my personal vault and a work vault — and I expect links in one vault to be completely unaware of notes in the other. A link `[[index]]` in my personal vault must not accidentally jump to `index.md` inside my work vault.

**Scripted scenario:**

```gherkin
Feature: Links resolve across folder boundaries within one vault

  Scenario: Author uses a plain note link that crosses folder boundaries
    Given a vault with the following structure:
      | path                              | content                                          |
      | Projects/Website Redesign.md      | # Website Redesign\n## Goals\nImprove UX.        |
      | Areas/Design Notes.md             | See [[Website Redesign]] for the brief.          |
      | Resources/Brand Guide.md          | Also referenced in [[Website Redesign#Goals]].   |
      | Archive/Old Brief.md              | No links to other notes.                         |
    When I activate go-to-definition on "[[Website Redesign]]" in "Areas/Design Notes.md"
    Then the editor opens "Projects/Website Redesign.md"
    And typing "[[Website" in "Resources/Brand Guide.md" offers "Website Redesign" as a candidate

  Scenario: Notes from a second open vault do not appear in completions for the first vault
    Given a multi-vault session with:
      | vault           | marker      | notes                                        |
      | Personal Vault/ | .obsidian/  | journal/2026-04-17.md, projects/gardening.md |
      | Work Vault/     | .obsidian/  | meetings/standup.md, projects/website.md     |
    When I type "[[" in "Personal Vault/journal/2026-04-17.md"
    Then the completion list includes "gardening" and "2026-04-17"
    And the completion list does NOT include "standup" or "website"
    When I activate go-to-definition on "[[projects/gardening]]" in "Personal Vault/journal/2026-04-17.md"
    Then the editor opens "Personal Vault/projects/gardening.md"
    And does NOT open any file under "Work Vault/"
```

**Agent-driven walkthrough:**

1. Agent creates a vault `My Vault/` with `.obsidian/` and the following notes: `Projects/Website Redesign.md` (containing `## Goals`), `Areas/Design Notes.md` (containing `[[Website Redesign]]`), `Resources/Brand Guide.md` (containing `[[Website Redesign#Goals]]`), and `Archive/Old Brief.md` (containing no links).
2. Agent creates a second vault `Work Vault/` with its own `.obsidian/` and notes: `meetings/standup.md` and `projects/website.md`. Importantly, `Work Vault/` also contains a file named `index.md` and `My Vault/` also contains a top-level `index.md`.
3. Agent starts the server with both vaults as workspace roots and waits for indexing to complete.
4. Agent opens `Areas/Design Notes.md` and calls go-to-definition on `[[Website Redesign]]`. Agent confirms the result points to `My Vault/Projects/Website Redesign.md`.
5. Agent triggers a completion request after `[[Website` in `Resources/Brand Guide.md`. Agent confirms `Website Redesign` appears in the list.
6. Agent triggers a completion request after `[[` in `My Vault/Areas/Design Notes.md`. Agent confirms the list includes `Website Redesign`, `Brand Guide`, `Old Brief`, and `index` — all from `My Vault/` — and confirms `standup`, `website` (from `Work Vault/`), and `Work Vault/index` do NOT appear.
7. Agent calls go-to-definition on a `[[index]]` link placed in `My Vault/Areas/Design Notes.md`. Agent confirms the result URI is `My Vault/index.md`, not `Work Vault/index.md`.
8. Agent deletes `Work Vault/projects/website.md` and confirms no diagnostic changes appear in any `My Vault/` file.

**Pass:** Links resolve correctly across all subdirectory levels within a single vault; no note from a separate vault appears in completions, definitions, or references for the first vault; isolation is total.
**Fail:** A link fails to resolve across a folder boundary within the same vault; any cross-vault completion candidate appears; a definition result or references result crosses vault boundaries.
