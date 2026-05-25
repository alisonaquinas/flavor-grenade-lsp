#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const options = parseArgs(process.argv.slice(2));
const root = path.resolve(options.root ?? process.cwd());
const version = normalizeVersion(options.version);
const serverVersion = options.serverVersion;
const serverReleaseTag = options.serverReleaseTag;

const pluginRoot = path.join(root, 'plugins', 'flavorgrenade-lsp');
const skillRoot = path.join(pluginRoot, 'skills', 'flavorgrenade-lsp');

updateJson(path.join(skillRoot, 'manifest.json'), (manifest) => {
  manifest.version = version;
  manifest.server ??= {};
  if (serverVersion !== undefined) manifest.server.version = serverVersion;
  if (serverReleaseTag !== undefined) manifest.server.releaseTag = serverReleaseTag;
  return manifest;
});
updateJson(path.join(skillRoot, 'package.json'), (pkg) => {
  pkg.version = version;
  return pkg;
});
updateJson(path.join(pluginRoot, '.claude-plugin', 'plugin.json'), (plugin) => {
  plugin.version = version;
  return plugin;
});
updateJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'), (plugin) => {
  plugin.version = version;
  return plugin;
});
updateJson(path.join(root, 'marketplace.json'), (marketplace) => {
  for (const skill of marketplace.skills ?? []) {
    if (skill.name === 'flavorgrenade-lsp') skill.version = version;
  }
  return marketplace;
});
updateJson(path.join(root, '.claude-plugin', 'marketplace.json'), (marketplace) => {
  marketplace.version = version;
  for (const plugin of marketplace.plugins ?? []) {
    if (plugin.name === 'flavorgrenade-lsp') plugin.version = version;
  }
  return marketplace;
});

updateCompatibility(path.join(skillRoot, 'docs', 'compatibility.md'), version, serverVersion);
updateJsonSchemaNotes(path.join(skillRoot, 'docs', 'json-schema.md'), version, serverVersion);

process.stdout.write(`${JSON.stringify({ ok: true, version, serverVersion, serverReleaseTag }, null, 2)}\n`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--root') parsed.root = readValue(args, ++index, arg);
    else if (arg.startsWith('--root=')) parsed.root = arg.slice('--root='.length);
    else if (arg === '--server-version') parsed.serverVersion = readValue(args, ++index, arg);
    else if (arg.startsWith('--server-version=')) parsed.serverVersion = arg.slice('--server-version='.length);
    else if (arg === '--server-release-tag') parsed.serverReleaseTag = readValue(args, ++index, arg);
    else if (arg.startsWith('--server-release-tag=')) parsed.serverReleaseTag = arg.slice('--server-release-tag='.length);
    else if (arg === '--help' || arg === '-h') usage();
    else if (parsed.version === undefined) parsed.version = arg;
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (parsed.version === undefined) usage();
  return parsed;
}

function usage() {
  process.stderr.write(
    [
      'Usage: node scripts/set-plugin-version.mjs <version> [--server-version <version>] [--server-release-tag <tag>] [--root <path>]',
      'Version may be X.Y.Z, X.Y.Z-prerelease, skill-vX.Y.Z, or skill-vX.Y.Z-prerelease.',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

function readValue(args, index, option) {
  const value = args[index];
  if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${option}.`);
  return value;
}

function normalizeVersion(value) {
  const normalized = value.replace(/^skill-v/, '').replace(/^v/, '');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(normalized)) {
    throw new Error(`Invalid plugin version: ${value}`);
  }
  return normalized;
}

function updateJson(filePath, updater) {
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  writeFileSync(filePath, `${JSON.stringify(updater(data), null, 2)}\n`);
}

function updateCompatibility(filePath, version, serverVersion) {
  const serverRange = serverVersion === undefined ? null : `${majorMinor(serverVersion)}.x`;
  let content = readFileSync(filePath, 'utf8');
  content = content.replace(
    /\| `[^`]+` \| `[^`]+` \| `1\.0` \| supported \| supported \|/m,
    `| \`${version}\` | \`${serverRange ?? '0.5.x'}\` | \`1.0\` | supported | supported |`,
  );
  content = content.replace(
    /\| `[^`]+` \| Claude prompts, Codex docs \| advisory \| packaged prompts \| optional \| required metadata \|/m,
    `| \`${version}\` | Claude prompts, Codex docs | advisory | packaged prompts | optional | required metadata |`,
  );
  writeFileSync(filePath, content);
}

function updateJsonSchemaNotes(filePath, version, serverVersion) {
  let content = readFileSync(filePath, 'utf8');
  content = content.replace(
    /"skill": \{ "name": "flavorgrenade-lsp-skill", "version": "[^"]+" \}/,
    `"skill": { "name": "flavorgrenade-lsp-skill", "version": "${version}" }`,
  );
  if (serverVersion !== undefined) {
    content = content.replace(
      /"server": \{ "name": "flavor-grenade-lsp", "version": "[^"]+" \}/,
      `"server": { "name": "flavor-grenade-lsp", "version": "${serverVersion}" }`,
    );
  }
  writeFileSync(filePath, content);
}

function majorMinor(version) {
  const match = /^(\d+)\.(\d+)\./.exec(version);
  if (match === null) throw new Error(`Invalid server version: ${version}`);
  return `${match[1]}.${match[2]}`;
}
