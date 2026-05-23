# src/parser/**tests**/

Unit and integration tests for OFM parsing.

## Responsibilities

- Verify opaque regions are marked before token parsers run.
- Cover wiki links, Markdown links, embeds, headings, tags, block anchors,
  frontmatter, callouts, math, code, comments, and flavor profiles.
- Preserve parser safety around malformed Markdown and unfinished constructs.

Parser tests should prefer explicit token assertions over broad text snapshots.
