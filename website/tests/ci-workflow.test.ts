import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

describe('website CI workflow gates', () => {
  it('runs website install, lint, typecheck, tests, build, and artifact upload', async () => {
    const workflow = await readFile(join(repoRoot, '.github', 'workflows', 'ci.yml'), 'utf8');

    expect(workflow).toContain('website-checks:');
    expect(workflow).toContain('working-directory: website');
    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npm run lint');
    expect(workflow).toContain('npm run typecheck');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('name: website-dist');
    expect(workflow).toContain('path: website/dist/');
  });
});
