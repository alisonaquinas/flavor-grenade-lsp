import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { pathToFileURL } from 'url';
import type { Diagnostic, DiagnosticRelatedInformation } from 'vscode-languageserver-types';
import { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import { Oracle } from './oracle.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultDetector } from '../vault/vault-detector.js';
import type { OFMDoc, WikiLinkEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { fromDocId } from '../vault/doc-id.js';

/**
 * Publishes `textDocument/publishDiagnostics` notifications for wiki-link
 * errors (FG001, FG002, FG003) in the current document.
 */
@Injectable()
export class DiagnosticService {
  constructor(
    private readonly dispatcher: JsonRpcDispatcher,
    private readonly oracle: Oracle,
    private readonly parseCache: ParseCache,
    private readonly vaultDetector: VaultDetector,
  ) {}

  /**
   * Compute and publish LSP diagnostics for a document.
   *
   * In single-file mode, publishes an empty diagnostics list and returns.
   *
   * @param docId     - Vault-relative document id.
   * @param doc       - Parsed OFM document.
   * @param vaultRoot - Absolute path to vault root.
   */
  publishDiagnostics(docId: DocId, doc: OFMDoc, vaultRoot: string): void {
    const detection = this.vaultDetector.detect(vaultRoot);
    const diagnostics =
      detection.mode === 'single-file'
        ? []
        : this.buildDiagnostics(doc, vaultRoot);

    this.dispatcher.sendNotification('textDocument/publishDiagnostics', {
      uri: doc.uri,
      diagnostics,
    });
  }

  private buildDiagnostics(doc: OFMDoc, vaultRoot: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const entry of doc.index.wikiLinks) {
      const diag = this.diagnoseEntry(entry, vaultRoot);
      if (diag !== null) diagnostics.push(diag);
    }
    return diagnostics;
  }

  private diagnoseEntry(entry: WikiLinkEntry, vaultRoot: string): Diagnostic | null {
    const result = this.oracle.resolve(entry.target, entry.heading, entry.blockRef);

    if (result.kind === 'resolved') return null;

    if (result.kind === 'broken') {
      return {
        range: entry.range,
        severity: 1,
        code: 'FG001',
        source: 'flavor-grenade',
        message: `Broken wiki-link: [[${entry.target}]] not found in vault`,
      };
    }

    if (result.kind === 'ambiguous') {
      const related = this.buildRelated(result.candidates, vaultRoot);
      return {
        range: entry.range,
        severity: 1,
        code: 'FG002',
        source: 'flavor-grenade',
        message: `Ambiguous wiki-link: [[${entry.target}]] matches ${result.candidates.length} documents`,
        relatedInformation: related,
      };
    }

    // malformed
    return {
      range: entry.range,
      severity: 1,
      code: 'FG003',
      source: 'flavor-grenade',
      message: `Malformed wiki-link: empty or blank target`,
    };
  }

  private buildRelated(
    candidates: DocId[],
    vaultRoot: string,
  ): DiagnosticRelatedInformation[] {
    return candidates.map((c) => ({
      location: {
        uri: pathToFileURL(fromDocId(vaultRoot, c)).toString(),
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      },
      message: c,
    }));
  }
}
