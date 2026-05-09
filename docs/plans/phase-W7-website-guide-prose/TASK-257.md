---
id: "TASK-257"
title: "Concept Article: Rename Safety"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-257"]
---

# Concept Article: Rename Safety

> [!INFO] `TASK-257` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain safe rename as a vault-confined workspace edit, not a blind text
  replacement.
- Cover prepare-rename checks, inbound references, heading references,
  aliases, ambiguous targets, and skipped unsafe regions.
- Clarify why unsupported URI schemes and paths outside the vault are not
  rewritten.

## Asset Scope

- Include before and after Markdown examples for a note rename and heading
  rename.
- Include a safety checklist for acceptable edits.

## Draft Article Copy

### How does rename avoid unsafe edits?

Safe rename is not search and replace. In an Obsidian Vault, the same words can be a note title, heading, alias, tag, code sample, external URL, or ordinary prose. Flavor Grenade rename builds an explicit workspace edit from parsed and resolved references, then leaves unsupported or ambiguous text alone.

Compact definition: rename safety means edits are vault-confined, syntax-aware, prepare-checked, and based on resolved local references rather than raw string matches.

Heading rename example:

Before:

```markdown
# Project Plan

## Open Questions

See [[Project Plan#Open Questions]].
Also see [questions](#open-questions).
Code sample: `[[Project Plan#Open Questions]]`
```

Rename heading `Open Questions` to `Risks`.

After:

```markdown
# Project Plan

## Risks

See [[Project Plan#Risks]].
Also see [questions](#risks).
Code sample: `[[Project Plan#Open Questions]]`
```

Note rename example:

Before:

```markdown
See [[Project Plan]].
See [[notes/Project Plan#Risks|risk list]].
External: https://example.com/Project%20Plan
```

Rename the note stem from `Project Plan` to `Roadmap`.

After:

```markdown
See [[Roadmap]].
See [[notes/Roadmap#Risks|risk list]].
External: https://example.com/Project%20Plan
```

Safety checklist:

| Check | Why it matters |
| --- | --- |
| Prepare rename succeeds on a heading or supported wiki-link | Prevents edits from arbitrary cursor positions |
| Cursor is not inside an opaque region | Avoids code, math, comments, and Templater snippets |
| Target resolves to a vault document or heading | Avoids guessing |
| Edit stays inside the detected vault | Avoids rewriting files outside user data boundary |
| External URLs and unsupported schemes are ignored | Avoids corrupting web links or editor commands |
| Ambiguous targets are skipped or surfaced | Avoids choosing the wrong note |
| Aliases are preserved unless the alias equals the old visible name | Avoids unnecessary display-text churn |
| Workspace edit is explicit | The client applies the final edit; diagnostics and completion do not write files |

Current rename behavior focuses on headings and file-stem style note renames from supported references. File-operation planning also rewrites moved note, attachment, and folder targets through explicit editor workflows. Unsupported URI schemes and paths outside the vault are not rewrite targets.

For maintainers: add rename support only after parser entries, resolution, reference graph behavior, and workspace-edit validation agree. Tests should cover before/after text, skipped opaque regions, ambiguous targets, external URLs, and path confinement.

Related-link intent: link this page from Wiki-link Resolution, DocId and Vault-Relative Paths, Opaque Regions, References/Navigation/Tags/Embeds, and how-to pages for safe rename.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article explains confinement and ambiguity handling.
- [ ] Before and after examples are present.
- [ ] Route metadata, sitemap, and tests include the article.
