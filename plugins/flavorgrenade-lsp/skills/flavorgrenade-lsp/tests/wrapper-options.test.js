import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import {
  collectMarkdownFiles,
  configSelectorMatches,
  parseArgs,
} from '../wrappers/flavorgrenade.mjs';

const tempDirs = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function tempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), 'fg-wrapper-options-'));
  tempDirs.push(root);
  return root;
}

describe('flavorgrenade wrapper options', () => {
  it('parses documented scan filters and limits', () => {
    assert.deepEqual(
      parseArgs([
        'analyze',
        'docs',
        '--include',
        'docs/**/*.md',
        '--exclude',
        'docs/private/**',
        '--max-files',
        '2',
        '--max-bytes',
        '128',
      ]),
      {
        command: 'analyze',
        positional: ['docs'],
        options: {
          json: true,
          include: 'docs/**/*.md',
          exclude: 'docs/private/**',
          maxFiles: 2,
          maxBytes: 128,
        },
      },
    );
  });

  it('collects Markdown files using include, exclude, max-files, and max-bytes', () => {
    const root = tempRoot();
    mkdirSync(path.join(root, 'docs', 'private'), { recursive: true });
    mkdirSync(path.join(root, 'notes'), { recursive: true });
    writeFileSync(path.join(root, 'docs', 'a.md'), '# A\n');
    writeFileSync(path.join(root, 'docs', 'b.md'), '# B\n');
    writeFileSync(path.join(root, 'docs', 'large.md'), `${'x'.repeat(20)}\n`);
    writeFileSync(path.join(root, 'docs', 'private', 'secret.md'), '# Secret\n');
    writeFileSync(path.join(root, 'notes', 'other.md'), '# Other\n');

    const files = collectMarkdownFiles(root, {
      include: 'docs/*.md',
      exclude: 'docs/private/**',
      maxFiles: 2,
      maxBytes: 10,
    }).map((file) => path.relative(root, file).replace(/\\/g, '/'));

    assert.deepEqual(files.sort(), ['docs/a.md', 'docs/b.md']);
  });

  it('matches glob selectors by path shape, not directory prefix', () => {
    assert.equal(configSelectorMatches('docs/*.md', 'docs/page.md'), true);
    assert.equal(configSelectorMatches('docs/*.md', 'docs/sub/page.md'), false);
    assert.equal(configSelectorMatches('docs/**/*.md', 'docs/sub/page.md'), true);
  });
});
