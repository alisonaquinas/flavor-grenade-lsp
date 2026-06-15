#!/usr/bin/env node
/**
 * Command-line wrapper for the embedded Flavor Grenade LSP runtime.
 *
 * Provides stable JSON commands for verification, flavor detection, analysis,
 * diagnostics, symbols, folds, hovers, completions, variants, and references.
 * This module owns path confinement and output shaping while delegating flavor
 * intelligence to the embedded LSP.
 *
 * @module wrappers/flavorgrenade
 */
import { spawn } from 'node:child_process';
import { closeSync, existsSync, fstatSync, openSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { LspClient } from './lsp-client.mjs';
import { assertInside, resolveRuntime, verifySigstoreIfAvailable } from './runtime.mjs';
import { errorEnvelope, successEnvelope } from './schema.mjs';

const MDF_CONFIG_MAX_BYTES = 8192;
const PROJECT_MARKERS = ['.mdfignore', '.mdfattributes', '.obsidian'];
const MARKDOWN_FLAVORS = new Set([
  'auto',
  'original',
  'commonmark',
  'obsidian',
  'gfm',
  'glfm',
  'pandoc',
  'multimarkdown',
  'mdx',
  'kramdown',
  'markdown-extra',
  'r-markdown',
  'reddit',
  'stack-overflow',
]);
const STRUCTURED_PROFILES = new Set(['keep-a-changelog', 'common-changelog', 'madr']);

/**
 * Parse CLI input, verify the runtime, run the selected command, and return an
 * envelope-ready result.
 *
 * @returns {Promise<object | undefined>} Command result, or undefined for direct LSP mode.
 */
async function main() {
  const { command, positional, options } = parseArgs(process.argv.slice(2));
  const runtime = await resolveRuntime({ target: options.target ?? 'current' });
  const signature = verifySigstoreIfAvailable(runtime, options);

  if (command === 'lsp') {
    await launchLsp(runtime);
    return undefined;
  }

  if (command === 'verify-install') {
    await withClient(runtime, options, null, async (client) => {
      await client.initialize(null);
    });
    return successEnvelope(runtime, { root: '.', mode: 'none' }, {
      verified: true,
      digest: runtime.sha256,
      signature,
    });
  }

  const targetArg = positional[0];
  if (!targetArg) {
    throw Object.assign(new Error(`Missing path for ${command}.`), {
      code: 'FG_SKILL_MISSING_PATH',
      recoverable: true,
    });
  }

  const locator = parseLocator(targetArg);
  const targetPath = locator.path;
  const workspaceRoot = resolveWorkspace(options.workspace, targetPath);
  const absolutePath = assertInside(workspaceRoot, path.resolve(targetPath));
  const workspace = {
    root: path.relative(process.cwd(), workspaceRoot) || '.',
    mode: statSync(absolutePath).isDirectory() ? 'workspace' : 'single-file',
  };
  const workspaceEvidence = findWorkspaceEvidence(workspaceRoot);
  const rootUri =
    workspaceEvidence.configFilesSeen || workspaceEvidence.hasObsidianDirectory
      ? pathToFileURL(workspaceRoot).toString()
      : null;

  const result = await withClient(runtime, { ...options, cwd: workspaceRoot }, rootUri, async (client) => {
    const files = collectMarkdownFiles(absolutePath, options, workspaceRoot);
    const filesToOpen =
      command === 'hover' && rootUri !== null
        ? mergeUnique([...files, ...collectMarkdownFiles(workspaceRoot, options, workspaceRoot)])
        : files;
    for (const file of filesToOpen) {
      const text = await readFile(file, 'utf8');
      client.didOpen(pathToFileURL(file).toString(), text);
    }

    if (command === 'analyze') return analyze(client, files, workspaceRoot);
    if (command === 'detect' || command === 'explain-flavor') {
      return detect(client, absolutePath, workspaceRoot, { explain: command === 'explain-flavor' });
    }
    if (command === 'diagnostics') return diagnostics(client, files, workspaceRoot);
    if (command === 'symbols') return symbols(client, files, workspaceRoot);
    if (command === 'folds') return folds(client, files, workspaceRoot);
    if (command === 'hover') return hover(client, locator, workspaceRoot);
    if (command === 'completions') return completions(client, locator, workspaceRoot);
    if (command === 'variants') return variants(client, files, workspaceRoot);
    if (command === 'refs') return refs(client, files, workspaceRoot);
    throw Object.assign(new Error(`Unknown command: ${command}.`), {
      code: 'FG_SKILL_UNKNOWN_COMMAND',
      recoverable: true,
    });
  });

  return successEnvelope(runtime, workspace, result);
}

/**
 * Start an LSP client, optionally wait for workspace indexing, and run a command
 * callback against the initialized client.
 *
 * @param {object} runtime - Resolved runtime metadata.
 * @param {object} options - Wrapper options.
 * @param {string | null} rootUri - Workspace root URI for LSP initialization.
 * @param {Function} callback - Command callback that receives the client.
 * @returns {Promise<unknown>} Callback result.
 */
async function withClient(runtime, options, rootUri, callback) {
  const client = new LspClient(runtime.executable, {
    timeoutMs: options.timeoutMs,
    cwd: options.cwd,
  });
  try {
    await client.initialize(rootUri);
    if (rootUri !== null) {
      try {
        await client.request('flavorGrenade/awaitIndexReady', {});
      } catch {}
    }
    return await callback(client);
  } finally {
    await client.shutdown();
  }
}

/**
 * Launch the embedded LSP in pass-through mode for host integrations.
 *
 * @param {object} runtime - Resolved runtime metadata.
 * @returns {Promise<void>}
 */
function launchLsp(runtime) {
  return new Promise((resolve, reject) => {
    const child = spawn(runtime.executable, [], {
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
    });
    child.on('error', (error) => {
      reject(Object.assign(error, { code: 'FG_SKILL_LSP_LAUNCH_FAILED', recoverable: false }));
    });
    child.on('exit', (code) => {
      process.exitCode = code ?? 0;
      resolve();
    });
  });
}

/**
 * Collect flavor, diagnostics, symbols, folds, and link data for Markdown files.
 *
 * @param {LspClient} client - Initialized LSP client.
 * @param {string[]} files - Absolute Markdown file paths.
 * @param {string} workspaceRoot - Workspace root path.
 * @returns {Promise<object>} Analysis summary and per-file results.
 */
async function analyze(client, files, workspaceRoot) {
  const analyzed = [];
  for (const file of files) {
    const decision = await detectFile(client, file, workspaceRoot);
    const uri = pathToFileURL(file).toString();
    const [symbolsResult, foldsResult, linksResult] = await Promise.all([
      client.request('textDocument/documentSymbol', { textDocument: { uri } }).catch(() => []),
      client.request('textDocument/foldingRange', { textDocument: { uri } }).catch(() => []),
      client.request('textDocument/documentLink', { textDocument: { uri } }).catch(() => []),
    ]);
    analyzed.push({
      path: relativePath(workspaceRoot, file),
      languageId: 'markdown',
      baseFlavor: decision.baseFlavor,
      variants: decision.variants,
      confidence: decision.confidence,
      source: decision.source,
      evidence: decision.evidence,
      config: decision.config,
      diagnostics: client.diagnostics.get(uri) ?? [],
      symbols: symbolsResult,
      folds: foldsResult,
      links: linksResult,
      boundaries: [],
    });
  }
  return {
    files: analyzed,
    summary: {
      fileCount: analyzed.length,
      diagnosticCount: analyzed.reduce((count, file) => count + file.diagnostics.length, 0),
      flavors: [...new Set(analyzed.map((file) => file.baseFlavor))],
      variants: [...new Set(analyzed.flatMap((file) => file.variants))],
    },
  };
}

/**
 * Return the flavor decision for a single file, with optional decision-tree
 * details for agent explanation.
 *
 * @param {LspClient} client - Initialized LSP client.
 * @param {string} file - Absolute Markdown file path.
 * @param {string} workspaceRoot - Workspace root path.
 * @param {object} [options] - Detection options.
 * @param {boolean} [options.explain] - Include decision-tree details.
 * @returns {Promise<object>} Flavor decision payload.
 */
async function detect(client, file, workspaceRoot, options = {}) {
  const decision = await detectFile(client, file, workspaceRoot);
  if (!options.explain) return decision;
  return {
    path: decision.path,
    selected: {
      baseFlavor: decision.baseFlavor,
      variants: decision.variants,
      confidence: decision.confidence,
    },
    config: decision.config,
    decisionTree: [
      {
        step: 'visibility',
        matched: decision.config.ignored === true,
        reason:
          decision.config.ignored === true
            ? 'A matching .mdfignore rule makes the document inactive.'
            : 'No matching .mdfignore rule hides this document.',
      },
      {
        step: 'mdfattributes',
        matched: decision.config.source === 'mdfattributes',
        reason:
          decision.config.source === 'mdfattributes'
            ? 'A concrete .mdfattributes flavor selected the base flavor.'
            : 'No concrete .mdfattributes flavor selected the base flavor.',
      },
      {
        step: 'auto-detect',
        matched: decision.source === 'lsp-auto-detect',
        reason:
          decision.source === 'lsp-auto-detect'
            ? 'Auto Detect ran because .mdfattributes is absent, resets flavor, or requests flavor=auto.'
            : 'Auto Detect did not run because a concrete .mdfattributes flavor selected the base flavor.',
        evidence: decision.evidence.map((entry) => entry.kind),
      },
    ],
    rejected: [],
  };
}

/**
 * Query the LSP and local filesystem evidence for one file's effective flavor.
 *
 * @param {LspClient} client - Initialized LSP client.
 * @param {string} file - Absolute Markdown file path.
 * @param {string} workspaceRoot - Workspace root path.
 * @returns {Promise<object>} Normalized flavor decision.
 */
async function detectFile(client, file, workspaceRoot) {
  const uri = pathToFileURL(file).toString();
  const text = await readFile(file, 'utf8');
  const config = findConfigEvidence(workspaceRoot, file);
  if (config.ignored) {
    return {
      path: relativePath(workspaceRoot, file),
      active: false,
      baseFlavor: null,
      variants: [],
      confidence: 'high',
      source: 'mdfignore',
      evidence: [{ kind: 'mdfignore', value: config.matchedIgnore?.pattern ?? null, weight: 'strong' }],
      config,
      overrides: [],
    };
  }
  const query = await client.request('flavorGrenade/queryOpenDoc', { uri });
  const rawBaseFlavor = query?.markdownFlavor ?? 'commonmark';
  const baseFlavor = rawBaseFlavor;
  const variantsValue = query?.structuredProfiles;
  const variants = mergeUnique([
    ...(Array.isArray(variantsValue) ? variantsValue : []),
    ...inferStructuredProfiles(file, text),
  ]);
  const concreteMdfAttributesFlavor =
    config.attributes.flavor !== undefined && config.attributes.flavor !== 'auto';
  return {
    path: relativePath(workspaceRoot, file),
    active: true,
    baseFlavor,
    variants,
    confidence: concreteMdfAttributesFlavor ? 'high' : 'medium',
    source: concreteMdfAttributesFlavor ? 'mdfattributes' : 'lsp-auto-detect',
    evidence: [
      {
        kind: concreteMdfAttributesFlavor ? 'mdfattributes' : 'lsp-effective-context',
        value: concreteMdfAttributesFlavor ? config.attributes.flavor : baseFlavor,
        weight: concreteMdfAttributesFlavor ? 'strong' : 'medium',
      },
    ],
    config,
    overrides: [],
  };
}

async function diagnostics(client, files, workspaceRoot) {
  await Promise.all(
    files.map((file) => client.waitForDiagnostics(pathToFileURL(file).toString())),
  );
  return {
    diagnostics: files.flatMap((file) => {
      const uri = pathToFileURL(file).toString();
      return (client.diagnostics.get(uri) ?? []).map((diagnostic) => ({
        path: relativePath(workspaceRoot, file),
        ...diagnostic,
      }));
    }),
  };
}

async function symbols(client, files, workspaceRoot) {
  return {
    symbols: await Promise.all(files.map(async (file) => ({
      path: relativePath(workspaceRoot, file),
      items: await client
        .request('textDocument/documentSymbol', { textDocument: { uri: pathToFileURL(file).toString() } })
        .catch(() => []),
    }))),
  };
}

async function folds(client, files, workspaceRoot) {
  return {
    folds: await Promise.all(files.map(async (file) => ({
      path: relativePath(workspaceRoot, file),
      items: await client
        .request('textDocument/foldingRange', { textDocument: { uri: pathToFileURL(file).toString() } })
        .catch(() => []),
    }))),
  };
}

async function hover(client, locator, workspaceRoot) {
  const file = path.resolve(locator.path);
  const uri = pathToFileURL(file).toString();
  const hoverResult = await client.request('textDocument/hover', {
    textDocument: { uri },
    position: { line: locator.line, character: locator.character },
  }).catch(() => null);
  return {
    path: relativePath(workspaceRoot, file),
    hover: hoverResult ?? structuredProfileHoverFallback(file, locator),
  };
}

async function completions(client, locator, workspaceRoot) {
  const uri = pathToFileURL(path.resolve(locator.path)).toString();
  const result = await client.request('textDocument/completion', {
    textDocument: { uri },
    position: { line: locator.line, character: locator.character },
  }).catch(() => ({ items: [], isIncomplete: false }));
  return {
    path: relativePath(workspaceRoot, path.resolve(locator.path)),
    items: Array.isArray(result) ? result : result.items ?? [],
  };
}

async function variants(client, files, workspaceRoot) {
  return {
    files: await Promise.all(files.map(async (file) => {
      const decision = await detectFile(client, file, workspaceRoot);
      return { path: decision.path, baseFlavor: decision.baseFlavor, variants: decision.variants };
    })),
  };
}

async function refs(client, files, workspaceRoot) {
  return {
    references: await Promise.all(files.map(async (file) => ({
      path: relativePath(workspaceRoot, file),
      links: await client
        .request('textDocument/documentLink', { textDocument: { uri: pathToFileURL(file).toString() } })
        .catch(() => []),
      boundaries: [],
    }))),
  };
}

function parseArgs(args) {
  const [command = 'help', ...rest] = args;
  const positional = [];
  const options = { json: true };
  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--workspace') options.workspace = rest[++index];
    else if (arg === '--config') options.config = rest[++index];
    else if (arg === '--timeout-ms') options.timeoutMs = Number(rest[++index]);
    else if (arg === '--target') options.target = rest[++index];
    else if (arg === '--require-signature') options.requireSignature = true;
    else if (arg === '--no-signature-check') options.noSignatureCheck = true;
    else if (arg === '--include') options.include = rest[++index];
    else if (arg === '--exclude') options.exclude = rest[++index];
    else if (arg === '--max-files') options.maxFiles = Number(rest[++index]);
    else if (arg === '--max-bytes') options.maxBytes = Number(rest[++index]);
    else positional.push(arg);
  }
  return { command, positional, options };
}

