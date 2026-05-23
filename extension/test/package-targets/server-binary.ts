import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SERVER_MODULE = 'extension/server/main.js';
const NATIVE_SERVER_PATTERN = /^extension\/server\/flavor-grenade-lsp(?:\.exe)?$/;

export function validateServerPayloadEntries(options: { entries: string[] }): string[] {
  const normalizedEntries = options.entries.map((entry) => entry.replaceAll('\\', '/'));
  const nativeServers = normalizedEntries.filter((entry) => NATIVE_SERVER_PATTERN.test(entry));
  const serverModules = normalizedEntries.filter((entry) => entry === SERVER_MODULE);
  const errors: string[] = [];

  if (serverModules.length === 0) {
    errors.push(`missing bundled server module: expected ${SERVER_MODULE}`);
  }

  if (serverModules.length > 1) {
    errors.push(`expected exactly one bundled server module; found ${serverModules.length}`);
  }

  if (nativeServers.length > 0) {
    errors.push(
      `native server executables are not Marketplace-safe payloads: ${nativeServers.join(', ')}`,
    );
  }

  return errors;
}

export function validateServerPayloadVsix(options: { vsixPath: string }): string[] {
  return validateServerPayloadEntries({
    entries: readZipEntries(options.vsixPath),
  });
}

export function hasNativeServerEntry(entries: string[]): boolean {
  return entries
    .map((entry) => entry.replaceAll('\\', '/'))
    .some((entry) => NATIVE_SERVER_PATTERN.test(entry));
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
  const errors = validateServerPayloadVsix(options);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  }
}

function parseCliArgs(args: string[]): { vsixPath: string } {
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
  if (!vsixPath) {
    throw new Error('Usage: server-binary.ts --vsix <path>');
  }

  return { vsixPath };
}
