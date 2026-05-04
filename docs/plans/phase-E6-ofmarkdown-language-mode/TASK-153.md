---
id: "TASK-153"
title: "Add document membership request"
type: task
status: open
priority: "high"
phase: "E6"
parent: "FEAT-020"
created: "2026-05-03"
updated: "2026-05-03"
dependencies: ["TASK-152"]
tags: [tickets/task, "phase/E6"]
aliases: ["TASK-153"]
---

# Add document membership request

> [!INFO] `TASK-153` · Task · Phase E6 · Parent: [[FEAT-020]] · Status: `open`

## Description

Add `flavorGrenade/documentMembership`, a custom request that lets the VS Code extension ask whether a URI belongs to a vault/index and should be treated as OFMarkdown.

---

## Implementation Notes

- Request params: `{ uri: string }`.

- Result: `{ isOfMarkdown, indexed, vaultRoot?, reason }`.

- Answer from current `Workspace` and `VaultFolder` state.

- Return false for unsupported URI schemes, unknown URIs, and single-file mode.

- Do not emit document diagnostics for membership failures.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| Extension.LanguageMode.DynamicAssignment | Promote qualifying vault/index documents | [[requirements/ofmarkdown-language-mode]] |
| Extension.LanguageMode.NonVaultIsolation | Preserve generic Markdown mode | [[requirements/ofmarkdown-language-mode]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `Indexed Flavor Grenade vault markdown is promoted to OFMarkdown` |

---

## Definition of Done

- [ ] Request handler registered

- [ ] Workspace membership query tested

- [ ] `.flavor-grenade.toml` indexed vaults return positive membership

- [ ] Single-file mode returns false for language-mode assignment

---

## Workflow Log

> [!INFO] Opened — 2026-05-03
> Ticket created. Status: `open`. Parent: [[FEAT-020]].
