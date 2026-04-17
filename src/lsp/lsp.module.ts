import { Module } from '@nestjs/common';

/**
 * Root NestJS module for the flavor-grenade LSP server.
 *
 * Phase 1 skeleton — imports, providers, and exports are populated in subsequent phases
 * as the transport layer (Phase 2), OFM parser (Phase 3), and vault index (Phase 4) are
 * added. No LSP logic lives in this class directly; it acts as the composition root.
 */
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class LspModule {}
