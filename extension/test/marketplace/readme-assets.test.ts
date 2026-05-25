import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const testDir = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(testDir, '..', '..');
const readmePath = join(extensionRoot, 'README.md');
const packageJsonPath = join(extensionRoot, 'package.json');

interface RequiredMarketplaceVisual {
  alt: RegExp;
  id: string;
  localPath: string;
}

const mediaAssetBase =
  'https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/';

const requiredVisuals: RequiredMarketplaceVisual[] = [
  {
    id: 'markdown-flavor-selector',
    alt: /Markdown flavor selector/i,
    localPath: 'images/marketplace/markdown-flavor-selector.png',
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

  it('does not embed stale OFMarkdown-mode Marketplace visuals or old website URLs', async () => {
    const readme = await readFile(readmePath, 'utf8');
    const links = parseMarkdownLinks(readme);

    assert.doesNotMatch(readme, /ofmarkdown-mode\.png/i);
    assert.equal(readme.includes('www.alisonaquinas.com/flavor-grenade-lsp'), false);
    assert.equal(links.some((link) => link.href === 'https://flavor-grenade.dev/'), true);
  });

  it('points extension homepage metadata at the public documentation site', async () => {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
      homepage?: unknown;
    };

    assert.equal(packageJson.homepage, 'https://flavor-grenade.dev/');
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

function parseMarkdownLinks(markdown: string): Array<{ href: string; text: string }> {
  const links: Array<{ href: string; text: string }> = [];
  const linkPattern = /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  for (const match of markdown.matchAll(linkPattern)) {
    links.push({ href: match[2], text: match[1] });
  }

  return links;
}
