import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, it } from 'node:test';
import { findMarkdownFlavorEvidence } from './markdown-flavor-evidence.js';
import {
  MARKDOWN_FLAVOR_IDS,
  resolveMarkdownFlavor,
  type MarkdownFlavorId,
} from './markdown-flavor.js';

function document(filePath: string) {
  const uri = pathToFileURL(filePath);
  return {
    languageId: 'markdown',
    uri: {
      scheme: uri.protocol.slice(0, -1),
      toString: () => uri.href,
    },
  };
}

describe('Markdown flavor smoketest fixture evidence', () => {
  const fixtureRoot = resolve('test-fixtures', 'workspaces', 'smoketest');

  it('has one fixture workspace for every explicit supported flavor', async () => {
    const entries = await readdir(fixtureRoot, { withFileTypes: true });
    const fixtureNames = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    assert.deepEqual(fixtureNames, [...MARKDOWN_FLAVOR_IDS].sort());
  });

  it('detects each flavor from its project config marker', async () => {
    for (const flavor of MARKDOWN_FLAVOR_IDS) {
      const notePath = join(fixtureRoot, flavor, 'notes', 'sample.md');
      const sample = await readFile(notePath, 'utf8');
      const evidence = await findMarkdownFlavorEvidence(notePath);

      assert.ok(sample.trim().length > 0, `${flavor} sample must not be empty`);
      assert.deepEqual(
        evidence,
        {
          hasFlavorConfigMarker: true,
          hasObsidianMarker: false,
          projectFlavor: flavor,
        },
        `${flavor} fixture should resolve its declared project flavor`,
      );

      const resolution = resolveMarkdownFlavor({
        document: document(notePath),
        selected: 'auto',
        projectFlavor: evidence.projectFlavor as MarkdownFlavorId,
        hasObsidianMarker: evidence.hasObsidianMarker,
      });

      assert.deepEqual(
        resolution,
        {
          kind: 'active',
          selected: 'auto',
          effective: flavor,
          source: 'project-toml',
        },
        `${flavor} fixture should drive auto detection through project TOML`,
      );
    }
  });
});
