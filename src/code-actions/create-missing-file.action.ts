import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { fileURLToPath, pathToFileURL } from 'url';
import * as path from 'path';
import type { CodeAction, Diagnostic, Range } from 'vscode-languageserver-types';
import { VaultDetector } from '../vault/vault-detector.js';
import { ParseCache } from '../parser/parser.module.js';
import type { WikiLinkEntry } from '../parser/types.js';

interface CodeActionParams {
  textDocument: { uri: string };
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  context: { diagnostics: Diagnostic[] };
}

/** Regex to extract the target from FG001 diagnostic messages. */
const FG001_TARGET_RE = /Cannot resolve wiki-link: '(.+?)' not found/;

/**
 * Produces a `create` WorkspaceEdit code action for each FG001 (broken wiki-link) diagnostic.
 *
 * The action does NOT perform any file I/O — it simply returns the WorkspaceEdit
 * describing the file creation for the LSP client to apply.
 */
@Injectable()
export class CreateMissingFileAction {
  constructor(
    private readonly vaultDetector: VaultDetector,
    private readonly parseCache: ParseCache,
  ) {}

  handle(params: CodeActionParams, fg001Diagnostics: Diagnostic[]): CodeAction[] {
    if (fg001Diagnostics.length === 0) return [];

    const documentPath = this.documentPath(params.textDocument.uri);
    if (documentPath === null) return [];

    const detection = this.vaultDetector.detectFresh(documentPath);
    if (detection.vaultRoot === null) return [];

    const vaultRoot = path.resolve(detection.vaultRoot);
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return [];

    return fg001Diagnostics.flatMap((diag) => {
      const entry = doc.index.wikiLinks.find((candidate) =>
        rangesEqual(candidate.range, diag.range),
      );
      if (entry === undefined) return [];

      const target = this.targetFromDiagnostic(diag, entry);
      if (target === null) return [];

      const newFilePath = this.resolveConfinedTarget(vaultRoot, target);
      if (newFilePath === null) return [];
      const newFileUri = pathToFileURL(newFilePath).toString();

      const documentChange = {
        kind: 'create' as const,
        uri: newFileUri,
        options: { ignoreIfExists: true },
      };

      const action: CodeAction = {
        title: 'Create missing file',
        kind: 'quickfix.fg.createMissingFile',
        diagnostics: [diag],
        command: {
          title: 'Create missing file',
          command: 'fg.createMissingFile',
          arguments: [newFileUri, target],
        },
        edit: {
          documentChanges: [documentChange],
        },
      };
      return [action];
    });
  }

  private documentPath(uri: string): string | null {
    try {
      return fileURLToPath(uri);
    } catch {
      return null;
    }
  }

  private targetFromDiagnostic(diag: Diagnostic, entry: WikiLinkEntry): string | null {
    const match = FG001_TARGET_RE.exec(diag.message);
    if (match === null || match[1] !== entry.target) return null;
    return entry.target;
  }

  private resolveConfinedTarget(vaultRoot: string, target: string): string | null {
    const normalizedTarget = target.replace(/\\/g, path.sep).replace(/\//g, path.sep);
    if (
      normalizedTarget.length === 0 ||
      normalizedTarget.includes('\0') ||
      path.isAbsolute(normalizedTarget) ||
      path.win32.isAbsolute(normalizedTarget) ||
      path.posix.isAbsolute(normalizedTarget)
    ) {
      return null;
    }

    const newFilePath = path.resolve(vaultRoot, `${normalizedTarget}.md`);
    const relative = path.relative(vaultRoot, newFilePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return null;
    }
    return newFilePath;
  }
}

function rangesEqual(a: Range, b: Range): boolean {
  return (
    a.start.line === b.start.line &&
    a.start.character === b.start.character &&
    a.end.line === b.end.line &&
    a.end.character === b.end.character
  );
}
