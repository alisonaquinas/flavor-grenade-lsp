# Commands And JSON Schemas

## Command Entrypoint

The packaged skill exposes one command:

```bash
node wrappers/flavorgrenade.mjs <command> [args] --json
```

If installed as an npm-compatible package, it also exposes:

```bash
flavorgrenade <command> [args] --json
```

All commands default to JSON output. Human-readable output may be added later
behind `--pretty`.

## Required Commands

| Command | Purpose |
|---|---|
| `verify-install` | Verify manifest, runtime target, digest, optional signature, and LSP handshake |
| `analyze <path>` | Return high-level flavor, variant, diagnostic, symbol, fold, link, and boundary data |
| `detect <path>` | Return effective flavor decision and evidence |
| `diagnostics <path>` | Return diagnostics grouped by file |
| `symbols <path>` | Return document and workspace symbols |
| `folds <path>` | Return folding ranges |
| `hover <path>:<line>:<character>` | Return hover data at a position |
| `completions <path>:<line>:<character>` | Return completions at a position |
| `explain-flavor <path>` | Return the flavor decision tree, confidence, evidence, and fallback behavior |
| `variants <path>` | Return structured-profile variants |
| `refs <path>` | Return local references, unresolved references, and non-local boundaries |

## Common Options

| Option | Meaning |
|---|---|
| `--json` | Emit machine-readable JSON |
| `--workspace <path>` | Explicit workspace root |
| `--config <path>` | Optional explicit Flavor Grenade config file for fixture or CI validation; must be inside the workspace |
| `--timeout-ms <number>` | Per-command timeout |
| `--max-files <number>` | File count cap for workspace analysis |
| `--max-bytes <number>` | Per-file byte cap |
| `--include <glob>` | Include Markdown files matching a glob |
| `--exclude <glob>` | Exclude files matching a glob |
| `--require-signature` | Fail if Sigstore verification cannot run or fails |
| `--no-signature-check` | Skip runtime Sigstore verification only; digest verification remains mandatory |
| `--trace` | Emit redacted request timing and runtime metadata |

No option may require interactive input.

`--config` is not a general precedence override for normal agent use. It exists
for deterministic fixtures, CI, and release validation. When supplied, wrappers
must pass the selected workspace and config path to the embedded LSP so the LSP
still performs parsing, validation, directory override matching, and fault
isolation. The wrapper must reject `--config` paths outside the workspace and
must not parse the config independently to decide flavor behavior.

## Result Envelope

Every successful command returns:

```json
{
  "ok": true,
  "schemaVersion": "1.0",
  "skill": {
    "name": "flavorgrenade-lsp-skill",
    "version": "0.1.0"
  },
  "server": {
    "name": "flavor-grenade-lsp",
    "version": "0.5.0"
  },
  "runtime": {
    "target": "linux-x64"
  },
  "workspace": {
    "root": ".",
    "mode": "single-file"
  },
  "result": {}
}
```

Every failed command returns:

```json
{
  "ok": false,
  "schemaVersion": "1.0",
  "error": {
    "code": "FG_SKILL_RUNTIME_DIGEST_MISMATCH",
    "message": "Bundled executable digest does not match manifest.",
    "recoverable": false
  }
}
```

Errors must not include document contents.

## Analyze Result

```json
{
  "files": [
    {
      "path": "README.md",
      "languageId": "markdown",
      "baseFlavor": "gfm",
      "variants": [],
      "confidence": "medium",
      "source": "project-config",
      "evidence": [
        {
          "kind": "config-format",
          "value": "toml",
          "weight": "strong"
        }
      ],
      "config": {
        "source": "project-config",
        "format": "toml",
        "path": ".flavor-grenade.toml",
        "matchedOverride": null
      },
      "diagnostics": [],
      "symbols": [],
      "folds": [],
      "links": [],
      "boundaries": []
    }
  ],
  "summary": {
    "fileCount": 1,
    "diagnosticCount": 0,
    "flavors": ["gfm"],
    "variants": []
  }
}
```

Each `analyze.files[]` entry must include a detection-equivalent decision
summary for that file: `source`, safe `evidence`, and `config` metadata when
configuration participates. Agents must not need to call `detect` separately to
avoid losing directory-specific config evidence before broad edits.

## Detect Result

```json
{
  "path": "CHANGELOG.md",
  "baseFlavor": "commonmark",
  "variants": ["keep-a-changelog"],
  "confidence": "high",
  "source": "inference",
  "evidence": [
    {
      "kind": "file-name",
      "value": "CHANGELOG.md",
      "weight": "strong"
    },
    {
      "kind": "heading-shape",
      "value": "## [Unreleased]",
      "weight": "strong"
    }
  ],
  "overrides": []
}
```

Detection must distinguish:

- explicit TOML config
- explicit JSON config
- explicit JSONC config
- explicit YAML config
- `.editorconfig` Flavor Grenade directives
- directory-scoped project config overrides
- explicit `--config` fixture selection
- VS Code settings
- filename inference
- folder-placement inference
- syntax inference
- structured-profile inference
- fallback default

When multiple Markdown files are analyzed, callers must treat `detect` as
file-specific. A project can resolve one file through global config and another
through a directory override from the same config file.

When configuration participates in the decision, `detect` and
`explain-flavor` must include redacted config metadata:

