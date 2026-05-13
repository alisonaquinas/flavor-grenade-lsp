---
title: "Phase E15: Markdown Flavor Selector And Settings"
phase: E15
status: planned
tags: [plans, vscode, extension, markdown-flavor, selector]
aliases: [Phase E15, Markdown Flavor Selector]
updated: 2026-05-13
---

# Phase E15: Markdown Flavor Selector And Settings

| Field | Value |
|---|---|
| Phase | E15 |
| Title | Markdown Flavor Selector And Settings |
| Status | planned |
| Gate | VS Code keeps Markdown language mode while a selector controls effective flavor |
| Depends on | Phase E14, Phase 19, Phase 20 |

## Objective

Replace the retired language-mode promotion design with a Markdown flavor
selector, setting schema, auto-detection resolver, override persistence, and
server propagation calls.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownLanguage.PreserveDefault]] | Stop changing `.md` language ids for flavor |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.Selector]] | Add visible flavor selector and quick-pick choices |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]] | Add full selector/settings enum |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]] | Resolve Obsidian/CommonMark/default context |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.OverridePersistence]] | Write overrides to correct settings target |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Notify server of effective flavor |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]] | Keep non-`markdown` manual language selections out of flavor scope |
| [GAP-E-001](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close language promotion gap |
| [GAP-E-006](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close client-to-server propagation gap |

## Scope

### In Scope

- Extension flavor constants, labels, and schema values.
- `flavorGrenade.markdownFlavor` package contribution.
- Markdown flavor controller replacing language promotion behavior.
- Selector status item or equivalent command surface.
- Workspace/user override target selection.
- Auto-detection from markers, settings, and server membership input.
- Client-to-server propagation using `workspace/didChangeConfiguration` carrying
  `flavorGrenade.markdownFlavor` and the resolved effective flavor, matching
  the Phase 20 contract.
- Unit tests in `extension/src/markdown-flavor.test.ts`.

### Out of Scope

- Marketplace screenshot update.
- Contribution scoping rewrite.
- Full VS Code host e2e suite.

## Acceptance

- Opening vault Markdown leaves `document.languageId === "markdown"`.
- `LanguageClient` starts with `clientOptions.documentSelector` scoped to
  file-backed `markdown` documents only.
- Selector tests fail if the current `documentSelector` still contains
  `ofmarkdown`.
- Selector includes Auto Detect and every required explicit flavor.
- Folder-backed overrides write workspace-folder or workspace scope.
- Standalone-file overrides write user scope.
- Effective flavor is sent to the server through
  `workspace/didChangeConfiguration` with `flavorGrenade.markdownFlavor` and
  the resolved effective flavor.
- Propagation is skipped for documents whose VS Code language id is not
  `markdown`.

## Gate Verification

```bash
cd extension
npm run compile
npm test
```

## Tickets

Ticket index: [[docs/plans/phase-E15-markdown-flavor-selector-settings/index]]

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [extension Markdown flavor gap analysis](../../extension/docs/gaps/markdown-flavor-gap-analysis.md)
