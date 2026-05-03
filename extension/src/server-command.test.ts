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

        assert.equal(command.command, customPath);
        assert.equal(command.args, undefined);
    });

    it('falls back to dev node entry when custom path is missing', () => {
        const warnings: string[] = [];
        const command = resolveServerCommandFromOptions({
            customPath: 'missing.exe',
            extensionPath,
            isDevelopment: true,
            exists: () => false,
            notifyWarning: (message) => warnings.push(message),
        });

        assert.equal(command.command, 'node');
        assert.ok(command.args?.[0].endsWith(join('dist', 'main.js')));
        assert.equal(warnings.length, 1);
    });

    it('uses bundled Windows binary outside development mode', () => {
        const command = resolveServerCommandFromOptions({
            extensionPath,
            isDevelopment: false,
            platform: 'win32',
        });

        assert.ok(command.command.replaceAll('\\', '/').endsWith('server/flavor-grenade-lsp.exe'));
    });

    it('uses bundled extensionless binary on non-Windows platforms', () => {
        const command = resolveServerCommandFromOptions({
            extensionPath,
            isDevelopment: false,
            platform: 'linux',
        });

        assert.ok(command.command.replaceAll('\\', '/').endsWith('server/flavor-grenade-lsp'));
    });
});
