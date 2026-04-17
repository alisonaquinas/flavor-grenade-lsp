@lsp
@adr:ADR001
Feature: LSP transport and server initialization

  The LspServer communicates with LSP clients over stdio using JSON-RPC 2.0.
  The initialize/initialized handshake establishes server Capabilities and
  transitions the server from an uninitialized state to an active state.
  The shutdown/exit sequence terminates the server cleanly.

  Background:
    Given a flavor-grenade-lsp server process started via stdio transport

  @smoke
  Scenario: Successful initialize/initialized handshake
    When the client sends an "initialize" request with:
      | field                        | value                        |
      | processId                    | <client pid>                 |
      | rootUri                      | null                         |
      | capabilities.textDocument    | {}                           |
    Then the server returns an "initialize" response with result containing:
      | field                                        | value    |
      | capabilities.completionProvider              | present  |
      | capabilities.definitionProvider             | present  |
      | capabilities.referencesProvider             | present  |
      | capabilities.semanticTokensProvider         | present  |
      | capabilities.hoverProvider                  | present  |
      | capabilities.codeActionProvider             | present  |
    And the server has not yet started processing document notifications
    When the client sends an "initialized" notification
    Then the LspServer transitions to active state
    And the server is ready to accept textDocument notifications

  Scenario: Shutdown and exit sequence
    Given the LspServer is in active state after a successful initialize/initialized handshake
    When the client sends a "shutdown" request
    Then the server returns a "shutdown" response with result null
    And the LspServer stops accepting new requests
    When the client sends an "exit" notification
    Then the server process exits with code 0
