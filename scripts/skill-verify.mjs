#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const skillRoot = path.resolve(
  valueAfter('--skill-root') ??
    path.join(ROOT, 'plugins', 'flavorgrenade-lsp', 'skills', 'flavorgrenade-lsp'),
);
const manifestPath = path.join(skillRoot, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const executable = path.resolve(skillRoot, manifest.runtime.executable);
const sigstoreBundle = manifest.runtime.sigstoreBundle
  ? path.resolve(skillRoot, manifest.runtime.sigstoreBundle)
  : null;
const allowMissingRuntime = process.argv.includes('--allow-missing-runtime') || process.argv.includes('--dry-run');
const errors = [];

if (manifest.name !== 'flavorgrenade-lsp-skill') errors.push('manifest name mismatch');
if (manifest.installName !== 'flavorgrenade-lsp') errors.push('manifest installName mismatch');
if (manifest.version !== readPackageVersion(skillRoot)) errors.push('package and manifest versions differ');
if (!existsSync(path.join(skillRoot, 'SKILL.md'))) errors.push('missing SKILL.md');
if (!existsSync(path.join(skillRoot, manifest.commands.main))) errors.push('missing wrapper command');
if (!existsSync(executable) && !allowMissingRuntime) errors.push('missing runtime executable');
if (!manifest.runtime.sha256 && existsSync(executable)) errors.push('runtime digest missing');
if (manifest.runtime.sigstoreBundle && existsSync(executable) && !existsSync(sigstoreBundle)) {
  errors.push('missing runtime Sigstore bundle');
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write(`${JSON.stringify({ ok: true, skillRoot, runtimePresent: existsSync(executable) }, null, 2)}\n`);

function valueAfter(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function readPackageVersion(root) {
  const packagePath = path.join(root, 'package.json');
  if (!existsSync(packagePath)) return undefined;
  return JSON.parse(readFileSync(packagePath, 'utf8')).version;
}
