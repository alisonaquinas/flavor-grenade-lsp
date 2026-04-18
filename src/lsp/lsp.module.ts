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
import { DefinitionHandler } from '../handlers/definition.handler.js';
import { ReferencesHandler } from '../handlers/references.handler.js';
import { HoverHandler } from '../handlers/hover.handler.js';
import { WikiLinkCompletionProvider } from '../resolution/wiki-link-completion-provider.js';
import { DiagnosticService } from '../resolution/diagnostic-service.js';
import { VaultDetector } from '../vault/vault-detector.js';

/**
 * Root NestJS module for the flavor-grenade LSP server.
 *
 * Wires all transport, service, and handler providers, then on
 * {@link OnModuleInit.onModuleInit} registers each handler with the
 * {@link JsonRpcDispatcher} and starts the stdio reader.
 */
@Module({
  imports: [TransportModule, ParserModule, VaultModule, ResolutionModule],
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
    private readonly completionProvider: WikiLinkCompletionProvider,
    private readonly diagnosticService: DiagnosticService,
    private readonly vaultDetector: VaultDetector,
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
      hoverProvider: true,
      completionProvider: { triggerCharacters: ['['], resolveProvider: false },
    });

    this.dispatcher.onRequest('initialize', (p) => this.initialize.handle(p));
    this.dispatcher.onNotification('initialized', (p) => this.initialized.handle(p));
    this.dispatcher.onRequest('shutdown', (p) => this.shutdown.handle(p));
    this.dispatcher.onNotification('exit', (p) => this.exit.handle(p));
    this.dispatcher.onNotification('textDocument/didOpen', (p) => this.didOpen.handle(p));
    this.dispatcher.onNotification('textDocument/didChange', (p) => this.didChange.handle(p));
    this.dispatcher.onNotification('textDocument/didClose', (p) => this.didClose.handle(p));

    this.dispatcher.onRequest('textDocument/definition', (p) =>
      Promise.resolve(this.definition.handle(p as Parameters<DefinitionHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('textDocument/references', (p) =>
      Promise.resolve(this.references.handle(p as Parameters<ReferencesHandler['handle']>[0])),
    );
    this.dispatcher.onRequest('textDocument/completion', (p) =>
      Promise.resolve(this.handleCompletion(p)),
    );
    this.dispatcher.onRequest('textDocument/hover', (p) =>
      Promise.resolve(this.hover.handle(p as Parameters<HoverHandler['handle']>[0])),
    );

    this.reader.on('message', (raw: string) => {
      this.dispatcher.dispatch(raw).catch((err: unknown) => {
        process.stderr.write(`[flavor-grenade-lsp] dispatch error: ${String(err)}\n`);
      });
    });

    this.reader.start(process.stdin);
  }

  /**
   * Handle a `textDocument/completion` request.
   *
   * Returns all vault document stems as completion items. Partial extraction
   * from document text is deferred to a future phase.
   */
  private handleCompletion(_params: unknown): { items: unknown[]; isIncomplete: boolean } {
    return this.completionProvider.getCompletions('');
  }
}
