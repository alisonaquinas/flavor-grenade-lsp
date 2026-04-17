import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { IgnoreFilter } from '../ignore-filter.js';

describe('IgnoreFilter', () => {
  let tmpDir: string;
  let filter: IgnoreFilter;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-lsp-ignore-test-'));
    filter = new IgnoreFilter();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('always ignores .obsidian/ regardless of .gitignore', () => {
    filter.load(tmpDir);
    expect(filter.shouldIgnore('.obsidian/plugins/foo.js')).toBe(true);
    expect(filter.shouldIgnore('.obsidian')).toBe(true);
  });

  it('does not ignore normal files when no .gitignore exists', () => {
    filter.load(tmpDir);
    expect(filter.shouldIgnore('notes/plan.md')).toBe(false);
    expect(filter.shouldIgnore('README.md')).toBe(false);
  });

  it('respects .gitignore patterns', () => {
    fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'dist/\n*.log\n');
    filter.load(tmpDir);
    expect(filter.shouldIgnore('dist/index.js')).toBe(true);
    expect(filter.shouldIgnore('build.log')).toBe(true);
    expect(filter.shouldIgnore('notes/plan.md')).toBe(false);
  });

  it('respects .ignore patterns', () => {
    fs.writeFileSync(path.join(tmpDir, '.ignore'), 'private/\n');
    filter.load(tmpDir);
    expect(filter.shouldIgnore('private/secrets.md')).toBe(true);
    expect(filter.shouldIgnore('notes/plan.md')).toBe(false);
  });

  it('combines .gitignore and .ignore patterns', () => {
    fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'dist/\n');
    fs.writeFileSync(path.join(tmpDir, '.ignore'), 'private/\n');
    filter.load(tmpDir);
    expect(filter.shouldIgnore('dist/bundle.js')).toBe(true);
    expect(filter.shouldIgnore('private/secrets.md')).toBe(true);
    expect(filter.shouldIgnore('notes/ok.md')).toBe(false);
  });

  it('calling load twice with different roots uses new patterns', () => {
    const tmpDir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-lsp-ignore-test2-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'old-pattern/\n');
      fs.writeFileSync(path.join(tmpDir2, '.gitignore'), 'new-pattern/\n');

      filter.load(tmpDir);
      expect(filter.shouldIgnore('old-pattern/file.md')).toBe(true);

      filter.load(tmpDir2);
      expect(filter.shouldIgnore('old-pattern/file.md')).toBe(false);
      expect(filter.shouldIgnore('new-pattern/file.md')).toBe(true);
    } finally {
      fs.rmSync(tmpDir2, { recursive: true, force: true });
    }
  });
});
