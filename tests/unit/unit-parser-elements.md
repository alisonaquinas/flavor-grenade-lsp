---
title: Unit Tests — Parser Elements
tags: [test/unit, test/tdd, module/parser]
aliases: [Unit Tests Parser Elements, Element Parser Tests]
---

> [!INFO] Each element parser is a focused unit. Tests pass raw Markdown strings and assert on the extracted element arrays. Ignore-region cases are critical — OFM elements inside code, math, or comments must not appear in the output.

## Overview

This document specifies the RED-phase unit tests for the individual element parsers in `ParserModule`. Each parser is tested in isolation; ignore-region enforcement is a cross-cutting concern verified within each relevant describe block. See [[concepts/document-model]], [[architecture/layers]], and [[adr/ADR010-tests-directory-structure]].

---

## WikiLinkParser

Spec file: `tests/unit/parser/wiki-link-parser.spec.ts`
Source mirror: `src/parser/wiki-link-parser.ts`

---

### TC-UNIT-ELEM-001 — WikiLinkParser: basic link with no anchor or label

**Class / Service:** `WikiLinkParser`
**Spec file:** `tests/unit/parser/wiki-link-parser.spec.ts`
**Linked FR:** `FR-WIKILINK-BASIC`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('[[Note]] → target "Note", anchor null, label null', () => {
  const parser = new WikiLinkParser()
  const links = parser.parse('See [[Note]] here.')

  expect(links).toHaveLength(1)
  expect(links[0].target).toBe('Note')
  expect(links[0].anchor).toBeNull()
  expect(links[0].label).toBeNull()
})
```

**GREEN — Implementation satisfies when:**

- `[[Note]]` produces exactly one `WikiLink` with `target = "Note"`, `anchor = null`, `label = null`.
- Position offsets are present (non-negative integers).

---

### TC-UNIT-ELEM-002 — WikiLinkParser: heading anchor

**Class / Service:** `WikiLinkParser`
**Spec file:** `tests/unit/parser/wiki-link-parser.spec.ts`
**Linked FR:** `FR-WIKILINK-ANCHOR`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('[[Note#Heading]] → target "Note", anchor "Heading", label null', () => {
  const parser = new WikiLinkParser()
  const links = parser.parse('[[Note#Heading]]')

  expect(links).toHaveLength(1)
  expect(links[0].target).toBe('Note')
  expect(links[0].anchor).toBe('Heading')
  expect(links[0].label).toBeNull()
})
```

**GREEN — Implementation satisfies when:**

- The `#` delimiter splits `target` and `anchor`.
- `anchor` is not prefixed with `^` (that is the block-anchor syntax, handled separately).

---

### TC-UNIT-ELEM-003 — WikiLinkParser: block anchor reference

**Class / Service:** `WikiLinkParser`
**Spec file:** `tests/unit/parser/wiki-link-parser.spec.ts`
**Linked FR:** `FR-WIKILINK-BLOCKREF`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('[[Note#^blockid]] → target "Note", blockAnchor "blockid", label null', () => {
  const parser = new WikiLinkParser()
  const links = parser.parse('[[Note#^blockid]]')

  expect(links).toHaveLength(1)
  expect(links[0].target).toBe('Note')
  expect(links[0].blockAnchor).toBe('blockid')
  expect(links[0].anchor).toBeNull()
  expect(links[0].label).toBeNull()
})
```

**GREEN — Implementation satisfies when:**

- `#^` prefix after the target produces a `blockAnchor` field, not the `anchor` field.
- `anchor` remains `null` when a `blockAnchor` is present.

---

### TC-UNIT-ELEM-004 — WikiLinkParser: display label

**Class / Service:** `WikiLinkParser`
**Spec file:** `tests/unit/parser/wiki-link-parser.spec.ts`
**Linked FR:** `FR-WIKILINK-LABEL`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('[[Note|Display Label]] → target "Note", label "Display Label"', () => {
  const parser = new WikiLinkParser()
  const links = parser.parse('[[Note|Display Label]]')

  expect(links).toHaveLength(1)
  expect(links[0].target).toBe('Note')
  expect(links[0].label).toBe('Display Label')
  expect(links[0].anchor).toBeNull()
})
```

**GREEN — Implementation satisfies when:**

- The `|` delimiter separates `target` from `label`.
- `label` preserves internal spaces exactly.

---

### TC-UNIT-ELEM-005 — WikiLinkParser: heading anchor with label

**Class / Service:** `WikiLinkParser`
**Spec file:** `tests/unit/parser/wiki-link-parser.spec.ts`
**Linked FR:** `FR-WIKILINK-ANCHOR`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('[[Note#Heading|Label]] → target "Note", anchor "Heading", label "Label"', () => {
  const parser = new WikiLinkParser()
  const links = parser.parse('[[Note#Heading|Label]]')

  expect(links).toHaveLength(1)
  expect(links[0].target).toBe('Note')
  expect(links[0].anchor).toBe('Heading')
  expect(links[0].label).toBe('Label')
})
```

