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
| `--config <path>` | Optional explicit Flavor Grenade config file for fixture or CI validation |
| `--timeout-ms <number>` | Per-command timeout |
| `--max-files <number>` | File count cap for workspace analysis |
| `--max-bytes <number>` | Per-file byte cap |
| `--include <glob>` | Include Markdown files matching a glob |
| `--exclude <glob>` | Exclude files matching a glob |
| `--require-signature` | Fail if Sigstore verification cannot run or fails |
| `--no-signature-check` | Skip runtime Sigstore verification only; digest verification remains mandatory |
| `--trace` | Emit redacted request timing and runtime metadata |

No option may require interactive input.

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
- VS Code settings
- filename inference
- folder-placement inference
- syntax inference
- structured-profile inference
- fallback default

When configuration participates in the decision, `detect` and
`explain-flavor` must include redacted config metadata:

```json
{
  "config": {
    "source": "project-config",
    "format": "jsonc",
    "path": ".flavor-grenade.jsonc",
    "matchedOverride": {
      "selector": "docs/releases",
      "inherited": ["structured_profiles"]
    }
  }
}
```

`path` values must be workspace-relative. Config metadata must not include raw
file contents or private absolute paths.

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
