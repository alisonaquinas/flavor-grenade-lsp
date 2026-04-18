import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { DocId } from '../vault/doc-id.js';
import { FolderLookup } from '../vault/folder-lookup.js';
import { VaultIndex } from '../vault/vault-index.js';

/** The result of resolving a wiki-link target. */
export type ResolutionResult =
  | { kind: 'resolved'; targetDocId: DocId; headingTarget?: string; blockTarget?: string }
  | { kind: 'broken'; reason: 'not-found'; diagnosticCode: 'FG001' }
  | { kind: 'ambiguous'; candidates: DocId[]; diagnosticCode: 'FG002' }
  | { kind: 'malformed'; diagnosticCode: 'FG003' };

/**
 * Resolves wiki-link targets to vault documents using a three-step strategy:
 * exact path → alias → stem.
 */
@Injectable()
export class Oracle {
  /** Lazy-built alias index: lowercased alias → DocId. */
  private aliasIndex: Map<string, DocId> | null = null;

  constructor(
    private readonly folderLookup: FolderLookup,
    private readonly vaultIndex: VaultIndex,
  ) {}

  /**
   * Resolve a wiki-link target string.
   *
   * Resolution order:
   * 1. Empty/blank → malformed (FG003)
   * 2. Exact path match (check vaultIndex.has)
   * 3. Alias match from frontmatter.aliases (case-insensitive)
   * 4. Stem suffix match via folderLookup.lookupByStem
   *    - unique → resolved
   *    - multiple → ambiguous (FG002)
   *    - none → broken (FG001)
   *
   * @param target   - The link target string.
   * @param heading  - Optional heading fragment.
   * @param blockRef - Optional block reference id.
   */
  resolve(target: string, heading?: string, blockRef?: string): ResolutionResult {
    if (target.trim() === '') {
      return { kind: 'malformed', diagnosticCode: 'FG003' };
    }

    const exact = this.tryExactMatch(target, heading, blockRef);
    if (exact !== null) return exact;

    const alias = this.tryAliasMatch(target, heading, blockRef);
    if (alias !== null) return alias;

    return this.tryStemMatch(target, heading, blockRef);
  }

  /** Placeholder to satisfy TASK-064 interface requirement. */
  resolveWithAlias(): void {
    // Alias index is built lazily inside resolve().
  }

  /** Invalidate the lazy alias cache (call after vault index changes). */
  invalidateAliasIndex(): void {
    this.aliasIndex = null;
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
    const candidates = this.folderLookup.lookupByStem(target);
    if (candidates.length === 1) {
      return this.makeResolved(candidates[0], heading, blockRef);
    }
    if (candidates.length > 1) {
      return { kind: 'ambiguous', candidates, diagnosticCode: 'FG002' };
    }
    return { kind: 'broken', reason: 'not-found', diagnosticCode: 'FG001' };
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
