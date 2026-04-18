import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module.js';
import { VaultModule } from '../vault/vault.module.js';
import { ResolutionModule } from '../resolution/resolution.module.js';
import { PrepareRenameHandler } from '../handlers/prepare-rename.handler.js';
import { RenameHandler } from '../handlers/rename.handler.js';

/**
 * NestJS module that wires the Phase 11 rename handlers.
 *
 * Provides:
 * - {@link PrepareRenameHandler} — validates cursor position before rename.
 * - {@link RenameHandler} — generates `WorkspaceEdit` for heading and file renames.
 *
 * Note: {@link WorkspaceEditBuilder} is a plain class instantiated per-request
 * inside {@link RenameHandler} and does not need to be a NestJS provider.
 */
@Module({
  imports: [ParserModule, VaultModule, ResolutionModule],
  providers: [PrepareRenameHandler, RenameHandler],
  exports: [PrepareRenameHandler, RenameHandler],
})
export class RenameModule {}
