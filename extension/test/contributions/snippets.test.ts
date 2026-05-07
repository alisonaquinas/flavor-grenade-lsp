import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { extensionRoot, readJsonFile, readManifest } from './manifest.ts';

interface SnippetDefinition {
  body?: string | string[];
  description?: string;
  prefix?: string | string[];
}

const requiredSnippetPrefixes = [
  'ofm-callout',
  'ofm-embed',
  'ofm-wikilink',
  'ofm-aliases',
  'ofm-tags',
  'ofm-block-anchor',
];

describe('OFMarkdown snippets contribution', () => {
  it('contributes snippets only to the OFMarkdown language id', async () => {
    const manifest = await readManifest();
    const snippets = manifest.contributes?.snippets ?? [];

    assert.deepEqual(snippets, [
      {
        language: 'ofmarkdown',
        path: './snippets/ofmarkdown.json',
      },
    ]);
    assert.equal(existsSync(join(extensionRoot, 'snippets', 'ofmarkdown.json')), true);
  });

  it('defines OFMarkdown snippets for core Obsidian constructs', async () => {
    const snippets = await readJsonFile<Record<string, SnippetDefinition>>('snippets/ofmarkdown.json');
    const prefixes = Object.values(snippets).flatMap((snippet) =>
      Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix],
    );

    for (const requiredPrefix of requiredSnippetPrefixes) {
      assert.ok(prefixes.includes(requiredPrefix), `missing snippet prefix ${requiredPrefix}`);
    }
  });
});
