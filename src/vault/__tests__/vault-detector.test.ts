import { describe, it, expect, beforeEach } from '@jest/globals';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { VaultDetector } from '../vault-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../test/fixtures/vault-detection');

describe('VaultDetector', () => {
  let detector: VaultDetector;

  beforeEach(() => {
    detector = new VaultDetector();
  });

  it('detects obsidian vault when .obsidian/ exists', () => {
    const result = detector.detect(path.join(FIXTURES, 'obsidian-vault'));
    expect(result.mode).toBe('obsidian');
    expect(result.vaultRoot).toBe(path.join(FIXTURES, 'obsidian-vault'));
  });

  it('detects flavor-grenade vault when .flavor-grenade.toml exists', () => {
    const result = detector.detect(path.join(FIXTURES, 'flavor-grenade-vault'));
    expect(result.mode).toBe('flavor-grenade');
    expect(result.vaultRoot).toBe(path.join(FIXTURES, 'flavor-grenade-vault'));
  });

  it('obsidian takes precedence when both markers present', () => {
    const result = detector.detect(path.join(FIXTURES, 'both-markers'));
    expect(result.mode).toBe('obsidian');
    expect(result.vaultRoot).toBe(path.join(FIXTURES, 'both-markers'));
  });

  it('returns single-file mode when no marker found', () => {
    const result = detector.detect(path.join(FIXTURES, 'no-markers'));
    expect(result.mode).toBe('single-file');
    expect(result.vaultRoot).toBeNull();
  });

  it('walks up dir tree to find parent vault marker', () => {
    const result = detector.detect(path.join(FIXTURES, 'nested/parent/child'));
    expect(result.mode).toBe('obsidian');
    expect(result.vaultRoot).toBe(path.join(FIXTURES, 'nested/parent'));
  });

  it('caches result after first call', () => {
    const result1 = detector.detect(path.join(FIXTURES, 'obsidian-vault'));
    const result2 = detector.detect(path.join(FIXTURES, 'no-markers')); // different path but cached
    // Same object reference because cache was set on first call
    expect(result2).toBe(result1);
  });
});
