import type { Range } from 'vscode-languageserver-types';
import type { EmbedEntry, LinkLabelDef, MarkdownLinkRef } from '../parser/types.js';
import type { TextEdit } from '../handlers/workspace-edit-builder.js';
import type { PlannedFileMove, PlannedDocumentMove } from '../vault/file-operation-planner.js';
import type { VaultIndex } from '../vault/vault-index.js';
import type { DocId } from '../vault/doc-id.js';
import type { RefGraph, MarkdownLinkGraphRef } from './ref-graph.js';

export interface FileOperationTextEdit extends TextEdit {
  uri: string;
}

export interface SkippedFileOperationReference {
  reason: string;
  sourceUri?: string;
  range?: Range;
}

export interface FileOperationRewriteResult {
  edits: FileOperationTextEdit[];
  skipped: SkippedFileOperationReference[];
}

/**
 * Produces syntax-preserving text edits for references to moved vault targets.
 */
export class FileOperationRewriter {
  constructor(
    private readonly vaultIndex: VaultIndex,
    private readonly refGraph: RefGraph,
  ) {}

  rewrite(moves: readonly PlannedFileMove[]): FileOperationRewriteResult {
    const edits: FileOperationTextEdit[] = [];
    const skipped: SkippedFileOperationReference[] = [];
    const seenEdits = new Set<string>();

    const addEdit = (uri: string | null, range: Range, newText: string): void => {
      if (uri === null) {
        skipped.push({ reason: 'Source document is no longer indexed', range });
        return;
      }

      const key = `${uri}\0${range.start.line}:${range.start.character}:${range.end.line}:${range.end.character}\0${newText}`;
      if (seenEdits.has(key)) return;
      seenEdits.add(key);
      edits.push({ uri, range, newText });
    };

    for (const move of moves) {
      if (move.kind === 'document') {
        this.rewriteDocumentMove(move, addEdit);
      } else {
        this.rewriteAttachmentMove(move, addEdit);
      }
    }

    return { edits, skipped };
  }

  private rewriteDocumentMove(
    move: PlannedDocumentMove,
    addEdit: (uri: string | null, range: Range, newText: string) => void,
  ): void {
    for (const ref of this.refGraph.getRefsTo(move.oldDocId)) {
      addEdit(this.uriForDoc(ref.sourceDocId), ref.entry.range, buildWikiLinkText(ref.entry, move));
    }

    for (const ref of this.refGraph.getEmbedRefsTo(move.oldDocId)) {
      addEdit(
        this.uriForDoc(ref.sourceDocId),
        ref.entry.range,
        buildEmbedText(ref.entry, move.newDocId),
      );
    }

    for (const ref of this.refGraph.getMarkdownRefsTo(move.oldDocId)) {
      const target = markdownTargetForRef(ref);
      if (target === null || target.entry.target.startsWith('#')) {
        continue;
      }

      addEdit(
        this.uriForDoc(ref.sourceDocId),
        target.entry.targetRange,
        buildMarkdownDocumentTarget(target.entry.target, move.newPath),
      );
    }
  }

  private rewriteAttachmentMove(
    move: PlannedFileMove & { kind: 'attachment' },
    addEdit: (uri: string | null, range: Range, newText: string) => void,
  ): void {
    for (const ref of this.refGraph.getMarkdownImageRefsTo(move.oldPath)) {
      addEdit(this.uriForDoc(ref.sourceDocId), ref.entry.targetRange, move.newPath);
    }

    for (const ref of this.refGraph.getEmbedRefsTo(move.oldPath)) {
      addEdit(
        this.uriForDoc(ref.sourceDocId),
        ref.entry.range,
        buildEmbedText(ref.entry, move.newPath),
      );
    }

    for (const [sourceDocId, doc] of this.vaultIndex.entries()) {
      for (const entry of doc.index.markdownImages) {
        if (safeVaultRelativeAttachmentTarget(entry.target) !== move.oldPath) {
          continue;
        }

        addEdit(this.uriForDoc(sourceDocId), entry.targetRange, move.newPath);
      }
    }
  }

  private uriForDoc(docId: string): string | null {
    return this.vaultIndex.get(docId as DocId)?.uri ?? null;
  }
}

function markdownTargetForRef(
  ref: MarkdownLinkGraphRef,
): { entry: MarkdownLinkRef | LinkLabelDef } | null {
  if ('targetRange' in ref.entry && 'target' in ref.entry) {
    return { entry: ref.entry };
  }
  if (ref.definition !== undefined) {
    return { entry: ref.definition };
  }
  return null;
}

function buildWikiLinkText(
  entry: {
    target: string;
    alias?: string;
    heading?: string;
    blockRef?: string;
  },
  move: PlannedDocumentMove,
): string {
  const newStem = stemOf(move.newDocId);
  const target = entry.target.includes('/') ? move.newDocId : newStem;
  const fragment =
    entry.heading !== undefined
      ? `#${entry.heading}`
      : entry.blockRef !== undefined
        ? `#^${entry.blockRef}`
        : '';
  const alias = entry.alias !== undefined ? `|${entry.alias}` : '';
  return `[[${target}${fragment}${alias}]]`;
}

function buildEmbedText(entry: EmbedEntry, newTargetBase: string): string {
  const fragmentIndex = entry.target.indexOf('#');
  const fragment = fragmentIndex === -1 ? '' : entry.target.slice(fragmentIndex);
  const suffix = embedSuffix(entry);
  return `![[${newTargetBase}${fragment}${suffix}]]`;
}

function embedSuffix(entry: EmbedEntry): string {
  if (entry.width !== undefined && entry.height !== undefined) {
    return `|${entry.width}x${entry.height}`;
  }
  if (entry.width !== undefined) {
    return `|${entry.width}`;
  }
  if (entry.alias !== undefined) {
    return `|${entry.alias}`;
  }
  return '';
}

function buildMarkdownDocumentTarget(oldTarget: string, newPath: string): string {
  const hashIndex = oldTarget.indexOf('#');
  const fragment = hashIndex === -1 ? '' : oldTarget.slice(hashIndex);
  return `${newPath}${fragment}`;
}

function stemOf(pathLike: string): string {
  const segments = pathLike.split('/');
  return segments[segments.length - 1];
}

function safeVaultRelativeAttachmentTarget(target: string): string | null {
  const withoutFragment = target.split('#')[0].replace(/\\/g, '/').replace(/^\/+/, '');
  if (/^[A-Za-z][A-Za-z\d+.-]*:/.test(withoutFragment)) {
    return null;
  }

  const segments = withoutFragment.split('/').filter((segment) => segment.length > 0);
  if (segments.length === 0 || segments.some((segment) => segment === '.' || segment === '..')) {
    return null;
  }

  return segments.join('/');
}
