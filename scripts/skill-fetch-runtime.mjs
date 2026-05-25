#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const options = parseArgs(process.argv.slice(2));
const target = options.target ?? currentTarget();
const supportedTargets = new Set(['linux-x64', 'darwin-arm64', 'darwin-x64', 'win-x64']);
if (!supportedTargets.has(target)) throw new Error(`Unsupported runtime target: ${target}`);

const repo = options.repo ?? process.env.GITHUB_REPOSITORY ?? 'alisonaquinas/flavor-grenade-lsp';
const release = options.serverRelease ?? 'latest';
const binaryAsset = target === 'win-x64'
  ? `flavor-grenade-lsp-${target}.exe`
  : `flavor-grenade-lsp-${target}`;
const bundleAsset = `${binaryAsset}.sigstore.json`;
const localBinary = target === 'win-x64' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp';
const downloadDir = path.join(ROOT, 'build', 'server-runtime', target);

rmSync(downloadDir, { recursive: true, force: true });
mkdirSync(downloadDir, { recursive: true });
mkdirSync(path.join(ROOT, 'dist'), { recursive: true });

const metadata = releaseMetadata(repo, release);
downloadReleaseAsset(repo, metadata.tagName, binaryAsset, downloadDir);
downloadReleaseAsset(repo, metadata.tagName, bundleAsset, downloadDir);

const downloadedBinary = path.join(downloadDir, binaryAsset);
const downloadedBundle = path.join(downloadDir, bundleAsset);
if (!existsSync(downloadedBinary)) throw new Error(`Downloaded binary missing: ${binaryAsset}`);
if (!existsSync(downloadedBundle)) throw new Error(`Downloaded Sigstore bundle missing: ${bundleAsset}`);

verifySignature(downloadedBinary, downloadedBundle, repo);

const distBinary = path.join(ROOT, 'dist', localBinary);
const distBundle = `${distBinary}.sigstore.json`;
copyFileSync(downloadedBinary, distBinary);
copyFileSync(downloadedBundle, distBundle);

const provenance = {
  target,
  source: 'github-release',
  repository: repo,
  releaseTag: metadata.tagName,
  releaseUrl: metadata.url,
  commit: metadata.targetCommitish,
  asset: binaryAsset,
  sigstoreBundle: bundleAsset,
  sha256: sha256File(distBinary),
  verified: true,
};
writeFileSync(path.join(ROOT, 'dist', `${localBinary}.runtime.json`), `${JSON.stringify(provenance, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(provenance, null, 2)}\n`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--target') parsed.target = readValue(args, ++index, arg);
    else if (arg.startsWith('--target=')) parsed.target = arg.slice('--target='.length);
    else if (arg === '--server-release') parsed.serverRelease = readValue(args, ++index, arg);
    else if (arg.startsWith('--server-release=')) parsed.serverRelease = arg.slice('--server-release='.length);
    else if (arg === '--repo') parsed.repo = readValue(args, ++index, arg);
    else if (arg.startsWith('--repo=')) parsed.repo = arg.slice('--repo='.length);
    else throw new Error(`Unknown option: ${arg}`);
  }
  return parsed;
}

function readValue(args, index, option) {
  const value = args[index];
  if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${option}.`);
  return value;
}

function releaseMetadata(repo, release) {
  const args = ['release', 'view'];
  if (release !== 'latest') args.push(release);
  args.push('--repo', repo, '--json', 'tagName,targetCommitish,url');
  return JSON.parse(run('gh', args, { encoding: 'utf8' }).stdout);
}

function downloadReleaseAsset(repo, tag, pattern, destination) {
  run('gh', ['release', 'download', tag, '--repo', repo, '--pattern', pattern, '--dir', destination, '--clobber']);
}

function verifySignature(binary, bundle, repo) {
  run('cosign', [
    'verify-blob',
    binary,
    '--bundle',
    bundle,
    '--certificate-identity-regexp',
    `^https://github.com/${repo}/.github/workflows/release.yml@refs/tags/v.*$`,
    '--certificate-oidc-issuer',
    'https://token.actions.githubusercontent.com',
  ]);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: options.encoding,
    stdio: options.encoding === undefined ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  if (result.error !== undefined) throw result.error;
  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr}` : '';
    throw new Error(`${command} ${args.join(' ')} failed with ${result.status}.${stderr}`);
  }
  return result;
}

function currentTarget() {
  if (process.platform === 'win32' && process.arch === 'x64') return 'win-x64';
  if (process.platform === 'linux' && process.arch === 'x64') return 'linux-x64';
  if (process.platform === 'darwin' && process.arch === 'arm64') return 'darwin-arm64';
  if (process.platform === 'darwin' && process.arch === 'x64') return 'darwin-x64';
  throw new Error(`Unsupported runtime ${process.platform}-${process.arch}.`);
}

function sha256File(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}
