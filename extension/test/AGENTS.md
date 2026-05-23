# AGENTS.md — extension/test/

Package-level extension tests live here.

## Layout

```text
extension/test/
├── contributions/   # Contribution manifest and language-scope tests
├── marketplace/     # Marketplace asset and VSIX asset tests
└── package-targets/ # Packaged server payload validation
```

## Invariants

- Package-target tests must reject native executable server payloads and require
  exactly one `server/main.js`.
- Marketplace tests must inspect local README references and packaged VSIX
  contents.
- Contribution tests must keep generic Markdown behavior isolated from
  OFMarkdown-specific contributions.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [README.md](./README.md)
