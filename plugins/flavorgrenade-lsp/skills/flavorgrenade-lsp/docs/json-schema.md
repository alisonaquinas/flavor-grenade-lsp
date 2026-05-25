# JSON Schema Notes

Every command returns a stable envelope:

```json
{
  "ok": true,
  "schemaVersion": "1.0",
  "skill": { "name": "flavorgrenade-lsp-skill", "version": "0.1.0" },
  "server": { "name": "flavor-grenade-lsp", "version": "0.5.0" },
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

`analyze.files[]` and `detect` results include per-file flavor decisions,
structured variants, safe evidence, and redacted config metadata when config
participates.
