import { describe, it, expect, beforeEach } from '@jest/globals';
import { FixNbspAction } from '../fix-nbsp.action.js';
import type { Diagnostic } from 'vscode-languageserver-types';

const DOC_URI = 'file:///vault/test.md';

describe('FixNbspAction', () => {
  let action: FixNbspAction;

  beforeEach(() => {
    action = new FixNbspAction();
  });

  it('returns CodeAction with isPreferred:true and newText of regular space', () => {
    const diag: Diagnostic = {
      range: { start: { line: 3, character: 10 }, end: { line: 3, character: 11 } },
      severity: 2,
      code: 'FG006',
      source: 'flavor-grenade',
      message: 'Non-breaking space (U+00A0) found',
    };

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);

    expect(result).toHaveLength(1);
    const ca = result[0];
    expect(ca.isPreferred).toBe(true);
    expect(ca.kind).toBe('quickfix');
    expect(ca.title).toContain('non-breaking');
    const changes = ca.edit!.changes![DOC_URI];
    expect(changes).toBeDefined();
    expect(changes).toHaveLength(1);
    expect(changes[0].newText).toBe(' ');
    expect(changes[0].range).toEqual(diag.range);
  });

  it('returns empty array for empty diagnostics', () => {
    const params = {
      textDocument: { uri: DOC_URI },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [] },
    };

    const result = action.handle(params, []);
    expect(result).toHaveLength(0);
  });

  it('returns one action per FG006 diagnostic', () => {
    const diag1: Diagnostic = {
      range: { start: { line: 1, character: 5 }, end: { line: 1, character: 6 } },
      severity: 2,
      code: 'FG006',
      source: 'flavor-grenade',
      message: 'Non-breaking space (U+00A0) found',
    };
    const diag2: Diagnostic = {
      range: { start: { line: 2, character: 3 }, end: { line: 2, character: 4 } },
      severity: 2,
      code: 'FG006',
      source: 'flavor-grenade',
      message: 'Non-breaking space (U+00A0) found',
    };

    const params = {
      textDocument: { uri: DOC_URI },
      range: { start: { line: 1, character: 5 }, end: { line: 2, character: 4 } },
      context: { diagnostics: [diag1, diag2] },
    };

    const result = action.handle(params, [diag1, diag2]);
    expect(result).toHaveLength(2);
  });
});
