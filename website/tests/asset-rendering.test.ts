import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { homepageAssetPlacements } from '../src/home/homepage';

const websiteRoot = fileURLToPath(new URL('..', import.meta.url));

describe('website asset rendering contract', () => {
  it('serves reviewed image assets from the website public asset directory', () => {
    const reviewedPlacements = ['header', 'hero', 'footer'];

    for (const placement of reviewedPlacements) {
      const asset = homepageAssetPlacements.find((candidate) => candidate.placement === placement);

      expect(asset, `${placement} asset placement is declared`).toBeDefined();
      expect(asset?.source).toMatch(/^\/assets\/.+\.(png|jpg|jpeg|webp|svg)$/);
      expect(existsSync(join(websiteRoot, 'public', asset?.source ?? ''))).toBe(true);
    }
  });
});
