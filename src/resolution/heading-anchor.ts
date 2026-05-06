import type { HeadingEntry } from '../parser/types.js';

/** Convert a heading text into the Markdown anchor text Flavor Grenade emits. */
export function headingAnchorForText(text: string): string {
  return text.trim().replace(/\s+/g, '-');
}

/** Normalize user-provided or emitted heading anchors for comparison. */
export function normalizeHeadingAnchor(anchor: string): string {
  return decodeURIComponent(anchor).replace(/^#/, '').trim().replace(/\s+/g, '-').toLowerCase();
}

/**
 * Find all headings whose normalized anchor matches `fragment`.
 *
 * @param headings  - Candidate headings from a parsed OFM document.
 * @param fragment  - Markdown or wiki heading fragment without the leading `#`.
 */
export function findHeadingsByAnchor(
  headings: readonly HeadingEntry[],
  fragment: string,
): HeadingEntry[] {
  const target = normalizeHeadingAnchor(fragment);
  return headings.filter(
    (heading) => normalizeHeadingAnchor(headingAnchorForText(heading.text)) === target,
  );
}
