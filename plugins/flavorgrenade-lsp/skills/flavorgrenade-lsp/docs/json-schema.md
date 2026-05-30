# JSON Schema Notes

Every command returns a stable envelope:

```json
{
  "ok": true,
  "schemaVersion": "1.0",
  "skill": { "name": "flavorgrenade-lsp-skill", "version": "0.1.0" },
  "server": { "name": "flavor-grenade-lsp", "version": "0.6.0" },
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
`.fgignore` or `.fgattributes` participates. Broad scan commands omit files
hidden by `.fgignore`; direct file detection can report inactive status for an
ignored target.

Active files report:

```json
{
  "path": "docs/guide.md",
  "active": true,
  "baseFlavor": "gfm",
  "variants": ["madr"],
  "source": "fgattributes",
  "config": {
    "source": "fgattributes",
    "format": "fg-config",
    "configFiles": [".fgattributes", "docs/.fgattributes"],
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
  "source": "fgignore",
  "config": {
    "source": "fgignore",
    "ignored": true,
    "inactiveReason": "fgignore"
  }
}
```

When `.fgattributes` is absent, resets `flavor` with `!flavor`, or sets
`flavor=auto`, `source` is `lsp-auto-detect` and the LSP Auto Detect workflow
selects the effective flavor.
