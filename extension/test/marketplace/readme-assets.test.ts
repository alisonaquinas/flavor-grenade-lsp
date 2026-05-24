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
  localPath: string;
}

const mediaAssetBase =
  'https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/';

const requiredVisuals: RequiredMarketplaceVisual[] = [
  {
    id: 'ofmarkdown-mode',
    alt: /OFMarkdown language mode promotion/i,
    localPath: 'images/marketplace/ofmarkdown-mode.png',
  },
  {
    id: 'status-indexing',
    alt: /status bar indexing/i,
    localPath: 'images/marketplace/status-indexing.png',
  },
  {
    id: 'wiki-link-completion',
    alt: /wiki-link completion/i,
    localPath: 'images/marketplace/wiki-link-completion.png',
  },
  {
    id: 'heading-block-completion',
    alt: /heading and block-anchor completion/i,
    localPath: 'images/marketplace/heading-block-completion.png',
  },
  {
    id: 'reference-code-lens',
    alt: /reference code lens/i,
    localPath: 'images/marketplace/reference-code-lens.png',
  },
  {
    id: 'embed-diagnostics-hover',
    alt: /embed diagnostics and hover/i,
    localPath: 'images/marketplace/embed-diagnostics-hover.png',
  },
  {
    id: 'tag-completion-references',
    alt: /tag completion and references/i,
    localPath: 'images/marketplace/tag-completion-references.png',
  },
  {
    id: 'callout-completion',
    alt: /callout completion/i,
    localPath: 'images/marketplace/callout-completion.png',
  },
];

describe('Marketplace README assets', () => {
  it('references required Marketplace visuals with stable GitHub media image URLs', async () => {
    const readme = await readFile(readmePath, 'utf8');
    const images = parseMarkdownImages(readme);

    for (const visual of requiredVisuals) {
      const expectedUrl = `${mediaAssetBase}${visual.localPath}`;
      const image = images.find((candidate) => candidate.path === expectedUrl);

      assert.ok(image, `${visual.id} visual must be referenced from extension/README.md`);
      assert.match(image.alt, visual.alt, `${visual.id} visual must have descriptive alt text`);
      assert.match(
        image.path,
        /\.(png|jpe?g|gif)$/i,
        `${visual.id} visual must use a Marketplace-supported image format`,
      );
      assert.equal(
        existsSync(join(extensionRoot, visual.localPath)),
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
