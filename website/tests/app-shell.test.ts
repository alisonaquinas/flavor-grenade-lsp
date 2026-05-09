import { describe, expect, it } from 'vitest';

import { getAppShellSummary } from '../src/app-shell.ts';

describe('website app shell scaffold', () => {
  it('describes the initial static website shell', () => {
    expect(getAppShellSummary()).toEqual({
      productName: 'Flavor Grenade LSP',
      stack: ['Vite', 'Svelte', 'TypeScript', 'SCSS'],
      sourceRoot: 'website/src',
      testRoot: 'website/tests',
    });
  });
});
