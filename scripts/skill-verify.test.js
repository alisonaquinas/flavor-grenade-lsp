import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'bun:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts', 'skill-verify.mjs');

describe('skill-verify', () => {
  it('keeps release verification strict while allowing unsigned PR dry-run runtimes', () => {
    const root = tempSkill();
    try {
      const strict = spawnSync(process.execPath, [scriptPath, '--skill-root', root], {
        encoding: 'utf8',
      });
      expect(strict.status).toBe(1);
      expect(strict.stderr).toContain('missing runtime Sigstore bundle');

      const prDryRun = spawnSync(
        process.execPath,
        [scriptPath, '--skill-root', root, '--allow-unsigned-runtime'],
        { encoding: 'utf8' },
      );
      expect(prDryRun.status).toBe(0);
    } finally {
      rmSync(path.dirname(root), { recursive: true, force: true });
    }
  });
});

function tempSkill() {
  const root = path.join(mkdtempSync(path.join(tmpdir(), 'fg-verify-')), 'skill');
  mkdirSync(path.join(root, 'wrappers'), { recursive: true });
  mkdirSync(path.join(root, 'bin', 'linux-x64'), { recursive: true });
  writeFileSync(path.join(root, 'SKILL.md'), '---\nname: flavorgrenade-lsp\n---\n');
  writeFileSync(path.join(root, 'wrappers', 'flavorgrenade.mjs'), '');
  writeFileSync(path.join(root, 'bin', 'linux-x64', 'flavor-grenade-lsp'), '#!/usr/bin/env node\n');
  writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({ name: 'flavorgrenade-lsp-skill', version: '0.1.0' }),
  );
  writeFileSync(
    path.join(root, 'manifest.json'),
    JSON.stringify({
      name: 'flavorgrenade-lsp-skill',
      installName: 'flavorgrenade-lsp',
      version: '0.1.0',
      runtime: {
        executable: 'bin/linux-x64/flavor-grenade-lsp',
        sha256: '0'.repeat(64),
        sigstoreBundle: 'bin/linux-x64/flavor-grenade-lsp.sigstore.json',
      },
      commands: { main: 'wrappers/flavorgrenade.mjs' },
    }),
  );
  return root;
}
