import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

describe('GitHub Pages deployment workflow', () => {
  it('deploys only from release tags after verifying main ancestry', async () => {
    const workflow = await readFile(
      join(repoRoot, '.github', 'workflows', 'website-pages.yml'),
      'utf8',
    );

    expect(workflow).toContain("tags:");
    expect(workflow).toContain("'v*.*.*'");
    expect(workflow).toContain('Validate website release tag');
    expect(workflow).toContain('^v[0-9]+\\.[0-9]+\\.[0-9]+');
    expect(workflow).toContain('Invalid website release tag');
    expect(workflow).toContain('git merge-base --is-ancestor "$GITHUB_SHA" origin/main');
    expect(workflow).toContain('actions/configure-pages');
    expect(workflow).toContain('actions/upload-pages-artifact');
    expect(workflow).toContain('actions/deploy-pages');
    expect(workflow).toContain('pages: write');
    expect(workflow).toContain('id-token: write');
    expect(workflow).toContain('environment:');
    expect(workflow).toContain('github-pages');
    expect(workflow).toContain('concurrency:');
  });
});