**GREEN — Implementation satisfies when:**

- Both `#` and `|` delimiters are parsed from a single token.
- The three fields `target`, `anchor`, and `label` are all populated.

---

### TC-UNIT-ELEM-006 — WikiLinkParser: multiple wiki-links in one paragraph — all found

**Class / Service:** `WikiLinkParser`
**Spec file:** `tests/unit/parser/wiki-link-parser.spec.ts`
**Linked FR:** `FR-WIKILINK-MULTI`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('multiple wiki-links in one paragraph — all three are found', () => {
  const text = 'See [[Alpha]], [[Beta#Section]], and [[Gamma|Alias]] for context.'
  const parser = new WikiLinkParser()
  const links = parser.parse(text)

  expect(links).toHaveLength(3)
  expect(links[0].target).toBe('Alpha')
  expect(links[1].target).toBe('Beta')
  expect(links[1].anchor).toBe('Section')
  expect(links[2].target).toBe('Gamma')
  expect(links[2].label).toBe('Alias')
})
```

**GREEN — Implementation satisfies when:**

- All three links are returned in document order.
- Each link's position offsets are distinct and non-overlapping.

---

## EmbedParser

Spec file: `tests/unit/parser/embed-parser.spec.ts`
Source mirror: `src/parser/embed-parser.ts`

---

### TC-UNIT-ELEM-007 — EmbedParser: basic file embed

**Class / Service:** `EmbedParser`
**Spec file:** `tests/unit/parser/embed-parser.spec.ts`
**Linked FR:** `FR-EMBED-BASIC`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('![[image.png]] → embed with target "image.png", no anchor', () => {
  const parser = new EmbedParser()
  const embeds = parser.parse('![[image.png]]')

  expect(embeds).toHaveLength(1)
  expect(embeds[0].target).toBe('image.png')
  expect(embeds[0].anchor).toBeNull()
  expect(embeds[0].blockAnchor).toBeUndefined()
})
```

**GREEN — Implementation satisfies when:**

- The leading `!` distinguishes an embed from a wiki-link.
- `target` is `"image.png"` with no anchor or block anchor.

---

### TC-UNIT-ELEM-008 — EmbedParser: note section embed with heading anchor

**Class / Service:** `EmbedParser`
**Spec file:** `tests/unit/parser/embed-parser.spec.ts`
**Linked FR:** `FR-EMBED-ANCHOR`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('![[Note#Heading]] → embed with target "Note", anchor "Heading"', () => {
  const parser = new EmbedParser()
  const embeds = parser.parse('![[Note#Heading]]')

  expect(embeds).toHaveLength(1)
  expect(embeds[0].target).toBe('Note')
  expect(embeds[0].anchor).toBe('Heading')
})
```

**GREEN — Implementation satisfies when:**

- `#` delimiter produces an `anchor` field on the `Embed` object.
- `target` is `"Note"` without the anchor suffix.

---

### TC-UNIT-ELEM-009 — EmbedParser: block anchor embed

**Class / Service:** `EmbedParser`
**Spec file:** `tests/unit/parser/embed-parser.spec.ts`
**Linked FR:** `FR-EMBED-BLOCKREF`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('![[Note#^blockid]] → embed with target "Note", blockAnchor "blockid"', () => {
  const parser = new EmbedParser()
  const embeds = parser.parse('![[Note#^blockid]]')

  expect(embeds).toHaveLength(1)
  expect(embeds[0].target).toBe('Note')
  expect(embeds[0].blockAnchor).toBe('blockid')
  expect(embeds[0].anchor).toBeNull()
})
```

**GREEN — Implementation satisfies when:**

- `#^` prefix routes the suffix to `blockAnchor`, not `anchor`.
- `anchor` is `null` when `blockAnchor` is set.

---

## BlockAnchorParser

Spec file: `tests/unit/parser/block-anchor-parser.spec.ts`
Source mirror: `src/parser/block-anchor-parser.ts`

---

### TC-UNIT-ELEM-010 — BlockAnchorParser: valid anchor at end of paragraph line

