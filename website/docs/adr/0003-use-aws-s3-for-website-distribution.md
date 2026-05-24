---
status: accepted
date: 2026-05-24
decision-makers: Alison Aquinas
consulted: Codex
informed: Future website contributors
supersedes: 0001-use-vite-svelte-typescript-scss-and-github-pages-for-the-website
---

# Use AWS S3 for website distribution

## Context and Problem Statement

The website release workflow was originally planned as a GitHub Pages
deployment. The current project direction is to distribute the built static
website by publishing `website/dist` to an AWS S3 bucket instead.

Website releases also need a separate trigger from the LSP server release. A
server `vX.Y.Z` tag can publish server artifacts, but it must not publish the
website. Website deployment needs its own tag namespace and release evidence.

The decision question is: how should the static website be distributed and
triggered?

## Decision Drivers

- Keep the website a static Vite/Svelte build.
- Publish website output to AWS S3.
- Keep website releases independent from LSP server releases.
- Preserve tag-triggered publishing and the main-branch tag guard.
- Avoid long-lived cloud credentials where GitHub Actions OIDC can assume an
  AWS role.
- Keep test tags useful for build and packaging validation without touching
  production hosting.

## Considered Options

- Continue deploying to GitHub Pages from the existing website workflow.
- Publish the static build to AWS S3 from website-specific release tags.
- Publish the static build whenever the LSP server publishes.

## Decision Outcome

Chosen option: "Publish the static build to AWS S3 from website-specific
release tags".

Production website deployment uses `site-vX.Y.Z` tags. Test website release
runs use `site-vX.Y.Z-test.N` tags. The workflow builds and verifies the
website from the tagged source, preserves `website/dist` as release evidence,
then publishes production output to the configured S3 bucket only after CI and
the main-branch tag guard pass.

Server `vX.Y.Z` tags remain for LSP server/npm/GitHub Release publishing and
must not deploy the website.

### Consequences

- Good, because website publishing can move on its own cadence.
- Good, because AWS S3 gives the project direct control over bucket, domain,
  cache, and optional CDN behavior.
- Good, because GitHub Actions can use OIDC role assumption instead of stored
  AWS access keys where the AWS account supports it.
- Bad, because the project must now own S3 bucket policy, object metadata,
  stale-object handling, and CDN invalidation behavior.
- Neutral, because the site remains static and the Vite/Svelte implementation
  does not need a server runtime.

### Confirmation

The decision is confirmed when:

- Website deployment workflow triggers on `site-vX.Y.Z` and
  `site-vX.Y.Z-test.N` only.
- Production website deployment does not trigger on server `vX.Y.Z` tags.
- Production website deployment verifies the tag commit is contained in
  `origin/main`.
- Website checks and build pass before any S3 write.
- Production deployment writes `website/dist` to the configured S3 bucket.
- Test tags build and preserve artifacts without writing production S3 objects
  or invalidating production CDN caches.
- Protected environment configuration supplies bucket, region, optional CDN
  distribution id, public URL, and AWS role details.

## More Information

- [[website/docs/requirements/operational/ci-cd]]
- [[website/docs/requirements/technical/index]]
- [[website/docs/architecture/ci-cd-and-deployment]]
- [[website/docs/adr/0001-use-vite-svelte-typescript-scss-and-github-pages-for-the-website]]
