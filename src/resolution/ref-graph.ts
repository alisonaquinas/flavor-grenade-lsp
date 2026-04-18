import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { WikiLinkEntry, EmbedEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { VaultIndex } from '../vault/vault-index.js';
import { Oracle } from './oracle.js';
import { EmbedResolver } from './embed-resolver.js';

/** Vault-relative path (DocId) used as the definition key for references. */
export type DefKey = string;

/** A resolved or unresolved reference from one document to another. */
export interface Ref {
  /** DocId of the document containing the wiki-link. */
  sourceDocId: DocId;
  /** The parsed wiki-link entry. */
  entry: WikiLinkEntry;
  /** Resolved target DocId, or null if broken/ambiguous/malformed. */
  resolvedTo: DefKey | null;
}

/**
 * A resolved or unresolved embed reference from one document to another
 * document or asset.
 */
export interface EmbedRef {
  /** DocId of the document containing the `![[embed]]`. */
  sourceDocId: DocId;
  /** The parsed embed entry. */
  entry: EmbedEntry;
  /** Resolved target DefKey (DocId or asset path), or null if broken. */
  resolvedTo: DefKey | null;
  /** Optional parsed image size specifier from the embed token. */
  embedSize?: { width: number; height?: number };
  /** Whether the embed target could not be resolved. */
  broken: boolean;
}

/**
 * Maintains a graph of all wiki-link and embed references across the vault.
 *
 * Must be rebuilt after each vault scan or file change.
 */
@Injectable()
export class RefGraph {
  /** Map from DefKey (target) to all Refs pointing at it. */
  private refsToMap = new Map<DefKey, Ref[]>();
  /** All refs with resolvedTo === null (broken). */
  private unresolvedRefs: Ref[] = [];
  /** All refs that are ambiguous (resolvedTo === null, ambiguous resolution). */
  private ambiguousRefs: Ref[] = [];

  /** Map from DefKey (target) to all EmbedRefs pointing at it. */
  private embedRefsMap = new Map<DefKey, EmbedRef[]>();
  /** All embed refs that could not be resolved. */
  private brokenEmbeds: EmbedRef[] = [];

  /**
   * Rebuild the reference graph from all documents in the vault index.
   *
   * @param index         - Current vault index.
   * @param oracle        - Oracle used to resolve each wiki-link.
   * @param embedResolver - Optional EmbedResolver for embed tracking. When
   *                        omitted, embeds are not indexed in this rebuild.
   */
  rebuild(index: VaultIndex, oracle: Oracle, embedResolver?: EmbedResolver): void {
    this.refsToMap = new Map();
    this.unresolvedRefs = [];
    this.ambiguousRefs = [];
    this.embedRefsMap = new Map();
    this.brokenEmbeds = [];

    oracle.invalidateAliasIndex();

    for (const [sourceDocId, doc] of index.entries()) {
      for (const entry of doc.index.wikiLinks) {
        const result = oracle.resolve(entry.target, entry.heading, entry.blockRef);
        const ref = this.buildRef(sourceDocId, entry, result);
        this.registerRef(ref, result);
      }

      if (embedResolver !== undefined) {
        for (const entry of doc.index.embeds) {
          const resolution = embedResolver.resolve(entry);
          const embedRef = this.buildEmbedRef(sourceDocId, entry, resolution);
          this.registerEmbedRef(embedRef);
        }
      }
    }
  }

  /**
   * Get all references that resolve to the given definition key.
   *
   * @param defKey - Target DocId to look up references for.
   */
  getRefsTo(defKey: DefKey): Ref[] {
    return this.refsToMap.get(defKey) ?? [];
  }

  /** Get all references that could not be resolved (broken links). */
  getUnresolvedRefs(): Ref[] {
    return [...this.unresolvedRefs];
  }

  /** Get all references that resolved to multiple candidates (ambiguous links). */
  getAmbiguousRefs(): Ref[] {
    return [...this.ambiguousRefs];
  }

  /**
   * Add a single embed reference to the graph.
   *
   * @param ref - The embed reference to register.
   */
  addEmbedRef(ref: EmbedRef): void {
    this.registerEmbedRef(ref);
  }

  /**
   * Get all embed references that resolve to the given definition key.
   *
   * @param defKey - Target DefKey to look up embed references for.
   */
  getEmbedRefsTo(defKey: DefKey): EmbedRef[] {
    return this.embedRefsMap.get(defKey) ?? [];
  }

  /** Get all embed references that could not be resolved (broken embeds). */
  getBrokenEmbedRefs(): EmbedRef[] {
    return [...this.brokenEmbeds];
  }

  private buildRef(
    sourceDocId: DocId,
    entry: WikiLinkEntry,
    result: ReturnType<Oracle['resolve']>,
  ): Ref {
    const resolvedTo = result.kind === 'resolved' ? result.targetDocId : null;
    return { sourceDocId, entry, resolvedTo };
  }

  private registerRef(ref: Ref, result: ReturnType<Oracle['resolve']>): void {
    if (result.kind === 'resolved') {
      const existing = this.refsToMap.get(result.targetDocId);
      if (existing !== undefined) {
        existing.push(ref);
      } else {
        this.refsToMap.set(result.targetDocId, [ref]);
      }
    } else if (result.kind === 'ambiguous') {
      this.ambiguousRefs.push(ref);
    } else {
      // broken or malformed
      this.unresolvedRefs.push(ref);
    }
  }

  private buildEmbedRef(
    sourceDocId: DocId,
    entry: EmbedEntry,
    resolution: ReturnType<EmbedResolver['resolve']>,
  ): EmbedRef {
    const resolvedTo =
      resolution.kind === 'markdown'
        ? resolution.targetDocId
        : resolution.kind === 'asset'
          ? resolution.assetPath
          : null;
    const broken = resolution.kind === 'broken';
    const ref: EmbedRef = { sourceDocId, entry, resolvedTo, broken };
    if (entry.width !== undefined) {
      ref.embedSize = { width: entry.width, ...(entry.height !== undefined && { height: entry.height }) };
    }
    return ref;
  }

  private registerEmbedRef(ref: EmbedRef): void {
    if (ref.resolvedTo !== null) {
      const existing = this.embedRefsMap.get(ref.resolvedTo);
      if (existing !== undefined) {
        existing.push(ref);
      } else {
        this.embedRefsMap.set(ref.resolvedTo, [ref]);
      }
    } else {
      this.brokenEmbeds.push(ref);
    }
  }
}
