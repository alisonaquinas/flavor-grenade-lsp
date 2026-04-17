---
title: Agent Guidance — flavor-grenade-lsp
tags: [agents, meta, guidelines]
aliases: [agent instructions, AI guidance]
---

# Agent Guidance — flavor-grenade-lsp

This file describes how AI agents should navigate, read, and extend the documentation in this repository. It is the authoritative source for agent behaviour rules. Read this file before reading any other file in `docs/`.

> [!WARNING]
> Do not write any TypeScript implementation files until all documentation layers described below are marked complete. Implementation before specification produces unverifiable code. The quality gates section below defines what "complete" means.

## Documentation Structure

The `docs/` directory is organised into the following layers, each with a distinct purpose:

| Directory | Purpose |
|---|---|
| `ofm-spec/` | Normative OFM language specification. Rule codes (e.g., OFM001) are defined here. |
| `ddd/` | Domain-Driven Design: bounded contexts, ubiquitous language, domain models per context. |
| `architecture/` | System architecture: component diagram, layering, module responsibilities. |
| `adr/` | Architecture Decision Records. Each decision is captured as a numbered ADR file. |
| `concepts/` | Conceptual explainers: workspace model, symbol model, reference resolution. |
| `design/` | Detailed design documents: data structures, algorithms, API shapes. |
| `requirements/` | Planguage requirements per feature area. |
| `bdd/` | BDD scenarios (Gherkin) for acceptance testing. |
| `features/` | User-facing feature specifications: what each LSP capability does. |
| `plans/` | Implementation plans per phase. Each phase maps to a set of TypeScript tasks. |

## First Files to Read

When starting a new task in this repository, always read these files first, in order:

1. `[[ofm-spec/index]]` — Understand the OFM language constructs and rule codes. Every parser, diagnostic, and feature decision refers back to this spec.
2. `[[ddd/bounded-contexts]]` — Understand the bounded context map. Know which domain owns which concept before writing code or documentation in a domain.
3. `[[ddd/ubiquitous-language]]` — Learn the canonical vocabulary. All documentation, code, and commit messages must use these exact terms. Do not invent synonyms.
4. `[[architecture/overview]]` — Understand how NestJS modules, the OFM parser, OFMIndex, RefGraph, and the LSP handler layer fit together.
5. This file (`[[AGENTS]]`) — Confirm you have read and understood these guidelines before proceeding.

## Implementation Order

Documentation layers must be completed in this order. Do not begin a layer until the previous layer is complete and internally consistent.

1. `ofm-spec/` — Normative language spec with all rule codes
2. `ddd/` — Bounded contexts, ubiquitous language, domain models
3. `architecture/` — Component diagram and layering
4. `adr/` — All Architecture Decision Records
5. `concepts/` — Conceptual explainers
6. `design/` — Detailed design documents
7. `requirements/` — Planguage requirements (all fields required)
8. `bdd/` — BDD scenarios referencing OFM rule codes
9. `features/` — Feature layer specifications
10. `plans/` — Phase-by-phase implementation plans

This order mirrors the layer order in `[[ofm-spec/index]]`. Implementation of TypeScript files in `src/` begins only after step 10 is complete.

## Quality Gates

Before any implementation file (`src/**/*.ts`) is written, ALL of the following must be true:

- [ ] Every OFM construct has a rule code in `ofm-spec/` (format: `OFM-<DOMAIN>-NNN`)
- [ ] Every bounded context in `ddd/bounded-contexts` has a corresponding domain model file
- [ ] Every term in implementation documentation appears in `ddd/ubiquitous-language`
- [ ] Every ADR is in `accepted` or `superseded` status (no drafts)
- [ ] Every Planguage requirement includes all seven fields: Tag, Gist, Ambition, Scale, Meter, Fail, Goal
- [ ] Every BDD scenario references at least one OFM rule code or ADR number
- [ ] Every feature in `features/` has at least one corresponding requirement in `requirements/`
- [ ] Every phase in `plans/` maps to at least one BDD scenario

