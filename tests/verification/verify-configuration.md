---
title: Verification — Configuration
tags: [test/verification, "requirements/configuration"]
aliases: [Verify Configuration]
---

# Verification — Configuration

## Purpose

This document covers scripted and agent-driven test cases that verify the four Planguage requirements governing the configuration system in `flavor-grenade-lsp`. The requirements address three-tier layering and override precedence, validation of the `completion.candidates` value, fault isolation when a config file is malformed, and the `core.text_sync` default. All test cases must be executed in Phase 1 after the config loader is implemented and before any feature that depends on configuration is accepted. Source requirements are in [[requirements/configuration]]; the config-loader design is in [[design/api-layer#config-loader]].

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Config.Precedence.Layering` | Project config overrides user config overrides built-in defaults; each layer affects only keys it explicitly defines | Phase 1 |
| `Config.Validation.Candidates` | Invalid `completion.candidates` values are silently replaced with default 50; server does not crash | Phase 1 |
| `Config.Fault.Isolation` | A malformed TOML file drops only that layer; server reaches `initialized` and uses remaining valid layers | Phase 1 |
| `Config.TextSync.Default` | When `core.text_sync` is absent from all layers, server advertises `TextDocumentSyncKind.Full` (1) | Phase 1 |

## Test Cases

### TC-VER-CFG-001 — Config.Precedence.Layering

**Planguage Tag:** `Config.Precedence.Layering`
**Gist:** Project-level `.flavor-grenade.toml` values override user-level config values, which override built-in defaults; each layer affects only the keys it explicitly defines.
**Type:** Both
**BDD Reference:** **BDD gap** — no scenario in [[bdd/features/workspace]] or [[bdd/features/vault-detection]] covers multi-layer config precedence directly.
**Phase:** Phase 1

**Setup:** Two fixture files are required. A user-level config file sets `wiki.style = "title-slug"` and leaves `completion.candidates` unset. A project-level `.flavor-grenade.toml` sets `completion.candidates = 20` and leaves `wiki.style` unset. Built-in defaults supply `completion.candidates = 50`, `wiki.style = "file-stem"`, and `core.text_sync = "full"`.

**Scripted steps:**
```gherkin
Given a built-in default configuration with:
  | key                  | value       |
  | completion.candidates | 50         |
  | wiki.style            | file-stem  |
  | core.text_sync        | full       |
And a user config file setting:
  | key        | value      |
  | wiki.style | title-slug |
And a project config file ".flavor-grenade.toml" setting:
  | key                   | value |
  | completion.candidates | 20    |
When the LSP server initializes with both user and project config files active
Then the effective value of "wiki.style" is "title-slug"
And the effective value of "completion.candidates" is 20
And the effective value of "core.text_sync" is "full"
When the project config file is changed to also set "wiki.style" to "absolute-path"
And the server reloads configuration
Then the effective value of "wiki.style" is "absolute-path"
And the effective value of "completion.candidates" is still 20
And the effective value of "core.text_sync" is still "full"
```

**Agent-driven steps:**
1. Write the user config fixture at the platform user-config path (e.g., `~/.config/flavor-grenade/config.toml` or as directed by [[design/api-layer#config-loader]]) with only `wiki.style = "title-slug"`.
2. Write the project fixture `.flavor-grenade.toml` in a temporary vault root with only `completion.candidates = 20`.
3. Start the server against that vault root. Inspect the effective config via the server's debug endpoint or log output.
4. Assert: `wiki.style = "title-slug"`, `completion.candidates = 20`, `core.text_sync = "full"`.
5. Add `wiki.style = "absolute-path"` to the project `.flavor-grenade.toml` (now it defines both keys).
6. Trigger a config reload (file-change notification or restart). Re-inspect effective config.
7. Assert: `wiki.style = "absolute-path"` (project wins over user), `completion.candidates = 20` (still from project), `core.text_sync = "full"` (still from default).
8. Repeat with at least 2 further permutations of which tier defines which key to reach the 5-key, 3-scenario-per-key coverage specified in the Meter.
9. Compute: (keys with correct effective value / total key-scenario pairs tested) = 100%.

**Pass criterion:** 100% of configuration keys resolve to the correct effective value across all tested precedence permutations; no layer bleed-through observed.
**Fail criterion:** Any config key resolving to an unexpected value due to incorrect layer precedence or layer bleed-through (e.g., a project-absent key reverting to default despite being set at user level).

---

### TC-VER-CFG-002 — Config.Validation.Candidates

**Planguage Tag:** `Config.Validation.Candidates`
**Gist:** The `completion.candidates` value is rejected if zero, negative, or non-integer; the server silently substitutes the built-in default (50) and emits a debug log message.
**Type:** Both
**BDD Reference:** **BDD gap** — no scenario in [[bdd/features/workspace]] or [[bdd/features/vault-detection]] covers `completion.candidates` validation.
**Phase:** Phase 1

**Setup:** Five project `.flavor-grenade.toml` fixtures, one per invalid value: `0`, `-1`, `-100`, `3.7`, `"fifty"`. For each, a vault root directory is prepared with at least one `.md` file containing enough `[[`-prefixed text to generate more than 50 completion candidates.

**Scripted steps:**
```gherkin
Given a project ".flavor-grenade.toml" with completion.candidates = <invalid_value>
When the LSP server initializes with that config file active
Then the server reaches the "initialized" state without error
And the effective value of "completion.candidates" is 50
And the server log contains a debug-level message referencing <invalid_value> and the substitution of 50
When textDocument/completion is triggered with a query returning more than 50 candidates
Then the response contains exactly 50 items

Examples:
  | invalid_value |
  | 0             |
  | -1            |
  | -100          |
  | 3.7           |
  | "fifty"       |
```

**Agent-driven steps:**
1. For each of the five invalid values (`0`, `-1`, `-100`, `3.7`, `"fifty"`):
   a. Write a `.flavor-grenade.toml` with the line `completion.candidates = <value>` (use TOML string quoting as needed).
   b. Start the server; check it reaches `initialized` without crashing.
   c. Inspect the server log for a debug entry that names the invalid value and states the substituted default of 50.
   d. Open an `.md` document and trigger `textDocument/completion` at a position where more than 50 candidates would normally be returned.
   e. Confirm the response contains exactly 50 items.
2. Compute: (invalid-value startups with correct behaviour / 5) = 100%.

**Pass criterion:** 100% of invalid `completion.candidates` values handled with default substitution (50), no server crash, and a debug log entry for each.
**Fail criterion:** Any invalid value causing a server crash; any invalid value used as the effective `completion.candidates` without substitution; any invalid value producing no debug log entry.

---

### TC-VER-CFG-003 — Config.Fault.Isolation

**Planguage Tag:** `Config.Fault.Isolation`
**Gist:** A malformed TOML file in any configuration layer causes only that layer to be dropped; the server still reaches `initialized`, logs a debug-level parse error, and applies the remaining valid layers.
**Type:** Both
**BDD Reference:** **BDD gap** — no scenario in [[bdd/features/workspace]] or [[bdd/features/vault-detection]] covers malformed config fault isolation.
**Phase:** Phase 1

**Setup (scripted path):** A malformed project `.flavor-grenade.toml` fixture with deliberate TOML syntax errors (unclosed quote, invalid separator). A valid user config file with at least two keys set (`wiki.style` and `completion.candidates`). Both files present when the server starts.

**Setup (agent path):** The agent manually crafts the malformed file to test three distinct error classes: unclosed string literal, invalid key-value separator (using `=>` instead of `=`), and a binary byte sequence embedded mid-file.

**Scripted steps:**
```gherkin
Given a project config file ".flavor-grenade.toml" containing deliberate TOML syntax errors:
  """
  wiki.style = "title-slug
  completion.candidates => 20
  """
And a valid user config file with:
  | key                   | value      |
  | wiki.style            | title-slug |
  | completion.candidates | 30         |
When the LSP server initializes with both config files active
Then the server reaches the "initialized" state without error
And the server log contains a debug-level message citing the malformed project file path
And the server log contains the TOML parse error description
And the effective value of "wiki.style" is "title-slug"
And the effective value of "completion.candidates" is 30
When the user config file is instead malformed and the project config file is valid:
  | project: completion.candidates | 25 |
Then the server still reaches "initialized"
And the effective value of "completion.candidates" is 25
And the effective value uses the project config despite the malformed user file
```

**Agent-driven steps:**
1. Create a vault root with a valid user config file setting `wiki.style = "title-slug"` and `completion.candidates = 30`.
2. Create a project `.flavor-grenade.toml` with an unclosed string literal: `wiki.style = "title-slug` (no closing quote).
3. Start the server. Confirm it reaches `initialized`.
4. Grep server log for a debug entry containing the project file path and a TOML parse error message; assert at least one match.
5. Verify effective config: `wiki.style = "title-slug"` from user file (not default `"file-stem"`), `completion.candidates = 30` from user file.
6. Now make the user config malformed (delete a closing bracket) and make the project config valid with `completion.candidates = 25`.
7. Restart. Confirm `initialized` is reached. Confirm the debug log cites the malformed user file. Confirm `completion.candidates = 25` from the project file is in effect.
8. Repeat with a binary-data injection into the project config (write arbitrary bytes mid-file).
9. Compute: (malformed-file startups with correct isolation / total malformed-file startups tested) = 100%.

**Pass criterion:** 100% of malformed-file startups reach `initialized`; each emits a debug log entry for the malformed file; each applies the remaining valid config layers correctly.
**Fail criterion:** Any malformed config file causing a server crash or preventing the server from reaching `initialized`; any malformed file producing no debug log entry; any valid sibling config layer not applied due to the malformed file.

---

### TC-VER-CFG-004 — Config.TextSync.Default

**Planguage Tag:** `Config.TextSync.Default`
**Gist:** When `core.text_sync` is absent from all configuration layers, the server advertises `TextDocumentSyncKind.Full` (value 1) in its `initialize` response.
**Type:** Both
**BDD Reference:** **BDD gap** — no scenario in [[bdd/features/workspace]] or [[bdd/features/vault-detection]] covers `core.text_sync` defaulting.
**Phase:** Phase 1

**Setup:** Three distinct startup configurations, none of which defines `core.text_sync`: (1) no user config, no project config; (2) user config present with other keys but no `core.text_sync`; (3) project config present as an empty file.

**Scripted steps:**
```gherkin
Given no configuration file at any layer defines "core.text_sync"
When the LSP server completes the "initialize" handshake
Then "InitializeResult.capabilities.textDocumentSync" equals 1
Or "InitializeResult.capabilities.textDocumentSync.change" equals 1

Given a user config file that sets only "wiki.style" with no "core.text_sync" key
And no project config file
When the LSP server completes the "initialize" handshake
Then "InitializeResult.capabilities.textDocumentSync" equals 1

Given an empty project config file ".flavor-grenade.toml" with no keys
And no user config file
When the LSP server completes the "initialize" handshake
Then "InitializeResult.capabilities.textDocumentSync" equals 1
```

**Agent-driven steps:**
1. Start the server with no user config and no project config. Capture the raw `InitializeResult` JSON. Assert `capabilities.textDocumentSync == 1` or `capabilities.textDocumentSync.change == 1`.
2. Create a user config file with only `wiki.style = "file-stem"` (no `core.text_sync`). Restart and re-capture `InitializeResult`. Assert same sync kind.
3. Create an empty project `.flavor-grenade.toml` (zero bytes or just a comment). Restart and re-capture. Assert same sync kind.
4. Optionally: set `core.text_sync = "incremental"` in the project file, restart, and verify the advertised sync kind changes — confirming the default is genuinely being overridden, not hardcoded.
5. Compute: (startups advertising Full sync when `core.text_sync` absent / 3 tested configurations) = 100%.

**Pass criterion:** 100% of server startups without `core.text_sync` configured advertise `TextDocumentSyncKind.Full` (value 1).
**Fail criterion:** Any server startup without `core.text_sync` configured that advertises a sync kind other than Full (value 1).
