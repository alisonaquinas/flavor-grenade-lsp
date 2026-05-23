# Flavor Grenade Website

The website is a Vite, Svelte, and TypeScript static site that publishes the
public product and documentation experience for Flavor Grenade LSP.

## Layout

| Path | Purpose |
|---|---|
| `src/` | Svelte app shell, content pipeline, quality checks, SEO helpers, and theme code. |
| `scripts/content/` | CLI wrappers for generating and checking compiled website content. |
| `docs/` | Website-specific architecture, requirements, and authoring docs. |
| `tests/` | Vitest coverage for content and rendering helpers. |

## Commands

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## See Also

- [Root README](../README.md)
- [Website architecture docs](./docs/architecture/index.md)
- [Website AGENTS.md](./AGENTS.md)
