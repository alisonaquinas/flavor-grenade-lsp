import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

describe('extension startup disabled guard', () => {
  it('checks unsupported workspace status before the shared start path spawns the server', async () => {
    const extensionSource = await readFile(resolve('src', 'extension.ts'), 'utf8');
    const startClientStart = extensionSource.indexOf('const startClient = async');
    const startClientEnd = extensionSource.indexOf('const commandDisposables', startClientStart);

    assert.notEqual(startClientStart, -1, 'startClient closure should exist');
    assert.notEqual(startClientEnd, -1, 'command registration should follow startClient');

    const startClientSource = extensionSource.slice(startClientStart, startClientEnd);
    const guardIndex = startClientSource.indexOf('applyDisabledEnvironmentStatus(context)');
    const spawnIndex = startClientSource.indexOf('startLanguageClient(context)');

    assert.notEqual(guardIndex, -1, 'startClient should apply the disabled-environment guard');
    assert.notEqual(spawnIndex, -1, 'startClient should contain the server spawn call');
    assert.ok(
      guardIndex < spawnIndex,
      'disabled-environment guard must run before startLanguageClient(context)',
    );
  });

  it('sends live mdfConfig.maxBytes updates instead of restarting the server', async () => {
    const extensionSource = await readFile(resolve('src', 'extension.ts'), 'utf8');
    const settingGuard = "e.affectsConfiguration(`flavorGrenade.${MDF_CONFIG_MAX_BYTES_SETTING_KEY}`)";
    const guardStart = extensionSource.indexOf(settingGuard);
    const guardEnd = extensionSource.indexOf(
      'const activeDocument = window.activeTextEditor?.document;',
      guardStart,
    );

    assert.notEqual(guardStart, -1, 'mdfConfig.maxBytes change guard should exist');
    assert.notEqual(guardEnd, -1, 'active-document refresh should follow the config guard');

    const guardSource = extensionSource.slice(guardStart, guardEnd);
    assert.match(guardSource, /sendNotification\(\s*'workspace\/didChangeConfiguration'/);
    assert.match(guardSource, /mdfConfigMaxBytes/);
    assert.equal(
      guardSource.includes('client.restart()'),
      false,
      'mdfConfig.maxBytes changes should not restart the server',
    );
  });
});
