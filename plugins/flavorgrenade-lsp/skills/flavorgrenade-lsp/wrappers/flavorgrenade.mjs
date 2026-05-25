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
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { LspClient } from './lsp-client.mjs';
import { assertInside, resolveRuntime, verifySigstoreIfAvailable } from './runtime.mjs';
import { errorEnvelope, successEnvelope } from './schema.mjs';

const CONFIG_FILES = [
  ['.flavor-grenade.toml', 'toml'],
  ['.flavor-grenade.json', 'json'],
  ['.flavor-grenade.jsonc', 'jsonc'],
  ['.flavor-grenade.yaml', 'yaml'],
  ['.flavor-grenade.yml', 'yaml'],
  ['.editorconfig', 'editorconfig'],
];

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
    workspaceEvidence.config.source !== 'none' || workspaceEvidence.hasObsidianDirectory
      ? pathToFileURL(workspaceRoot).toString()
      : null;

  const result = await withClient(runtime, { ...options, cwd: workspaceRoot }, rootUri, async (client) => {
    const files = collectMarkdownFiles(absolutePath, options);
    const filesToOpen =
      command === 'hover' && rootUri !== null
        ? mergeUnique([...files, ...collectMarkdownFiles(workspaceRoot, options)])
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
        step: 'project-config',
        matched: decision.config.source !== 'none',
        reason: decision.config.source === 'none'
          ? 'No supported Flavor Grenade project config found.'
          : `Using ${decision.config.format} project config evidence.`,
      },
      {
        step: 'lsp-effective-context',
        matched: true,
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
  const query = await client.request('flavorGrenade/queryOpenDoc', { uri });
  const text = await readFile(file, 'utf8');
  const config = findConfigEvidence(workspaceRoot, file);
  const workspaceEvidence = findWorkspaceEvidence(workspaceRoot);
  const rawBaseFlavor = query?.markdownFlavor ?? 'commonmark';
  const baseFlavor =
    rawBaseFlavor === 'obsidian' &&
    config.source === 'none' &&
    !workspaceEvidence.hasObsidianDirectory
      ? 'commonmark'
      : rawBaseFlavor;
  const variantsValue = query?.structuredProfiles;
  const variants = mergeUnique([
    ...(Array.isArray(variantsValue) ? variantsValue : []),
    ...inferStructuredProfiles(file, text),
  ]);
  return {
    path: relativePath(workspaceRoot, file),
    baseFlavor,
    variants,
    confidence: config.source === 'none' ? 'medium' : 'high',
    source: config.source === 'none' ? 'lsp-inference' : config.source,
    evidence: [
      {
        kind:
          rawBaseFlavor !== baseFlavor
            ? 'workspace-boundary'
            : config.source === 'none'
              ? 'lsp-effective-context'
              : 'project-config',
        value: config.format,
        weight: config.source === 'none' ? 'medium' : 'strong',
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
  return stat.isDirectory() ? resolved : path.dirname(resolved);
}

function collectMarkdownFiles(target, options) {
  const stat = statSync(target);
  if (stat.isFile()) return [target];
  const files = [];
  const stack = [target];
  const maxFiles = Number(options.maxFiles ?? 500);
  while (stack.length > 0 && files.length < maxFiles) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(full);
      if (files.length >= maxFiles) break;
    }
  }
  return files;
}

function findConfigEvidence(workspaceRoot, file) {
  const evidence = findWorkspaceEvidence(workspaceRoot).config;
  if (evidence.source === 'none' || file === undefined) return evidence;
  return {
    ...evidence,
    matchedOverride: findMatchedOverrideEvidence(workspaceRoot, evidence, file),
  };
}

function findWorkspaceEvidence(workspaceRoot) {
  for (const [fileName, format] of CONFIG_FILES) {
    if (existsSync(path.join(workspaceRoot, fileName))) {
      return {
        config: {
          source: format === 'editorconfig' ? 'editorconfig' : 'project-config',
          format,
          path: fileName,
          matchedOverride: null,
        },
        hasObsidianDirectory: existsSync(path.join(workspaceRoot, '.obsidian')),
      };
    }
  }
  return {
    config: { source: 'none', format: 'none', path: null, matchedOverride: null },
    hasObsidianDirectory: existsSync(path.join(workspaceRoot, '.obsidian')),
  };
}

function findMatchedOverrideEvidence(workspaceRoot, evidence, file) {
  if (evidence.path === null) return null;
  const configPath = path.join(workspaceRoot, evidence.path);
  let overrides = [];
  try {
    const content = readFileSync(configPath, 'utf8');
    if (content.length > 8192) return null;
    overrides = parseOverridesForEvidence(evidence.format, content);
  } catch {
    return null;
  }
  const relative = relativePath(workspaceRoot, file);
  let best = null;
  overrides.forEach((override, index) => {
    if (!override.selector || !configSelectorMatches(override.selector, relative)) return;
    const specificity = normalizeConfigSelector(override.selector).length;
    if (
      best === null ||
      specificity > best.specificity ||
      (specificity === best.specificity && index > best.order)
    ) {
      best = { ...override, order: index, specificity };
    }
  });
  if (best === null) return null;
  const provided = [];
  if (best.flavor) provided.push('baseFlavor');
  if (best.structuredProfiles) provided.push('structuredProfiles');
  return {
    selector: best.selector,
    selectorKind: best.selector.includes('*') ? 'glob' : 'directory',
    order: best.order,
    provided,
    inherited: ['baseFlavor', 'structuredProfiles'].filter((key) => !provided.includes(key)),
  };
}

function parseOverridesForEvidence(format, content) {
  if (format === 'json' || format === 'jsonc') {
    try {
      const value = JSON.parse(stripJsonComments(content));
      const overrides = value?.core?.markdown?.overrides;
      return Array.isArray(overrides)
        ? overrides.map((entry) => ({
            selector: stringValue(entry?.path),
            flavor: stringValue(entry?.flavor),
            structuredProfiles: entry?.structured_profiles ?? entry?.structuredProfiles,
          }))
        : [];
    } catch {
      return [];
    }
  }
  if (format === 'toml') {
    return parseTomlOverridesForEvidence(content);
  }
  if (format === 'yaml') {
    return parseYamlOverridesForEvidence(content);
  }
  if (format === 'editorconfig') {
    return parseEditorConfigOverridesForEvidence(content);
  }
  return [];
}

function parseTomlOverridesForEvidence(content) {
  const overrides = [];
  let current = null;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (line === '[[core.markdown.overrides]]') {
      current = {};
      overrides.push(current);
      continue;
    }
    if (current === null) continue;
    const match = /^([A-Za-z0-9_.-]+)\s*=\s*"([^"]*)"/.exec(line);
    if (!match) continue;
    if (match[1] === 'path') current.selector = match[2];
    if (match[1] === 'flavor') current.flavor = match[2];
    if (match[1] === 'structured_profiles') current.structuredProfiles = match[2];
  }
  return overrides;
}

