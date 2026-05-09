import { describe, expect, it } from 'vitest';

import {
  featureHighlights,
  homepageAssetPlacements,
  homepageHero,
  homepageProof,
  validateHomepageContent,
} from '../src/home/homepage';

describe('homepage content model', () => {
  it('communicates product identity and primary actions in the first viewport', () => {
    expect(homepageHero.h1).toBe('Flavor Grenade LSP');
    expect(homepageHero.category).toContain('Obsidian Flavored Markdown');
    expect(homepageHero.actions.map((action) => action.label)).toEqual([
      'Quickstart',
      'Visual Studio Marketplace',
      'GitHub',
    ]);
    expect(homepageHero.actions.map((action) => action.icon)).toEqual([
      'book-open',
      'store',
      'github',
    ]);
    expect(validateHomepageContent()).toEqual([]);
  });

  it('uses real product proof and existing asset placements', () => {
    expect(homepageProof.title).toContain('Vault');
    expect(homepageProof.lines).toContain('[[Daily Note#Open questions]]');
    expect(featureHighlights).toHaveLength(4);
    expect(homepageAssetPlacements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ placement: 'header', alt: expect.stringContaining('Flavor Grenade') }),
        expect.objectContaining({ placement: 'hero', alt: expect.stringContaining('VS Code') }),
        expect.objectContaining({ placement: 'footer', alt: expect.stringContaining('Flavor Grenade') }),
      ]),
    );
    expect(homepageAssetPlacements.every((asset) => asset.source.startsWith('/assets/'))).toBe(true);
  });

  it('gives every feature proof card selectable practical detail', () => {
    for (const feature of featureHighlights) {
      expect(feature.detail.title).toContain('How');
      expect(feature.detail.summary.length).toBeGreaterThan(20);
      expect(feature.detail.markdownExample).toHaveLength(2);
      expect(feature.detail.outcome.length).toBeGreaterThan(20);
    }
  });
});
