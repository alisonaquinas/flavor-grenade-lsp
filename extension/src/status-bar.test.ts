import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildDiagnosticInfo,
  formatFlavorGrenadeStatus,
  getStatusQuickActions,
} from './status-presentation.js';

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

  it('renders rich tooltip diagnostics without leaking raw server paths', () => {
    const presentation = formatFlavorGrenadeStatus({
      state: 'ready',
      vaultCount: 2,
      docCount: 17,
      extensionVersion: '0.1.3',
      serverVersion: '0.2.1',
      vaultRoot: 'C:/vault',
      platform: 'win32-x64',
      serverPathSummary: 'bundled server',
    });

    assert.equal(presentation.text, '$(check) FG: 17 docs');
    assert.match(presentation.tooltip, /State: ready/);
    assert.match(presentation.tooltip, /Extension: 0\.1\.3/);
    assert.match(presentation.tooltip, /Server: 0\.2\.1/);
    assert.match(presentation.tooltip, /Vault root: C:\/vault/);
    assert.match(presentation.tooltip, /Server path: bundled server/);
    assert.doesNotMatch(presentation.tooltip, /Users\/.+\/secret/i);
  });

  it('formats disabled, crashed, and misconfigured states with next actions', () => {
    assert.deepEqual(
      formatFlavorGrenadeStatus({
        state: 'disabled',
        vaultCount: 0,
        docCount: 0,
        message: 'Restricted Mode',
      }),
      {
        text: '$(circle-slash) FG: Disabled',
        tooltip:
          'Flavor Grenade\nState: disabled\nExtension: unavailable\nServer: unavailable\nVault root: unavailable\nVaults: 0\nDocuments: 0\nPlatform: unavailable\nServer path: unavailable\nLast error: Restricted Mode\nNext action: Open troubleshooting',
      },
    );
    assert.equal(
      formatFlavorGrenadeStatus({
        state: 'crashed',
        vaultCount: 1,
        docCount: 4,
        message: 'Server crashed five times',
      }).text,
      '$(error) FG: Crashed',
    );
    assert.equal(
      formatFlavorGrenadeStatus({
        state: 'misconfigured',
        vaultCount: 0,
        docCount: 0,
        message: 'Custom server path is missing',
      }).text,
      '$(warning) FG: Config',
    );
  });

  it('selects applicable quick actions by status state', () => {
    assert.deepEqual(
      getStatusQuickActions({
        state: 'ready',
        vaultCount: 1,
        docCount: 4,
        vaultRoot: 'file:///vault',
      }).map((action) => action.command),
      [
        'flavorGrenade.restartServer',
        'flavorGrenade.rebuildIndex',
        'flavorGrenade.showOutput',
        'flavorGrenade.copyDiagnosticInfo',
        'flavorGrenade.revealVaultRoot',
      ],
    );
    assert.deepEqual(
      getStatusQuickActions({
        state: 'disabled',
        vaultCount: 0,
        docCount: 0,
      }).map((action) => action.command),
      [
        'flavorGrenade.showOutput',
        'flavorGrenade.copyDiagnosticInfo',
        'flavorGrenade.openTroubleshooting',
      ],
    );
    assert.deepEqual(
      getStatusQuickActions({
        state: 'crashed',
        vaultCount: 1,
        docCount: 4,
      }).map((action) => action.command),
      [
        'flavorGrenade.restartServer',
        'flavorGrenade.rebuildIndex',
        'flavorGrenade.showOutput',
        'flavorGrenade.copyDiagnosticInfo',
        'flavorGrenade.openTroubleshooting',
      ],
    );
  });

  it('builds sanitized diagnostic copy text', () => {
    const text = buildDiagnosticInfo({
      state: 'error',
      vaultCount: 1,
      docCount: 3,
      extensionVersion: '0.1.3',
      serverVersion: '0.2.1',
      platform: 'win32-x64',
      serverPathSummary: 'custom server path configured',
      vaultRoot: 'C:/vault',
      message: 'boom',
    });

    assert.match(text, /Flavor Grenade diagnostics/);
    assert.match(text, /state: error/);
    assert.match(text, /extensionVersion: 0\.1\.3/);
    assert.match(text, /serverPath: custom server path configured/);
    assert.doesNotMatch(text, /server\.path=/i);
  });
});
