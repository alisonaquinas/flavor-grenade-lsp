import 'reflect-metadata';
import { Module, Injectable } from '@nestjs/common';
import { OFMParser } from './ofm-parser.js';
import type { OFMDoc } from './types.js';

/**
 * In-memory cache that maps document URIs to their most-recently-parsed
 * {@link OFMDoc}.
 */
@Injectable()
export class ParseCache {
  private readonly cache = new Map<string, OFMDoc>();

  /**
   * Store a parsed document.
   *
   * @param uri - Document URI.
   * @param doc - The parsed OFM document.
   */
  set(uri: string, doc: OFMDoc): void {
    this.cache.set(uri, doc);
  }

  /**
   * Retrieve a parsed document by URI.
   *
   * @param uri - Document URI.
   */
  get(uri: string): OFMDoc | undefined {
    return this.cache.get(uri);
  }

  /**
   * Remove a document from the cache.
   *
   * @param uri - Document URI.
   */
  delete(uri: string): void {
    this.cache.delete(uri);
  }
}

/**
 * NestJS module that provides the OFM parser and parse cache.
 */
@Module({
  providers: [OFMParser, ParseCache],
  exports: [OFMParser, ParseCache],
})
export class ParserModule {}
