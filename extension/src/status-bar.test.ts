import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatFlavorGrenadeStatus } from './status-presentation.js';

describe('formatFlavorGrenadeStatus', () => {
  it('formats initializing status', () => {
    assert.deepEqual(
      formatFlavorGrenadeStatus({
        state: 'initializing',
        vaultCount: 0,
        docCount: 0,
      }),
      {
        text: '$(loading~spin) FG: Starting...',
        tooltip: 'Flavor Grenade: Initializing server',
      },
    );
  });

  it('formats indexing status', () => {
    assert.deepEqual(
      formatFlavorGrenadeStatus({
        state: 'indexing',
        vaultCount: 2,
        docCount: 17,
      }),
      {
        text: '$(loading~spin) FG: Indexing...',
        tooltip: 'Flavor Grenade: Indexing 17 docs across 2 vaults',
      },
    );
  });

  it('formats ready status', () => {
    assert.deepEqual(
      formatFlavorGrenadeStatus({
        state: 'ready',
        vaultCount: 1,
        docCount: 5,
      }),
      {
        text: '$(check) FG: 5 docs',
        tooltip: 'Flavor Grenade: Ready — 5 docs in 1 vaults',
      },
    );
  });

  it('formats error status with fallback text', () => {
    assert.deepEqual(
      formatFlavorGrenadeStatus({
        state: 'error',
        vaultCount: 0,
        docCount: 0,
      }),
      {
        text: '$(error) FG: Error',
        tooltip: 'Flavor Grenade: Unknown error',
      },
    );
  });

  it('formats error status with server message', () => {
    assert.deepEqual(
      formatFlavorGrenadeStatus({
        state: 'error',
        vaultCount: 0,
        docCount: 0,
        message: 'Server binary missing',
      }),
      {
        text: '$(error) FG: Error',
        tooltip: 'Flavor Grenade: Server binary missing',
      },
    );
  });
});
