import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module.js';
import { VaultModule } from '../vault/vault.module.js';
import { Oracle } from './oracle.js';
import { LinkResolver } from './link-resolver.js';
import { RefGraph } from './ref-graph.js';
import { DiagnosticService } from './diagnostic-service.js';
import { WikiLinkCompletionProvider } from './wiki-link-completion-provider.js';
import { DefinitionHandler } from '../handlers/definition.handler.js';
import { ReferencesHandler } from '../handlers/references.handler.js';

/**
 * NestJS module providing all wiki-link resolution services and handlers.
 *
 * Imports: ParserModule (ParseCache), VaultModule (VaultIndex, FolderLookup,
 * VaultDetector), TransportModule (injected via global TransportModule).
 */
@Module({
  imports: [ParserModule, VaultModule],
  providers: [
    Oracle,
    LinkResolver,
    RefGraph,
    DiagnosticService,
    WikiLinkCompletionProvider,
    DefinitionHandler,
    ReferencesHandler,
  ],
  exports: [
    Oracle,
    LinkResolver,
    RefGraph,
    DiagnosticService,
    WikiLinkCompletionProvider,
    DefinitionHandler,
    ReferencesHandler,
  ],
})
export class ResolutionModule {}
