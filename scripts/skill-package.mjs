#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKILL_NAME = 'flavorgrenade-lsp';
const SOURCE_SKILL = path.join(ROOT, 'skills', SKILL_NAME);
const SOURCE_PLUGIN = path.join(ROOT, 'plugins', SKILL_NAME);
const OUT_ROOT = path.join(ROOT, 'build', 'skill-artifacts');
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const target = valueAfter('--target') ?? currentTarget();

const manifest = JSON.parse(readFileSync(path.join(SOURCE_SKILL, 'manifest.json'), 'utf8'));
const executableName = target === 'win-x64' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp';
const distExecutable = path.join(ROOT, 'dist', executableName);
const packageRoot = path.join(OUT_ROOT, `${SKILL_NAME}-skill-v${manifest.version}-${target}`);
const skillOut = path.join(packageRoot, 'skills', SKILL_NAME);
const pluginOut = path.join(packageRoot, 'plugins', SKILL_NAME);

rmSync(packageRoot, { recursive: true, force: true });
mkdirSync(skillOut, { recursive: true });
copyTree(SOURCE_SKILL, skillOut);
copyTree(SOURCE_PLUGIN, pluginOut);
rmSync(path.join(pluginOut, 'skills', SKILL_NAME), { recursive: true, force: true });
mkdirSync(path.join(pluginOut, 'skills'), { recursive: true });
copyTree(skillOut, path.join(pluginOut, 'skills', SKILL_NAME));

const runtimeDir = path.join(skillOut, 'bin', target);
mkdirSync(runtimeDir, { recursive: true });
const runtimePath = path.join(runtimeDir, executableName);
let runtimeAvailable = false;
let sha256 = '';
if (existsSync(distExecutable)) {
  copyFileSync(distExecutable, runtimePath);
  sha256 = sha256File(runtimePath);
  runtimeAvailable = true;
}

const packagedManifest = {
  ...manifest,
  runtime: {
    target,
    executable: `bin/${target}/${executableName}`,
    sha256,
    sigstoreBundle: `bin/${target}/${executableName}.sigstore.json`,
  },
};
writeFileSync(path.join(skillOut, 'manifest.json'), `${JSON.stringify(packagedManifest, null, 2)}\n`);
writeFileSync(
  path.join(packageRoot, 'package-report.json'),
  `${JSON.stringify(
    {
      dryRun,
      target,
      packageRoot: path.relative(ROOT, packageRoot).replace(/\\/g, '/'),
      runtimeAvailable,
      runtimeSource: existsSync(distExecutable)
        ? path.relative(ROOT, distExecutable).replace(/\\/g, '/')
        : null,
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
