#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKILL_NAME = 'flavorgrenade-lsp';
const SOURCE_PLUGIN = path.join(ROOT, 'plugins', SKILL_NAME);
const SOURCE_SKILL = path.join(SOURCE_PLUGIN, 'skills', SKILL_NAME);
const OUT_ROOT = path.join(ROOT, 'build', 'skill-artifacts');
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const requireSignedRuntime = args.has('--require-signed-runtime');
const target = valueAfter('--target') ?? currentTarget();

const manifest = JSON.parse(readFileSync(path.join(SOURCE_SKILL, 'manifest.json'), 'utf8'));
const executableName = target === 'win-x64' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp';
const distExecutable = path.join(ROOT, 'dist', executableName);
const runtimeProvenance = readRuntimeProvenance(path.join(ROOT, 'dist', `${executableName}.runtime.json`));
const sourceBundle = `${distExecutable}.sigstore.json`;
const packageRoot = path.join(OUT_ROOT, `${SKILL_NAME}-skill-v${manifest.version}-${target}`);
const skillOut = path.join(packageRoot, 'skills', SKILL_NAME);
const pluginOut = path.join(packageRoot, 'plugins', SKILL_NAME);

rmSync(packageRoot, { recursive: true, force: true });
mkdirSync(skillOut, { recursive: true });
copyTree(SOURCE_SKILL, skillOut);
copyTree(SOURCE_PLUGIN, pluginOut);
copyFileSync(path.join(ROOT, 'marketplace.json'), path.join(packageRoot, 'marketplace.json'));
copyTree(path.join(ROOT, '.claude-plugin'), path.join(packageRoot, '.claude-plugin'));
copyTree(path.join(ROOT, '.agents'), path.join(packageRoot, '.agents'));
rmSync(path.join(pluginOut, 'skills', SKILL_NAME), { recursive: true, force: true });
mkdirSync(path.join(pluginOut, 'skills'), { recursive: true });
copyTree(skillOut, path.join(pluginOut, 'skills', SKILL_NAME));

const runtimeDir = path.join(skillOut, 'bin', target);
mkdirSync(runtimeDir, { recursive: true });
const runtimePath = path.join(runtimeDir, executableName);
let runtimeAvailable = false;
let sha256 = '';
if (existsSync(distExecutable)) {
  validateSignedRuntime({ distExecutable, sourceBundle, runtimeProvenance, target, requireSignedRuntime });
  copyFileSync(distExecutable, runtimePath);
  if (existsSync(sourceBundle)) {
    copyFileSync(sourceBundle, `${runtimePath}.sigstore.json`);
  }
  sha256 = sha256File(runtimePath);
  runtimeAvailable = true;
} else if (requireSignedRuntime) {
  throw new Error(`Missing signed runtime executable: ${path.relative(ROOT, distExecutable).replace(/\\/g, '/')}`);
}

const packagedManifest = {
  ...manifest,
  server: {
    ...manifest.server,
    commit: runtimeProvenance?.commit ?? gitValue(['rev-parse', 'HEAD']) ?? manifest.server?.commit ?? '',
    releaseTag: runtimeProvenance?.releaseTag ?? manifest.server?.releaseTag,
    version: runtimeProvenance?.releaseTag
      ? runtimeProvenance.releaseTag.replace(/^v/, '')
      : manifest.server?.version,
  },
  runtime: {
    target,
    executable: `bin/${target}/${executableName}`,
    sha256,
    sigstoreBundle: `bin/${target}/${executableName}.sigstore.json`,
    signature: {
      oidcIssuer: 'https://token.actions.githubusercontent.com',
      certificateIdentityRegexp:
        runtimeProvenance?.source === 'github-release'
          ? `^https://github.com/${escapeRegex(runtimeProvenance.repository ?? 'alisonaquinas/flavor-grenade-lsp')}/\\.github/workflows/release\\.yml@refs/tags/v.*$`
          : '^https://github.com/alisonaquinas/flavor-grenade-lsp/.github/workflows/skill-release.yml@refs/tags/skill-v.*',
    },
  },
};
writeFileSync(path.join(skillOut, 'manifest.json'), `${JSON.stringify(packagedManifest, null, 2)}\n`);
copyFileSync(path.join(SOURCE_PLUGIN, 'CHANGELOG.md'), path.join(skillOut, 'CHANGELOG.md'));
rmSync(path.join(pluginOut, 'skills', SKILL_NAME), { recursive: true, force: true });
mkdirSync(path.join(pluginOut, 'skills'), { recursive: true });
copyTree(skillOut, path.join(pluginOut, 'skills', SKILL_NAME));
writeFileSync(
  path.join(packageRoot, 'package-report.json'),
  `${JSON.stringify(
    {
      dryRun,
      requireSignedRuntime,
      target,
      packageRoot: path.relative(ROOT, packageRoot).replace(/\\/g, '/'),
      runtimeAvailable,
      runtimeSource: existsSync(distExecutable)
        ? path.relative(ROOT, distExecutable).replace(/\\/g, '/')
        : null,
      runtimeProvenance,
      sha256,
    },
    null,
    2,
  )}\n`,
);

process.stdout.write(`${path.relative(ROOT, packageRoot).replace(/\\/g, '/')}\n`);

function valueAfter(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function currentTarget() {
  if (process.platform === 'win32' && process.arch === 'x64') return 'win-x64';
  if (process.platform === 'linux' && process.arch === 'x64') return 'linux-x64';
  if (process.platform === 'darwin' && process.arch === 'x64') return 'darwin-x64';
  if (process.platform === 'darwin' && process.arch === 'arm64') return 'darwin-arm64';
  throw new Error(`Unsupported runtime ${process.platform}-${process.arch}.`);
}

function copyTree(source, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) copyFileSync(from, to);
  }
}

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function gitValue(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function readRuntimeProvenance(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function validateSignedRuntime({ distExecutable, sourceBundle, runtimeProvenance, target, requireSignedRuntime }) {
  if (!requireSignedRuntime) return;
  if (!existsSync(sourceBundle)) {
    throw new Error(`Missing signed runtime Sigstore bundle: ${path.relative(ROOT, sourceBundle).replace(/\\/g, '/')}`);
  }
  if (runtimeProvenance === null) {
    throw new Error('Missing signed runtime provenance file.');
  }
  if (runtimeProvenance.source !== 'github-release' || runtimeProvenance.verified !== true) {
    throw new Error('Runtime provenance does not describe a verified GitHub release artifact.');
  }
  if (runtimeProvenance.target !== target) {
    throw new Error(`Runtime provenance target ${runtimeProvenance.target} does not match package target ${target}.`);
  }
  const actualSha256 = sha256File(distExecutable);
  if (runtimeProvenance.sha256 !== actualSha256) {
    throw new Error('Runtime provenance digest does not match executable.');
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
