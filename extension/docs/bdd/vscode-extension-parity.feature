@vscode @extension @parity @adr:ADR019
Feature: VS Code extension parity
  The VS Code extension should provide OFMarkdown-specific client behavior
  without moving language intelligence out of the server.

  Scenario: Vault marker activation starts the extension
    Given a VS Code workspace contains ".obsidian/"
    When the extension host starts
    Then Flavor Grenade activates
    And the LanguageClient is prepared for vault membership detection

  Scenario: Generic Markdown remains lightweight
    Given a workspace has Markdown files but no vault marker
    When the extension host starts
    Then generic Markdown remains in "markdown" mode
    And no vault indexing work is requested

  Scenario: Command bridge invokes native references UI
    Given "flavorGrenade.showReferences" is registered
    When the command receives valid source and reference locations
    Then VS Code receives "editor.action.showReferences"

  Scenario: Status bar exposes error details
    Given the server reports an error status
    When the status bar updates
    Then the status item displays an error icon
    And the tooltip includes the error message

