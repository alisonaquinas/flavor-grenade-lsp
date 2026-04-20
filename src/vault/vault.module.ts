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
 * On init, registers three `flavorGrenade/*` JSON-RPC handlers:
 * - `flavorGrenade/awaitIndexReady` — blocks until the vault scan completes
 * - `flavorGrenade/queryIndex` — debug: returns all indexed DocIds and vault detection info
 * - `flavorGrenade/queryDoc` — debug: returns the full OFM index for a document URI
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
    private readonly vaultIndex: VaultIndex,
    private readonly vaultDetector: VaultDetector,
  ) {}

  /** Register custom `flavorGrenade/*` request handlers. */
  onModuleInit(): void {
    this.dispatcher.onRequest('flavorGrenade/awaitIndexReady', () =>
      this.awaitIndexReadyHandler.handle(),
    );

    /**
     * Debug endpoint: returns list of indexed DocIds plus vault detection info.
     * Used by BDD step definitions to assert on index contents without
     * going through production LSP protocol paths.
     */
    this.dispatcher.onRequest('flavorGrenade/queryIndex', async (params: unknown) => {
      const rootUri = (params as { rootUri?: string } | null)?.rootUri;
      const detection = rootUri
        ? this.vaultDetector.detect(rootUri)
        : { mode: 'single-file' as const, vaultRoot: null };
      const docIds = [...this.vaultIndex.entries()].map(([docId]) => docId as string);
      return {
        docIds,
        mode: detection.mode,
        vaultRoot: detection.vaultRoot,
      };
    });

    /**
     * Debug endpoint: returns the OFM index for a given document URI.
     * Used by BDD step definitions to assert on callouts, blockAnchors,
     * headings, tags, and frontmatter without production LSP protocol paths.
     */
    this.dispatcher.onRequest('flavorGrenade/queryDoc', async (params: unknown) => {
      const uri = (params as { uri: string } | null)?.uri;
      if (!uri) return null;
      for (const [docId, doc] of this.vaultIndex.entries()) {
        if (doc.uri === uri) {
          return {
            docId: docId as string,
            frontmatter: doc.frontmatter,
            frontmatterParseError: doc.frontmatterParseError ?? false,
            index: {
              headings: doc.index.headings,
              blockAnchors: doc.index.blockAnchors,
              tags: doc.index.tags,
              callouts: doc.index.callouts,
              wikiLinks: doc.index.wikiLinks,
              embeds: doc.index.embeds,
            },
          };
        }
      }
      return null;
    });
  }
}
