import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Position } from 'vscode-languageserver-types';
import { pathToFileURL } from 'url';
import { ParseCache } from '../parser/parser.module.js';
import { RefGraph } from '../resolution/ref-graph.js';
import type { DefKey, Ref } from '../resolution/ref-graph.js';
import { VaultIndex } from '../vault/vault-index.js';
import { VaultDetector } from '../vault/vault-detector.js';
import type { DocId } from '../vault/doc-id.js';
import { fromDocId } from '../vault/doc-id.js';
import type { OFMDoc, HeadingEntry, WikiLinkEntry } from '../parser/types.js';
import { entityAtPosition } from './cursor-entity.js';
import { WorkspaceEditBuilder } from './workspace-edit-builder.js';
import type { WorkspaceEdit } from './workspace-edit-builder.js';
import type { Range } from 'vscode-languageserver-types';

/**
 * Compute the LSP range covering only the heading text, excluding the `#`
 * prefix characters and the single space separator.
 */
function headingTextRange(heading: HeadingEntry): Range {
  const prefixLen = heading.level + 1; // level `#` chars + 1 space
  return {
    start: {
      line: heading.range.start.line,
      character: heading.range.start.character + prefixLen,
    },
    end: heading.range.end,
  };
}

/**
 * Build the replacement wiki-link text for a heading rename.
 *
 * Alias identity rule (TASK-113):
 * - If ref has an alias equal to the old heading text → update alias to newName.
 * - If ref has an alias different from the old heading text → preserve alias.
 * - If ref has no alias → no alias in output.
 */
function buildHeadingLinkText(ref: Ref, newHeadingName: string, oldHeadingName: string): string {
  const { target, heading: _oldHeading, alias } = ref.entry;

  // Determine which alias (if any) to include in the new link text.
  let newAlias: string | undefined;
  if (alias !== undefined) {
    // Alias identity rule: update only when alias === old heading name.
    newAlias = alias === oldHeadingName ? newHeadingName : alias;
  }

  // Determine the link target portion.
  // If the original link contained a heading fragment, preserve the target.
  // The heading was `#oldHeadingName`; we replace it with `#newHeadingName`.
  let linkBody: string;
  if (target === '') {
    // Intra-document link: [[#OldHeading]] → [[#NewHeading]]
    linkBody = `#${newHeadingName}`;
  } else {
    linkBody = `${target}#${newHeadingName}`;
  }

  // Append alias if present.
  if (newAlias !== undefined) {
    linkBody = `${linkBody}|${newAlias}`;
  }

  return `[[${linkBody}]]`;
}

/**
 * Build the replacement wiki-link text for a file rename.
 *
 * Applies the link-style preservation rule (TASK-112) and alias identity rule
 * (TASK-113) for file renames.
 */
function buildFileLinkText(ref: Ref, oldStem: string, newStem: string, newDocId: DocId): string {
  const { target, alias } = ref.entry;

  // TASK-112: if original raw link contains '/' → file-path-stem style.
  const isPathStyle = target.includes('/');

  let newTarget: string;
  if (isPathStyle) {
    // Replace only the stem portion while preserving folder structure.
    // newDocId is in vault-relative forward-slash format: e.g. "notes/new-stem"
    newTarget = newDocId as string;
  } else {
    // Stem-only style: just use the new stem name.
    newTarget = newStem;
  }

  // Alias identity rule for file rename: update alias only if it matched oldStem.
  let newAlias: string | undefined;
  if (alias !== undefined) {
    newAlias = alias === oldStem ? newStem : alias;
  }

  let linkBody = newTarget;
  if (newAlias !== undefined) {
    linkBody = `${linkBody}|${newAlias}`;
  }

  return `[[${linkBody}]]`;
}

/**
 * Convert a vault DocId to an LSP file URI.
 *
 * @param vaultRoot - Absolute filesystem path to the vault root.
 * @param id        - Vault-relative document identifier.
 */
function docIdToUri(vaultRoot: string, id: DocId): string {
  return pathToFileURL(fromDocId(vaultRoot, id)).href;
}

