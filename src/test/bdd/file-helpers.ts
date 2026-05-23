import fs from 'node:fs';
import path from 'node:path';

/**
 * Create a file when it is absent without truncating an existing file.
 */
export function writeFileIfMissing(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    if (!isErrnoException(error) || error.code !== 'EEXIST') {
      throw error;
    }
  }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