function parseLocator(value) {
  const match = /^(.*):(\d+):(\d+)$/.exec(value);
  if (!match) return { path: value, line: 0, character: 0 };
  return { path: match[1], line: Number(match[2]), character: Number(match[3]) };
}

function resolveWorkspace(workspaceOption, targetPath) {
  if (workspaceOption) return assertInside(process.cwd(), path.resolve(workspaceOption));
  const resolved = path.resolve(targetPath);
  if (!existsSync(resolved)) return process.cwd();
  const stat = statSync(resolved);
  const start = stat.isDirectory() ? resolved : path.dirname(resolved);
  return findMarkedWorkspaceRoot(start) ?? start;
}

function collectMarkdownFiles(target, options, workspaceRoot = undefined) {
  const stat = statSync(target);
  const root = workspaceRoot ?? (stat.isDirectory() ? target : path.dirname(target));
  if (stat.isFile()) {
    return shouldCollectFile(target, root, options, stat) ? [target] : [];
  }
  const files = [];
  const stack = [target];
  const maxFiles = positiveIntegerOrDefault(options.maxFiles, 500);
  while (stack.length > 0 && files.length < maxFiles) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && shouldCollectFile(full, root, options)) files.push(full);
      if (files.length >= maxFiles) break;
    }
  }
  return files;
}

