---
title: Markdown Flavor Integration Test Specification
tags:
  - test/spec
  - integration
  - markdown-flavor
aliases:
  - Markdown Flavor Integration Tests
---

# Markdown Flavor Integration Test Specification

Integration tests prove that flavor state moves through multiple server modules
and affects analysis without requiring VS Code UI.

## Test Cases

| Spec ID | Target file | Setup | Assertions |
|---|---|---|---|
| MF-I-001 | `src/test/integration/markdown-flavor.test.ts` | Spawn server with a temp workspace and `flavorGrenade.markdownFlavor = commonmark`. | `initialize` succeeds, open document analysis records effective flavor `commonmark`, and diagnostics do not enable Obsidian-only wiki-link behavior. |
| MF-I-002 | `src/test/integration/markdown-flavor.test.ts` | Change configuration from `commonmark` to `obsidian` with an open document containing `[[Target]]`. | Server refreshes the open document and Obsidian profile enables wiki-link diagnostics/navigation. |
| MF-I-003 | `src/test/integration/markdown-flavor.test.ts` | Iterate every required explicit flavor id through configuration updates. | Server accepts each id and publishes or exposes a refresh state without process restart. |
| MF-I-004 | `src/test/integration/markdown-flavor.test.ts` | Use unsupported flavor id `asciidoc`. | Server reports configuration validation failure and keeps previous effective flavor. |
| MF-I-005 | `src/test/integration/markdown-flavor.test.ts` | Start temp workspaces with `.flavor-grenade.toml`, workspace setting, both present, standalone file context, syntax-inference candidates, and invalid configured values. | Effective flavor follows [[docs/design/markdown-flavor-auto-detection]]: folder/workspace override, standalone user override, project config, Obsidian marker, syntax/context inference, membership evidence, then CommonMark fallback. |
| MF-I-006 | `src/test/integration/markdown-flavor.test.ts` | Change effective flavor with an open fixture containing diagnostics, completion, navigation, hover, semantic-token, and rename trigger points. | Each handler consumes the refreshed effective flavor and returns flavor-specific results without requiring server restart. |
| MF-I-007 | `src/test/integration/markdown-flavor.test.ts` | Open two documents in different workspace roots or vault contexts with different effective flavors. | Diagnostics, completion, navigation/documentLink, hover, semantic tokens, and rename requests remain resource-specific; one document's override does not leak into the other. |
| MF-I-008 | `src/test/integration/markdown-flavor.test.ts` | Analyze host-boundary fixtures for GFM, GLFM, Pandoc, MultiMarkdown, MDX, R Markdown, Reddit, and Stack Overflow. | Host, conversion, renderer, and execution-bound references are classified without local navigation, local rename edits, broken-vault diagnostics, network access, process execution, dynamic imports, or out-of-root file reads. |
| MF-I-009 | `src/test/integration/markdown-flavor.test.ts` | Send malformed flavor propagation payloads and unsafe `.flavor-grenade.toml` fixtures. | Oversized maps, non-file URI keys, dangerous keys, stale resources, unsafe TOML paths, oversized TOML, and invalid values are rejected before effective flavor state changes. |
| MF-I-010 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `original` and open a document with Original core headings plus unsupported extension syntax. | Open-document analysis reports effective flavor `original`, indexes headings but not wiki links, publishes FG101 portability diagnostics, and suppresses wiki-link completions. |
| MF-I-011 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `commonmark` and open a document with CommonMark core headings plus unsupported extension syntax. | Open-document analysis reports effective flavor `commonmark`, indexes headings but not wiki links, publishes FG102 portability diagnostics, and suppresses wiki-link completions. |
| MF-I-012 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `obsidian` and open a document with wiki links, embeds, tags, callouts, and block references. | Open-document analysis reports effective flavor `obsidian`, indexes wiki links, and does not publish Original/CommonMark portability diagnostics for active Obsidian syntax. |
| MF-I-013 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `gfm` and open a document with a pipe table, task-list item, strikethrough, extended bare autolink, and Obsidian wiki link. | Open-document analysis reports effective flavor `gfm`, indexes GFM table/task/strikethrough/autolink counts, keeps wiki links inert, and does not publish CommonMark portability warnings for active GFM syntax. |
| MF-I-014 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `glfm` and open a document with inherited GFM table syntax, GLFM inapplicable task marker, description list, footnote, TOC tag, GitLab host references, and Obsidian wiki link. | Open-document analysis reports effective flavor `glfm`, indexes GLFM local syntax counts, keeps wiki links inert, avoids CommonMark portability warnings for active GLFM syntax, and classifies GitLab host references as non-local. |
| MF-I-015 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `pandoc` and open a document with title-block metadata, heading attributes, citations, definition lists, footnotes, fenced Divs, and an Obsidian wiki link. | Open-document analysis reports effective flavor `pandoc`, indexes Pandoc local syntax counts, keeps wiki links inert, avoids CommonMark portability warnings for active Pandoc syntax, and classifies citation references as bibliography-bound. |
| MF-I-016 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `multimarkdown` and open a document with metadata, table labels, footnotes, citations, labels, abbreviations, cross-references, and an Obsidian wiki link. | Open-document analysis reports effective flavor `multimarkdown`, indexes MultiMarkdown local syntax counts, keeps wiki links inert, avoids CommonMark portability warnings for active MultiMarkdown syntax, and classifies export cross-references as conversion-bound. |
| MF-I-017 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `mdx` and open a document with ESM declarations, JSX elements, expressions, and an Obsidian wiki link. | Open-document analysis reports effective flavor `mdx`, indexes MDX local syntax counts, keeps wiki links inert, avoids CommonMark portability warnings for active MDX syntax, and classifies JSX component references as renderer-bound. |
| MF-I-018 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `kramdown` and open a document with attributes, definition lists, tables, footnotes, math blocks, and an Obsidian wiki link. | Open-document analysis reports effective flavor `kramdown`, indexes kramdown local syntax counts, keeps wiki links inert, avoids CommonMark portability warnings for active kramdown syntax, and classifies local attribute boundaries without renderer execution. |
| MF-I-019 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `markdown-extra` and open a document with tables, definition lists, footnotes, abbreviations, fenced code, attributes, and an Obsidian wiki link. | Open-document analysis reports effective flavor `markdown-extra`, indexes Markdown Extra local syntax counts, keeps wiki links inert, avoids CommonMark portability warnings for active Markdown Extra syntax, and classifies local boundaries without renderer execution. |
| MF-I-020 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `r-markdown` and open a document with YAML metadata, R chunks, chunk options, inline R, malformed chunk syntax, and an Obsidian wiki link. | Open-document analysis reports effective flavor `r-markdown`, indexes R Markdown local syntax counts, keeps wiki links inert, avoids CommonMark portability warnings for active R Markdown syntax, and classifies execution-bound chunks without running code. |
| MF-I-021 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `reddit` and open a document with spoilers, superscript, strikethrough, tables, Reddit host references, old-Reddit ordered-list syntax, unsafe links, and an Obsidian wiki link. | Open-document analysis reports effective flavor `reddit`, indexes Reddit local syntax counts, keeps wiki links inert, reports Reddit portability diagnostics, and classifies Reddit host references without service access. |
| MF-I-022 | `src/test/integration/markdown-flavor.test.ts` | Start a spawned server with `.flavor-grenade.toml` selecting `stack-overflow` and open a document with Stack Exchange tag references, spoilers, language directives, fence language hints, tables, malformed directives, and an Obsidian wiki link. | Open-document analysis reports effective flavor `stack-overflow`, indexes Stack Overflow local syntax counts, keeps wiki links inert, reports Stack Overflow portability diagnostics, and classifies Stack Exchange tag references without service access. |
| MF-I-023 | `src/test/integration/markdown-flavor.test.ts` | Start spawned servers against TOML-absent inference fixtures for MDX, R Markdown, Stack Overflow, Reddit, GLFM, Pandoc, MultiMarkdown, kramdown, Markdown Extra, and an ambiguous GFM-like fixture. | Strong inference fixtures report source `syntax-inference` and the expected effective flavor; the ambiguous GFM-like fixture reports `commonmark-fallback`; no inference test performs network access, process execution, renderer loading, dynamic imports, or out-of-root reads. |
| MF-I-024 | `src/test/integration/markdown-flavor.test.ts` | Open a root fixture README under a smoketest workspace that has child flavor fixtures but no root `.flavor-grenade.toml`; run the same fixture from a repository checkout that has a parent `.flavor-grenade.toml`. | Root README remains CommonMark or inactive as specified by the workspace boundary and does not detect as OFM/project flavor because of child fixtures or ancestor markers outside the active workspace root. |

