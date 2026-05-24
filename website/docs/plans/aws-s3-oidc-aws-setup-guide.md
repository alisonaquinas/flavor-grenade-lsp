# AWS S3 OIDC Setup Guide

Observed on 2026-05-24.

## Purpose

This guide lists the AWS and GitHub configuration needed before the repository
workflow can publish the website to S3 through GitHub Actions OIDC.

Use placeholders until the real AWS account values are known:

| Placeholder | Meaning |
|---|---|
| `<account-id>` | AWS account id |
| `<region>` | AWS region for the S3 bucket |
| `<bucket-name>` | Website bucket name |
| `<distribution-id>` | CloudFront distribution id |
| `<role-name>` | IAM role name, for example `flavor-grenade-website-deploy` |
| `<public-url>` | Final website URL |

Current production values:

| Field | Value |
|---|---|
| S3 bucket | `flavor-grenade-site` |
| S3 bucket ARN | `arn:aws:s3:::flavor-grenade-site` |
| CloudFront distribution id | `E2TPBPS2W81ASF` |
| Public URL | `https://flavor-grenade.dev` |

## Recommended Target

Use:

- private S3 bucket
- CloudFront distribution
- CloudFront Origin Access Control (OAC)
- GitHub Actions OIDC IAM role
- GitHub environment named `website-production`

Avoid public S3 bucket hosting unless there is a deliberate reason to skip
CloudFront and OAC.

## Step 1: Choose Names

Record:

```text
AWS account id:
AWS region:
S3 bucket name:
CloudFront distribution id:
IAM role name:
Public website URL:
```

Recommended defaults:

```text
IAM role name: flavor-grenade-website-deploy
GitHub environment: website-production
Vite base path: /
```

## Step 2: Create The S3 Bucket

In AWS S3:

1. Create bucket `<bucket-name>` in `<region>`.
2. Keep "Block all public access" enabled.
3. Keep Object Ownership as "Bucket owner enforced".
4. Enable bucket versioning if rollback or audit history is desired.
5. Use default server-side encryption.
6. Do not enable public static website hosting for the recommended CloudFront
   OAC topology.

CLI shape:

```bash
aws s3api create-bucket \
  --bucket "<bucket-name>" \
  --region "<region>" \
  --create-bucket-configuration LocationConstraint="<region>"

aws s3api put-public-access-block \
  --bucket "<bucket-name>" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

aws s3api put-bucket-ownership-controls \
  --bucket "<bucket-name>" \
  --ownership-controls \
  "Rules=[{ObjectOwnership=BucketOwnerEnforced}]"
```

For `us-east-1`, AWS CLI bucket creation syntax differs because
`LocationConstraint` is omitted.

## Step 3: Create CloudFront Distribution

In AWS CloudFront:

1. Create a distribution.
2. Set origin type to S3 bucket origin, not S3 website endpoint.
3. Select the bucket `<bucket-name>`.
4. Create or attach an Origin Access Control.
5. Use OAC signing behavior "Sign requests".
6. Set viewer protocol policy to redirect HTTP to HTTPS or HTTPS only.
7. Set default root object to `index.html`.
8. Attach the production domain and certificate when ready.
9. Save the distribution id as `<distribution-id>`.

Do not use the S3 website endpoint if the goal is private bucket plus OAC.
AWS documents that OAC is for regular S3 bucket origins, not website endpoints.

## Step 4: Grant CloudFront Read Access To S3

Add this bucket policy after the CloudFront distribution exists:

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

CLI shape:

```bash
aws s3api put-bucket-policy \
  --bucket "<bucket-name>" \
  --policy file://cloudfront-bucket-policy.json
```

## Step 5: Create GitHub OIDC Provider In IAM

In AWS IAM:

1. Open Identity providers.
2. Add provider.
3. Choose OpenID Connect.
4. Provider URL:

```text
https://token.actions.githubusercontent.com
```

5. Audience:

```text
sts.amazonaws.com
```

