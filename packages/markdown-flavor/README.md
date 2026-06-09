# markdown-flavor-detection

Shared Markdown flavor detection and Flavor Grenade config resolution.

This package contains the reusable, editor-independent logic used by
`flavor-grenade-lsp` to decide which Markdown dialect applies to a file. It is
intended for tools that need the same behavior without depending on NestJS, LSP
types, VS Code APIs, or the Flavor Grenade server runtime.

## Install

```bash
npm install markdown-flavor-detection
```

```bash
bun add markdown-flavor-detection
```

## What It Does

- exposes the supported Markdown flavor ids and selector labels;
- detects strong syntax evidence for MDX, R Markdown, GitLab Flavored Markdown,
  Pandoc Markdown, MultiMarkdown, kramdown, Markdown Extra, Reddit Markdown, and
  Stack Overflow Markdown;
- resolves effective flavor state from explicit selections, `.fgattributes`,
  Obsidian markers, syntax inference, and CommonMark fallback;
- parses and applies `.fgignore`;
- parses and applies `.fgattributes` assignments for `flavor` and
  `structured_profiles`;
- infers structured profiles such as Keep a Changelog, Common Changelog, and
  MADR;
- provides a Node filesystem adapter for cascading `.fgignore` and
  `.fgattributes` lookup.

## Supported Flavors

```ts
import {
  MARKDOWN_FLAVOR_IDS,
  MARKDOWN_FLAVOR_SELECTIONS,
  MARKDOWN_FLAVOR_LABELS,
} from 'markdown-flavor-detection';
```

`MARKDOWN_FLAVOR_IDS` contains the concrete dialect ids:

- `original`
- `commonmark`
- `obsidian`
- `gfm`
- `glfm`
- `pandoc`
- `multimarkdown`
- `mdx`
- `kramdown`
- `markdown-extra`
- `r-markdown`
- `reddit`
- `stack-overflow`

`MARKDOWN_FLAVOR_SELECTIONS` includes those ids plus `auto`.

## Resolve a Flavor

```ts
import { resolveMarkdownFlavor } from 'markdown-flavor-detection';

const result = resolveMarkdownFlavor({
  path: 'docs/example.md',
  languageId: 'markdown',
  syntaxText: markdownSource,
  hasObsidianMarker: false,
});

if (result.kind === 'active') {
  console.log(result.effective);
  console.log(result.source);
}
```

Resolution order is:

1. explicit `flavorSelection` or `.fgattributes` flavor;
2. Obsidian marker;
3. strong syntax inference;
4. CommonMark fallback.

Non-Markdown language ids and ignored paths return an inactive result.

```ts
const result = resolveMarkdownFlavor({
  path: 'notes/private.md',
  languageId: 'markdown',
  ignored: true,
});

// { kind: 'inactive', reason: 'fgignore' }
```

## Parse `.fgattributes`

```ts
import { applyFgAttributes, parseFgAttributes } from 'markdown-flavor-detection';

const rules = parseFgAttributes(`
docs/**/*.md flavor=obsidian
docs/adr/*.md structured_profiles=madr
CHANGELOG.md structured_profiles=keep-a-changelog
`);

const attributes = applyFgAttributes(rules, 'docs/adr/0001-example.md');
```

Supported assignment keys:

- `flavor`
- `structured_profiles`
- `structuredProfiles`

Supported reset tokens:

- `!flavor`
- `!structured_profiles`
- `!structuredProfiles`

`structured_profiles` accepts `auto`, `none`, or a comma-separated list of
structured profile ids.

## Parse `.fgignore`

```ts
import { matchFgIgnore, parseFgIgnore } from 'markdown-flavor-detection';

const rules = parseFgIgnore(`
private/**
!private/public.md
`);

console.log(matchFgIgnore(rules, 'private/draft.md')); // true
console.log(matchFgIgnore(rules, 'private/public.md')); // false
```

Ignore and attribute patterns are path-based and use POSIX-style separators.
Callers on Windows can pass native paths to the Node adapter; pure parser APIs
expect vault-relative paths.

## Resolve Config Files From Disk

Use the `./node` export when you want the package to read `.fgignore` and
`.fgattributes` files from a real directory tree.

```ts
import { NodeFlavorConfigResolver, resolveMarkdownFlavor } from 'markdown-flavor-detection/node';

const resolver = new NodeFlavorConfigResolver({ maxConfigBytes: 8192 });
const config = resolver.resolveForFile('/path/to/vault', '/path/to/vault/docs/example.md');

const flavor = resolveMarkdownFlavor({
  path: '/path/to/vault/docs/example.md',
  languageId: 'markdown',
  ignored: config.ignored,
  fgAttributes: config.attributes,
  syntaxText: markdownSource,
});
```

The resolver:

- walks from the vault root to the target file's directory;
- applies nested `.fgignore` files in order;
- applies nested `.fgattributes` files in order;
- rejects paths outside the configured root;
- ignores config files larger than `maxConfigBytes`.

For directory scanning, use `shouldPruneDirectory` to skip ignored subtrees:

```ts
const skip = resolver.shouldPruneDirectory('/path/to/vault', '/path/to/vault/private');
```

## Runtime Boundaries

The root export is pure TypeScript/JavaScript logic. It does not read files and
does not depend on Node-specific modules.

The `markdown-flavor-detection/node` export adds Node filesystem access for
config-file resolution. Use that export in CLIs, language servers, and linting
tools that operate on local files.

## Out of Scope

This package does not parse Markdown into an AST, validate Markdown syntax,
produce LSP diagnostics, or implement editor behavior. It only answers which
flavor and structured profile should apply to a Markdown resource.
