# AGENTS.md — website/src/

Svelte app source and the website content pipeline live here.

## Layout

```text
website/src/
├── content/   # Page manifests, Markdown copy, route ids, and generated modules
├── home/      # Homepage-specific UI/data helpers
├── quality/   # Content and build quality checks
├── seo/       # SEO metadata helpers
├── shell/     # Site shell and navigation
└── theme/     # Theme state and style helpers
```

## Workflows

### Changing a page group

1. Update the Markdown copy under `content/copy/`.
2. Update the matching `*.manifest.ts` if page order, route ids, or metadata
   changed.
3. Run `npm run content:generate` and `npm run content:check`.
4. Run `npm test`.

### Changing app shell or theme behavior

1. Keep text labels and route ids aligned with generated content.
2. Add or update Vitest coverage for behavior changes.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build`.

## Invariants

- Do not hand-edit generated content modules.
- Do not introduce runtime filesystem reads into the static site.
- Keep route ids stable unless redirects and content references are updated.
- Keep public copy consistent with the server and extension package behavior.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [README.md](./README.md)
