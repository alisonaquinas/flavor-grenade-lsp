import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { ContextAnalyzer } from './context-analyzer.js';
import type { CompletionContext } from './context-analyzer.js';
import { WikiLinkCompletionProvider } from '../resolution/wiki-link-completion-provider.js';
import { HeadingCompletionProvider } from './heading-completion-provider.js';
import { BlockRefCompletionProvider } from '../resolution/block-ref-completion-provider.js';
import { EmbedCompletionProvider } from './embed-completion-provider.js';
import { TagCompletionProvider } from './tag-completion-provider.js';
import { CalloutCompletionProvider } from './callout-completion-provider.js';
import { MarkdownLinkCompletionProvider } from './markdown-link-completion-provider.js';
import { ParseCache } from '../parser/parser.module.js';
import { ServerSettings } from '../lsp/services/server-settings.js';
import type { Range } from 'vscode-languageserver-types';
import type { DocId } from '../vault/doc-id.js';
import { VaultIndex } from '../vault/vault-index.js';

/** Parameters accepted by the router (matches textDocument/completion shape). */
export interface CompletionParams {
  textDocument: { uri: string };
  position: { line: number; character: number };
  context?: { triggerCharacter?: string };
}

/**
 * Routes textDocument/completion requests to the appropriate sub-provider
 * based on the cursor context detected by {@link ContextAnalyzer}.
 *
 * Applies the configured candidate cap to keep response sizes bounded. Sets
 * isIncomplete: true when results are truncated.
 */
@Injectable()
export class CompletionRouter {
  /** Raw document text store, populated by setDocumentText(). */
  private readonly rawTextStore = new Map<string, string>();

  constructor(
    private readonly contextAnalyzer: ContextAnalyzer,
    private readonly wikiLinkProvider: WikiLinkCompletionProvider,
    private readonly headingProvider: HeadingCompletionProvider,
    private readonly blockRefProvider: BlockRefCompletionProvider,
    private readonly embedProvider: EmbedCompletionProvider,
    private readonly tagProvider: TagCompletionProvider,
    private readonly calloutProvider: CalloutCompletionProvider,
    private readonly markdownLinkProvider: MarkdownLinkCompletionProvider,
    private readonly parseCache: ParseCache,
    private readonly vaultIndex: VaultIndex,
    private readonly settings: ServerSettings,
  ) {}

  /**
   * Route a completion request to the appropriate sub-provider.
   *
   * Steps:
   * 1. Look up document text (return empty if not found).
   * 2. Convert LSP position to a character offset.
   * 3. Detect completion context via ContextAnalyzer.
   * 4. Dispatch to the matching provider.
   * 5. Apply candidate cap.
   *
   * @param params - The completion request parameters.
   */
  route(params: CompletionParams): { items: CompletionItem[]; isIncomplete: boolean } {
    const { uri } = params.textDocument;

    // 1. Retrieve document from parse cache (ensures doc is known)
    const doc = this.parseCache.get(uri);
    if (doc === undefined) {
      return { items: [], isIncomplete: false };
    }

    // 2. Get raw text for context analysis
    const text = this.rawTextStore.get(uri);
    if (text === undefined) {
      return { items: [], isIncomplete: false };
    }

    // 3. Convert position to offset
    const offset = this.textPositionToOffset(text, params.position);

    // 4. Detect context
    const context = this.contextAnalyzer.analyze(text, offset);
    if (doc.markdownFlavor !== 'obsidian' && this.isObsidianInactiveContext(context)) {
      return { items: [], isIncomplete: false };
    }

    // 5. Dispatch to provider
    let result: { items: CompletionItem[]; isIncomplete: boolean };
    let replaceLength = 0;
    const { linkStyle, completionCandidates } = this.settings.snapshot();

    switch (context.kind) {
      case 'wiki-link':
        result = this.wikiLinkProvider.getCompletions(context.partial, linkStyle);
        replaceLength = context.partial.length;
        break;

      case 'wiki-link-heading':
        result = this.headingProvider.getCompletions(
          context.targetStem,
          context.headingPrefix,
          doc,
        );
        replaceLength = context.headingPrefix.length;
        break;

      case 'wiki-link-block':
        result = this.blockRefProvider.getCompletions(
          context.blockPrefix,
          context.targetStem !== '' ? context.targetStem : undefined,
          uri,
        );
        replaceLength = context.blockPrefix.length;
        break;

      case 'embed':
        result = this.embedProvider.getCompletions(context.partial);
        replaceLength = context.partial.length;
        break;

      case 'markdown-link-target':
        result = this.markdownLinkProvider.getDocumentCompletions(
          context.partial,
          this.docIdForUri(uri),
        );
        replaceLength = context.partial.length;
        break;

      case 'markdown-image-target':
        result = this.embedProvider.getAttachmentCompletions(context.partial);
        replaceLength = context.partial.length;
        break;

      case 'markdown-link-heading':
        result = this.markdownLinkProvider.getHeadingCompletions(
          context.target,
          context.headingPrefix,
          doc,
          this.docIdForUri(uri),
        );
        replaceLength = context.headingPrefix.length;
        break;

      case 'tag':
        result = this.tagProvider.getCompletions(context.partial);
        replaceLength = context.partial.length;
        break;

      case 'callout':
        result = this.calloutProvider.getCompletions(context.partial);
        replaceLength = context.partial.length;
        break;

      default:
        return { items: [], isIncomplete: false };
    }

    // 6. Apply text edits and candidate cap.
    const replaceRange = this.replacementRange(params.position, replaceLength);
    const items = result.items.map((item) => this.withTextEdit(item, replaceRange));

    if (items.length > completionCandidates) {
      return { items: items.slice(0, completionCandidates), isIncomplete: true };
    }

    return { items, isIncomplete: result.isIncomplete };
  }

