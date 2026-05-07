import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { TROUBLESHOOTING_URL } from './troubleshooting.js';

describe('troubleshooting docs', () => {
  it('points the command at the repository troubleshooting document', () => {
    assert.match(TROUBLESHOOTING_URL, /extension\/docs\/troubleshooting\.md/);
  });

  it('documents common status recovery cases', async () => {
    const text = await readFile(resolve('docs', 'troubleshooting.md'), 'utf8');

    for (const phrase of [
      'Missing server binary',
      'Crash loop',
      'No OFMarkdown promotion',
      'No completions',
      'Stale index',
      'Restricted Mode',
      'Virtual workspace',
      'Copy Diagnostic Info',
    ]) {
      assert.match(text, new RegExp(phrase, 'i'));
    }
  });
});
