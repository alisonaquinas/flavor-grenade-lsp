# Distribution And Marketplace Specification

## Marketplace Model

This repository is the marketplace source for the skill. A skill installer must
be able to inspect the repository, list available skills, and install
`flavorgrenade-lsp`.

Marketplace layout:

```text
marketplace.json
.claude-plugin/
└── marketplace.json
.agents/
└── plugins/
    └── marketplace.json
skill/
└── docs/
plugins/
└── flavorgrenade-lsp/
    ├── .claude-plugin/
    ├── .codex-plugin/
    ├── skills/
    │   └── flavorgrenade-lsp/
    │       ├── SKILL.md
    │       ├── README.md
    │       ├── CHANGELOG.md
    │       ├── manifest.json
    │       ├── package.json
    │       ├── bin/
    │       ├── wrappers/
    │       ├── examples/
    │       └── docs/
    ├── commands/
    ├── agents/
    ├── hooks/
    ├── codex/
    ├── .mcp.json
    └── lsp/
```

`marketplace.json` is the portable skill catalog for repository scanners.
`.claude-plugin/marketplace.json` is the Claude Code plugin marketplace catalog.
`.agents/plugins/marketplace.json` is the Codex plugin marketplace catalog.
`skill/docs/` is the source specification set.
`plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/` is the canonical
installable skill source. Its `docs/` directory is copied into releases.

`skill/` is reserved for product specifications and non-installable planning
documentation.
`plugins/` contains agent-specific plugin packages that surround the portable
skill with manifests, commands, hooks, agents, optional MCP metadata, and
mandatory embedded-LSP metadata.

## Marketplace Manifest

Root `marketplace.json` must describe every skill hosted by this repository.

```json
{
  "schemaVersion": "1.0",
  "publisher": "alisonaquinas",
  "repository": "https://github.com/alisonaquinas/flavor-grenade-lsp",
  "skills": [
    {
      "name": "flavorgrenade-lsp",
      "package": "flavorgrenade-lsp-skill",
      "path": "plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp",
      "description": "Flavor-aware Markdown analysis for LLM agents using Flavor Grenade LSP.",
      "tags": ["markdown", "lsp", "claude-code", "codex"],
      "license": "MIT",
      "version": "0.1.0"
    }
  ]
}
```

The manifest must be validated in CI.

Root `marketplace.json` is project metadata for this repository. It points to
the plugin-local installable skill so repository scanners do not need a
separate root-level `skills/` tree.

Claude and Codex marketplaces are intentionally separate catalogs because the
host schemas differ:

- Claude Code discovers GitHub marketplaces through
  `.claude-plugin/marketplace.json`; relative plugin paths resolve from the
  repository root that contains `.claude-plugin/`.
- Codex discovers plugin marketplaces through Codex marketplace metadata under
  `.agents/plugins/marketplace.json`; entries must use Codex policy fields and
  point to `./plugins/flavorgrenade-lsp`.

Both host-specific marketplace files must point at the same plugin source
directory. The plugin source must then contain both `.claude-plugin/plugin.json`
and `.codex-plugin/plugin.json`, plus the embedded skill runtime.

## Skill Entrypoint Metadata

`plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/SKILL.md` must include YAML
frontmatter accepted by `add-skill` discovery:

```markdown
---
name: flavorgrenade-lsp
description: Flavor-aware Markdown analysis for LLM agents using Flavor Grenade LSP.
---
```

The `name` must match root `marketplace.json`, the package manifest install
name, and installer examples. CI must fail if `name` or `description` is
missing.

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
the same repository and skill metadata after a concrete CLI contract is
selected:

```bash
npx skill install alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp
npx skill list alisonaquinas/flavor-grenade-lsp
```

`npx skill` is an open compatibility target, not a verified S1 requirement.
Before any release claims `npx skill` support, S1 must either:

- validate a specific `npx skill` CLI and document exact syntax, or
- record that `npx add-skill` is the supported installer and keep `npx skill`
  compatibility as a future alias target.

## npm Package Compatibility

The skill should also be publishable as an npm package if a registry-based
installer becomes desirable.

Package requirements:

- package name: `flavorgrenade-lsp-skill`
- executable bin: `flavorgrenade`
- package version must equal `manifest.json` version when `package.json` is
  present
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
- Sigstore bundle embedded next to the native executable inside each archive
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

- root `marketplace.json` points to a missing path
- legacy `skill/marketplace.json` exists
- legacy root `skills/flavorgrenade-lsp` source tree exists
- the listed skill has no `SKILL.md`
- `SKILL.md` has no description metadata
- `.claude-plugin/marketplace.json` omits `flavorgrenade-lsp` or points to the
  wrong plugin path
- `.agents/plugins/marketplace.json` omits `flavorgrenade-lsp`, points to the
  wrong plugin path, or omits required installation/authentication policy
- package version and manifest version differ
- release artifact does not include an executable
- release artifact does not include the manifest-declared executable Sigstore
  bundle
- release artifact includes multiple runtime executables unintentionally
- install smoke tests fail for Claude Code or Codex target paths
- `npx add-skill --list` cannot discover the skill from a packed fixture
- Claude or Codex plugin manifests point at missing command, hook, agent, MCP,
  LSP, or skill paths
- Codex plugin metadata includes fields rejected by the selected Codex plugin
  validator

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
