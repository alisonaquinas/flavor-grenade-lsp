# Claude And Codex Plugin Compatibility

## Purpose

The skill product must also be packageable as a plugin around the skill. The
plugin layer supplies installer metadata and agent integrations such as slash
commands, hooks, subagents, MCP declarations, and LSP declarations. The plugin
must include the runtime-specific Flavor Grenade LSP executable through the
packaged skill; without that embedded LSP runtime, the plugin is invalid.

## Product Layout

The repository should support this source layout:

```text
plugins/
└── flavorgrenade-lsp/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── .codex-plugin/
    │   └── plugin.json
    ├── skills/
    │   └── flavorgrenade-lsp/
    │       ├── SKILL.md
    │       ├── README.md
    │       ├── CHANGELOG.md
    │       ├── manifest.json
    │       ├── bin/
    │       ├── wrappers/
    │       ├── examples/
    │       └── docs/
    ├── commands/
    │   ├── flavorgrenade-analyze.md
    │   ├── flavorgrenade-detect.md
    │   ├── flavorgrenade-diagnostics.md
    │   └── flavorgrenade-outline.md
    ├── agents/
    │   ├── markdown-flavor-reviewer.md
    │   └── markdown-release-auditor.md
    ├── hooks/
    │   ├── claude-hooks.json
    │   └── codex-hooks.json
    ├── mcp/
    │   └── servers.json
    ├── lsp/
    │   └── servers.json
    ├── assets/
    └── README.md
```

Runtime release archives may flatten this layout if the installer requires it,
but source specs and tests must preserve the distinction between:

- `skills/`: portable skill entrypoint and runtime
- `.claude-plugin/`: Claude plugin manifest
- `.codex-plugin/`: Codex plugin manifest
- `commands/`: slash-command or command prompt files
- `agents/`: specialized subagent definitions
- `hooks/`: local advisory automation
- `mcp/`: optional MCP metadata
- `lsp/`: required LSP metadata for plugin hosts that support LSP declarations

## Mandatory Embedded LSP

Every plugin artifact must include the portable skill and its embedded native
LSP runtime:

```text
plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/bin/<target>/flavor-grenade-lsp
plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/manifest.json
plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs
```

The plugin must not depend on a globally installed `flavor-grenade-lsp`, a Bun
source checkout, or a network download. Plugin commands, hooks, MCP adapters,
and LSP declarations must all resolve through the bundled runtime resolver so
digest verification and platform selection run before the LSP starts.

Validation must fail if a plugin archive lacks the executable for its target,
the executable digest, the runtime manifest, or an LSP handshake verification
report.

## Claude Plugin Manifest

Claude plugin releases must include:

```json
{
  "name": "flavorgrenade-lsp",
  "displayName": "Flavor Grenade LSP",
  "version": "0.1.0",
  "description": "Flavor-aware Markdown analysis for Claude Code using Flavor Grenade LSP.",
  "author": {
    "name": "Alison Aquinas",
    "url": "https://github.com/alisonaquinas"
  },
  "homepage": "https://flavor-grenade.dev/",
  "repository": "https://github.com/alisonaquinas/flavor-grenade-lsp",
  "license": "MIT",
  "keywords": ["markdown", "lsp", "flavor", "documentation"],
  "skills": "./skills/",
  "commands": ["./commands/"],
  "agents": ["./agents/"],
  "hooks": "./hooks/claude-hooks.json",
  "mcpServers": "./mcp/servers.json",
  "lspServers": "./lsp/servers.json"
}
```

Claude plugin files must use paths relative to the plugin root. Any command that
invokes the embedded executable must use a plugin-root-relative wrapper path and
must not require global installation.

## Codex Plugin Manifest

Codex plugin releases must include:

```json
{
  "name": "flavorgrenade-lsp",
  "version": "0.1.0",
  "description": "Flavor-aware Markdown analysis for Codex using Flavor Grenade LSP.",
  "skills": "./skills/",
  "hooks": "./hooks/codex-hooks.json",
  "mcpServers": "./mcp/servers.json"
}
```

Codex compatibility has a stricter validation posture. Fields that are not
accepted by the installed Codex plugin validator must be omitted from
`.codex-plugin/plugin.json` even if Claude supports equivalent fields. Commands,
agents, LSP declarations, and apps must be added only after the selected Codex
version validates them.

The outer plugin directory name and `.codex-plugin/plugin.json` `name` value
must match the normalized plugin name `flavorgrenade-lsp`.

## Slash Commands

The plugin must provide command prompt files for common workflows. Commands must
be thin entrypoints that tell the agent to call the wrapper; they must not
duplicate the server's logic.

Required command files:

| File | Intent |
|---|---|
| `commands/flavorgrenade-analyze.md` | Analyze selected Markdown files or a workspace |
| `commands/flavorgrenade-detect.md` | Explain effective Markdown flavor and variants |
| `commands/flavorgrenade-diagnostics.md` | Collect diagnostics before an edit |
| `commands/flavorgrenade-outline.md` | Build an outline from symbols and folds |

