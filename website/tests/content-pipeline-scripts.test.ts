import { readFileSync } from 'node:fs';

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
});
