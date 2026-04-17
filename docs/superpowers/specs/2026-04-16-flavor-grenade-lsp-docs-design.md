---
title: "Design Spec: flavor-grenade-lsp Documentation Structure"
date: 2026-04-16
status: approved
tags:
  - spec/docs
  - lsp/ofm
---

# Design Spec — flavor-grenade-lsp Documentation Structure

**Date:** 2026-04-16
**Author:** Claude (autonomous — reviewed by Alison Aquinas)
**Status:** Approved — proceed to implementation

---

## 1. Problem Statement

`flavor-grenade-lsp` is a new Language Server Protocol server targeting Obsidian Flavored Markdown (OFM) exclusively. The project follows a documentation-and-specification-first SDLC, meaning the documentation scaffold must exist before a single line of production code is written.

This spec defines the structure, content plan, and key design decisions for the `docs/` folder that will govern the entire project lifecycle.

### Goals

- Establish canonical OFM syntax definitions before parsing code is written
- Capture architecture decisions as ADRs while the design space is still open
- Provide Planguage-style measurable requirements that drive TDD red-green cycles
- Define DDD bounded contexts and ubiquitous language for the NestJS domain model
- Supply BDD (Gherkin) scenarios that serve simultaneously as living acceptance tests
- Organize phased implementation plans for AI-empowered autonomous SDLC execution

### Non-goals

- Implementation of any TypeScript/NestJS code (that follows from writing-plans)
- CI/CD pipeline configuration (covered in plans/phase-13-ci-delivery.md)
- API documentation auto-generation (post-implementation concern)

---

## 2. Reference Sources

Two local reference repositories in `/c/Users/aaqui/obsidian-stack/` informed this structure.

### 2.1 marksman (`/marksman/docs/`)

F# LSP server for Markdown with an already-expanded docs structure:

| Folder | Key Content |
|--------|-------------|
| `architecture/` | overview, layers, data-flow |
| `concepts/` | connection-graph, path-model, symbol-model, workspace-model |
| `design/` | api-layer, behavior-layer, domain-layer (full DDD analysis) |
| `requirements/` | Planguage-style index + 8 feature files |
| `features/` | 6 user-facing feature docs |
| `research/` | LSP 3.17 spec, Zettelkasten |

**Borrowed patterns:** Planguage requirements format (Tag / Gist / Ambition / Scale / Meter / Fail / Goal), DDD domain-layer structure with bounded contexts and ubiquitous language, architecture layer diagram style.

### 2.2 obsidian-linter (`/obsidian-linter/docs/`)

TypeScript OFM linter with the richest existing docs:

| Folder | Key Content |
|--------|-------------|
| `adr/` | ADR001–ADR007 with `[[wikilink]]` cross-references |
| `bdd/features/` | Gherkin `.feature` files per OFM element |
| `ddd/` | bounded-contexts, ubiquitous-language, per-context domain models |
| `plans/` | phase-01 through phase-14, execution-ledger |
| `rules/` | per-rule docs organized by category |
| `guides/` | install, CI integration, custom rules |

**Borrowed patterns:** ADR format with wikilink cross-refs, BDD Gherkin feature files, phased plan structure with execution ledger.

---

## 3. Key Design Decisions

### Decision 1: Hybrid Layered Structure (Selected)

Three structural options were evaluated:

**Option A — Minimal (original marksman):** 4–6 flat files + features/. Insufficient for a spec-first SDLC — no ADRs, no BDD, no phased plans.

**Option B — Obsidian-linter style:** Full DDD + ADR + BDD + phased plans. Strong, but linter-focused patterns don't map perfectly to LSP concerns (no requirements layer, no concepts layer).

**Option C — Hybrid Layered (SELECTED):** Synthesises marksman's `architecture/`, `concepts/`, `requirements/`, and `design/` with obsidian-linter's `adr/`, `bdd/`, `ddd/`, and `plans/`. Adds `ofm-spec/` as a new canonical layer present in neither reference project.

**Rationale:** The "documentation-and-specification-first" mandate combined with TDD and AI-empowered SDLC requires more rigour than Option A. The `ofm-spec/` addition fills the single most important gap both reference projects leave open.

---

