import * as fs from 'node:fs';
import {
  DEFAULT_FG_CONFIG_MAX_BYTES,
  resolveFlavorConfigSync,
  shouldPruneDirectoryByFlavorConfigSync,
  type FlavorConfigResolution,
  type SyncFlavorConfigFileReader,
} from './fg-config-resolution.js';

export * from './index.js';

export interface NodeFlavorConfigResolverOptions {
  maxConfigBytes?: number;
}

export class NodeFlavorConfigResolver {
  private maxConfigBytes = DEFAULT_FG_CONFIG_MAX_BYTES;

  constructor(options: NodeFlavorConfigResolverOptions = {}) {
    if (options.maxConfigBytes !== undefined) {
      this.setMaxConfigBytes(options.maxConfigBytes);
    }
  }

  setMaxConfigBytes(value: unknown): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      this.maxConfigBytes = DEFAULT_FG_CONFIG_MAX_BYTES;
      return;
    }
    const normalized = Math.floor(value);
    this.maxConfigBytes = normalized > 0 ? normalized : DEFAULT_FG_CONFIG_MAX_BYTES;
  }

  resolveForFile(root: string, resourcePath: string): FlavorConfigResolution {
    return resolveFlavorConfigSync({
      root,
      path: resourcePath,
      ...nodeFlavorConfigFileReader,
      maxConfigBytes: this.maxConfigBytes,
    });
  }

  shouldPruneDirectory(root: string, directoryPath: string): boolean {
    return shouldPruneDirectoryByFlavorConfigSync({
      root,
      path: directoryPath,
      ...nodeFlavorConfigFileReader,
      maxConfigBytes: this.maxConfigBytes,
    });
  }
}

const nodeFlavorConfigFileReader: SyncFlavorConfigFileReader = {
  stat(filePath) {
    let fd: number | undefined;
    try {
      fd = fs.openSync(filePath, 'r');
      const stat = fs.fstatSync(fd);
      return {
        isFile: () => stat.isFile(),
        size: stat.size,
      };
    } catch {
      return undefined;
    } finally {
      if (fd !== undefined) {
        fs.closeSync(fd);
      }
    }
  },
  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return undefined;
    }
  },
};
