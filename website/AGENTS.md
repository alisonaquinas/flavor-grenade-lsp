# AGENTS.md — website/

The static documentation website package lives here. It has its own npm
toolchain and builds from checked-in Markdown content plus generated TypeScript
modules.

## Layout

```text
website/
├── src/                 # Svelte app, content pipeline, SEO, theme, and shell
├── scripts/content/     # Content generation and validation CLIs
├── docs/                # Website-specific requirements and architecture docs
├── tests/               # Vitest tests
├── package.json         # Website npm scripts and dependencies
└── README.md            # Human-facing website package guide
```

## Workflows

### Changing website content or content pipeline behavior

1. Update Markdown copy, manifests, or pipeline code.
2. Run `npm run content:generate`.
3. Run `npm run content:check`.
4. Run `npm test` and `npm run build`.

### Changing UI code

1. Keep page text sourced from content modules unless the shell itself owns it.
2. Run `npm run lint`, `npm run typecheck`, and `npm test`.
3. Build before publishing or changing Pages workflow behavior.

## Invariants

- Generated content modules must be reproducible from tracked Markdown and
  manifests.
- Do not edit generated output directly.
- Website docs under `website/docs/` use the OFM documentation lint profile.
- Keep public user-facing copy consistent with root and extension behavior.

## See Also

- [Root AGENTS.md](../AGENTS.md)
- [README.md](./README.md)
- [Content pipeline docs](./docs/architecture/content-pipeline.md)
