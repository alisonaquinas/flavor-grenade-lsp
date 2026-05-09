import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export type VsixTarget =
  | 'alpine-x64'
  | 'darwin-arm64'
  | 'darwin-x64'
  | 'linux-arm64'
  | 'linux-x64'
  | 'win32-arm64'
  | 'win32-x64';

export const VSIX_TARGETS: readonly VsixTarget[] = [
  'alpine-x64',
  'darwin-arm64',
  'darwin-x64',
  'linux-arm64',
  'linux-x64',
  'win32-arm64',
  'win32-x64',
];

const SERVER_BINARY_PATTERN = /^extension\/server\/flavor-grenade-lsp(?:\.exe)?$/;

export function expectedServerBinaryForTarget(target: VsixTarget): string {
  return target.startsWith('win32')
    ? 'extension/server/flavor-grenade-lsp.exe'
    : 'extension/server/flavor-grenade-lsp';
}

export function validateServerBinaryEntries(options: {
  entries: string[];
  target: VsixTarget;
}): string[] {
  const serverBinaries = options.entries
    .map((entry) => entry.replaceAll('\\', '/'))
    .filter((entry) => SERVER_BINARY_PATTERN.test(entry));
  const expected = expectedServerBinaryForTarget(options.target);
  const errors: string[] = [];

  if (serverBinaries.length === 0) {
    errors.push(`missing server binary for ${options.target}: expected ${expected}`);
    return errors;
  }

  if (serverBinaries.length !== 1) {
    errors.push(
      `expected exactly one server binary for ${options.target}; found ${serverBinaries.length}`,
    );
  }

  if (!serverBinaries.includes(expected)) {
    errors.push(`wrong target server binary for ${options.target}: expected ${expected}`);
  }

  return errors;
}

export function validateServerBinaryVsix(options: {
  target: VsixTarget;
  vsixPath: string;
}): string[] {
  return validateServerBinaryEntries({
    entries: readZipEntries(options.vsixPath),
    target: options.target,
  });
}

export function readZipEntries(zipPath: string): string[] {
  const archive = readFileSync(zipPath);
  const endOfCentralDirectory = findEndOfCentralDirectory(archive);
  const centralDirectorySize = archive.readUInt32LE(endOfCentralDirectory + 12);
  const centralDirectoryOffset = archive.readUInt32LE(endOfCentralDirectory + 16);
  const endOffset = centralDirectoryOffset + centralDirectorySize;
  const entries: string[] = [];

  let offset = centralDirectoryOffset;
  while (offset < endOffset) {
    assert.equal(archive.readUInt32LE(offset), 0x02014b50, 'invalid ZIP central directory');

    const fileNameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const fileNameStart = offset + 46;
    const fileNameEnd = fileNameStart + fileNameLength;

    entries.push(archive.toString('utf8', fileNameStart, fileNameEnd).replaceAll('\\', '/'));
    offset = fileNameEnd + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(archive: Buffer): number {
  for (let offset = archive.length - 22; offset >= 0; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error('ZIP end of central directory not found');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseCliArgs(process.argv.slice(2));
  const errors = validateServerBinaryVsix(options);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  }
}

function parseCliArgs(args: string[]): { target: VsixTarget; vsixPath: string } {
  const options = new Map<string, string>();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith('--') && arg.includes('=')) {
      const equalsAt = arg.indexOf('=');
      options.set(arg.slice(2, equalsAt), arg.slice(equalsAt + 1));
      continue;
    }
    if (arg.startsWith('--')) {
      options.set(arg.slice(2), args[index + 1] ?? '');
      index += 1;
    }
  }

  const vsixPath = options.get('vsix');
  const target = options.get('target');
  if (!vsixPath || !target) {
    throw new Error('Usage: server-binary.ts --vsix <path> --target <vsix-target>');
  }
  if (!VSIX_TARGETS.includes(target as VsixTarget)) {
    throw new Error(`Unsupported VSIX target: ${target}`);
  }

  return { target: target as VsixTarget, vsixPath };
}
