import type { OpaqueRegion } from './types.js';

/** Detects Obsidian Templater command spans and marks them opaque. */
export class TemplaterParser {
  static parse(
    text: string,
    bodyOffset: number,
    blockedRegions: OpaqueRegion[] = [],
  ): OpaqueRegion[] {
    const body = text.slice(bodyOffset);
    const blocked = [...blockedRegions].sort((left, right) => left.start - right.start);
    const regions: OpaqueRegion[] = [];
    let cursor = 0;

    while (cursor < body.length) {
      const start = body.indexOf('<%', cursor);
      if (start === -1) break;

      const absoluteStart = bodyOffset + start;
      const containingBlocked = blocked.find(
        (region) => absoluteStart >= region.start && absoluteStart < region.end,
      );
      if (containingBlocked !== undefined) {
        cursor = containingBlocked.end - bodyOffset;
        continue;
      }

      const nextBlocked = blocked.find((region) => region.start > absoluteStart);
      const close = body.indexOf('%>', start + 2);
      const closeEnd = close === -1 ? body.length : close + 2;
      const absoluteCloseEnd = bodyOffset + closeEnd;
      const absoluteEnd =
        nextBlocked !== undefined && absoluteCloseEnd > nextBlocked.start
          ? nextBlocked.start
          : absoluteCloseEnd;

      regions.push({ kind: 'templater', start: absoluteStart, end: absoluteEnd });
      cursor = absoluteEnd - bodyOffset;
    }

    return regions;
  }
}
