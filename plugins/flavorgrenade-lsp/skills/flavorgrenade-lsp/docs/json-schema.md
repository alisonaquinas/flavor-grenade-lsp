# JSON Schema Notes

Every command returns a stable envelope:

```json
{
  "ok": true,
  "schemaVersion": "1.0",
  "skill": { "name": "flavorgrenade-lsp-skill", "version": "0.2.1" },
  "server": { "name": "flavor-grenade-lsp", "version": "0.7.1" },
  "runtime": { "target": "win-x64" },
  "workspace": { "root": ".", "mode": "single-file" },
  "result": {}
}
```

Failures return:

```json
{
  "ok": false,
  "schemaVersion": "1.0",
  "error": {
    "code": "FG_SKILL_ERROR",
    "message": "Redacted error.",
    "recoverable": false
  }
}
```

`analyze.files[]` and direct `detect` results include per-file flavor decisions,
structured variants, safe evidence, and redacted config metadata when
`.mdfignore` or `.mdfattributes` participates. Broad scan commands omit files
hidden by `.mdfignore`; direct file detection can report inactive status for an
ignored target.

Active files report:

```json
{
  "path": "docs/guide.md",
  "active": true,
  "baseFlavor": "gfm",
  "variants": ["madr"],
  "source": "mdfattributes",
  "config": {
    "source": "mdfattributes",
    "format": "mdf-config",
    "configFiles": [".mdfattributes", "docs/.mdfattributes"],
    "ignored": false,
    "attributes": {
      "flavor": "gfm",
      "structuredProfiles": ["madr"]
    }
  }
}
```

Direct detection of an ignored file reports inactive status instead of a flavor
decision:

```json
{
  "path": "drafts/skip.md",
  "active": false,
  "baseFlavor": null,
  "source": "mdfignore",
  "config": {
    "source": "mdfignore",
    "ignored": true,
    "inactiveReason": "mdfignore"
  }
}
```

When `.mdfattributes` is absent, resets `flavor` with `!flavor`, or sets
`flavor=auto`, `source` is `lsp-auto-detect` and the LSP Auto Detect workflow
selects the effective flavor.
