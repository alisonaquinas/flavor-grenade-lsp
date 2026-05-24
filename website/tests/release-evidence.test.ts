import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

describe('website release evidence workflow', () => {
  it('preserves release evidence and distinguishes production from test tags', async () => {
    const workflow = await readFile(
      join(repoRoot, '.github', 'workflows', 'website-s3.yml'),
      'utf8',
    );
    const changelog = await readFile(join(repoRoot, 'CHANGELOG.md'), 'utf8');

    expect(workflow).toContain("'site-v*.*.*-test*'");
    expect(workflow).not.toContain("'v*.*.*-test*'");
    expect(workflow).toContain("contains(github.ref_name, '-test')");
    expect(workflow).toContain('Release mode');
    expect(workflow).toContain('production');
    expect(workflow).toContain('test');
    expect(workflow).toContain('website-release-evidence');
    expect(workflow).toContain('website/release-evidence/');
    expect(workflow).toContain('homepage');
    expect(workflow).toContain('quickstart');
    expect(workflow).toContain('sitemap.xml');
    expect(workflow).toContain('robots.txt');
    expect(workflow).toContain('marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp');
    expect(changelog).toContain('Website release workflow');
  });
});
