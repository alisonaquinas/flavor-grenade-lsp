---
title: "Phase E15: Markdown Flavor Selector And Config Files"
phase: E15
status: in-review
tags: [plans, vscode, extension, markdown-flavor, selector]
aliases: [Phase E15, Markdown Flavor Selector]
updated: 2026-05-13
---

# Phase E15: Markdown Flavor Selector And Config Files

| Field | Value |
|---|---|
| Phase | E15 |
| Title | Markdown Flavor Selector And Config Files |
| Status | in-review |
| Gate | VS Code keeps Markdown language mode while a selector controls effective flavor |
| Depends on | Phase E14, Phase 19, Phase 20 |

## Objective

Replace the retired language-mode promotion design with a Markdown flavor
selector, `.fgattributes` persistence, `.fgignore` inactive handling,
auto-detection resolver, and server propagation calls. The auto-detection
resolver follows
[[docs/design/markdown-flavor-auto-detection]].

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownLanguage.PreserveDefault]] | Stop changing `.md` language ids for flavor |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.Selector]] | Add visible flavor selector and quick-pick choices |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.RequiredCoverage]] | Add full selector and `.fgattributes` enum |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Keep selector/schema/profile ids compatible with the shared dialect profile contract |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]] | Resolve Obsidian/CommonMark/default context |
| [[docs/design/markdown-flavor-auto-detection]] | Implement the unified precedence and resource-specific detection flow |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.OverridePersistence]] | Write selected-file and directory `.fgattributes` rules |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Notify server of effective flavor |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ManualLanguageSafety]] | Keep non-`markdown` manual language selections out of flavor scope |
| [[docs/requirements/technical/security-input-validation#Security.Input.FlavorPropagationPayload]] | Send only bounded, resource-owned flavor payloads |
| [GAP-E-001](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close language promotion gap |
| [GAP-E-006](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close client-to-server propagation gap |

## Scope

### In Scope

- Extension flavor constants, labels, and `.fgattributes` values.
- Markdown flavor controller replacing language promotion behavior.
- Selector status item or equivalent command surface.
- Selected-file and directory override target selection for `.fgattributes`.
- `.fgignore` inactive-state handling for selector and propagation decisions.
- Configuration resolution from `.fgattributes`; `flavor=auto`, `!flavor`, and
  absent config files invoke Auto Detect.
- Auto Detect from `.obsidian/`, server membership, and syntax/context evidence.
  Auto Detect must not parse `.fgattributes`.
- Refresh detection when `.fgignore` or `.fgattributes` appears, disappears, or
  changes.
- Client-to-server propagation using resource-specific selected/effective
  flavor state, matching the Phase 20 contract.
- Restricted, virtual, unsupported-scheme, and untrusted contexts must not write
  `.fgattributes`, spawn the server, or propagate flavor state.
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
- Folder-backed overrides write selected-file or directory-scope
  `.fgattributes` rules.
- Standalone-file overrides write a selected-file `.fgattributes` rule beside
  the standalone file.
- Auto Detect clears/resets the matching `.fgattributes` `flavor` at the chosen
  scope and recomputes through Auto Detect.
- Effective flavor is sent to the server as resource-specific selected/effective
  flavor state keyed by document URI or workspace folder, so multi-root and
  standalone documents cannot leak flavor state into one another.
- Propagation is skipped for documents whose VS Code language id is not
  `markdown`.
- Propagation is skipped for restricted, virtual, unsupported-scheme, and
  untrusted contexts; selector UI reports inactive/disabled state instead.
- Propagation and active selector writes are skipped for files matched by
  `.fgignore`.

## Gate Ordering Notes

- E15 owns stale `ofmarkdown` failures in selector/controller/unit coverage:
  language promotion calls, current `LanguageClient` document selector, metadata
  propagation, and manual-language suppression.
- E16 owns stale activation/contribution/Marketplace unit checks tied to
  `onLanguage:ofmarkdown`, contribution scoping, README, and VSIX asset proof.
- E17 owns stale Extension Development Host proof: host waits for
  `document.languageId === "ofmarkdown"`, legacy host fixture expectations, and
  user-visible validation evidence.

## Gate Verification

```bash
bun run lint:docs
cd extension
npm run compile
npm test
```

## Tickets

Ticket index: [[docs/plans/phase-E15-markdown-flavor-selector-settings/index]]

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [extension Markdown flavor gap analysis](../../extension/docs/gaps/markdown-flavor-gap-analysis.md)
