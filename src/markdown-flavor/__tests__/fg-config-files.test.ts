import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FlavorGrenadeConfigFiles } from '../fg-config-files.js';

describe('FlavorGrenadeConfigFiles', () => {
  let vaultRoot: string;
  let resolver: FlavorGrenadeConfigFiles;

  beforeEach(() => {
    vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-config-files-'));
    resolver = new FlavorGrenadeConfigFiles();
  });

  afterEach(() => {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  });

  it('defaults visible Markdown to Auto Detect when config files are absent', () => {
    writeFile('docs/guide.md', '# Guide\n');

    const result = resolver.resolveForFile(vaultRoot, abs('docs/guide.md'));

    expect(result).toEqual({
      ignored: false,
      configFilesSeen: false,
      attributes: {},
    });
  });

  it('applies root .fgignore patterns and later negation', () => {
    writeFile(
      '.fgignore',
      [
        '# generated docs',
        'dist/**/*.md',
        '!dist/release-notes.md',
        'private/*',
        '!private/shared.md',
        '',
      ].join('\n'),
    );
    writeFile('dist/generated.md', '# Generated\n');
    writeFile('dist/release-notes.md', '# Release notes\n');
    writeFile('private/journal.md', '# Journal\n');
    writeFile('private/shared.md', '# Shared\n');

    expect(resolver.resolveForFile(vaultRoot, abs('dist/generated.md')).ignored).toBe(true);
    expect(resolver.resolveForFile(vaultRoot, abs('dist/release-notes.md')).ignored).toBe(false);
    expect(resolver.resolveForFile(vaultRoot, abs('private/journal.md')).ignored).toBe(true);
    expect(resolver.resolveForFile(vaultRoot, abs('private/shared.md')).ignored).toBe(false);
  });

  it('lets nested .fgignore rules override parent rules for descendant files', () => {
    writeFile('.fgignore', 'notes/private/**\n');
    writeFile('notes/.fgignore', '!private/keep.md\n');
    writeFile('notes/private/keep.md', '# Keep\n');
    writeFile('notes/private/drop.md', '# Drop\n');

    expect(resolver.resolveForFile(vaultRoot, abs('notes/private/keep.md')).ignored).toBe(false);
    expect(resolver.resolveForFile(vaultRoot, abs('notes/private/drop.md')).ignored).toBe(true);
  });

  it('resolves .fgattributes through root-to-leaf attribute cascade', () => {
    writeFile(
      '.fgattributes',
      [
        '*.md flavor=commonmark',
        'docs/**/*.md flavor=gfm',
        'docs/changelog.md structured_profiles=keep-a-changelog',
        'notes/**/*.md flavor=obsidian',
        'notes/drafts/**/*.md !flavor !structured_profiles',
        'experiments/**/*.md flavor=auto',
        '',
      ].join('\n'),
    );
    writeFile('docs/.fgattributes', 'api/**/*.md flavor=pandoc\n');
    writeFile('README.md', '# Readme\n');
    writeFile('docs/guide.md', '# Guide\n');
    writeFile('docs/changelog.md', '# Changelog\n');
    writeFile('docs/api/reference.md', '# API\n');
    writeFile('notes/today.md', '# Today\n');
    writeFile('notes/drafts/idea.md', '# Idea\n');
    writeFile('experiments/test.md', '# Test\n');

    expect(resolver.resolveForFile(vaultRoot, abs('README.md')).attributes).toEqual({
      flavor: 'commonmark',
    });
    expect(resolver.resolveForFile(vaultRoot, abs('docs/guide.md')).attributes).toEqual({
      flavor: 'gfm',
    });
    expect(resolver.resolveForFile(vaultRoot, abs('docs/changelog.md')).attributes).toEqual({
      flavor: 'gfm',
      structuredProfiles: ['keep-a-changelog'],
    });
    expect(resolver.resolveForFile(vaultRoot, abs('docs/api/reference.md')).attributes).toEqual({
      flavor: 'pandoc',
    });
    expect(resolver.resolveForFile(vaultRoot, abs('notes/today.md')).attributes).toEqual({
      flavor: 'obsidian',
    });
    expect(resolver.resolveForFile(vaultRoot, abs('notes/drafts/idea.md')).attributes).toEqual({});
    expect(resolver.resolveForFile(vaultRoot, abs('experiments/test.md')).attributes).toEqual({
      flavor: 'auto',
    });
  });

  it('ignores unsafe and invalid .fgattributes values without dropping valid rules', () => {
    writeFile(
      '.fgattributes',
      [
        '*.md flavor=commonmark',
        'bad.md flavor=unknown',
        'unsafe.md __proto__=polluted',
        'profiles.md structured_profiles=keep-a-changelog,madr',
        'conflict.md structured_profiles=keep-a-changelog,common-changelog',
        '',
      ].join('\n'),
    );
    writeFile('bad.md', '# Bad\n');
    writeFile('unsafe.md', '# Unsafe\n');
    writeFile('profiles.md', '# Profiles\n');
    writeFile('conflict.md', '# Conflict\n');

    expect(resolver.resolveForFile(vaultRoot, abs('bad.md')).attributes).toEqual({
      flavor: 'commonmark',
    });
    expect(resolver.resolveForFile(vaultRoot, abs('unsafe.md')).attributes).toEqual({
      flavor: 'commonmark',
    });
    expect(resolver.resolveForFile(vaultRoot, abs('profiles.md')).attributes).toEqual({
      flavor: 'commonmark',
      structuredProfiles: ['keep-a-changelog', 'madr'],
    });
    expect(resolver.resolveForFile(vaultRoot, abs('conflict.md')).attributes).toEqual({
      flavor: 'commonmark',
    });
  });

  it('rejects resources outside the vault boundary', () => {
    const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-outside-'));
    try {
      const outside = path.join(outsideRoot, 'outside.md');
      fs.writeFileSync(outside, '# Outside\n');

      expect(resolver.resolveForFile(vaultRoot, outside)).toEqual({
        ignored: true,
        inactiveReason: 'outside-vault',
        configFilesSeen: false,
        attributes: {},
      });
    } finally {
      fs.rmSync(outsideRoot, { recursive: true, force: true });
    }
  });

  function abs(relativePath: string): string {
    return path.join(vaultRoot, relativePath);
  }

  function writeFile(relativePath: string, content: string): void {
    const target = abs(relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
});
