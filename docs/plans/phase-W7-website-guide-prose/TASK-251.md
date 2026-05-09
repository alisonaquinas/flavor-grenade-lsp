---
id: "TASK-251"
title: "Concept Article: Vault Index"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-251"]
---

# Concept Article: Vault Index

> [!INFO] `TASK-251` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain that the vault index is the shared model for parsed documents,
  headings, wiki-links, attachments, embeds, and tags.
- Describe why indexing a vault graph enables completion, references,
  diagnostics, navigation, and safe rename.
- Include guidance for LLM maintainers: avoid inventing side caches when the
  index is the source of truth.

## Asset Scope

- Include an ASCII or Mermaid diagram showing vault files flowing into index
  data and then into editor features.
- Include a small vault tree example.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article describes index inputs and downstream editor features.
- [ ] Diagram or tree asset is present.
- [ ] Route metadata, sitemap, and tests include the article.

