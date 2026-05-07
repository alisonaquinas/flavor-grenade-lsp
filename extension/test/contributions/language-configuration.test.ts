import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readJsonFile, readManifest } from './manifest.ts';

interface LanguageConfiguration {
  autoClosingPairs?: Array<{ close?: string; open?: string }>;
  comments?: { blockComment?: string[] };
  surroundingPairs?: string[][];
  wordPattern?: string;
}

describe('OFMarkdown language configuration contribution', () => {
  it('keeps language configuration scoped to ofmarkdown', async () => {
    const manifest = await readManifest();
    const languages = manifest.contributes?.languages ?? [];

    assert.equal(languages.find((language) => language.id === 'ofmarkdown')?.configuration, './language-configuration.json');
    assert.equal(languages.some((language) => language.id === 'markdown'), false);
  });

  it('tunes editor pairs and words for OFMarkdown constructs', async () => {
    const config = await readJsonFile<LanguageConfiguration>('language-configuration.json');

    assert.deepEqual(config.comments?.blockComment, ['<!--', '-->']);
    assert.ok(hasPair(config.autoClosingPairs, '[[', ']]'), 'wiki-links should auto-close');
    assert.ok(hasPair(config.autoClosingPairs, '![[' , ']]'), 'embeds should auto-close');
    assert.ok(hasPair(config.autoClosingPairs, '%%', '%%'), 'Obsidian comments should auto-close');
    assert.ok(hasTuple(config.surroundingPairs, '[[', ']]'), 'wiki-links should surround selections');

    const wordPattern = new RegExp(config.wordPattern ?? '');
    assert.equal(wordPattern.test('#project/active'), true);
    assert.equal(wordPattern.test('^block-id'), true);
  });
});

function hasPair(pairs: Array<{ close?: string; open?: string }> | undefined, open: string, close: string): boolean {
  return pairs?.some((pair) => pair.open === open && pair.close === close) ?? false;
}

function hasTuple(pairs: string[][] | undefined, open: string, close: string): boolean {
  return pairs?.some(([candidateOpen, candidateClose]) => candidateOpen === open && candidateClose === close) ?? false;
}
