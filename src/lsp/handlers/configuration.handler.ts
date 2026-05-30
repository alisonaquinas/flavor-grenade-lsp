import { Injectable, Optional } from '@nestjs/common';
import { dirname } from 'node:path';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { MarkdownFlavorState } from '../../markdown-flavor/markdown-flavor-state.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import { toDocId } from '../../vault/doc-id.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { DiagnosticService } from '../../resolution/diagnostic-service.js';
import {
  FlavorGrenadeConfigFiles,
  type FgConfigResolution,
} from '../../markdown-flavor/fg-config-files.js';
import { DocumentStore } from '../services/document-store.js';
import type { ParseContext } from '../../parser/types.js';
import { InitializedHandler } from './initialized.handler.js';

interface FlavorGrenadeSettings {
  fgConfigMaxBytes?: unknown;
}

@Injectable()
export class ConfigurationHandler {
  constructor(
    private readonly flavorState: MarkdownFlavorState,
    private readonly store: DocumentStore,
    private readonly parser: OFMParser,
    private readonly parseCache: ParseCache,
    private readonly vaultDetector: VaultDetector,
    @Optional() private readonly diagnosticService: DiagnosticService | null = null,
    @Optional() private readonly fgConfigFiles: FlavorGrenadeConfigFiles | null = null,
    @Optional() private readonly initializedHandler: InitializedHandler | null = null,
  ) {}

  async handle(params: unknown): Promise<void> {
    if (hasDangerousPrototypeKey(params)) {
      return;
    }
    const settings = (params as { settings?: { flavorGrenade?: FlavorGrenadeSettings } } | null)
      ?.settings?.flavorGrenade;
    if (!settings) {
      return;
    }
    if (settings.fgConfigMaxBytes !== undefined) {
      this.fgConfigFiles?.setMaxConfigBytes(settings.fgConfigMaxBytes);
    }
    this.refreshOpenDocuments();
    if (settings.fgConfigMaxBytes !== undefined) {
      await this.initializedHandler?.handle({});
    }
  }

  private refreshOpenDocuments(): void {
    for (const doc of this.store.all()) {
      if (doc.languageId !== 'markdown') {
        continue;
      }
      if (this.isIgnored(doc.uri)) {
        this.parseCache.delete(doc.uri);
        this.diagnosticService?.clearDiagnostics(doc.uri);
        continue;
      }
      const parsed = this.parser.parse(doc.uri, doc.getText(), doc.version, {
        ...this.resolveParseContext(doc),
      });
      this.parseCache.set(doc.uri, parsed);
      this.publishDiagnostics(doc.uri, parsed);
    }
  }

  private resolveParseContext(doc: TextDocument): ParseContext {
    const fsPath = SingleFileModeGuard.uriToPath(doc.uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    const fgConfig = this.resolveFgConfig(detection.vaultRoot, fsPath);
    const result = this.flavorState.resolveForDocument({
      uri: doc.uri,
      languageId: doc.languageId,
      hasObsidianMarker: detection.mode === 'obsidian',
      fgAttributesFlavor: fgConfig?.attributes.flavor,
      fgAttributesStructuredProfiles: fgConfig?.attributes.structuredProfiles,
      syntaxText: doc.getText(),
    });
    return result.kind === 'active'
      ? {
          effectiveFlavor: result.effective,
          structuredProfiles: result.structuredProfiles,
        }
      : { effectiveFlavor: 'commonmark', structuredProfiles: [] };
  }

  private publishDiagnostics(uri: string, doc: ReturnType<OFMParser['parse']>): void {
    if (this.diagnosticService === null) {
      return;
    }
    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    if (detection.vaultRoot === null) {
      this.diagnosticService.publishDiagnostics('' as ReturnType<typeof toDocId>, doc, fsPath);
      return;
    }
    this.diagnosticService.publishDiagnostics(
      toDocId(detection.vaultRoot, fsPath),
      doc,
      detection.vaultRoot,
    );
  }

  private isIgnored(uri: string): boolean {
    if (this.fgConfigFiles === null) {
      return false;
    }
    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    return this.resolveFgConfig(detection.vaultRoot, fsPath)?.ignored === true;
  }

  private resolveFgConfig(
    vaultRoot: string | null,
    fsPath: string,
  ): FgConfigResolution | undefined {
    return this.fgConfigFiles?.resolveForFile(vaultRoot ?? dirname(fsPath), fsPath);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasDangerousPrototypeKey(value: unknown): boolean {
  const stack: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  let visited = 0;
  while (stack.length > 0) {
    const current = stack.pop()!;
    visited += 1;
    if (visited > 10_000 || current.depth > 100) {
      return true;
    }
    if (Array.isArray(current.value)) {
      for (const item of current.value) {
        stack.push({ value: item, depth: current.depth + 1 });
      }
      continue;
    }
    if (!isRecord(current.value)) {
      continue;
    }
    for (const key of Object.keys(current.value)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return true;
      }
      stack.push({ value: current.value[key], depth: current.depth + 1 });
    }
  }
  return false;
}
