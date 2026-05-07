import type { OpaqueRegion } from './types.js';

/** Detects Obsidian Templater command spans and marks them opaque. */
export class TemplaterParser {
  static parse(text: string, bodyOffset: number): OpaqueRegion[] {
    const body = text.slice(bodyOffset);
    const regions: OpaqueRegion[] = [];
    let cursor = 0;

    while (cursor < body.length) {
      const start = body.indexOf('<%', cursor);
      if (start === -1) break;

      const close = body.indexOf('%>', start + 2);
      const end = close === -1 ? body.length : close + 2;
      regions.push({ kind: 'templater', start: bodyOffset + start, end: bodyOffset + end });
      cursor = end;
    }

    return regions;
  }
}
