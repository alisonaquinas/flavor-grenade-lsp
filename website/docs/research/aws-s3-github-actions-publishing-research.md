# AWS S3 GitHub Actions Publishing Research

Observed on 2026-05-24.

## Research Question

What is the secure and maintainable way to publish the static website build
from GitHub Actions to AWS S3, preferably without long-lived AWS credentials?

## Sources

- GitHub Docs: OpenID Connect in AWS,
  <https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws>
- GitHub Docs: OpenID Connect reference,
  <https://docs.github.com/en/actions/reference/security/oidc>
- GitHub Docs: Managing environments for deployment,
  <https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments>
- GitHub Docs: Secure use reference,
  <https://docs.github.com/en/actions/reference/security/secure-use>
- AWS IAM Docs: Create an OpenID Connect identity provider in IAM,
  <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html>
- AWS CloudFront Docs: Restrict access to an Amazon S3 origin,
  <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
- AWS S3 Docs: Website endpoints,
  <https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html>
- AWS CLI Docs: `aws s3 sync`,
  <https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html>
- AWS CLI Docs: `aws cloudfront create-invalidation`,
  <https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html>
- `aws-actions/configure-aws-credentials`,
  <https://github.com/aws-actions/configure-aws-credentials>

Context7 was also queried for current GitHub Actions OIDC guidance. It confirmed
that GitHub documents OIDC for AWS with `id-token: write` and
`aws-actions/configure-aws-credentials`.

## Recommendation

Use GitHub Actions OIDC to assume an AWS IAM role, then publish `website/dist`
to S3 with the AWS CLI. Do not store AWS access keys in GitHub secrets.

Preferred hosting topology:

1. Private S3 bucket.
2. CloudFront distribution in front of the bucket.
3. CloudFront Origin Access Control (OAC) with signed origin requests.
4. GitHub Actions OIDC role with least-privilege write access to the bucket and,
   if CloudFront is used, invalidation access for the one distribution.

This is more secure than public S3 website hosting because the bucket can stay
private and users access the site through HTTPS via CloudFront. AWS documents
that OAC works with a regular S3 bucket origin, not an S3 website endpoint. If
the project uses the S3 website endpoint directly, the bucket must be publicly
readable and the website endpoint is HTTP-style S3 website hosting rather than
the private-bucket OAC model.

## Why OIDC

GitHub OIDC lets a workflow request a short-lived identity token and exchange it
for AWS credentials through `sts:AssumeRoleWithWebIdentity`. GitHub's AWS OIDC
guide says this avoids storing long-lived AWS credentials as GitHub secrets.

Required workflow pieces:

- `permissions: id-token: write` on the deploy job.
- `permissions: contents: read` for checkout.
- `aws-actions/configure-aws-credentials` with `role-to-assume` and
  `aws-region`.
- An IAM OIDC provider for `https://token.actions.githubusercontent.com`.
- An IAM role trust policy that checks both:
  - `token.actions.githubusercontent.com:aud = sts.amazonaws.com`
  - `token.actions.githubusercontent.com:sub` scoped to this repository and
    deployment path.

Use a protected GitHub environment named `website-production`. If an environment
is used in the job and in the AWS trust policy, GitHub documents the OIDC
subject as:

```text
repo:alisonaquinas/flavor-grenade-lsp:environment:website-production
```

Then restrict that GitHub environment so only `site-v*.*.*` tags can deploy.
Keep the workflow's main-branch tag guard as a second control.

## IAM Trust Policy Shape

Use exact `StringEquals` where possible. Avoid broad `repo:OWNER/REPO:*`
trust unless there is a specific reason.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:alisonaquinas/flavor-grenade-lsp:environment:website-production"
        }
      }
    }
  ]
}
```

Alternative without GitHub environments:

```json
{
  "StringLike": {
    "token.actions.githubusercontent.com:sub": "repo:alisonaquinas/flavor-grenade-lsp:ref:refs/tags/site-v*"
  },
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
  }
}
```

The environment-based form is preferred because it composes with GitHub
environment protection rules, reviewers, deployment branch or tag restrictions,
environment variables, and secrets.

## IAM Permission Policy Shape

The deploy role should not have `s3:*` or account-wide CloudFront access.

Minimum S3 permissions for sync-style publishing:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListWebsiteBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::<bucket-name>"
    },
    {
      "Sid": "WriteWebsiteObjects",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::<bucket-name>/*"
    }
  ]
}
```

If CloudFront is used:

```json
{
  "Sid": "InvalidateWebsiteDistribution",
  "Effect": "Allow",
  "Action": "cloudfront:CreateInvalidation",
  "Resource": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
}
```

If the bucket uses SSE-KMS, add only the required KMS key permissions for the
specific key. Do not add broad KMS access.

## Bucket And CloudFront Policy

For the preferred private bucket model:

- Keep S3 Block Public Access enabled.
- Use S3 Object Ownership `Bucket owner enforced`.
- Do not upload with `--acl public-read`.
- Grant read access to the CloudFront service principal only through an S3
  bucket policy condition on the exact CloudFront distribution ARN.
- Configure CloudFront OAC with "sign requests" behavior.
- Serve HTTPS at CloudFront.

