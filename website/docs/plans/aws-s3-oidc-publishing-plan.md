# AWS S3 OIDC Publishing Implementation Plan

Observed on 2026-05-24.

## Goal

Replace the current GitHub Pages website deployment workflow with a secure,
maintainable GitHub Actions workflow that publishes `website/dist` to AWS S3
through OIDC-assumed AWS credentials.

The production website deploy must:

- trigger only from `site-vX.Y.Z` tags
- not trigger from LSP server `vX.Y.Z` tags
- verify the tag commit is on `origin/main`
- run website lint, typecheck, tests, and build before any AWS access
- use GitHub Actions OIDC instead of long-lived AWS access keys
- publish only from the protected `website-production` environment
- preserve release evidence

## Recommendation

Implement private S3 plus CloudFront Origin Access Control (OAC):

1. GitHub Actions builds `website/dist`.
2. Production deploy job enters `website-production`.
3. GitHub Actions requests an OIDC token with `id-token: write`.
4. `aws-actions/configure-aws-credentials` exchanges the OIDC token for a
   short-lived AWS role session.
5. AWS CLI syncs `website/dist` to the target S3 bucket.
6. AWS CLI creates a CloudFront invalidation when a distribution id is
   configured.

Direct public S3 website hosting is acceptable only if the project explicitly
chooses a public bucket and accepts the weaker access model. Private S3 plus
CloudFront OAC remains the recommended target.

## Inputs

AWS and GitHub setup must provide:

| Name | Location | Purpose |
|---|---|---|
| `AWS_WEBSITE_BUCKET` | GitHub environment variable | Target S3 bucket name, currently `flavor-grenade-site` |
| `AWS_REGION` | GitHub environment variable | Bucket and STS workflow region |
| `AWS_WEBSITE_DEPLOY_ROLE_ARN` | GitHub environment variable | IAM role assumed by GitHub Actions |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | GitHub environment variable | Optional CDN invalidation target, currently `E2TPBPS2W81ASF` |
| `WEBSITE_PUBLIC_URL` | GitHub environment variable | Deployment environment URL, currently `https://flavor-grenade.dev` |
| `WEBSITE_BASE_URL_PATH` | GitHub environment variable | Vite base path, normally `/` |

No normal production deploy input should be an AWS access key or secret access
key.

## Repository Work Plan

### Phase 1: Prepare AWS Target

Follow [[aws-s3-oidc-aws-setup-guide]] before editing the deployment workflow.

Expected outputs:

- S3 bucket exists.
- CloudFront distribution exists if using recommended topology.
- CloudFront OAC can read the bucket.
- IAM OIDC provider exists for GitHub Actions.
- IAM deploy role exists with trust scoped to this repository and
  `website-production`.
- IAM deploy role has least-privilege S3 and optional CloudFront invalidation
  permissions.
- GitHub `website-production` environment has variables and tag restrictions.

### Phase 2: Rename Or Replace Workflow

The implementation replaces `.github/workflows/website-pages.yml` with:

```text
.github/workflows/website-s3.yml
```

Required trigger:

```yaml
on:
  push:
    tags:
      - 'site-v*.*.*'
      - 'site-v*.*.*-test*'
```

Do not include:

```yaml
- 'v*.*.*'
- 'v*.*.*-test*'
```

Those are server release tags.

### Phase 3: Keep Build Job Credential-Free

Build job responsibilities:

- checkout with full history and `persist-credentials: false`
- validate tag shape
- run main-branch tag guard for production tags
- install website dependencies with `npm ci`
- run `npm run lint`
- run `npm run typecheck`
- run `npm test`
- run `npm run build`
- smoke-check `website/dist`
- upload `website-dist` and `website-release-evidence` artifacts

The build job must not request `id-token: write` and must not assume AWS
credentials.

### Phase 4: Add Production Deploy Job

Deploy job responsibilities:

- run only when tag is not a test tag
- depend on the build job
- use environment `website-production`
- request `id-token: write`
- download the `website-dist` artifact
- assume the AWS deploy role through
  `aws-actions/configure-aws-credentials`
- verify identity with `aws sts get-caller-identity`
- sync immutable asset files to S3 with long cache headers
- sync HTML and metadata files to S3 with short cache headers
- invalidate CloudFront if `AWS_CLOUDFRONT_DISTRIBUTION_ID` is set

Deploy job permissions:

```yaml
permissions:
  contents: read
  id-token: write
```

### Phase 5: Use Two S3 Sync Passes

Use a long cache policy for hashed assets:

```bash
aws s3 sync website-dist/assets "s3://${AWS_WEBSITE_BUCKET}/assets" \
  --delete \
  --only-show-errors \
  --cache-control "public,max-age=31536000,immutable"
```

Use a short cache policy for HTML, routes, and metadata:

```bash
aws s3 sync website-dist "s3://${AWS_WEBSITE_BUCKET}" \
  --delete \
  --only-show-errors \
  --exclude "assets/*" \
  --cache-control "public,max-age=300,must-revalidate"
```

If Vite changes the generated asset directory, update the `assets/*` path.

### Phase 6: Invalidate CloudFront

When CloudFront is configured:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$AWS_CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
```

Start with `/*` for correctness. Later optimization may generate a smaller
invalidation set for non-hashed routes and metadata.

### Phase 7: Update Tests

Update website workflow tests to assert:

- workflow triggers include `site-v*.*.*`
- workflow triggers do not include server `v*.*.*`
- production deploy job uses `website-production`
- deploy job has `id-token: write`
- workflow uses `aws-actions/configure-aws-credentials`
- workflow runs `aws s3 sync`
- workflow preserves build and release evidence artifacts

Existing tests referencing `website-pages.yml` must be updated to the new
workflow path.

### Phase 8: Update Docs And Release Notes

Update:

- [[website/docs/architecture/ci-cd-and-deployment]]
- [[website/docs/requirements/operational/ci-cd]]
- [[website/docs/research/aws-s3-github-actions-publishing-research]] if the
  implementation differs from the recommendation
- root `CHANGELOG.md` if repository policy requires release-note tracking for
  workflow changes

## Acceptance Criteria

- `site-vX.Y.Z-test.N` builds and uploads workflow artifacts without assuming
  the production AWS role.
- `site-vX.Y.Z` builds, passes checks, enters `website-production`, assumes the
  AWS role through OIDC, syncs `website/dist` to S3, and invalidates CloudFront
  when configured.
- `vX.Y.Z` server tags do not start website deployment.
- Pull requests and branch pushes do not write to S3.
- No AWS access keys are stored in repository or environment secrets for normal
  production deployment.
- AWS role trust is scoped to
  `repo:alisonaquinas/flavor-grenade-lsp:environment:website-production`.
- S3 permissions are limited to the one website bucket.
- CloudFront invalidation permission is limited to the one distribution.

## Verification Commands

Run locally before PR:

```bash
bun run lint:docs
```

Run after workflow implementation:

```bash
bun run lint
bun run typecheck
bun test
cd website
npm run lint
npm run typecheck
npm test
npm run build
```

## Source Basis

This plan is based on:

- [[website/docs/research/aws-s3-github-actions-publishing-research]]
- GitHub OIDC for AWS docs:
  <https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws>
- GitHub environment deployment controls:
  <https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments>
- AWS IAM OIDC provider docs:
  <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html>
- AWS CloudFront OAC docs:
  <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
- AWS CLI `s3 sync` docs:
  <https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html>
