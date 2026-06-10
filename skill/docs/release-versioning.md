# Release And Versioning

## Linked Semver

The skill uses the same semantic version as the LSP server release it embeds:

```text
v0.7.1
```

The skill still records which server executable it embeds, but the public skill
version, plugin version, marketplace version, and embedded server version stay
linked to avoid confusion.

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
| `v*.*.*` | Production server and skill release |
| `v*.*.*-test*` | Draft prerelease or release dry-run |

Server/skill tags may trigger server npm publishing and skill packaging. Skill
artifacts must attach to the same GitHub Release as the server runtime
artifacts.

Server release tags must run a skill packaging check. That check downloads the
just-published signed server executable for each runtime, verifies the server
Sigstore bundle, packages the plugin skill artifact with the same version, and
stores provenance evidence.

## Changelog

The skill changelog lives at:

```text
plugins/flavorgrenade-lsp/CHANGELOG.md
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
copied into the skill changelog. Packaging copies this plugin-root changelog
into `skills/flavorgrenade-lsp/CHANGELOG.md` inside release artifacts.

## Compatibility Matrix

Every release must publish:

```text
plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/docs/compatibility.md
```

Minimum matrix:

| Skill | Server | JSON schema | Claude Code | Codex | Runtime targets |
|---|---|---|---|---|---|
| `0.7.1` | `0.7.x` | `1.0` | supported | supported | linux-x64, darwin-arm64, darwin-x64, win-x64 |

The matrix must also record plugin compatibility:

| Skill | Claude plugin schema | Codex plugin schema | Commands | Hooks | Agents | MCP | LSP |
|---|---|---|---|---|---|---|---|
| `0.7.1` | supported | supported fields only | Claude required, Codex validated/deferred | advisory | Claude required, Codex validated/deferred | optional | required in artifact; manifest field validated/deferred by agent |

## Release Workflow

Production release:

1. Create `release/vX.Y.Z` from `develop`.
2. Update server and skill changelogs.
3. Update server, package, extension, website, skill, plugin, and marketplace
   versions to `X.Y.Z`.
4. Select the matching server tag `vX.Y.Z` to embed.
5. Fetch native executable artifacts and Sigstore bundles from that server
   GitHub Release.
6. Verify executable checksums and Sigstore bundles before packaging.
7. Assemble runtime-specific skill archives.
8. Run install smoke tests for each archive.
9. Run wrapper command smoke tests.
10. Generate checksums.
11. Sign archives with GitHub OIDC Sigstore.
12. Create or update the GitHub Release for `vX.Y.Z`.
13. Attach archives, checksums, signature bundles, compatibility matrix, and
    release notes to the same release as the server artifacts.
14. Merge release branch by git-flow process.

Dry-run release:

1. Push `vX.Y.Z-test.N`.
2. Fetch selected server release artifacts; manual dry-runs may use
   `server_release=latest`.
3. Run all verification.
4. Sign skill archives through the release-signing path.
5. Create draft prerelease.
6. Skip all unrelated publishers.

## Artifact Names

```text
flavorgrenade-lsp-skill-v0.7.1-linux-x64.tar.gz
flavorgrenade-lsp-skill-v0.7.1-linux-x64.tar.gz.sigstore.json
flavorgrenade-lsp-skill-v0.7.1-darwin-arm64.tar.gz
flavorgrenade-lsp-skill-v0.7.1-darwin-arm64.tar.gz.sigstore.json
flavorgrenade-lsp-skill-v0.7.1-darwin-x64.tar.gz
flavorgrenade-lsp-skill-v0.7.1-darwin-x64.tar.gz.sigstore.json
flavorgrenade-lsp-skill-v0.7.1-win-x64.zip
flavorgrenade-lsp-skill-v0.7.1-win-x64.zip.sigstore.json
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
- executable signatures verify against the manifest-declared Sigstore bundle
  and the server `release.yml` workflow identity
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
- config fixture snapshots pass for `.mdfignore`, nested `.mdfattributes`,
  `!flavor`, and `flavor=auto`
- hostile fixture tests pass

## Provenance

Skill release notes must include:

- skill version
- server version
- embedded server release tag
- embedded server commit
- embedded server artifact source URL
- release commit
- native target list
- JSON schema version
- signature verification instructions
- known limitations
- upgrade notes
