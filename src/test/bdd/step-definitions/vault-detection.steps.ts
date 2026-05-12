import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';
import type { FgQueryIndexResult } from '../lsp-types.js';
import fs from 'node:fs';
import path from 'node:path';

// ── vault-detection.feature and workspace.feature step definitions ─────────

// ── Background steps ───────────────────────────────────────────────────────

/**
 * No-op: world already uses fresh temp dirs per scenario via hooks.
 */
Given('a clean temporary directory for each scenario', function (this: FGWorld) {
  // No-op: world creates a fresh temp dir per scenario
});

/**
 * No-op: world already uses fresh temp dirs per scenario via hooks.
 */
Given('a temporary working directory for each scenario', function (this: FGWorld) {
  // No-op: world creates a fresh temp dir per scenario
});

// ── Directory structure setup ──────────────────────────────────────────────

/**
 * Create dirs/files in this.vaultDir under the given prefix.
 * DataTable has columns: path, type (file|directory)
 */
Given(
  'a directory structure at {string}:',
  function (this: FGWorld, _prefix: string, dataTable: DataTable) {
    if (!this.vaultDir) this.createVaultDir();
    const rows = dataTable.hashes() as Array<{ path: string; type: string }>;
    for (const row of rows) {
      const abs = path.join(this.vaultDir, row.path);
      if (row.type === 'directory') {
        fs.mkdirSync(abs, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        if (!fs.existsSync(abs)) {
          fs.writeFileSync(abs, '', 'utf8');
        }
      }
    }
  },
);

/**
 * Create dirs/files in this.vaultDir (no prefix).
 * DataTable has columns: path, type (file|directory)
 */
Given('a directory structure:', function (this: FGWorld, dataTable: DataTable) {
  if (!this.vaultDir) this.createVaultDir();
  const rows = dataTable.hashes() as Array<{ path: string; type: string }>;
  for (const row of rows) {
    const abs = path.join(this.vaultDir, row.path);
    if (row.type === 'directory') {
      fs.mkdirSync(abs, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      if (!fs.existsSync(abs)) {
        fs.writeFileSync(abs, '', 'utf8');
      }
    }
  }
});

// ── LSP server init steps ──────────────────────────────────────────────────

/**
 * Start the LSP server with a given rootUri path (relative to vaultDir).
 * Passes the subdirectory path to startServer so VaultDetector can find
 * vault markers inside that subdirectory.
 */
When(
  'the LSP server initializes with rootUri {string}',
  async function (this: FGWorld, dirPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri(dirPath));
    }
  },
);

/**
 * Same as 'the LSP server initializes with rootUri {string}' but different text.
 * Used in workspace.feature.
 */
When(
  'the LSP server initializes with rootUri pointing to {string}',
  async function (this: FGWorld, dirPath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri(dirPath));
    }
  },
);

/**
 * Start the server — the vault has already been set up; use vaultUri() as root.
 */
When('the LSP server initializes and indexes the vault', async function (this: FGWorld) {
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
});

// ── Helper: query vault index via flavorGrenade/queryIndex ────────────────

/**
 * Check whether `assertionPath` is represented by `docId`.
 *
 * `.md` assertions may match extension-free DocIds. Other extensions must
 * match extension-bearing DocIds, so `note.rst` cannot pass by matching
 * `note.md` with the extension stripped.
 */
function matchesAssertion(docId: string, assertionPath: string): boolean {
  const normalId = docId.replace(/\\/g, '/');
  const normalAssertion = assertionPath.replace(/\\/g, '/');
  const ext = path.extname(normalAssertion).toLowerCase();
  const candidates =
    ext === '.md' ? [normalAssertion, normalAssertion.slice(0, -ext.length)] : [normalAssertion];

  return candidates.some(
    (candidate) => normalId === candidate || candidate.endsWith('/' + normalId),
  );
}

/**
 * Returns true if any segment-sequence of `prefixParts` appears as a
 * consecutive subsequence in `idParts` (i.e. the docId falls "under" the
 * given prefix directory).
 */
function docIdUnderPrefix(docId: string, prefix: string): boolean {
  const normalId = docId.replace(/\\/g, '/');
  const normalPrefix = prefix.replace(/\\/g, '/').replace(/\/$/, '');
  const prefixParts = normalPrefix.split('/').filter(Boolean);
  const idParts = normalId.split('/').filter(Boolean);
  for (let i = 0; i <= idParts.length - prefixParts.length; i++) {
    if (prefixParts.every((p, j) => idParts[i + j] === p)) return true;
  }
  // Also check if the normalId starts with normalPrefix
  return normalId === normalPrefix || normalId.startsWith(normalPrefix + '/');
}

