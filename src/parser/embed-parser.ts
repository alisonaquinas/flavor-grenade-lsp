import type { OpaqueRegion, EmbedEntry } from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Image file extensions that support width/height size specifiers. */
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp']);

/**
 * Parses `![[embeds]]` from a document, respecting opaque regions.
 *
 * Image embeds support a `|<width>` or `|<width>x<height>` size specifier.
 * Non-image embeds support an alias after `|`.
 */
export class EmbedParser {
  /**
   * Find all embed tokens in `text`, skipping tokens inside `opaqueRegions`.
   *
   * @param text          - Full document text.
   * @param opaqueRegions - Sorted list of opaque regions to skip.
   */
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): EmbedEntry[] {
    const entries: EmbedEntry[] = [];
    const pattern = /!\[\[/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const openIdx = match.index;
      if (isInsideOpaqueRegion(openIdx, opaqueRegions as OpaqueRegion[])) continue;

      const close = text.indexOf(']]', openIdx + 3);
      if (close === -1) continue;

      const inner = text.slice(openIdx + 3, close);
      const raw = text.slice(openIdx, close + 2);
      entries.push(EmbedParser.parseInner(inner, raw, text, openIdx, close + 2));
    }

    return entries;
  }

  private static parseInner(
    inner: string,
    raw: string,
    fullText: string,
    start: number,
    end: number,
  ): EmbedEntry {
    const pipeIdx = inner.indexOf('|');
    const target = pipeIdx === -1 ? inner : inner.slice(0, pipeIdx);
    const afterPipe = pipeIdx === -1 ? '' : inner.slice(pipeIdx + 1);

    const ext = EmbedParser.extension(target);
    const isImage = IMAGE_EXTENSIONS.has(ext);

    let width: number | undefined;
    let height: number | undefined;
    let alias: string | undefined;

    if (afterPipe) {
      if (isImage) {
        const sizeMatch = /^(\d+)(?:x(\d+))?$/.exec(afterPipe);
        if (sizeMatch) {
          width = parseInt(sizeMatch[1], 10);
          if (sizeMatch[2]) height = parseInt(sizeMatch[2], 10);
        } else {
          alias = afterPipe;
        }
      } else {
        alias = afterPipe;
      }
    }

    return {
      raw,
      target,
      ...(alias !== undefined && { alias }),
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      range: rangeFromOffsets(fullText, start, end),
    };
  }

  private static extension(target: string): string {
    const dot = target.lastIndexOf('.');
    return dot === -1 ? '' : target.slice(dot + 1).toLowerCase();
  }
}
