import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('renderer-facing content facades', () => {
  it('exports websitePages from generated page records', () => {
    const pagesSource = readFileSync(new URL('../src/content/pages.ts', import.meta.url), 'utf8');

    expect(pagesSource).toContain("from './generated/pages.generated'");
    expect(pagesSource).toContain('websitePagesGenerated');
    expect(pagesSource).not.toContain('const websitePages = [');
  });

  it('runs generation before test and typecheck because generated files are ignored', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts.test).toContain('npm run content:generate');
    expect(packageJson.scripts.typecheck).toContain('npm run content:generate');
  });
});
