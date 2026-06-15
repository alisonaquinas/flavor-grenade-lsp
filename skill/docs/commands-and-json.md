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
| `--timeout-ms <number>` | Per-command timeout |
| `--max-files <number>` | File count cap for workspace analysis |
| `--max-bytes <number>` | Per-file byte cap |
| `--include <glob>` | Include Markdown files matching a glob |
| `--exclude <glob>` | Exclude files matching a glob |
| `--require-signature` | Fail if Sigstore verification cannot run or fails |
| `--no-signature-check` | Skip runtime Sigstore verification only; digest verification remains mandatory |
| `--trace` | Emit redacted request timing and runtime metadata |

No option may require interactive input.

Explicit config override options are not part of normal agent use. Flavor
visibility comes from `.mdfignore`; explicit flavor and structured-profile
assignment comes from `.mdfattributes`; Auto Detect remains the fallback when no
concrete flavor attribute applies.

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
      "source": "mdfattributes",
      "evidence": [
        {
          "kind": "mdfattributes",
          "value": "gfm",
          "weight": "strong"
        }
      ],
      "config": {
        "source": "mdfattributes",
        "format": "mdf-config",
        "path": ".mdfattributes",
        "configFiles": [".mdfattributes"],
        "ignored": false,
        "attributes": {
          "flavor": "gfm",
          "structuredProfiles": []
        }
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

- `.mdfignore` visibility matches
- `.mdfattributes` explicit flavor matches
- `.mdfattributes` structured-profile matches
- `.mdfattributes` `!flavor` reset rules
- `.mdfattributes` `flavor=auto` rules
- VS Code settings
- filename inference
- folder-placement inference
- syntax inference
- structured-profile inference
- fallback default

When multiple Markdown files are analyzed, callers must treat `detect` as
file-specific. A project can resolve one file through a root `.mdfattributes`
rule and another through a nested `.mdfattributes` rule.

When configuration participates in the decision, `detect` and
`explain-flavor` must include redacted config metadata:

```json
{
  "config": {
    "source": "mdfattributes",
    "format": "mdf-config",
    "path": "docs/.mdfattributes",
    "configFiles": [".mdfattributes", "docs/.mdfattributes"],
    "ignored": false,
    "matchedAttributes": {
      "selector": "*.md",
      "selectorKind": "glob",
      "order": 1,
      "provided": ["flavor", "structuredProfiles"]
    }
  }
}
```

`path` values must be workspace-relative. Config metadata must not include raw
file contents, raw setting values, environment variables, or private absolute
paths.

Config evidence must use stable, safe facts:

- config file format and workspace-relative path
- normalized source layer, such as `mdfignore`, `mdfattributes`,
  `lsp-settings`, or `none`
- matched `.mdfignore` pattern or `.mdfattributes` selector
- selector kind, such as path or glob
- list of normalized keys that participated in the decision
- parse or validation status with redacted error codes

Config evidence must not expose:

- document text
- frontmatter values
- raw config values that may contain secrets or private paths
- absolute filesystem paths
- unredacted parser excerpts

Config metadata uses these stable enum values:

| Field | Values |
|---|---|
| `config.source` | `mdfignore`, `mdfattributes`, `lsp-settings`, `none` |
| `config.format` | `mdf-config`, `none` |
| `config.matchedAttributes` | `null` or an object describing the matched `.mdfattributes` selector |

The active Markdown flavor config discovery must mirror the LSP:

1. `.mdfignore` files from workspace root to the target directory.
2. `.mdfattributes` files from workspace root to the target directory.
3. LSP or editor state supplied by the caller.
4. Auto Detect.

`.mdfignore` is resolved first. Matching ignored files are inactive unless a
later negated rule re-includes them. `.mdfattributes` then supplies `flavor` and
`structured_profiles` attributes. `!flavor` clears the effective flavor selected
so far, and `flavor=auto` explicitly requests Auto Detect.

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
      "step": "mdfignore",
      "matched": false,
      "reason": "No matching .mdfignore rule hides this document."
    },
    {
      "step": "mdfattributes",
      "matched": false,
      "reason": "No concrete .mdfattributes flavor selected the base flavor."
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
layers in order. Examples include ignored file inactive, `.mdfattributes`
matched, `!flavor` reset applied, `flavor=auto` requested, and fallback
inference suppressed by an explicit concrete `flavor` attribute.

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