## Spawned-Server IDs

### MF-I-005

Spawned-server temp workspace evidence for [[docs/design/markdown-flavor-auto-detection]], `.flavor-grenade.toml`, workspace
setting, both present, syntax/context inference, invalid configured values,
and fallback precedence.

### MF-I-006 - Handler Refresh Coverage

Spawned-server evidence that flavor changes reach the real LSP handlers for:

- diagnostics publication and pull/refresh paths;
- completion candidate routing;
- definition, references, document links, document symbols, and folding;
- hover;
- semantic tokens;
- `textDocument/prepareRename` and `textDocument/rename`.

### MF-I-007 - Resource-Specific Propagation

Integration evidence for the resource-specific propagation requirement in
[[docs/design/markdown-flavor-auto-detection]]. It must cover a multi-root or
multi-document workspace where at least one document resolves to `obsidian` and
one resolves to `commonmark` or another explicit flavor.

### MF-I-008 - Host Boundary Integration

Integration evidence for `FlavorLSP.HostBoundary.NonLocalReferences`. It must
prove non-local references do not produce vault edits or vault diagnostics
across a real server process boundary and do not trigger network, execution,
dynamic import, or out-of-root file access.

### MF-I-009 - Flavor Security Input Validation

Integration evidence for `Security.Input.FlavorPropagationPayload`,
`Security.Input.ProjectConfigTOMLSafety`, and
`Security.Vault.ProjectConfigConfinement`. It must prove malformed propagation
payloads and unsafe project config evidence fail before state mutation.

