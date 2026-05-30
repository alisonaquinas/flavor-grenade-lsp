import { describe, expect, it, jest } from '@jest/globals';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { OFMParser } from '../../../parser/ofm-parser.js';
import { ParseCache } from '../../../parser/parser.module.js';
import {
  MARKDOWN_FLAVOR_IDS,
  STRUCTURED_MARKDOWN_PROFILE_IDS,
  isMarkdownFlavorId,
} from '../../../markdown-flavor/index.js';
import { MarkdownFlavorState } from '../../../markdown-flavor/markdown-flavor-state.js';
import { FlavorGrenadeConfigFiles } from '../../../markdown-flavor/fg-config-files.js';
import { DocumentStore } from '../../services/document-store.js';
import { ConfigurationHandler } from '../configuration.handler.js';

describe('workspace/didChangeConfiguration markdown flavor handling', () => {
  it('keeps structured profile ids separate from base Markdown flavor ids', () => {
    expect(STRUCTURED_MARKDOWN_PROFILE_IDS).toEqual([
      'keep-a-changelog',
      'common-changelog',
      'madr',
    ]);
    for (const profileId of STRUCTURED_MARKDOWN_PROFILE_IDS) {
      expect(isMarkdownFlavorId(profileId)).toBe(false);
      expect(MARKDOWN_FLAVOR_IDS).not.toContain(profileId);
    }
  });

  it('refreshes open Markdown from .fgattributes without accepting resource payload assignment', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-config-handler-'));
    try {
      fs.writeFileSync(path.join(root, '.fgattributes'), '*.md flavor=gfm\n');
      const notePath = path.join(root, 'note.md');
      const uri = pathToFileURL(notePath).toString();
      const harness = createHarness(root);
      harness.store.open(uri, 'markdown', 1, '# Note\n');

      await harness.handler.handle({
        settings: {
          flavorGrenade: {
            markdownFlavor: 'reddit',
            markdownStructuredProfiles: ['madr'],
            markdownFlavorResources: {
              [uri]: {
                selected: 'reddit',
                effective: 'reddit',
                source: 'workspace-setting',
              },
            },
          },
        },
      });

      expect(harness.state.snapshot()).toEqual({
        selection: 'auto',
        structuredProfileSelection: 'auto',
      });
      expect(harness.state.effectiveFlavorForUri(uri)).toBeUndefined();
      expect(harness.parseCache.get(uri)?.markdownFlavor).toBe('gfm');
      expect(harness.publishDiagnostics).toHaveBeenCalled();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('clears parse cache and diagnostics when refresh sees an ignored open Markdown file', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-config-ignore-'));
    try {
      fs.writeFileSync(path.join(root, '.fgignore'), '*.md\n');
      const notePath = path.join(root, 'note.md');
      const uri = pathToFileURL(notePath).toString();
      const harness = createHarness(root);
      harness.store.open(uri, 'markdown', 1, '# Note\n');
      harness.parseCache.set(uri, new OFMParser().parse(uri, '# Note\n', 1));

      await harness.handler.handle({ settings: { flavorGrenade: {} } });

      expect(harness.parseCache.get(uri)).toBeUndefined();
      expect(harness.clearDiagnostics).toHaveBeenCalledWith(uri);
      expect(harness.publishDiagnostics).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('treats excessively deep untrusted configuration payloads as unsafe', async () => {
    const harness = createHarness('/vault');
    const root: Record<string, unknown> = {};
    let cursor = root;
    for (let index = 0; index < 150; index += 1) {
      const next: Record<string, unknown> = {};
      cursor.next = next;
      cursor = next;
    }
    cursor.settings = { flavorGrenade: { fgConfigMaxBytes: 1 } };

    await expect(harness.handler.handle(root)).resolves.toBeUndefined();

    expect(harness.publishDiagnostics).not.toHaveBeenCalled();
  });

  it('uses fgConfigMaxBytes as the .fgattributes size cap', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-config-size-'));
    try {
      const config = '*.md flavor=gfm\n';
      fs.writeFileSync(path.join(root, '.fgattributes'), config);
      const notePath = path.join(root, 'note.md');
      const uri = pathToFileURL(notePath).toString();
      const harness = createHarness(root);
      harness.store.open(uri, 'markdown', 1, '# Note\n');

      await harness.handler.handle({
        settings: {
          flavorGrenade: { fgConfigMaxBytes: Buffer.byteLength(config, 'utf8') - 1 },
        },
      });

      expect(harness.parseCache.get(uri)?.markdownFlavor).toBe('commonmark');

      await harness.handler.handle({
        settings: {
          flavorGrenade: { fgConfigMaxBytes: Buffer.byteLength(config, 'utf8') },
        },
      });

      expect(harness.parseCache.get(uri)?.markdownFlavor).toBe('gfm');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

function createHarness(root: string): {
  store: DocumentStore;
  parseCache: ParseCache;
  state: MarkdownFlavorState;
  handler: ConfigurationHandler;
  publishDiagnostics: jest.Mock;
  clearDiagnostics: jest.Mock;
} {
  const store = new DocumentStore();
  const parseCache = new ParseCache();
  const state = new MarkdownFlavorState();
  const publishDiagnostics = jest.fn();
  const clearDiagnostics = jest.fn();
  const diagnosticService = { publishDiagnostics, clearDiagnostics };
  const vaultDetector = {
    detectFresh: (): { mode: 'flavor-grenade'; vaultRoot: string } => ({
      mode: 'flavor-grenade',
      vaultRoot: root,
    }),
  };

  return {
    store,
    parseCache,
    state,
    publishDiagnostics,
    clearDiagnostics,
    handler: new ConfigurationHandler(
      state,
      store,
      new OFMParser(),
      parseCache,
      vaultDetector,
      diagnosticService,
      new FlavorGrenadeConfigFiles(),
    ),
  };
}
