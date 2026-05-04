import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { SERVER_VERSION } from './version.js';

describe('SERVER_VERSION', () => {
  it('matches the root npm package version', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { version?: unknown };
    expect(SERVER_VERSION).toBe(packageJson.version);
  });
});
