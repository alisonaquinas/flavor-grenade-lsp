import type { OpaqueRegion } from './types.js';

/**
 * Detects code regions (fenced blocks, indented blocks, and inline spans) and
 * returns them as opaque regions.
 */
export class CodeParser {
  /**
   * Find all code regions in `text`.
   *
   * Priority: fenced > inline > indented.  Fenced and inline are detected in
   * a single pass; indented blocks only match in the gaps left by the others.
   *
   * @param text       - Full document text (including frontmatter prefix).
   * @param bodyOffset - Character offset where the document body begins.
   */
  static parse(text: string, bodyOffset: number): OpaqueRegion[] {
    const body = text.slice(bodyOffset);
    const regions: OpaqueRegion[] = [];

    CodeParser.parseFenced(body, bodyOffset, regions);
    CodeParser.parseInline(body, bodyOffset, regions);
    CodeParser.parseIndented(body, bodyOffset, regions);

    return regions;
  }

  // ── Fenced code blocks ────────────────────────────────────────────────────

  private static parseFenced(body: string, bodyOffset: number, out: OpaqueRegion[]): void {
    const fence = /^(`{3,}|~{3,})[^\n]*$/gm;
    let match: RegExpExecArray | null;

    while ((match = fence.exec(body)) !== null) {
      const openChar = match[1][0];
      const minLen = match[1].length;
      const openStart = match.index;

      // Find matching close fence (same char, same or greater length)
      const searchFrom = match.index + match[0].length + 1;
      const closeOffset = CodeParser.findCloseFence(body, searchFrom, openChar, minLen);
      if (closeOffset === -1) continue;

      const closeLineEnd = body.indexOf('\n', closeOffset);
      const end = closeLineEnd === -1 ? body.length : closeLineEnd + 1;
      out.push({ kind: 'code', start: bodyOffset + openStart, end: bodyOffset + end });
      fence.lastIndex = end;
    }
  }

  /** Scan for a closing fence line starting at `from`. */
  private static findCloseFence(
    body: string,
    from: number,
    char: string,
    minLen: number,
  ): number {
    let pos = from;
    while (pos < body.length) {
      const nlEnd = body.indexOf('\n', pos);
      const lineEnd = nlEnd === -1 ? body.length : nlEnd;
      const line = body.slice(pos, lineEnd);
      const trimmed = line.trimEnd();
      if (trimmed.split('').every((c) => c === char) && trimmed.length >= minLen) {
        return pos;
      }
      pos = lineEnd + 1;
    }
    return -1;
  }

  // ── Inline code spans ─────────────────────────────────────────────────────

  private static parseInline(body: string, bodyOffset: number, out: OpaqueRegion[]): void {
    let pos = 0;
    while (pos < body.length) {
      const tick = body.indexOf('`', pos);
      if (tick === -1) break;

      if (CodeParser.isInRegion(bodyOffset + tick, out)) {
        pos = tick + 1;
        continue;
      }

      // Count opening backticks
      let count = 1;
      while (tick + count < body.length && body[tick + count] === '`') count++;

      // Find matching closing run of same length
      const closing = '`'.repeat(count);
      const closeIdx = body.indexOf(closing, tick + count);
      if (closeIdx === -1) {
        pos = tick + count;
        continue;
      }

      out.push({
        kind: 'code',
        start: bodyOffset + tick,
        end: bodyOffset + closeIdx + count,
      });
      pos = closeIdx + count;
    }
  }

  // ── Indented code blocks ──────────────────────────────────────────────────

  private static parseIndented(body: string, bodyOffset: number, out: OpaqueRegion[]): void {
    const lines = body.split('\n');
    let offset = 0;
    let inBlock = false;
    let blockStart = 0;
    let prevBlank = true;

    for (const line of lines) {
      const lineEnd = offset + line.length;
      const isIndented = line.startsWith('    ') || line.startsWith('\t');
      const isBlank = line.trim() === '';

      if (isIndented && !isBlank && prevBlank) {
        if (!inBlock) {
          inBlock = true;
          blockStart = offset;
        }
      } else if (inBlock && !isIndented && !isBlank) {
        if (!CodeParser.isInRegion(bodyOffset + blockStart, out)) {
          out.push({ kind: 'code', start: bodyOffset + blockStart, end: bodyOffset + offset });
        }
        inBlock = false;
      }

      prevBlank = isBlank;
      offset = lineEnd + 1;
    }

    if (inBlock && !CodeParser.isInRegion(bodyOffset + blockStart, out)) {
      out.push({ kind: 'code', start: bodyOffset + blockStart, end: bodyOffset + offset });
    }
  }

  private static isInRegion(offset: number, regions: OpaqueRegion[]): boolean {
    return regions.some((r) => offset >= r.start && offset < r.end);
  }
}
