import type { Position } from 'vscode-languageserver-types';
import type {
  OFMDoc,
  WikiLinkEntry,
  EmbedEntry,
  TagEntry,
  HeadingEntry,
  BlockAnchorEntry,
} from '../parser/types.js';

/**
 * A discriminated union representing the OFM entity (or absence of entity)
 * at a specific cursor position within a document.
 */
export type CursorEntity =
  | { kind: 'wiki-link'; entry: WikiLinkEntry }
  | { kind: 'embed'; entry: EmbedEntry }
  | { kind: 'tag'; entry: TagEntry }
  | { kind: 'heading'; entry: HeadingEntry }
  | { kind: 'block-anchor'; entry: BlockAnchorEntry }
  | { kind: 'none' };

/**
 * Returns `true` when `position` falls within `range` (inclusive on both
 * endpoints).
 */
function positionInRange(
  position: Position,
  range: { start: Position; end: Position },
): boolean {
  const { start, end } = range;
  if (position.line < start.line || position.line > end.line) return false;
  if (position.line === start.line && position.character < start.character) return false;
  if (position.line === end.line && position.character > end.character) return false;
  return true;
}

/**
 * Determine which OFM entity, if any, the cursor is positioned on.
 *
 * Resolution priority (highest first):
 * 1. wiki-link  — most specific; checked first
 * 2. embed
 * 3. tag
 * 4. heading
 * 5. block-anchor
 * 6. none        — cursor is on plain text or whitespace
 *
 * When multiple entities share an overlapping range (unusual but possible),
 * the entity earlier in the priority list wins.
 *
 * @param doc      - The fully parsed OFM document.
 * @param position - The 0-based line/character cursor position.
 */
export function entityAtPosition(doc: OFMDoc, position: Position): CursorEntity {
  // Priority 1: wiki-links
  for (const entry of doc.index.wikiLinks) {
    if (positionInRange(position, entry.range)) {
      return { kind: 'wiki-link', entry };
    }
  }

  // Priority 2: embeds
  for (const entry of doc.index.embeds) {
    if (positionInRange(position, entry.range)) {
      return { kind: 'embed', entry };
    }
  }

  // Priority 3: tags
  for (const entry of doc.index.tags) {
    if (positionInRange(position, entry.range)) {
      return { kind: 'tag', entry };
    }
  }

  // Priority 4: headings
  for (const entry of doc.index.headings) {
    if (positionInRange(position, entry.range)) {
      return { kind: 'heading', entry };
    }
  }

  // Priority 5: block anchors
  for (const entry of doc.index.blockAnchors) {
    if (positionInRange(position, entry.range)) {
      return { kind: 'block-anchor', entry };
    }
  }

  return { kind: 'none' };
}
