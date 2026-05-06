@vscode @extension @parity @adr:ADR019
Feature: VS Code extension parity
  The VS Code extension should match Marksman VSCode integration affordances
  and add OFMarkdown-specific client behavior without moving language
  intelligence out of the server.

  @req:Extension.Activation.MarkerEvents
  Scenario: Extension activates for an Obsidian vault
    Given a VS Code workspace contains ".obsidian/"
    When the Flavor Grenade extension host starts
    Then the extension activates
    And the LanguageClient starts membership detection

  @req:Extension.Activation.MarkerEvents @req:Extension.LanguageMode.MembershipRefresh
  Scenario: Extension stays idle for generic Markdown workspaces
    Given a VS Code workspace contains Markdown files
    And the workspace has no ".obsidian/" folder
    And the workspace has no ".flavor-grenade.toml" file
    When the Flavor Grenade extension host starts
    Then the extension does not perform vault indexing work
    And generic Markdown documents remain in "markdown" mode

  @req:Extension.CommandBridges.PayloadValidation @req:Extension.CommandBridges.GraphActions
  Scenario: Command bridge shows references with native VS Code UI
    Given the extension has registered "flavorGrenade.showReferences"
    And the server provides a source location and two reference locations
    When "flavorGrenade.showReferences" is invoked with the payload
    Then VS Code receives an "editor.action.showReferences" command
    And the command contains both reference locations

  @req:Extension.CommandBridges.PayloadValidation @req:Extension.CommandBridges.GraphActions
  Scenario: Command bridge follows an OFMarkdown link target
    Given the extension has registered "flavorGrenade.followLink"
    And the server provides one resolved target location
    When "flavorGrenade.followLink" is invoked with the payload
    Then VS Code opens the resolved target location

  @req:Extension.Status.QuickActions
  Scenario: Status bar exposes actionable error state
    Given the server reports status "error" with message "binary missing"
    When the status bar item updates
    Then the status bar text shows an error state
    And the tooltip includes "binary missing"
    And the status quick actions include "Flavor Grenade: Show Output"

  @req:Extension.Marketplace.AssetPackaging
  Scenario: Marketplace README includes OFMarkdown proof
    Given the extension README is packaged into the VSIX
    When Marketplace assets are inspected
    Then the README includes screenshots or images for OFMarkdown mode
    And the README includes screenshots or images for wiki-link completion
    And the README includes screenshots or images for status bar indexing
