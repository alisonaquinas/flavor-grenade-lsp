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

export type StartupTrigger =
    | { kind: 'activation' }
    | { kind: 'command'; commandId: string };

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
] as const;

export type StatFile = typeof stat;

export async function hasVaultMarkerAncestor(
    filePath: string,
    statFile: StatFile = stat,
): Promise<boolean> {
    const root = parse(filePath).root;
    let dir = dirname(filePath);

    while (dir && dir !== root) {
        if (await pathExists(join(dir, '.obsidian'), statFile)) {
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
    return pathExists(join(folder.uri.fsPath, '.obsidian'), statFile);
}

export async function decideStartupGate(options: {
    openDocuments: readonly DocumentLike[];
    statFile?: StatFile;
    trigger?: StartupTrigger;
    workspaceFolders?: readonly WorkspaceFolderLike[];
}): Promise<StartupGateDecision> {
    if (options.trigger?.kind === 'command') {
        return {
            checkedVaultGate: false,
            reason: 'command',
            startClient: true,
        };
    }

    if (options.openDocuments.some((document) => document.languageId === 'markdown' || document.languageId === 'ofmarkdown')) {
        return {
            checkedVaultGate: false,
            reason: 'language',
            startClient: true,
        };
    }

    return {
        checkedVaultGate: false,
        reason: 'idle',
        startClient: false,
    };
}

async function pathExists(path: string, statFile: StatFile): Promise<boolean> {
    try {
        await statFile(path);
        return true;
    } catch {
        return false;
    }
}
