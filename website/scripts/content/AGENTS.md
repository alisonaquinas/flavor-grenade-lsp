# AGENTS.md — website/scripts/content/

CLI wrappers for the website content pipeline live here.

## Layout

```text
website/scripts/content/
├── generate.ts # Generate checked-in website content modules
└── check.ts    # Verify generated content and source manifests are consistent
```

## Invariants

- Scripts must call the shared pipeline code in `website/src/content/pipeline/`
  rather than reimplementing content parsing.
- Generation must be deterministic from tracked Markdown and manifests.
- Validation must fail when generated files are stale.

## See Also

- [Parent AGENTS.md](../../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [README.md](./README.md)
