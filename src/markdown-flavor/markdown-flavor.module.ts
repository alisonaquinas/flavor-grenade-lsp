import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { FlavorGrenadeConfigFiles } from './fg-config-files.js';
import { MarkdownFlavorState } from './markdown-flavor-state.js';

@Module({
  providers: [FlavorGrenadeConfigFiles, MarkdownFlavorState],
  exports: [FlavorGrenadeConfigFiles, MarkdownFlavorState],
})
export class MarkdownFlavorModule {}
