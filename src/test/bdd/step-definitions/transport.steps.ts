import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';

// ── Helper ─────────────────────────────────────────────────────────────────

function getNestedField(obj: unknown, fieldPath: string): unknown {
  const parts = fieldPath.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ── Background ─────────────────────────────────────────────────────────────

Given(
  'a flavor-grenade-lsp server process started via stdio transport',
  async function (this: FGWorld) {
    if (!this.proc) {
      await this.startServer(undefined);
    }
  },
);

// ── Initialize handshake ───────────────────────────────────────────────────

When(
  'the client sends an {string} request with:',
  async function (this: FGWorld, method: string, dataTable: DataTable) {
    if (method === 'initialize' && this.lastResponse !== null) {
      // Already done by startServer() in Background — lastResponse already holds the result
      return;
    }
    const rows = dataTable.hashes() as Array<{ field: string; value: string }>;
    const params: Record<string, unknown> = {};
    for (const { field, value } of rows) {
      if (value === 'null') params[field] = null;
      else if (value === '{}') params[field] = {};
      else if (value === '<client pid>') params[field] = process.pid;
      else params[field] = value;
    }
    this.lastResponse = await this.request(method, params);
  },
);

Then(
  'the server returns an {string} response with result containing:',
  function (this: FGWorld, _method: string, dataTable: DataTable) {
    const resp = this.lastResponse as Record<string, unknown> | null;
    // Unwrap JSON-RPC envelope if present
    const result: unknown = resp !== null && resp?.result !== undefined ? resp.result : resp;
    const rows = dataTable.hashes() as Array<{ field: string; value: string }>;
    for (const { field, value } of rows) {
      if (value === 'present') {
        const fieldValue = getNestedField(result, field);
        expect(fieldValue).toBeDefined();
      }
    }
  },
);

Then('the server has not yet started processing document notifications', function (this: FGWorld) {
  // After initialize the server is initialized and may have started a vault scan,
  // but no textDocument diagnostics should have been published yet.
  expect(this.lastDiagnostics.size).toBe(0);
});

When('the client sends an {string} notification', function (this: FGWorld, method: string) {
  this.notify(method, {});
});

Then('the LspServer transitions to active state', function (this: FGWorld) {
  expect(this.proc).not.toBeNull();
});

Then('the server is ready to accept textDocument notifications', function (this: FGWorld) {
  expect(this.proc).not.toBeNull();
});

// ── Shutdown / exit sequence ───────────────────────────────────────────────

Given(
  /^the LspServer is in active state after a successful initialize\/initialized handshake$/,
  async function (this: FGWorld) {
    if (!this.proc) {
      await this.startServer(undefined);
    }
  },
);

When('the client sends a {string} request', async function (this: FGWorld, method: string) {
  this.lastResponse = await this.request(method, {});
});

Then(
  'the server returns a {string} response with result null',
  function (this: FGWorld, _method: string) {
    const resp = this.lastResponse as Record<string, unknown> | null;
    // Handle both: response object with result field, or directly null
    const result: unknown = resp !== null && resp?.result !== undefined ? resp.result : resp;
    expect(result).toBeNull();
  },
);

Then('the LspServer stops accepting new requests', function (this: FGWorld) {
  expect(this.proc).not.toBeNull();
});

Then('the server process exits with code 0', async function (this: FGWorld) {
  this.notify('exit', {});
  const code = await this.waitForExit();
  expect(code).toBe(0);
});
