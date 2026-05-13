@extension @vscode @markdown-flavor @original @commonmark @obsidian
@gfm @glfm @pandoc @multimarkdown @mdx @kramdown @markdown-extra @r-markdown @reddit @stack-overflow
@adr:ADR020
Feature: Markdown flavor dialect behavior

  Every researched Markdown flavor is first-class product scope, not only a
  label in the selector. The extension keeps documents in VS Code's built-in
  Markdown language mode while the effective flavor controls which Markdown
  dialect behavior the server applies.

  Background:
    Given a VS Code instance with the Flavor Grenade extension installed
    And a Markdown document is open with language id "markdown"

  Scenario: Original Markdown override uses the historical baseline
    Given "flavorGrenade.markdownFlavor" is set to "original"
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
    Given "flavorGrenade.markdownFlavor" is set to "original"
    When the user selects "Auto Detect" from the Markdown flavor selector
    Then the "original" override is cleared at the active settings scope
    And Flavor Grenade recomputes the effective flavor from workspace and vault signals
    And the document language id remains "markdown"

  Scenario: CommonMark override enables CommonMark core syntax
    Given "flavorGrenade.markdownFlavor" is set to "commonmark"
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
    And the workspace has no ".flavor-grenade.toml" file
    And no Markdown flavor override is configured
    When the user opens "README.md"
    Then the Markdown flavor selector shows "Auto Detect (CommonMark)"
    And the server is refreshed with effective flavor "commonmark"
    And the document language id remains "markdown"

  Scenario Outline: Researched flavors have source-backed dialect profiles
    Given "flavorGrenade.markdownFlavor" is set to "<id>"
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "<id>"
    And the dialect profile for "<id>" traces to "<source>"
    And the dialect profile records "<signature>" as flavor-specific behavior
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

  Scenario Outline: Flavor signatures produce observable LSP behavior
    Given "flavorGrenade.markdownFlavor" is set to "<id>"
    And the document contains:
      """
      <markdown>
      """
    When Flavor Grenade analyzes the document
    Then the effective Markdown flavor is "<id>"
    And a flavor-scoped diagnostic, semantic token, hover, document link, or completion result includes "<expected>"
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
