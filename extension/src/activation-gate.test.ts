import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import {
  COMMAND_ACTIVATION_EVENTS,
  VAULT_MARKER_ACTIVATION_EVENTS,
  decideStartupGate,
  hasVaultMarkerAncestor,
  workspaceFolderHasVaultMarker,
} from './activation-gate.js';

interface ExtensionPackage {
  activationEvents?: string[];
}

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'fg-activation-gate-'));
  tempDirs.push(dir);
  return dir;
}

async function readExtensionPackage(): Promise<ExtensionPackage> {
  const packagePath = resolve('package.json');
  return JSON.parse(await readFile(packagePath, 'utf8')) as ExtensionPackage;
}

describe('activation manifest', () => {
  it('registers vault marker, language, and command activation events', async () => {
    const manifest = await readExtensionPackage();

    assert.deepEqual(
      new Set(manifest.activationEvents),
      new Set([
        ...VAULT_MARKER_ACTIVATION_EVENTS,
        ...COMMAND_ACTIVATION_EVENTS,
        'onLanguage:markdown',
        'onLanguage:ofmarkdown',
      ]),
    );
  });
});

describe('startup gate marker detection', () => {
  it('detects Obsidian and Flavor Grenade marker ancestors', async () => {
    const vault = await createTempDir();
    await mkdir(join(vault, '.obsidian'));
    const note = join(vault, 'notes', 'daily.md');
    await mkdir(join(vault, 'notes'));
    await writeFile(note, '# Daily\n');

    assert.equal(await hasVaultMarkerAncestor(note), true);

    const flavorVault = await createTempDir();
    await writeFile(join(flavorVault, '.mdfattributes'), '*.md flavor=gfm\n');
    const flavorNote = join(flavorVault, 'draft.md');
    await writeFile(flavorNote, '# Draft\n');

    assert.equal(await hasVaultMarkerAncestor(flavorNote), true);
  });

  it('detects .mdfignore and .mdfattributes marker ancestors', async () => {
    for (const [marker, content] of [
      ['.mdfignore', 'drafts/\n'],
      ['.mdfattributes', '*.md flavor=gfm\n'],
    ] as const) {
      const workspace = await createTempDir();
      await writeFile(join(workspace, marker), content);
      const note = join(workspace, 'note.md');
      await writeFile(note, '# Note\n');

      assert.equal(await hasVaultMarkerAncestor(note), true, `${marker} should wake startup gate`);
    }
  });

  it('does not treat legacy flavor config files as Flavor Grenade markers', async () => {
    for (const [marker, content] of [
      ['.flavor-grenade.toml', '[core.markdown]\nflavor = "gfm"\n'],
      ['.flavor-grenade.json', '{"core":{"markdown":{"flavor":"gfm"}}}\n'],
      ['.flavor-grenade.jsonc', '// comment\n{"core":{"markdown":{"flavor":"gfm"}}}\n'],
      ['.flavor-grenade.yaml', 'core:\n  markdown:\n    flavor: gfm\n'],
      ['.flavor-grenade.yml', 'core:\n  markdown:\n    flavor: gfm\n'],
      ['.editorconfig', '[*.md]\nflavor_grenade_markdown_flavor = gfm\n'],
    ] as const) {
      const workspace = await createTempDir();
      await writeFile(join(workspace, marker), content);
      const note = join(workspace, 'note.md');
      await writeFile(note, '# Note\n');

      assert.equal(await hasVaultMarkerAncestor(note), false, `${marker} should not wake startup gate`);
    }
  });

  it('detects workspace root marker signals', async () => {
    const flavorVault = await createTempDir();
    await writeFile(join(flavorVault, '.mdfignore'), 'tmp/\n');

    assert.equal(await workspaceFolderHasVaultMarker({ uri: { fsPath: flavorVault } }), true);
  });
});

describe('startup gate decisions', () => {
  it('keeps generic Markdown workspaces idle until a positive signal appears', async () => {
    const workspace = await createTempDir();
    const note = join(workspace, 'readme.md');
    await writeFile(note, '# Readme\n');

    const decision = await decideStartupGate({
      openDocuments: [{ languageId: 'markdown', uri: { fsPath: note, scheme: 'file' } }],
      workspaceFolders: [{ uri: { fsPath: workspace } }],
    });

    assert.deepEqual(decision, {
      checkedVaultGate: true,
      reason: 'idle',
      startClient: false,
    });
  });

  it('starts for vault markers and OFMarkdown documents', async () => {
    const workspace = await createTempDir();
    await mkdir(join(workspace, '.obsidian'));
    const note = join(workspace, 'notes.md');
    await writeFile(note, '# Notes\n');

    assert.deepEqual(
      await decideStartupGate({
        openDocuments: [{ languageId: 'markdown', uri: { fsPath: note, scheme: 'file' } }],
        workspaceFolders: [{ uri: { fsPath: workspace } }],
      }),
      {
        checkedVaultGate: true,
        reason: 'vault-marker',
        startClient: true,
      },
    );

    const genericWorkspace = await createTempDir();
    const ofmNote = join(genericWorkspace, 'ofm-note.md');
    await writeFile(ofmNote, '# OFMarkdown\n');

    const ofmDecision = await decideStartupGate({
      openDocuments: [{ languageId: 'ofmarkdown', uri: { fsPath: ofmNote, scheme: 'file' } }],
      workspaceFolders: [],
    });

    assert.deepEqual(ofmDecision, {
      checkedVaultGate: true,
      reason: 'language',
      startClient: true,
    });
  });

  it('lets explicit commands wake the client after running startup checks', async () => {
    const decision = await decideStartupGate({
      openDocuments: [],
      trigger: { kind: 'command', commandId: 'flavorGrenade.rebuildIndex' },
      workspaceFolders: [],
    });

    assert.deepEqual(decision, {
      checkedVaultGate: true,
      reason: 'command',
      startClient: true,
    });
  });
});
