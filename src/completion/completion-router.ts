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

    if (doc.markdownFlavor === 'glfm') {
      const glfmResult = this.glfmCompletions(text, params.position);
      if (glfmResult !== null) return glfmResult;
    }

    if (doc.markdownFlavor === 'pandoc') {
      const pandocResult = this.pandocCompletions(text, params.position);
      if (pandocResult !== null) return pandocResult;
    }

    if (doc.markdownFlavor === 'multimarkdown') {
      const multimarkdownResult = this.multimarkdownCompletions(text, params.position);
      if (multimarkdownResult !== null) return multimarkdownResult;
    }

    if (doc.markdownFlavor === 'mdx') {
      const mdxResult = this.mdxCompletions(text, params.position);
      if (mdxResult !== null) return mdxResult;
    }

    if (doc.markdownFlavor === 'kramdown') {
      const kramdownResult = this.kramdownCompletions(text, params.position);
      if (kramdownResult !== null) return kramdownResult;
    }

    if (doc.markdownFlavor === 'markdown-extra') {
      const markdownExtraResult = this.markdownExtraCompletions(text, params.position);
      if (markdownExtraResult !== null) return markdownExtraResult;
    }

    if (doc.markdownFlavor === 'r-markdown') {
      const rMarkdownResult = this.rMarkdownCompletions(text, params.position);
      if (rMarkdownResult !== null) return rMarkdownResult;
    }

    if (doc.markdownFlavor === 'reddit') {
      const redditResult = this.redditCompletions(text, params.position);
      if (redditResult !== null) return redditResult;
    }

    if (doc.markdownFlavor === 'stack-overflow') {
      const stackOverflowResult = this.stackOverflowCompletions(text, params.position);
      if (stackOverflowResult !== null) return stackOverflowResult;
    }

    if (doc.markdownFlavor === 'gfm' || doc.markdownFlavor === 'glfm') {
      const gfmResult = this.gfmCompletions(text, params.position);
      if (gfmResult !== null) return gfmResult;
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

  private gfmCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (/^\s*\|$/.test(prefix)) {
      const range = this.replacementRange(position, 1);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'GFM table',
              insertText: '| Header | Header |\n| --- | --- |\n| Cell | Cell |',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    if (/^[ \t]{0,3}[-*+][ \t]$/.test(prefix)) {
      const range = this.replacementRange(position, 0);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'GFM task item',
              insertText: '[ ] ',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    return null;
  }

  private glfmCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (/^[ \t]{0,3}[-*+][ \t]$/.test(prefix)) {
      const range = this.replacementRange(position, 0);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'GLFM inapplicable task item',
              insertText: '[~] ',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    if (prefix === '[') {
      const range = this.replacementRange(position, 1);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'GLFM table of contents',
              insertText: '[[_TOC_]]',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    return null;
  }

  private pandocCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (prefix.endsWith('[@')) {
      const range = this.replacementRange(position, 0);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'Pandoc citation',
              insertText: 'key]',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    if (prefix === '{') {
      const range = this.replacementRange(position, 1);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'Pandoc attribute set',
              insertText: '{#id .class}',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    return null;
  }

  private multimarkdownCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (/^[A-Za-z][A-Za-z0-9 _-]{0,20}$/.test(prefix)) {
      const range = this.replacementRange(position, prefix.length);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'MultiMarkdown metadata key',
              insertText: 'Title: ',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    if (prefix.endsWith('[](#')) {
      const range = this.replacementRange(position, 0);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'MultiMarkdown citation',
              insertText: 'key)',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    if (prefix.endsWith('[^')) {
      const range = this.replacementRange(position, 0);
      return {
        items: [
          this.withTextEdit(
            {
              label: 'MultiMarkdown footnote',
              insertText: 'label]: ',
            },
            range,
          ),
        ],
        isIncomplete: false,
      };
    }

    return null;
  }

  private mdxCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (prefix === '<') {
      return this.singleCompletion(position, 1, 'MDX component', '<Component />');
    }

    if (prefix === '{') {
      return this.singleCompletion(position, 1, 'MDX expression', '{expression}');
    }

    if (prefix.endsWith('export ')) {
      return this.singleCompletion(position, 0, 'MDX named export', 'const name = ');
    }

    return null;
  }

  private kramdownCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (prefix === '{:') {
      return this.singleCompletion(position, 2, 'kramdown attribute', '{: #id .class}');
    }

    if (prefix.endsWith('[^')) {
      return this.singleCompletion(position, 0, 'kramdown footnote', 'label]: ');
    }

    return null;
  }

  private markdownExtraCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (/^\s*\|$/.test(prefix)) {
      return this.singleCompletion(
        position,
        1,
        'Markdown Extra table',
        '| Header | Header |\n| --- | --- |\n| Cell | Cell |',
      );
    }

    if (prefix.endsWith('[^')) {
      return this.singleCompletion(position, 0, 'Markdown Extra footnote', 'label]: ');
    }

    if (prefix === '*[') {
      return this.singleCompletion(position, 2, 'Markdown Extra abbreviation', '*[HTML]: ');
    }

    if (prefix === '{') {
      return this.singleCompletion(position, 1, 'Markdown Extra attribute', '{#id .class}');
    }

    return null;
  }

  private rMarkdownCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (prefix === '```{') {
      return this.singleCompletion(
        position,
        4,
        'R Markdown chunk',
        '```{r label, echo = TRUE}\n\n```',
      );
    }

    if (/^[ \t]{0,3}(```+|~~~+)\{[A-Za-z][^}]*,\s*$/.test(prefix)) {
      return this.singleCompletion(position, 0, 'R Markdown chunk option', 'include = FALSE');
    }

    if (prefix === '`r') {
      return this.singleCompletion(position, 2, 'R Markdown inline expression', '`r expression`');
    }

    return null;
  }

  private redditCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (prefix === '>!') {
      return this.singleCompletion(position, 2, 'Reddit spoiler', '>!spoiler!<');
    }

    if (prefix === '^(') {
      return this.singleCompletion(position, 2, 'Reddit superscript', '^(text)');
    }

    return null;
  }

  private stackOverflowCompletions(
    text: string,
    position: { line: number; character: number },
  ): { items: CompletionItem[]; isIncomplete: boolean } | null {
    const line = text.split('\n')[position.line] ?? '';
    const prefix = line.slice(0, position.character);

    if (prefix === '[tag:') {
      return this.singleCompletion(position, 5, 'Stack Overflow tag reference', '[tag:markdown]');
    }

    if (prefix === '<!-- language') {
      return this.singleCompletion(
        position,
        13,
        'Stack Overflow language directive',
        '<!-- language: lang-js -->',
      );
    }

    return null;
  }

  private singleCompletion(
    position: { line: number; character: number },
    replaceLength: number,
    label: string,
    insertText: string,
  ): { items: CompletionItem[]; isIncomplete: boolean } {
    const range = this.replacementRange(position, replaceLength);
    return {
      items: [this.withTextEdit({ label, insertText }, range)],
      isIncomplete: false,
    };
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
