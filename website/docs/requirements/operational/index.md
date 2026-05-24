# Website Operational Requirements

## Scope

Website operational requirements describe CI, release, publishing, and AWS S3
controls for the public website.

They apply to every change that can affect the generated site, static assets,
public routes, dependency installation, or AWS S3 deployment. Website
operations stay separate from server and extension release mechanics, including
their own `site-vX.Y.Z` release tag namespace.

## Evidence

Website operational evidence should name the workflow or local command that
proves the release path. Required checks include dependency installation,
manifest-to-installed-package verification, content generation, content checks,
typecheck, tests, production build, and publishing dry runs for test tags.

## Maintenance Rules

- Keep this folder aligned with the website deployment workflow,
  `.github/workflows/ci.yml`, and `website/package.json` scripts.
- Document branch or tag containment checks before allowing an S3 publish job to
  run on a tag event.
- Keep dry-run publishing behavior distinct from real production deployment.
- Update [[website/docs/requirements/technical/sbom]] when website dependency
  sources, maintainers, or licenses change.

## Files

| File | Scope |
|---|---|
| [[ci-cd]] | Website CI, release, distribution, and publishing workflow behavior |