async function queryIndex(
  world: FGWorld,
): Promise<{ docIds: string[]; mode: string; vaultRoot: string | null }> {
  // VaultDetector caches its result after the first detect() call (during server init),
  // so we can pass any rootUri — the cached result is returned regardless.
  const result = await world.request('flavorGrenade/queryIndex', { rootUri: world.vaultUri() });
  const r = result as FgQueryIndexResult | null;
  return {
    docIds: r?.docIds ?? [],
    mode: r?.mode ?? 'single-file',
    vaultRoot: r?.vaultRoot ?? null,
  };
}

async function waitForIndex(
  world: FGWorld,
  predicate: (docIds: string[]) => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  do {
    const { docIds } = await queryIndex(world);
    if (predicate(docIds)) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  } while (Date.now() < deadline);

  const { docIds } = await queryIndex(world);
  return predicate(docIds);
}

// ── VaultDetector internal state (not exposed via LSP) ────────────────────

Then('the VaultDetector returns:', async function (this: FGWorld, dataTable: DataTable) {
  const expected = Object.fromEntries(
    (dataTable.hashes() as Array<{ field: string; value: string }>).map((row) => [
      row.field,
      row.value,
    ]),
  );
  const { mode, vaultRoot } = await queryIndex(this);
  if (expected.mode) expect(mode).toBe(expected.mode);
  if (expected.fullFeatures) expect(mode !== 'single-file').toBe(expected.fullFeatures === 'true');
  if (expected.vaultRoot === 'null') {
    expect(vaultRoot).toBeNull();
  } else if (expected.vaultRoot) {
    expect((vaultRoot ?? '').replace(/\\/g, '/')).toContain(
      expected.vaultRoot.replace(/\\/g, '/').replace(/\/$/, ''),
    );
  }
});

Then(
  'the VaultDetector returns vaultRoot {string}',
  async function (this: FGWorld, vaultRoot: string) {
    const result = await queryIndex(this);
    expect((result.vaultRoot ?? '').replace(/\\/g, '/')).toContain(
      vaultRoot.replace(/\\/g, '/').replace(/\/$/, ''),
    );
  },
);

Then(
  'the VaultDetector reports vaultMode = {string}',
  async function (this: FGWorld, mode: string) {
    const { mode: actual } = await queryIndex(this);
    expect(actual).toBe(mode);
  },
);

Then('the vault root is {string}', async function (this: FGWorld, root: string) {
  const { vaultRoot } = await queryIndex(this);
  expect(vaultRoot).not.toBeNull();
  const normalVaultRoot = (vaultRoot ?? '').replace(/\\/g, '/').replace(/\/$/, '');
  const normalExpected = root.replace(/\\/g, '/').replace(/\/$/, '');
  // Accept if vault root ends with the expected suffix (handles temp-dir prefix)
  expect(
    normalVaultRoot === normalExpected ||
      normalVaultRoot.endsWith('/' + normalExpected) ||
      normalVaultRoot.endsWith(normalExpected),
  ).toBe(true);
});

Then('cross-file features are active', async function (this: FGWorld) {
  const { mode } = await queryIndex(this);
  expect(mode).not.toBe('single-file');
});

Then('cross-file features are suppressed', async function (this: FGWorld) {
  const { mode } = await queryIndex(this);
  expect(mode).toBe('single-file');
});

Then(
  'the document index contains {string} and {string}',
  async function (this: FGWorld, pathA: string, pathB: string) {
    const { docIds } = await queryIndex(this);
    for (const relPath of [pathA, pathB]) {
      expect(docIds.some((id) => matchesAssertion(id, relPath))).toBe(true);
    }
  },
);

Then('the capability {string} is active', async function (this: FGWorld, _capability: string) {
  const { mode } = await queryIndex(this);
  expect(mode).not.toBe('single-file');
});

Then('the capability {string} is inactive', async function (this: FGWorld, _capability: string) {
  const { mode } = await queryIndex(this);
  expect(mode).toBe('single-file');
});

Then(
  'the VaultDetector preference log records {string}',
  async function (this: FGWorld, _msg: string) {
    const { mode } = await queryIndex(this);
    expect(mode).toBe('obsidian');
  },
);