**Class / Service:** `BlockAnchorParser`
**Spec file:** `tests/unit/parser/block-anchor-parser.spec.ts`
**Linked FR:** `FR-BLOCKANCHOR`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('^myblock at end of paragraph line → BlockAnchor with id "myblock"', () => {
  const text = 'This is a paragraph. ^myblock'
  const parser = new BlockAnchorParser()
  const anchors = parser.parse(text)

  expect(anchors).toHaveLength(1)
  expect(anchors[0].id).toBe('myblock')
})
```

**GREEN — Implementation satisfies when:**

- A `^id` token at the trailing position of a line (after optional whitespace) is recognized as a `BlockAnchor`.
- The caret is not included in `id`.

---

### TC-UNIT-ELEM-011 — BlockAnchorParser: alphanumeric anchor id with hyphens

**Class / Service:** `BlockAnchorParser`
**Spec file:** `tests/unit/parser/block-anchor-parser.spec.ts`
**Linked FR:** `FR-BLOCKANCHOR`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('^123abc and ^my-block-id — both valid anchor ids extracted', () => {
  const text = 'First item. ^123abc\nSecond item. ^my-block-id'
  const parser = new BlockAnchorParser()
  const anchors = parser.parse(text)

  expect(anchors).toHaveLength(2)
  expect(anchors[0].id).toBe('123abc')
  expect(anchors[1].id).toBe('my-block-id')
})
```

**GREEN — Implementation satisfies when:**

- Anchor ids consisting of alphanumeric characters and hyphens (in any combination) are all accepted.
- Both anchors are returned in document order.

---

### TC-UNIT-ELEM-012 — BlockAnchorParser: caret mid-paragraph NOT extracted as anchor

**Class / Service:** `BlockAnchorParser`
**Spec file:** `tests/unit/parser/block-anchor-parser.spec.ts`
**Linked FR:** `FR-BLOCKANCHOR`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('^id in the middle of a paragraph — NOT extracted as a block anchor', () => {
  const text = 'Text with ^id in the middle of a sentence, continuing here.'
  const parser = new BlockAnchorParser()
  const anchors = parser.parse(text)

  expect(anchors).toHaveLength(0)
})
```

**GREEN — Implementation satisfies when:**

- A `^id` token that is not at the end of its line (i.e., followed by non-whitespace on the same line) is not extracted.
- The OFM spec requires block anchors to occupy the trailing position.

---

### TC-UNIT-ELEM-013 — BlockAnchorParser: anchor inside code fence NOT extracted

**Class / Service:** `BlockAnchorParser`
**Spec file:** `tests/unit/parser/block-anchor-parser.spec.ts`
**Linked FR:** `FR-BLOCKANCHOR`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('block anchor inside a code fence — NOT extracted (ignore region)', () => {
  const text = [
    'Real anchor. ^realId',
    '',
    '```',
    'code line ^fakeId',
    '```',
  ].join('\n')
  const parser = new BlockAnchorParser()
  const anchors = parser.parse(text)

  expect(anchors).toHaveLength(1)
  expect(anchors[0].id).toBe('realId')
})
```

**GREEN — Implementation satisfies when:**

- The parser receives pre-computed ignore regions from stage 3.
- Any `^id` token whose position falls within an ignore region is skipped.

---

## TagParser

Spec file: `tests/unit/parser/tag-parser.spec.ts`
Source mirror: `src/parser/tag-parser.ts`

---

### TC-UNIT-ELEM-014 — TagParser: basic inline tag

**Class / Service:** `TagParser`
**Spec file:** `tests/unit/parser/tag-parser.spec.ts`
**Linked FR:** `FR-TAG-INLINE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('#tag inline → Tag with name "tag" extracted', () => {
  const parser = new TagParser()
  const tags = parser.parseInline('Filed under #tag today.')

  expect(tags).toHaveLength(1)
  expect(tags[0].name).toBe('tag')
})
```

**GREEN — Implementation satisfies when:**

- A `#word` token preceded by whitespace (or at start of text) is recognized as a tag.
- `name` does not include the leading `#`.

---

### TC-UNIT-ELEM-015 — TagParser: hierarchical tag with slash path

**Class / Service:** `TagParser`
**Spec file:** `tests/unit/parser/tag-parser.spec.ts`
**Linked FR:** `FR-TAG-HIERARCHY`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('#project/active → hierarchical tag with full path preserved', () => {
  const parser = new TagParser()
  const tags = parser.parseInline('This is #project/active work.')

  expect(tags).toHaveLength(1)
  expect(tags[0].name).toBe('project/active')
})
```

**GREEN — Implementation satisfies when:**

- The `/` separator is included in the tag `name` as part of the hierarchical path.
- Multi-level paths (e.g., `a/b/c`) are also preserved in full.

---

### TC-UNIT-ELEM-016 — TagParser: YAML frontmatter tags array → two TagRef entries

**Class / Service:** `TagParser`
**Spec file:** `tests/unit/parser/tag-parser.spec.ts`
**Linked FR:** `FR-TAG-FRONTMATTER`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('YAML frontmatter tags: [project, archive] → two TagRef entries from frontmatter', () => {
  const frontmatter = { tags: ['project', 'archive'] }
  const parser = new TagParser()
  const tags = parser.parseFrontmatterTags(frontmatter)

  expect(tags).toHaveLength(2)
  expect(tags[0].name).toBe('project')
  expect(tags[0].source).toBe('frontmatter')
  expect(tags[1].name).toBe('archive')
  expect(tags[1].source).toBe('frontmatter')
})
```

