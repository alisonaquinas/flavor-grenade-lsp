import { Injectable } from '@nestjs/common';
import { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';

/** Payload shape expected by the extension's status bar listener. */
export interface StatusPayload {
  state: 'initializing' | 'indexing' | 'ready' | 'error';
  vaultCount: number;
  docCount: number;
  message?: string;
}

/**
 * Sends `flavorGrenade/status` notifications to the LSP client.
 *
 * Wraps the dispatcher so handlers can push status updates without
 * knowing the underlying transport details.
 */
@Injectable()
export class StatusNotifier {
  constructor(private readonly dispatcher: JsonRpcDispatcher) {}

  /**
   * Push a status notification to the client.
   *
   * @param payload - The full status payload matching the extension's expected shape.
   */
  send(payload: StatusPayload): void {
    this.dispatcher.sendNotification('flavorGrenade/status', payload);
  }
}
