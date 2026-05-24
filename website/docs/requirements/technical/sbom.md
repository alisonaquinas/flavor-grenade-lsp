# Website Software Bill of Materials

This high-level SBOM covers the static website package. It tracks direct
sources, authors or maintainers, and licenses. Release automation should still
generate a machine-readable SBOM from `website/package.json` and
`website/package-lock.json`.

## Package Identity

| Field | Value |
|---|---|
| Package | `flavor-grenade-lsp-website` |
| Version | `0.0.0` |
| Publication | Private npm package; static artifacts publish to AWS S3 |
| Source | <https://github.com/alisonaquinas/flavor-grenade-lsp> |
| Author | Alison Aquinas |
| Lockfile | `website/package-lock.json` |

## Runtime Materials

| Component | Source | Author or maintainer | License |
|---|---|---|---|
| `commonloom` | <https://github.com/alisonaquinas/commonloom> | Alison Aquinas | MIT |
| `svelte` | <https://github.com/sveltejs/svelte> | Svelte maintainers | MIT |

## Build And Verification Materials

| Component group | Source | Author or maintainer | License |
|---|---|---|---|
| Vite and Svelte build tooling | <https://github.com/vitejs/vite>, <https://github.com/sveltejs/vite-plugin-svelte>, <https://github.com/sveltejs/language-tools> | Vite and Svelte maintainers | MIT |
| TypeScript and Node type tooling | <https://github.com/microsoft/TypeScript>, <https://github.com/DefinitelyTyped/DefinitelyTyped>, <https://github.com/tsconfig/bases> | Microsoft Corporation / DefinitelyTyped and tsconfig contributors | Apache-2.0, MIT |
| ESLint, Svelte lint, and security lint tooling | <https://github.com/eslint/eslint>, <https://github.com/sveltejs/eslint-plugin-svelte>, <https://github.com/eslint-community/eslint-plugin-security> | ESLint, Svelte, and eslint-community maintainers | MIT, Apache-2.0 |
| Test and DOM tooling | <https://github.com/vitest-dev/vitest>, <https://github.com/jsdom/jsdom> | Vitest and jsdom maintainers | MIT |
| Script, schema, and Sass tooling | <https://github.com/privatenumber/tsx>, <https://github.com/colinhacks/zod>, <https://github.com/sass/embedded-host-node> | Hiroki Osame / Colin McDonnell / Sass maintainers | MIT |

## SBOM Requirement

**Tag:** Technical.SBOM.Website
**Gist:** Website releases must include current source, author, license,
static-artifact, and lockfile-derived dependency evidence.
**Fail:** Release evidence lacks an SBOM, the SBOM omits a direct runtime
component, or this inventory disagrees with `website/package.json`.
**Goal:** Every website release has a generated SBOM and this high-level
inventory remains accurate for direct dependencies and tooling groups.