### MF-I-010 - Original Markdown Spawned-Server Behavior

Integration evidence for Phase 22. It proves Original Markdown behavior crosses
the JSON-RPC process boundary for parser dispatch, diagnostics, and completion
candidate routing without requiring VS Code UI.

### MF-I-011 - CommonMark Spawned-Server Behavior

Integration evidence for Phase 23. It proves CommonMark behavior crosses the
JSON-RPC process boundary for parser dispatch, diagnostics, and completion
candidate routing without requiring VS Code UI.

### MF-I-012 - Obsidian Spawned-Server Behavior

Integration evidence for Phase 24. It proves Obsidian behavior crosses the
JSON-RPC process boundary for parser dispatch and diagnostic behavior without
requiring VS Code UI or `ofmarkdown` language-mode promotion.

### MF-I-013 - GFM Spawned-Server Behavior

Integration evidence for Phase 25. It proves GFM behavior crosses the JSON-RPC
process boundary for parser dispatch, local syntax counts, diagnostics, and
inactive Obsidian syntax without requiring VS Code UI.

### MF-I-014 - GLFM Spawned-Server Behavior

Integration evidence for Phase 26. It proves GLFM behavior crosses the JSON-RPC
process boundary for parser dispatch, local syntax counts, diagnostics,
inactive Obsidian syntax, and GitLab host-boundary classification without
requiring GitLab service access or VS Code UI.

### MF-I-015 - Pandoc Spawned-Server Behavior

Integration evidence for Phase 27. It proves Pandoc behavior crosses the
JSON-RPC process boundary for parser dispatch, local syntax counts,
diagnostics, inactive Obsidian syntax, and bibliography-bound citation
classification without requiring Pandoc, citeproc, bibliography services, or VS
Code UI.

### MF-I-016 - MultiMarkdown Spawned-Server Behavior

Integration evidence for Phase 28. It proves MultiMarkdown behavior crosses
the JSON-RPC process boundary for parser dispatch, local syntax counts,
diagnostics, inactive Obsidian syntax, and conversion-bound cross-reference
classification without requiring MultiMarkdown, Pandoc, BibTeX, transclusion,
export writers, or VS Code UI.

