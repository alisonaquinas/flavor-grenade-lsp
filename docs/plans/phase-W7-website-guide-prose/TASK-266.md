---
id: "TASK-266"
title: "Update sitemap and route metadata for guide articles"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, sitemap, seo]
aliases: ["TASK-266"]
---

# Update Sitemap And Route Metadata For Guide Articles

> [!INFO] `TASK-266` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Description

Ensure every Phase W7 article route is present in the static sitemap and has
route metadata suitable for GitHub Pages discovery and SEO.

## Text Scope

- Add sitemap coverage for every How-To, Concepts, and Advanced Usage article.
- Add route metadata for title, description, canonical path, and article group.
- Confirm hub pages link to article routes in a crawlable way.
- Keep article metadata aligned with dropdown navigation and hub card data.

## Asset Scope

- No new visual asset required.
- Add or update generated sitemap fixture/output.
- Add tests or checks that compare route data against sitemap entries.
- Add route group data that can support article lists, breadcrumbs, or dropdowns
  without duplicating slugs.

## Canonical Article Route Inventory

Use this inventory as the source for the route metadata, hub links, dropdown
links, sitemap entries, and route-completeness tests. If a route slug changes,
update this table and the corresponding article ticket in the same commit.

| Ticket | Group | Route id | Canonical path |
|---|---|---|---|
| [[TASK-240]] | How-To | `howToVsCodeExtension` | `/how-to/use-vscode-extension/` |
| [[TASK-241]] | How-To | `howToConfigureObsidianVaults` | `/how-to/configure-obsidian-vaults/` |
| [[TASK-242]] | How-To | `howToFixBrokenLinks` | `/how-to/fix-broken-links/` |
| [[TASK-243]] | How-To | `howToRenameNotesSafely` | `/how-to/rename-notes-safely/` |
| [[TASK-244]] | How-To | `howToCompleteWikiLinksHeadings` | `/how-to/complete-wiki-links-and-headings/` |
| [[TASK-245]] | How-To | `howToNavigateVaultTargets` | `/how-to/navigate-notes-headings-blocks-embeds-and-attachments/` |
| [[TASK-246]] | How-To | `howToFindReferencesHighlights` | `/how-to/find-references-and-highlights/` |
| [[TASK-247]] | How-To | `howToUseTagsCompletion` | `/how-to/use-tags-and-tag-completion/` |
| [[TASK-248]] | How-To | `howToOpaqueRegions` | `/how-to/work-with-ofm-opaque-regions/` |
| [[TASK-249]] | Concepts | `conceptInspirationPriorArt` | `/concepts/inspiration-and-prior-art/` |
| [[TASK-250]] | Concepts | `conceptObsidianFlavoredMarkdown` | `/concepts/obsidian-flavored-markdown/` |
| [[TASK-251]] | Concepts | `conceptVaultIndex` | `/concepts/vault-index/` |
| [[TASK-252]] | Concepts | `conceptWikiLinkResolution` | `/concepts/wiki-link-resolution/` |
| [[TASK-253]] | Concepts | `conceptDocIdVaultRelativePaths` | `/concepts/docid-and-vault-relative-paths/` |
| [[TASK-254]] | Concepts | `conceptOpaqueRegions` | `/concepts/opaque-regions/` |
| [[TASK-255]] | Concepts | `conceptDiagnostics` | `/concepts/diagnostics/` |
| [[TASK-256]] | Concepts | `conceptCompletions` | `/concepts/completions/` |
| [[TASK-257]] | Concepts | `conceptRenameSafety` | `/concepts/rename-safety/` |
| [[TASK-258]] | Concepts | `conceptReferencesNavigationTagsEmbeds` | `/concepts/references-navigation-tags-and-embeds/` |
| [[TASK-259]] | Advanced Usage | `advancedConfigurationModel` | `/advanced-usage/configuration-model/` |
| [[TASK-260]] | Advanced Usage | `advancedVaultSingleFileMode` | `/advanced-usage/vault-mode-and-single-file-mode/` |
| [[TASK-261]] | Advanced Usage | `advancedIndexingPerformance` | `/advanced-usage/indexing-and-performance/` |
| [[TASK-262]] | Advanced Usage | `advancedUriConfinement` | `/advanced-usage/unsupported-uri-schemes-and-confinement/` |
| [[TASK-263]] | Advanced Usage | `advancedParserBoundaries` | `/advanced-usage/parser-boundaries-and-opaque-regions/` |
| [[TASK-264]] | Advanced Usage | `advancedDirectLspIntegration` | `/advanced-usage/compatibility-and-direct-lsp-integration/` |

## Definition of Done

- [ ] Sitemap includes all Phase W7 article routes.
- [ ] Article routes include title, description, canonical path, and section
  metadata.
- [ ] Sitemap and route metadata tests fail if a new article route is omitted.
- [ ] Build output contains expected sitemap entries.

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from request to include sitemap updates. Status: `open`.
