import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ResolutionModule } from '../resolution/resolution.module.js';
import { VaultModule } from '../vault/vault.module.js';
import { ParserModule } from '../parser/parser.module.js';
import { ServerSettingsModule } from '../lsp/services/server-settings.module.js';
import { ContextAnalyzer } from './context-analyzer.js';
import { CompletionRouter } from './completion-router.js';
import { HeadingCompletionProvider } from './heading-completion-provider.js';
import { CalloutCompletionProvider } from './callout-completion-provider.js';
import { EmbedCompletionProvider } from './embed-completion-provider.js';
import { TagCompletionProvider } from './tag-completion-provider.js';

/**
 * NestJS module providing all Phase 9 completion infrastructure.
 *
 * Imports:
 * - {@link ResolutionModule} — exposes WikiLinkCompletionProvider, BlockRefCompletionProvider, Oracle
 * - {@link VaultModule}      — exposes VaultIndex, FolderLookup, VaultScanner, TagRegistry
 * - {@link ParserModule}     — exposes ParseCache
 *
 * TagCompletionProvider is provided here (it only needs TagRegistry from VaultModule).
 * WikiLinkCompletionProvider and BlockRefCompletionProvider are provided
 * by ResolutionModule and imported here transitively.
 */
@Module({
  imports: [ResolutionModule, VaultModule, ParserModule, ServerSettingsModule],
  providers: [
    ContextAnalyzer,
    CompletionRouter,
    HeadingCompletionProvider,
    CalloutCompletionProvider,
    EmbedCompletionProvider,
    TagCompletionProvider,
  ],
  exports: [CompletionRouter, ContextAnalyzer, TagCompletionProvider],
})
export class CompletionModule {}