## Naming Conventions

### Wikilink Cross-Reference Format

All cross-references use `[[wikilink]]` syntax. The link target is the file stem relative to `docs/` — never a full path, never a `.md` extension.

Examples:
- Correct: `[[ADR001-stdio-transport]]`
- Correct: `[[features/completions]]`
- Correct: `[[ddd/ubiquitous-language]]`
- Incorrect: `[ADR001](./adr/ADR001-stdio-transport.md)`
- Incorrect: `[[docs/features/completions.md]]`

### YAML Frontmatter Requirements

Every file in `docs/` must begin with YAML frontmatter containing at minimum:

```yaml
---
title: <human-readable title>
tags: [<at least one tag>]
aliases: [<at least one alias>]
---
```

Tags must use the prefix conventions listed below. Aliases must be distinct from the file stem.

### Tag Prefix Conventions

| Prefix | Used for |
|---|---|
| `ofm-spec/` | Files in the OFM specification layer |
| `ddd/` | Domain model files |
| `architecture/` | Architecture files |
| `requirements/` | Requirement files |
| `bdd/` | BDD scenario files |
| `adr` | ADR files (no sub-prefix; use the ADR number as an additional tag) |
| `features/` | Feature specification files |
| `plans/` | Phase plan files |
| `concepts/` | Concept explainer files |
| `design/` | Design document files |
| `meta` | Files about the project itself (this file, `index.md`, `roadmap.md`) |

### ADR File Naming

ADR files follow the pattern `ADR<NNN>-<kebab-title>.md`. The three-digit number is zero-padded. ADR numbers are sequential and never reused.

### Planguage Requirement Format

Every requirement in `requirements/` must use Planguage format with all seven mandatory fields:

```
Tag:       <unique identifier, e.g. WS-001>
Gist:      <one-sentence description of the requirement>
Ambition:  <target level of quality — aspirational>
Scale:     <unit of measurement>
Meter:     <how to measure: tool, test, or process>
Fail:      <threshold below which the requirement fails>
Goal:      <threshold that constitutes success>
```

Omitting any field is a documentation defect that blocks implementation.

### BDD Scenario Format

BDD scenarios in `bdd/` must use Gherkin syntax. Every scenario must include:

- A `@rule:OFM-<DOMAIN>-NNN` tag referencing the OFM spec rule being tested, OR an `@adr:ADR<NNN>` tag referencing the relevant ADR
- A `Feature:` block with a description
- At least one `Scenario:` or `Scenario Outline:` with `Given`, `When`, `Then` steps
- Step text that matches the ubiquitous language in `[[ddd/ubiquitous-language]]`

## Do Not

- Do not write TypeScript before all documentation layers are complete (see Quality Gates above)
- Do not invent new terms — use the vocabulary from `[[ddd/ubiquitous-language]]`
- Do not use relative Markdown links (`[text](../path/file.md)`) — use wikilinks (`[[file]]`)
- Do not omit YAML frontmatter from any `docs/` file
- Do not create a Planguage requirement with fewer than all seven mandatory fields
- Do not reference an OFM rule code that does not exist in `ofm-spec/`
- Do not add a phase to `roadmap.md` without a corresponding plan in `plans/`
- Do not leave any ADR in `draft` status — either accept, supersede, or delete it

## Parallel Agent Guidelines

When multiple agents are working on this repository simultaneously:

- Agents working on different layers (e.g., one on `requirements/`, one on `bdd/`) may proceed in parallel as long as the shared vocabulary (`ddd/ubiquitous-language`) is stable
- Agents must not modify `ddd/ubiquitous-language` without coordinating with all other active agents
- ADR numbers are assigned sequentially; coordinate to avoid numbering conflicts
- OFM rule codes are assigned by the agent working on `ofm-spec/` — do not invent rule codes in other layers

## Related

- [[index]]
- [[roadmap]]
- [[ofm-spec/index]]
- [[ddd/bounded-contexts]]
- [[ddd/ubiquitous-language]]
- [[architecture/overview]]
