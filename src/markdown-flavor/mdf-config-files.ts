import { Injectable } from '@nestjs/common';
import {
  NodeFlavorConfigResolver,
  type MdfAttributes,
  type FlavorConfigResolution,
} from 'markdown-flavor-detection/node';

export type { MdfAttributes };
export type MdfConfigResolution = FlavorConfigResolution;

@Injectable()
export class MarkdownFlavorConfigFiles {
  private readonly resolver = new NodeFlavorConfigResolver();

  setMaxConfigBytes(value: unknown): void {
    this.resolver.setMaxConfigBytes(value);
  }

  resolveForFile(vaultRoot: string, resourcePath: string): MdfConfigResolution {
    return this.resolver.resolveForFile(vaultRoot, resourcePath);
  }

  shouldPruneDirectory(vaultRoot: string, directoryPath: string): boolean {
    return this.resolver.shouldPruneDirectory(vaultRoot, directoryPath);
  }
}
