import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createStatusActionItems } from './status-actions.js';

describe('createStatusActionItems', () => {
  it('creates quick-pick items for applicable status actions', () => {
    const items = createStatusActionItems({
      state: 'ready',
      vaultCount: 1,
      docCount: 4,
      vaultRoot: 'file:///vault',
    });

    assert.deepEqual(
      items.map((item) => item.command),
      [
        'flavorGrenade.restartServer',
        'flavorGrenade.rebuildIndex',
        'flavorGrenade.showOutput',
        'flavorGrenade.copyDiagnosticInfo',
        'flavorGrenade.revealVaultRoot',
      ],
    );
  });
});