CLI shape:

```bash
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com"
```

If the provider already exists, reuse it.

## Step 6: Create The IAM Deploy Role

Create IAM role `<role-name>` with this trust policy:

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

CLI shape:

```bash
aws iam create-role \
  --role-name "<role-name>" \
  --assume-role-policy-document file://github-oidc-trust-policy.json
```

This trust policy depends on the workflow using:

```yaml
environment:
  name: website-production
```

## Step 7: Attach Least-Privilege Role Permissions

Attach a policy like this to `<role-name>`:

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
    },
    {
      "Sid": "InvalidateWebsiteDistribution",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
    }
  ]
}
```

If CloudFront is not used, omit the `InvalidateWebsiteDistribution` statement.

CLI shape:

```bash
aws iam put-role-policy \
  --role-name "<role-name>" \
  --policy-name "PublishFlavorGrenadeWebsite" \
  --policy-document file://website-deploy-permissions.json
```

## Step 8: Configure GitHub Environment

In GitHub repository settings:

1. Open Environments.
2. Create environment:

```text
website-production
```

3. Add deployment branch or tag rule:

```text
Tag: site-v*.*.*
```

4. Add required reviewers if desired.
5. Disable administrator bypass if desired.
6. Add environment variables:

```text
AWS_REGION=<region>
AWS_WEBSITE_BUCKET=<bucket-name>
AWS_WEBSITE_DEPLOY_ROLE_ARN=arn:aws:iam::<account-id>:role/<role-name>
AWS_CLOUDFRONT_DISTRIBUTION_ID=<distribution-id>
WEBSITE_PUBLIC_URL=<public-url>
WEBSITE_BASE_URL_PATH=/
```

Use environment variables for non-secret deployment configuration. Do not add
`AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` for the normal OIDC deploy path.

## Step 9: Confirm The Role Cannot Be Assumed Broadly

Before merging the workflow, verify:

- trust policy uses exact `aud`
- trust policy uses exact environment-based `sub`
- role has no `AdministratorAccess`
- role has no account-wide `s3:*`
- role has no wildcard CloudFront invalidation across all distributions
- S3 bucket public access remains blocked
- bucket policy grants read only to CloudFront distribution ARN

## Step 10: Test With A Website Test Tag

After workflow implementation:

1. Push a test tag:

```bash
git tag site-v0.0.0-test.1
git push origin site-v0.0.0-test.1
```

2. Confirm workflow builds and uploads artifacts.
3. Confirm it does not enter `website-production`.
4. Confirm it does not assume the AWS role.
5. Delete the test tag if it is only temporary:

```bash
git push origin :refs/tags/site-v0.0.0-test.1
git tag -d site-v0.0.0-test.1
```

## Step 11: Test Production Deploy

Only after AWS and GitHub controls are correct:

1. Create a production website tag on a commit contained in `origin/main`.
2. Push the tag:

```bash
git tag site-vX.Y.Z
git push origin site-vX.Y.Z
```

3. Confirm build job passes.
4. Confirm deploy job enters `website-production`.
5. Approve deployment if required reviewers are configured.
6. Confirm `aws sts get-caller-identity` reports the deploy role.
7. Confirm S3 objects are updated.
8. Confirm CloudFront invalidation completes.
9. Load `<public-url>`.

## Rollback Options

Preferred rollback:

1. Re-tag or release a known-good website build as a new `site-vX.Y.Z` version.
2. Let the normal workflow publish it.

Emergency rollback if S3 versioning is enabled:

1. Restore prior object versions in S3.
2. Create CloudFront invalidation.
3. Follow with a normal tagged website release when possible.

## Source Basis

This guide is based on:

- [[website/docs/research/aws-s3-github-actions-publishing-research]]
- GitHub OIDC for AWS docs:
  <https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws>
- GitHub environment deployment controls:
  <https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments>
- AWS IAM OIDC provider docs:
  <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html>
- AWS CloudFront OAC docs:
  <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
