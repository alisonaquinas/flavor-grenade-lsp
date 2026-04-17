---
title: OFM Spec — Math
tags:
  - ofm-spec/math
  - ofm-spec
aliases:
  - Math Spec
  - OFM Math
  - LaTeX Math Spec
  - MathJax Spec
---

# Math

Obsidian renders LaTeX math using MathJax. Math regions are **opaque** to all OFM analysis — the LSP must skip their content entirely.

Official reference: [Math](https://help.obsidian.md/Editing+and+formatting/Advanced+formatting+syntax#Math)

---

## Block Math

Block math uses `$$` delimiters on their own lines:

```markdown
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

- Opening `$$` must be on its own line (trailing whitespace is tolerated).
- Closing `$$` must be on its own line.
- Content between the delimiters is LaTeX math mode — not OFM.
- Block math is rendered as a centered display equation.

---

## Inline Math

Inline math uses single `$` delimiters within a line:

```markdown
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.
```

Inline math rules:
- No newlines inside `$...$`.
- The character immediately after the opening `$` must **not** be a space. This prevents `$ 5.00` (a price) from being mistaken for math.
- The character immediately before the closing `$` must not be a space.

---

## Regex

Block math scanner (apply before inline scanner):

```regexp
/\$\$([\s\S]+?)\$\$/gm
```

Inline math scanner:

```regexp
/\$([^\s$][^$\n]*[^\s$]|\S)\$/g
```

| Pattern part | Meaning |
|---|---|
| `[^\s$]` | First/last char is not whitespace or `$` |
| `[^$\n]*` | Body: no `$` and no newline |
| `\S` | Alternation handles single-char math like `$x$` |

> [!WARNING]
> Always scan for block math (`$$...$$`) before inline math (`$...$`). A block math delimiter will otherwise be incorrectly split into two inline math markers.

---

## Opaque Region Treatment

Math regions are excluded from **all** OFM analysis:

| Analysis type | Excluded from math? |
|---|---|
| Tag detection (`#tag`) | Yes |
| Wiki-link detection (`[[...]]`) | Yes |
| Embed detection (`![[...]]`) | Yes |
| Diagnostics | Yes |
| Completion triggers | Yes |
| Rename edits | Yes |

See [[index]] for the full opaque region list and parse precedence.

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Semantic tokens | Mark the entire math region (including `$$` delimiters) as a `math` token type. |
| Fold range | Block math (`$$...$$`) is a fold range. |
| Completion | **None** — do not offer completions inside math regions. |
| Diagnostics | **None** — do not analyze LaTeX content; MathJax handles its own errors at render time. |

> [!NOTE]
> `flavor-grenade-lsp` does not implement a LaTeX parser or MathJax validator. The math region is identified, marked, and then treated as a black box.
