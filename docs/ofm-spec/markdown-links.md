---
title: OFM Spec - Standard Markdown Links
tags:
  - ofm-spec/markdown-links
  - ofm-spec
aliases:
  - Markdown Links
  - Standard Markdown Links
---

# Standard Markdown Links

OFMarkdown inherits standard Markdown link forms from CommonMark. Flavor
Grenade analyzes only the local vault-targeting subset. External URLs remain
ordinary Markdown and are not vault references.

## Rule Codes

| Code | Rule |
|---|---|
| `OFM-MDLINK-001` | Inline links of the form `[text](target)` are parsed after OFM wiki-links and embeds. |
| `OFM-MDLINK-002` | Reference link definitions `[label]: target "title"` define document-local labels. |
| `OFM-MDLINK-003` | Reference link uses `[text][label]`, `[label][]`, and `[label]` resolve only to definitions in the same document. |
| `OFM-MDLINK-004` | Only local file targets participate in vault resolution; external URLs and unknown schemes are opaque. |
| `OFM-MDLINK-005` | Markdown image links `![alt](target)` targeting local files are attachment references. |

## Local Target Definition

A Markdown link target is local when it is:

- a relative path such as `notes/alpha.md`
- an absolute vault path represented relative to the vault root after
  normalization
- a fragment attached to a local path such as `alpha.md#Overview`
- a same-document fragment such as `#Overview`

A target is not local when it has a non-file URL scheme such as `https:`,
`http:`, `mailto:`, `tel:`, or any unrecognized scheme.

## Parse Precedence

Standard Markdown links are parsed after:

1. fenced code
2. math
3. comments
4. templater
5. embeds
6. wiki-links

This preserves the existing rule that `![[asset.png]]` is an embed and
`[[note]]` is a wiki-link, not a CommonMark bracket sequence.

## Reference Definitions

Reference definitions are document-local. A definition in one document does not
define labels for another document.

```markdown
[alpha]: notes/alpha.md "Optional title"
```

The label portion is matched case-insensitively, following CommonMark
expectations. The target portion is analyzed as a local vault target only when
it satisfies `OFM-MDLINK-004`.

## Related

- [[docs/ofm-spec/index]]
- [[wiki-links]]
- [[embeds]]
- [[ADR017-standard-markdown-link-intelligence]]
- [[docs/features/ofmarkdown-parity-roadmap]]
