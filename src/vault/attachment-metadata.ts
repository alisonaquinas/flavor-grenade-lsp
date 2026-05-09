import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import type { AttachmentEntry, AttachmentKind } from './vault-index.js';

type ImageDimensions = { width: number; height: number };

export async function buildAttachmentEntry(
  filePath: string,
  relPath: string,
  stat?: fs.Stats,
): Promise<AttachmentEntry> {
  const fileStat = stat ?? (await fs.promises.stat(filePath));
  const extension = attachmentExtension(relPath);
  const dimensions = await readImageDimensions(filePath, extension);

  return {
    path: relPath,
    uri: pathToFileURL(filePath).toString(),
    extension,
    kind: attachmentKind(extension),
    sizeBytes: fileStat.size,
    ...(dimensions !== undefined ? { dimensions } : {}),
  };
}

export function attachmentExtension(relPath: string): string {
  const ext = path.extname(relPath).toLowerCase();
  return ext.startsWith('.') ? ext.slice(1) : ext;
}

export function attachmentKind(extension: string): AttachmentKind {
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
    return 'image';
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) {
    return 'audio';
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension)) {
    return 'video';
  }
  if (extension === 'pdf') {
    return 'pdf';
  }
  return 'file';
}

async function readImageDimensions(
  filePath: string,
  extension: string,
): Promise<ImageDimensions | undefined> {
  try {
    if (extension === 'png') {
      return await readPngDimensions(filePath);
    }
    if (extension === 'gif') {
      return await readGifDimensions(filePath);
    }
    if (extension === 'jpg' || extension === 'jpeg') {
      return await readJpegDimensions(filePath);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

async function readPngDimensions(filePath: string): Promise<ImageDimensions | undefined> {
  const buffer = await readFilePrefix(filePath, 24);
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = signature.every((byte, index) => buffer[index] === byte);
  if (!isPng || buffer.toString('ascii', 12, 16) !== 'IHDR') {
    return undefined;
  }

  return positiveDimensions(buffer.readUInt32BE(16), buffer.readUInt32BE(20));
}

async function readGifDimensions(filePath: string): Promise<ImageDimensions | undefined> {
  const buffer = await readFilePrefix(filePath, 10);
  const signature = buffer.toString('ascii', 0, 6);
  if (signature !== 'GIF87a' && signature !== 'GIF89a') {
    return undefined;
  }

  return positiveDimensions(buffer.readUInt16LE(6), buffer.readUInt16LE(8));
}

async function readJpegDimensions(filePath: string): Promise<ImageDimensions | undefined> {
  const buffer = await readFilePrefix(filePath, 64 * 1024);
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;
  while (offset + 3 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (buffer[offset] === 0xff) {
      offset += 1;
    }

    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) {
      return undefined;
    }
    if (offset + 1 >= buffer.length) {
      return undefined;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
      return undefined;
    }

    if (isJpegStartOfFrame(marker)) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return positiveDimensions(width, height);
    }

    offset += segmentLength;
  }

  return undefined;
}

async function readFilePrefix(filePath: string, length: number): Promise<Buffer> {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buffer, 0, length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

function isJpegStartOfFrame(marker: number): boolean {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function positiveDimensions(width: number, height: number): ImageDimensions | undefined {
  if (width <= 0 || height <= 0) {
    return undefined;
  }
  return { width, height };
}
