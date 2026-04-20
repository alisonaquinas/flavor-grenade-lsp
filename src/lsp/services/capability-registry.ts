import { Injectable } from '@nestjs/common';

/** The shape of the capabilities object returned in `InitializeResult`. */
interface ServerCapabilities {
  textDocumentSync?: number;
  [key: string]: unknown;
}

/**
 * Holds and exposes the server capabilities advertised during `initialize`.
 *
 * Additional phases may call {@link merge} to add capabilities before the
 * handshake completes.
 */
@Injectable()
export class CapabilityRegistry {
  private capabilities: ServerCapabilities = {
    textDocumentSync: 1, // TextDocumentSyncKind.Full
  };

  /**
   * Merge additional capabilities into the registry.
   *
   * @param extra - Partial capabilities object to merge in.
   */
  merge(extra: Partial<ServerCapabilities>): void {
    Object.assign(this.capabilities, extra);
  }

  /**
   * Return the current merged capabilities object.
   */
  getCapabilities(): ServerCapabilities {
    return { ...this.capabilities };
  }
}
