---
title: "Phase E6: OFMarkdown Language Mode"
phase: E6
status: planned
tags: [extension, vscode, ofmarkdown, language-mode]
updated: 2026-05-03
aliases: ["Phase E6", "OFMarkdown Language Mode Phase"]
---

# Phase E6: OFMarkdown Language Mode

| Field | Value |
|---|---|
| Phase | E6 |
| Title | OFMarkdown Language Mode |
| Status | planned |
| Gate | Extension tests and smoke test prove dynamic `ofmarkdown` assignment without generic Markdown hijacking |
| Depends on | Phase E5 (CI/CD Pipeline) |

---

## Objective

Add a VS Code language mode named **OFMarkdown** (`ofmarkdown`) and dynamically apply it to open Markdown documents that Flavor Grenade detects as part of an Obsidian vault and/or present in the server index. Generic Markdown remains `markdown`. Manual language selections are preserved.

This phase is planned only. It documents the implementation work; it does not implement extension code.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/package.json` | Modify | Add `ofmarkdown` language contribution, grammar contribution, and `onLanguage:ofmarkdown` activation |
| `extension/language-configuration.json` | Create | Markdown-compatible editor behavior for OFMarkdown |
| `extension/syntaxes/ofmarkdown.tmLanguage.json` | Create | Markdown-compatible grammar bridge for OFMarkdown |
| `extension/src/languageMode.ts` | Create | `LanguageModeController` and detection orchestration |
| `extension/src/extension.ts` | Modify | Wire `LanguageModeController` into activation lifecycle |
| `src/lsp/handlers/*` or equivalent | Modify | Add `flavorGrenade/documentMembership` request handler |
| `src/vault/*` or equivalent | Modify | Expose URI membership query over current `Workspace` |
| `extension/src/**/*.test.ts` | Create/modify | Unit tests for assignment rules and loop guards |
| `src/**/*.test.ts` | Create/modify | Server membership request tests |
| `docs/test/*` | Modify | Add test index and matrix rows |

---

## Task List

1. Add VS Code language contribution for `ofmarkdown`.
2. Add Markdown-compatible grammar and language configuration.
3. Add client-side `LanguageModeController`.
4. Add server-side `flavorGrenade/documentMembership` request.
5. Add extension and server tests plus manual smoke procedure.

---

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
```

```bash
bun run typecheck
bun test
bunx markdownlint-obsidian-cli --config .obsidian-linter.jsonc "docs/**/*.md"
```

Manual smoke test:

1. Open `extension/` in VS Code.
2. Launch **Run Extension**.
3. Open a workspace folder containing `.obsidian/`.
4. Open `notes/welcome.md`; confirm language picker becomes **OFMarkdown**.
5. Open a non-vault `README.md`; confirm language picker remains **Markdown**.
6. Manually set a vault note to `Plain Text`; run the refresh path; confirm it remains `Plain Text`.
7. Confirm completions, diagnostics, and semantic tokens still work after promotion.

---

## References

- [[adr/ADR016-ofmarkdown-language-mode]]
- [[features/ofmarkdown-language-mode]]
- [[requirements/ofmarkdown-language-mode]]
- `docs/bdd/features/ofmarkdown-language-mode.feature`
- [[superpowers/specs/2026-04-21-vscode-extension-design]]
