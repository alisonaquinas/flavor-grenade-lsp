@ofm
@adr:ADR002
Feature: OFM code actions

  Code actions are offered via textDocument/codeAction and executed via
  workspace/executeCommand. The LspServer provides three OFM-specific code
  actions: fg.createMissingFile for broken WikiRef targets, fg.toc for
  generating a table of contents from document headings, and fg.tagToYaml
  for moving inline TagRef occurrences to frontmatter.

  Background:
    Given a vault containing:
      | path                     | content                                             |
      | notes/existing.md        | # Existing Note\n\nThis note exists already.        |
      | notes/multi-heading.md   | # Title\n\n## Section One\n\n## Section Two\n\nBody. |

  @smoke
  Scenario: fg.createMissingFile offered and executed for a broken wiki-link
    Given the file "notes/index.md" contains "See [[missing-note]] for details"
    And the LSP has published a FG001 diagnostic for "[[missing-note]]" in "notes/index.md"
    When the client requests textDocument/codeAction with cursor inside "[[missing-note]]"
    Then the response includes a code action with:
      | field           | value                       |
      | title           | Create missing file         |
      | command.command | fg.createMissingFile        |
      | kind            | quickfix.fg.createMissingFile |
    When the client executes the "fg.createMissingFile" command
    Then the server issues a workspace/applyEdit with a CreateFile operation for "notes/missing-note.md"
    And the new file "notes/missing-note.md" is added to the VaultIndex
    And the FG001 diagnostic for "[[missing-note]]" is cleared on the next diagnostic cycle

  Scenario: fg.toc inserts a table of contents for a document with multiple headings
    Given the file "notes/multi-heading.md" is open in the LSP client
    When the client requests textDocument/codeAction at any cursor position in "notes/multi-heading.md"
    Then the response includes a code action with:
      | field           | value              |
      | title           | Generate Table of Contents |
      | command.command | fg.toc             |
      | kind            | source.fg.toc      |
    When the client executes the "fg.toc" command
    Then the server issues a workspace/applyEdit inserting a block matching:
      """
      <!-- TOC -->
      - [[#Title]]
        - [[#Section One]]
        - [[#Section Two]]
      <!-- /TOC -->
      """
    And the inserted block is placed at the cursor position in "notes/multi-heading.md"
