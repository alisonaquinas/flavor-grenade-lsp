import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { LspModule } from './lsp/lsp.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(LspModule, {
    logger: ['error', 'warn'],
  });
  await app.init();
}

bootstrap().catch(console.error);
