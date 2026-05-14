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
import type { OFMDoc, WikiLinkEntry, EmbedEntry, MarkdownImageRef } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { fromDocId } from '../vault/doc-id.js';
import type { LinkLabelDef, MarkdownLinkRef } from '../parser/types.js';
import { classifyMarkdownTarget } from './markdown-target-classifier.js';
import { GfmParser } from '../parser/gfm-parser.js';
import { GlfmParser } from '../parser/glfm-parser.js';
import { PandocParser } from '../parser/pandoc-parser.js';
import { MultimarkdownParser } from '../parser/multimarkdown-parser.js';
import { MdxParser } from '../parser/mdx-parser.js';
import { KramdownParser } from '../parser/kramdown-parser.js';
import { MarkdownExtraParser } from '../parser/markdown-extra-parser.js';
import { RMarkdownParser } from '../parser/r-markdown-parser.js';
import { RedditParser } from '../parser/reddit-parser.js';
import { StackOverflowParser } from '../parser/stack-overflow-parser.js';

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
 * - **FG101** Original Markdown portability warning for unsupported extensions
 * - **FG102** CommonMark portability warning for non-core flavor extensions
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

    if (doc.markdownFlavor === 'original') {
      diagnostics.push(...this.diagnoseMarkdownPortability(doc, 'original'));
    }

    if (doc.markdownFlavor === 'commonmark') {
      diagnostics.push(...this.diagnoseMarkdownPortability(doc, 'commonmark'));
    }

    if (doc.markdownFlavor === 'gfm' || doc.markdownFlavor === 'glfm') {
      diagnostics.push(...this.diagnoseGfmTables(doc));
    }

    if (doc.markdownFlavor === 'glfm') {
      diagnostics.push(...this.diagnoseGlfmDescriptionLists(doc));
    }

    if (doc.markdownFlavor === 'pandoc') {
      diagnostics.push(...this.diagnosePandocAttributes(doc));
    }

    if (doc.markdownFlavor === 'multimarkdown') {
      diagnostics.push(...this.diagnoseMultimarkdownMetadata(doc));
    }

    if (doc.markdownFlavor === 'mdx') {
      diagnostics.push(...this.diagnoseMdxBoundaries(doc));
    }

    if (doc.markdownFlavor === 'kramdown') {
      diagnostics.push(...this.diagnoseKramdownAttributes(doc));
    }

    if (doc.markdownFlavor === 'markdown-extra') {
      diagnostics.push(...this.diagnoseMarkdownExtraAttributes(doc));
    }

    if (doc.markdownFlavor === 'r-markdown') {
      diagnostics.push(...this.diagnoseRMarkdownChunks(doc));
    }

    if (doc.markdownFlavor === 'reddit') {
      diagnostics.push(...this.diagnoseRedditPortability(doc));
    }

    if (doc.markdownFlavor === 'stack-overflow') {
      diagnostics.push(...this.diagnoseStackOverflowPortability(doc));
    }

    for (const entry of doc.index.wikiLinks) {
      const diag = this.diagnoseEntry(docId, entry, vaultRoot);
      if (diag !== null) diagnostics.push(diag);
    }
    for (const entry of doc.index.markdownLinks ?? []) {
      const diag = this.diagnoseMarkdownTarget(docId, entry, vaultRoot);
      if (diag !== null) diagnostics.push(diag);
    }
    for (const entry of doc.index.markdownImages ?? []) {
      const diag = this.diagnoseMarkdownImage(docId, entry);
      if (diag !== null) diagnostics.push(diag);
    }
    for (const entry of doc.index.linkLabelDefs ?? []) {
      const diag = this.diagnoseMarkdownTarget(docId, entry, vaultRoot);
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

  private diagnoseMarkdownPortability(
    doc: OFMDoc,
    flavor: 'original' | 'commonmark',
  ): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lineStartOffsets = this.lineStartOffsets(doc.text);
    const lines = doc.text.split('\n');
    let offset = 0;
    let fence: string | undefined;

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      const lineEnd = offset + line.length;

      if (fence !== undefined) {
        if (line.trimStart().startsWith(fence)) {
          fence = undefined;
        }
        offset += rawLine.length + 1;
        continue;
      }

      const fenceMatch = /^[ \t]{0,3}(```+|~~~+)/.exec(line);
      if (fenceMatch !== null) {
        fence = fenceMatch[1][0]!.repeat(fenceMatch[1].length);
        if (flavor === 'original') {
          diagnostics.push(
            this.portabilityDiagnostic(
              offset + (fenceMatch.index ?? 0),
              lineEnd,
              lineStartOffsets,
              'FG101',
              'Fenced code blocks are not part of Original Markdown.',
            ),
          );
        }
        offset += rawLine.length + 1;
        continue;
      }

      if (!this.isOpaqueOffset(offset, doc)) {
        if (this.isPipeTableSeparator(line)) {
          diagnostics.push(
            this.portabilityDiagnostic(
              offset,
              lineEnd,
              lineStartOffsets,
              flavor === 'original' ? 'FG101' : 'FG102',
              `Pipe tables are not part of ${this.flavorDiagnosticLabel(flavor)}.`,
            ),
          );
        }

        if (/^[ \t]{0,3}[-*+][ \t]+\[[ xX]\][ \t]+/.test(line)) {
          diagnostics.push(
            this.portabilityDiagnostic(
              offset,
              lineEnd,
              lineStartOffsets,
              flavor === 'original' ? 'FG101' : 'FG102',
              `Task list items are not part of ${this.flavorDiagnosticLabel(flavor)}.`,
            ),
          );
        }

        if (/^[ \t]{0,3}>[ \t]*\[![^\]]+\]/.test(line)) {
          diagnostics.push(
            this.portabilityDiagnostic(
              offset,
              lineEnd,
              lineStartOffsets,
              flavor === 'original' ? 'FG101' : 'FG102',
              `Callouts are not part of ${this.flavorDiagnosticLabel(flavor)}.`,
            ),
          );
        }
      }

      offset += rawLine.length + 1;
    }

    const wikiPattern = /!?\[\[[^\]\n]+\]\]/g;
    let match: RegExpExecArray | null;
    while ((match = wikiPattern.exec(doc.text)) !== null) {
      if (this.isOpaqueOffset(match.index, doc)) continue;
      diagnostics.push(
        this.portabilityDiagnostic(
          match.index,
          match.index + match[0].length,
          lineStartOffsets,
          flavor === 'original' ? 'FG101' : 'FG102',
          `Wiki links and embeds are not part of ${this.flavorDiagnosticLabel(flavor)}.`,
        ),
      );
    }

    return diagnostics.sort((a, b) => {
      if (a.range.start.line !== b.range.start.line) return a.range.start.line - b.range.start.line;
      return a.range.start.character - b.range.start.character;
    });
  }

  private portabilityDiagnostic(
    startOffset: number,
    endOffset: number,
    lineStartOffsets: number[],
    code: 'FG101' | 'FG102',
    message: string,
  ): Diagnostic {
    return {
      range: {
        start: this.offsetToPosition(startOffset, lineStartOffsets),
        end: this.offsetToPosition(endOffset, lineStartOffsets),
      },
      severity: 2,
      code,
      source: 'flavor-grenade',
      message,
    };
  }

  private flavorDiagnosticLabel(flavor: 'original' | 'commonmark'): string {
    return flavor === 'original' ? 'Original Markdown' : 'CommonMark';
  }

  private diagnoseGfmTables(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.gfmMalformedTables ?? GfmParser.parse(doc.text, doc.opaqueRegions).malformedTables;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG201',
      source: 'flavor-grenade',
      message: `Malformed GFM table: header has ${entry.headerCells.length} cells but delimiter has ${entry.delimiterCells.length}.`,
    }));
  }

  private diagnoseGlfmDescriptionLists(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.glfmMalformedDescriptionLists ??
      GlfmParser.parse(doc.text, doc.opaqueRegions).malformedDescriptionLists;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG202',
      source: 'flavor-grenade',
      message: `Malformed GLFM description list: definition for '${entry.term}' must contain text.`,
    }));
  }

  private diagnosePandocAttributes(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.pandocMalformedAttributes ??
      PandocParser.parse(doc.text, doc.opaqueRegions).malformedAttributes;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG301',
      source: 'flavor-grenade',
      message: 'Malformed Pandoc attribute: expected id, class, or key=value entries.',
    }));
  }

  private diagnoseMultimarkdownMetadata(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.multimarkdownMalformedMetadata ??
      MultimarkdownParser.parse(doc.text, doc.opaqueRegions).malformedMetadata;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG302',
      source: 'flavor-grenade',
      message: 'Malformed MultiMarkdown metadata: expected a leading Key: value row.',
    }));
  }

  private diagnoseMdxBoundaries(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.mdxMalformedBoundaries ??
      MdxParser.parse(doc.text, doc.opaqueRegions).malformedBoundaries;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG401',
      source: 'flavor-grenade',
      message: 'Malformed MDX boundary: expected closed JSX tag or balanced expression.',
    }));
  }

  private diagnoseKramdownAttributes(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.kramdownMalformedAttributes ??
      KramdownParser.parse(doc.text, doc.opaqueRegions).malformedAttributes;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG501',
      source: 'flavor-grenade',
      message:
        'Malformed kramdown attribute: expected a closing } with id, class, or key=value entries.',
    }));
  }

  private diagnoseMarkdownExtraAttributes(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.markdownExtraMalformedAttributes ??
      MarkdownExtraParser.parse(doc.text, doc.opaqueRegions).malformedAttributes;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG502',
      source: 'flavor-grenade',
      message:
        'Malformed Markdown Extra attribute: expected a closing } with id, class, or key=value entries.',
    }));
  }

  private diagnoseRMarkdownChunks(doc: OFMDoc): Diagnostic[] {
    const malformed =
      doc.index.rMarkdownMalformedChunks ?? RMarkdownParser.parse(doc.text).malformedChunks;
    return malformed.map((entry) => ({
      range: entry.range,
      severity: 2,
      code: 'FG601',
      source: 'flavor-grenade',
      message:
        'Malformed R Markdown chunk header: expected a closing } and did not execute chunk code.',
    }));
  }

  private diagnoseRedditPortability(doc: OFMDoc): Diagnostic[] {
    const parsed = RedditParser.parse(doc.text, doc.opaqueRegions);
    const oldRedditLists =
      doc.index.redditOldRedditIncompatibleLists ?? parsed.oldRedditIncompatibleLists;
    const unsafeLinks = doc.index.redditUnsafeLinks ?? parsed.unsafeLinks;
    const diagnostics: Diagnostic[] = [];

    diagnostics.push(
      ...oldRedditLists.map(
        (entry): Diagnostic => ({
          range: entry.range,
          severity: 2,
          code: 'FG701',
          source: 'flavor-grenade',
          message:
            'Reddit ordered list marker uses 1) syntax that is incompatible with old Reddit.',
        }),
      ),
    );
    diagnostics.push(
      ...unsafeLinks.map(
        (entry): Diagnostic => ({
          range: entry.targetRange,
          severity: 2,
          code: 'FG702',
          source: 'flavor-grenade',
          message: `Reddit Markdown link uses unsupported URL scheme in '${entry.target}'.`,
        }),
      ),
    );

    return diagnostics;
  }

  private diagnoseStackOverflowPortability(doc: OFMDoc): Diagnostic[] {
    const parsed = StackOverflowParser.parse(doc.text, doc.opaqueRegions);
    const malformed =
      doc.index.stackOverflowMalformedLanguageDirectives ?? parsed.malformedLanguageDirectives;
    return malformed.map(
      (entry): Diagnostic => ({
        range: entry.languageRange,
        severity: 2,
        code: 'FG801',
        source: 'flavor-grenade',
        message: 'Malformed Stack Overflow language directive: expected a lang-* value.',
      }),
    );
  }

  private isPipeTableSeparator(line: string): boolean {
    return (
      line.includes('|') && line.includes('---') && /^[ \t]*\|?[ \t:|-]+\|[ \t:|-]+$/.test(line)
    );
  }

  private lineStartOffsets(text: string): number[] {
    const starts = [0];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        starts.push(i + 1);
      }
    }
    return starts;
  }

  private isOpaqueOffset(offset: number, doc: OFMDoc): boolean {
    return doc.opaqueRegions.some((region) => offset >= region.start && offset < region.end);
  }

  private diagnoseMarkdownTarget(
    docId: DocId,
    entry: MarkdownLinkRef | LinkLabelDef,
    vaultRoot: string,
  ): Diagnostic | null {
    const classification = classifyMarkdownTarget(entry.target, { sourceDocId: docId });
    const resolution = this.oracle.resolveMarkdownTarget(docId, classification);

    switch (resolution.kind) {
      case 'non-vault':
      case 'document-resolved':
      case 'heading-resolved':
        return null;

      case 'document-missing':
        return {
          range: entry.targetRange,
          severity: 1,
          code: 'FG001',
          source: 'flavor-grenade',
          message: `Cannot resolve Markdown link: '${entry.target}' not found in vault`,
        };

      case 'document-ambiguous':
        return {
          range: entry.targetRange,
          severity: 1,
          code: 'FG002',
          source: 'flavor-grenade',
          message: `Ambiguous Markdown link: '${entry.target}' matches ${resolution.candidates.length} documents`,
          relatedInformation: this.buildRelated(resolution.candidates, vaultRoot),
        };

      case 'heading-missing':
        return {
          range: entry.targetRange,
          severity: 1,
          code: 'FG001',
          source: 'flavor-grenade',
          message: `Cannot resolve Markdown link: heading '${resolution.fragment}' not found`,
        };

      case 'heading-ambiguous':
        return {
          range: entry.targetRange,
          severity: 1,
          code: 'FG002',
          source: 'flavor-grenade',
          message: `Ambiguous Markdown heading anchor: '${resolution.fragment}' matches ${resolution.candidates.length} headings`,
          relatedInformation: this.buildHeadingRelated(
            resolution.targetDocId,
            resolution.candidates,
          ),
        };
    }
  }

  private diagnoseMarkdownImage(docId: DocId, entry: MarkdownImageRef): Diagnostic | null {
    const classification = classifyMarkdownTarget(entry.target, {
      sourceDocId: docId,
      isImage: true,
    });

    if (classification.kind !== 'local-attachment') {
      return null;
    }

    const resolution = this.resolveAttachmentPath([
      classification.path,
      this.rawVaultRelativeAttachmentCandidate(entry.target),
    ]);
    if (resolution.kind === 'resolved') {
      return null;
    }

    if (resolution.kind === 'ambiguous') {
      return {
        range: entry.targetRange,
        severity: 1,
        code: 'FG002',
        source: 'flavor-grenade',
        message: `Ambiguous Markdown image: '${entry.target}' matches ${resolution.candidates.length} attachments`,
      };
    }

    return {
      range: entry.targetRange,
      severity: 2,
      code: 'FG004',
      source: 'flavor-grenade',
      message: `Cannot resolve attachment: '${entry.target}' not found`,
    };
  }

  private resolveAttachmentPath(
    targets: Array<string | undefined>,
  ):
    | { kind: 'resolved'; path: string }
    | { kind: 'ambiguous'; candidates: string[] }
    | { kind: 'missing' } {
    const candidates = [
      ...new Set(targets.filter((target): target is string => target !== undefined)),
    ];

    for (const target of candidates) {
      if (this.vaultIndex?.hasAttachment(target)) {
        return { kind: 'resolved', path: target };
      }
    }

    const matches: string[] = [];
    for (const target of candidates) {
      const suffix = '/' + target;
      for (const attachment of this.vaultIndex?.attachments() ?? []) {
        if (attachment.path === target || attachment.path.endsWith(suffix)) {
          matches.push(attachment.path);
        }
      }
    }

    const uniqueMatches = [...new Set(matches)];
    if (uniqueMatches.length === 1) return { kind: 'resolved', path: uniqueMatches[0] };
    if (uniqueMatches.length > 1) return { kind: 'ambiguous', candidates: uniqueMatches };
    return { kind: 'missing' };
  }

  private rawVaultRelativeAttachmentCandidate(target: string): string | undefined {
    const rawPath = target
      .split('#')[0]
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/^\.\//, '');
    if (rawPath.length === 0) return undefined;
    const segments = rawPath.split('/');
    if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
      return undefined;
    }
    return rawPath;
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

  private buildHeadingRelated(
    targetDocId: DocId,
    candidates: import('../parser/types.js').HeadingEntry[],
  ): DiagnosticRelatedInformation[] {
    const targetDoc = this.vaultIndex?.get(targetDocId);
    return candidates.map((heading) => ({
      location: {
        uri: targetDoc?.uri ?? '',
        range: heading.range,
      },
      message: `Candidate heading: ${heading.text}`,
    }));
  }
}
