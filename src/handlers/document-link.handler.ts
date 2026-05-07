import { Injectable } from '@nestjs/common';
import type { DocumentLink } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import type { LinkLabelDef, MarkdownImageRef, MarkdownLinkRef, OFMDoc } from '../parser/types.js';
import { classifyMarkdownTarget } from '../resolution/markdown-target-classifier.js';
import { Oracle } from '../resolution/oracle.js';
import type { DocId } from '../vault/doc-id.js';
import { VaultIndex, type AttachmentEntry } from '../vault/vault-index.js';

interface DocumentLinkParams {
  textDocument?: { uri?: string };
}

/** Handles `textDocument/documentLink` requests. */
@Injectable()
export class DocumentLinkHandler {
  constructor(
    private readonly parseCache: ParseCache,
    private readonly vaultIndex: VaultIndex,
    private readonly oracle: Oracle,
  ) {}

  handle(params: DocumentLinkParams): DocumentLink[] {
    const uri = params.textDocument?.uri;
    if (typeof uri !== 'string') return [];

    const doc = this.parseCache.get(uri);
    if (doc === undefined) return [];

    const sourceDocId = this.docIdForUri(uri);
    if (sourceDocId === null) return [];

    const links: DocumentLink[] = [];

    for (const entry of doc.index.wikiLinks) {
      const targetUri = this.resolveWikiTarget(entry.target, entry.heading, entry.blockRef, doc);
      if (targetUri !== null) links.push({ range: entry.range, target: targetUri });
    }

    for (const entry of doc.index.embeds) {
      const targetUri = this.resolveEmbedTarget(entry.target);
      if (targetUri !== null) links.push({ range: entry.range, target: targetUri });
    }

    for (const entry of doc.index.markdownLinks) {
      const targetUri = this.resolveMarkdownTarget(entry, sourceDocId);
      if (targetUri !== null) links.push({ range: entry.targetRange, target: targetUri });
    }

    for (const entry of doc.index.linkLabelDefs) {
      const targetUri = this.resolveLinkLabelDefinition(entry, sourceDocId);
      if (targetUri !== null) links.push({ range: entry.targetRange, target: targetUri });
    }

    for (const entry of doc.index.linkLabelRefs) {
      const definition = doc.index.linkLabelDefs.find(
        (def) => def.normalizedLabel === entry.normalizedLabel,
      );
      if (definition === undefined) continue;
      const targetUri = this.resolveLinkLabelDefinition(definition, sourceDocId);
      if (targetUri !== null) links.push({ range: entry.labelRange, target: targetUri });
    }

    for (const entry of doc.index.markdownImages) {
      const targetUri = this.resolveMarkdownImageTarget(entry, sourceDocId);
      if (targetUri !== null) links.push({ range: entry.targetRange, target: targetUri });
    }

    return links;
  }

  private resolveWikiTarget(
    target: string,
    heading: string | undefined,
    blockRef: string | undefined,
    sourceDoc: OFMDoc,
  ): string | null {
    if (target === '' && (heading !== undefined || blockRef !== undefined)) {
      return sourceDoc.uri;
    }

    const result = this.oracle.resolve(target, heading, blockRef);
    if (result.kind !== 'resolved') return null;
    return this.uriForDocId(result.targetDocId);
  }

  private resolveEmbedTarget(target: string): string | null {
    const fileTarget = target.split('#')[0];
    const attachment = this.attachmentForTargets([fileTarget]);
    if (attachment !== undefined) return attachment.uri;

    const result = this.oracle.resolve(fileTarget);
    if (result.kind !== 'resolved') return null;
    return this.uriForDocId(result.targetDocId);
  }

  private resolveMarkdownTarget(entry: MarkdownLinkRef, sourceDocId: DocId): string | null {
    const classification = classifyMarkdownTarget(entry.target, { sourceDocId });
    const result = this.oracle.resolveMarkdownTarget(sourceDocId, classification);

    if (result.kind === 'document-resolved' || result.kind === 'heading-resolved') {
      return this.uriForDocId(result.targetDocId);
    }

    return null;
  }

  private resolveLinkLabelDefinition(definition: LinkLabelDef, sourceDocId: DocId): string | null {
    const classification = classifyMarkdownTarget(definition.target, { sourceDocId });
    const result = this.oracle.resolveMarkdownTarget(sourceDocId, classification);

    if (result.kind === 'document-resolved' || result.kind === 'heading-resolved') {
      return this.uriForDocId(result.targetDocId);
    }

    return null;
  }

  private resolveMarkdownImageTarget(entry: MarkdownImageRef, sourceDocId: DocId): string | null {
    const classification = classifyMarkdownTarget(entry.target, { sourceDocId, isImage: true });
    if (classification.kind !== 'local-attachment') return null;

    return (
      this.attachmentForTargets([
        classification.path,
        this.rawVaultRelativeAttachmentCandidate(entry.target),
      ])?.uri ?? null
    );
  }

  private uriForDocId(docId: DocId): string | null {
    return this.vaultIndex.get(docId)?.uri ?? null;
  }

  private docIdForUri(uri: string): DocId | null {
    for (const [docId, doc] of this.vaultIndex.entries()) {
      if (doc.uri === uri) return docId;
    }
    return null;
  }

  private attachmentForTargets(targets: Array<string | undefined>): AttachmentEntry | undefined {
    const candidates = [
      ...new Set(targets.filter((target): target is string => target !== undefined)),
    ];
    for (const target of candidates) {
      const exact = this.vaultIndex.getAttachment(target);
      if (exact !== undefined) return exact;
    }

    const matches = candidates.flatMap((target) => {
      const suffix = '/' + target;
      return Array.from(this.vaultIndex.attachments()).filter(
        (attachment) => attachment.path === target || attachment.path.endsWith(suffix),
      );
    });
    const uniqueMatches = [
      ...new Map(matches.map((attachment) => [attachment.path, attachment])).values(),
    ];
    return uniqueMatches.length === 1 ? uniqueMatches[0] : undefined;
  }

  private rawVaultRelativeAttachmentCandidate(target: string): string | undefined {
    const rawPath = target
      .split('#')[0]
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/^\.\//, '');
    if (rawPath.length === 0) return undefined;
    const segments = rawPath.split('/');
    if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
      return undefined;
    }
    return rawPath;
  }
}
