import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'bun:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts', 'skill-package.mjs');

describe('skill-package', () => {
  it('requires signed GitHub release provenance when requested', () => {
    const root = tempRepo();
    try {
      const binary = path.join(root, 'dist', 'flavor-grenade-lsp');
      writeFileSync(binary, 'local runtime');

      const unsigned = spawnSync(
        process.execPath,
        [scriptPath, '--dry-run', '--require-signed-runtime', '--target', 'linux-x64'],
        {
          cwd: root,
          encoding: 'utf8',
        },
      );
      expect(unsigned.status).toBe(1);
      expect(unsigned.stderr).toContain('Missing signed runtime Sigstore bundle');

      writeFileSync(`${binary}.sigstore.json`, '{}\n');
      writeFileSync(
        path.join(root, 'dist', 'flavor-grenade-lsp.runtime.json'),
        `${JSON.stringify(
          {
            target: 'linux-x64',
            source: 'github-release',
            repository: 'example/flavor-grenade-lsp',
            releaseTag: 'v1.2.3',
            commit: 'abc123',
            sha256: sha256('local runtime'),
            verified: true,
          },
          null,
          2,
        )}\n`,
      );

      const signed = spawnSync(
        process.execPath,
        [scriptPath, '--dry-run', '--require-signed-runtime', '--target', 'linux-x64'],
        {
          cwd: root,
          encoding: 'utf8',
        },
      );
      expect(signed.status).toBe(0);

      const packageRoot = path.join(root, signed.stdout.trim());
      const manifest = JSON.parse(
        readFileSync(path.join(packageRoot, 'skills', 'flavorgrenade-lsp', 'manifest.json'), 'utf8'),
      );
      expect(manifest.server).toMatchObject({ commit: 'abc123', releaseTag: 'v1.2.3' });
      expect(manifest.runtime.signature.certificateIdentityRegexp).toBe(
        '^https://github.com/example/flavor-grenade-lsp/\\.github/workflows/release\\.yml@refs/tags/v.*$',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

function tempRepo() {
  const root = mkdtempSync(path.join(tmpdir(), 'fg-package-'));
  const skillRoot = path.join(root, 'plugins', 'flavorgrenade-lsp', 'skills', 'flavorgrenade-lsp');
  mkdirSync(path.join(skillRoot, 'wrappers'), { recursive: true });
  mkdirSync(path.join(root, 'dist'), { recursive: true });
  mkdirSync(path.join(root, '.claude-plugin'), { recursive: true });
  mkdirSync(path.join(root, '.agents', 'plugins'), { recursive: true });

  writeFileSync(path.join(root, 'marketplace.json'), '{}\n');
  writeFileSync(path.join(root, '.claude-plugin', 'marketplace.json'), '{}\n');
  writeFileSync(path.join(root, '.agents', 'plugins', 'marketplace.json'), '{}\n');
  writeFileSync(path.join(root, 'plugins', 'flavorgrenade-lsp', 'CHANGELOG.md'), '# Changelog\n');
  writeFileSync(path.join(skillRoot, 'SKILL.md'), '---\nname: flavorgrenade-lsp\n---\n');
  writeFileSync(path.join(skillRoot, 'README.md'), '# Skill\n');
  writeFileSync(path.join(skillRoot, 'wrappers', 'flavorgrenade.mjs'), '');
  writeFileSync(
    path.join(skillRoot, 'package.json'),
    JSON.stringify({ name: 'flavorgrenade-lsp-skill', version: '0.1.0' }),
  );
  writeFileSync(
    path.join(skillRoot, 'manifest.json'),
    JSON.stringify({
      name: 'flavorgrenade-lsp-skill',
      installName: 'flavorgrenade-lsp',
      version: '0.1.0',
      server: {},
      runtime: {},
      commands: { main: 'wrappers/flavorgrenade.mjs' },
    }),
  );
  return root;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}
