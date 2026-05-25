# AGENTS.md - Skill Examples

Example Markdown files should stay small, realistic, and safe to analyze. They
exist to demonstrate wrapper output and skill behavior, not to cover every LSP
parser edge case.

## Workflows

Run examples through the wrapper from an unpacked skill artifact, or use the
skill smoke tests for wrapper-only behavior:

```bash
bun run skill:test
```

## Invariants

- Do not include executable code that an agent might be tempted to run.
- Keep examples independent of private local paths.
- Prefer one behavior per example directory.
- Update [README.md](./README.md) when adding or removing examples.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Examples README](./README.md)
- [Security](../docs/security.md)
