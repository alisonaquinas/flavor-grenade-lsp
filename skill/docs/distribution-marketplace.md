# Distribution And Marketplace Specification

## Marketplace Model

This repository is the marketplace source for the skill. A skill installer must
be able to inspect the repository, list available skills, and install
`flavorgrenade-lsp`.

Marketplace layout:

```text
skill/
├── README.md
├── marketplace.json
├── docs/
└── flavorgrenade-lsp/
    ├── SKILL.md
    ├── README.md
    ├── CHANGELOG.md
    ├── manifest.json
    ├── package.json
    ├── bin/
    ├── wrappers/
    ├── examples/
    └── docs/
```

`skill/docs/` is the source specification set. `skill/flavorgrenade-lsp/docs/`
is the packaged user documentation copied into releases.

## Marketplace Manifest

`skill/marketplace.json` must describe every skill hosted by this repository.

```json
{
  "schemaVersion": "1.0",
  "publisher": "alisonaquinas",
  "repository": "https://github.com/alisonaquinas/flavor-grenade-lsp",
  "skills": [
    {
      "name": "flavorgrenade-lsp",
      "package": "flavorgrenade-lsp-skill",
      "path": "skill/flavorgrenade-lsp",
      "description": "Flavor-aware Markdown analysis for LLM agents using Flavor Grenade LSP.",
      "tags": ["markdown", "lsp", "claude-code", "codex"],
      "license": "MIT",
      "version": "0.1.0"
    }
  ]
}
```

The manifest must be validated in CI.

## Installer Compatibility

The skill must support repository-based installers that follow the `add-skill`
model:

```bash
npx add-skill alisonaquinas/flavor-grenade-lsp --list
npx add-skill alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp
npx add-skill alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp -a claude-code
npx add-skill alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp -a codex
npx add-skill alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp --global -y
```

The product should also be shaped so an installer exposed as `npx skill` can use
the same repository and skill metadata:

```bash
npx skill install alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp
npx skill list alisonaquinas/flavor-grenade-lsp
```

`npx skill` is a compatibility requirement, not yet a verified concrete CLI
contract in this repo. Before implementation closes, S1 must either:

- validate a specific `npx skill` CLI and document exact syntax, or
- record that `npx add-skill` is the supported installer and keep `npx skill`
  compatibility as a future alias target.

## npm Package Compatibility

The skill should also be publishable as an npm package if a registry-based
installer becomes desirable.

Package requirements:

- package name: `flavorgrenade-lsp-skill`
- executable bin: `flavorgrenade`
- package files limited to skill runtime, wrappers, docs, examples, manifest,
  checksums, and signatures
- no source repository history
- no tests or generated caches in production package
- `npm pack --dry-run` verified in CI

Suggested package manifest:

```json
{
  "name": "flavorgrenade-lsp-skill",
  "version": "0.1.0",
  "description": "LLM skill wrapping Flavor Grenade LSP for flavor-aware Markdown analysis.",
  "type": "module",
  "bin": {
    "flavorgrenade": "./wrappers/flavorgrenade.mjs"
  },
  "files": [
    "SKILL.md",
    "README.md",
    "CHANGELOG.md",
    "manifest.json",
    "bin/",
    "wrappers/",
    "examples/",
    "docs/"
  ]
}
```

## Install Modes

| Mode | Requirement |
|---|---|
| Project symlink | Installer may place a symlink into project agent skill dirs |
| Project copy | Installer may copy the skill into project agent skill dirs |
| Global symlink | Installer may link from user-level skill dir |
| Global copy | Installer may copy into user-level skill dir |
| Direct package use | User may run wrapper from unpacked artifact |

The skill must work in both symlink and copy modes. All runtime paths must be
resolved relative to the real skill root.

## Artifact Distribution

GitHub Releases are the primary distribution channel for built artifacts.

Required artifacts per release:

- runtime-specific skill archive
- SHA-256 checksum file
- Sigstore bundle for each archive
- manifest for each archive
- release notes
- compatibility matrix

Required release names:

```text
flavorgrenade-lsp-skill-v0.1.0-linux-x64.tar.gz
flavorgrenade-lsp-skill-v0.1.0-darwin-arm64.tar.gz
flavorgrenade-lsp-skill-v0.1.0-darwin-x64.tar.gz
flavorgrenade-lsp-skill-v0.1.0-win-x64.zip
```

## Marketplace Quality Gates

CI must fail when:

- `skill/marketplace.json` points to a missing path
- the listed skill has no `SKILL.md`
- `SKILL.md` has no description metadata
- package version and manifest version differ
- release artifact does not include an executable
- release artifact includes multiple runtime executables unintentionally
- install smoke tests fail for Claude Code or Codex target paths
- `npx add-skill --list` cannot discover the skill from a packed fixture

## Documentation Requirements

The marketplace landing docs must explain:

- what skills are available
- how to list skills
- how to install globally
- how to install into a project
- how to target Claude Code
- how to target Codex
- how to verify an install
- how to report compatibility issues
