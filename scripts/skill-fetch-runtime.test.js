import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'bun:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts', 'skill-fetch-runtime.mjs');

describe('skill-fetch-runtime', () => {
  it('downloads, verifies, installs, and records provenance for a release runtime', () => {
    const root = tempDir('fg-fetch-runtime-');
    try {
      const assets = path.join(root, 'release-assets');
      const tools = path.join(root, 'tools');
      mkdirSync(assets, { recursive: true });
      mkdirSync(tools, { recursive: true });

      const binaryName = 'flavor-grenade-lsp-linux-x64';
      const bundleName = `${binaryName}.sigstore.json`;
      const binaryContent = '#!/usr/bin/env bun\nconsole.log("test runtime");\n';
      writeFileSync(path.join(assets, binaryName), binaryContent);
      writeFileSync(path.join(assets, bundleName), '{"bundle":true}\n');
      writeToolStubs(tools);

      const result = spawnSync(
        process.execPath,
        [
          scriptPath,
          '--target',
          'linux-x64',
          '--server-release',
          'v1.2.3',
          '--repo',
          'example/flavor-grenade-lsp',
        ],
        {
          cwd: root,
          env: {
            ...process.env,
            PATH: `${tools}${path.delimiter}${process.env.PATH ?? ''}`,
            FG_TEST_RELEASE_ASSETS: assets,
            FG_TEST_TOOL_LOG: path.join(root, 'tool-log.jsonl'),
          },
          encoding: 'utf8',
        },
      );

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');

      const installedBinary = path.join(root, 'dist', 'flavor-grenade-lsp');
      const installedBundle = `${installedBinary}.sigstore.json`;
      const provenancePath = path.join(root, 'dist', 'flavor-grenade-lsp.runtime.json');
      expect(readFileSync(installedBinary, 'utf8')).toBe(binaryContent);
      expect(readFileSync(installedBundle, 'utf8')).toBe('{"bundle":true}\n');

      const provenance = JSON.parse(readFileSync(provenancePath, 'utf8'));
      expect(provenance).toMatchObject({
        target: 'linux-x64',
        source: 'github-release',
        repository: 'example/flavor-grenade-lsp',
        releaseTag: 'v1.2.3',
        releaseUrl: 'https://github.com/example/flavor-grenade-lsp/releases/tag/v1.2.3',
        commit: 'abc123',
        asset: binaryName,
        sigstoreBundle: bundleName,
        verified: true,
      });
      expect(provenance.sha256).toBe(sha256(binaryContent));

      const toolLog = readFileSync(path.join(root, 'tool-log.jsonl'), 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      expect(toolLog.map((entry) => entry.command)).toEqual(['gh', 'gh', 'gh', 'cosign']);
      const identity = toolLog[3].args[toolLog[3].args.indexOf('--certificate-identity-regexp') + 1];
      expect(identity).toContain(
        'https://github.com/example/flavor-grenade-lsp/.github/workflows/release.yml@refs/tags/v.*$',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('fails before download when the selected release is missing the signature bundle', () => {
    const root = tempDir('fg-fetch-runtime-missing-signature-');
    try {
      const assets = path.join(root, 'release-assets');
      const tools = path.join(root, 'tools');
      const dist = path.join(root, 'dist');
      mkdirSync(assets, { recursive: true });
      mkdirSync(tools, { recursive: true });
      mkdirSync(dist, { recursive: true });
      writeFileSync(path.join(assets, 'flavor-grenade-lsp-linux-x64'), 'runtime');
      writeFileSync(path.join(dist, 'flavor-grenade-lsp'), 'stale runtime');
      writeFileSync(path.join(dist, 'flavor-grenade-lsp.sigstore.json'), 'stale bundle');
      writeFileSync(path.join(dist, 'flavor-grenade-lsp.runtime.json'), '{"stale":true}');
      writeToolStubs(tools);

      const result = spawnSync(
        process.execPath,
        [scriptPath, '--target', 'linux-x64', '--server-release', 'v1.2.3'],
        {
          cwd: root,
          env: {
            ...process.env,
            PATH: `${tools}${path.delimiter}${process.env.PATH ?? ''}`,
            FG_TEST_RELEASE_ASSETS: assets,
            FG_TEST_TOOL_LOG: path.join(root, 'tool-log.jsonl'),
          },
          encoding: 'utf8',
        },
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('missing required signed runtime asset');
      expect(result.stderr).toContain('flavor-grenade-lsp-linux-x64.sigstore.json');
      expect(readFileSync(path.join(root, 'tool-log.jsonl'), 'utf8').trim().split('\n')).toHaveLength(1);
      expect(existsSync(path.join(dist, 'flavor-grenade-lsp'))).toBe(false);
      expect(existsSync(path.join(dist, 'flavor-grenade-lsp.sigstore.json'))).toBe(false);
      expect(existsSync(path.join(dist, 'flavor-grenade-lsp.runtime.json'))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

function tempDir(prefix) {
  const root = path.join(tmpdir(), `${prefix}${process.pid}-${Date.now()}`);
  mkdirSync(root, { recursive: true });
  return root;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function writeToolStubs(toolsDir) {
  const ghStub = path.join(toolsDir, 'gh-stub.mjs');
  const cosignStub = path.join(toolsDir, 'cosign-stub.mjs');
  writeFileSync(
    ghStub,
    `import { copyFileSync, mkdirSync, appendFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
appendFileSync(process.env.FG_TEST_TOOL_LOG, JSON.stringify({ command: 'gh', args }) + '\\n');
if (args[0] !== 'release') process.exit(2);
if (args[1] === 'view') {
  const tag = args[2]?.startsWith('--') ? 'v9.9.9' : args[2];
  const repo = args[args.indexOf('--repo') + 1];
  const assets = readdirSync(process.env.FG_TEST_RELEASE_ASSETS).map((name) => ({ name }));
  process.stdout.write(JSON.stringify({
    tagName: tag,
    targetCommitish: 'abc123',
    url: \`https://github.com/\${repo}/releases/tag/\${tag}\`,
    assets
  }));
  process.exit(0);
}
if (args[1] === 'download') {
  const pattern = args[args.indexOf('--pattern') + 1];
  const destination = args[args.indexOf('--dir') + 1];
  mkdirSync(destination, { recursive: true });
  copyFileSync(path.join(process.env.FG_TEST_RELEASE_ASSETS, pattern), path.join(destination, pattern));
  process.exit(0);
}
process.exit(2);
`,
  );
  writeFileSync(
    cosignStub,
    `import { appendFileSync, existsSync } from 'node:fs';
const args = process.argv.slice(2);
appendFileSync(process.env.FG_TEST_TOOL_LOG, JSON.stringify({ command: 'cosign', args }) + '\\n');
const bundle = args[args.indexOf('--bundle') + 1];
const identity = args[args.indexOf('--certificate-identity-regexp') + 1];
if (!existsSync(bundle) || !identity.includes('/.github/workflows/release.yml@refs/tags/v.')) process.exit(2);
process.exit(0);
`,
  );

  writeExecutable(path.join(toolsDir, 'gh'), `#!/bin/sh\nexec "${process.execPath}" "${ghStub}" "$@"\n`);
  writeExecutable(path.join(toolsDir, 'cosign'), `#!/bin/sh\nexec "${process.execPath}" "${cosignStub}" "$@"\n`);
  writeFileSync(path.join(toolsDir, 'gh.cmd'), `@echo off\r\n"${process.execPath}" "%~dp0gh-stub.mjs" %*\r\n`);
  writeFileSync(path.join(toolsDir, 'cosign.cmd'), `@echo off\r\n"${process.execPath}" "%~dp0cosign-stub.mjs" %*\r\n`);
}

function writeExecutable(filePath, content) {
  writeFileSync(filePath, content);
  if (process.platform !== 'win32' && existsSync(filePath)) chmodSync(filePath, 0o755);
}
