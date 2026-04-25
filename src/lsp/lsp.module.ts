import 'reflect-metadata';
import { Module, OnModuleInit } from '@nestjs/common';
import { TransportModule } from '../transport/transport.module.js';
import { StdioReader } from '../transport/stdio-reader.js';
import { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import { DocumentStore } from './services/document-store.js';
import { LifecycleState } from './services/lifecycle-state.js';
import { CapabilityRegistry } from './services/capability-registry.js';
import { StatusNotifier } from './services/status-notifier.js';
import { InitializeHandler } from './handlers/initialize.handler.js';
import { InitializedHandler } from './handlers/initialized.handler.js';
import { ShutdownHandler } from './handlers/shutdown.handler.js';
import { ExitHandler } from './handlers/exit.handler.js';
import { DidOpenHandler } from './handlers/did-open.handler.js';
import { DidChangeHandler } from './handlers/did-change.handler.js';
import { DidCloseHandler } from './handlers/did-close.handler.js';
import { ParserModule } from '../parser/parser.module.js';
import { VaultModule } from '../vault/vault.module.js';
import { ResolutionModule } from '../resolution/resolution.module.js';
import { CompletionModule } from '../completion/completion.module.js';
import { NavigationModule } from '../navigation/navigation.module.js';
import { CompletionRouter } from '../completion/completion-router.js';
import { DefinitionHandler } from '../handlers/definition.handler.js';
import { ReferencesHandler } from '../handlers/references.handler.js';
import { HoverHandler } from '../handlers/hover.handler.js';
import { CodeLensHandler } from '../handlers/code-lens.handler.js';
import { DocumentHighlightHandler } from '../handlers/document-highlight.handler.js';
import { DiagnosticService } from '../resolution/diagnostic-service.js';
import { VaultDetector } from '../vault/vault-detector.js';
import { CodeActionsModule } from '../code-actions/code-actions.module.js';
import { CodeActionHandler } from '../code-actions/code-action.handler.js';
import { WorkspaceSymbolHandler } from '../handlers/workspace-symbol.handler.js';
import { DocumentSymbolHandler } from '../handlers/document-symbol.handler.js';
import {
  SemanticTokensHandler,
  TOKEN_TYPES,
  TOKEN_MODIFIERS,
} from '../handlers/semantic-tokens.handler.js';
import { VaultIndex } from '../vault/vault-index.js';
import { RenameModule } from '../rename/rename.module.js';
import { PrepareRenameHandler } from '../handlers/prepare-rename.handler.js';
import { RenameHandler } from '../handlers/rename.handler.js';

/**
 * Root NestJS module for the flavor-grenade LSP server.
 *
 * Wires all transport, service, and handler providers, then on
 * {@link OnModuleInit.onModuleInit} registers each handler with the
 * {@link JsonRpcDispatcher} and starts the stdio reader.
 */
@Module({
  imports: [
    TransportModule,
    ParserModule,
    VaultModule,
    ResolutionModule,
    CompletionModule,
    NavigationModule,
    RenameModule,
    CodeActionsModule,
  ],
  providers: [
    DocumentStore,
    LifecycleState,
    CapabilityRegistry,
    StatusNotifier,
    InitializeHandler,
    InitializedHandler,
    ShutdownHandler,
    ExitHandler,
    DidOpenHandler,
    DidChangeHandler,
    DidCloseHandler,
    WorkspaceSymbolHandler,
    DocumentSymbolHandler,
    SemanticTokensHandler,
  ],
  exports: [],
})
export class LspModule implements OnModuleInit {
  constructor(
    private readonly reader: StdioReader,
    private readonly dispatcher: JsonRpcDispatcher,
    private readonly initialize: InitializeHandler,
    private readonly initialized: InitializedHandler,
    private readonly shutdown: ShutdownHandler,
    private readonly exit: ExitHandler,
    private readonly didOpen: DidOpenHandler,
    private readonly didChange: DidChangeHandler,
    private readonly didClose: DidCloseHandler,
    private readonly capabilityRegistry: CapabilityRegistry,
    private readonly definition: DefinitionHandler,
    private readonly references: ReferencesHandler,
    private readonly hover: HoverHandler,
    private readonly codeLens: CodeLensHandler,
    private readonly documentHighlight: DocumentHighlightHandler,
    private readonly completionRouter: CompletionRouter,
    private readonly diagnosticService: DiagnosticService,
    private readonly vaultDetector: VaultDetector,
    private readonly documentStore: DocumentStore,
    private readonly codeAction: CodeActionHandler,
    private readonly workspaceSymbol: WorkspaceSymbolHandler,
    private readonly documentSymbol: DocumentSymbolHandler,
    private readonly semanticTokens: SemanticTokensHandler,
    private readonly prepareRename: PrepareRenameHandler,
    private readonly rename: RenameHandler,
    private readonly vaultIndex: VaultIndex,
  ) {}

  /**
   * Register all handlers with the dispatcher, then start reading from stdin.
   *
   * Called by NestJS after all providers have been resolved.
   */
  onModuleInit(): void {
    this.capabilityRegistry.merge({
      definitionProvider: true,
      referencesProvider: true,
      completionProvider: {
        triggerCharacters: ['[', '!', '#', '^', '>'],
        commitCharacters: [']'],
        resolveProvider: false,
      },
      codeActionProvider: true,
      hoverProvider: true,
      codeLensProvider: { resolveProvider: false },
      documentHighlightProvider: true,
      renameProvider: { prepareProvider: true },
      workspaceSymbolProvider: true,
      documentSymbolProvider: true,
      semanticTokensProvider: {
        legend: { tokenTypes: TOKEN_TYPES, tokenModifiers: TOKEN_MODIFIERS },
        full: true,
        range: false,
      },
    });

    this.dispatcher.onRequest('initialize', (p) => this.initialize.handle(p));
    this.dispatcher.onNotification('initialized', (p) => this.initialized.handle(p));
    this.dispatcher.onRequest('shutdown', (p) => this.shutdown.handle(p));
    this.dispatcher.onNotification('exit', (p) => this.exit.handle(p));
    this.dispatcher.onNotification('textDocument/didOpen', async (p) => {
      const params = p as { textDocument?: { uri?: string; text?: string } } | null | undefined;
      const uri = params?.textDocument?.uri;
      const text = params?.textDocument?.text;
      // Set raw text synchronously BEFORE any await so that a completion
      // request arriving in the same stdio buffer chunk can find it.
      if (typeof uri === 'string' && typeof text === 'string') {
        this.completionRouter.setDocumentText(uri, text);
        this.prepareRename.setDocumentText(uri, text);
      }
      await this.didOpen.handle(p);
    });
    this.dispatcher.onNotification('textDocument/didChange', async (p) => {
      await this.didChange.handle(p);
      const params = p as { textDocument?: { uri?: string } } | null | undefined;
      const uri = params?.textDocument?.uri;
      if (typeof uri === 'string') {
        const docText = this.documentStore.get(uri)?.getText();
        if (typeof docText === 'string') {
          this.completionRouter.setDocumentText(uri, docText);
          this.prepareRename.setDocumentText(uri, docText);
        }
      }
    });
    this.dispatcher.onNotification('textDocument/didClose', async (p) => {
      await this.didClose.handle(p);
      const params = p as { textDocument?: { uri?: string } } | null | undefined;
      const uri = params?.textDocument?.uri;
      if (typeof uri === 'string') {
        this.completionRouter.removeDocumentText(uri);
        this.prepareRename.removeDocumentText(uri);
      }
    });

    this.dispatcher.onRequest('textDocument/definition', (p) =>
      Promise.resolve(this.definition.handle(p as Parameters<DefinitionHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('textDocument/references', (p) =>
      Promise.resolve(this.references.handle(p as Parameters<ReferencesHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('textDocument/completion', (p) =>
      Promise.resolve(this.handleCompletion(p)),
    );
    this.dispatcher.onRequest('textDocument/codeAction', (p) =>
      Promise.resolve(this.codeAction.handle(p as Parameters<CodeActionHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('textDocument/hover', (p) =>
      Promise.resolve(this.hover.handle(p as Parameters<HoverHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('textDocument/codeLens', (p) =>
      Promise.resolve(this.codeLens.handle(p as Parameters<CodeLensHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('textDocument/documentHighlight', (p) =>
      Promise.resolve(
        this.documentHighlight.handle(p as Parameters<DocumentHighlightHandler['handle']>[0]),
      ),
    );
    this.dispatcher.onRequest('textDocument/prepareRename', (p) =>
      Promise.resolve(
        this.prepareRename.handle(p as Parameters<PrepareRenameHandler['handle']>[0]),
      ),
    );
    this.dispatcher.onRequest('textDocument/rename', (p) =>
      Promise.resolve(this.rename.handle(p as Parameters<RenameHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('workspace/symbol', (p) =>
      Promise.resolve(
        this.workspaceSymbol.handle(p as Parameters<WorkspaceSymbolHandler['handle']>[0]),
      ),
    );
    this.dispatcher.onRequest('textDocument/documentSymbol', (p) =>
      Promise.resolve(
        this.documentSymbol.handle(p as Parameters<DocumentSymbolHandler['handle']>[0]),
      ),
    );
    this.dispatcher.onRequest('textDocument/semanticTokens/full', (p) =>
      Promise.resolve(
        this.semanticTokens.handle(p as Parameters<SemanticTokensHandler['handle']>[0]),
      ),
    );

    this.dispatcher.onRequest('workspace/executeCommand', (p) => this.handleExecuteCommand(p));

    // Custom method for the VS Code extension — bypasses vscode-languageclient's
    // built-in interception of standard LSP methods like workspace/executeCommand.
    this.dispatcher.onRequest('flavorGrenade/rebuildIndex', async () => {
      process.stderr.write('[flavor-grenade-lsp] flavorGrenade/rebuildIndex request received\n');
      await this.initialized.handle({});
      return null;
    });

    this.reader.on('message', (raw: string) => {
      this.dispatcher.dispatch(raw).catch((err: unknown) => {
        process.stderr.write(`[flavor-grenade-lsp] dispatch error: ${String(err)}\n`);
      });
    });

    this.reader.start(process.stdin);
  }

  /**
   * Handle a textDocument/completion request.
   */
  private handleCompletion(params: unknown): { items: unknown[]; isIncomplete: boolean } {
    const p = params as Parameters<CompletionRouter['route']>[0] | null | undefined;
    if (p == null) {
      process.stderr.write('[flavor-grenade-lsp] completion: params null\n');
      return { items: [], isIncomplete: false };
    }
    const result = this.completionRouter.route(p);
    if (result.items.length === 0) {
      process.stderr.write(
        `[flavor-grenade-lsp] completion: 0 items for ${p.textDocument?.uri} ` +
          `pos=${p.position?.line}:${p.position?.character} ` +
          `vaultSize=${this.vaultIndex.size()}\n`,
      );
    }
    return result;
  }

  /**
   * Handle a workspace/executeCommand request.
   *
   * Routes to the appropriate command handler based on the `command` field.
   */
  private async handleExecuteCommand(params: unknown): Promise<unknown> {
    const p = params as { command?: string; arguments?: unknown[] } | null | undefined;
    const command = p?.command;

    if (command === 'flavorGrenade.rebuildIndex') {
      process.stderr.write('[flavor-grenade-lsp] executeCommand: rebuildIndex\n');
      await this.initialized.handle({});
      return null;
    }

    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
}
