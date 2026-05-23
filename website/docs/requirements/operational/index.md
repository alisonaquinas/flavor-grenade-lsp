# Website Operational Requirements

## Scope

Website operational requirements describe CI, release, publishing, and GitHub
Pages controls for the public website.

They apply to every change that can affect the generated site, static assets,
public routes, dependency installation, or GitHub Pages deployment. Website
operations stay separate from server and extension release mechanics except
where a shared version tag or release branch intentionally coordinates them.

## Evidence

Website operational evidence should name the workflow or local command that
proves the release path. Required checks include dependency installation,
manifest-to-installed-package verification, content generation, content checks,
typecheck, tests, production build, and publishing dry runs for test tags.

## Maintenance Rules

- Keep this folder aligned with `.github/workflows/website-pages.yml`,
  `.github/workflows/ci.yml`, and `website/package.json` scripts.
- Document branch or tag containment checks before allowing a Pages publish job
  to run on a tag event.
- Keep dry-run publishing behavior distinct from real production deployment.
- Update [[website/docs/requirements/technical/sbom]] when website dependency
  sources, maintainers, or licenses change.

## Files

| File | Scope |
|---|---|
| [[ci-cd]] | Website CI, release, distribution, and publishing workflow behavior |
