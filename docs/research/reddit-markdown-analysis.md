---
title: "Reddit Markdown Analysis"
aliases:
  - "Reddit Markdown"
  - "Reddit-specific Markdown"
tags:
  - research
  - markdown
  - reddit
status: imported
format: obsidian-flavored-markdown
source_type: web-research
processed: 2026-05-12
---
# Reddit Markdown Analysis

> [!INFO] Related research
> - [[commonmark-and-original-markdown|CommonMark and Original Markdown]]
> - [[github-flavored-markdown-analysis|GitHub Flavored Markdown Analysis]]
> - [[gitlab-flavored-markdown-analysis|GitLab Flavored Markdown Analysis]]
> - [[stack-overflow-markdown-analysis|Stack Overflow Markdown Analysis]]
> - [[mdx-analysis|MDX Analysis]]

## Executive Summary

Reddit Markdown is a platform dialect, not a formal standalone specification. Reddit's current help page describes it as a "Reddit-specific version of Markdown" whose parsing and rendering have evolved over time. That matters because Reddit behavior is tied to editor mode and platform surface: comments and posts on reddit.com default to the Rich Text editor, while raw Markdown is submitted only when the author switches to Markdown Editor. Markdown is also used in community wikis, old Reddit submission text, sidebars, community rules, and some profile-card text.

The closest practical baseline is CommonMark/GFM-like Markdown plus Reddit-only behavior. Reddit supports ordinary paragraphs, emphasis, links, headings, lists, blockquotes, tables, inline code, fenced code blocks, thematic breaks, strikethrough, spoilers, and superscript. The portability traps are Reddit-specific spoilers (`>!spoiler!<`), superscript syntax (`^word` and `^(phrase)`), URL-scheme restrictions, ordered-list compatibility differences between www.reddit.com and old Reddit, and the fact that Rich Text input is not the same thing as Markdown input.

For authoring tools, "Reddit Markdown support" should mean two things: generate conservative Markdown that Reddit accepts, and avoid assuming the same source will render identically across old Reddit, new Reddit, mobile clients, third-party clients, and Reddit's Rich Text editor. For archival or cross-platform migration, treat Reddit Markdown as user-interface behavior plus a Markdown-ish parser, not as a stable interchange format.

## Platform Model

Reddit's official help now separates the authoring interfaces clearly:

| Surface | Markdown status | Practical implication |
|---|---|---|
| reddit.com comments/posts | Rich Text editor by default; Markdown only if Markdown Editor is selected | Raw Markdown typed into Rich Text may remain literal or be transformed differently. |
| old.reddit.com | Markdown-centered workflow | Best target when authors need predictable raw Markdown entry. |
| Mobile apps | Markdown is documented as available, but behavior can lag or differ by client/version | Test mobile separately for high-value posts. |
| Community wikis | Markdown supported | Useful for long-lived community docs, but still Reddit-rendered. |
| Sidebar, rules, submission text | Markdown supported in specific locations | Context matters; not every community text field is equivalent. |

The current help page was updated on April 27, 2026, so this note treats it as the authoritative current user-facing reference. It also shows why old Reddit compatibility still matters: the guide explicitly warns that `1)` ordered lists work only on www.reddit.com and recommends `1.` for old Reddit compatibility.

## Feature Inventory

| Feature | Reddit syntax | Notes |
|---|---|---|
| Paragraphs | Blank line between paragraphs | Extra blank lines do not create extra rendered spacing. |
| Hard line breaks | Conventional Markdown line-break behavior | Prefer blank lines for paragraph separation. |
| Emphasis | `*text*`, `_text_` | Intraword emphasis is documented for asterisks, not underscores. |
| Strong | `**text**`, `__text__` | Standard Markdown-style syntax. |
| Strong emphasis | `***text***`, `___text___` | Supported for bold-italic. |
| Strikethrough | `~~text~~` | GFM-like extension. |
| Spoilers | `>!spoiler text!<` | Reddit-specific and not portable to CommonMark. |
| Superscript | `^word`, `^(multiple words)` | Reddit-specific; phrase form is safer. |
| Links | `[label](https://example.com)` | Reddit generally requires an accepted URL scheme. |
| Headings | `#` through `######`; Setext `===` and `---` | Similar to CommonMark-style headings. |
| Lists | `-`, `*`, `1.`, and on new Reddit `1)` | Ordered lists must start with `1`; `1)` is not old Reddit-compatible. |
| Blockquotes | `>` | Multi-line blockquotes should prefix each line. |
| Tables | Pipe table with separator row | Alignment uses colons in the separator row. |
| Inline code | Backticks | Markdown is not interpreted inside code. |
| Code blocks | Fenced backticks or tildes | Nested fence examples need longer fences or alternate fence characters. |
| Thematic breaks | `---`, `***`, `___` | Standard Markdown-style rule. |

## Syntax Examples

`````markdown
**Bold**, *italic*, ~~deleted~~, and ^(superscript text).

>!This is a spoiler.!<

| Ticker | Investment | Profit |
|:-------|-----------:|:------:|
| BTC    | $100       | -$50   |

````
```js
console.log("Use a longer outer fence for nested examples.")
```
````
`````

## Portability

The portable subset is small: paragraphs, emphasis, links with explicit schemes, headings, blockquotes, simple lists, inline code, fenced code blocks, and simple pipe tables. Spoilers and superscript are Reddit-only. Ordered lists should use `1.` style if content may render on old Reddit. For cross-posting to GitHub, GitLab, Stack Overflow, or Obsidian, replace Reddit spoilers with platform-specific callouts or HTML details blocks, and replace superscript with plain text, HTML `<sup>`, or the target platform's supported syntax.

## Security and Rendering Notes

Reddit is a hosted platform renderer. Authors cannot rely on arbitrary raw HTML, scripts, or custom attributes. Link handling is constrained by allowed URL prefixes such as `http://`, `https://`, `mailto:`, relative `/`, and fragment `#` links. That constraint is useful for safety but makes Reddit Markdown less general than [[pandoc-markdown-deep-research-report|Pandoc Markdown]], [[kramdown-analysis|kramdown]], or [[markdown-extra-analysis|Markdown Extra]].

The main authoring risk is not script execution; it is editor-mode mismatch. A post composed in Rich Text mode is not necessarily the same artifact as a post composed in Markdown mode. Tools that generate Reddit text should tell users to switch to Markdown Editor before pasting.

## Validation Checklist

- Test examples in Markdown Editor, not only Rich Text.
- Check old.reddit.com if old Reddit compatibility matters.
- Prefer `1.` ordered lists over `1)`.
- Use explicit URL schemes in links.
- Use longer outer fences when showing Markdown code fences inside Markdown.
- Avoid relying on raw HTML, custom attributes, or non-Reddit extensions.

## Authoritative Sources

- [Reddit Formatting Guide](https://support.reddithelp.com/hc/en-us/articles/360043033952-Formatting-Guide)
- [How do I format my comment or post?](https://support.reddithelp.com/hc/en-us/articles/205191185-How-do-I-format-my-comment-or-post-)
