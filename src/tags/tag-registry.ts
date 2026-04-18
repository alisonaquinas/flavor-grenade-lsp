import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Range } from 'vscode-languageserver-types';
import type { OFMDoc } from '../parser/types.js';
import type { VaultIndex } from '../vault/vault-index.js';
import type { DocId } from '../vault/doc-id.js';

/**
 * A single occurrence of a tag in the vault.
 */
export interface TagOccurrence {
  /** The vault-relative document identifier where the tag was found. */
  docId: DocId;
  /** LSP range of the tag token (or line 0 for frontmatter tags). */
  range: Range;
  /** Whether the tag came from an inline `#tag` or a YAML frontmatter `tags:` list. */
  source: 'inline' | 'frontmatter';
}

/**
 * A node in the slash-delimited tag hierarchy tree.
 */
export interface TagNode {
  /** The single path segment at this level (e.g. `'project'` for `#project/active`). */
  segment: string;
  /** The full tag path from root to this node (e.g. `'#project/active'`). */
  fullTag: string;
  /** Child nodes for nested tags. */
  children: TagNode[];
  /**
   * Total occurrence count for this node, aggregated from all descendant occurrences
   * (including those of child nodes).
   */
  count: number;
}

/**
 * Maintains a vault-wide index of all tag occurrences, supporting frequency
 * queries, prefix filtering, and slash-delimited hierarchy traversal.
 *
 * Tags are stored with their `#` sigil (e.g. `'#project/active'`). Frontmatter
 * `tags:` array entries are stored with the `#` prefix added if absent.
 */
@Injectable()
export class TagRegistry {
  /**
   * Map from normalised tag string (with `#`) → list of all occurrences.
   */
  private readonly occurrenceMap = new Map<string, TagOccurrence[]>();

  // ────────────────────────────────────────────────────────────
  // Bulk operations
  // ────────────────────────────────────────────────────────────

  /**
   * Rebuild the entire registry from a {@link VaultIndex}.
   *
   * Clears all existing data before re-indexing every document.
   *
   * @param index - The current vault index.
   */
  rebuild(index: VaultIndex): void {
    this.occurrenceMap.clear();
    for (const [docId, doc] of index.entries()) {
      this.indexDoc(docId, doc);
    }
  }

  // ────────────────────────────────────────────────────────────
  // Incremental operations
  // ────────────────────────────────────────────────────────────

  /**
   * Add (or replace) all tag occurrences for a single document.
   *
   * Safe to call multiple times for the same `docId` — existing entries for
   * that document are removed first (upsert semantics).
   *
   * @param docId - The vault-relative document identifier.
   * @param doc   - The parsed OFM document.
   */
  addDoc(docId: DocId, doc: OFMDoc): void {
    this.removeDoc(docId);
    this.indexDoc(docId, doc);
  }

  /**
   * Remove all tag occurrences that belong to `docId`.
   *
   * @param docId - The vault-relative document identifier.
   */
  removeDoc(docId: DocId): void {
    for (const [tag, occs] of this.occurrenceMap.entries()) {
      const filtered = occs.filter((o) => o.docId !== docId);
      if (filtered.length === 0) {
        this.occurrenceMap.delete(tag);
      } else {
        this.occurrenceMap.set(tag, filtered);
      }
    }
  }

  // ────────────────────────────────────────────────────────────
  // Queries
  // ────────────────────────────────────────────────────────────

  /**
   * Return all known tags sorted by occurrence count (descending).
   *
   * @returns Array of `{ tag, count }` records.
   */
  allTags(): Array<{ tag: string; count: number }> {
    const result: Array<{ tag: string; count: number }> = [];
    for (const [tag, occs] of this.occurrenceMap.entries()) {
      result.push({ tag, count: occs.length });
    }
    result.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    return result;
  }

  /**
   * Return all occurrences of an exact tag (case-sensitive).
   *
   * @param tag - Full tag string including the `#` sigil.
   */
  occurrences(tag: string): TagOccurrence[] {
    return this.occurrenceMap.get(tag) ?? [];
  }

  /**
   * Return all known tag strings whose body (after `#`) starts with `prefix`.
   *
   * The leading `#` is stripped from `prefix` before matching, so callers
   * may pass either `'proj'` or `'#proj'`.
   *
   * @param prefix - The prefix to filter by.
   * @returns Array of full tag strings (with `#` sigil).
   */
  tagsWithPrefix(prefix: string): string[] {
    const bare = prefix.startsWith('#') ? prefix.slice(1) : prefix;
    const result: string[] = [];
    for (const tag of this.occurrenceMap.keys()) {
      const body = tag.slice(1); // strip leading '#'
      if (body.startsWith(bare)) {
        result.push(tag);
      }
    }
    return result;
  }

