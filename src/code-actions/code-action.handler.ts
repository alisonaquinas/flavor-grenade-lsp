import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CodeAction, Diagnostic, Range } from 'vscode-languageserver-types';
import { CreateMissingFileAction } from './create-missing-file.action.js';
import { FixNbspAction } from './fix-nbsp.action.js';
import { TagToYamlAction } from './tag-to-yaml.action.js';
import { TocGeneratorAction } from './toc-generator.action.js';
import { ParseCache } from '../parser/parser.module.js';

interface CodeActionParams {
  textDocument: { uri: string };
  range: Range;
  context: { diagnostics: Diagnostic[] };
}

/**
 * Routes `textDocument/codeAction` requests to the appropriate sub-handlers.
 *
 * Routing logic:
 * - FG001 diagnostics → {@link CreateMissingFileAction}
 * - FG006 diagnostics → {@link FixNbspAction}
 * - Cursor on `#tag` → {@link TagToYamlAction}
 * - Cursor on/near heading → {@link TocGeneratorAction}
 */
@Injectable()
export class CodeActionHandler {
  constructor(
    private readonly createMissingFile: CreateMissingFileAction,
    private readonly fixNbsp: FixNbspAction,
    private readonly tagToYaml: TagToYamlAction,
    private readonly tocGenerator: TocGeneratorAction,
    private readonly parseCache: ParseCache,
  ) {}

  handle(params: CodeActionParams): CodeAction[] {
    const results: CodeAction[] = [];

    const diagnostics = params.context?.diagnostics ?? [];

    // FG001 → CreateMissingFileAction
    const fg001Diags = diagnostics.filter((d) => d.code === 'FG001');
    if (fg001Diags.length > 0) {
      results.push(...this.createMissingFile.handle(params, fg001Diags));
    }

    // FG006 → FixNbspAction
    const fg006Diags = diagnostics.filter((d) => d.code === 'FG006');
    if (fg006Diags.length > 0) {
      results.push(...this.fixNbsp.handle(params, fg006Diags));
    }

    // Cursor on tag → TagToYamlAction
    const tagAction = this.tagToYaml.handle(params);
    if (tagAction !== null) {
      results.push(tagAction);
    }

    // Cursor on/near heading → TocGeneratorAction
    const tocAction = this.tocGenerator.handle(params);
    if (tocAction !== null) {
      results.push(tocAction);
    }

    return results;
  }
}
