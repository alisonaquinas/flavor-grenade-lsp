# Release And Versioning

## Independent Semver

The skill uses its own semantic version:

```text
skill-v0.1.0
```

It does not inherit the server, extension, or website version. A skill release
records which server executable it embeds.

## Version Rules

| Change | Version bump |
|---|---|
| Documentation typo | patch |
| Wrapper bug fix | patch |
| Security hardening with compatible behavior | patch |
| New command | minor |
| New JSON field | minor |
| New supported runtime | minor |
| New server-compatible range | minor |
| Removed command | major |
| Changed output field type | major |
| Changed safety default | major |
| Dropped agent compatibility | major |

## Tag Patterns

| Tag | Purpose |
|---|---|
| `skill-v*.*.*` | Production skill release |
| `skill-v*.*.*-test*` | Draft prerelease or release dry-run |

Skill tags must not trigger server npm publishing, extension publishing, or
website deployment.

## Changelog

The skill changelog lives at:

```text
skills/flavorgrenade-lsp/CHANGELOG.md
```

It tracks only skill changes:

- wrapper commands
- `SKILL.md` behavior
- embedded executable compatibility
- JSON schema changes
- agent compatibility
- distribution changes
- security hardening

Server behavior changes are linked through the compatibility matrix rather than
copied into the skill changelog.

## Compatibility Matrix

Every release must publish:

```text
skills/flavorgrenade-lsp/docs/compatibility.md
```

Minimum matrix:

| Skill | Server | JSON schema | Claude Code | Codex | Runtime targets |
|---|---|---|---|---|---|
| `0.1.0` | `0.5.x` | `1.0` | supported | supported | linux-x64, darwin-arm64, darwin-x64, win-x64 |

The matrix must also record plugin compatibility:

| Skill | Claude plugin schema | Codex plugin schema | Commands | Hooks | Agents | MCP | LSP |
|---|---|---|---|---|---|---|---|
| `0.1.0` | supported | supported fields only | Claude required, Codex validated/deferred | advisory | Claude required, Codex validated/deferred | optional | required in artifact; manifest field validated/deferred by agent |

## Release Workflow

Production release:

1. Create `release/skill-vX.Y.Z` from `develop`.
2. Update skill changelog.
3. Update skill manifest version.
4. Select server release version and commit.
5. Fetch or build native executable artifacts.
6. Verify executable checksums and Sigstore bundles.
7. Assemble runtime-specific skill archives.
8. Run install smoke tests for each archive.
9. Run wrapper command smoke tests.
10. Generate checksums.
11. Sign archives with GitHub OIDC Sigstore.
12. Create GitHub Release for `skill-vX.Y.Z`.
13. Attach archives, checksums, signature bundles, compatibility matrix, and
    release notes.
14. Merge release branch by git-flow process.

Dry-run release:

1. Push `skill-vX.Y.Z-test.N`.
2. Build all artifacts.
3. Run all verification.
4. Sign artifacts through the release-signing path.
5. Create draft prerelease.
6. Skip all unrelated publishers.

## Artifact Names

```text
flavorgrenade-lsp-skill-v0.1.0-linux-x64.tar.gz
flavorgrenade-lsp-skill-v0.1.0-linux-x64.tar.gz.sigstore.json
flavorgrenade-lsp-skill-v0.1.0-darwin-arm64.tar.gz
flavorgrenade-lsp-skill-v0.1.0-darwin-arm64.tar.gz.sigstore.json
flavorgrenade-lsp-skill-v0.1.0-darwin-x64.tar.gz
flavorgrenade-lsp-skill-v0.1.0-darwin-x64.tar.gz.sigstore.json
flavorgrenade-lsp-skill-v0.1.0-win-x64.zip
flavorgrenade-lsp-skill-v0.1.0-win-x64.zip.sigstore.json
checksums.txt
compatibility.md
```

## Release Gates

Release CI must verify:

- all package manifests are valid
- all wrapper commands are present
- every archive contains exactly one intended runtime target
- every executable digest matches its manifest
- archive signatures verify
- executable signatures verify when included
- Claude Code install fixture passes
- Codex install fixture passes
- Claude plugin manifest validates
- Codex plugin manifest validates against supported fields
- plugin command, hook, agent, MCP, and LSP path references resolve
- every plugin artifact includes the target embedded LSP runtime and handshake
  verification report
- `npx add-skill` repository install fixture passes
- `npx skill` compatibility is either verified with a selected CLI contract or
  explicitly left as an open compatibility target
- JSON schema snapshots pass
- config fixture snapshots pass for TOML, JSON, JSONC, YAML, `.editorconfig`,
  and directory-scoped overrides
- hostile fixture tests pass

## Provenance

Skill release notes must include:

- skill version
- server version
- server commit
- release commit
- native target list
- JSON schema version
- signature verification instructions
- known limitations
- upgrade notes
