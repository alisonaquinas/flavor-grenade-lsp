import { describe, expect, it } from 'vitest';

import { compileCommonloom } from '../src/content/pipeline/commonloom';

describe('Commonloom compiler scaffold', () => {
  it('exports a non-destructive compiler entry point', async () => {
    const result = await compileCommonloom({
      copyRoot: 'website/src/content/copy',
      mediaRoot: 'website/src/content/media',
      generatedRoot: 'website/src/content/generated',
    });

    expect(result.diagnostics).toEqual([
      {
        code: 'NO_MANIFESTS',
        severity: 'info',
        message: 'No page manifests configured.',
      },
    ]);
  });
});