Each command must include:

- when to use it
- wrapper command to run
- expected JSON fields
- safety reminder about no code execution
- fallback if install verification fails

Claude may expose these as slash commands through its plugin command support.
Codex must either expose them through a validated command mechanism or keep them
as documented prompt files for future compatibility.

## Hooks

Hooks are optional and must be conservative. They may validate Markdown after an
agent edits files, but they must not auto-rewrite user content.

Recommended hooks:

| Hook | Matcher | Action |
|---|---|---|
| Post edit Markdown check | Markdown file writes/edits | Run `flavorgrenade diagnostics <changed-file> --json` |
| Pre release-note check | Changelog or MADR files | Run `flavorgrenade variants <changed-file> --json` |
| Install verification | Plugin install/update | Run `flavorgrenade verify-install --json` |

Hook requirements:

- hooks must be disabled or advisory by default until validated per agent
- hooks must use wrapper commands with argv arrays
- hooks must inherit the same path confinement rules as wrappers
- hooks must have timeouts and output caps
- hooks must not fail unrelated non-Markdown edits
- hooks must not execute Markdown code blocks or renderer hooks

Claude hooks may use the Claude plugin `hooks` field. Codex hooks may use the
Codex `hooks` field only if the selected Codex version accepts the field during
validation.

## Specialized Agents

Claude plugin packages should include specialized agent definitions. Codex
packages may include the same files as documentation unless Codex validates an
agent manifest format for the selected release.

Required agent definitions:

| Agent | Purpose |
|---|---|
| `markdown-flavor-reviewer` | Review Markdown edits for flavor, variant, boundary, and diagnostic correctness |
| `markdown-release-auditor` | Review changelogs, MADR records, release docs, and structured-profile variants |

Agent prompts must instruct reviewers to use wrapper output as evidence and to
avoid making claims from syntax guesses alone.

## MCP Declarations

The first plugin release should not require an MCP server. If an MCP adapter is
added later, it must be local-only and wrap the same embedded executable.

MCP config rules:

- omit MCP fields if no MCP server files are packaged
- never declare remote MCP servers for Markdown analysis
- use plugin-root-relative command paths
- keep MCP output schemas aligned with `commands-and-json.md`
- document security and timeout behavior

## LSP Declarations

The plugin must include an LSP declaration for the embedded Flavor Grenade
runtime. Claude supports plugin LSP server declarations, so the Claude plugin
manifest must reference `./lsp/servers.json`. Codex must include the same LSP
metadata file in the archive even when `.codex-plugin/plugin.json` omits the
field because the selected Codex validator does not yet accept it.

LSP declaration rules:

- declare only local plugin-root-relative executable paths
- include target-specific path selection or point to the runtime resolver
- preserve digest verification before launch
- do not bypass wrapper safety checks for agent-facing commands
- include `lsp/servers.json` in every plugin artifact
- omit the `lspServers` field from Codex plugin metadata only when Codex
  rejects that manifest field; do not omit the packaged LSP metadata itself

## Settings And Assets

Plugin packages should include:

- icons or small assets for compatible plugin marketplaces
- a default prompt or short description when supported by the agent
- no secrets, `.env` files, machine-local paths, or generated caches
- no platform executable outside the selected runtime artifact

Codex `agents/openai.yaml` metadata may be generated later if the selected
installer requires interface metadata. It must remain consistent with
`SKILL.md`, plugin manifests, and the compatibility matrix.

## Validation Requirements

CI must validate:

- `.claude-plugin/plugin.json` parses as JSON
- `.codex-plugin/plugin.json` parses as JSON
- plugin manifest versions equal skill manifest version
- plugin manifest names equal `flavorgrenade-lsp`
- plugin manifest component paths exist
- Claude command files exist for required commands
- hook files exist when referenced
- MCP files exist only when referenced
- LSP files exist in every plugin artifact
- every plugin artifact includes the target runtime executable, manifest,
  digest, and LSP handshake verification report
- `lsp/servers.json` exists in every plugin artifact and points to the bundled
  runtime resolver or target executable
- Codex manifest omits unsupported fields for the selected Codex validator
- every command file references a packaged wrapper command
- hooks are advisory and Markdown-scoped

## Release Requirements

The skill release must publish plugin-compatible artifacts:

| Artifact | Contents |
|---|---|
| skill archive | Portable `skills/flavorgrenade-lsp/` skill |
| Claude plugin archive | `.claude-plugin/`, embedded-LSP skill, commands, agents, hooks, optional MCP metadata, required LSP metadata |
| Codex plugin archive | `.codex-plugin/`, embedded-LSP skill, compatible hooks/MCP metadata, docs, required packaged LSP metadata |

If a single archive is used for both Claude and Codex, it must include both
plugin manifests, include the embedded LSP runtime, and pass both validators.

## Sources

- Claude plugin reference: <https://code.claude.com/docs/en/plugins-reference>
- Claude plugin marketplaces: <https://code.claude.com/docs/en/plugin-marketplaces>
- Codex plugin creator references: <https://github.com/openai/codex>
