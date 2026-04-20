import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { ParseCache } from '../parser/parser.module.js';
import type { OFMDoc } from '../parser/types.js';
import type { Range } from 'vscode-languageserver-types';

/**
 * Token type indices matching the legend:
 * ['string', 'keyword', 'label', 'enumMember', 'property']
 */
const TOKEN_TYPE_STRING = 0; // wiki-links, embeds
const TOKEN_TYPE_KEYWORD = 1; // tags
const TOKEN_TYPE_LABEL = 2; // block anchors
const TOKEN_TYPE_ENUM_MEMBER = 3; // callout types
const _TOKEN_TYPE_PROPERTY = 4; // frontmatter keys (reserved for future use)

/**
 * Token modifier bitmask indices:
 * ['declaration'] → bit 0
 */
const MODIFIER_DECLARATION = 1 << 0; // bit 0

/**
 * Semantic token types legend (must match capabilities registration).
 */
export const TOKEN_TYPES = ['string', 'keyword', 'label', 'enumMember', 'property'];

/**
 * Semantic token modifiers legend.
 */
export const TOKEN_MODIFIERS = ['declaration'];

interface SemanticToken {
  line: number;
  character: number;
  length: number;
  tokenType: number;
  tokenModifiers: number;
}

/**
 * Handles `textDocument/semanticTokens/full` requests.
 *
 * Encodes OFM tokens as LSP semantic tokens using delta encoding.
 * Tokens are sorted by (line, character) before encoding.
 */
@Injectable()
export class SemanticTokensHandler {
  constructor(private readonly parseCache: ParseCache) {}

  handle(params: { textDocument: { uri: string } }): { data: number[] } | null {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return null;

    const tokens = this.collectTokens(doc);

    // Sort by line, then character
    tokens.sort((a, b) => (a.line !== b.line ? a.line - b.line : a.character - b.character));

    const data = this.encodeTokens(tokens);
    return { data };
  }

  private collectTokens(doc: OFMDoc): SemanticToken[] {
    const tokens: SemanticToken[] = [];

    // Wiki-links → type: string (0), modifier: declaration (1)
    for (const link of doc.index.wikiLinks) {
      const t = this.rangeToToken(link.range, TOKEN_TYPE_STRING, MODIFIER_DECLARATION);
      if (t !== null) tokens.push(t);
    }

    // Embeds → type: string (0), modifier: declaration (1)
    for (const embed of doc.index.embeds) {
      const t = this.rangeToToken(embed.range, TOKEN_TYPE_STRING, MODIFIER_DECLARATION);
      if (t !== null) tokens.push(t);
    }

    // Tags → type: keyword (1), modifier: none (0)
    for (const tag of doc.index.tags) {
      const t = this.rangeToToken(tag.range, TOKEN_TYPE_KEYWORD, 0);
      if (t !== null) tokens.push(t);
    }

    // Block anchors → type: label (2), modifier: none (0)
    for (const anchor of doc.index.blockAnchors) {
      const t = this.rangeToToken(anchor.range, TOKEN_TYPE_LABEL, 0);
      if (t !== null) tokens.push(t);
    }

    // Callouts → type: enumMember (3), modifier: none (0)
    for (const callout of doc.index.callouts) {
      const t = this.rangeToToken(callout.range, TOKEN_TYPE_ENUM_MEMBER, 0);
      if (t !== null) tokens.push(t);
    }

    return tokens;
  }

  private rangeToToken(
    range: Range,
    tokenType: number,
    tokenModifiers: number,
  ): SemanticToken | null {
    // Only handle single-line tokens
    if (range.start.line !== range.end.line) return null;

    return {
      line: range.start.line,
      character: range.start.character,
      length: range.end.character - range.start.character,
      tokenType,
      tokenModifiers,
    };
  }

  private encodeTokens(tokens: SemanticToken[]): number[] {
    const data: number[] = [];
    let prevLine = 0;
    let prevChar = 0;

    for (const token of tokens) {
      const deltaLine = token.line - prevLine;
      const deltaChar = deltaLine === 0 ? token.character - prevChar : token.character;

      data.push(deltaLine, deltaChar, token.length, token.tokenType, token.tokenModifiers);

      prevLine = token.line;
      prevChar = token.character;
    }

    return data;
  }
}
