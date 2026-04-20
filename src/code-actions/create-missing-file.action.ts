import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { pathToFileURL } from 'url';
import * as path from 'path';
import type { CodeAction, Diagnostic } from 'vscode-languageserver-types';
import { VaultDetector } from '../vault/vault-detector.js';

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
  constructor(private readonly vaultDetector: VaultDetector) {}

  handle(params: CodeActionParams, fg001Diagnostics: Diagnostic[]): CodeAction[] {
    if (fg001Diagnostics.length === 0) return [];

    const detection = this.vaultDetector.detect(params.textDocument.uri);
    const vaultRoot = detection.vaultRoot ?? '/';

    return fg001Diagnostics.flatMap((diag) => {
      const match = FG001_TARGET_RE.exec(diag.message);
      if (match === null) return [];

      const target = match[1];
      const newFilePath = path.join(vaultRoot, `${target}.md`);
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
}
