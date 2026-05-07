import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readManifest } from './manifest.ts';

describe('Generic Markdown contribution isolation', () => {
  it('does not add snippets, keybindings, or language configuration to generic Markdown', async () => {
    const manifest = await readManifest();
    const snippets = manifest.contributes?.snippets ?? [];
    const languages = manifest.contributes?.languages ?? [];
    const keybindings = manifest.contributes?.keybindings ?? [];

    assert.equal(snippets.some((snippet) => snippet.language === 'markdown'), false);
    assert.equal(languages.some((language) => language.id === 'markdown'), false);

    for (const keybinding of keybindings) {
      assert.match(keybinding.when ?? '', /\beditorLangId\s*==\s*ofmarkdown\b/);
      assert.doesNotMatch(keybinding.when ?? '', /\beditorLangId\s*==\s*markdown\b/);
    }
  });
});
