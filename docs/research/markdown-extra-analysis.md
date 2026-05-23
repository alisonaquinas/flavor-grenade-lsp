---
title: "Markdown Extra Analysis"
aliases:
  - "Markdown Extra"
  - "PHP Markdown Extra"
  - "Michel Fortin Markdown Extra"
tags:
  - research
  - markdown
  - markdown-extra
  - php
status: imported
format: obsidian-flavored-markdown
source_type: context7-and-web-research
processed: 2026-05-12
---
# Markdown Extra Analysis

> [!INFO] Related research
> - [[commonmark-and-original-markdown|CommonMark and Original Markdown]]
> - [[kramdown-analysis|kramdown Analysis]]
> - [[multimarkdown-analysis|MultiMarkdown Analysis]]
> - [[github-flavored-markdown-analysis|GitHub Flavored Markdown Analysis]]
> - [[pandoc-markdown-deep-research-report|Pandoc Markdown Deep Research Report]]

## Executive Summary

Markdown Extra is Michel Fortin's extension to PHP Markdown. It fills gaps in original Markdown with syntax for Markdown inside HTML blocks, special attributes, fenced code blocks, tables, definition lists, footnotes, abbreviations, ordered-list starts, refined emphasis rules, and additional backslash escapes. It was historically important because many later Markdown dialects borrowed from it, including [[kramdown-analysis|kramdown]] and [[multimarkdown-analysis|MultiMarkdown]].

Markdown Extra is not CommonMark. It predates CommonMark's formalization work and represents an implementation-centered extension set for PHP publishing. Its table syntax resembles what later became familiar through GFM-style pipe tables, but the details are not identical to the formal GFM spec. Its attribute syntax is more expressive than GFM and closer to kramdown/Pandoc-style authoring.

The practical conclusion is simple: Markdown Extra is excellent historical and implementation context for tables, footnotes, definition lists, and attributes, but new interoperable tools should usually target CommonMark, formal GFM, Pandoc Markdown, or a named host dialect unless they specifically need PHP Markdown Extra compatibility.

## Origin and Scope

PHP Markdown Extra was published in 2005 as an extension on top of PHP Markdown. The current official page says Markdown Extra is available as a separate parser class in PHP Markdown Lib and explains additions to Markdown syntax. A separate 2008 draft specification aimed to define how to parse Markdown Extra documents into a document model and translate them to HTML.

Its scope is practical HTML document authoring:

- keep original Markdown readability
- avoid raw HTML for common structures
- make PHP Markdown more useful for blog and CMS content
- add identifiers, classes, footnotes, tables, definitions, and abbreviations

## Feature Inventory

| Feature | Syntax | Notes |
|---|---|---|
| Markdown inside HTML | `<div markdown="1">...</div>` | Enables Markdown processing inside block HTML. |
| Special attributes | `{#id .class key=value}` | Applies to headers, fenced code blocks, links, and images. |
| Fenced code blocks | Lines of three or more tildes | Introduced a non-indented code block form. |
| Tables | Pipe-separated rows plus separator row | Requires at least one pipe on each line. |
| Alignment | Colons in separator row | Left, right, or center alignment. |
| Definition lists | Term line followed by `: definition` | Multiple terms and multiple definitions supported. |
| Footnotes | `[^id]` plus `[^id]: definition` | Definitions can appear anywhere; rendered in use order. |
| Abbreviations | `*[HTML]: Hyper Text Markup Language` | Definitions are stripped from final output. |
| Ordered-list starts | Non-1 starts honored in HTML | Original Markdown often normalized list starts. |
| Emphasis | Intraword underscores treated literally | Reduces accidental emphasis in identifiers. |
| Backslash escapes | Adds `:` and `|` | Useful for avoiding definition-list/table parsing. |

## Syntax Examples

```markdown
## The Site ## {.main .shine #the-site lang=fr}

[link](https://example.com){#id .primary}
![logo](/logo.png){#logo .big}

| Item     | Value |
|:---------|------:|
| Computer | $1600 |
| Phone    | $12   |

Apple
:   Pomaceous fruit.
:   A technology company.

That's a footnote.[^note]

[^note]: Footnotes can contain multiple paragraphs.

*[HTML]: Hyper Text Markup Language
```

## Markdown Inside HTML

Original Markdown generally does not process Markdown inside block-level HTML. Markdown Extra adds the `markdown` attribute to opt in:

```html
<div markdown="1">
This is *Markdown* inside HTML.
</div>
```

The attribute is removed from the final output, and the content is converted. Ambiguous cases can use `markdown="block"` when block-level parsing is desired. This feature is powerful for template-heavy PHP content, but it is not portable to CommonMark or GFM.

## Tables and Definition Lists

Markdown Extra's table syntax is one of its most influential contributions. It supports optional leading and trailing pipes, a mandatory separator line, inline formatting inside cells, and column alignment with colons. It does not support arbitrary block elements inside table cells.

Definition lists also became influential. A term is followed by one or more colon-prefixed definitions. Definitions can contain paragraphs and block-level elements when indented like list item content. This gave Markdown a practical way to express glossary-like content without raw HTML.

## Footnotes and Abbreviations

Footnotes are modeled like reference links: a marker in the text points to a definition elsewhere. The final footnote list is ordered by first use, not by definition order or label name. Abbreviations are global definitions that wrap matching words in `<abbr>` elements with `title` attributes.

Both features are useful for long-form writing. Neither belongs to original Markdown or CommonMark core.

## Implementation Lineage

| Implementation or dialect | Relationship |
|---|---|
| PHP Markdown Lib | Official PHP implementation family. |
| Parsedown Extra | Independent PHP parser implementing Markdown Extra-style syntax. |
| kramdown | Borrows many Markdown Extra features and specifies stricter behavior. |
| MultiMarkdown | Table syntax is described as generally compatible with PHP Markdown Extra, then extended. |
| Pandoc Markdown | Overlaps in footnotes, attributes, tables, and definition lists, but has its own extension model. |

## Portability

Markdown Extra content can degrade badly in CommonMark-only renderers:

- attribute blocks render as literal text
- definition lists become paragraphs
- footnotes may remain literal
- abbreviations are ignored
- `markdown="1"` inside HTML has no special meaning
- tables may render only in GFM-like tools and may differ on edge cases

For migration to Obsidian, footnotes and tables are usually useful as-is, while attributes and abbreviation definitions may need cleanup. For migration to GFM, keep simple tables and remove definition lists, abbreviations, and special attributes.

## Security Notes

Markdown Extra is designed for HTML output and supports raw HTML plus Markdown inside HTML. That means it should not be used as a security boundary. If user-authored Markdown Extra is rendered to a web page, sanitize the resulting HTML according to the host application's policy.

Special attributes also deserve review because they can add IDs, classes, and simple custom attributes to output elements.

## Validation Checklist

- Use the official PHP Markdown Extra parser or a documented compatible parser.
- Test tables with one-column cases and escaped pipes.
- Check footnote IDs and generated backlinks for accessibility requirements.
- Strip or sanitize raw HTML for untrusted content.
- Avoid Markdown Extra attributes in content meant for CommonMark or formal GFM.
- Document whether "Markdown Extra" means PHP Markdown Extra specifically or a compatible implementation such as Parsedown Extra.

## Authoritative Sources

- [PHP Markdown Extra](https://michelf.ca/projects/php-markdown/extra/)
- [Markdown Extra Specification](https://michelf.ca/specs/markdown-extra/)
- [PHP Markdown](https://michelf.ca/projects/php-markdown/)
- [Parsedown Extra](https://github.com/erusev/parsedown-extra)

