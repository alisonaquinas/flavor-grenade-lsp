import { describe, expect, it } from 'vitest';

import { validateWebsiteLayout } from '../src/quality/layout-guard.ts';

describe('website source and test layout guard', () => {
  it('keeps website implementation source and tests in their required roots', async () => {
    await expect(validateWebsiteLayout()).resolves.toEqual([]);
  });
});
