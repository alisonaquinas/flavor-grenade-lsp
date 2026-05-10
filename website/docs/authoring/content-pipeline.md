# Content Pipeline Authoring

Public website copy is authored in `website/src/content/copy`. Each public
page has one Markdown file, and each Markdown file is mapped to a route through
a page-group `*.manifest.ts` file under `website/src/content`.

## Add Or Update Copy

Edit the Markdown file for the route under `website/src/content/copy`.
Markdown targets CommonMark plus GitHub Flavored Markdown, so headings, lists,
tables, links, images, code fences, blockquotes, task lists, emphasis, and
strikethrough are valid authoring tools.

Each document starts with frontmatter. Required fields are:

- `title`
- `description`

Common optional fields are:

- `h1`
- `summary`
- `related`
- `seo`
- `structuredData`
- `images`

The first H1 should describe the public page. Generated source trace records
preserve the Markdown path, manifest path, content hash, headings, links, and
images so diagnostics can point authors back to the source document.

## Add A Page

1. Add a Markdown file under `website/src/content/copy/<page-group>/`.
2. Add or update the page-group manifest under `website/src/content`.
3. Map the route id to the copy file in the manifest entry.
4. Run `npm run content:check` from `website/`.
5. Run `npm run content:generate` before inspecting generated TypeScript.

Manifests are TypeScript source, not generated output. They keep route
placement, page group, ordering, and output target data out of Markdown while
letting TypeScript check route ids and page groups.

## Images

Content-owned images live under `website/src/content/media`. Reference them
from Markdown with normal image syntax and useful alt text:

```markdown
![Settings screen showing vault selection](vault-settings.png)
```

Use an explicit decorative marker only when an image is genuinely decorative.
Missing media, path traversal, unsupported schemes, and missing alt text are
reported by content validation.

## Inline HTML

inline HTML is allowed when Markdown cannot express the static structure, such
as captions, figures, responsive image markup, or small semantic wrappers.
Inline HTML must stay static and accessible. Scripts, event handlers, iframes,
JavaScript URLs, and runtime embeds are rejected.

## Commands

Run these from `website/`:

```bash
npm run content:check
npm run content:generate
npm run test
npm run typecheck
npm run build
```

`content:check` validates manifests and compares existing generated TypeScript
when generated files are present. A fresh checkout does not need committed
generated files. `content:generate` writes disposable records under
`website/src/content/generated`, which is ignored by git.

## Commonloom Extraction

Commonloom lives in this repository while W8 proves the API. Extraction to a
separate repository should wait until the website adapter has proven the
boundary: Commonloom owns generic Markdown, frontmatter, HTML, link, media, and
source trace behavior; the website adapter owns Flavor Grenade route ids,
renderer compatibility, and generated TypeScript formatting.
