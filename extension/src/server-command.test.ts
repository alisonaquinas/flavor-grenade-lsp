import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { resolveServerCommandFromOptions } from './server-command.js';

const extensionPath = resolve('repo', 'extension');

describe('resolveServerCommandFromOptions', () => {
  it('uses an existing custom server path first', () => {
    const customPath = resolve('tools', 'fg');
    const command = resolveServerCommandFromOptions({
      customPath,
      extensionPath,
      isDevelopment: true,
      exists: () => true,
    });

    assert.equal(command.kind, 'executable');
    assert.equal(command.command, customPath);
    assert.equal(command.args, undefined);
  });

  it('uses bundled server module in development mode when extension compile produced one', () => {
    const command = resolveServerCommandFromOptions({
      extensionPath,
      isDevelopment: true,
      exists: (candidate) => candidate.replaceAll('\\', '/').endsWith('server/main.js'),
    });

    assert.equal(command.kind, 'module');
    assert.ok(command.module.replaceAll('\\', '/').endsWith('server/main.js'));
  });

  it('falls back to dev node entry when custom path and bundled module are missing', () => {
    const warnings: string[] = [];
    const command = resolveServerCommandFromOptions({
      customPath: 'missing.exe',
      extensionPath,
      isDevelopment: true,
      exists: () => false,
      notifyWarning: (message) => warnings.push(message),
    });

    assert.equal(command.kind, 'executable');
    assert.equal(command.command, 'node');
    assert.ok(command.args?.[0].endsWith(join('dist', 'main.js')));
    assert.equal(warnings.length, 1);
  });

  it('uses bundled server module outside development mode on Windows', () => {
    const command = resolveServerCommandFromOptions({
      extensionPath,
      isDevelopment: false,
      platform: 'win32',
    });

    assert.equal(command.kind, 'module');
    assert.ok(command.module.replaceAll('\\', '/').endsWith('server/main.js'));
  });

  it('uses bundled server module outside development mode on non-Windows platforms', () => {
    const command = resolveServerCommandFromOptions({
      extensionPath,
      isDevelopment: false,
      platform: 'linux',
    });

    assert.equal(command.kind, 'module');
    assert.ok(command.module.replaceAll('\\', '/').endsWith('server/main.js'));
  });
});
