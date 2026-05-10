import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

function readPackageJson(): {
  scripts: Record<string, string>;
} {
  return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    scripts: Record<string, string>;
  };
}

describe('content pipeline scripts', () => {
  it('exposes generation and check commands', () => {
    const { scripts } = readPackageJson();

    expect(scripts['content:generate']).toBe('tsx scripts/content/generate.ts');
    expect(scripts['content:check']).toBe('tsx scripts/content/check.ts');
  });

  it('runs content checks through normal build, test, and typecheck gates', () => {
    const { scripts } = readPackageJson();

    expect(scripts.build).toContain('npm run content:generate');
    expect(scripts.test).toContain('npm run content:check');
    expect(scripts.typecheck).toContain('npm run content:check');
  });

  it('ignores generated content output and exercises content scripts', () => {
    const gitignore = readFileSync(new URL('../../.gitignore', import.meta.url), 'utf8');
    const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

    expect(gitignore).toContain('website/src/content/generated/');
    expect(() =>
      execFileSync('npm', ['run', 'content:check'], {
        cwd: websiteRoot,
        shell: true,
        stdio: 'pipe',
      }),
    ).not.toThrow();
  });
});