### Decision 2: `ofm-spec/` as a First-Class Layer

Neither reference project formally specifies OFM syntax. marksman assumes CommonMark + wiki-links without documenting the exact parse grammar. obsidian-linter's OFM knowledge is embedded in regexes scattered across `ignore-types.ts` and individual rule files.

`flavor-grenade-lsp` owns an `ofm-spec/` layer that documents each OFM syntactic element with:
- Canonical syntax patterns (regex + prose)
- Parse precedence rules and edge cases
- Interaction with standard CommonMark elements
- Cross-references to Obsidian's official help docs
- Which LSP features apply to the element

**OFM elements covered:**

| File | Element |
|------|---------|
| `wiki-links.md` | `[[]]`, `[[#]]`, `[[doc#heading]]`, `[[doc#^block]]`, `[[doc\|alias]]` |
| `embeds.md` | `![[file]]`, `![[file\|width]]`, `![[doc#heading]]`, `![[doc#^block]]` |
| `block-references.md` | `^blockid` anchors, `[[doc#^id]]` references |
| `tags.md` | `#tag`, `#nested/tag`, `#tag-with-emoji`, YAML `tags:` key |
| `frontmatter.md` | YAML delimiters, special keys (`aliases`, `tags`, `cssclasses`) |
| `callouts.md` | `> [!TYPE] Title`, foldable `> [!TYPE]-`, nested callouts |
| `math.md` | `$$...$$` blocks, `$...$` inline math |
| `comments.md` | `%%...%%` Obsidian comment blocks |
| `templater.md` | `<% %>` command passthrough regions |

---

### Decision 3: LSP Transport — stdio JSON-RPC

**Selected:** `stdin`/`stdout` JSON-RPC (same as marksman).

**Rationale:** Maximum editor compatibility without configuration. Neovim, VS Code, Helix, Emacs, Zed all support stdio LSP clients via identical `lspconfig` patterns. No port management, no daemon lifecycle complexity, no firewall concerns. HTTP+SSE transport (LSP 3.17 §3.5) is reserved for a future ADR-gated phase.

**Documented in:** ADR001.

---

### Decision 4: Vault Detection Strategy

**Primary:** Presence of `.obsidian/` directory — the authoritative Obsidian vault marker. When found, the containing directory is the vault root.

**Secondary:** Presence of `.flavor-grenade.toml` — for non-Obsidian PKM workflows using OFM syntax (Logseq-to-Obsidian migrations, Foam, etc.).

**Fallback:** Single-file mode — no vault context required for basic functionality.

**Documented in:** ADR003.

---

### Decision 5: Project Config File — `.flavor-grenade.toml`

Mirrors `.marksman.toml`. Project-level config marker and config store. Supports the same cascade as marksman: project config → user config → built-in defaults.

**Default config options (v1):**

```toml
[core]
markdown.file_extensions = ["md"]
text_sync = "full"
vault_detection = "obsidian"   # "obsidian" | "toml-only"

[completion]
candidates = 50
wiki.style = "file-stem"       # "file-stem" | "title-slug" | "file-path-stem"

[callout]
completion.enabled = true
```

---

### Decision 6: NestJS Module Map

DDD bounded contexts map to NestJS injectable modules:

| Bounded Context | NestJS Module | Key Services |
|----------------|---------------|--------------|
| LSP Protocol | `LspModule` | `LspServer`, `RequestRouter`, `CapabilityNegotiator` |
| Vault & Workspace | `VaultModule` | `VaultDetector`, `VaultIndex`, `FileWatcher` |
| Document Lifecycle | `DocumentModule` | `DocumentStore`, `OFMParser`, `IndexBuilder` |
| Reference Resolution | `ReferenceModule` | `RefGraph`, `Oracle`, `LinkResolver` |
| Config | `ConfigModule` | `ConfigLoader`, `ConfigCascade` |

---

## 4. Proposed `docs/` Folder Structure

