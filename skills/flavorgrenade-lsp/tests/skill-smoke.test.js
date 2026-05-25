import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LspClient } from '../wrappers/lsp-client.mjs';
import { currentTarget, resolveRuntime, sha256File } from '../wrappers/runtime.mjs';
import { errorEnvelope, successEnvelope } from '../wrappers/schema.mjs';

const temps = [];

afterEach(() => {
  for (const temp of temps.splice(0)) {
    rmSync(temp, { recursive: true, force: true });
  }
});

describe('runtime resolver', () => {
  it('maps the current platform to a supported target', () => {
    expect(['linux-x64', 'darwin-arm64', 'darwin-x64', 'win-x64']).toContain(currentTarget());
  });

  it('verifies executable digest before launch', async () => {
    const root = tempSkill();
    const target = currentTarget();
    const executableName = target === 'win-x64' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp';
    const executable = path.join(root, 'bin', target, executableName);
    mkdirSync(path.dirname(executable), { recursive: true });
    writeFileSync(executable, '#!/usr/bin/env node\n');
    const digest = await sha256File(executable);
    writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify(
        {
          name: 'flavorgrenade-lsp-skill',
          installName: 'flavorgrenade-lsp',
          version: '0.1.0',
          schemaVersion: '1.0',
          server: { name: 'flavor-grenade-lsp', version: '0.5.0' },
          runtime: {
            target,
            executable: `bin/${target}/${executableName}`,
            sha256: digest,
          },
          commands: { main: 'wrappers/flavorgrenade.mjs' },
        },
        null,
        2,
      ),
    );
    const runtime = await resolveRuntime({ skillRoot: root, target });
    expect(runtime.sha256).toBe(digest);
  });

  it('rejects digest mismatches', async () => {
    const root = tempSkill();
    const target = currentTarget();
    const executableName = target === 'win-x64' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp';
    const executable = path.join(root, 'bin', target, executableName);
    mkdirSync(path.dirname(executable), { recursive: true });
    writeFileSync(executable, '#!/usr/bin/env node\n');
    writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify({
        name: 'flavorgrenade-lsp-skill',
        runtime: {
          target,
          executable: `bin/${target}/${executableName}`,
          sha256: '0'.repeat(64),
        },
      }),
    );
    await expect(resolveRuntime({ skillRoot: root, target })).rejects.toThrow(
      'Bundled executable digest does not match manifest.',
    );
  });
});

describe('schema envelope', () => {
  it('normalizes success output', () => {
    const envelope = successEnvelope(
      {
        target: 'win-x64',
        manifest: {
          name: 'flavorgrenade-lsp-skill',
          version: '0.1.0',
          server: { name: 'flavor-grenade-lsp', version: '0.5.0' },
        },
      },
      { root: '.', mode: 'single-file' },
      { verified: true },
    );
    expect(envelope.ok).toBe(true);
    expect(envelope.schemaVersion).toBe('1.0');
  });

  it('redacts private paths from errors', () => {
    const envelope = errorEnvelope(new Error('failed at C:\\Users\\name\\secret.md'));
    expect(envelope.error.message).not.toContain('secret.md');
  });
});

describe('LSP diagnostics synchronization', () => {
  it('returns cached diagnostics immediately', async () => {
    const client = testClient();
    client.diagnostics.set('file:///note.md', [{ code: 'FG001' }]);
    await expect(client.waitForDiagnostics('file:///note.md', 1)).resolves.toEqual([
      { code: 'FG001' },
    ]);
  });

  it('resolves when publishDiagnostics arrives after a command starts waiting', async () => {
    const client = testClient();
    const pending = client.waitForDiagnostics('file:///note.md', 50);
    client.dispatch({
      method: 'textDocument/publishDiagnostics',
      params: {
        uri: 'file:///note.md',
        diagnostics: [{ code: 'FG001' }],
      },
    });
    await expect(pending).resolves.toEqual([{ code: 'FG001' }]);
  });
});

function tempSkill() {
  const root = mkdtempSync(path.join(tmpdir(), 'fg-skill-'));
  temps.push(root);
  mkdirSync(path.join(root, 'wrappers'), { recursive: true });
  writeFileSync(path.join(root, 'wrappers', 'flavorgrenade.mjs'), '');
  return root;
}

function testClient() {
  const client = Object.create(LspClient.prototype);
  client.diagnostics = new Map();
  client.diagnosticWaiters = new Map();
  return client;
}