function parseYamlOverridesForEvidence(content) {
  const overrides = [];
  let inOverrides = false;
  let current = null;
  let pendingArrayKey = null;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '');
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    if (/^overrides:\s*$/.test(trimmed)) {
      inOverrides = true;
      continue;
    }
    if (!inOverrides) continue;
    const itemMatch = /^-\s*(.*)$/.exec(trimmed);
    if (itemMatch) {
      if (current !== null && pendingArrayKey !== null && !itemMatch[1].includes(':')) {
        current[pendingArrayKey] = true;
        continue;
      }
      current = {};
      overrides.push(current);
      pendingArrayKey = assignYamlEvidence(current, itemMatch[1]);
      continue;
    }
    if (current !== null) pendingArrayKey = assignYamlEvidence(current, trimmed);
  }
  return overrides;
}

function assignYamlEvidence(target, value) {
  const match = /^([A-Za-z0-9_.-]+):\s*(?:"([^"]*)"|'([^']*)'|([^#]*?))\s*$/.exec(value);
  if (!match) return;
  const key = match[1];
  const raw = (match[2] ?? match[3] ?? match[4] ?? '').trim();
  if (key === 'path' || key === 'directory' || key === 'dir') target.selector = raw;
  if (key === 'flavor') target.flavor = raw;
  if (key === 'structured_profiles' || key === 'structuredProfiles') {
    target.structuredProfiles = raw || true;
    return 'structuredProfiles';
  }
  return null;
}

