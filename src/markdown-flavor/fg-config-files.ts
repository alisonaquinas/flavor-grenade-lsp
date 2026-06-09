import { Injectable } from '@nestjs/common';
import {
  NodeFlavorConfigResolver,
  type FgAttributes,
  type FlavorConfigResolution,
} from '@flavor-grenade/markdown-flavor/node';

export type { FgAttributes };
export type FgConfigResolution = FlavorConfigResolution;

@Injectable()
export class FlavorGrenadeConfigFiles {
  private readonly resolver = new NodeFlavorConfigResolver();

  setMaxConfigBytes(value: unknown): void {
    this.resolver.setMaxConfigBytes(value);
  }

  resolveForFile(vaultRoot: string, resourcePath: string): FgConfigResolution {
    return this.resolver.resolveForFile(vaultRoot, resourcePath);
  }

  shouldPruneDirectory(vaultRoot: string, directoryPath: string): boolean {
    return this.resolver.shouldPruneDirectory(vaultRoot, directoryPath);
  }
}