function shouldCollectFile(file, root, options, knownStat = undefined) {
  if (!file.toLowerCase().endsWith('.md')) return false;
  const relative = relativePath(root, file);
  if (!matchesAnySelector(options.include, relative, true)) return false;
  if (matchesAnySelector(options.exclude, relative, false)) return false;
  if (findConfigEvidence(root, file).ignored) return false;
  const maxBytes = positiveIntegerOrDefault(options.maxBytes, Number.POSITIVE_INFINITY);
  if (Number.isFinite(maxBytes)) {
    const stat = knownStat ?? statSync(file);
    if (stat.size > maxBytes) return false;
  }
  return true;
}

function matchesAnySelector(value, relative, defaultValue) {
  const selectors = normalizeSelectorList(value);
  if (selectors.length === 0) return defaultValue;
  return selectors.some((selector) => configSelectorMatches(selector, relative));
}

function normalizeSelectorList(value) {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(normalizeSelectorList);
  return String(value)
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean);
}

function positiveIntegerOrDefault(value, defaultValue) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return defaultValue;
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : defaultValue;
}

function findConfigEvidence(workspaceRoot, file) {
  if (file === undefined) return findWorkspaceEvidence(workspaceRoot).config;
  return resolveMdfConfigForFile(workspaceRoot, file);
}

