import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type {
  WikiLinkEntry,
  EmbedEntry,
  BlockAnchorEntry,
  MarkdownLinkRef,
  MarkdownImageRef,
  LinkLabelRef,
  LinkLabelDef,
} from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { VaultIndex } from '../vault/vault-index.js';
import { Oracle } from './oracle.js';
import { EmbedResolver } from './embed-resolver.js';
import { classifyMarkdownTarget } from './markdown-target-classifier.js';

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

/** A resolved or unresolved standard Markdown document reference. */
export interface MarkdownLinkGraphRef {
  /** DocId of the document containing the Markdown reference. */
  sourceDocId: DocId;
  /** Parsed inline link, reference label, or label definition backing the ref. */
  entry: MarkdownLinkRef | LinkLabelRef | LinkLabelDef;
  /** The matching label definition when `entry` is a label use. */
  definition?: LinkLabelDef;
  /** Resolved target DocId, or null if broken. */
  resolvedTo: DefKey | null;
}

/** A standard Markdown image reference to a local attachment. */
export interface MarkdownImageGraphRef {
  /** DocId of the document containing the Markdown image reference. */
  sourceDocId: DocId;
  /** Parsed Markdown image entry. */
  entry: MarkdownImageRef;
  /** Vault-relative attachment path. */
  resolvedTo: DefKey;
}

/** A document-local label-use binding. */
export interface LinkLabelGraphRef {
  /** DocId of the document containing the label use. */
  sourceDocId: DocId;
  /** Parsed label use. */
  entry: LinkLabelRef;
  /** Matching definition in the same document. */
  definition: LinkLabelDef;
  /** Resolved target DocId when the definition target is local Markdown. */
  resolvedTo: DefKey | null;
}

/**
 * A resolved or unresolved block reference from one document to a block anchor
 * in the same or another document.
 */
export interface CrossBlockRef {
  /** DocId of the document containing the wiki-link with blockRef. */
  sourceDocId: DocId;
  /** DocId of the target document, or null for intra-document block refs. */
  targetDocId: DocId | null;
  /** The block anchor ID (without the `^` sigil). */
  anchorId: string;
  /** The wiki-link entry that contains the blockRef. */
  entry: WikiLinkEntry;
  /** The resolved block anchor entry, or null if not found. */
  resolvedAnchor: BlockAnchorEntry | null;
  /** FG005 if the anchor was not found; null if resolved. */
  diagnostic: 'FG005' | null;
}

/**
 * Composite key for block ref lookup: `docId\0anchorId`.
 *
 * `docId` is always the document that *owns* the anchor — i.e. `targetDocId`
 * for cross-document refs and `sourceDocId` for intra-document refs.
 */
type BlockRefKey = string;

function blockRefKey(docId: DocId, anchorId: string): BlockRefKey {
  return `${docId}\0${anchorId}`;
}

type LabelRefKey = string;

