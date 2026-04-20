import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import { pathToFileURL } from 'url';
import type { Diagnostic, DiagnosticRelatedInformation } from 'vscode-languageserver-types';
import { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import { Oracle } from './oracle.js';
import { EmbedResolver } from './embed-resolver.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultDetector } from '../vault/vault-detector.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { OFMDoc, WikiLinkEntry, EmbedEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { fromDocId } from '../vault/doc-id.js';

/**
 * Publishes `textDocument/publishDiagnostics` notifications for all
 * flavor-grenade diagnostic codes in the current document:
 *
 * - **FG001** broken wiki-link or unresolved heading target
 * - **FG002** ambiguous wiki-link (multiple candidates)
 * - **FG003** malformed wiki-link (empty/blank target)
 * - **FG004** broken embed (`![[…]]` not found or sub-target missing)
 * - **FG005** broken block reference (`[[…#^id]]` anchor not found)
 * - **FG006** non-breaking space (U+00A0) in the document body
 * - **FG007** malformed YAML frontmatter
 */
@Injectable()
export class DiagnosticService {
  constructor(
    private readonly dispatcher: JsonRpcDispatcher,
    private readonly oracle: Oracle,
    private readonly embedResolver: EmbedResolver,
    private readonly parseCache: ParseCache,
    private readonly vaultDetector: VaultDetector,
    @Optional() private readonly vaultIndex?: VaultIndex,
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
      detection.mode === 'single-file' ? [] : this.buildDiagnostics(docId, doc, vaultRoot);

    this.dispatcher.sendNotification('textDocument/publishDiagnostics', {
      uri: doc.uri,
      diagnostics,
    });
  }

  private buildDiagnostics(docId: DocId, doc: OFMDoc, vaultRoot: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // FG007: malformed YAML frontmatter
    if (doc.frontmatterParseError) {
      diagnostics.push({
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
        severity: 2, // Warning
        code: 'FG007',
        source: 'flavor-grenade',
        message: 'Malformed YAML frontmatter: could not be parsed',
      });
    }

    for (const entry of doc.index.wikiLinks) {
      const diag = this.diagnoseEntry(docId, entry, vaultRoot);
      if (diag !== null) diagnostics.push(diag);
    }
    for (const entry of doc.index.embeds) {
      const diag = this.diagnoseEmbedEntry(entry);
      if (diag !== null) diagnostics.push(diag);
    }
    // FG006: non-breaking space (U+00A0) in document body
    const nbspDiags = this.diagnoseNbsp(doc);
    diagnostics.push(...nbspDiags);
    return diagnostics;
  }

  /**
   * Detect U+00A0 (non-breaking space) characters in the document body.
   *
   * Only characters at or after `doc.frontmatterEndOffset` are scanned.
   * Each NBSP found produces an FG006 Warning diagnostic.
   */
  private diagnoseNbsp(doc: OFMDoc): Diagnostic[] {
    const text = doc.text;
    if (!text) return [];

    const diagnostics: Diagnostic[] = [];
    const bodyStart = doc.frontmatterEndOffset;

    // Build a line/character index for offset → position conversion
    // We do it lazily by scanning once
    const lines = text.split('\n');
    let offset = 0;
    const lineStartOffsets: number[] = [];
    for (const line of lines) {
      lineStartOffsets.push(offset);
      offset += line.length + 1; // +1 for the \n
    }

    for (let i = bodyStart; i < text.length; i++) {
      if (text[i] === '\u00A0') {
        // Find line/character for this offset
        const pos = this.offsetToPosition(i, lineStartOffsets);
        diagnostics.push({
          range: {
            start: pos,
            end: { line: pos.line, character: pos.character + 1 },
          },
          severity: 2,
          code: 'FG006',
          source: 'flavor-grenade',
          message: 'non-breaking whitespace (U+00A0) found — replace with a regular space',
        });
      }
    }

    return diagnostics;
  }

  private offsetToPosition(
    offset: number,
    lineStartOffsets: number[],
  ): { line: number; character: number } {
    let lo = 0;
    let hi = lineStartOffsets.length - 1;

    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      if (lineStartOffsets[mid] <= offset) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }

    return { line: lo, character: offset - lineStartOffsets[lo] };
  }

  private diagnoseEntry(docId: DocId, entry: WikiLinkEntry, vaultRoot: string): Diagnostic | null {
    // Block ref entries: check FG005 first (before checking doc resolution)
    if (entry.blockRef !== undefined) {
      return this.diagnoseBlockRefEntry(docId, entry, vaultRoot);
    }

    const result = this.oracle.resolve(entry.target, entry.heading);

    if (result.kind === 'resolved') {
      // Validate heading sub-target when present
      if (result.headingTarget !== undefined && this.vaultIndex !== undefined) {
        const targetDoc = this.vaultIndex.get(result.targetDocId);
        if (targetDoc !== undefined) {
          const headingFound = targetDoc.index.headings.some(
            (h) => h.text === result.headingTarget,
          );
          if (!headingFound) {
            return {
              range: entry.range,
              severity: 1,
              code: 'FG001',
              source: 'flavor-grenade',
              message: `Cannot resolve wiki-link: heading '${result.headingTarget}' not found in '${entry.target}'`,
            };
          }
        }
      }
      return null;
    }

    if (result.kind === 'broken') {
      return {
        range: entry.range,
        severity: 1,
        code: 'FG001',
        source: 'flavor-grenade',
        message: `Cannot resolve wiki-link: '${entry.target}' not found in vault`,
      };
    }

    if (result.kind === 'ambiguous') {
      const related = this.buildRelated(result.candidates, vaultRoot);
      return {
        range: entry.range,
        severity: 1,
        code: 'FG002',
        source: 'flavor-grenade',
        message: `Ambiguous wiki-link: '${entry.target}' matches ${result.candidates.length} documents`,
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

  private diagnoseBlockRefEntry(
    docId: DocId,
    entry: WikiLinkEntry,
    vaultRoot: string,
  ): Diagnostic | null {
    const anchorId = entry.blockRef!;

    if (entry.target === '') {
      // Intra-document block ref [[#^id]] — always check anchor
      const sourceDoc = this.vaultIndex?.get(docId);
      const found = sourceDoc?.index.blockAnchors.some((a) => a.id === anchorId) ?? false;
      if (!found) {
        return {
          range: entry.range,
          severity: 1,
          code: 'FG005',
          source: 'flavor-grenade',
          message: `Cannot resolve block reference: '^${anchorId}' not found`,
        };
      }
      return null;
    }

    // Cross-document block ref [[target#^id]]
    // First check the target doc resolves
    const result = this.oracle.resolve(entry.target);
    if (result.kind !== 'resolved') {
      // Target doc doesn't exist — emit FG001
      if (result.kind === 'broken') {
        return {
          range: entry.range,
          severity: 1,
          code: 'FG001',
          source: 'flavor-grenade',
          message: `Cannot resolve wiki-link: '${entry.target}' not found in vault`,
        };
      }
      if (result.kind === 'ambiguous') {
        const related = this.buildRelated(result.candidates, vaultRoot);
        return {
          range: entry.range,
          severity: 1,
          code: 'FG002',
          source: 'flavor-grenade',
          message: `Ambiguous wiki-link: '${entry.target}' matches ${result.candidates.length} documents`,
          relatedInformation: related,
        };
      }
      return {
        range: entry.range,
        severity: 1,
        code: 'FG003',
        source: 'flavor-grenade',
        message: `Malformed wiki-link: empty or blank target`,
      };
    }

    // Target doc resolves — check the anchor
    const targetDoc = this.vaultIndex?.get(result.targetDocId);
    const found = targetDoc?.index.blockAnchors.some((a) => a.id === anchorId) ?? false;
    if (!found) {
      return {
        range: entry.range,
        severity: 1,
        code: 'FG005',
        source: 'flavor-grenade',
        message: `Cannot resolve block reference: '^${anchorId}' not found`,
      };
    }
    return null;
  }

  private diagnoseEmbedEntry(entry: EmbedEntry): Diagnostic | null {
    const resolution = this.embedResolver.resolve(entry);

    if (resolution.kind === 'malformed-fragment') {
      // ![[doc#]] — empty fragment after # (issue #9)
      return {
        range: entry.range,
        severity: 2, // Warning
        code: 'FG004',
        source: 'flavor-grenade',
        message: `Malformed embed: empty heading or block-ref fragment in '${entry.target}'`,
      };
    }

    if (resolution.kind === 'ambiguous-asset') {
      // Shortest-path lookup matched multiple assets — consistent with FG002 (issue #7)
      return {
        range: entry.range,
        severity: 1, // Error
        code: 'FG002',
        source: 'flavor-grenade',
        message: `Ambiguous embed: '${entry.target}' matches ${resolution.candidates.length} assets`,
      };
    }

    if (resolution.kind === 'broken') {
      return {
        range: entry.range,
        severity: 2, // Warning
        code: 'FG004',
        source: 'flavor-grenade',
        message: `Cannot resolve embed: '${entry.target}' not found`,
      };
    }

    // For markdown embeds, validate heading/block-anchor sub-targets if present
    if (resolution.kind === 'markdown' && this.vaultIndex !== undefined) {
      const targetDoc = this.vaultIndex.get(resolution.targetDocId);
      if (targetDoc !== undefined) {
        if (resolution.headingTarget !== undefined) {
          const headingFound = targetDoc.index.headings.some(
            (h) => h.text === resolution.headingTarget,
          );
          if (!headingFound) {
            return {
              range: entry.range,
              severity: 2,
              code: 'FG004',
              source: 'flavor-grenade',
              message: `Cannot resolve embed: heading '${resolution.headingTarget}' not found in target`,
            };
          }
        }
        if (resolution.blockTarget !== undefined) {
          const anchorFound = targetDoc.index.blockAnchors.some(
            (a) => a.id === resolution.blockTarget,
          );
          if (!anchorFound) {
            return {
              range: entry.range,
              severity: 2,
              code: 'FG004',
              source: 'flavor-grenade',
              message: `Cannot resolve embed: block anchor '${resolution.blockTarget}' not found in target`,
            };
          }
        }
      }
    }

    return null;
  }

  private buildRelated(candidates: DocId[], vaultRoot: string): DiagnosticRelatedInformation[] {
    return candidates.map((c) => ({
      location: {
        uri: pathToFileURL(fromDocId(vaultRoot, c)).toString(),
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      },
      message: `Candidate: ${c}`,
    }));
  }
}
