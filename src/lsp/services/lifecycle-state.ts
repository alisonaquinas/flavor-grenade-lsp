import { Injectable } from '@nestjs/common';

/**
 * Holds server lifecycle flags shared across handlers.
 *
 * Injected into handlers that need to read or mutate the shutdown state.
 */
@Injectable()
export class LifecycleState {
  /** `true` once the client has sent a `shutdown` request. */
  shutdownRequested: boolean = false;

  /** Workspace root URI captured from the `initialize` request params. */
  rootUri: string | null = null;
}
