import 'reflect-metadata';
import { Module, OnModuleInit } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module.js';
import { TransportModule } from '../transport/transport.module.js';
import { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import { VaultDetector } from './vault-detector.js';
import { VaultIndex } from './vault-index.js';
import { FolderLookup } from './folder-lookup.js';
import { VaultScanner } from './vault-scanner.js';
import { FileWatcher } from './file-watcher.js';
import { IgnoreFilter } from './ignore-filter.js';
import { AwaitIndexReadyHandler } from './handlers/await-index-ready.handler.js';
import { TagRegistry } from '../tags/tag-registry.js';

/**
 * NestJS module that wires all vault indexing services.
 *
 * On init, registers the `flavorGrenade/awaitIndexReady` JSON-RPC request
 * with the dispatcher.
 */
@Module({
  imports: [ParserModule, TransportModule],
  providers: [
    VaultDetector,
    VaultIndex,
    FolderLookup,
    VaultScanner,
    FileWatcher,
    IgnoreFilter,
    AwaitIndexReadyHandler,
    TagRegistry,
  ],
  exports: [
    VaultDetector,
    VaultIndex,
    FolderLookup,
    VaultScanner,
    FileWatcher,
    IgnoreFilter,
    AwaitIndexReadyHandler,
    TagRegistry,
  ],
})
export class VaultModule implements OnModuleInit {
  constructor(
    private readonly dispatcher: JsonRpcDispatcher,
    private readonly awaitIndexReadyHandler: AwaitIndexReadyHandler,
  ) {}

  /** Register the `flavorGrenade/awaitIndexReady` request handler. */
  onModuleInit(): void {
    this.dispatcher.onRequest('flavorGrenade/awaitIndexReady', () =>
      this.awaitIndexReadyHandler.handle(),
    );
  }
}