  /**
   * Build the slash-delimited tag hierarchy as a tree of {@link TagNode} roots.
   *
   * Each root node represents a top-level tag segment. Intermediate nodes are
   * created even when no document uses the parent tag by itself. Counts are
   * aggregated bottom-up so that a parent node's count equals the total number
   * of occurrences across all of its descendants (and itself).
   */
  hierarchy(): TagNode[] {
    // Map from fullTag → node (used to deduplicate intermediate nodes)
    const nodeMap = new Map<string, TagNode>();

    // Ensure every intermediate path exists in nodeMap
    const ensureNode = (segments: string[]): TagNode => {
      const fullTag = '#' + segments.join('/');
      const existing = nodeMap.get(fullTag);
      if (existing !== undefined) return existing;

      const node: TagNode = {
        segment: segments[segments.length - 1],
        fullTag,
        children: [],
        count: 0,
      };
      nodeMap.set(fullTag, node);
      return node;
    };

    // First pass: ensure all nodes and intermediate ancestors exist.
    for (const [tag] of this.occurrenceMap.entries()) {
      const body = tag.slice(1); // strip '#'
      const parts = body.split('/');
      for (let depth = 1; depth <= parts.length; depth++) {
        ensureNode(parts.slice(0, depth));
      }
    }

    // Second pass: assign direct occurrence counts for leaf/exact tags.
    for (const [tag, occs] of this.occurrenceMap.entries()) {
      const node = nodeMap.get(tag);
      if (node !== undefined) {
        node.count = occs.length;
      }
    }

    // Third pass: propagate counts from leaves to roots (bottom-up).
    // Sort by depth (deepest first) to ensure correct propagation order.
    const sortedNodes = [...nodeMap.values()].sort(
      (a, b) => b.fullTag.split('/').length - a.fullTag.split('/').length,
    );

    for (const node of sortedNodes) {
      const parentFullTag = this.parentFullTag(node.fullTag);
      if (parentFullTag !== null) {
        const parent = nodeMap.get(parentFullTag);
        if (parent !== undefined) {
          parent.count += node.count;
        }
      }
    }

    // Fourth pass: wire children into parents.
    for (const node of nodeMap.values()) {
      const parentFullTag = this.parentFullTag(node.fullTag);
      if (parentFullTag !== null) {
        const parent = nodeMap.get(parentFullTag);
        if (parent !== undefined) {
          parent.children.push(node);
        }
      }
    }

    // Collect root nodes (those with no parent in the map).
    const roots: TagNode[] = [];
    for (const node of nodeMap.values()) {
      if (this.parentFullTag(node.fullTag) === null) {
        roots.push(node);
      }
    }

    return roots;
  }

  // ────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────

  private indexDoc(docId: DocId, doc: OFMDoc): void {
    // Inline tags
    for (const tagEntry of doc.index.tags) {
      this.pushOccurrence(tagEntry.tag, {
        docId,
        range: tagEntry.range,
        source: 'inline',
      });
    }

    // Frontmatter tags
    if (doc.frontmatter !== null) {
      const raw = doc.frontmatter['tags'];
      if (Array.isArray(raw)) {
        const frontmatterRange = {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        };
        for (const item of raw) {
          if (typeof item !== 'string') continue;
          const tag = item.startsWith('#') ? item : `#${item}`;
          this.pushOccurrence(tag, {
            docId,
            range: frontmatterRange,
            source: 'frontmatter',
          });
        }
      }
    }
  }

  private pushOccurrence(tag: string, occ: TagOccurrence): void {
    const list = this.occurrenceMap.get(tag);
    if (list !== undefined) {
      list.push(occ);
    } else {
      this.occurrenceMap.set(tag, [occ]);
    }
  }

  /**
   * Return the parent's fullTag for a given fullTag, or `null` for roots.
   *
   * @example `parentFullTag('#a/b/c') === '#a/b'`
   * @example `parentFullTag('#root') === null`
   */
  private parentFullTag(fullTag: string): string | null {
    const lastSlash = fullTag.lastIndexOf('/');
    if (lastSlash === -1) return null; // root node (e.g. '#work')
    return fullTag.slice(0, lastSlash);
  }
}
