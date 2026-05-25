import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'bun:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts', 'set-plugin-version.mjs');

describe('set-plugin-version', () => {
  it('updates plugin, skill, marketplace, and docs versions', () => {
    const root = tempRepo();
    try {
      const result = spawnSync(
        process.execPath,
        [
          scriptPath,
          'skill-v1.2.3-test.4',
          '--server-version',
          '0.6.7',
          '--server-release-tag',
          'v0.6.7',
          '--root',
          root,
        ],
        { encoding: 'utf8' },
      );
      expect(result.status).toBe(0);

      expect(readJson(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/manifest.json')).toMatchObject({
        version: '1.2.3-test.4',
        server: { version: '0.6.7', releaseTag: 'v0.6.7' },
      });
      expect(readJson(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/package.json').version).toBe(
        '1.2.3-test.4',
      );
      expect(readJson(root, 'plugins/flavorgrenade-lsp/.claude-plugin/plugin.json').version).toBe('1.2.3-test.4');
      expect(readJson(root, 'plugins/flavorgrenade-lsp/.codex-plugin/plugin.json').version).toBe('1.2.3-test.4');
      expect(readJson(root, 'marketplace.json').skills[0].version).toBe('1.2.3-test.4');
      expect(readJson(root, '.claude-plugin/marketplace.json').version).toBe('1.2.3-test.4');
      expect(readJson(root, '.claude-plugin/marketplace.json').plugins[0].version).toBe('1.2.3-test.4');
      expect(readFileSync(path.join(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/docs/compatibility.md'), 'utf8')).toContain(
        '| `1.2.3-test.4` | `0.6.x` | `1.0` | supported | supported |',
      );
      expect(readFileSync(path.join(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/docs/json-schema.md'), 'utf8')).toContain(
        '"skill": { "name": "flavorgrenade-lsp-skill", "version": "1.2.3-test.4" }',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

function tempRepo() {
  const root = path.join(tmpdir(), `fg-plugin-version-${process.pid}-${Date.now()}`);
  mkdirSync(path.join(root, 'plugins', 'flavorgrenade-lsp', 'skills', 'flavorgrenade-lsp', 'docs'), {
    recursive: true,
  });
  mkdirSync(path.join(root, 'plugins', 'flavorgrenade-lsp', '.claude-plugin'), { recursive: true });
  mkdirSync(path.join(root, 'plugins', 'flavorgrenade-lsp', '.codex-plugin'), { recursive: true });
  mkdirSync(path.join(root, '.claude-plugin'), { recursive: true });
  writeJson(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/manifest.json', {
    version: '0.1.0',
    server: { version: '0.5.0', releaseTag: 'v0.5.0' },
  });
  writeJson(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/package.json', {
    version: '0.1.0',
  });
  writeJson(root, 'plugins/flavorgrenade-lsp/.claude-plugin/plugin.json', { version: '0.1.0' });
  writeJson(root, 'plugins/flavorgrenade-lsp/.codex-plugin/plugin.json', { version: '0.1.0' });
  writeJson(root, 'marketplace.json', { skills: [{ name: 'flavorgrenade-lsp', version: '0.1.0' }] });
  writeJson(root, '.claude-plugin/marketplace.json', {
    version: '0.1.0',
    plugins: [{ name: 'flavorgrenade-lsp', version: '0.1.0' }],
  });
  writeFileSync(
    path.join(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/docs/compatibility.md'),
    [
      '| Skill version | Server version | JSON schema | Claude Code | Codex | Runtime targets |',
      '|---|---|---|---|---|---|',
      '| `0.1.0` | `0.5.x` | `1.0` | supported | supported | linux-x64 |',
      '',
      '| Skill version | Commands | Hooks | Agents | MCP | LSP |',
      '|---|---|---|---|---|---|',
      '| `0.1.0` | Claude prompts, Codex docs | advisory | packaged prompts | optional | required metadata |',
      '',
    ].join('\n'),
  );
  writeFileSync(
    path.join(root, 'plugins/flavorgrenade-lsp/skills/flavorgrenade-lsp/docs/json-schema.md'),
    '"skill": { "name": "flavorgrenade-lsp-skill", "version": "0.1.0" }\n"server": { "name": "flavor-grenade-lsp", "version": "0.5.0" }\n',
  );
  return root;
}

function writeJson(root, relativePath, value) {
  writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}
