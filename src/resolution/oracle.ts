import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { DocId } from '../vault/doc-id.js';
import { FolderLookup } from '../vault/folder-lookup.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { HeadingEntry } from '../parser/types.js';
import type { MarkdownTargetClassification } from './markdown-target-classifier.js';
import { findHeadingsByAnchor, normalizeHeadingAnchor } from './heading-anchor.js';

/** The result of resolving a wiki-link target. */
export type ResolutionResult =
  | { kind: 'resolved'; targetDocId: DocId; headingTarget?: string; blockTarget?: string }
  | { kind: 'broken'; reason: 'not-found'; diagnosticCode: 'FG001' }
  | { kind: 'ambiguous'; candidates: DocId[]; diagnosticCode: 'FG002' }
  | { kind: 'malformed'; diagnosticCode: 'FG003' };

/** The result of resolving a classified standard Markdown target. */
export type MarkdownResolutionResult =
  | { kind: 'document-resolved'; targetDocId: DocId }
  | {
      kind: 'heading-resolved';
      targetDocId: DocId;
      heading: HeadingEntry;
      fragment: string;
      normalizedAnchor: string;
    }
  | { kind: 'document-missing'; diagnosticCode: 'FG001' }
  | { kind: 'document-ambiguous'; candidates: DocId[]; diagnosticCode: 'FG002' }
  | { kind: 'heading-missing'; targetDocId: DocId; fragment: string; diagnosticCode: 'FG001' }
  | {
      kind: 'heading-ambiguous';
      targetDocId: DocId;
      fragment: string;
      candidates: HeadingEntry[];
      diagnosticCode: 'FG002';
    }
  | { kind: 'non-vault' };

/**
 * Resolves wiki-link targets to vault documents using Obsidian-style document
 * matching plus Flavor Grenade alias/title fallbacks:
 * exact path → case-insensitive path → path suffix → alias → stem → H1 title.
 */
@Injectable()
export class Oracle {
  /** Lazy-built alias index: lowercased alias → DocId. */
  private aliasIndex: Map<string, DocId> | null = null;
  /** Lazy-built H1 title index: lowercased H1 heading text → DocId[]. */
  private titleIndex: Map<string, DocId[]> | null = null;

  constructor(
    private readonly folderLookup: FolderLookup,
    private readonly vaultIndex: VaultIndex,
  ) {}

  /**
   * Resolve a wiki-link target string.
   *
   * Resolution order:
   * 1. Empty/blank → malformed (FG003)
   * 2. Normalize backslashes to slashes and strip trailing `.md`
   * 3. Exact path match (check vaultIndex.has)
   * 4. Case-insensitive path match
   * 5. Path-suffix match for path-like targets
   *    - unique → resolved
   *    - multiple → ambiguous (FG002)
   *    - none → continue to step 6
   * 6. Alias match from frontmatter.aliases (case-insensitive)
   * 7. Stem suffix match via folderLookup.lookupByStem
   *    - unique → resolved
   *    - multiple → ambiguous (FG002)
   *    - none → continue to step 8
   * 8. H1 title match (case-insensitive first heading of level 1)
   *    - unique → resolved
   *    - multiple → ambiguous (FG002)
   *    - none → broken (FG001)
   *
   * @param target   - The link target string.
   * @param heading  - Optional heading fragment.
   * @param blockRef - Optional block reference id.
   */
  resolve(target: string, heading?: string, blockRef?: string): ResolutionResult {
    const normalizedTarget = normalizeWikiTarget(target);
    if (normalizedTarget.trim() === '') {
      return { kind: 'malformed', diagnosticCode: 'FG003' };
    }

    const exact = this.tryExactMatch(normalizedTarget, heading, blockRef);
    if (exact !== null) return exact;

    const caseInsensitive = this.tryCaseInsensitivePathMatch(normalizedTarget, heading, blockRef);
    if (caseInsensitive !== null) return caseInsensitive;

    const pathSuffix = this.tryPathSuffixMatch(normalizedTarget, heading, blockRef);
    if (pathSuffix !== null) return pathSuffix;

    const alias = this.tryAliasMatch(normalizedTarget, heading, blockRef);
    if (alias !== null) return alias;

    return this.tryStemMatch(normalizedTarget, heading, blockRef);
  }