function findWorkspaceEvidence(workspaceRoot) {
  return {
    config: resolveMdfConfigForFile(workspaceRoot),
    configFilesSeen:
      existsSync(path.join(workspaceRoot, '.mdfignore')) ||
      existsSync(path.join(workspaceRoot, '.mdfattributes')),
    hasObsidianDirectory: existsSync(path.join(workspaceRoot, '.obsidian')),
  };
}

function findMarkedWorkspaceRoot(start) {
  let current = start;
  let marked = null;
  const boundary = path.resolve(process.cwd());
  while (true) {
    try {
      assertInside(boundary, current);
    } catch {
      break;
    }
    if (PROJECT_MARKERS.some((marker) => existsSync(path.join(current, marker)))) {
      marked = current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return marked;
}

function resolveMdfConfigForFile(workspaceRoot, file = undefined) {
  const configFiles = [];
  const attributes = {};
  let ignored = false;
  let matchedIgnore = null;
  let matchedAttributes = null;

  const directories =
    file === undefined
      ? [{ directory: workspaceRoot, relativeTargetPath: '' }]
      : configDirectoriesFor(workspaceRoot, file);

  for (const directory of directories) {
    const ignorePath = path.join(directory.directory, '.mdfignore');
    const ignoreContent = readConfigIfPresent(ignorePath);
    if (ignoreContent !== undefined) {
      configFiles.push(relativePath(workspaceRoot, ignorePath));
      const result = applyIgnoreRules(
        ignored,
        parseIgnoreRules(ignoreContent),
        directory.relativeTargetPath,
        relativePath(workspaceRoot, ignorePath),
      );
      ignored = result.ignored;
      matchedIgnore = result.matched ?? matchedIgnore;
    }

    const attributesPath = path.join(directory.directory, '.mdfattributes');
    const attributesContent = readConfigIfPresent(attributesPath);
    if (attributesContent !== undefined) {
      configFiles.push(relativePath(workspaceRoot, attributesPath));
      const result = applyAttributeRules(
        attributes,
        parseAttributeRules(attributesContent),
        directory.relativeTargetPath,
        relativePath(workspaceRoot, attributesPath),
      );
      matchedAttributes = result.matched ?? matchedAttributes;
    }
  }

  const source = ignored
    ? 'mdfignore'
    : attributes.flavor !== undefined && attributes.flavor !== 'auto'
      ? 'mdfattributes'
      : 'none';

  return {
    source,
    format: configFiles.length === 0 ? 'none' : 'mdf-config',
    path: matchedAttributes?.path ?? matchedIgnore?.path ?? configFiles[configFiles.length - 1] ?? null,
    configFiles,
    ignored,
    inactiveReason: ignored ? 'mdfignore' : null,
    attributes,
    matchedIgnore,
    matchedOverride: matchedAttributes,
  };
}

function configDirectoriesFor(workspaceRoot, file) {
  const fileDirectory = path.dirname(file);
  const relativeDirectory = relativePath(workspaceRoot, fileDirectory);
  const parts = relativeDirectory === '.' || relativeDirectory === '' ? [] : relativeDirectory.split('/');
  const result = [];
  for (let index = 0; index <= parts.length; index += 1) {
    const relativeDir = parts.slice(0, index).join('/');
    const directory = relativeDir.length === 0 ? workspaceRoot : path.join(workspaceRoot, relativeDir);
    result.push({
      directory,
      relativeTargetPath:
        relativeDir.length === 0 ? relativePath(workspaceRoot, file) : relativePath(directory, file),
    });
  }
  return result;
}

function readConfigIfPresent(file) {
  let fd;
  try {
    fd = openSync(file, 'r');
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > MDF_CONFIG_MAX_BYTES) return undefined;
    const content = readFileSync(fd, 'utf8');
    return Buffer.byteLength(content, 'utf8') > MDF_CONFIG_MAX_BYTES ? undefined : content;
  } catch {
    return undefined;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

function parseIgnoreRules(content) {
  const rules = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeConfigLine(rawLine);
    if (line.length === 0) continue;
    const negated = line.startsWith('!');
    const pattern = unescapePattern(negated ? line.slice(1) : line);
    if (pattern.length > 0) rules.push({ pattern, negated });
  }
  return rules;
}

function parseAttributeRules(content) {
  const rules = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeConfigLine(rawLine);
    if (line.length === 0) continue;
    const tokens = splitConfigTokens(line);
    if (tokens.length === 0) continue;
    const rawPattern = tokens[0];
    const negated = rawPattern.startsWith('!');
    const pattern = unescapePattern(negated ? rawPattern.slice(1) : rawPattern);
    const assignments = tokens.slice(1).flatMap(parseAttributeToken);
    if (pattern.length > 0 && (negated || assignments.length > 0)) {
      rules.push({ pattern, negated, assignments });
    }
  }
  return rules;
}

function applyIgnoreRules(initialIgnored, rules, relativeTargetPath, configPath) {
  let ignored = initialIgnored;
  let matched = null;
  for (const [order, rule] of rules.entries()) {
    if (!patternMatches(rule.pattern, relativeTargetPath)) continue;
    ignored = !rule.negated;
    matched = { path: configPath, pattern: rule.pattern, negated: rule.negated, order };
  }
  return { ignored, matched };
}

function applyAttributeRules(attributes, rules, relativeTargetPath, configPath) {
  const local = {};
  const localResets = new Set();
  let matched = null;

  for (const [order, rule] of rules.entries()) {
    if (!patternMatches(rule.pattern, relativeTargetPath)) continue;
    if (rule.negated) {
      delete local.flavor;
      delete local.structuredProfiles;
      localResets.delete('flavor');
      localResets.delete('structuredProfiles');
      matched = attributeEvidence(configPath, rule, order);
      continue;
    }
    for (const assignment of rule.assignments) {
      if (assignment.kind === 'reset') {
        delete local[assignment.key];
        localResets.add(assignment.key);
      } else {
        local[assignment.key] = assignment.value;
        localResets.delete(assignment.key);
      }
    }
    matched = attributeEvidence(configPath, rule, order);
  }

  if (localResets.has('flavor')) delete attributes.flavor;
  else if (local.flavor !== undefined) attributes.flavor = local.flavor;
  if (localResets.has('structuredProfiles')) delete attributes.structuredProfiles;
  else if (local.structuredProfiles !== undefined) {
    attributes.structuredProfiles = local.structuredProfiles;
  }

  return { matched };
}

function attributeEvidence(configPath, rule, order) {
  const provided = [
    ...new Set(rule.assignments.map((assignment) => assignment.key)),
  ];
  return {
    path: configPath,
    selector: rule.pattern,
    selectorKind: rule.pattern.includes('*') || rule.pattern.includes('?') ? 'glob' : 'path',
    negated: rule.negated,
    order,
    provided,
    inherited: ['flavor', 'structuredProfiles'].filter((key) => !provided.includes(key)),
  };
}

function parseAttributeToken(token) {
  const resetMatch = /^!(flavor|structured_profiles|structuredProfiles)$/.exec(token);
  if (resetMatch) {
    return [{ kind: 'reset', key: normalizeAttributeKey(resetMatch[1]) }];
  }
  const [rawKey, ...rawValueParts] = token.split('=');
  if (rawValueParts.length === 0) return [];
  const key = normalizeAttributeKey(rawKey);
  const rawValue = rawValueParts.join('=');
  if (key === 'flavor' && MARKDOWN_FLAVORS.has(rawValue)) {
    return [{ kind: 'set', key, value: rawValue }];
  }
  if (key === 'structuredProfiles' || key === 'structured_profiles') {
    const value = normalizeStructuredProfilesValue(rawValue);
    return value === undefined ? [] : [{ kind: 'set', key: 'structuredProfiles', value }];
  }
  return [];
}

function normalizeAttributeKey(value) {
  if (value === 'flavor') return 'flavor';
  if (value === 'structured_profiles' || value === 'structuredProfiles') return 'structuredProfiles';
  return undefined;
}

function normalizeStructuredProfilesValue(value) {
  if (value === 'auto' || value === 'none') return value;
  const profiles = value.split(',').map((part) => part.trim()).filter(Boolean);
  return profiles.every((profile) => STRUCTURED_PROFILES.has(profile)) ? profiles : undefined;
}

function configSelectorMatches(selector, relative) {
  return patternMatches(selector, relative);
}

function patternMatches(rawPattern, rawRelativePath) {
  const pattern = normalizePattern(rawPattern);
  const relative = trimSlashes(toPosix(rawRelativePath));
  if (pattern.length === 0 || relative.length === 0) return false;

  const anchored = pattern.startsWith('/');
  const directoryOnly = pattern.endsWith('/');
  const normalizedPattern = trimSlashes(pattern);
  const candidatePattern = directoryOnly ? `${normalizedPattern}/**` : normalizedPattern;

  if (anchored || candidatePattern.includes('/')) {
    return globPatternMatches(candidatePattern, relative);
  }

  return relative.split('/').some((segment) => wildcardSegmentMatches(candidatePattern, segment));
}

function globPatternMatches(pattern, relative) {
  const patternParts = trimSlashes(pattern).split('/');
  const relativeParts = trimSlashes(relative).split('/');
  return globSegmentsMatch(patternParts, relativeParts, 0, 0);
}

function globSegmentsMatch(patternParts, relativeParts, patternIndex, relativeIndex) {
  if (patternIndex === patternParts.length) return relativeIndex === relativeParts.length;
  const patternPart = patternParts[patternIndex];
  if (patternPart === '**') {
    for (let nextIndex = relativeIndex; nextIndex <= relativeParts.length; nextIndex += 1) {
      if (globSegmentsMatch(patternParts, relativeParts, patternIndex + 1, nextIndex)) {
        return true;
      }
    }
    return false;
  }
  return (
    relativeIndex < relativeParts.length &&
    wildcardSegmentMatches(patternPart, relativeParts[relativeIndex]) &&
    globSegmentsMatch(patternParts, relativeParts, patternIndex + 1, relativeIndex + 1)
  );
}

function wildcardSegmentMatches(pattern, value) {
  return segmentTokensMatch(parseSegmentTokens(pattern), [...value], 0, 0, new Set());
}

function parseSegmentTokens(pattern) {
  const tokens = [];
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === '\\') {
      index += 1;
      tokens.push({ kind: 'literal', value: pattern[index] ?? '\\' });
      continue;
    }
    if (char === '*') {
      tokens.push({ kind: 'star' });
      continue;
    }
    if (char === '?') {
      tokens.push({ kind: 'any' });
      continue;
    }
    if (char === '[') {
      const characterClass = parseCharacterClass(pattern, index);
      if (characterClass !== null) {
        tokens.push(characterClass.token);
        index = characterClass.end;
        continue;
      }
    }
    tokens.push({ kind: 'literal', value: char });
  }
  return tokens;
}