```json
{
  "config": {
    "source": "project-config",
    "format": "jsonc",
    "path": ".flavor-grenade.jsonc",
    "section": "core.markdown",
    "matchedOverride": {
      "selector": "docs/releases",
      "selectorKind": "directory",
      "order": 2,
      "provided": ["baseFlavor"],
      "inherited": ["structuredProfiles"]
    }
  }
}
```

`path` values must be workspace-relative. Config metadata must not include raw
file contents, raw setting values, environment variables, or private absolute
paths.

Config evidence must use stable, safe facts:

- config file format and workspace-relative path
- normalized source layer, such as `project-config`, `editorconfig`, or
  `lsp-settings`
- matched config section or override selector
- selector kind, such as directory, glob, or `.editorconfig` section
- list of normalized keys that participated in the decision
- list of keys inherited from global config by a matched override
- parse or validation status with redacted error codes

Config evidence must not expose:

- document text
- frontmatter values
- raw config values that may contain secrets or private paths
- absolute filesystem paths
- unredacted parser excerpts

For directory-scoped overrides, output must identify the effective override and
the inherited global keys. It must not require agents to recompute precedence
from raw config.

Config metadata uses these stable enum values:

| Field | Values |
|---|---|
| `config.source` | `project-config`, `explicit-config-option`, `editorconfig`, `lsp-settings`, `none` |
| `config.format` | `toml`, `json`, `jsonc`, `yaml`, `editorconfig`, `none` |
| `config.matchedOverride` | `null` or an object describing the winning directory/glob selector |

The active project config discovery order must mirror the LSP:

1. `.flavor-grenade.toml`
2. `.flavor-grenade.json`
3. `.flavor-grenade.jsonc`
4. `.flavor-grenade.yaml`
5. `.flavor-grenade.yml`
6. `.editorconfig` containing Flavor Grenade directives

The first existing supported project config is the active project config. If
that file is unreadable, too large, unsafe, malformed, or invalid after
normalization, the project-config layer is unavailable and resolution continues
to non-project signals. The wrapper must not fall through to a later
`.flavor-grenade.*` or `.editorconfig` file in the same discovery pass.

Directory override precedence must mirror the LSP: the most specific matching
directory or glob selector wins, measured by normalized selector length. If two
matching selectors have equal specificity, the later override entry wins.
`matchedOverride.order` is evidence metadata only; it is not the primary
precedence rule.

`.editorconfig` directives are section-based. A matching section can set:

- `flavor_grenade_markdown_flavor`
- `flavor_grenade.markdown_flavor`
- `flavor_grenade_markdown_structured_profiles`
- `flavor_grenade.markdown_structured_profiles`

Structured profile directives accept `auto`, `none`, or a comma-separated list
of supported structured profile ids. Ordinary EditorConfig properties are not
Flavor Grenade config.

## Explain Flavor Result

`explain-flavor` returns the same decision evidence as `detect`, plus ordered
rule evaluation and rejected candidates.

```json
{
  "path": "README.md",
  "selected": {
    "baseFlavor": "gfm",
    "variants": [],
    "confidence": "medium"
  },
  "decisionTree": [
    {
      "step": "project-config",
      "matched": false,
      "reason": "No supported Flavor Grenade project config found."
    },
    {
      "step": "directory-override",
      "matched": false,
      "reason": "No project config override matched README.md."
    },
    {
      "step": "syntax-inference",
      "matched": true,
      "evidence": ["task-list", "table"]
    }
  ],
  "rejected": [
    {
      "baseFlavor": "obsidian",
      "reason": "No vault marker, wiki-link, embed, or Obsidian-specific syntax."
    }
  ]
}
```

When config exists, `decisionTree` must show accepted and rejected config
layers in order. Examples include active project config invalid, project-config
layer unavailable, non-matching override skipped, matching override applied,
inherited global profile applied, and fallback inference suppressed by explicit
config. Because the active project config is the first existing supported file,
invalid active project config does not cause fallback to later project config
files in discovery order.

## Diagnostics Result

```json
{
  "diagnostics": [
    {
      "path": "docs/example.md",
      "range": {
        "start": { "line": 10, "character": 4 },
        "end": { "line": 10, "character": 18 }
      },
      "severity": "warning",
      "code": "FG302",
      "message": "Malformed flavor-specific metadata.",
      "source": "flavor-grenade-lsp"
    }
  ]
}
```

## Boundary Result

Host, conversion, renderer, bibliography, MDX/JSX, and execution references
must be returned as boundaries instead of broken local links.

```json
{
  "boundaries": [
    {
      "path": "README.md",
      "kind": "host-reference",
      "target": "#123",
      "host": "github",
      "local": false,
      "reason": "GitHub issue shorthand requires host context."
    }
  ]
}
```

## Completions Result

```json
{
  "items": [
    {
      "label": "Architecture",
      "kind": "heading",
      "insertText": "#architecture",
      "detail": "Local heading in README.md",
      "source": "flavor-grenade-lsp"
    }
  ]
}
```

## Schema Stability

Schema changes follow these rules:

- additive fields are minor-compatible
- field removal is breaking
- type changes are breaking
- enum removal is breaking
- new diagnostic codes are minor-compatible
- new command names are minor-compatible
- changed command default behavior may be breaking

Every schema version must have fixture snapshots.