  /**
   * Resolve a classified standard Markdown target through vault document and
   * heading rules.
   *
   * @param sourceDocId - DocId containing the Markdown target.
   * @param target      - Classified Markdown target.
   */
  resolveMarkdownTarget(
    sourceDocId: DocId,
    target: MarkdownTargetClassification,
  ): MarkdownResolutionResult {
    if (
      target.kind === 'external-url' ||
      target.kind === 'unsupported-scheme' ||
      target.kind === 'path-outside-vault'
    ) {
      return { kind: 'non-vault' };
    }

    if (target.kind === 'local-attachment') {
      return { kind: 'non-vault' };
    }

    if (target.kind === 'same-document-fragment') {
      return this.resolveMarkdownHeading(sourceDocId, target.fragment);
    }

    const targetDocId = this.resolveMarkdownDocId(target.path);
    if (targetDocId.kind !== 'resolved') return targetDocId;

    if (target.fragment !== undefined) {
      return this.resolveMarkdownHeading(targetDocId.targetDocId, target.fragment);
    }

    return { kind: 'document-resolved', targetDocId: targetDocId.targetDocId };
  }

  /**
   * No-op stub kept for interface compatibility.
   *
   * Alias matching is handled lazily inside {@link resolve} via
   * {@link getOrBuildAliasIndex}; callers should use `resolve()` directly.
   */
  resolveWithAlias(): void {
    // Alias index is built lazily inside resolve().
  }

  /** Invalidate the lazy alias and title caches (call after vault index changes). */
  invalidateAliasIndex(): void {
    this.aliasIndex = null;
    this.titleIndex = null;
  }

  private tryExactMatch(
    target: string,
    heading?: string,
    blockRef?: string,
  ): ResolutionResult | null {
    const docId = target as DocId;
    if (this.vaultIndex.has(docId)) {
      return this.makeResolved(docId, heading, blockRef);
    }
    return null;
  }

  private tryCaseInsensitivePathMatch(
    target: string,
    heading?: string,
    blockRef?: string,
  ): ResolutionResult | null {
    const lowerTarget = target.toLowerCase();
    for (const [docId] of this.vaultIndex.entries()) {
      if ((docId as string).toLowerCase() === lowerTarget) {
        return this.makeResolved(docId, heading, blockRef);
      }
    }
    return null;
  }

  private tryPathSuffixMatch(
    target: string,
    heading?: string,
    blockRef?: string,
  ): ResolutionResult | null {
    if (!target.includes('/')) return null;

    const lowerTarget = target.toLowerCase();
    const candidates: DocId[] = [];
    for (const [docId] of this.vaultIndex.entries()) {
      const docPath = docId as string;
      const lowerDocPath = docPath.toLowerCase();
      if (lowerDocPath.length <= lowerTarget.length) continue;

      const boundary = lowerDocPath.length - lowerTarget.length - 1;
      if (lowerDocPath.charAt(boundary) !== '/') continue;
      if (lowerDocPath.slice(boundary + 1) === lowerTarget) {
        candidates.push(docId);
      }
    }

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return this.makeResolved(candidates[0], heading, blockRef);
    return { kind: 'ambiguous', candidates, diagnosticCode: 'FG002' };
  }

  private resolveMarkdownDocId(
    targetDocId: DocId,
  ):
    | { kind: 'resolved'; targetDocId: DocId }
    | { kind: 'document-missing'; diagnosticCode: 'FG001' }
    | { kind: 'document-ambiguous'; candidates: DocId[]; diagnosticCode: 'FG002' } {
    if (this.vaultIndex.has(targetDocId)) {
      return { kind: 'resolved', targetDocId };
    }

    const result = this.resolve(targetDocId);
    if (result.kind === 'resolved') {
      return { kind: 'resolved', targetDocId: result.targetDocId };
    }
    if (result.kind === 'ambiguous') {
      return { kind: 'document-ambiguous', candidates: result.candidates, diagnosticCode: 'FG002' };
    }
    return { kind: 'document-missing', diagnosticCode: 'FG001' };
  }

