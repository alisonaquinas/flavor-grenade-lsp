---
title: Extension Requirements Index
tags:
  - extension/docs
  - requirements/index
aliases:
  - Extension Requirements
---

# Extension Requirements

Extension requirements are grouped by layer so client UX, behavior, technical
constraints, operational controls, and user goals can be reviewed separately.

Use this index when a VS Code client change needs requirement traceability. The
extension has its own user and design requirements because its behavior is
experienced through VS Code status items, commands, language selection, package
metadata, and Marketplace assets. Where the extension inherits a repository-wide
constraint, the extension layer links to the root requirement instead of copying
it.

## Layer Boundary

- Design requirements describe how the extension presents state and actions.
- Functional requirements describe measurable client behavior.
- Technical requirements describe package, dependency, and integration
  constraints.
- Operational requirements describe CI, packaging, release, and publishing
  controls.
- User requirements describe the editor workflows the extension must support.

## Maintenance Rules

- Keep extension requirements synchronized with `extension/package.json`,
  `extension/README.md`, and extension tests.
- Add extension-specific requirements here only when root requirements are too
  broad or do not capture VS Code behavior.
- Link every measurable extension behavior to `extension/docs/tests` or a root
  CI workflow assertion before release.
- Keep Marketplace-facing claims aligned with packaged assets and server
  compatibility rules.

| Layer | Directory | Scope |
|---|---|---|
| Design | [design/index.md](design/index.md) | Extension UX shape, status surfaces, selector presentation, and Marketplace proof |
| Functional | [functional/index.md](functional/index.md) | Measurable extension behavior |
| Technical | [technical/index.md](technical/index.md) | Extension-facing technical constraints inherited from root requirements |
| Operational | [operational/index.md](operational/index.md) | Extension-facing CI, packaging, release, and supply-chain controls |
| User | [user/index.md](user/index.md) | Extension user goals |
