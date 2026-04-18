import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module.js';
import { VaultModule } from '../vault/vault.module.js';
import { ResolutionModule } from '../resolution/resolution.module.js';
import { CreateMissingFileAction } from './create-missing-file.action.js';
import { TocGeneratorAction } from './toc-generator.action.js';
import { TagToYamlAction } from './tag-to-yaml.action.js';
import { FixNbspAction } from './fix-nbsp.action.js';
import { CodeActionHandler } from './code-action.handler.js';

/**
 * NestJS module providing all code action providers.
 */
@Module({
  imports: [ParserModule, VaultModule, ResolutionModule],
  providers: [CreateMissingFileAction, TocGeneratorAction, TagToYamlAction, FixNbspAction, CodeActionHandler],
  exports: [CreateMissingFileAction, TocGeneratorAction, TagToYamlAction, FixNbspAction, CodeActionHandler],
})
export class CodeActionsModule {}
