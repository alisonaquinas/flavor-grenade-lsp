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
 * Check whether `assertionPath` (vault-relative path with extension, e.g.
 * "vault/notes/note.md") is represented by `docId` (vault-relative path
 * without extension, e.g. "notes/note" or "vault/notes/note").
 *
 * A match occurs when the assertion path (stripped of extension) is either
 * equal to the docId, or ends with "/" + docId (suffix match for when the
 * vault root is a subdirectory).
 */
function matchesAssertion(docId: string, assertionPathNoExt: string): boolean {
  const normalId = docId.replace(/\\/g, '/');
  const normalAssertion = assertionPathNoExt.replace(/\\/g, '/');
  return normalId === normalAssertion || normalAssertion.endsWith('/' + normalId);
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

// ── VaultDetector internal state (not exposed via LSP) ────────────────────

Then('the VaultDetector returns:', function (this: FGWorld, _dataTable: DataTable) {
  return 'pending';
});

Then('the VaultDetector returns vaultRoot {string}', function (this: FGWorld, _vaultRoot: string) {
  return 'pending';
});

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
      const noExt = relPath.replace(/\.[^./\\]+$/, '');
      expect(docIds.some((id) => matchesAssertion(id, noExt))).toBe(true);
    }
  },
);

Then('the capability {string} is active', function (this: FGWorld, _capability: string) {
  return 'pending';
});

Then('the capability {string} is inactive', function (this: FGWorld, _capability: string) {
  return 'pending';
});

Then('the VaultDetector preference log records {string}', function (this: FGWorld, _msg: string) {
  return 'pending';
});

Then('the vault index is scoped to {string} only', function (this: FGWorld, _scope: string) {
  return 'pending';
});

Then(
  'documents under {string} but outside {string} are not indexed',
  function (this: FGWorld, _outer: string, _inner: string) {
    return 'pending';
  },
);

Then('the document index DOES contain {string}', async function (this: FGWorld, relPath: string) {
  const { docIds } = await queryIndex(this);
  const noExt = relPath.replace(/\.[^./\\]+$/, '');
  expect(docIds.some((id) => matchesAssertion(id, noExt))).toBe(true);
});

Then(
  'the document index does NOT contain {string}',
  async function (this: FGWorld, relPath: string) {
    const { docIds } = await queryIndex(this);
    const noExt = relPath.replace(/\.[^./\\]+$/, '');
    expect(docIds.some((id) => matchesAssertion(id, noExt))).toBe(false);
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
  function (this: FGWorld, _filePath: string) {
    return 'pending';
  },
);

Then(
  'the VaultDetector walks up the directory tree from {string}',
  function (this: FGWorld, _dir: string) {
    return 'pending';
  },
);

Then('returns single-file mode if no marker is found', function (this: FGWorld) {
  return 'pending';
});

// ── Detection caching (pending — not observable via LSP) ──────────────────

When('the LSP server initializes and opens 5 documents sequentially', function (this: FGWorld) {
  return 'pending';
});

Then('the VaultDetector runs exactly once during initialization', function (this: FGWorld) {
  return 'pending';
});

Then(
  /^subsequent textDocument\/didOpen events do not re-trigger vault detection$/,
  function (this: FGWorld) {
    return 'pending';
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

Given('a multi-folder workspace with two roots:', function (this: FGWorld, _dataTable: DataTable) {
  return 'pending';
});

When('the LSP server initializes with both workspace folders', function (this: FGWorld) {
  return 'pending';
});

Then('vault-a and vault-b maintain separate document indices', function (this: FGWorld) {
  return 'pending';
});

Then('links in vault-a do not resolve to documents in vault-b', function (this: FGWorld) {
  return 'pending';
});

Then('links in vault-b do not resolve to documents in vault-a', function (this: FGWorld) {
  return 'pending';
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

Given('the vault currently has 5 documents', function (this: FGWorld) {
  // No-op — just informational; actual file count doesn't affect test
});

When('a new file {string} is created in the vault', function (this: FGWorld, relPath: string) {
  this.writeVaultFile(relPath, '# New Note\n');
});

Then(
  'within 500ms the document index contains {string}',
  function (this: FGWorld, _relPath: string) {
    return 'pending';
  },
);

Then('subsequent wiki-link completions include {string}', function (this: FGWorld, _label: string) {
  return 'pending';
});

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
  function (this: FGWorld, _relPath: string) {
    return 'pending';
  },
);

Then(
  'existing links to {string} become FG001 diagnostics',
  function (this: FGWorld, _linkText: string) {
    return 'pending';
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
