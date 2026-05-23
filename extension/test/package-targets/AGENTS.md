# AGENTS.md — extension/test/package-targets/

VSIX server payload validation tests live here.

## Invariants

- Accept exactly one bundled `server/main.js`.
- Reject missing, duplicate, nested, or native executable server payloads.
- Keep tests aligned with `.github/workflows/extension-release.yml`.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [README.md](./README.md)
