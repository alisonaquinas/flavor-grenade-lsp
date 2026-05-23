import { stat } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';

export interface DocumentLike {
  languageId: string;
  uri: {
    fsPath: string;
    scheme: string;
  };
}

export interface WorkspaceFolderLike {
  uri: {
    fsPath: string;
  };
}

export type StartupTrigger = { kind: 'activation' } | { kind: 'command'; commandId: string };

export interface StartupGateDecision {
  checkedVaultGate: boolean;
  reason: 'command' | 'idle' | 'language' | 'vault-marker';
  startClient: boolean;
}

export const VAULT_MARKER_ACTIVATION_EVENTS = [
  'workspaceContains:.obsidian',
  'workspaceContains:.flavor-grenade.toml',
] as const;

export const COMMAND_ACTIVATION_EVENTS = [
  'onCommand:flavorGrenade.restartServer',
  'onCommand:flavorGrenade.rebuildIndex',
  'onCommand:flavorGrenade.showOutput',
  'onCommand:flavorGrenade.showStatusActions',
  'onCommand:flavorGrenade.openTroubleshooting',
  'onCommand:flavorGrenade.showReferences',
  'onCommand:flavorGrenade.followLink',
  'onCommand:flavorGrenade.openEmbedTarget',
  'onCommand:flavorGrenade.showBacklinks',
  'onCommand:flavorGrenade.showOutlinks',
  'onCommand:flavorGrenade.revealVaultRoot',
  'onCommand:flavorGrenade.copyDiagnosticInfo',
  'onCommand:flavorGrenade.selectMarkdownFlavor',
] as const;

export type StatFile = typeof stat;

export async function hasVaultMarkerAncestor(
  filePath: string,
  statFile: StatFile = stat,
): Promise<boolean> {
  const root = parse(filePath).root;
  let dir = dirname(filePath);

  while (dir && dir !== root) {
    if (await hasVaultMarker(dir, statFile)) {
      return true;
    }

    dir = dirname(dir);
  }

  return false;
}

export async function workspaceFolderHasVaultMarker(
  folder: WorkspaceFolderLike,
  statFile: StatFile = stat,
): Promise<boolean> {
  return hasVaultMarker(folder.uri.fsPath, statFile);
}

export async function decideStartupGate(options: {
  openDocuments: readonly DocumentLike[];
  statFile?: StatFile;
  trigger?: StartupTrigger;
  workspaceFolders?: readonly WorkspaceFolderLike[];
}): Promise<StartupGateDecision> {
  if (options.trigger?.kind === 'command') {
    return {
      checkedVaultGate: true,
      reason: 'command',
      startClient: true,
    };
  }

  const statFile = options.statFile ?? stat;
  for (const folder of options.workspaceFolders ?? []) {
    if (await workspaceFolderHasVaultMarker(folder, statFile)) {
      return {
        checkedVaultGate: true,
        reason: 'vault-marker',
        startClient: true,
      };
    }
  }

  for (const document of options.openDocuments) {
    if (
      document.uri.scheme === 'file' &&
      (await hasVaultMarkerAncestor(document.uri.fsPath, statFile))
    ) {
      return {
        checkedVaultGate: true,
        reason: 'vault-marker',
        startClient: true,
      };
    }
  }

  if (options.openDocuments.some((document) => document.languageId === 'ofmarkdown')) {
    return {
      checkedVaultGate: true,
      reason: 'language',
      startClient: true,
    };
  }

  return {
    checkedVaultGate: true,
    reason: 'idle',
    startClient: false,
  };
}

async function hasVaultMarker(dir: string, statFile: StatFile): Promise<boolean> {
  return (
    (await pathExists(join(dir, '.obsidian'), statFile, 'directory')) ||
    (await pathExists(join(dir, '.flavor-grenade.toml'), statFile, 'file'))
  );
}

async function pathExists(
  path: string,
  statFile: StatFile,
  expectedKind: 'directory' | 'file',
): Promise<boolean> {
  try {
    const result = await statFile(path);
    return expectedKind === 'directory' ? result.isDirectory() : result.isFile();
  } catch {
    return false;
  }
}
