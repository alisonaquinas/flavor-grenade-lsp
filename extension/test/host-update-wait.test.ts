import assert from 'node:assert/strict';
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
});