function parseEditorConfigOverridesForEvidence(content) {
  const overrides = [];
  let section = '';
  let current = {};
  const flush = () => {
    if (section.length === 0) {
      current = {};
      return;
    }
    const flavor = current.flavor_grenade_markdown_flavor ?? current['flavor_grenade.markdown_flavor'];
    const structuredProfiles =
      current.flavor_grenade_markdown_structured_profiles ??
      current['flavor_grenade.markdown_structured_profiles'];
    if (flavor !== undefined || structuredProfiles !== undefined) {
      overrides.push({ selector: section, flavor, structuredProfiles });
    }
    current = {};
  };
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/[;#].*$/, '').trim();
    if (line.length === 0) continue;
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line);
    if (sectionMatch) {
      flush();
      section = sectionMatch[1];
      continue;
    }
    const entryMatch = /^([^=:\s]+)\s*[=:]\s*(.*?)\s*$/.exec(line);
    if (entryMatch) current[entryMatch[1].toLowerCase()] = entryMatch[2];
  }
  flush();
  return overrides;
}

function stripJsonComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function stringValue(value) {
  return typeof value === 'string' ? value : undefined;
}

function configSelectorMatches(selector, relative) {
  const normalizedSelector = normalizeConfigSelector(selector);
  const normalizedPath = normalizeConfigSelector(relative);
  if (normalizedSelector.includes('*')) {
    return globSelectorMatches(normalizedSelector, normalizedPath);
  }
  return (
    normalizedPath === normalizedSelector ||
    normalizedPath.startsWith(`${normalizedSelector.replace(/\/$/, '')}/`)
  );
}

function normalizeConfigSelector(value) {
  return value.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^\.\//, '');
}

function globSelectorMatches(selector, relative) {
  const selectorParts = selector.split('/').filter(Boolean);
  const relativeParts = relative.split('/').filter(Boolean);
  return globPartsMatch(selectorParts, relativeParts, 0, 0, new Map());
}

function globPartsMatch(selectorParts, relativeParts, selectorIndex, relativeIndex, memo) {
  const memoKey = `${selectorIndex}:${relativeIndex}`;
  const cached = memo.get(memoKey);
  if (cached !== undefined) return cached;
  const matched = globPartsMatchUncached(
    selectorParts,
    relativeParts,
    selectorIndex,
    relativeIndex,
    memo,
  );
  memo.set(memoKey, matched);
  return matched;
}

function globPartsMatchUncached(selectorParts, relativeParts, selectorIndex, relativeIndex, memo) {
  if (selectorIndex === selectorParts.length) return relativeIndex === relativeParts.length;
  const selectorHead = selectorParts[selectorIndex];
  if (selectorHead === '**') {
    return (
      globPartsMatch(selectorParts, relativeParts, selectorIndex + 1, relativeIndex, memo) ||
      (relativeIndex < relativeParts.length &&
        globPartsMatch(selectorParts, relativeParts, selectorIndex, relativeIndex + 1, memo))
    );
  }
  if (relativeIndex === relativeParts.length) return false;
  if (!globSegmentMatches(selectorHead, relativeParts[relativeIndex])) return false;
  return globPartsMatch(selectorParts, relativeParts, selectorIndex + 1, relativeIndex + 1, memo);
}

function globSegmentMatches(pattern, value) {
  let patternIndex = 0;
  let valueIndex = 0;
  let starIndex = -1;
  let retryValueIndex = 0;

  while (valueIndex < value.length) {
    if (patternIndex < pattern.length && pattern[patternIndex] === value[valueIndex]) {
      patternIndex += 1;
      valueIndex += 1;
      continue;
    }
    if (patternIndex < pattern.length && pattern[patternIndex] === '*') {
      starIndex = patternIndex;
      retryValueIndex = valueIndex;
      patternIndex += 1;
      continue;
    }
    if (starIndex !== -1) {
      patternIndex = starIndex + 1;
      retryValueIndex += 1;
      valueIndex = retryValueIndex;
      continue;
    }
    return false;
  }

  while (patternIndex < pattern.length && pattern[patternIndex] === '*') patternIndex += 1;
  return patternIndex === pattern.length;
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
