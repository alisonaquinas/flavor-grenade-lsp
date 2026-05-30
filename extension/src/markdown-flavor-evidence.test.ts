import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, it } from 'node:test';
import { findMarkdownFlavorEvidence } from './markdown-flavor-evidence.js';
import {
  MARKDOWN_FLAVOR_IDS,
  resolveMarkdownFlavor,
  type MarkdownFlavorId,
} from './markdown-flavor.js';

const INFERENCE_FIXTURES = [
  'gfm-ambiguous',
  'glfm',
  'kramdown',
  'markdown-extra',
  'mdx',
  'multimarkdown',
  'pandoc',
  'r-markdown',
  'reddit',
  'stack-overflow',
] as const;

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

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

async function assertStructuredProfileExamples(workspaceRoot: string, fixtureName: string) {
  const keepPath = join(workspaceRoot, 'structured', 'keep-a-changelog', 'CHANGELOG.md');
  const commonPath = join(workspaceRoot, 'structured', 'common-changelog', 'CHANGELOG.md');
  const madrPath = join(
    workspaceRoot,
    'structured',
    'madr',
    'docs',
    'decisions',
    `0001-${fixtureName}-structured-profile.md`,
  );

  const keep = await readFile(keepPath, 'utf8');
  const common = await readFile(commonPath, 'utf8');
  const madr = await readFile(madrPath, 'utf8');

  assert.match(keep, /## \[Unreleased\]/, `${fixtureName} should include Keep a Changelog syntax`);
  assert.match(
    common,
    /## 0\.1\.0 - 2026-05-23/,
    `${fixtureName} should include Common Changelog syntax`,
  );
  assert.match(
    madr,
    /## Context and Problem Statement/,
    `${fixtureName} should include MADR syntax`,
  );
}

describe('Markdown flavor smoketest fixture evidence', () => {
  const fixtureRoot = resolve('test-fixtures', 'workspaces', 'smoketest');

  it('has one .fgattributes fixture workspace for every explicit supported flavor', async () => {
    for (const flavor of MARKDOWN_FLAVOR_IDS) {
      const config = await stat(join(fixtureRoot, flavor, '.fgattributes'));
      assert.equal(config.isFile(), true, `${flavor} fixture should declare .fgattributes`);
      await assert.rejects(
        stat(join(fixtureRoot, flavor, '.flavor-grenade.toml')),
        `${flavor} fixture must not use legacy project config`,
      );
    }
  });

  it('has structured profile examples for every configured smoke workspace', async () => {
    for (const flavor of MARKDOWN_FLAVOR_IDS) {
      await assertStructuredProfileExamples(join(fixtureRoot, flavor), flavor);
    }
  });

  it('detects each flavor from .fgattributes', async () => {
    for (const flavor of MARKDOWN_FLAVOR_IDS) {
      const root = join(fixtureRoot, flavor);
      const notePath = join(root, 'notes', 'sample.md');
      const sample = await readFile(notePath, 'utf8');
      const evidence = await findMarkdownFlavorEvidence(notePath, { searchBoundary: root });

      assert.ok(sample.trim().length > 0, `${flavor} sample must not be empty`);
      assert.deepEqual(
        evidence,
        {
          hasFlavorConfigMarker: true,
          hasObsidianMarker: false,
          fgAttributesFlavor: flavor,
        },
        `${flavor} fixture should resolve its .fgattributes flavor`,
      );

      const resolution = resolveMarkdownFlavor({
        document: document(notePath),
        selected: 'auto',
        fgAttributesFlavor: evidence.fgAttributesFlavor as MarkdownFlavorId,
        hasObsidianMarker: evidence.hasObsidianMarker,
      });

      assert.deepEqual(
        resolution,
        {
          kind: 'active',
          selected: 'auto',
          effective: flavor,
          source: 'fgattributes',
          structuredProfiles: [],
          structuredProfileSource: 'structured-profile-inference',
        },
        `${flavor} fixture should drive auto resolution through .fgattributes`,
      );
    }
  });

  it('applies root and nested .fgattributes cascades with reset attributes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'fgattributes-cascade-'));
    tempDirs.push(root);
    await mkdir(join(root, 'docs', 'api'), { recursive: true });
    await mkdir(join(root, 'docs', 'drafts'), { recursive: true });
    await mkdir(join(root, 'docs', 'private'), { recursive: true });
    await writeFile(
      join(root, '.fgattributes'),
      [
        '*.md flavor=commonmark structured_profiles=keep-a-changelog',
        'docs/**/*.md flavor=gfm structured_profiles=madr',
        'docs/drafts/*.md !flavor !structured_profiles',
        '!docs/private/*.md',
      ].join('\n'),
    );
    await writeFile(join(root, 'docs', '.fgattributes'), '/api/*.md flavor=glfm');
    const apiPath = join(root, 'docs', 'api', 'CHANGELOG.md');
    const draftPath = join(root, 'docs', 'drafts', 'idea.md');
    const privatePath = join(root, 'docs', 'private', 'notes.md');
    await writeFile(apiPath, '# Changelog\n');
    await writeFile(draftPath, '# Idea\n');
    await writeFile(privatePath, '# Private\n');

    assert.deepEqual(await findMarkdownFlavorEvidence(apiPath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: false,
      fgAttributesFlavor: 'glfm',
      fgAttributesStructuredProfiles: ['madr'],
    });
    assert.deepEqual(await findMarkdownFlavorEvidence(draftPath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: false,
    });
    assert.deepEqual(await findMarkdownFlavorEvidence(privatePath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: false,
    });
  });

  it('applies .fgignore rules with negation before reporting .fgattributes evidence', async () => {
    const root = await mkdtemp(join(tmpdir(), 'fgignore-marker-'));
    tempDirs.push(root);
    await mkdir(join(root, 'drafts'), { recursive: true });
    await writeFile(join(root, '.fgignore'), ['drafts/', '!drafts/keep.md'].join('\n'));
    await writeFile(join(root, '.fgattributes'), '*.md flavor=gfm\n');
    const ignoredPath = join(root, 'drafts', 'idea.md');
    const keptPath = join(root, 'drafts', 'keep.md');
    const notePath = join(root, 'note.md');
    await writeFile(ignoredPath, '# Idea\n');
    await writeFile(keptPath, '# Keep\n');
    await writeFile(notePath, '# Note\n');

    assert.deepEqual(await findMarkdownFlavorEvidence(notePath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: false,
      fgAttributesFlavor: 'gfm',
    });
    assert.deepEqual(await findMarkdownFlavorEvidence(ignoredPath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: false,
      ignored: true,
    });
    assert.deepEqual(await findMarkdownFlavorEvidence(keptPath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: false,
      fgAttributesFlavor: 'gfm',
    });
  });

  it('does not treat legacy project config files as flavor evidence', async () => {
    for (const [marker, content] of [
      ['.flavor-grenade.toml', '[core.markdown]\nflavor = "gfm"\n'],
      ['.flavor-grenade.json', '{"core":{"markdown":{"flavor":"glfm"}}}\n'],
      ['.flavor-grenade.jsonc', '// comment\n{"core":{"markdown":{"flavor":"pandoc"}}}\n'],
      ['.flavor-grenade.yaml', 'core:\n  markdown:\n    flavor: mdx\n'],
      ['.flavor-grenade.yml', 'core:\n  markdown:\n    flavor: kramdown\n'],
      ['.editorconfig', '[*.md]\nflavor_grenade_markdown_flavor = markdown-extra\n'],
    ] as const) {
      const root = await mkdtemp(join(tmpdir(), 'fg-legacy-config-'));
      tempDirs.push(root);
      await writeFile(join(root, marker), content);
      const notePath = join(root, 'notes.md');
      await writeFile(notePath, '# Note\n');

      assert.deepEqual(
        await findMarkdownFlavorEvidence(notePath, { searchBoundary: root }),
        {
          hasFlavorConfigMarker: false,
          hasObsidianMarker: false,
        },
        `${marker} should not configure Markdown flavor`,
      );
    }
  });

  it('honors configured .fgattributes byte limits', async () => {
    const root = await mkdtemp(join(tmpdir(), 'fgattributes-byte-limit-'));
    tempDirs.push(root);
    const config = '*.md flavor=gfm\n';
    await writeFile(join(root, '.fgattributes'), config);
    const notePath = join(root, 'note.md');
    await writeFile(notePath, '# Note\n');

    assert.deepEqual(
      await findMarkdownFlavorEvidence(notePath, {
        searchBoundary: root,
        fgConfigMaxBytes: Buffer.byteLength(config, 'utf8') - 1,
      }),
      {
        hasFlavorConfigMarker: true,
        hasObsidianMarker: false,
      },
    );
    assert.deepEqual(
      await findMarkdownFlavorEvidence(notePath, {
        searchBoundary: root,
        fgConfigMaxBytes: Buffer.byteLength(config, 'utf8'),
      }),
      {
        hasFlavorConfigMarker: true,
        hasObsidianMarker: false,
        fgAttributesFlavor: 'gfm',
      },
    );
  });

  it('has inference-only fixtures without config markers', async () => {
    const inferenceRoot = join(fixtureRoot, 'inference');
    const entries = await readdir(inferenceRoot, { withFileTypes: true });
    const fixtureNames = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    assert.deepEqual(fixtureNames, [...INFERENCE_FIXTURES].sort());

    for (const fixture of INFERENCE_FIXTURES) {
      const samplePath = join(inferenceRoot, fixture, 'notes', 'sample.md');
      const sample = await readFile(samplePath, 'utf8');
      assert.ok(sample.trim().length > 0, `${fixture} inference sample must not be empty`);
      await assertStructuredProfileExamples(join(inferenceRoot, fixture), fixture);
      await assert.rejects(
        stat(join(inferenceRoot, fixture, '.fgattributes')),
        `${fixture} inference fixture must not declare .fgattributes`,
      );
    }
  });

  it('does not inherit markers from outside the active workspace boundary', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'fg-parent-marker-'));
    tempDirs.push(parent);
    const workspaceRoot = join(parent, 'smoketest');
    await mkdir(workspaceRoot);
    await writeFile(join(parent, '.fgattributes'), '*.md flavor=obsidian\n');
    const readmePath = join(workspaceRoot, 'README.md');
    await writeFile(readmePath, '# Smoketest root\n');

    assert.deepEqual(
      await findMarkdownFlavorEvidence(readmePath, { searchBoundary: workspaceRoot }),
      {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: false,
      },
    );
  });

  it('ignores documents that are not inside the supplied workspace boundary', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'fg-outside-boundary-'));
    tempDirs.push(parent);
    const workspaceRoot = join(parent, 'workspace');
    const outsideRoot = join(parent, 'outside');
    await mkdir(workspaceRoot);
    await mkdir(outsideRoot);
    await writeFile(join(outsideRoot, '.fgattributes'), '*.md flavor=gfm\n');
    const notePath = join(outsideRoot, 'note.md');
    await writeFile(notePath, '# Outside\n');

    assert.deepEqual(await findMarkdownFlavorEvidence(notePath, { searchBoundary: workspaceRoot }), {
      hasFlavorConfigMarker: false,
      hasObsidianMarker: false,
    });
  });

  it('rejects realpath evidence outside the supplied workspace boundary', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'fg-realpath-boundary-'));
    tempDirs.push(parent);
    const workspaceRoot = join(parent, 'workspace');
    const linkedRoot = join(workspaceRoot, 'linked');
    const outsideRoot = join(parent, 'outside');
    await mkdir(linkedRoot, { recursive: true });
    await mkdir(outsideRoot);
    await writeFile(join(linkedRoot, '.fgattributes'), '*.md flavor=gfm\n');
    const notePath = join(linkedRoot, 'note.md');
    await writeFile(notePath, '# Linked\n');

    const fakeRealpath = async (path: string) => {
      const resolved = resolve(path);
      if (resolved.startsWith(resolve(linkedRoot))) {
        return resolved.replace(resolve(linkedRoot), resolve(outsideRoot));
      }
      return resolved;
    };

    assert.deepEqual(
      await findMarkdownFlavorEvidence(notePath, {
        realpathFn: fakeRealpath,
        searchBoundary: workspaceRoot,
      }),
      {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: false,
      },
    );
  });

  it('reads .fgattributes from an Obsidian vault root without losing the marker', async () => {
    const root = await mkdtemp(join(tmpdir(), 'fg-obsidian-config-'));
    tempDirs.push(root);
    await mkdir(join(root, '.obsidian'));
    await mkdir(join(root, 'notes'));
    await writeFile(join(root, '.fgattributes'), '*.md flavor=obsidian structured_profiles=madr\n');
    const notePath = join(root, 'notes', 'welcome.md');
    await writeFile(notePath, '# Welcome\n');

    assert.deepEqual(await findMarkdownFlavorEvidence(notePath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: true,
      fgAttributesFlavor: 'obsidian',
      fgAttributesStructuredProfiles: ['madr'],
    });
  });

  it('continues past a nested Obsidian marker to honor workspace .fgattributes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'fg-obsidian-parent-config-'));
    tempDirs.push(root);
    const vaultRoot = join(root, 'vault');
    await mkdir(join(vaultRoot, '.obsidian'), { recursive: true });
    await mkdir(join(vaultRoot, 'notes'));
    await writeFile(
      join(root, '.fgattributes'),
      '*.md flavor=gfm structured_profiles=keep-a-changelog\n',
    );
    const notePath = join(vaultRoot, 'notes', 'welcome.md');
    await writeFile(notePath, '# Welcome\n');

    assert.deepEqual(await findMarkdownFlavorEvidence(notePath, { searchBoundary: root }), {
      hasFlavorConfigMarker: true,
      hasObsidianMarker: true,
      fgAttributesFlavor: 'gfm',
      fgAttributesStructuredProfiles: ['keep-a-changelog'],
    });
  });

  it('stops at an Obsidian vault root when no workspace boundary is supplied', async () => {
    const root = await mkdtemp(join(tmpdir(), 'fg-obsidian-unbounded-parent-'));
    tempDirs.push(root);
    const vaultRoot = join(root, 'vault');
    await mkdir(join(vaultRoot, '.obsidian'), { recursive: true });
    await mkdir(join(vaultRoot, 'notes'));
    await writeFile(join(root, '.fgattributes'), '*.md flavor=gfm\n');
    const notePath = join(vaultRoot, 'notes', 'welcome.md');
    await writeFile(notePath, '# Welcome\n');

    assert.deepEqual(await findMarkdownFlavorEvidence(notePath), {
      hasFlavorConfigMarker: false,
      hasObsidianMarker: true,
    });
  });
});