function parseCharacterClass(pattern, start) {
  let end = start + 1;
  if (pattern[end] === '!' || pattern[end] === '^') end += 1;
  if (pattern[end] === ']') end += 1;
  while (end < pattern.length && pattern[end] !== ']') {
    end += pattern[end] === '\\' ? 2 : 1;
  }
  if (end >= pattern.length) return null;

  const raw = pattern.slice(start + 1, end);
  if (raw.length === 0 || raw === '!' || raw === '^') return null;
  const negated = raw.startsWith('!') || raw.startsWith('^');
  const body = negated ? raw.slice(1) : raw;
  const parsed = parseCharacterClassBody(body);
  return {
    token: { kind: 'class', negated, characters: parsed.characters, ranges: parsed.ranges },
    end,
  };
}

function parseCharacterClassBody(body) {
  const characters = [];
  const ranges = [];
  const parts = [];

  for (let index = 0; index < body.length; index += 1) {
    if (body[index] === '\\' && index + 1 < body.length) index += 1;
    parts.push(body[index]);
  }

  for (let index = 0; index < parts.length; index += 1) {
    if (index + 2 < parts.length && parts[index + 1] === '-') {
      ranges.push({ start: parts[index], end: parts[index + 2] });
      index += 2;
    } else {
      characters.push(parts[index]);
    }
  }

  return { characters, ranges };
}

