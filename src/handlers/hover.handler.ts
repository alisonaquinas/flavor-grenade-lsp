import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Position } from 'vscode-languageserver-types';
import { pathToFileURL } from 'url';
import { EmbedResolver } from '../resolution/embed-resolver.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { AttachmentEntry } from '../vault/vault-index.js';
import type { EmbedEntry, MarkdownImageRef, WikiLinkEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { entityAtPosition } from './cursor-entity.js';
import { classifyMarkdownTarget } from '../resolution/markdown-target-classifier.js';
import { structuredProfileHover } from '../markdown-flavor/structured-profile-analysis.js';

/** LSP MarkupContent value. */
export interface MarkupContent {
  kind: 'markdown';
  value: string;
}

/** Parameters for a `textDocument/hover` request. */
interface HoverParams {
  textDocument: { uri: string };
  position: Position;
}

/** Hover response shape (subset of LSP Hover). */
interface HoverResult {
  contents: MarkupContent;
}

/** Number of lines of the target doc to include in markdown hover preview. */
const MARKDOWN_PREVIEW_LINES = 5;

/** Number of lines of the target doc to include in wiki-link hover preview. */
const WIKI_LINK_PREVIEW_LINES = 3;

/**
 * Handles `textDocument/hover` requests for embed and wiki-link tokens.
 *
 * - Cursor on `EmbedEntry` with markdown target → first 5 lines of target doc
 * - Cursor on `EmbedEntry` with asset target (image) → `![](uri)` markdown
 * - Cursor on `WikiLinkEntry` → first 3 lines of target doc
 * - Otherwise → null
 */
@Injectable()
export class HoverHandler {
  constructor(
    private readonly parseCache: ParseCache,
    private readonly vaultIndex: VaultIndex,
    private readonly embedResolver: EmbedResolver,
  ) {}

  /**
   * Handle a `textDocument/hover` request.
   *
   * @param params - LSP hover request parameters.
   * @returns Hover result or null.
   */
  handle(params: HoverParams): HoverResult | null {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return null;

    const structuredHover = structuredProfileHover(doc, params.position);
    if (structuredHover !== undefined) {
      return { contents: { kind: 'markdown', value: structuredHover } };
    }

    const entity = entityAtPosition(doc, params.position);
    switch (entity.kind) {
      case 'embed':
        return this.hoverForEmbed(entity.entry);

      case 'markdown-image':
        return this.hoverForMarkdownImage(entity.entry, doc.uri);

      case 'wiki-link':
        return this.hoverForWikiLink(entity.entry);

      default:
        return null;
    }
  }

  private hoverForEmbed(entry: EmbedEntry): HoverResult | null {
    const resolution = this.embedResolver.resolve(entry);

    if (resolution.kind === 'markdown') {
      const preview = this.docPreview(resolution.targetDocId, MARKDOWN_PREVIEW_LINES);
      if (preview === null) return null;
      return { contents: { kind: 'markdown', value: `\`\`\`markdown\n${preview}\n\`\`\`` } };
    }

    if (resolution.kind === 'asset') {
      const attachment = this.attachmentForTarget(resolution.assetPath);
      if (attachment !== undefined) return this.hoverForAttachment(attachment);

      const assetUri = pathToFileURL(resolution.assetPath).href;
      return { contents: { kind: 'markdown', value: `![](${assetUri})` } };
    }

    return null;
  }

  private hoverForMarkdownImage(entry: MarkdownImageRef, sourceUri: string): HoverResult | null {
    const sourceDocId = this.docIdForUri(sourceUri);
    const classification = classifyMarkdownTarget(entry.target, {
      ...(sourceDocId !== null && { sourceDocId }),
      isImage: true,
    });
    if (classification.kind !== 'local-attachment') return null;

    const attachment = this.attachmentForTargets([
      classification.path,
      this.rawVaultRelativeAttachmentCandidate(entry.target),
    ]);
    if (attachment === undefined) return null;

    return this.hoverForAttachment(attachment);
  }

  private hoverForAttachment(attachment: AttachmentEntry): HoverResult {
    const lines = [
      `**${this.attachmentTypeLabel(attachment)}**`,
      '',
      `Path: \`${attachment.path}\``,
      `Type: ${this.attachmentTypeLabel(attachment)} (${attachment.extension || 'unknown'})`,
      `Size: ${this.formatSize(attachment.sizeBytes)}`,
    ];

    if (attachment.dimensions !== undefined) {
      lines.push(`Dimensions: ${attachment.dimensions.width}x${attachment.dimensions.height}`);
    }

    return { contents: { kind: 'markdown', value: lines.join('\n') } };
  }

  private hoverForWikiLink(entry: WikiLinkEntry): HoverResult | null {
    // We need to resolve the wiki-link to a DocId. The HoverHandler doesn't
    // have Oracle injected; we do a direct lookup via VaultIndex using the
    // entry target as a DocId (best-effort — covers exact-match case).
    const targetId = entry.target as DocId;
    const preview = this.docPreview(targetId, WIKI_LINK_PREVIEW_LINES);
    if (preview === null) return null;
    return { contents: { kind: 'markdown', value: `\`\`\`markdown\n${preview}\n\`\`\`` } };
  }

  private docPreview(docId: DocId, maxLines: number): string | null {
    const doc = this.vaultIndex.get(docId);
    if (doc === undefined) return null;

    // OFMDoc carries raw `text`, but a heading-based structural summary is used
    // here intentionally: it gives a compact, always-meaningful preview without
    // exposing raw prose that may be noisy or very long in hover tooltips.
    const cachedDoc = this.parseCache.get(doc.uri);
    if (cachedDoc === undefined) return null;

    // Build a structural preview from headings (up to maxLines entries).
    const lines: string[] = [];
    for (const heading of cachedDoc.index.headings) {
      if (lines.length >= maxLines) break;
      lines.push(`${'#'.repeat(heading.level)} ${heading.text}`);
    }

    if (lines.length === 0) {
      // No headings — return a minimal placeholder with the doc ID.
      return docId;
    }

    return lines.join('\n');
  }

  private docIdForUri(uri: string): DocId | null {
    for (const [docId, doc] of this.vaultIndex.entries()) {
      if (doc.uri === uri) return docId;
    }
    return null;
  }

  private attachmentForTarget(target: string): AttachmentEntry | undefined {
    return this.attachmentForTargets([target]);
  }

  private attachmentForTargets(targets: Array<string | undefined>): AttachmentEntry | undefined {
    const candidates = [
      ...new Set(targets.filter((target): target is string => target !== undefined)),
    ];
    for (const target of candidates) {
      const exact = this.vaultIndex.getAttachment(target);
      if (exact !== undefined) return exact;
    }

    const matches = candidates.flatMap((target) => {
      const suffix = '/' + target;
      return Array.from(this.vaultIndex.attachments()).filter(
        (attachment) => attachment.path === target || attachment.path.endsWith(suffix),
      );
    });

    const uniqueMatches = [
      ...new Map(matches.map((attachment) => [attachment.path, attachment])).values(),
    ];
    return uniqueMatches.length === 1 ? uniqueMatches[0] : undefined;
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

  private attachmentTypeLabel(attachment: AttachmentEntry): string {
    switch (attachment.kind) {
      case 'image':
        return 'Image';
      case 'audio':
        return 'Audio';
      case 'video':
        return 'Video';
      case 'pdf':
        return 'PDF';
      default:
        return 'File';
    }
  }

  private formatSize(sizeBytes: number): string {
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }
}
