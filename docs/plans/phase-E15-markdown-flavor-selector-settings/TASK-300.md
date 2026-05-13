---
id: "TASK-300"
title: "Replace language promotion with Markdown flavor controller"
type: task
status: open
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-299"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-300"]
---

# Replace Language Promotion With Markdown Flavor Controller

## Description

Replace `LanguageModeController` promotion/demotion behavior with a controller
that preserves VS Code language mode and tracks effective flavor.

## Work Scope

- Remove flavor-state calls to `setTextDocumentLanguage`.
- Keep `LanguageClient` `clientOptions.documentSelector` scoped to file-backed
  `markdown` documents only.
- Preserve non-`markdown` documents.
- Track current effective flavor per active Markdown context.
- Suppress flavor refresh and metadata propagation for open documents whose
  current VS Code language id is not `markdown`.
- Treat stale `ofmarkdown` promotion tests in controller/client-selector unit
  coverage as E15 blockers. Stale contribution, Marketplace, and host tests are
  handed to E16/E17 unless they directly fail this controller contract.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | `GAP-E-001` |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | `GAP-E-008` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-003` | `extension/src/markdown-flavor.test.ts` | Refresh logic never changes language id for flavor. |
| `EXT-MF-U-011`, `EXT-MF-U-012` | `extension/src/markdown-flavor.test.ts` | `.md` files manually set to `plaintext` or `mdx` do not receive flavor refresh or server reanalysis until their language id returns to `markdown`; `mdx` remains selectable only as a Markdown flavor when the document language id is `markdown`. |
| `EXT-MF-U-014` | `extension/src/markdown-flavor.test.ts` or `extension/src/client-options.test.ts` | `clientOptions.documentSelector` contains file-backed `markdown` only and fails when `ofmarkdown` is present. |

## Definition of Done

- [ ] Vault `.md` documents remain `markdown`.
- [ ] Client document selector contains `markdown` only for current Markdown
      flavor behavior.
- [ ] `plaintext` and `mdx` language documents are ignored by flavor application.
- [ ] Selector refresh does not send server flavor updates for non-`markdown`
      language documents.
- [ ] Obsolete promotion unit tests owned by E15 are rewritten or removed;
      contribution/Marketplace stale tests are linked to E16 and host stale
      tests are linked to E17.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage updates `extension/src/language-mode.test.ts` to preserve
> `markdown` language ids and avoid `setTextDocumentLanguage` during flavor
> refresh. Expected to fail until promotion behavior is replaced.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> Language refresh no longer calls `setTextDocumentLanguage`; `LanguageClient`
> document selection is file-backed `markdown` only, while retired
> contribution/host promotion checks remain E16/E17-owned.
> Status: `green`.