function segmentTokensMatch(tokens, value, tokenIndex, valueIndex, seen) {
  const key = `${tokenIndex}:${valueIndex}`;
  if (seen.has(key)) return false;
  seen.add(key);

  if (tokenIndex === tokens.length) return valueIndex === value.length;

  const token = tokens[tokenIndex];
  if (token.kind === 'star') {
    for (let nextValueIndex = valueIndex; nextValueIndex <= value.length; nextValueIndex += 1) {
      if (segmentTokensMatch(tokens, value, tokenIndex + 1, nextValueIndex, seen)) {
        return true;
      }
    }
    return false;
  }

  return (
    valueIndex < value.length &&
    segmentTokenMatches(token, value[valueIndex]) &&
    segmentTokensMatch(tokens, value, tokenIndex + 1, valueIndex + 1, seen)
  );
}

function segmentTokenMatches(token, value) {
  if (token.kind === 'literal') return token.value === value;
  if (token.kind === 'any') return true;
  if (token.kind === 'class') {
    const codePoint = value.codePointAt(0) ?? 0;
    const matched =
      token.characters.includes(value) ||
      token.ranges.some(
        (range) =>
          codePoint >= (range.start.codePointAt(0) ?? 0) &&
          codePoint <= (range.end.codePointAt(0) ?? 0),
      );
    return token.negated ? !matched : matched;
  }
  return false;
}