### MF-I-017 - MDX Spawned-Server Behavior

Integration evidence for Phase 29. It proves MDX behavior crosses the JSON-RPC
process boundary for parser dispatch, local ESM/JSX/expression counts,
diagnostics, inactive Obsidian syntax, and renderer-bound component
classification without requiring MDX compilation, React/TypeScript symbol
lookup, bundlers, dynamic imports, or VS Code `mdx` language-mode ownership.

### MF-I-018 - kramdown Spawned-Server Behavior

Integration evidence for Phase 30. It proves kramdown behavior crosses the
JSON-RPC process boundary for parser dispatch, local attribute, definition
list, table, footnote, and math counts, diagnostics, inactive Obsidian syntax,
and local boundary classification without requiring Ruby, Jekyll, converters,
syntax highlighters, sanitizers, or renderer execution.

### MF-I-019 - Markdown Extra Spawned-Server Behavior

Integration evidence for Phase 31. It proves Markdown Extra behavior crosses
the JSON-RPC process boundary for parser dispatch, local table, definition
list, footnote, abbreviation, fenced-code, and attribute counts, diagnostics,
inactive Obsidian syntax, and local boundary classification without requiring
PHP Markdown Extra execution, HTML conversion, syntax highlighters, generated
metadata, or renderer execution.

### MF-I-020 - R Markdown Spawned-Server Behavior

Integration evidence for Phase 32. It proves R Markdown behavior crosses the
JSON-RPC process boundary for parser dispatch, local YAML metadata, chunk,
chunk-option, inline-expression, and malformed-chunk counts, diagnostics,
inactive Obsidian syntax, and execution-bound classification without requiring
R, Python, shell, notebook, knitr, Pandoc, Shiny, package, cache, runtime, or
generated-output execution.

### MF-I-021 - Reddit Markdown Spawned-Server Behavior

Integration evidence for Phase 33. It proves Reddit Markdown behavior crosses
the JSON-RPC process boundary for parser dispatch, local spoiler, superscript,
strikethrough, table, host-reference, old-Reddit list, and unsafe-link counts,
diagnostics, inactive Obsidian syntax, and non-local host classification without
requiring Reddit API calls, live user/subreddit/post/comment lookup, moderation
state, or Rich Text editor rendering.

### MF-I-022 - Stack Overflow Markdown Spawned-Server Behavior

Integration evidence for Phase 34. It proves Stack Overflow Markdown behavior
crosses the JSON-RPC process boundary for parser dispatch, local tag-reference,
spoiler, language-directive, fence-hint, table, and malformed-directive counts,
diagnostics, inactive Obsidian syntax, and non-local host classification without
requiring Stack Exchange API calls, live tag/question/answer/user/comment
lookup, site metadata, or rendered post/comment HTML behavior.

### MF-I-023 - Syntax Inference Spawned-Server Behavior

Integration evidence that Auto Detect can resolve TOML-absent documents from
strong local syntax and bounded context. It must include positive inference
fixtures for every inferable flavor listed in
[[docs/design/markdown-flavor-auto-detection]], plus ambiguity fixtures that
fall back to CommonMark.

### MF-I-024 - Fixture Boundary Spawned-Server Behavior

Integration evidence that workspace/vault boundaries constrain marker search.
It must prove the smoketest root README is not treated as OFM when opened as a
workspace root with only child fixture TOML files, and is not polluted by a
repository-level `.flavor-grenade.toml` when run from the development checkout.

## Exit Criteria

- Flavor state survives a real LSP process boundary.
- Every required flavor id can be applied without restart.
- `.flavor-grenade.toml`, workspace setting, precedence, and invalid-value
  fallback are proven across the process boundary.
- TOML-absent inference, ambiguity fallback, and fixture-boundary confinement
  are proven across the process boundary.
- Diagnostics, completion, navigation, hover, semantic tokens, and rename all
  consume refreshed effective flavor state.
- Host-boundary references stay non-local across diagnostics, navigation,
  hover, and rename surfaces.
- Malformed flavor payloads and unsafe TOML evidence cannot mutate effective
  flavor state.
- Invalid flavor ids fail without corrupting active document state.
