import type { OpaqueRegion, WikiLinkEntry } from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/**
 * Parses `[[wikilinks]]` from a document, respecting opaque regions.
 *
 * Supports:
 * - `[[Target]]`
 * - `[[Target|Alias]]`
 * - `[[Target#Heading]]`
 * - `[[Target#Heading|Alias]]`
 * - `[[Target^BlockRef]]`
 */
export class WikiLinkParser {
  /**
   * Find all wiki links in `text`, skipping tokens inside `opaqueRegions`.
   *
   * @param text          - Full document text.
   * @param opaqueRegions - Sorted list of opaque regions to skip.
   */
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): WikiLinkEntry[] {
    const entries: WikiLinkEntry[] = [];
    const pattern = /!\[\[|(\[\[)/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      // Skip embeds (prefixed with !)
      if (!match[1]) continue;

      const openIdx = match.index;
      if (isInsideOpaqueRegion(openIdx, opaqueRegions as OpaqueRegion[])) continue;

      const close = text.indexOf(']]', openIdx + 2);
      if (close === -1) continue;

      const inner = text.slice(openIdx + 2, close);
      const raw = text.slice(openIdx, close + 2);
      const entry = WikiLinkParser.parseInner(inner, raw, text, openIdx, close + 2);
      if (entry) entries.push(entry);
    }

    return entries;
  }

  private static parseInner(
    inner: string,
    raw: string,
    fullText: string,
    start: number,
    end: number,
  ): WikiLinkEntry | null {
    // Extract alias (after last |)
    const pipeIdx = inner.lastIndexOf('|');
    let core = inner;
    let alias: string | undefined;

    if (pipeIdx !== -1) {
      alias = inner.slice(pipeIdx + 1);
      core = inner.slice(0, pipeIdx);
    }

    // Extract heading (after #)
    const hashIdx = core.indexOf('#');
    let target = core;
    let heading: string | undefined;
    let blockRef: string | undefined;

    if (hashIdx !== -1) {
      heading = core.slice(hashIdx + 1);
      target = core.slice(0, hashIdx);
    } else {
      // Extract block ref (after ^)
      const caretIdx = core.indexOf('^');
      if (caretIdx !== -1) {
        blockRef = core.slice(caretIdx + 1);
        target = core.slice(0, caretIdx);
      }
    }

    return {
      raw,
      target,
      ...(alias !== undefined && { alias }),
      ...(heading !== undefined && { heading }),
      ...(blockRef !== undefined && { blockRef }),
      range: rangeFromOffsets(fullText, start, end),
    };
  }
}