**GREEN — Implementation satisfies when:**

- `parseFrontmatterTags` accepts the parsed frontmatter map and returns a `Tag[]` with `source = 'frontmatter'`.
- Inline tag scanning is separate from frontmatter tag parsing.

---

### TC-UNIT-ELEM-017 — TagParser: tag inside code span NOT extracted

**Class / Service:** `TagParser`
**Spec file:** `tests/unit/parser/tag-parser.spec.ts`
**Linked FR:** `FR-TAG-INLINE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('#tag inside backtick code span — NOT extracted', () => {
  const parser = new TagParser()
  const tags = parser.parseInline('Use `#notATag` in your code; see #realTag.')

  expect(tags).toHaveLength(1)
  expect(tags[0].name).toBe('realTag')
})
```

**GREEN — Implementation satisfies when:**

- Backtick code spans (inline ignore regions) are identified before tag scanning.
- Any `#word` inside a code span is not emitted as a `Tag`.

---

### TC-UNIT-ELEM-018 — TagParser: numeric-only tag NOT a valid OFM tag

**Class / Service:** `TagParser`
**Spec file:** `tests/unit/parser/tag-parser.spec.ts`
**Linked FR:** `FR-TAG-INLINE`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('#123 — tag starting with digit is NOT a valid OFM tag', () => {
  const parser = new TagParser()
  const tags = parser.parseInline('Reference #123 and #abc.')

  expect(tags).toHaveLength(1)
  expect(tags[0].name).toBe('abc')
})
```

**GREEN — Implementation satisfies when:**

- The tag regex requires the first character after `#` to be a Unicode letter or underscore, not a digit.
- `#123` is silently ignored; no error is thrown.

---

## CalloutParser

Spec file: `tests/unit/parser/callout-parser.spec.ts`
Source mirror: `src/parser/callout-parser.ts`

---

### TC-UNIT-ELEM-019 — CalloutParser: basic NOTE callout

**Class / Service:** `CalloutParser`
**Spec file:** `tests/unit/parser/callout-parser.spec.ts`
**Linked FR:** `FR-CALLOUT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('> [!NOTE] → callout type "NOTE"', () => {
  const text = '> [!NOTE]\n> This is a note callout.'
  const parser = new CalloutParser()
  const callouts = parser.parse(text)

  expect(callouts).toHaveLength(1)
  expect(callouts[0].type).toBe('NOTE')
  expect(callouts[0].title).toBeNull()
})
```

**GREEN — Implementation satisfies when:**

- The `> [!TYPE]` opener on the first line of a blockquote is recognized as a callout.
- `type` is the uppercased string between `[!` and `]`.
- When no title follows on the same line, `title` is `null`.

---

### TC-UNIT-ELEM-020 — CalloutParser: callout with title text on opener line

**Class / Service:** `CalloutParser`
**Spec file:** `tests/unit/parser/callout-parser.spec.ts`
**Linked FR:** `FR-CALLOUT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('> [!WARNING] Title text → callout type "WARNING", title text captured', () => {
  const text = '> [!WARNING] Be careful here\n> Details follow.'
  const parser = new CalloutParser()
  const callouts = parser.parse(text)

  expect(callouts).toHaveLength(1)
  expect(callouts[0].type).toBe('WARNING')
  expect(callouts[0].title).toBe('Be careful here')
})
```

**GREEN — Implementation satisfies when:**

- Any text after `]` (bracket-space) on the opener line is captured as `title`.
- `title` is trimmed of leading and trailing whitespace.

---

### TC-UNIT-ELEM-021 — CalloutParser: custom callout type preserved as-is

**Class / Service:** `CalloutParser`
**Spec file:** `tests/unit/parser/callout-parser.spec.ts`
**Linked FR:** `FR-CALLOUT`
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('> [!custom-type] → custom type string preserved as-is', () => {
  const text = '> [!custom-type]\n> Body.'
  const parser = new CalloutParser()
  const callouts = parser.parse(text)

  expect(callouts).toHaveLength(1)
  expect(callouts[0].type).toBe('custom-type')
})
```

**GREEN — Implementation satisfies when:**

- The `type` field stores exactly the string between `[!` and `]` without normalization.
- Custom types containing hyphens and lowercase letters are preserved unchanged.
- No validation is applied against a fixed list of known callout types.
