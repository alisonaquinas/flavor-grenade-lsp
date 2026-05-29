@extension @vscode @markdown-flavor @original @commonmark @obsidian
@gfm @glfm @pandoc @multimarkdown @mdx @kramdown @markdown-extra @r-markdown @reddit @stack-overflow
@planned
@adr:ADR020
Feature: Markdown flavor dialect behavior

  Every researched Markdown flavor is first-class product scope, not only a
  label in the selector. Until the product registry and server flavor engine
  land, these executable scenarios define the planned registry and LSP
  behavior contracts that the harness must later replace with product data.

  Background:
    Given a VS Code instance with the Flavor Grenade extension installed
    And a Markdown document is open with language id "markdown"

  Scenario: Original Markdown override uses the historical baseline
    Given ".fgattributes" selects Markdown flavor "original" for the document
    And the document contains:
      """
      # Title

          indented code

      This is [a link](https://example.com/).

      ```js
      const extension = true;
      ```

      | a | b |
      |---|---|
      | 1 | 2 |

      [[Obsidian Link]]
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "original"
    And the document language id remains "markdown"
    And ATX headings, indented code blocks, and inline links are treated as Original Markdown syntax
    And fenced code blocks, pipe tables, and wiki links are treated as non-core Original Markdown constructs

  Scenario: Original Markdown auto-detect can be restored after an override
    Given ".fgattributes" selects Markdown flavor "original" for the document
    When the user selects "Auto Detect" from the Markdown flavor selector
    Then the matching ".fgattributes" flavor assignment is removed or reset with "!flavor"
    And Flavor Grenade recomputes the effective flavor from Auto Detect signals
    And the document language id remains "markdown"

  Scenario: CommonMark override enables CommonMark core syntax
    Given ".fgattributes" selects Markdown flavor "commonmark" for the document
    And the document contains:
      """
      # Title

      ```js
      const standardized = true;
      ```

      > [!note]
      > Obsidian callout text

      [[Obsidian Link]]
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "commonmark"
    And the document language id remains "markdown"
    And fenced code blocks are treated as CommonMark syntax
    And Obsidian callouts and wiki links are not enabled as Obsidian syntax unless the effective flavor is "obsidian"

  Scenario: CommonMark is the fallback for generic Markdown
    Given the workspace has no ".obsidian/" directory
    And no ".fgignore" or ".fgattributes" file applies to "README.md"
    When the user opens "README.md"
    Then the Markdown flavor selector shows "Auto Detect (CommonMark)"
    And the server is refreshed with effective flavor "commonmark"
    And the document language id remains "markdown"

  @req:FlavorLSP.Profile.SignatureCoverage
  Scenario Outline: Planned researched flavors have source-backed dialect profile contracts
    Given ".fgattributes" selects Markdown flavor "<id>" for the document
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "<id>"
    And the dialect profile for "<id>" traces to "<source>"
    And the planned dialect profile for "<id>" records "<signature>" as flavor-specific behavior
    And the document language id remains "markdown"

    Examples:
      | id             | source                                      | signature                                    |
      | original       | commonmark-and-original-markdown           | historical core Markdown baseline           |
      | commonmark     | commonmark-and-original-markdown           | standardized CommonMark edge cases          |
      | obsidian       | ofm-spec/index                             | wiki links, embeds, and vault semantics     |
      | gfm            | github-flavored-markdown-analysis          | tables, task lists, strikethrough            |
      | glfm           | gitlab-flavored-markdown-analysis          | GitLab-specific CommonMark extensions        |
      | pandoc         | pandoc-markdown-deep-research-report       | citations, math, metadata, extension toggles |
      | multimarkdown  | multimarkdown-analysis                     | metadata, tables, cross-references           |
      | mdx            | mdx-analysis                               | JSX expressions and components               |
      | kramdown       | kramdown-analysis                          | block and span attributes                    |
      | markdown-extra | markdown-extra-analysis                    | tables, definition lists, footnotes          |
      | r-markdown     | r-markdown-analysis                        | YAML metadata and executable code chunks     |
      | reddit         | reddit-markdown-analysis                   | Reddit platform Markdown behavior            |
      | stack-overflow | stack-overflow-markdown-analysis           | Stack Overflow technical-writing behavior    |

  @planned @structured-profile @req:FlavorLSP.StructuredProfiles.Flags
  Scenario Outline: Structured profiles layer over any base Markdown flavor
    Given ".fgattributes" selects Markdown flavor "<baseFlavor>" for the document
    And the document path is "<path>"
    And the document contains:
      """
      <markdown>
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "<baseFlavor>"
    And the effective structured profile flags include "<profile>"
    And "<profile>" is not treated as a Markdown flavor id
    And the document language id remains "markdown"

    Examples:
      | baseFlavor | profile            | path                                      | markdown                                                                 |
      | commonmark | keep-a-changelog   | CHANGELOG.md                              | # Changelog\n\n## [Unreleased]\n\n### Added\n\n- Added profile evidence. |
      | gfm        | common-changelog   | CHANGELOG.md                              | # Changelog\n\n## 1.0.0 - 2026-05-23\n\n### Added\n\n- Added release note ([#1]). |
      | obsidian   | madr               | docs/decisions/0001-use-structured.md     | # 1. Use structured profiles\n\n## Context and Problem Statement\n\nText.\n\n## Decision Outcome\n\nChosen option. |
      | pandoc     | keep-a-changelog   | structured/keep-a-changelog/CHANGELOG.md | # Changelog\n\n## [Unreleased]\n\n### Security\n\n- Added security note. |

  @planned @structured-profile @req:FlavorLSP.StructuredProfiles.Flags
  @req:FlavorLSP.Diagnostics.ProfileRules @req:FlavorLSP.Completion.ProfileCandidates
  @req:FlavorLSP.Navigation.ProfileResolution @req:FlavorLSP.Hover.ProfileMetadata
  @req:FlavorLSP.SemanticTokens.ProfileTokens @req:FlavorLSP.Rename.ProfileSafety
  Scenario Outline: Structured profiles define document-structure LSP behavior
    Given ".fgattributes" selects Markdown flavor "<baseFlavor>" for the document
    And the effective structured profile flags include "<profile>"
    And the document contains "<sample>"
    When Flavor Grenade analyzes the document
    Then diagnostics include "<diagnostics>"
    And completions include "<completion>"
    And navigation resolves "<navigation>"
    And hover explains "<hover>"
    And semantic tokens mark "<tokens>"
    And rename is limited to "<rename>"
    And base Markdown syntax is still governed by "<baseFlavor>"

    Examples:
      | baseFlavor | profile          | sample                          | diagnostics                       | completion                  | navigation                  | hover                         | tokens                       | rename                       |
      | commonmark | keep-a-changelog | ## [Unreleased]\n\n### Added    | missing release metadata warnings | changelog category headings | changelog release sections  | Keep a Changelog profile      | release and category headings | local anchors only           |
      | gfm        | common-changelog | ## 1.0.0 - 2026-05-23           | category ordering warnings        | Common Changelog categories | release headings and refs   | Common Changelog profile      | release headings and refs    | local anchors only           |
      | obsidian   | madr             | ## Context and Problem Statement | missing MADR decision sections    | MADR section headings       | ADR headings and decisions  | MADR profile and status       | ADR section headings         | local anchors and headings   |

  @req:FlavorLSP.Parser.ProfileDispatch
  Scenario Outline: Planned flavor signatures define observable parser behavior
    Given ".fgattributes" selects Markdown flavor "<id>" for the document
    And the document contains:
      """
      <markdown>
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "<id>"
    And the planned executable LSP behavior contract for "<id>" includes "<expected>"
    And the document language id remains "markdown"

    Examples:
      | id             | markdown                                      | expected                                      |
      | original       | # Title\n\n    code\n\n\| a \| b \|\n\|---\|---\| | indented code is core; pipe table is non-core Original Markdown |
      | commonmark     | # Title\n\n```js\nx()\n```                  | fenced code block is CommonMark syntax       |
      | obsidian       | [[Note]]\n![[image.png]]\n#tag               | wiki links, embeds, and tags are vault-aware |
      | gfm            | - [x] done\n\n~~old~~\n\n\| a \| b \|\n\|---\|---\| | task lists, strikethrough, and tables are enabled |
      | glfm           | ```mermaid\ngraph TD\nA-->B\n```             | GitLab code-fence extension behavior is recognized |
      | pandoc         | ---\ntitle: Demo\n---\n\n[@smith]\n\n^note  | metadata, citations, and footnote-like syntax are recognized |
      | multimarkdown  | Title: Demo\n\n[#target]\n\n[link][id]       | metadata and cross-reference syntax are recognized |
      | mdx            | # Title\n\n<Component prop={value} />         | JSX component syntax is treated as MDX content without changing VS Code language id |
      | kramdown       | paragraph\n{:.lead}\n\n# H {#custom}        | block/span attributes are recognized         |
      | markdown-extra | Term\n: Definition\n\nFootnote[^1]\n\n[^1]: Note | definition lists and footnotes are recognized |
      | r-markdown     | ---\ntitle: Demo\n---\n\n```{r}\nplot(x)\n``` | YAML metadata and R code chunks are recognized |
      | reddit         | >!spoiler!<\n\n/u/example                    | Reddit spoiler and platform link behavior is recognized |
      | stack-overflow | `code`\n\n    block\n\n[tag:markdown]        | technical-writing code and tag references are recognized |

  @req:FlavorLSP.Parser.ProfileDispatch
  Scenario Outline: Flavor profiles classify active and inactive syntax
    Given ".fgattributes" selects Markdown flavor "<id>" for the document
    And the document contains:
      """
      <markdown>
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "<id>"
    And "<active>" is indexed as active "<id>" syntax
    And "<inactive>" is not indexed as active "<id>" syntax
    And Obsidian-only wiki-links, embeds, tags, callouts, and vault behavior stay inactive unless the effective flavor is "obsidian"
    And the document language id remains "markdown"

    Examples:
      | id             | markdown                                      | active                                      | inactive                                      |
      | original       | # Title\n\n    code\n\n[[Note]]\n\n\| a \| b \|\n\|---\|---\| | ATX headings and indented code              | wiki-links and pipe tables                  |
      | commonmark     | # Title\n\n```js\nx()\n```\n\n- [x] task | fenced code blocks and reference labels     | GFM task-list markers                       |
      | obsidian       | [[Note]]\n![[image.png]]\n#tag\n> [!note] | wiki-links, embeds, tags, and callouts      | GitHub or GitLab host object references      |
      | gfm            | - [x] done\n\n~~old~~\n\n#1\n\n@user       | tables, task lists, strikethrough, autolinks | Obsidian wiki-link resolution                |
      | glfm           | - [~] later\n\n[^1]\n\n[[_TOC_]]\n\n::include{file=part.md} | GLFM task markers, footnotes, TOC tags, includes | vault embeds                                 |
      | pandoc         | % Title\n% Author\n\n[@smith]\n\n::: {.note}\ntext\n::: | metadata blocks, citations, attributes      | renderer output behavior                    |
      | multimarkdown  | Title: Demo\n\n[^n]\n\n[#fig]\n\n[link][id] | metadata, footnotes, citations, cross-references | export target rendering                     |
      | mdx            | import X from "./x"\n\n<Component prop={value} />\n\n[[Note]] | ESM declarations, JSX elements, expressions | Markdown parsing inside JSX or ESM regions  |
      | kramdown       | # H {#custom}\n\nTerm\n: Definition\n\n{: .lead} | attributes, explicit IDs, definition lists  | CommonMark-only attribute ignorance         |
      | markdown-extra | Term\n: Definition\n\n*[HTML]: HyperText Markup Language\n\n{#id} | definition lists, abbreviations, attributes | Obsidian vault tags                         |
      | r-markdown     | ---\ntitle: Demo\n---\n\n```{r cars, echo=FALSE}\nplot(cars)\n```\n\n`r x + 1` | YAML metadata, chunks, inline R             | code execution                              |
      | reddit         | >!spoiler!<\n\n/r/markdown\n\n^superscript  | spoilers, superscript, Reddit references    | vault file resolution for platform refs     |
      | stack-overflow | ```python\nprint(1)\n```\n\n>! spoiler\n\n[tag:markdown] | code authoring, spoilers, Stack Overflow refs | live Stack Exchange object resolution        |

  @req:FlavorLSP.Diagnostics.ProfileRules @req:FlavorLSP.Completion.ProfileCandidates
  @req:FlavorLSP.Navigation.ProfileResolution @req:FlavorLSP.Hover.ProfileMetadata
  @req:FlavorLSP.SemanticTokens.ProfileTokens @req:FlavorLSP.Rename.ProfileSafety
  Scenario Outline: Flavor profiles define LSP surface behavior
    Given ".fgattributes" selects Markdown flavor "<id>" for the document
    And the document contains "<sample>"
    When Flavor Grenade analyzes the document
    Then diagnostics for "<id>" include "<diagnostics>"
    And completions for "<id>" include "<completion>"
    And navigation for "<id>" resolves "<navigation>"
    And hover for "<id>" explains "<hover>"
    And semantic tokens for "<id>" mark "<tokens>"
    And rename for "<id>" is limited to "<rename>"
    And the document language id remains "markdown"

    Examples:
      | id             | sample                        | diagnostics                              | completion                              | navigation                              | hover                                      | tokens                                   | rename                                  |
      | original       | [local](notes/a.md)           | broken local links and unsupported portability constructs | Markdown link destinations and headings | local Markdown links and headings       | original-supported syntax                 | original headings, links, lists, code   | local Markdown links and heading refs   |
      | commonmark     | [label][id]\n\n[id]: ./a.md   | malformed CommonMark and broken local links | reference labels, headings, info strings | local links, anchors, reference labels  | normalized CommonMark link targets        | CommonMark blocks and inline syntax     | local links and heading anchors         |
      | obsidian       | [[Note#^block]]\n#tag         | FG001-FG007 vault diagnostics            | wiki-links, embeds, tags, blocks, callouts | notes, embeds, tags, headings, blocks   | vault target metadata                     | wiki-links, embeds, tags, callouts      | notes, headings, blocks, local links    |
      | gfm            | - [x] done                    | malformed tables and broken local links  | table snippets and task-list markers    | local Markdown links and headings       | GFM extensions and host-specific refs     | tables, task markers, strikethrough     | local Markdown links and headings       |
      | glfm           | [TOC]\n\n#123                 | malformed GLFM syntax and broken local links | GLFM task markers, diagrams, TOC/include snippets | local Markdown links and headings       | GLFM-only constructs and GitLab context   | GitLab refs, TOC tags, includes         | local Markdown links and headings       |
      | pandoc         | [@smith]\n\n# H {#h}          | malformed citations, duplicate labels, broken local links | citation keys, labels, attributes       | labels, footnotes, citations when configured | citation, label, and conversion metadata | citations, math, attributes             | labels, footnotes, local targets        |
      | multimarkdown  | Title: Demo\n\n[#fig]         | malformed metadata, tables, labels, broken links | metadata keys, labels, citations        | labels, footnotes, citations, local links | metadata, citation, and label summaries   | metadata, footnotes, labels             | local labels and document links         |
      | mdx            | <Component prop={value} />    | malformed MDX containers and broken local links | JSX components, MDX snippets, local links | local component identifiers when available | JSX and MDX classification                | JSX tags, props, expressions, ESM       | local component and Markdown targets    |
      | kramdown       | # H {#custom}                 | malformed attributes, duplicate IDs, broken links | attribute keys, IDs, footnotes          | explicit IDs, headings, footnotes       | attribute targets and anchors             | attributes, tables, footnotes           | explicit IDs and matching local refs    |
      | markdown-extra | *[HTML]: HyperText Markup Language | malformed tables, dangling footnotes, duplicate IDs | footnotes, abbreviations, attributes    | footnotes, abbreviations, explicit IDs  | abbreviation and attribute metadata       | definitions, footnotes, abbreviations   | local IDs, footnotes, abbreviations     |
      | r-markdown     | ```{r cars}\nsummary(cars)\n``` | duplicate chunks, malformed headers, invalid options | chunk labels, option keys, output formats | chunk labels, headings, citations       | chunk engine/options and metadata         | chunks, inline R, YAML metadata         | chunk labels and local references       |
      | reddit         | /r/markdown                   | portability issues and malformed spoilers | spoiler snippets and Reddit prefixes    | local Markdown links and headings only  | Reddit syntax and renderer portability    | spoilers and platform references        | local Markdown links and headings       |
      | stack-overflow | [tag:markdown]                | malformed fences, tables, spoilers, portability warnings | code languages and Stack Overflow snippets | local Markdown links and headings only  | technical-writing syntax and context      | code fences, spoilers, host references  | local Markdown links and headings       |

  @req:FlavorLSP.HostBoundary.NonLocalReferences
  Scenario Outline: Host conversion and execution boundaries stay non-local
    Given ".fgattributes" selects Markdown flavor "<id>" for the document
    And the document contains "<reference>"
    When Flavor Grenade analyzes the document
    Then "<reference>" is classified as "<classification>"
    And no broken vault-link diagnostic is published for "<reference>"
    And navigation does not resolve "<reference>" as a vault file
    And rename does not create speculative edits for "<reference>"
    And hover explains "<boundary>"
    And the document language id remains "markdown"

    Examples:
      | id             | reference                     | classification                  | boundary                                      |
      | original       | ~~modern~~                    | non-core extension syntax       | outside the 2004 baseline                     |
      | commonmark     | [[Note]]                      | inactive platform syntax        | not CommonMark wiki-link syntax               |
      | obsidian       | [[Note]]                      | local vault reference           | resolved only against the vault index         |
      | gfm            | #123                          | GitHub host reference           | needs GitHub repository context               |
      | glfm           | !123                          | GitLab host reference           | needs GitLab project or group context         |
      | pandoc         | --filter citeproc             | conversion-bound behavior       | depends on Pandoc command-line configuration  |
      | multimarkdown  | LaTeX export                  | export-bound behavior           | depends on processor and export target        |
      | mdx            | {value.map(x => <Item />)}    | MDX expression region           | Markdown parsing is suppressed inside it      |
      | kramdown       | {: .lead}                     | local attribute syntax          | active only under kramdown                    |
      | markdown-extra | *[HTML]: HyperText Markup Language | local abbreviation syntax       | active only under Markdown Extra              |
      | r-markdown     | ```{r}\nSys.time()\n```       | execution-bound chunk syntax    | R code is never executed by Flavor Grenade    |
      | reddit         | /u/example                    | Reddit host reference           | needs Reddit platform context                 |
      | stack-overflow | [tag:markdown]                | Stack Overflow host reference   | needs Stack Exchange platform context         |