function labelRefKey(docId: DocId, normalizedLabel: string): LabelRefKey {
  return `${docId}\0${normalizedLabel}`;
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

  /** Map from BlockRefKey to all CrossBlockRefs for that anchor. */
  private blockRefsMap = new Map<BlockRefKey, CrossBlockRef[]>();
  /** All CrossBlockRefs with diagnostic === 'FG005'. */
  private brokenBlockRefsList: CrossBlockRef[] = [];

  /** Map from target DocId to Markdown links that resolve to it. */
  private markdownRefsToMap = new Map<DefKey, MarkdownLinkGraphRef[]>();
  /** Markdown refs whose local targets could not be resolved. */
  private unresolvedMarkdownRefs: MarkdownLinkGraphRef[] = [];
  /** Map from local attachment path to Markdown image refs. */
  private markdownImageRefsMap = new Map<DefKey, MarkdownImageGraphRef[]>();
  /** Map from document-local normalized label to bound label refs. */
  private labelRefsMap = new Map<LabelRefKey, LinkLabelGraphRef[]>();

  /**
   * Rebuild the reference graph from all documents in the vault index.
   *
   * @param index         - Current vault index.
   * @param oracle        - Oracle used to resolve each wiki-link.
   * @param embedResolver - Optional EmbedResolver for embed tracking. When
   *                        omitted, embeds are not indexed in this rebuild.
   */
  rebuild(index: VaultIndex, oracle: Oracle, embedResolver?: EmbedResolver): void {
    this.currentIndex = index;
    this.refsToMap = new Map();
    this.unresolvedRefs = [];
    this.ambiguousRefs = [];
    this.embedRefsMap = new Map();
    this.brokenEmbeds = [];
    this.blockRefsMap = new Map();
    this.brokenBlockRefsList = [];
    this.markdownRefsToMap = new Map();
    this.unresolvedMarkdownRefs = [];
    this.markdownImageRefsMap = new Map();
    this.labelRefsMap = new Map();

    oracle.invalidateAliasIndex();

    for (const [sourceDocId, doc] of index.entries()) {
      for (const entry of doc.index.wikiLinks) {
        if (entry.blockRef !== undefined) {
          // Block ref wiki-link: handle separately
          const crossRef = this.buildCrossBlockRef(sourceDocId, entry, index, oracle);
          if (crossRef !== null) {
            this.registerBlockRef(crossRef);
          }
          // Also register as a normal ref for doc-level resolution
          const result = oracle.resolve(entry.target, entry.heading, entry.blockRef);
          // Only register as wiki-link ref if it resolves to a document
          // (intra-doc block refs have empty target → malformed from oracle's view)
          if (entry.target !== '') {
            const ref = this.buildRef(sourceDocId, entry, result);
            this.registerRef(ref, result);
          }
        } else {
          const result = oracle.resolve(entry.target, entry.heading, entry.blockRef);
          const ref = this.buildRef(sourceDocId, entry, result);
          this.registerRef(ref, result);
        }
      }

      if (embedResolver !== undefined) {
        for (const entry of doc.index.embeds) {
          const resolution = embedResolver.resolve(entry);
          const embedRef = this.buildEmbedRef(sourceDocId, entry, resolution);
          this.registerEmbedRef(embedRef);
        }
      }

      this.registerMarkdownEntries(sourceDocId, doc.index.markdownLinks ?? []);
      this.registerMarkdownImages(sourceDocId, doc.index.markdownImages ?? []);
      this.registerLabelDefinitions(sourceDocId, doc.index.linkLabelDefs ?? []);
      this.registerLabelRefs(
        sourceDocId,
        doc.index.linkLabelRefs ?? [],
        doc.index.linkLabelDefs ?? [],
      );
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

  /**
   * Add a single block reference to the graph.
   *
   * @param ref - The block reference to register.
   */
  addBlockRef(ref: CrossBlockRef): void {
    this.registerBlockRef(ref);
  }

  /**
   * Get all block references that point to the given anchor in the given doc.
   *
   * `docId` is the document that owns the anchor. For cross-document refs this
   * is the target document; for intra-document refs this is the source document
   * (since the anchor lives in the same file).
   *
   * @param docId    - DocId of the document containing the anchor.
   * @param anchorId - Block anchor ID.
   */
  getBlockRefsToAnchor(docId: DocId, anchorId: string): CrossBlockRef[] {
    return this.blockRefsMap.get(blockRefKey(docId, anchorId)) ?? [];
  }

  /** Get all block references that could not be resolved (FG005). */
  getBrokenBlockRefs(): CrossBlockRef[] {
    return [...this.brokenBlockRefsList];
  }

  /**
   * Get all standard Markdown references that resolve to the given DocId.
   *
   * @param defKey - Target DocId to look up Markdown refs for.
   */
  getMarkdownRefsTo(defKey: DefKey): MarkdownLinkGraphRef[] {
    return this.markdownRefsToMap.get(defKey) ?? [];
  }

  /** Get all local Markdown refs whose target could not be resolved. */
  getUnresolvedMarkdownRefs(): MarkdownLinkGraphRef[] {
    return [...this.unresolvedMarkdownRefs];
  }

  /**
   * Get all Markdown image refs that point to a local attachment path.
   *
   * @param defKey - Vault-relative attachment path.
   */
  getMarkdownImageRefsTo(defKey: DefKey): MarkdownImageGraphRef[] {
    return this.markdownImageRefsMap.get(defKey) ?? [];
  }

  /**
   * Get same-document label refs bound to a label definition.
   *
   * @param sourceDocId     - DocId containing the label definition.
   * @param normalizedLabel - Case-normalized label key.
   */
  getLabelRefsTo(sourceDocId: DocId, normalizedLabel: string): LinkLabelGraphRef[] {
    return this.labelRefsMap.get(labelRefKey(sourceDocId, normalizedLabel.toLowerCase())) ?? [];
  }

  private buildCrossBlockRef(
    sourceDocId: DocId,
    entry: WikiLinkEntry,
    index: VaultIndex,
    oracle: Oracle,
  ): CrossBlockRef | null {
    const anchorId = entry.blockRef!;

    if (entry.target === '') {
      // Intra-document block ref: [[#^id]]
      const sourceDoc = index.get(sourceDocId);
      const resolvedAnchor = sourceDoc?.index.blockAnchors.find((a) => a.id === anchorId) ?? null;
      return {
        sourceDocId,
        targetDocId: null,
        anchorId,
        entry,
        resolvedAnchor,
        diagnostic: resolvedAnchor === null ? 'FG005' : null,
      };
    }

    // Cross-document block ref: [[target#^id]] or [[target^id]]
    const result = oracle.resolve(entry.target);
    if (result.kind !== 'resolved') {
      // Target doc not found — FG001 handles this via normal wiki-link path
      return null;
    }
    const targetDocId = result.targetDocId;
    const targetDoc = index.get(targetDocId);
    const resolvedAnchor = targetDoc?.index.blockAnchors.find((a) => a.id === anchorId) ?? null;
    return {
      sourceDocId,
      targetDocId,
      anchorId,
      entry,
      resolvedAnchor,
      diagnostic: resolvedAnchor === null ? 'FG005' : null,
    };
  }

  private registerBlockRef(ref: CrossBlockRef): void {
    // For intra-doc refs, the anchor lives in sourceDocId; use that as the
    // lookup key so getBlockRefsToAnchor(sourceDocId, anchorId) works.
    const ownerDocId = ref.targetDocId ?? ref.sourceDocId;
    const key = blockRefKey(ownerDocId, ref.anchorId);
    const existing = this.blockRefsMap.get(key);
    if (existing !== undefined) {
      existing.push(ref);
    } else {
      this.blockRefsMap.set(key, [ref]);
    }
    if (ref.diagnostic === 'FG005') {
      this.brokenBlockRefsList.push(ref);
    }
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
      ref.embedSize = {
        width: entry.width,
        ...(entry.height !== undefined && { height: entry.height }),
      };
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

  private registerMarkdownEntries(sourceDocId: DocId, entries: MarkdownLinkRef[]): void {
    for (const entry of entries) {
      const classification = classifyMarkdownTarget(entry.target, { sourceDocId });
      if (classification.kind === 'same-document-fragment') {
        this.registerMarkdownRef({ sourceDocId, entry, resolvedTo: sourceDocId });
        continue;
      }
      if (classification.kind !== 'local-document') continue;

      const resolvedTo = this.resolveClassifiedDocId(classification.path);
      this.registerMarkdownRef({ sourceDocId, entry, resolvedTo });
    }
  }

  private registerMarkdownImages(sourceDocId: DocId, entries: MarkdownImageRef[]): void {
    for (const entry of entries) {
      const classification = classifyMarkdownTarget(entry.target, { sourceDocId, isImage: true });
      if (classification.kind !== 'local-attachment') continue;

      const imageRef: MarkdownImageGraphRef = {
        sourceDocId,
        entry,
        resolvedTo: classification.path,
      };
      const existing = this.markdownImageRefsMap.get(classification.path);
      if (existing !== undefined) {
        existing.push(imageRef);
      } else {
        this.markdownImageRefsMap.set(classification.path, [imageRef]);
      }
    }
  }

  private registerLabelDefinitions(sourceDocId: DocId, defs: LinkLabelDef[]): void {
    for (const definition of defs) {
      const classification = classifyMarkdownTarget(definition.target, { sourceDocId });
      if (classification.kind !== 'local-document') continue;

      this.registerMarkdownRef({
        sourceDocId,
        entry: definition,
        resolvedTo: this.resolveClassifiedDocId(classification.path),
      });
    }
  }

  private registerLabelRefs(sourceDocId: DocId, refs: LinkLabelRef[], defs: LinkLabelDef[]): void {
    const defsByLabel = new Map(defs.map((def) => [def.normalizedLabel, def]));
    for (const ref of refs) {
      const definition = defsByLabel.get(ref.normalizedLabel);
      if (definition === undefined) continue;

      const classification = classifyMarkdownTarget(definition.target, { sourceDocId });
      const resolvedTo =
        classification.kind === 'local-document'
          ? this.resolveClassifiedDocId(classification.path)
          : null;
      const labelRef: LinkLabelGraphRef = {
        sourceDocId,
        entry: ref,
        definition,
        resolvedTo,
      };
      const key = labelRefKey(sourceDocId, ref.normalizedLabel);
      const existing = this.labelRefsMap.get(key);
      if (existing !== undefined) {
        existing.push(labelRef);
      } else {
        this.labelRefsMap.set(key, [labelRef]);
      }

      if (classification.kind === 'local-document') {
        this.registerMarkdownRef({
          sourceDocId,
          entry: ref,
          definition,
          resolvedTo,
        });
      }
    }
  }

  private registerMarkdownRef(ref: MarkdownLinkGraphRef): void {
    if (ref.resolvedTo === null) {
      this.unresolvedMarkdownRefs.push(ref);
      return;
    }

    const existing = this.markdownRefsToMap.get(ref.resolvedTo);
    if (existing !== undefined) {
      existing.push(ref);
    } else {
      this.markdownRefsToMap.set(ref.resolvedTo, [ref]);
    }
  }

  private resolveClassifiedDocId(path: DocId): DefKey | null {
    return this.currentIndex?.has(path) === true ? path : null;
  }

  private currentIndex?: VaultIndex;
}
