import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { OFMDoc } from '../parser/types.js';
import type { DocId } from './doc-id.js';

/** Coarse attachment kind used for completion, diagnostics, navigation, and hover. */
export type AttachmentKind = 'image' | 'audio' | 'video' | 'pdf' | 'file';

/** Cheap metadata for a non-Markdown vault attachment. */
export interface AttachmentEntry {
  /** Vault-relative path with extension, using forward slashes. */
  path: string;
  /** File URI for the attachment. */
  uri: string;
  /** Lowercase extension without leading dot. */
  extension: string;
  /** Coarse attachment category. */
  kind: AttachmentKind;
  /** File size in bytes. */
  sizeBytes: number;
  /** Optional image dimensions when cheaply available. */
  dimensions?: { width: number; height: number };
}

/**
 * In-memory index mapping {@link DocId} keys to their parsed {@link OFMDoc}.
 *
 * Acts as the single source of truth for all vault documents currently known
 * to the server. Backed by a `Map` for O(1) set/get/delete/has.
 */
@Injectable()
export class VaultIndex {
  private readonly store = new Map<DocId, OFMDoc>();
  private readonly attachmentStore = new Map<string, AttachmentEntry>();

  /**
   * Store or replace a document.
   *
   * @param id  - The document identifier.
   * @param doc - The parsed OFM document.
   */
  set(id: DocId, doc: OFMDoc): void {
    this.store.set(id, doc);
  }

  /**
   * Retrieve a document by id, or `undefined` if not found.
   *
   * @param id - The document identifier.
   */
  get(id: DocId): OFMDoc | undefined {
    return this.store.get(id);
  }

  /**
   * Remove a document from the index.
   *
   * @param id - The document identifier.
   */
  delete(id: DocId): void {
    this.store.delete(id);
  }

  /**
   * Returns `true` if the index contains an entry for `id`.
   *
   * @param id - The document identifier.
   */
  has(id: DocId): boolean {
    return this.store.has(id);
  }

  /** Iterate all stored {@link OFMDoc} values. */
  values(): IterableIterator<OFMDoc> {
    return this.store.values();
  }

  /** Iterate all `[DocId, OFMDoc]` entries. */
  entries(): IterableIterator<[DocId, OFMDoc]> {
    return this.store.entries();
  }

  /** Number of documents currently in the index. */
  size(): number {
    return this.store.size;
  }

  /**
   * Store or replace attachment metadata.
   *
   * @param attachment - Attachment metadata keyed by vault-relative path.
   */
  setAttachment(attachment: AttachmentEntry): void {
    this.attachmentStore.set(attachment.path, attachment);
  }

  /**
   * Retrieve attachment metadata by vault-relative path.
   *
   * @param path - Vault-relative attachment path.
   */
  getAttachment(path: string): AttachmentEntry | undefined {
    return this.attachmentStore.get(path);
  }

  /**
   * Returns `true` when an attachment path is known.
   *
   * @param path - Vault-relative attachment path.
   */
  hasAttachment(path: string): boolean {
    return this.attachmentStore.has(path);
  }

  /**
   * Remove an attachment entry.
   *
   * @param path - Vault-relative attachment path.
   */
  deleteAttachment(path: string): void {
    this.attachmentStore.delete(path);
  }

  /** Iterate all known attachment entries. */
  attachments(): IterableIterator<AttachmentEntry> {
    return this.attachmentStore.values();
  }

  /** Remove all entries from the index. */
  clear(): void {
    this.store.clear();
    this.attachmentStore.clear();
  }
}
