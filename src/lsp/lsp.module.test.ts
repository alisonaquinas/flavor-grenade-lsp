import { describe, expect, it, jest } from '@jest/globals';
import { LspModule } from './lsp.module.js';
import type { StdioReader } from '../transport/stdio-reader.js';
import type { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import type { DocumentStore } from './services/document-store.js';
import type { CapabilityRegistry } from './services/capability-registry.js';
import type { InitializeHandler } from './handlers/initialize.handler.js';
import type { InitializedHandler } from './handlers/initialized.handler.js';
import type { ShutdownHandler } from './handlers/shutdown.handler.js';
import type { ExitHandler } from './handlers/exit.handler.js';
import type { DidOpenHandler } from './handlers/did-open.handler.js';
import type { DidChangeHandler } from './handlers/did-change.handler.js';
import type { DidCloseHandler } from './handlers/did-close.handler.js';
import type { FileOperationsHandler } from './handlers/file-operations.handler.js';
import type { CompletionRouter } from '../completion/completion-router.js';
import type { DefinitionHandler } from '../handlers/definition.handler.js';
import type { ReferencesHandler } from '../handlers/references.handler.js';
import type { HoverHandler } from '../handlers/hover.handler.js';
import type { CodeLensHandler } from '../handlers/code-lens.handler.js';
import type { DocumentHighlightHandler } from '../handlers/document-highlight.handler.js';
import type { DiagnosticService } from '../resolution/diagnostic-service.js';
import type { VaultDetector } from '../vault/vault-detector.js';
import type { CodeActionHandler } from '../code-actions/code-action.handler.js';
import type { WorkspaceSymbolHandler } from '../handlers/workspace-symbol.handler.js';
import type { DocumentSymbolHandler } from '../handlers/document-symbol.handler.js';
import type { DocumentLinkHandler } from '../handlers/document-link.handler.js';
import type { FoldingRangeHandler } from '../handlers/folding-range.handler.js';
import type { SelectionRangeHandler } from '../handlers/selection-range.handler.js';
import type { SemanticTokensHandler } from '../handlers/semantic-tokens.handler.js';
import type { PrepareRenameHandler } from '../handlers/prepare-rename.handler.js';
import type { RenameHandler } from '../handlers/rename.handler.js';
import type { VaultIndex } from '../vault/vault-index.js';

describe('LspModule', () => {
  it('is defined', () => {
    expect(LspModule).toBeDefined();
  });

  it('registers LSP structural and file operation capabilities and handlers', () => {
    const reader = {
      on: jest.fn(),
      start: jest.fn(),
    } as unknown as StdioReader;
    const dispatcher = {
      onRequest: jest.fn(),
      onNotification: jest.fn(),
    } as unknown as JsonRpcDispatcher;
    const capabilityRegistry = {
      merge: jest.fn(),
    } as unknown as CapabilityRegistry;
    const completionRouter = {
      route: jest.fn().mockReturnValue({ items: [], isIncomplete: false }),
      setDocumentText: jest.fn(),
      removeDocumentText: jest.fn(),
    } as unknown as CompletionRouter;
    const documentStore = {
      get: jest.fn(),
    } as unknown as DocumentStore;

    const module = new LspModule(
      reader,
      dispatcher,
      { handle: jest.fn() } as unknown as InitializeHandler,
      { handle: jest.fn() } as unknown as InitializedHandler,
      { handle: jest.fn() } as unknown as ShutdownHandler,
      { handle: jest.fn() } as unknown as ExitHandler,
      { handle: jest.fn() } as unknown as DidOpenHandler,
      { handle: jest.fn() } as unknown as DidChangeHandler,
      { handle: jest.fn() } as unknown as DidCloseHandler,
      {
        handleWillRenameFiles: jest.fn().mockResolvedValue(null),
        handleDidRenameFiles: jest.fn().mockResolvedValue(undefined),
      } as unknown as FileOperationsHandler,
      capabilityRegistry,
      { handle: jest.fn() } as unknown as DefinitionHandler,
      { handle: jest.fn() } as unknown as ReferencesHandler,
      { handle: jest.fn() } as unknown as HoverHandler,
      { handle: jest.fn() } as unknown as CodeLensHandler,
      { handle: jest.fn() } as unknown as DocumentHighlightHandler,
      completionRouter,
      { publishDiagnostics: jest.fn() } as unknown as DiagnosticService,
      { detect: jest.fn() } as unknown as VaultDetector,
      documentStore,
      { handle: jest.fn() } as unknown as CodeActionHandler,
      { handle: jest.fn() } as unknown as WorkspaceSymbolHandler,
      { handle: jest.fn() } as unknown as DocumentSymbolHandler,
      { handle: jest.fn() } as unknown as DocumentLinkHandler,
      { handle: jest.fn() } as unknown as FoldingRangeHandler,
      { handle: jest.fn() } as unknown as SelectionRangeHandler,
      { handle: jest.fn() } as unknown as SemanticTokensHandler,
      {
        handle: jest.fn(),
        setDocumentText: jest.fn(),
        removeDocumentText: jest.fn(),
      } as unknown as PrepareRenameHandler,
      { handle: jest.fn() } as unknown as RenameHandler,
      { size: jest.fn().mockReturnValue(0) } as unknown as VaultIndex,
    );

    module.onModuleInit();

    expect(capabilityRegistry.merge).toHaveBeenCalledWith(
      expect.objectContaining({
        documentLinkProvider: { resolveProvider: false },
        foldingRangeProvider: true,
        selectionRangeProvider: true,
        workspace: {
          fileOperations: {
            willRename: { filters: [{ pattern: { glob: '**/*' } }] },
            didRename: { filters: [{ pattern: { glob: '**/*' } }] },
          },
        },
      }),
    );
    expect(dispatcher.onRequest).toHaveBeenCalledWith(
      'workspace/willRenameFiles',
      expect.any(Function),
    );
    expect(dispatcher.onNotification).toHaveBeenCalledWith(
      'workspace/didRenameFiles',
      expect.any(Function),
    );
    expect(dispatcher.onRequest).toHaveBeenCalledWith(
      'textDocument/documentLink',
      expect.any(Function),
    );
    expect(dispatcher.onRequest).toHaveBeenCalledWith(
      'textDocument/foldingRange',
      expect.any(Function),
    );
    expect(dispatcher.onRequest).toHaveBeenCalledWith(
      'textDocument/selectionRange',
      expect.any(Function),
    );
  });
});