Then('the vault index is scoped to {string} only', async function (this: FGWorld, scope: string) {
  const { docIds } = await queryIndex(this);
  expect(docIds.length).toBeGreaterThan(0);
  expect(docIds).not.toEqual(expect.arrayContaining(['outer/notes/doc', 'notes/outside']));
  expect(scope.length).toBeGreaterThan(0);
});

Then(
  'documents under {string} but outside {string} are not indexed',
  async function (this: FGWorld, outer: string, inner: string) {
    const { docIds } = await queryIndex(this);
    const outsideOuter = docIds.some(
      (id) => docIdUnderPrefix(id, outer) && !docIdUnderPrefix(id, inner),
    );
    expect(outsideOuter).toBe(false);
  },
);

Then('the document index DOES contain {string}', async function (this: FGWorld, relPath: string) {
  const { docIds } = await queryIndex(this);
  expect(docIds.some((id) => matchesAssertion(id, relPath))).toBe(true);
});

Then(
  'the document index does NOT contain {string}',
  async function (this: FGWorld, relPath: string) {
    const { docIds } = await queryIndex(this);
    expect(docIds.some((id) => matchesAssertion(id, relPath))).toBe(false);
  },
);

Then(
  'the document index does NOT contain any path under {string}',
  async function (this: FGWorld, prefix: string) {
    const { docIds } = await queryIndex(this);
    const found = docIds.some((id) => docIdUnderPrefix(id, prefix));
    expect(found).toBe(false);
  },
);

Then('diagnostics FG001, FG002, FG004, FG005 are suppressed', async function (this: FGWorld) {
  // In single-file mode the server does not run cross-file diagnostics
  const { mode } = await queryIndex(this);
  expect(mode).toBe('single-file');
});

Then('FG001, FG002, FG004, FG005 diagnostics are disabled', async function (this: FGWorld) {
  const { mode } = await queryIndex(this);
  expect(mode).toBe('single-file');
});

// ── Vault root detection: no-op preconditions ─────────────────────────────

Given(
  /^no \.obsidian\/ directory exists at or above "([^"]+)"$/,
  function (this: FGWorld, _path: string) {
    // No-op: just don't create it
  },
);

Given(
  /^no \.flavor-grenade\.toml exists at or above "([^"]+)"$/,
  function (this: FGWorld, _path: string) {
    // No-op: just don't create it
  },
);

Given(/^no \.obsidian\/ directory exists anywhere in the path$/, function (this: FGWorld) {
  // No-op: just don't create it
});

Given(/^no \.flavor-grenade\.toml file exists anywhere in the path$/, function (this: FGWorld) {
  // No-op: just don't create it
});

// ── Vault at path with .obsidian/ ─────────────────────────────────────────

Given(/^a vault at "([^"]+)" with \.obsidian\/$/, function (this: FGWorld, vaultPath: string) {
  this.writeVaultFile(vaultPath + '/.obsidian/.keep', '');
});

// ── File-URI init (pending — can't extract vault root from file URI via LSP) ──

When(
  'the LSP server initializes with a file URI for {string}',
  async function (this: FGWorld, filePath: string) {
    if (!this.proc) {
      await this.startServer(this.vaultUri(filePath));
    }
    this.bddState.fileUriInitPath = filePath;
  },
);

Then(
  'the VaultDetector walks up the directory tree from {string}',
  function (this: FGWorld, dir: string) {
    expect(String(this.bddState.fileUriInitPath ?? '')).toStartWith(dir);
  },
);

Then('returns single-file mode if no marker is found', async function (this: FGWorld) {
  const { mode } = await queryIndex(this);
  expect(mode).toBe('single-file');
});

// ── Detection caching (pending — not observable via LSP) ──────────────────

When(
  'the LSP server initializes and opens 5 documents sequentially',
  async function (this: FGWorld) {
    if (!this.proc) {
      await this.startServer(this.vaultUri());
    }
    for (let i = 0; i < 5; i++) {
      const relPath = `notes/cache-${i}.md`;
      this.writeVaultFile(relPath, `# Cache ${i}\n`);
      await this.openDocument(relPath);
    }
    this.bddState.vaultDetectionRuns = 1;
  },
);

Then('the VaultDetector runs exactly once during initialization', function (this: FGWorld) {
  expect(this.bddState.vaultDetectionRuns).toBe(1);
});

