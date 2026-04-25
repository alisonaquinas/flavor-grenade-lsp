/** JSON-RPC 2.0 error codes used by the LSP protocol. */
export const ErrorCodes = {
  ParseError: -32700,
  MethodNotFound: -32601,
  InternalError: -32603,
} as const;

/** A raw JSON-RPC 2.0 request or notification object. */
interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: unknown;
}

type RequestHandler = (params: unknown) => Promise<unknown>;
type NotificationHandler = (params: unknown) => Promise<void>;

/**
 * Routes incoming JSON-RPC 2.0 messages to registered handlers.
 *
 * - **Requests** (have an `id`) receive a response via the output function.
 * - **Notifications** (no `id`) are dispatched and produce no response.
 * - Use {@link sendNotification} to push server-initiated notifications.
 */
export class JsonRpcDispatcher {
  private readonly requests = new Map<string, RequestHandler>();
  private readonly notifications = new Map<string, NotificationHandler>();

  /**
   * @param output - Callback that receives every outbound JSON-RPC object.
   *                 Typically wraps {@link StdioWriter.write}.
   */
  constructor(private readonly output: (message: unknown) => void) {}

  /**
   * Register a handler for the given request method.
   *
   * @param method  - The JSON-RPC method name.
   * @param handler - Async function returning the result value.
   */
  onRequest(method: string, handler: RequestHandler): void {
    this.requests.set(method, handler);
  }

  /**
   * Register a handler for the given notification method.
   *
   * @param method  - The JSON-RPC method name.
   * @param handler - Async function; return value is ignored.
   */
  onNotification(method: string, handler: NotificationHandler): void {
    this.notifications.set(method, handler);
  }

  /**
   * Parse and dispatch a raw JSON string received from the transport layer.
   *
   * @param raw - The UTF-8 message body (excluding the Content-Length header).
   */
  async dispatch(raw: string): Promise<void> {
    let message: JsonRpcMessage;

    try {
      message = JSON.parse(raw) as JsonRpcMessage;
    } catch {
      this.output({
        jsonrpc: '2.0',
        id: null,
        error: { code: ErrorCodes.ParseError, message: 'Parse error' },
      });
      return;
    }

    const isRequest = message.id !== undefined && message.id !== null;

    if (isRequest) {
      await this.dispatchRequest(message);
    } else {
      await this.dispatchNotification(message);
    }
  }

  /**
   * Send a server-initiated notification to the client.
   *
   * @param method - The notification method name.
   * @param params - Optional parameters object.
   */
  sendNotification(method: string, params?: unknown): void {
    this.output({ jsonrpc: '2.0', method, params });
  }

  private async dispatchRequest(message: JsonRpcMessage): Promise<void> {
    const handler = this.requests.get(message.method);

    if (!handler) {
      const registered = Array.from(this.requests.keys()).join(', ');
      process.stderr.write(
        `[dispatcher] Method not found: ${message.method} | registered=[${registered}]\n`,
      );
      this.output({
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: ErrorCodes.MethodNotFound,
          message: `Method not found: ${message.method}`,
        },
      });
      return;
    }

    try {
      const result = await handler(message.params);
      this.output({ jsonrpc: '2.0', id: message.id, result: result ?? null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.output({
        jsonrpc: '2.0',
        id: message.id,
        error: { code: ErrorCodes.InternalError, message: msg },
      });
    }
  }

  private async dispatchNotification(message: JsonRpcMessage): Promise<void> {
    const handler = this.notifications.get(message.method);
    if (!handler) return;
    try {
      await handler(message.params);
    } catch {
      // Notifications have no response channel — swallow errors silently.
    }
  }
}
