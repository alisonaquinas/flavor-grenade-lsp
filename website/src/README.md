# Website Source

This directory contains the Svelte app, static content pipeline, SEO helpers,
quality checks, theme code, and UI shell for the public website.

## Areas

| Path | Purpose |
|---|---|
| `content/` | Page manifests, copied Markdown, route ids, and generated modules. |
| `content/pipeline/website/` | Compiler that turns page manifests and Markdown into website modules. |
| `home/` | Homepage-specific data and view helpers. |
| `quality/` | Runtime and build-time quality checks. |
| `seo/` | Metadata and route SEO helpers. |
| `shell/` | App shell layout and navigation helpers. |
| `theme/` | Theme state and styling helpers. |

## Invariants

- The content pipeline owns generated page data; UI code consumes generated
  modules instead of reparsing Markdown at runtime.
- Route ids must stay aligned with manifests and tests.
- Public copy must not contradict root README, extension README, or release
  packaging behavior.

## See Also

- [Parent README](../README.md)
- [AGENTS.md](./AGENTS.md)
- [Content pipeline architecture](../docs/architecture/content-pipeline.md)
