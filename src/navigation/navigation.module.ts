import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module.js';
import { VaultModule } from '../vault/vault.module.js';
import { ResolutionModule } from '../resolution/resolution.module.js';
import { CodeLensHandler } from '../handlers/code-lens.handler.js';
import { DocumentHighlightHandler } from '../handlers/document-highlight.handler.js';

/**
 * NestJS module grouping all Phase 10 navigation feature providers.
 *
 * The existing {@link DefinitionHandler} and {@link ReferencesHandler} live in
 * {@link ResolutionModule}; this module adds the two new Phase 10 handlers and
 * re-exports them so {@link LspModule} can inject them.
 */
@Module({
  imports: [ParserModule, VaultModule, ResolutionModule],
  providers: [CodeLensHandler, DocumentHighlightHandler],
  exports: [CodeLensHandler, DocumentHighlightHandler],
})
export class NavigationModule {}