  /**
   * Store raw document text so the router can perform context analysis.
   * Called by the didOpen/didChange integration in LspModule.
   *
   * @param uri  - Document URI.
   * @param text - Raw document text.
   */
  setDocumentText(uri: string, text: string): void {
    this.rawTextStore.set(uri, text);
  }

  /**
   * Remove stored raw text for a document (call on didClose).
   *
   * @param uri - Document URI.
   */
  removeDocumentText(uri: string): void {
    this.rawTextStore.delete(uri);
  }

  /**
   * Convert a 0-based LSP position to an absolute character offset.
   *
   * Iterates lines, summing lengths + 1 (for the newline character).
   */
  private textPositionToOffset(
    text: string,
    position: { line: number; character: number },
  ): number {
    const lines = text.split('\n');
    let offset = 0;
    for (let i = 0; i < position.line && i < lines.length; i++) {
      offset += (lines[i] as string).length + 1;
    }
    const currentLine = lines[position.line] ?? '';
    offset += Math.min(position.character, currentLine.length);
    return offset;
  }

  private replacementRange(
    position: { line: number; character: number },
    replaceLength: number,
  ): Range {
    return {
      start: {
        line: position.line,
        character: Math.max(0, position.character - replaceLength),
      },
      end: position,
    };
  }

  private withTextEdit(item: CompletionItem, range: Range): CompletionItem {
    const newText = item.insertText ?? item.label;
    return {
      ...item,
      insertText: newText,
      textEdit: { range, newText },
    };
  }

  private isObsidianInactiveContext(context: CompletionContext): boolean {
    return [
      'wiki-link',
      'wiki-link-heading',
      'wiki-link-block',
      'embed',
      'tag',
      'callout',
    ].includes(context.kind);
  }

  private docIdForUri(uri: string): DocId | undefined {
    for (const [docId, doc] of this.vaultIndex.entries()) {
      if (doc.uri === uri) return docId;
    }

    try {
      const pathname = decodeURIComponent(new URL(uri).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      const normalized = pathname.replace(/\\/g, '/');
      const withoutExtension = normalized.endsWith('.md') ? normalized.slice(0, -3) : normalized;
      const segments = withoutExtension.split('/').filter(Boolean);
      return segments.length > 0 ? (segments[segments.length - 1] as DocId) : undefined;
    } catch {
      return undefined;
    }
  }
}
