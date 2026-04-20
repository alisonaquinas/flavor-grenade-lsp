import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CodeAction, Diagnostic } from 'vscode-languageserver-types';

interface CodeActionParams {
  textDocument: { uri: string };
  range: { start: { line: number; character: number }; end: { line: number; character: number } };
  context: { diagnostics: Diagnostic[] };
}

/**
 * Produces a QuickFix code action for each FG006 (non-breaking space) diagnostic.
 *
 * Each action replaces the U+00A0 character with a regular space (U+0020).
 */
@Injectable()
export class FixNbspAction {
  handle(params: CodeActionParams, fg006Diagnostics: Diagnostic[]): CodeAction[] {
    if (fg006Diagnostics.length === 0) return [];

    return fg006Diagnostics.map((diag) => {
      const changes: { [uri: string]: Array<{ range: typeof diag.range; newText: string }> } = {};
      changes[params.textDocument.uri] = [{ range: diag.range, newText: ' ' }];

      return {
        title: 'Replace non-breaking space with regular space',
        kind: 'quickfix',
        isPreferred: true,
        diagnostics: [diag],
        edit: { changes },
      } satisfies CodeAction;
    });
  }
}