  private resolveMarkdownHeading(targetDocId: DocId, fragment: string): MarkdownResolutionResult {
    const doc = this.vaultIndex.get(targetDocId);
    if (doc === undefined) {
      return { kind: 'document-missing', diagnosticCode: 'FG001' };
    }

    const candidates = findHeadingsByAnchor(doc.index.headings, fragment);
    if (candidates.length === 1) {
      return {
        kind: 'heading-resolved',
        targetDocId,
        heading: candidates[0],
        fragment,
        normalizedAnchor: normalizeHeadingAnchor(fragment),
      };
    }
    if (candidates.length > 1) {
      return {
        kind: 'heading-ambiguous',
        targetDocId,
        fragment,
        candidates,
        diagnosticCode: 'FG002',
      };
    }
    return { kind: 'heading-missing', targetDocId, fragment, diagnosticCode: 'FG001' };
  }

  private tryAliasMatch(
    target: string,
    heading?: string,
    blockRef?: string,
  ): ResolutionResult | null {
    const index = this.getOrBuildAliasIndex();
    const match = index.get(target.toLowerCase());
    if (match !== undefined) {
      return this.makeResolved(match, heading, blockRef);
    }
    return null;
  }

  private tryStemMatch(target: string, heading?: string, blockRef?: string): ResolutionResult {
    let candidates = this.folderLookup.lookupByStem(target);
    if (candidates.length === 0) {
      candidates = this.findCaseInsensitiveStemMatches(target);
    }
    if (candidates.length === 1) {
      return this.makeResolved(candidates[0], heading, blockRef);
    }
    if (candidates.length > 1) {
      return { kind: 'ambiguous', candidates, diagnosticCode: 'FG002' };
    }
    // Fall through to H1 title match before returning broken
    const titleResult = this.tryTitleMatch(target, heading, blockRef);
    if (titleResult !== null) return titleResult;
    return { kind: 'broken', reason: 'not-found', diagnosticCode: 'FG001' };
  }

  private findCaseInsensitiveStemMatches(target: string): DocId[] {
    const lowerTarget = target.toLowerCase();
    const matches: DocId[] = [];
    for (const [docId] of this.vaultIndex.entries()) {
      const segments = (docId as string).split('/');
      const stem = segments[segments.length - 1];
      if (stem.toLowerCase() === lowerTarget) {
        matches.push(docId);
      }
    }
    return matches;
  }

  private tryTitleMatch(
    target: string,
    heading?: string,
    blockRef?: string,
  ): ResolutionResult | null {
    const index = this.getOrBuildTitleIndex();
    const key = target.toLowerCase();
    const docIds = index.get(key);
    if (!docIds || docIds.length === 0) return null;
    if (docIds.length === 1) return this.makeResolved(docIds[0], heading, blockRef);
    return { kind: 'ambiguous', candidates: docIds, diagnosticCode: 'FG002' };
  }

  private getOrBuildTitleIndex(): Map<string, DocId[]> {
    if (this.titleIndex !== null) return this.titleIndex;

    const index = new Map<string, DocId[]>();
    for (const [docId, doc] of this.vaultIndex.entries()) {
      const h1 = doc.index.headings.find((h) => h.level === 1);
      if (h1) {
        const key = h1.text.toLowerCase();
        const existing = index.get(key);
        if (existing) existing.push(docId);
        else index.set(key, [docId]);
      }
    }
    this.titleIndex = index;
    return index;
  }

  private makeResolved(
    targetDocId: DocId,
    heading?: string,
    blockRef?: string,
  ): ResolutionResult & { kind: 'resolved' } {
    const result: ResolutionResult & { kind: 'resolved' } = {
      kind: 'resolved',
      targetDocId,
    };
    if (heading !== undefined) result.headingTarget = heading;
    if (blockRef !== undefined) result.blockTarget = blockRef;
    return result;
  }

  private getOrBuildAliasIndex(): Map<string, DocId> {
    if (this.aliasIndex !== null) return this.aliasIndex;

    const index = new Map<string, DocId>();
    for (const [docId, doc] of this.vaultIndex.entries()) {
      const aliases = this.extractAliases(doc.frontmatter);
      for (const alias of aliases) {
        index.set(alias.toLowerCase(), docId);
      }
    }
    this.aliasIndex = index;
    return index;
  }

  private extractAliases(frontmatter: Record<string, unknown> | null): string[] {
    if (frontmatter === null) return [];
    const aliases = frontmatter['aliases'];
    if (!Array.isArray(aliases)) return [];
    return aliases.filter((a): a is string => typeof a === 'string');
  }
}

function normalizeWikiTarget(target: string): string {
  return target.replace(/\\/g, '/').replace(/\.md$/i, '');
}