```
docs/
├── index.md                         ← project overview, purpose, tech stack
├── AGENTS.md                        ← AI agent navigation guide
├── roadmap.md                       ← feature phases and status
│
├── adr/                             ← Architecture Decision Records
│   ├── ADR001-stdio-transport.md    ← JSON-RPC over stdin/stdout
│   ├── ADR002-ofm-only-scope.md     ← Exclusively OFM, not plain Markdown
│   ├── ADR003-vault-detection.md    ← .obsidian/ + .flavor-grenade.toml
│   ├── ADR004-text-sync-strategy.md ← Full sync default; incremental later
│   ├── ADR005-wiki-style-binding.md ← file-stem default vs title-slug
│   └── ADR006-block-ref-indexing.md ← ^blockid as first-class index entry
│
├── architecture/
│   ├── overview.md                  ← NestJS + Bun runtime, LSP wire protocol
│   ├── layers.md                    ← module dependency order
│   └── data-flow.md                 ← LSP event → parse → index → response
│
├── bdd/
│   ├── features/
│   │   ├── wiki-links.feature       ← OFM001–OFM007 scenarios
│   │   ├── embeds.feature           ← embed resolution scenarios
│   │   ├── tags.feature             ← tag indexing and completion
│   │   ├── block-references.feature ← ^blockid parse and resolution
│   │   ├── callouts.feature         ← callout type detection
│   │   ├── frontmatter.feature      ← YAML key extraction
│   │   ├── completions.feature      ← completion provider scenarios
│   │   ├── diagnostics.feature      ← broken/ambiguous link diagnostics
│   │   ├── navigation.feature       ← go-to-def, find-refs, code lens
│   │   ├── rename.feature           ← rename refactoring
│   │   ├── workspace.feature        ← multi-vault, single-file mode
│   │   └── vault-detection.feature  ← .obsidian/ and .flavor-grenade.toml
│   └── steps/
│       └── README.md                ← step registration guide (substantive at scaffold; implementations added in phase 3)
│
├── concepts/
│   ├── connection-graph.md          ← RefGraph model (analog to Conn)
│   ├── document-model.md            ← OFMDoc, Index, Structure
│   ├── ofm-syntax.md                ← element taxonomy quick-reference
│   ├── path-model.md                ← VaultPath, DocId, resolution modes
│   ├── symbol-model.md              ← Sym/Def/Ref/Tag/Embed hierarchy
│   └── workspace-model.md           ← Vault, Folder, Doc composition
│
├── ddd/
│   ├── bounded-contexts.md          ← context map (5 BCs)
│   ├── ubiquitous-language.md       ← canonical term glossary
│   ├── vault/
│   │   └── domain-model.md          ← VaultIndex, VaultPath, WikilinkNode, EmbedNode
│   ├── lsp-protocol/
│   │   └── domain-model.md          ← Request, Response, Notification, Capability
│   ├── reference-resolution/
│   │   └── domain-model.md          ← RefGraph, Oracle, Def, Ref, Unresolved
│   ├── document-lifecycle/
│   │   └── domain-model.md          ← OFMDoc, ParsePipeline, Index
│   └── config/
│       └── domain-model.md          ← FlavorConfig, ConfigCascade, RuleConfig
│
├── design/
│   ├── api-layer.md                 ← LSP method catalog, capability matrix
│   ├── behavior-layer.md            ← BDD scenario index, tag taxonomy
│   └── domain-layer.md              ← full DDD analysis (aggregates, invariants, context map)
│
├── features/
│   ├── completions.md               ← triggers, candidates, styles, callout types
│   ├── diagnostics.md               ← broken-link, ambiguous, frontmatter errors
│   ├── navigation.md                ← go-to-definition, find-references
│   ├── rename.md                    ← heading and file rename refactor
│   ├── symbols.md                   ← document symbols, workspace symbols
│   ├── code-actions.md              ← TOC, create-missing-file, tag-to-yaml
│   ├── code-lens.md                 ← reference count on headings
│   ├── hover.md                     ← link preview, tag info, frontmatter
│   └── semantic-tokens.md           ← token type catalog
│
├── ofm-spec/
│   ├── index.md                     ← OFM vs CommonMark overview, element taxonomy
│   ├── wiki-links.md                ← all wiki-link variants, regex, edge cases
│   ├── embeds.md                    ← embed variants, width, heading/block embeds
│   ├── block-references.md          ← ^blockid syntax, reference syntax
│   ├── tags.md                      ← inline tags, nested hierarchy, YAML format
│   ├── frontmatter.md               ← YAML delimiters, special keys, formats
│   ├── callouts.md                  ← type list, foldable, nested, custom
│   ├── math.md                      ← block and inline math delimiters
│   ├── comments.md                  ← %% comment block rules
│   └── templater.md                 ← <% %> passthrough rules
│
├── plans/
│   ├── execution-ledger.md          ← phase status tracker
│   ├── phase-01-scaffold.md         ← NestJS + Bun + TypeScript init
│   ├── phase-02-lsp-transport.md    ← JSON-RPC stdio, capability negotiation
│   ├── phase-03-ofm-parser.md       ← OFM-specific parse pipeline
│   ├── phase-04-vault-index.md      ← vault detection, file watching, DocId
│   ├── phase-05-wiki-links.md       ← wiki-link resolution, diagnostics
│   ├── phase-06-tags.md             ← tag indexing, completion
│   ├── phase-07-embeds.md           ← embed resolution and diagnostics
│   ├── phase-08-block-refs.md       ← ^blockid index and resolution
│   ├── phase-09-completions.md      ← full completion provider
│   ├── phase-10-navigation.md       ← go-to-def, find-refs, code lens
│   ├── phase-11-rename.md           ← rename refactor
│   ├── phase-12-code-actions.md     ← TOC, create-missing-file, tag-to-yaml
│   └── phase-13-ci-delivery.md      ← packaging, CI gates, release
│
├── requirements/
│   ├── index.md                     ← master Planguage tag index
│   ├── wiki-link-resolution.md      ← Link.Wiki.* requirements
│   ├── embed-resolution.md          ← Embed.* requirements
│   ├── tag-indexing.md              ← Tag.* requirements
│   ├── block-references.md          ← Block.* requirements
│   ├── completions.md               ← Completion.* requirements
│   ├── diagnostics.md               ← Diagnostic.* requirements
│   ├── navigation.md                ← Navigation.* requirements
│   ├── rename.md                    ← Rename.* requirements
│   ├── workspace.md                 ← Workspace.* requirements
│   └── configuration.md             ← Config.* requirements
│
└── superpowers/
    └── specs/
        └── 2026-04-16-flavor-grenade-lsp-docs-design.md  ← this file
```

