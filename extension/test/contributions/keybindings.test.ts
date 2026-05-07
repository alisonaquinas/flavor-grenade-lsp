import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readManifest } from './manifest.ts';

const expectedCommands = new Set([
  'flavorGrenade.rebuildIndex',
  'flavorGrenade.showOutput',
  'flavorGrenade.showStatusActions',
]);

describe('OFMarkdown keybinding contributions', () => {
  it('adds guarded keybindings only for payload-free Flavor Grenade commands', async () => {
    const manifest = await readManifest();
    const keybindings = manifest.contributes?.keybindings ?? [];

    assert.equal(keybindings.length, expectedCommands.size);

    for (const keybinding of keybindings) {
      assert.ok(keybinding.command, 'keybinding command is required');
      assert.ok(expectedCommands.has(keybinding.command), `${keybinding.command} must be a payload-free command`);
      assert.match(keybinding.when ?? '', /\beditorTextFocus\b/);
      assert.match(keybinding.when ?? '', /\beditorLangId\s*==\s*ofmarkdown\b/);
      assert.ok(keybinding.key, `${keybinding.command} must define a default key`);
    }
  });
});