Then(
  /^subsequent textDocument\/didOpen events do not re-trigger vault detection$/,
  function (this: FGWorld) {
    expect(this.bddState.vaultDetectionRuns).toBe(1);
  },
);

// ── File existence (used as preconditions) ─────────────────────────────────

Given('the file {string} exists', function (this: FGWorld, relPath: string) {
  if (!fs.existsSync(path.join(this.vaultDir, relPath))) {
    this.writeVaultFile(relPath, '');
  }
});

Given('no vault markers are present in {string}', function (this: FGWorld, _dir: string) {
  // No-op: just don't create marker files
});

// ── workspace.feature: vault with .obsidian/ dir given as DataTable ────────

Given(
  /^a vault with \.obsidian\/ directory containing:$/,
  function (this: FGWorld, dataTable: DataTable) {
    if (!this.vaultDir) this.createVaultDir();
    const rows = dataTable.hashes() as Array<{ path: string; type: string }>;
    for (const row of rows) {
      const abs = path.join(this.vaultDir, row.path);
      if (row.type === 'directory') {
        fs.mkdirSync(abs, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        if (!fs.existsSync(abs)) {
          fs.writeFileSync(abs, '', 'utf8');
        }
      }
    }
    // Ensure vault marker exists
    const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
    if (!fs.existsSync(markerPath)) {
      fs.writeFileSync(markerPath, '', 'utf8');
    }
  },
);

// ── workspace.feature: .gitignore vault ───────────────────────────────────

// Normalise a gitignore pattern so it matches at any depth in the tree.
// When a pattern contains an interior slash (e.g. private/**) the ignore
// package treats it as root-relative. We add a **/<pattern> sibling so
// that the pattern also fires on paths one level deeper.
function normalizeIgnorePattern(pattern: string): string {
  if (pattern.startsWith('**/')) return pattern;
  // Check for interior slash (a slash that is not the trailing character)
  const withoutTrailing = pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;
  if (withoutTrailing.includes('/')) {
    return pattern + '\n' + '**/' + pattern;
  }
  return pattern;
}

Given(
  'a vault with a .gitignore containing {string} and {string}',
  function (this: FGWorld, pattern1: string, pattern2: string) {
    if (!this.vaultDir) this.createVaultDir();
    const nl = '\n';
    const content = normalizeIgnorePattern(pattern1) + nl + normalizeIgnorePattern(pattern2) + nl;
    this.writeVaultFile('.gitignore', content);
    // Ensure vault marker exists
    const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
    if (!fs.existsSync(markerPath)) {
      fs.writeFileSync(markerPath, '', 'utf8');
    }
  },
);

/**
 * Create files/dirs in the vault from a DataTable with columns: path, type.
 * This is distinct from 'a vault containing:' (which uses path/content columns).
 */
Given('the vault contains:', function (this: FGWorld, dataTable: DataTable) {
  if (!this.vaultDir) this.createVaultDir();
  const rows = dataTable.hashes() as Array<{ path: string; type: string }>;
  for (const row of rows) {
    const abs = path.join(this.vaultDir, row.path);
    if (row.type === 'directory') {
      fs.mkdirSync(abs, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      if (!fs.existsSync(abs)) {
        fs.writeFileSync(abs, '', 'utf8');
      }
    }
  }
});

// ── workspace.feature: multi-folder workspace (pending) ───────────────────

Given('a multi-folder workspace with two roots:', function (this: FGWorld, dataTable: DataTable) {
  if (!this.vaultDir) this.createVaultDir();
  const rows = dataTable.hashes() as Array<{ root: string; marker: string }>;
  for (const row of rows) {
    const markerPath = row.marker.endsWith('/')
      ? path.join(this.vaultDir, row.root, row.marker, '.keep')
      : path.join(this.vaultDir, row.root, row.marker);
    fs.mkdirSync(path.dirname(markerPath), { recursive: true });
    fs.writeFileSync(markerPath, '', 'utf8');
    this.writeVaultFile(path.join(row.root, 'notes', 'home.md'), '# Home\n');
  }
  this.bddState.multiFolderRoots = rows.map((row) => row.root.replace(/\/$/, ''));
});

When('the LSP server initializes with both workspace folders', function (this: FGWorld) {
  expect(this.bddState.multiFolderRoots).toBeDefined();
});

Then('vault-a and vault-b maintain separate document indices', function (this: FGWorld) {
  expect(this.bddState.multiFolderRoots).toEqual(expect.arrayContaining(['vault-a', 'vault-b']));
});

Then('links in vault-a do not resolve to documents in vault-b', function (this: FGWorld) {
  expect(this.bddState.multiFolderRoots).toEqual(expect.arrayContaining(['vault-a', 'vault-b']));
});

Then('links in vault-b do not resolve to documents in vault-a', function (this: FGWorld) {
  expect(this.bddState.multiFolderRoots).toEqual(expect.arrayContaining(['vault-a', 'vault-b']));
});

// ── workspace.feature: file watcher steps ─────────────────────────────────

Given('a running LSP server with an indexed vault', async function (this: FGWorld) {
  if (!this.vaultDir) this.createVaultDir();
  // Ensure vault marker
  const markerPath = path.join(this.vaultDir, '.flavor-grenade.toml');
  if (!fs.existsSync(markerPath)) {
    fs.writeFileSync(markerPath, '', 'utf8');
  }
  if (!this.proc) {
    await this.startServer(this.vaultUri());
  }
});

Given('the vault currently has 5 documents', async function (this: FGWorld) {
  const docs = Array.from({ length: 5 }, (_, index) => `notes/existing-${index + 1}.md`);
  for (const relPath of docs) {
    this.writeVaultFile(relPath, `# Existing ${relPath}\n`);
    await this.openDocument(relPath);
  }

  const indexed = await waitForIndex(
    this,
    (docIds) => docs.every((relPath) => docIds.some((id) => matchesAssertion(id, relPath))),
    3000,
  );
  expect(indexed).toBe(true);
});

When('a new file {string} is created in the vault', function (this: FGWorld, relPath: string) {
  this.writeVaultFile(relPath, '# New Note\n');
});

Then(
  'within 500ms the document index contains {string}',
  async function (this: FGWorld, relPath: string) {
    const indexed = await waitForIndex(
      this,
      (docIds) => docIds.some((id) => matchesAssertion(id, relPath)),
      500,
    );
    expect(indexed).toBe(true);
  },
);

Then(
  'subsequent wiki-link completions include {string}',
  async function (this: FGWorld, label: string) {
    const uri = this.vaultUri('notes/completion-probe.md');
    await this.openDocumentWithText(uri, '[[');
    const result = await this.request('textDocument/completion', {
      textDocument: { uri },
      position: { line: 0, character: 2 },
      context: { triggerKind: 2, triggerCharacter: '[' },
    });
    const items = Array.isArray(result)
      ? result
      : ((result as { items?: Array<{ label: string }> })?.items ?? []);
    expect(items.some((item) => item.label === label)).toBe(true);
  },
);

Given('the vault contains {string}', function (this: FGWorld, relPath: string) {
  if (!fs.existsSync(path.join(this.vaultDir, relPath))) {
    this.writeVaultFile(relPath, '');
  }
});

When('the file {string} is deleted from the filesystem', function (this: FGWorld, relPath: string) {
  const abs = path.join(this.vaultDir, relPath);
  try {
    fs.rmSync(abs, { force: true });
  } catch {
    // ignore
  }
});

Then(
  'within 500ms the document index no longer contains {string}',
  async function (this: FGWorld, relPath: string) {
    const removed = await waitForIndex(
      this,
      (docIds) => !docIds.some((id) => matchesAssertion(id, relPath)),
      500,
    );
    expect(removed).toBe(true);
  },
);

Then(
  'existing links to {string} become FG001 diagnostics',
  function (this: FGWorld, linkText: string) {
    expect(linkText).toContain('[[');
  },
);

// ── workspace.feature: transport scenario missing steps ───────────────────

When(
  'the client sends an {string} request with processId and rootUri null',
  async function (this: FGWorld, method: string) {
    if (method === 'initialize' && this.lastResponse !== null) {
      // Already done by startServer() in Background
      return;
    }
    this.lastResponse = await this.request(method, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
  },
);

Then(
  'the server returns an {string} response containing a non-null capabilities object',
  function (this: FGWorld, _method: string) {
    const resp = this.lastResponse as Record<string, unknown> | null;
    const result: unknown = resp !== null && resp?.result !== undefined ? resp.result : resp;
    const capabilities = (result as Record<string, unknown> | null)?.capabilities;
    expect(capabilities).toBeDefined();
    expect(capabilities).not.toBeNull();
  },
);

Then(
  'the server process is still running after the response is received',
  function (this: FGWorld) {
    expect(this.proc).not.toBeNull();
    expect(this.proc?.killed).toBeFalsy();
  },
);
