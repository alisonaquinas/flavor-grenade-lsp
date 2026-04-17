import { Injectable } from '@nestjs/common';
import { JsonRpcDispatcher } from '../../transport/json-rpc-dispatcher.js';

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
   * @param status - A human-readable status string (e.g. `'initializing'`).
   */
  send(status: string): void {
    this.dispatcher.sendNotification('flavorGrenade/status', { status });
  }
}
