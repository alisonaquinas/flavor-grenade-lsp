import { existsSync, readFileSync } from 'node:fs';
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
      const assetPath = join(websiteRoot, 'public', asset?.source ?? '');
      expect(existsSync(assetPath)).toBe(true);
      const assetBytes = readFileSync(assetPath);

      expect(
        assetBytes.toString('utf8', 0, Math.min(assetBytes.length, 128)),
        `${placement} asset must be real image bytes, not a Git LFS pointer`,
      ).not.toContain('git-lfs.github.com/spec/v1');
      expect(
        isSupportedImage(assetBytes),
        `${placement} asset has a supported image signature`,
      ).toBe(true);
    }
  });
});

function isSupportedImage(bytes: Buffer): boolean {
  return isPng(bytes) || isJpeg(bytes) || isWebp(bytes) || isSvg(bytes);
}

function isPng(bytes: Buffer): boolean {
  return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

function isJpeg(bytes: Buffer): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isWebp(bytes: Buffer): boolean {
  return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
}

function isSvg(bytes: Buffer): boolean {
  const prefix = bytes.toString('utf8', 0, Math.min(bytes.length, 256)).trimStart();

  return prefix.startsWith('<svg') || prefix.startsWith('<?xml');
}
