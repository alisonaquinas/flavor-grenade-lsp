import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { InitializedHandler } from '../initialized.handler.js';
import { VaultScanner } from '../../../vault/vault-scanner.js';
import { FileWatcher } from '../../../vault/file-watcher.js';
import { VaultDetector } from '../../../vault/vault-detector.js';
import { AwaitIndexReadyHandler } from '../../../vault/handlers/await-index-ready.handler.js';

function makeVaultDetector(vaultRoot: string | null): VaultDetector {
  const mode = vaultRoot === null ? 'single-file' : 'obsidian';
  return {
    detect: jest.fn().mockReturnValue({ mode, vaultRoot }),
  } as unknown as VaultDetector;
}

describe('InitializedHandler', () => {
  let vaultScanner: VaultScanner;
  let fileWatcher: FileWatcher;
  let vaultDetector: VaultDetector;
  let awaitIndexReady: AwaitIndexReadyHandler;

  beforeEach(() => {
    vaultScanner = { scan: jest.fn().mockResolvedValue(undefined) } as unknown as VaultScanner;
    fileWatcher = { start: jest.fn() } as unknown as FileWatcher;
    vaultDetector = makeVaultDetector('/vault');
    awaitIndexReady = { markReady: jest.fn() } as unknown as AwaitIndexReadyHandler;
  });

  it('writes expected message to process.stderr', async () => {
    const writeSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const handler = new InitializedHandler(null, null, null, null);
    await handler.handle({});
    expect(writeSpy).toHaveBeenCalledWith(
      '[flavor-grenade-lsp] initialized notification received\n',
    );
    writeSpy.mockRestore();
  });

  it('early-returns with no rootUri (no scan called)', async () => {
    const handler = new InitializedHandler(
      vaultScanner,
      fileWatcher,
      vaultDetector,
      awaitIndexReady,
    );
    await handler.handle({});
    expect(vaultScanner.scan).not.toHaveBeenCalled();
  });

  it('early-returns when vaultScanner is null', async () => {
    const handler = new InitializedHandler(null, fileWatcher, vaultDetector, awaitIndexReady);
    await handler.handle({ rootUri: 'file:///vault' });
    expect(fileWatcher.start).not.toHaveBeenCalled();
  });

  it('calls vaultScanner.scan(rootUri) when services present', async () => {
    const handler = new InitializedHandler(
      vaultScanner,
      fileWatcher,
      vaultDetector,
      awaitIndexReady,
    );
    await handler.handle({ rootUri: 'file:///vault' });
    expect(vaultScanner.scan).toHaveBeenCalledWith('file:///vault');
  });

  it('calls awaitIndexReady.markReady() after scan', async () => {
    const handler = new InitializedHandler(
      vaultScanner,
      fileWatcher,
      vaultDetector,
      awaitIndexReady,
    );
    await handler.handle({ rootUri: 'file:///vault' });
    expect(awaitIndexReady.markReady).toHaveBeenCalled();
  });

  it('calls fileWatcher.start(vaultRoot) in vault mode', async () => {
    vaultDetector = makeVaultDetector('/vault');
    const handler = new InitializedHandler(
      vaultScanner,
      fileWatcher,
      vaultDetector,
      awaitIndexReady,
    );
    await handler.handle({ rootUri: 'file:///vault' });
    expect(fileWatcher.start).toHaveBeenCalledWith('/vault');
  });

  it('does NOT call fileWatcher.start() in single-file mode', async () => {
    vaultDetector = makeVaultDetector(null);
    const handler = new InitializedHandler(
      vaultScanner,
      fileWatcher,
      vaultDetector,
      awaitIndexReady,
    );
    await handler.handle({ rootUri: 'file:///vault' });
    expect(fileWatcher.start).not.toHaveBeenCalled();
  });

  it('no-throws when all optional deps are null', async () => {
    const handler = new InitializedHandler(null, null, null, null);
    await expect(handler.handle({})).resolves.toBeUndefined();
  });
});
