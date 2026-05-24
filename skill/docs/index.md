# Flavor Grenade LSP Skill Specification

This directory specifies the separately versioned `flavorgrenade-lsp-skill`
product. The skill packages agent instructions, command wrappers, schemas,
examples, and an embedded Flavor Grenade LSP native executable so LLM agents can
use the server's Markdown intelligence without depending on VS Code.

The repository acts as the skill marketplace source. Users install from this
repo, list available skills from this repo, and select the Flavor Grenade skill
from this repo using compatible skill installers.

## Specification Set

| Spec | Purpose |
|---|---|
| [product-requirements](product-requirements.md) | Product boundary, users, capabilities, non-goals |
| [embedded-lsp-runtime](embedded-lsp-runtime.md) | Bundled executable layout, runtime selection, verification |
| [agent-compatibility](agent-compatibility.md) | Claude Code, Codex, and general agent behavior contract |
| [distribution-marketplace](distribution-marketplace.md) | Repo marketplace layout, `npx add-skill` / `npx skill` compatibility, install modes |
| [commands-and-json](commands-and-json.md) | Wrapper command surface and stable JSON output schemas |
| [release-versioning](release-versioning.md) | Independent semver, changelog, tags, artifact signing, compatibility matrix |
| [security](security.md) | Wrapper and embedded-binary security requirements |
| [testing-validation](testing-validation.md) | Unit, integration, smoke, compatibility, and release validation |

## Normative Product Name

| Field | Value |
|---|---|
| Package name | `flavorgrenade-lsp-skill` |
| Install name | `flavorgrenade-lsp` |
| Skill entrypoint | `skill/flavorgrenade-lsp/SKILL.md` |
| Skill docs | `skill/docs/` |
| Skill changelog | `skill/flavorgrenade-lsp/CHANGELOG.md` |
| Skill tag pattern | `skill-v*.*.*` |
| Skill test tag pattern | `skill-v*.*.*-test*` |

## Design Principles

- The LSP server remains authoritative for Markdown flavor behavior.
- The skill wraps the LSP; it does not reimplement the parser.
- The skill is useful to LLMs that cannot speak LSP directly.
- The skill supports offline local analysis by default.
- The skill treats changelog conventions and MADR as structured variants, not
  new base Markdown flavors.
- The skill is released independently from the server, extension, and website.
- The repo can host more skills later, but S1 delivers only
  `flavorgrenade-lsp`.

## External Compatibility Notes

Current `add-skill` documentation describes installing skills from GitHub
shorthand, full Git URLs, direct subpaths, and local paths, with agent targets
including `claude-code` and `codex`. This spec therefore treats
`npx add-skill alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp` as a
required install path and treats `npx skill` compatibility as a packaging alias
target that must be verified against the selected installer before release.

Sources:

- <https://github.com/vercel-labs/add-skill>
- <https://context7.com/vercel-labs/add-skill/llms.txt>
