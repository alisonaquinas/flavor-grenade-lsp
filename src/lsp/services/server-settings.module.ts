import { Module } from '@nestjs/common';
import { ServerSettings } from './server-settings.js';

@Module({
  providers: [ServerSettings],
  exports: [ServerSettings],
})
export class ServerSettingsModule {}
