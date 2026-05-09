import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

describe('extension startup disabled guard', () => {
  it('checks unsupported workspace status before the shared start path spawns the server', async () => {
    const extensionSource = await readFile(
      fileURLToPath(new URL('./extension.ts', import.meta.url)),
      'utf8',
    );
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
});