function normalizeConfigLine(rawLine) {
  const trimmedRight = rawLine.replace(/\s+$/u, '');
  if (/^\s*(#|$)/.test(trimmedRight)) return '';
  return trimmedRight.trimStart();
}

function splitConfigTokens(line) {
  const tokens = [];
  let current = '';
  let escaped = false;
  for (const char of line) {
    if (escaped) {
      current += /[\s#!]/u.test(char) ? char : `\\${char}`;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (/\s/u.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += char;
  }
  if (escaped) current += '\\';
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function normalizePattern(value) {
  return unescapePattern(value.trim());
}

function unescapePattern(value) {
  return value.replace(/\\([#! ])/g, '$1');
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function inferStructuredProfiles(file, text) {
  const normalizedPath = file.replace(/\\/g, '/').toLowerCase();
  const profiles = [];
  if (
    /(^|\/)changelog\.md$/.test(normalizedPath) &&
    /^#\s+changelog\s*$/im.test(text) &&
    /^##\s+\[?unreleased\]?/im.test(text) &&
    /^###\s+(added|changed|deprecated|removed|fixed|security)\s*$/im.test(text)
  ) {
    profiles.push('keep-a-changelog');
  }
  if (
    /(^|\/)(adr|adrs|decisions)\//.test(normalizedPath) &&
    /^#\s+.+/m.test(text) &&
    /^##\s+Context\s*$/im.test(text) &&
    /^##\s+Decision\s*$/im.test(text) &&
    /^##\s+Consequences\s*$/im.test(text)
  ) {
    profiles.push('madr');
  }
  return profiles;
}

function structuredProfileHoverFallback(file, locator) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return null;
  }
  const profiles = inferStructuredProfiles(file, text);
  if (profiles.length === 0) return null;
  const line = text.split(/\r?\n/)[locator.line] ?? '';
  const heading = /^#{2,3}\s+(.+?)\s*$/.exec(line);
  if (heading === null || locator.character > line.length) return null;
  const headingText = heading[1];
  const level = line.startsWith('###') ? 3 : 2;
  let value = null;
  if (profiles.includes('keep-a-changelog') && isKeepAChangelogHeading(level, headingText)) {
    value =
      level === 2
        ? 'Keep a Changelog release section. Use [Unreleased] or [VERSION] - YYYY-MM-DD.'
        : 'Keep a Changelog change category. Standard categories include Added, Changed, Deprecated, Removed, Fixed, and Security.';
  }
  if (profiles.includes('madr') && isMadrHeading(level, headingText)) {
    value = level === 2 ? 'MADR decision-record section.' : 'MADR option or validation subsection.';
  }
  return value === null ? null : { contents: { kind: 'markdown', value } };
}

function isKeepAChangelogHeading(level, text) {
  return (
    (level === 2 && /^\[?unreleased\]?|^\[?\d+\.\d+\.\d+\]?/.test(text.toLowerCase())) ||
    (level === 3 && /^(added|changed|deprecated|removed|fixed|security)$/i.test(text))
  );
}

function isMadrHeading(level, text) {
  return level === 2 && /^(Context|Decision|Consequences|Status|Considered Options)$/i.test(text);
}

function mergeUnique(values) {
  return [...new Set(values)];
}

function relativePath(root, file) {
  return path.relative(root, file).replace(/\\/g, '/') || path.basename(file);
}

export { collectMarkdownFiles, configSelectorMatches, findConfigEvidence, parseArgs };

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
    .then((result) => {
      if (result !== undefined) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      }
    })
    .catch((error) => {
      process.stdout.write(`${JSON.stringify(errorEnvelope(error), null, 2)}\n`);
      process.exitCode = 1;
    });
}