**Total: ~65 files across 20 directories**

---

## 5. Content Depth Plan per Layer

### 5.1 ADRs (6 files)
Each follows the obsidian-linter template:
```
---
adr: NNN
title: <decision title>
status: accepted | proposed | superseded
date: YYYY-MM-DD
---
# ADR NNN — <title>
## Context
## Decision
## Consequences
## Related
[[wikilink cross-references]]
```

### 5.2 Architecture (3 files)
Mirrors marksman's architecture layer but translated to NestJS module architecture. Includes:
- Module dependency graph (Mermaid)
- Data flow from LSP JSON-RPC to response
- Bun runtime specifics (native ESM, no transpile step)

### 5.3 BDD Features (12 .feature files)
Gherkin scenarios that will drive Jest + Cucumber test suites. Each feature file:
- Has a `@smoke` tag on critical happy-path scenarios
- Uses Background for shared vault setup
- Covers: happy path, error path, edge cases
- References OFM rule codes (OFM001, OFM002, etc.) in error scenarios

### 5.4 DDD (7 files)
Bounded contexts map exactly to NestJS module boundaries. Each domain-model file covers:
- Aggregate roots with identity, state, and invariants
- Value objects with smart constructors
- Domain services
- Commands and transitions

### 5.5 OFM Spec (10 files)
Ground-truth reference. Each file includes:
- Authoritative regex pattern
- Prose description with edge cases
- Parse precedence (what wins when two syntax forms overlap)
- Interaction with standard CommonMark
- LSP relevance (which features operate on this element)
- Cross-reference to Obsidian official docs URL

### 5.6 Requirements (11 files)
Planguage format borrowed directly from marksman. Each requirement:
```
## Tag: Feature.SubFeature.Aspect
**Gist:** One-sentence summary
**Ambition:** Why this matters
**Scale:** What is measured, as a %
**Meter:** Reproducible test procedure
**Fail:** Threshold for failure
**Goal:** Target level
**Stakeholders:** ...
**Owner:** flavor-grenade-lsp contributors
**Source:** ofm-spec/<file>.md, marksman reference
```

