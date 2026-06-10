import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { MarkdownFlavorConfigFiles } from './mdf-config-files.js';
import { MarkdownFlavorState } from './markdown-flavor-state.js';

@Module({
  providers: [MarkdownFlavorConfigFiles, MarkdownFlavorState],
  exports: [MarkdownFlavorConfigFiles, MarkdownFlavorState],
})
export class MarkdownFlavorModule {}
