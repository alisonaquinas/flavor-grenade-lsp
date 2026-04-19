import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module.js';
import { VaultModule } from '../vault/vault.module.js';
import { ResolutionModule } from '../resolution/resolution.module.js';
import { CodeLensHandler } from '../handlers/code-lens.handler.js';
import { DocumentHighlightHandler } from '../handlers/document-highlight.handler.js';

/**
 * NestJS module providing the two navigation feature handlers:
 * {@link CodeLensHandler} and {@link DocumentHighlightHandler}.
 *
 * {@link DefinitionHandler} and {@link ReferencesHandler} live in
 * {@link ResolutionModule}; this module adds the remaining navigation
 * handlers and re-exports them for {@link LspModule} injection.
 */
@Module({
  imports: [ParserModule, VaultModule, ResolutionModule],
  providers: [CodeLensHandler, DocumentHighlightHandler],
  exports: [CodeLensHandler, DocumentHighlightHandler],
})
export class NavigationModule {}