### 5.7 Plans (14 files: 13 phases + execution-ledger)
Each phase:
- Has a header table (phase number, title, status, gate)
- Lists prerequisites (previous phase gate must be green)
- Has a numbered task list with sub-tasks
- Ends with a verifiable CI gate (command that must pass)
- Links to the relevant requirements and BDD scenarios

### 5.8 Features (9 files)
User-facing docs for each LSP capability:
- What the feature does
- Trigger conditions
- OFM-specific behaviour (vs plain Markdown)
- Configuration options
- Known limitations

---

## 6. Gaps Filled vs Reference Projects

| Gap | Both projects | Solution in flavor-grenade-lsp |
|-----|--------------|-------------------------------|
| No canonical OFM syntax spec | ✗ | `ofm-spec/` layer (10 files) |
| Block reference support | ✗ | ADR006 + requirements/block-references.md + phase-08 |
| Embed resolution documented | ✗ (marksman: planned) | ofm-spec/embeds.md + features/ |
| YAML `aliases` resolution | ✗ (marksman: partial) | ofm-spec/frontmatter.md + requirements/wiki-link-resolution.md |
| Callout type completion | ✗ | ofm-spec/callouts.md + features/completions.md |
| Tag hierarchy (#a/b/c) | ✗ | ofm-spec/tags.md + requirements/tag-indexing.md |
| AGENTS.md in docs/ | obsidian-linter only | docs/AGENTS.md — AI navigation guide |
| Dataview passthrough | ✗ | ofm-spec/index.md (ignore-type list) |

---

## 7. Cross-Reference Conventions

All docs use Obsidian wiki-link syntax for internal cross-references:
- `[[adr/ADR001-stdio-transport]]` — ADR references
- `[[ofm-spec/wiki-links]]` — OFM spec references
- `[[requirements/wiki-link-resolution]]` — requirement references
- `[[plans/phase-05-wiki-links]]` — plan references

This ensures the docs folder itself is a navigable Obsidian vault.

---

## 8. Success Criteria

The documentation scaffold is complete when:

1. All 65 files exist with substantive content (not stubs)
2. Every BDD `.feature` file has ≥ 3 scenarios covering happy path + error path
3. Every requirement file has ≥ 2 Planguage requirements with measurable Scale and Meter
4. Every ADR has a written Decision section with explicit rationale
5. The `ofm-spec/` layer covers all 9 element files (excluding `index.md`) with canonical regex patterns
6. The DDD `bounded-contexts.md` includes a complete context map diagram
7. The `plans/execution-ledger.md` references all 13 phases with status `planned`
8. `docs/index.md` links to all top-level sections

---

## 9. Implementation Order

Documents must be written in dependency order:

1. `ofm-spec/` — ground truth (nothing else should be written without this)
2. `ddd/ubiquitous-language.md` + `ddd/bounded-contexts.md` — domain language
3. `architecture/overview.md` + `architecture/layers.md` — structural context
4. `adr/` — key decisions (reference architecture + OFM spec)
5. `concepts/` — detailed reference material (references OFM spec + DDD)
6. `ddd/*/domain-model.md` — per-context models (references bounded-contexts + ubiquitous-language)
7. `design/domain-layer.md` + `design/api-layer.md` — design layer (references DDD + architecture)
8. `requirements/` — measurable requirements (references OFM spec + design)
9. `bdd/features/` — acceptance scenarios (references requirements + OFM spec)
10. `features/` — user docs (references requirements + OFM spec)
11. `plans/` — implementation phases (references everything above)
12. `docs/index.md` + `docs/AGENTS.md` + `docs/roadmap.md` — navigation layer (references all)

---

## Related

- [[architecture/overview]] — runtime architecture (to be created)
- [[ddd/bounded-contexts]] — bounded context map (to be created)
- [[ofm-spec/index]] — OFM syntax overview (to be created)
- [[requirements/index]] — Planguage master tag index (to be created)
