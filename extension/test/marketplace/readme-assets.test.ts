import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const testDir = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(testDir, '..', '..');
const readmePath = join(extensionRoot, 'README.md');

interface RequiredMarketplaceVisual {
  alt: RegExp;
  id: string;
  path: string;
}

const requiredVisuals: RequiredMarketplaceVisual[] = [
  {
    id: 'ofmarkdown-mode',
    alt: /OFMarkdown language mode promotion/i,
    path: 'images/marketplace/ofmarkdown-mode.png',
  },
  {
    id: 'status-indexing',
    alt: /status bar indexing/i,
    path: 'images/marketplace/status-indexing.png',
  },
];

describe('Marketplace README assets', () => {
  it('references required OFMarkdown mode and status visuals with supported local image formats', async () => {
    const readme = await readFile(readmePath, 'utf8');
    const images = parseMarkdownImages(readme);

    for (const visual of requiredVisuals) {
      const image = images.find((candidate) => candidate.path === visual.path);

      assert.ok(image, `${visual.id} visual must be referenced from extension/README.md`);
      assert.match(image.alt, visual.alt, `${visual.id} visual must have descriptive alt text`);
      assert.match(
        image.path,
        /\.(png|jpe?g|gif)$/i,
        `${visual.id} visual must use a Marketplace-supported image format`,
      );
      assert.equal(
        existsSync(join(extensionRoot, image.path)),
        true,
        `${visual.id} visual must resolve under extension/`,
      );
    }
  });
});

function parseMarkdownImages(markdown: string): Array<{ alt: string; path: string }> {
  const images: Array<{ alt: string; path: string }> = [];
  const imagePattern = /!\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  for (const match of markdown.matchAll(imagePattern)) {
    images.push({ alt: match[1], path: match[2] });
  }

  return images;
}
