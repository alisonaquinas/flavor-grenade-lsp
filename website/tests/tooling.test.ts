import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

function readPackageJson(): {
  scripts: Record<string, string>;
} {
  return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    scripts: Record<string, string>;
  };
}

describe('website quality gate tooling', () => {
  it('exposes the required local scripts', () => {
    const { scripts } = readPackageJson();

    expect(Object.keys(scripts).sort()).toEqual([
      'build',
      'content:check',
      'content:generate',
      'dev',
      'lint',
      'preview',
      'test',
      'typecheck',
    ]);
    expect(scripts.lint).toContain('--max-warnings 0');
  });

  it('has an ESLint flat config for website source and tests', () => {
    expect(existsSync(join(websiteRoot, 'eslint.config.js'))).toBe(true);
  });
});
