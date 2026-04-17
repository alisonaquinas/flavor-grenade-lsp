import 'reflect-metadata';
import { Global, Module } from '@nestjs/common';
import { StdioReader } from './stdio-reader.js';
import { StdioWriter } from './stdio-writer.js';
import { JsonRpcDispatcher } from './json-rpc-dispatcher.js';

/**
 * Provides the stdio transport layer: reader, writer, and dispatcher.
 *
 * Marked `@Global()` so that {@link LspModule} and {@link VaultModule} both
 * import it but share the same singleton instances — avoiding duplicate
 * dispatcher registration or a second stdio reader start.
 */
@Global()
@Module({
  providers: [
    StdioReader,
    StdioWriter,
    {
      provide: JsonRpcDispatcher,
      useFactory: (writer: StdioWriter): JsonRpcDispatcher =>
        new JsonRpcDispatcher((msg) => writer.write(process.stdout, msg)),
      inject: [StdioWriter],
    },
  ],
  exports: [StdioReader, StdioWriter, JsonRpcDispatcher],
})
export class TransportModule {}
