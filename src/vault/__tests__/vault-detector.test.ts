import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { VaultDetector } from '../vault-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../test/fixtures/vault-detection');

describe('VaultDetector', () => {
  let detector: VaultDetector;
  let tmpDir: string | null = null;

  beforeEach(() => {
    detector = new VaultDetector();
    tmpDir = null;
  });

  afterEach(() => {
    if (tmpDir !== null) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  it('detects obsidian vault when .obsidian/ exists', () => {
    const result = detector.detect(path.join(FIXTURES, 'obsidian-vault'));
    expect(result.mode).toBe('obsidian');
    expect(result.vaultRoot).toBe(path.join(FIXTURES, 'obsidian-vault'));
  });

  it('detects flavor-grenade vaults from .mdfignore and .mdfattributes markers', () => {
    for (const marker of ['.mdfignore', '.mdfattributes']) {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-lsp-config-marker-'));
      try {
        fs.writeFileSync(
          path.join(root, marker),
          marker === '.mdfignore' ? 'private/\n' : '*.md flavor=gfm\n',
        );
        const result = new VaultDetector().detect(root);
        expect(result.mode).toBe('flavor-grenade');
        expect(result.vaultRoot).toBe(root);
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it('ignores legacy flavor config files as vault markers', () => {
    for (const marker of [
      '.flavor-grenade.toml',
      '.flavor-grenade.json',
      '.flavor-grenade.jsonc',
      '.flavor-grenade.yaml',
      '.flavor-grenade.yml',
      '.editorconfig',
    ]) {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-lsp-legacy-marker-'));
      try {
        fs.writeFileSync(
          path.join(root, marker),
          marker === '.editorconfig'
            ? '[*.md]\nflavor_grenade_markdown_flavor = gfm\n'
            : 'core.markdown.flavor = "gfm"\n',
        );
        const result = new VaultDetector().detect(root);
        expect(result.mode).toBe('single-file');
        expect(result.vaultRoot).toBeNull();
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it('ignores ordinary editorconfig files without Flavor Grenade directives', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-lsp-plain-editorconfig-'));
    fs.writeFileSync(
      path.join(tmpDir, '.editorconfig'),
      'root = true\n[*]\nindent_style = space\n',
    );
    const result = detector.detect(tmpDir);

    expect(result.mode).toBe('single-file');
    expect(result.vaultRoot).toBeNull();
  });

  it('obsidian takes precedence when both markers present', () => {
    const result = detector.detect(path.join(FIXTURES, 'both-markers'));
    expect(result.mode).toBe('obsidian');
    expect(result.vaultRoot).toBe(path.join(FIXTURES, 'both-markers'));
  });

  it('returns single-file mode when no marker found in isolated tmp dir', () => {
    // Use a truly isolated directory with no vault markers in any parent
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-lsp-test-no-markers-'));
    const noMarkersDir = path.join(tmpDir, 'subdir');
    fs.mkdirSync(noMarkersDir, { recursive: true });
    const result = detector.detect(noMarkersDir);
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
    const result2 = detector.detect(path.join(FIXTURES, 'flavor-grenade-vault')); // different path but cached
    // Same object reference because cache was set on first call
    expect(result2).toBe(result1);
  });
});