The bucket policy shape follows AWS CloudFront OAC docs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket-name>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
        }
      }
    }
  ]
}
```

## Workflow Shape

Recommended split:

- `build` job: checkout, install, lint, typecheck, test, build, upload
  `website/dist` artifact. No AWS credentials.
- `deploy` job: production-only, protected environment, downloads artifact,
  assumes AWS role through OIDC, syncs to S3, invalidates CloudFront if enabled.

Sketch:

```yaml
name: Website S3

on:
  push:
    tags:
      - 'site-v*.*.*'
      - 'site-v*.*.*-test*'

permissions:
  contents: read

concurrency:
  group: website-production
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<full-sha>
        with:
          persist-credentials: false
          fetch-depth: 0
      - run: git merge-base --is-ancestor "$GITHUB_SHA" origin/main
        if: ${{ !contains(github.ref_name, '-test') }}
      - uses: actions/setup-node@<full-sha>
        with:
          node-version: '24'
          package-manager-cache: false
      - run: npm ci
        working-directory: website
      - run: npm run lint
        working-directory: website
      - run: npm run typecheck
        working-directory: website
      - run: npm test
        working-directory: website
      - run: npm run build
        working-directory: website
        env:
          WEBSITE_BASE: ${{ vars.WEBSITE_BASE_URL_PATH }}
      - uses: actions/upload-artifact@<full-sha>
        with:
          name: website-dist
          path: website/dist/
          if-no-files-found: error

  deploy:
    needs: build
    if: ${{ !contains(github.ref_name, '-test') }}
    runs-on: ubuntu-latest
    environment:
      name: website-production
      url: ${{ vars.WEBSITE_PUBLIC_URL }}
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/download-artifact@<full-sha>
        with:
          name: website-dist
          path: website-dist
      - uses: aws-actions/configure-aws-credentials@<full-sha>
        with:
          role-to-assume: ${{ vars.AWS_WEBSITE_DEPLOY_ROLE_ARN }}
          role-session-name: website-${{ github.run_id }}
          aws-region: ${{ vars.AWS_REGION }}
          mask-aws-account-id: true
      - run: aws sts get-caller-identity
      - name: Sync immutable assets
        run: |
          aws s3 sync website-dist/assets "s3://${AWS_BUCKET}/assets" \
            --delete \
            --only-show-errors \
            --cache-control "public,max-age=31536000,immutable"
        env:
          AWS_BUCKET: ${{ vars.AWS_WEBSITE_BUCKET }}
      - name: Sync HTML and route files
        run: |
          aws s3 sync website-dist "s3://${AWS_BUCKET}" \
            --delete \
            --only-show-errors \
            --exclude "assets/*" \
            --cache-control "public,max-age=300,must-revalidate"
        env:
          AWS_BUCKET: ${{ vars.AWS_WEBSITE_BUCKET }}
      - name: Invalidate CloudFront
        if: ${{ vars.AWS_CLOUDFRONT_DISTRIBUTION_ID != '' }}
        run: |
          aws cloudfront create-invalidation \
            --distribution-id "$AWS_CLOUDFRONT_DISTRIBUTION_ID" \
            --paths "/*"
        env:
          AWS_CLOUDFRONT_DISTRIBUTION_ID: ${{ vars.AWS_CLOUDFRONT_DISTRIBUTION_ID }}
```

## Publishing Details

Use `aws s3 sync`, not a bespoke upload loop.

Reasons:

- It recursively copies changed files.
- `--delete` removes objects no longer present in the new build.
- `--cache-control` sets deploy-time object metadata.
- The AWS CLI guesses MIME types unless `--no-guess-mime-type` is set, so do
  not set `--no-guess-mime-type`.

Use two sync passes so hashed assets and HTML get different cache behavior:

- `assets/*`: `public,max-age=31536000,immutable`
- HTML, `sitemap.xml`, `robots.txt`, and other route files:
  `public,max-age=300,must-revalidate`

If the generated asset directory changes from `assets/`, update the excludes.

## Action Security

GitHub's security hardening docs say pinning actions to a full-length commit SHA
is the strongest immutable reference. Keep that repository convention for:

- `actions/checkout`
- `actions/setup-node`
- `actions/upload-artifact`
- `actions/download-artifact`
- `aws-actions/configure-aws-credentials`

Use Dependabot or a manual review process to update pinned SHAs.

Avoid:

- `pull_request_target` for deployment.
- Deploying on branch pushes.
- Broad OIDC trust such as `repo:alisonaquinas/flavor-grenade-lsp:*`.
- Long-lived `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets.
- Public-read ACL uploads.
- Bucket-wide or account-wide IAM permissions.

## Maintainability Notes

- Manage AWS infrastructure as code if possible: OIDC provider, IAM role,
  policy, bucket, bucket policy, CloudFront distribution, OAC, and DNS.
- Keep bucket name, role ARN, region, distribution id, and public URL as GitHub
  environment variables, not hardcoded workflow constants.
- Keep actual AWS secrets out of GitHub if OIDC is used. There should be no AWS
  access key secrets for normal deployment.
- Keep test tags as build-and-evidence only. They should never assume the
  production AWS role.
- Store release evidence: workflow logs, build artifact, S3 sync summary, STS
  caller identity account/ARN, and CloudFront invalidation id.

## Open Decisions

- Whether production uses direct public S3 website hosting or the recommended
  private S3 plus CloudFront OAC model.
- Whether preview deployments need a separate bucket/prefix and separate OIDC
  role.
- Whether CloudFront invalidation should always use `/*` or a generated list of
  non-hashed route and metadata files.
