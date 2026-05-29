import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

describe('AWS S3 website deployment workflow', () => {
  it('deploys only from website release tags after verifying main ancestry', async () => {
    const workflow = await readFile(
      join(repoRoot, '.github', 'workflows', 'website-s3.yml'),
      'utf8',
    );

    expect(workflow).toContain("tags:");
    expect(workflow).not.toContain("'v*.*.*'");
    expect(workflow).not.toContain("'v*.*.*-test*'");
    expect(workflow).toContain("'site-v*.*.*'");
    expect(workflow).toContain("'site-v*.*.*-test*'");
    expect(workflow).toContain('Validate website release tag');
    expect(workflow).toContain('^site-v[0-9]+\\.[0-9]+\\.[0-9]+');
    expect(workflow).toContain('Invalid website release tag');
    expect(workflow).toContain('git merge-base --is-ancestor "$GITHUB_SHA" origin/main');
    expect(workflow).not.toContain('actions/configure-pages');
    expect(workflow).not.toContain('actions/upload-pages-artifact');
    expect(workflow).not.toContain('actions/deploy-pages');
    expect(workflow).not.toContain('pages: write');
    expect(workflow).toContain('id-token: write');
    expect(workflow).toContain('aws-actions/configure-aws-credentials');
    expect(workflow).toContain('role-to-assume: ${{ vars.AWS_WEBSITE_DEPLOY_ROLE_ARN }}');
    expect(workflow).toContain('aws s3 sync website-dist');
    expect(workflow).toContain('Publish clean URL route objects');
    expect(workflow).toContain('website-dist/sitemap.xml');
    expect(workflow).toContain('process.stdout.write(`${key}\\t${key}/index.html\\n`)');
    expect(workflow).toContain('process.stdout.write(`${key}/\\t${key}/index.html\\n`)');
    expect(workflow).toContain('Missing prerendered route HTML');
    expect(workflow).toContain('aws s3api put-object');
    expect(workflow).toContain('--key "$route_key"');
    expect(workflow).toContain('--body "website-dist/${route_index}"');
    expect(workflow).toContain('--content-type "text/html"');
    expect(workflow).toContain('--cache-control "public,max-age=300,must-revalidate"');
    expect(workflow).toContain('aws cloudfront create-invalidation');
    expect(workflow).not.toContain('AWS_ACCESS_KEY_ID');
    expect(workflow).not.toContain('AWS_SECRET_ACCESS_KEY');
    expect(workflow).toContain('environment:');
    expect(workflow).toContain('website-production');
    expect(workflow).toContain('concurrency:');
  });
});
