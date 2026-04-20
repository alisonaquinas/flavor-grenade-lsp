import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { ContextAnalyzer } from './context-analyzer.js';
import { WikiLinkCompletionProvider } from '../resolution/wiki-link-completion-provider.js';
import { HeadingCompletionProvider } from './heading-completion-provider.js';
import { BlockRefCompletionProvider } from '../resolution/block-ref-completion-provider.js';
import { EmbedCompletionProvider } from './embed-completion-provider.js';
import { TagCompletionProvider } from './tag-completion-provider.js';
import { CalloutCompletionProvider } from './callout-completion-provider.js';
import { ParseCache } from '../parser/parser.module.js';
import type { DocId } from '../vault/doc-id.js';

/** Maximum number of completion candidates to return in a single response. */
const CANDIDATES_CAP = 50;

/** Supported link-style formatting modes. */
export type LinkStyle = 'file-stem' | 'title-slug' | 'file-path-stem';

/** Parameters accepted by the router (matches textDocument/completion shape). */
export interface CompletionParams {
  textDocument: { uri: string };
  position: { line: number; character: number };
  context?: { triggerCharacter?: string };
  linkStyle?: LinkStyle;
}

/**
 * Routes textDocument/completion requests to the appropriate sub-provider
 * based on the cursor context detected by {@link ContextAnalyzer}.
 *
 * Applies a {@link CANDIDATES_CAP} to keep response sizes bounded. Sets
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
    private readonly parseCache: ParseCache,
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

    // 5. Dispatch to provider
    let result: { items: CompletionItem[]; isIncomplete: boolean };

    switch (context.kind) {
      case 'wiki-link':
        result = this.wikiLinkProvider.getCompletions(context.partial);
        break;

      case 'wiki-link-heading':
        result = this.headingProvider.getCompletions(
          context.targetStem,
          context.headingPrefix,
          uri as DocId,
        );
        break;

      case 'wiki-link-block':
        result = this.blockRefProvider.getCompletions(
          context.blockPrefix,
          context.targetStem !== '' ? context.targetStem : undefined,
          uri,
        );
        break;

      case 'embed':
        result = this.embedProvider.getCompletions(context.partial);
        break;

      case 'tag':
        result = this.tagProvider.getCompletions(context.partial);
        break;

      case 'callout':
        result = this.calloutProvider.getCompletions(context.partial);
        break;

      default:
        return { items: [], isIncomplete: false };
    }

    // 6. Apply candidate cap (TASK-097)
    if (result.items.length > CANDIDATES_CAP) {
      return { items: result.items.slice(0, CANDIDATES_CAP), isIncomplete: true };
    }

    return result;
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
}
