import { describe, expect, it, jest } from '@jest/globals';
import { JsonRpcDispatcher } from './json-rpc-dispatcher.js';

/** Capture outbound messages sent via the dispatcher. */
function captureOutput(): {
  dispatcher: JsonRpcDispatcher;
  sent: unknown[];
} {
  const sent: unknown[] = [];
  const dispatcher = new JsonRpcDispatcher((msg) => sent.push(msg));
  return { dispatcher, sent };
}

describe('JsonRpcDispatcher', () => {
  describe('request routing', () => {
    it('routes a request to its registered handler and returns a response', async () => {
      const { dispatcher, sent } = captureOutput();
      dispatcher.onRequest('initialize', async (_params) => ({
        capabilities: {},
      }));

      await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
      );

      expect(sent).toHaveLength(1);
      expect(sent[0]).toMatchObject({
        jsonrpc: '2.0',
        id: 1,
        result: { capabilities: {} },
      });
    });

    it('returns -32601 Method Not Found for an unregistered request', async () => {
      const { dispatcher, sent } = captureOutput();

      await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'unknown/method', params: {} }),
      );

      expect(sent).toHaveLength(1);
      expect(sent[0]).toMatchObject({
        jsonrpc: '2.0',
        id: 2,
        error: { code: -32601 },
      });
    });

    it('returns -32700 Parse Error for invalid JSON', async () => {
      const { dispatcher, sent } = captureOutput();

      await dispatcher.dispatch('not valid json {{{');

      expect(sent).toHaveLength(1);
      expect(sent[0]).toMatchObject({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700 },
      });
    });

    it('returns -32603 Internal Error when a handler throws', async () => {
      const { dispatcher, sent } = captureOutput();
      dispatcher.onRequest('crash', async () => {
        throw new Error('boom');
      });

      await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'crash', params: {} }),
      );

      expect(sent).toHaveLength(1);
      expect(sent[0]).toMatchObject({
        jsonrpc: '2.0',
        id: 3,
        error: { code: -32603 },
      });
    });

    it('returns null result for shutdown (result must be null not undefined)', async () => {
      const { dispatcher, sent } = captureOutput();
      dispatcher.onRequest('shutdown', async () => null);

      await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'shutdown', params: null }),
      );

      expect(sent[0]).toMatchObject({ jsonrpc: '2.0', id: 4, result: null });
      // Ensure no "error" key on success response
      expect((sent[0] as Record<string, unknown>)['error']).toBeUndefined();
    });
  });

  describe('notification routing', () => {
    it('routes a notification to its registered handler and sends no response', async () => {
      const { dispatcher, sent } = captureOutput();
      const handler = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
      dispatcher.onNotification('initialized', handler);

      await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'initialized', params: {} }),
      );

      expect(handler).toHaveBeenCalledTimes(1);
      expect(sent).toHaveLength(0);
    });

    it('silently ignores an unregistered notification', async () => {
      const { dispatcher, sent } = captureOutput();

      await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'unknown/notification', params: {} }),
      );

      expect(sent).toHaveLength(0);
    });
  });

  describe('sendNotification', () => {
    it('sends a notification with method and params via the output function', () => {
      const { dispatcher, sent } = captureOutput();

      dispatcher.sendNotification('flavorGrenade/status', { status: 'ready' });

      expect(sent).toHaveLength(1);
      expect(sent[0]).toMatchObject({
        jsonrpc: '2.0',
        method: 'flavorGrenade/status',
        params: { status: 'ready' },
      });
    });
  });
});
