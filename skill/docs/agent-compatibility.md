# Agent Compatibility

## Supported Agent Targets

The skill must be installable and usable by at least:

| Agent | Target name | Project install path | Global install path |
|---|---|---|---|
| Claude Code | `claude-code` | `.claude/skills/flavorgrenade-lsp` | `~/.claude/skills/flavorgrenade-lsp` |
| Codex | `codex` | `.codex/skills/flavorgrenade-lsp` | `~/.codex/skills/flavorgrenade-lsp` |

The install paths are compatibility targets. The implementation must verify the
actual selected installer's current behavior before release.

## Shared Skill Contract

`SKILL.md` must work for Claude Code, Codex, and generic compatible agents. It
must avoid vendor-only assumptions in the main instructions.

Required sections:

- when to use the skill
- when not to use the skill
- available wrapper commands
- safety rules
- expected JSON output
- fallback behavior when the executable cannot run
- examples of agent workflows

The main `SKILL.md` must stay short. Detailed command docs belong in
`README.md` and `docs/`.

## Claude Code Behavior

Claude Code compatibility requires:

- skill directory includes `SKILL.md`
- instructions are written as direct operating rules
- wrappers are local files inside the skill directory
- examples do not require external network access
- commands work from project checkouts and global installs
- any subprocess use is explicit and documented
- outputs are compact enough to fit agent context

Claude-oriented guidance should say:

```text
Use `node wrappers/flavorgrenade.mjs analyze <path> --json` before making broad
Markdown edits when flavor, variant, diagnostics, or document structure matters.
```

## Codex Behavior

Codex compatibility requires:

- skill directory includes `SKILL.md`
- command examples work from PowerShell, bash, and sh where feasible
- JSON output is machine-readable and stable
- wrappers avoid interactive prompts by default
- long-running commands use timeouts
- file paths are accepted as argv values, not shell-expanded strings
- docs clearly separate analysis commands from edit commands

Codex-oriented guidance should say:

```text
Prefer Flavor Grenade wrapper output over ad hoc Markdown inference when a task
depends on flavor detection, diagnostics, symbols, folds, hovers, completions,
links, or structured variants.
```

## Generic Agent Behavior

Agents that do not have first-class skill support may still use the package by
running wrappers directly:

```bash
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs verify-install --json
node skills/flavorgrenade-lsp/wrappers/flavorgrenade.mjs analyze README.md --json
```

The wrapper command must not depend on agent-specific environment variables.

## Agent Decision Tree

Agents should use the skill when:

1. The task touches Markdown.
2. The requested edit may depend on a Markdown flavor or host convention.
3. The repository contains `.flavor-grenade.toml`, `.obsidian/`, VS Code
   flavor settings, changelogs, ADRs, MADR records, MDX, R Markdown, Pandoc,
   GitHub/GitLab syntax, Reddit syntax, Stack Overflow syntax, wiki-links, or
   embeds.
4. The user asks for diagnostics, outlines, symbols, folds, links, hovers,
   completions, or flavor detection.

Agents should not use the skill when:

- the file is not Markdown
- the user asks only for prose drafting with no repository context
- the executable fails verification
- the task requires network-backed host state
- the user explicitly says not to run tools

## Prompt Safety Rules

`SKILL.md` must instruct agents:

- do not execute code blocks
- do not fetch remote references
- do not treat host references as local files
- do not invent flavors
- do not rewrite large document sets from inferred context alone
- do not hide diagnostics from the user when they affect requested edits
- do not continue after executable digest verification fails

## Compatibility Matrix

Each skill release must publish a matrix:

| Skill version | Server version | JSON schema | Claude Code | Codex | Notes |
|---|---|---|---|---|---|
| `0.1.0` | `0.5.x` | `1.0` | supported | supported | Initial embedded executable release |

The matrix belongs in `skills/flavorgrenade-lsp/docs/compatibility.md` in the
released artifact.
