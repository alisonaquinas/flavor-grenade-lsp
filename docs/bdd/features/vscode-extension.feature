@extension @lsp @wip
@adr:ADR001 @adr:ADR015
Feature: VS Code extension lifecycle and integration

  The VS Code extension wraps the flavor-grenade-lsp server binary, spawning it
  over stdio via vscode-languageclient 9.x. It bundles a platform-specific
  compiled binary, provides a 2-tier binary resolution strategy (user setting
  then bundled), exposes a status bar widget driven by flavorGrenade/status
  notifications, registers palette commands for server management, and assigns
  OFMarkdown language mode to detected vault/index documents.

  Background:
    Given a VS Code instance with the Flavor Grenade extension installed
    And a workspace folder containing a ".obsidian/" directory

  @smoke
  Scenario: Extension activation on markdown file open
    When the user opens a file "notes/welcome.md" in the workspace
    Then the extension activates via the "onLanguage:markdown" activation event
    And the LanguageClient spawns the server binary over stdio transport
    And the client sends an "initialize" request with:
      | field                          | value              |
      | capabilities.textDocument      | present            |
      | rootUri                        | <workspace folder> |
    And the server returns an "initialize" response with capabilities
    And the client sends an "initialized" notification
    And the LanguageClient state transitions to "Running"

  @language-mode
  Scenario: LanguageClient serves markdown before and after OFMarkdown promotion
    When the user opens a file "notes/welcome.md" in the workspace
    Then the LanguageClient document selector includes:
      | scheme | language   |
      | file   | markdown   |
      | file   | ofmarkdown |
    And after the document language id becomes "ofmarkdown"
    Then the LanguageClient continues serving completions and diagnostics for that document

  Scenario: Status bar shows indexing progress
    Given the extension has activated and the LanguageClient is running
    When the server sends a "flavorGrenade/status" notification with:
      | field      | value        |
      | state      | initializing |
      | vaultCount | 0            |
      | docCount   | 0            |
    Then the status bar item shows "$(loading~spin) FG: Starting..."
    When the server sends a "flavorGrenade/status" notification with:
      | field      | value    |
      | state      | indexing |
      | vaultCount | 1        |
      | docCount   | 0        |
    Then the status bar item shows "$(loading~spin) FG: Indexing..."
    When the server sends a "flavorGrenade/status" notification with:
      | field      | value |
      | state      | ready |
      | vaultCount | 1     |
      | docCount   | 42    |
    Then the status bar item shows "$(check) FG: 42 docs"

  Scenario: Status bar shows error state
    Given the extension has activated and the LanguageClient is running
    When the server sends a "flavorGrenade/status" notification with:
      | field   | value                          |
      | state   | error                          |
      | message | RefGraph build failed: OOM     |
    Then the status bar item shows "$(error) FG: Error"
    And the status bar item tooltip contains "RefGraph build failed: OOM"

  Scenario: Restart Server command
    Given the extension has activated and the LanguageClient is running
    And the status bar item shows "$(check) FG: 42 docs"
    When the user executes the "flavorGrenade.restartServer" command
    Then the LanguageClient restarts
    And the status bar item resets to "$(loading~spin) FG: Starting..."
    And the server process receives a new "initialize" request
    And the LanguageClient state transitions to "Running" after re-initialization

  Scenario: Rebuild Index command
    Given the extension has activated and the LanguageClient is running
    When the user executes the "flavorGrenade.rebuildIndex" command
    Then the client sends a "workspace/executeCommand" request with:
      | field   | value                        |
      | command | flavorGrenade.rebuildIndex    |
    And the server begins a full RefGraph rebuild

  Scenario: Show Output command
    Given the extension has activated and the LanguageClient is running
    When the user executes the "flavorGrenade.showOutput" command
    Then the "Flavor Grenade" output channel becomes visible

  Scenario: Custom server path
    Given the VS Code setting "flavorGrenade.server.path" is set to "/opt/fg/flavor-grenade-lsp"
    And the binary at "/opt/fg/flavor-grenade-lsp" exists and is executable
    When the user opens a file "notes/welcome.md" in the workspace
    Then the extension spawns "/opt/fg/flavor-grenade-lsp" as the server process
    And the LanguageClient connects over stdio to that binary
    And the bundled binary at "server/flavor-grenade-lsp" is not used

  Scenario: Server path config change triggers restart
    Given the extension has activated and the LanguageClient is running
    And the server was started with the bundled binary
    When the user changes "flavorGrenade.server.path" to "/opt/fg/flavor-grenade-lsp"
    Then the LanguageClient restarts automatically
    And the new server process uses the binary at "/opt/fg/flavor-grenade-lsp"

  Scenario: Bundled binary resolution
    Given the VS Code setting "flavorGrenade.server.path" is empty
    And the extension is installed for the current platform
    When the user opens a file "notes/welcome.md" in the workspace
    Then the extension resolves the server binary at "server/flavor-grenade-lsp" relative to the extension root
    And on Windows the resolved path ends with "server/flavor-grenade-lsp.exe"
    And on other platforms the resolved path ends with "server/flavor-grenade-lsp"
    And the LanguageClient spawns that binary over stdio transport

  Scenario: Extension deactivation cleans up
    Given the extension has activated and the LanguageClient is running
    When the extension deactivates
    Then the LanguageClient sends a "shutdown" request to the server
    And the client sends an "exit" notification
    And the server process exits cleanly
    And all disposables registered in context.subscriptions are disposed

  Scenario: Server crash recovery
    Given the extension has activated and the LanguageClient is running
    When the server process crashes unexpectedly
    Then the LanguageClient error handler detects the crash
    And the LanguageClient automatically restarts the server
    And the restart count does not exceed 4 within a 3-minute window
    When the server process crashes 5 times within 3 minutes
    Then the LanguageClient stops attempting restarts
    And the status bar item shows "$(error) FG: Error"
