import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Position } from 'vscode-languageserver-types';
import { pathToFileURL } from 'url';
import { EmbedResolver } from '../resolution/embed-resolver.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { EmbedEntry, WikiLinkEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';

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

    // Check embeds first.
    const embedEntry = this.findEmbedAtPosition(doc.index.embeds, params.position);
    if (embedEntry !== null) {
      return this.hoverForEmbed(embedEntry);
    }

    // Then wiki-links.
    const wikiEntry = this.findWikiLinkAtPosition(doc.index.wikiLinks, params.position);
    if (wikiEntry !== null) {
      return this.hoverForWikiLink(wikiEntry);
    }

    return null;
  }

  private hoverForEmbed(entry: EmbedEntry): HoverResult | null {
    const resolution = this.embedResolver.resolve(entry);

    if (resolution.kind === 'markdown') {
      const preview = this.docPreview(resolution.targetDocId, MARKDOWN_PREVIEW_LINES);
      if (preview === null) return null;
      return { contents: { kind: 'markdown', value: `\`\`\`markdown\n${preview}\n\`\`\`` } };
    }

    if (resolution.kind === 'asset') {
      const assetUri = pathToFileURL(resolution.assetPath).href;
      return { contents: { kind: 'markdown', value: `![](${assetUri})` } };
    }

    return null;
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

    // Reconstruct a text preview from the document URI by reading the
    // parse cache (the doc object doesn't store raw text, so we use the
    // parsed index as a fallback — but for a true preview we need raw text).
    // Since we only have the parsed representation, we fall back to the
    // URI path as a minimal placeholder, unless a richer source is added.
    // For Phase 7 we use the document URI as the preview source indicator
    // and produce a placeholder preview from the headings index.
    const cachedDoc = this.parseCache.get(doc.uri);
    if (cachedDoc === undefined) return null;

    // Build a simple text preview from headings if no raw text is available.
    // The OFMDoc doesn't carry the raw text — we generate a structural summary.
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

  private findEmbedAtPosition(embeds: EmbedEntry[], position: Position): EmbedEntry | null {
    for (const entry of embeds) {
      if (this.positionInRange(position, entry.range)) return entry;
    }
    return null;
  }

  private findWikiLinkAtPosition(
    wikiLinks: WikiLinkEntry[],
    position: Position,
  ): WikiLinkEntry | null {
    for (const entry of wikiLinks) {
      if (this.positionInRange(position, entry.range)) return entry;
    }
    return null;
  }

  private positionInRange(position: Position, range: WikiLinkEntry['range']): boolean {
    const { start, end } = range;
    if (position.line < start.line || position.line > end.line) return false;
    if (position.line === start.line && position.character < start.character) return false;
    if (position.line === end.line && position.character > end.character) return false;
    return true;
  }
}