/**
 * Resolve the vault root for a given URI by walking up the vault index.
 *
 * Returns the vault root if found, or null if not detectable.
 */
function resolveVaultRoot(
  uri: string,
  vaultIndex: VaultIndex,
  vaultDetector: VaultDetector,
): string | null {
  // Try to detect from the URI's path.
  try {
    const url = new URL(uri);
    // Decode and normalise the path.
    const rawPath = decodeURIComponent(url.pathname);
    // On Windows the pathname starts with /C:/... — strip leading slash before drive letter.
    const absPath = rawPath.replace(/^\/([A-Za-z]:)/, '$1').replace(/\//g, '/');
    const result = vaultDetector.detect(absPath);
    if (result.vaultRoot !== null) return result.vaultRoot;
  } catch {
    // ignore
  }

  // Fallback: infer vault root from a matching vault index entry.
  for (const [docId, doc] of vaultIndex.entries()) {
    if (doc.uri === uri) {
      // Reconstruct vault root from URI and docId.
      // If docId = "notes/beta" and uri = "file:///vault/notes/beta.md",
      // then vault root path can be derived.
      try {
        const url = new URL(uri);
        let pathname = decodeURIComponent(url.pathname);
        pathname = pathname.replace(/^\/([A-Za-z]:)/, '$1');
        const docPath = fromDocId('', docId as DocId);
        if (pathname.endsWith(docPath) || pathname.endsWith(docPath.replace(/\\/g, '/'))) {
          return pathname.slice(0, pathname.length - docPath.length - 1);
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

/**
 * Handles `textDocument/rename` requests for vault documents.
 *
 * Supports:
 * - Heading rename (TASK-110): updates heading text at source and all
 *   `[[doc#Heading]]` fragments referencing it.
 * - File rename (TASK-111): produces a `RenameFile` document change plus text
 *   edits for all links pointing to the renamed file.
 *
 * Link-style preservation (TASK-112) and alias identity rule (TASK-113) are
 * applied when generating replacement link text.
 *
 * Zero-reference rename (TASK-114): always produces a valid `WorkspaceEdit`
 * with the source-site edit, even when no refs exist.
 */
@Injectable()
export class RenameHandler {
  constructor(
    private readonly parseCache: ParseCache,
    private readonly refGraph: RefGraph,
    private readonly vaultIndex: VaultIndex,
    private readonly vaultDetector: VaultDetector,
  ) {}

  /**
   * Handle a `textDocument/rename` request.
   *
   * @param params - LSP rename parameters.
   * @returns A `WorkspaceEdit` with all necessary changes.
   */
  handle(params: {
    textDocument: { uri: string };
    position: Position;
    newName: string;
  }): WorkspaceEdit {
    const { uri } = params.textDocument;
    const { position, newName } = params;

    const empty: WorkspaceEdit = { changes: {} };

    const doc = this.parseCache.get(uri);
    if (doc === undefined) return empty;

    const entity = entityAtPosition(doc, position);

    switch (entity.kind) {
      case 'heading':
        return this.headingRename(doc, uri, entity.entry, newName);

      case 'wiki-link': {
        // File rename: resolve the target to a DocId.
        const targetEntry = entity.entry;
        const vaultRoot = resolveVaultRoot(uri, this.vaultIndex, this.vaultDetector);
        if (vaultRoot === null) return empty;

        // Locate the target doc in the vault index by matching the target stem.
        const targetDocId = this.resolveTargetDocId(targetEntry);
        if (targetDocId === null) return empty;

        // The old stem is the last segment of the docId.
        const segments = (targetDocId as string).split('/');
        const oldStem = segments[segments.length - 1];
        return this.fileRename(targetDocId, oldStem, newName, vaultRoot);
      }

      default:
        return empty;
    }
  }

  /**
   * Rename a heading: update the heading text at the source document and all
   * cross-vault references via the `[[doc#Heading]]` fragment.
   */
  private headingRename(
    doc: OFMDoc,
    uri: string,
    heading: HeadingEntry,
    newName: string,
  ): WorkspaceEdit {
    const builder = new WorkspaceEditBuilder();

    // The refGraph stores refs keyed by their resolved target DocId (not by
    // heading fragment). Retrieve all refs to this document, then filter to
    // those that reference the specific heading.
    const docIdStr = this.uriToDocId(uri);
    const defKey: DefKey = docIdStr;

    // TASK-114: Apply the source edit regardless of ref count.
    const textRange = headingTextRange(heading);
    builder.addTextEdit(uri, { range: textRange, newText: newName });

    // Update all references that target this specific heading.
    const refs = this.refGraph.getRefsTo(defKey);
    for (const ref of refs) {
      // Filter: only refs whose heading fragment matches the renamed heading.
      if (ref.entry.heading !== heading.text) continue;

      const refUri = this.docIdToUriFromIndex(ref.sourceDocId);
      if (refUri === null) continue;

      const newLinkText = buildHeadingLinkText(ref, newName, heading.text);
      builder.addTextEdit(refUri, { range: ref.entry.range, newText: newLinkText });
    }

    return builder.build();
  }

  /**
   * Rename a file: produce a `RenameFile` document change plus text edits for
   * all wiki-links pointing to the old file.
   *
   * Security note (CHORE-033): `newStem` (user input) is used only to
   * construct the new DocId by replacing the stem component — it is NOT passed
   * directly to any filesystem API.
   */
  private fileRename(
    docId: DocId,
    oldStem: string,
    newStem: string,
    vaultRoot: string,
  ): WorkspaceEdit {
    const builder = new WorkspaceEditBuilder();

    // Build the new DocId by replacing the stem at the end of the path.
    const segments = (docId as string).split('/');
    segments[segments.length - 1] = newStem;
    const newDocId = segments.join('/') as DocId;

    const oldUri = docIdToUri(vaultRoot, docId);
    const newUri = docIdToUri(vaultRoot, newDocId);

    builder.addRenameFile({ kind: 'rename', oldUri, newUri });

    // Update all wiki-links pointing to the old file.
    const refs = this.refGraph.getRefsTo(docId as DefKey);
    for (const ref of refs) {
      const refUri = this.docIdToUriFromIndex(ref.sourceDocId);
      if (refUri === null) continue;

      const newLinkText = buildFileLinkText(ref, oldStem, newStem, newDocId);
      builder.addTextEdit(refUri, { range: ref.entry.range, newText: newLinkText });
    }

    return builder.build();
  }

  /**
   * Attempt to resolve a wiki-link entry's target to a DocId by scanning the
   * vault index for a matching document.
   */
  private resolveTargetDocId(entry: WikiLinkEntry): DocId | null {
    const target = entry.target;
    if (target === '') return null;

    // Try exact match against DocId.
    if (this.vaultIndex.has(target as DocId)) {
      return target as DocId;
    }

    // Try stem match (last segment of docId matches target).
    for (const [docId] of this.vaultIndex.entries()) {
      const stem = (docId as string).split('/').pop() ?? '';
      if (stem === target) return docId;
    }

    return null;
  }

  /**
   * Derive a DocId string from a document URI by matching against the vault
   * index. Falls back to extracting the stem from the URI.
   */
  private uriToDocId(uri: string): string {
    for (const [docId, doc] of this.vaultIndex.entries()) {
      if (doc.uri === uri) return docId as string;
    }

    // Fallback: extract stem from URI.
    try {
      const url = new URL(uri);
      const pathname = decodeURIComponent(url.pathname);
      const withoutExt = pathname.endsWith('.md') ? pathname.slice(0, -3) : pathname;
      return withoutExt.split('/').pop() ?? uri;
    } catch {
      return uri;
    }
  }

  /**
   * Look up the LSP URI for a given DocId via the vault index.
   *
   * Returns null when the document is not in the vault index.
   */
  private docIdToUriFromIndex(docId: DocId): string | null {
    const doc = this.vaultIndex.get(docId);
    return doc !== undefined ? doc.uri : null;
  }
}
