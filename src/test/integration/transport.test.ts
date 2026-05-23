/**
 * Integration tests for the LSP stdio transport.
 *
 * Spawns the server as a subprocess and communicates via stdio using a
 * minimal LspClient helper. Does NOT import from src/ directly.
 */
import { describe, expect, it } from '@jest/globals';
import { SERVER_VERSION } from '../../version.js';
import { LspClient } from './lsp-client.js';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LSP Transport Integration', () => {
  it('full handshake: initialize → initialized → shutdown → exit (exits 0)', async () => {
    const client = new LspClient();
    try {
      // 1. initialize
      const initResponse = (await client.request('initialize', {
        processId: null,
        rootUri: null,
        capabilities: {},
      })) as Record<string, unknown>;

      expect(initResponse).toMatchObject({
        jsonrpc: '2.0',
        result: {
          capabilities: expect.objectContaining({ textDocumentSync: 1 }),
          serverInfo: { name: 'flavor-grenade-lsp', version: SERVER_VERSION },
        },
      });

      // 2. The server should push a flavorGrenade/status notification after initialize
      // (may arrive before or interleaved — collect next server push)
      const statusNotif = (await client.nextMessage()) as Record<string, unknown>;
      expect(statusNotif).toMatchObject({
        jsonrpc: '2.0',
        method: 'flavorGrenade/status',
      });

      // 3. initialized notification
      client.notify('initialized', {});

      // 4. shutdown
      const shutdownResponse = (await client.request('shutdown')) as Record<string, unknown>;
      expect(shutdownResponse).toMatchObject({ jsonrpc: '2.0', id: 2, result: null });
      expect(shutdownResponse['error']).toBeUndefined();

      // 5. exit
      const exitCodePromise = client.waitForExit();
      client.notify('exit');

      const exitCode = await exitCodePromise;
      expect(exitCode).toBe(0);
    } finally {
      client.kill();
    }
  }, 15000);

  it('unknown method returns -32601 Method Not Found', async () => {
    const client = new LspClient();
    try {
      // First do initialize so server is ready
      await client.request('initialize', { processId: null, rootUri: null, capabilities: {} });
      // consume the status notification
      await client.waitForNotification('flavorGrenade/status');

      const response = (await client.request('unknown/method', {})) as Record<string, unknown>;
      expect(response).toMatchObject({
        jsonrpc: '2.0',
        error: { code: -32601 },
      });

      // clean up
      await client.request('shutdown');
      client.notify('exit');
      await client.waitForExit();
    } finally {
      client.kill();
    }
  }, 15000);

  it('flavorGrenade/status notification received after initialized', async () => {
    const client = new LspClient();
    try {
      await client.request('initialize', { processId: null, rootUri: null, capabilities: {} });
      const notif = (await client.waitForNotification('flavorGrenade/status')) as Record<
        string,
        unknown
      >;

      expect(notif).toMatchObject({
        jsonrpc: '2.0',
        method: 'flavorGrenade/status',
        params: { state: 'initializing', vaultCount: 0, docCount: 0 },
      });

      await client.request('shutdown');
      client.notify('exit');
      await client.waitForExit();
    } finally {
      client.kill();
    }
  }, 15000);
});
