import { describe, it, expect, beforeEach } from '@jest/globals';
import { CreateMissingFileAction } from '../create-missing-file.action.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import type { Diagnostic } from 'vscode-languageserver-types';

function makeVaultDetector(vaultRoot: string): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot }),
  } as unknown as VaultDetector;
}

const DOC_URI = 'file:///vault/test.md';

describe('CreateMissingFileAction', () => {
  let vaultDetector: VaultDetector;
  let action: CreateMissingFileAction;

  beforeEach(() => {
    vaultDetector = makeVaultDetector('/vault');
    action = new CreateMissingFileAction(vaultDetector);
  });

  it('creates a CodeAction with CreateFile documentChange', () => {
    const diag: Diagnostic = {
      range: { start: { line: 1, character: 0 }, end: { line: 1, character: 15 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: 'Broken wiki-link: [[missing-file]] not found in vault',
    };

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);

    expect(result).toHaveLength(1);
    const ca = result[0];
    expect(ca.edit?.documentChanges).toBeDefined();
    const changes = ca.edit!.documentChanges!;
    expect(changes).toHaveLength(1);
    const createFile = changes[0] as { kind: string; uri: string; options?: { ignoreIfExists?: boolean } };
    expect(createFile.kind).toBe('create');
    expect(createFile.options?.ignoreIfExists).toBe(true);
  });

  it('formats title as Create <target>.md', () => {
    const diag: Diagnostic = {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: "Broken wiki-link: [[my-note]] not found in vault",
    };

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Create 'my-note.md'");
  });

  it('creates URI within vault root', () => {
    const diag: Diagnostic = {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      severity: 1,
      code: 'FG001',
      source: 'flavor-grenade',
      message: 'Broken wiki-link: [[new-doc]] not found in vault',
    };

    const params = {
      textDocument: { uri: DOC_URI },
      range: diag.range,
      context: { diagnostics: [diag] },
    };

    const result = action.handle(params, [diag]);
    expect(result).toHaveLength(1);
    const createFile = result[0].edit!.documentChanges![0] as { kind: string; uri: string };
    expect(createFile.uri).toContain('new-doc.md');
    // URI must reference vault root
    expect(createFile.uri).toContain('vault');
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
});
