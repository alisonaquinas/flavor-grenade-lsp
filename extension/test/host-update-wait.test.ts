import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const updateWaitModuleUrl = new URL('../scripts/vscode-update-wait.mjs', import.meta.url);

describe('VS Code update wait helper', () => {
  it('detects active VS Code setup processes on Windows', async () => {
    const { findVsCodeUpdateProcesses } = await import(updateWaitModuleUrl.href);
    const processes = findVsCodeUpdateProcesses(
      [
        { pid: 100, name: 'Code' },
        { pid: 101, name: 'CodeSetup-stable-0958016b2af9f09bb4257e0df4a95e2f90590f9f' },
        { pid: 102, name: 'CodeSetup-stable-0958016b2af9f09bb4257e0df4a95e2f90590f9f.tmp' },
      ],
      'win32',
    );

    assert.deepEqual(
      processes.map((process) => process.pid),
      [101, 102],
    );
  });

  it('formats a clear wait message for updater processes', async () => {
    const { formatVsCodeUpdateProcessMessage } = await import(updateWaitModuleUrl.href);
    const message = formatVsCodeUpdateProcessMessage([{ pid: 101, name: 'CodeSetup-stable' }]);

    assert.match(message, /CodeSetup-stable/);
    assert.match(message, /101/);
  });

  it('disables the versioned update mutex only in the downloaded test runtime', async () => {
    const { disableWindowsVersionedUpdateCheck } = await import(updateWaitModuleUrl.href);
    const tempDir = await mkdtemp(join(tmpdir(), 'fg-vscode-product-'));
    const productJsonPath = join(tempDir, 'product.json');
    await writeFile(
      productJsonPath,
      JSON.stringify({
        nameShort: 'Code',
        win32MutexName: 'vscode',
        win32VersionedUpdate: true,
      }),
    );

    await disableWindowsVersionedUpdateCheck(productJsonPath, 'win32');

    const product = JSON.parse(await readFile(productJsonPath, 'utf8')) as {
      win32MutexName: string;
      win32VersionedUpdate: boolean;
    };
    assert.equal(product.win32MutexName, 'vscode');
    assert.equal(product.win32VersionedUpdate, false);
  });
});
