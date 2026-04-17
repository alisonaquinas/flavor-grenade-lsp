import { load as yamlLoad } from 'js-yaml';

/** Result of parsing the YAML frontmatter block from a document. */
export interface FrontmatterResult {
  /** Parsed YAML as a plain object, or `null` if absent or invalid. */
  frontmatter: Record<string, unknown> | null;
  /**
   * Character offset of the first character of the document body — i.e. the
   * character immediately after the closing `---\n`.  Returns `0` when there
   * is no frontmatter.
   */
  bodyOffset: number;
}

/**
 * Parses the YAML frontmatter block from the beginning of a document.
 *
 * A frontmatter block must start with `---` at offset 0, followed by a
 * newline, and close with a `---` on its own line.
 */
export class FrontmatterParser {
  /**
   * Parse the YAML frontmatter from `text`.
   *
   * @param text - Full document text.
   */
  parse(text: string): FrontmatterResult {
    if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
      return { frontmatter: null, bodyOffset: 0 };
    }

    const afterOpen = text.indexOf('\n', 0) + 1;
    const closeMatch = this.findClosingDelimiter(text, afterOpen);
    if (closeMatch === -1) {
      return { frontmatter: null, bodyOffset: 0 };
    }

    const yamlContent = text.slice(afterOpen, closeMatch);
    const bodyOffset = closeMatch + this.closingDelimiterLength(text, closeMatch);

    try {
      const parsed = yamlLoad(yamlContent);
      const frontmatter =
        parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;
      return { frontmatter, bodyOffset };
    } catch {
      return { frontmatter: null, bodyOffset: 0 };
    }
  }

  /** Find the offset of the `---` closing delimiter, searching from `from`. */
  private findClosingDelimiter(text: string, from: number): number {
    let pos = from;
    while (pos < text.length) {
      const nl = text.indexOf('\n', pos);
      const lineEnd = nl === -1 ? text.length : nl;
      const line = text.slice(pos, lineEnd);
      if (line === '---' || line === '---\r') {
        return pos;
      }
      pos = lineEnd + 1;
    }
    return -1;
  }

  /** Length of the closing delimiter line including its trailing newline. */
  private closingDelimiterLength(text: string, at: number): number {
    const nl = text.indexOf('\n', at);
    return nl === -1 ? text.length - at : nl - at + 1;
  }
}
