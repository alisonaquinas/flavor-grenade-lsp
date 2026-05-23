# Extension Test Suites

This directory contains extension tests that are not colocated with source
files. They cover contribution metadata, Marketplace assets, and VSIX package
server payload rules.

## Areas

| Path | Purpose |
|---|---|
| `contributions/` | Tests for snippets, keybindings, language configuration, and contribution isolation. |
| `marketplace/` | Tests for Marketplace README assets and packaged VSIX asset inclusion. |
| `package-targets/` | Tests that validate the packaged server payload shape. |

## See Also

- [Extension AGENTS.md](../AGENTS.md)
- [Extension docs tests](../docs/tests/index.md)
