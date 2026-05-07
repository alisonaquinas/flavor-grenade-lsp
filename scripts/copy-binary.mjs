import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import { basename, isAbsolute, join, win32 } from 'node:path';
import process from 'node:process';

const requestedName = process.argv[2];
const binaryName =
  requestedName ?? (process.platform === 'win32' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp');
validateBinaryName(binaryName);

const candidates = [
  join('dist', binaryName),
  join('dist', 'flavor-grenade-lsp.exe'),
  join('dist', 'flavor-grenade-lsp'),
];

const source = candidates.find((candidate) => existsSync(candidate));
if (source === undefined) {
  throw new Error(`No built binary found. Checked: ${candidates.join(', ')}`);
}

const serverDir = join('extension', 'server');
mkdirSync(serverDir, { recursive: true });

const destination = join(serverDir, binaryName);
await copyWithRetry(source, destination);

if (!destination.endsWith('.exe')) {
  chmodSync(destination, 0o755);
}

console.log(`Copied ${source} -> ${destination}`);

async function copyWithRetry(sourcePath, destinationPath) {
  let lastError;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await copyFile(sourcePath, destinationPath);
      return;
    } catch (error) {
      lastError = error;
      if (error?.code !== 'EBUSY' && error?.code !== 'EPERM') {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw lastError;
}

function validateBinaryName(binaryName) {
  if (
    binaryName.length === 0 ||
    binaryName !== basename(binaryName) ||
    isAbsolute(binaryName) ||
    win32.isAbsolute(binaryName) ||
    binaryName.includes('/') ||
    binaryName.includes('\\') ||
    binaryName.includes('\0')
  ) {
    throw new Error(`Invalid binary name: ${binaryName}`);
  }
}
