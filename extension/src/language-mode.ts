import { dirname, join } from 'node:path';
import { stat } from 'node:fs/promises';
import type { Disposable, TextDocument, TextEditor } from 'vscode';

export const MARKDOWN_LANGUAGE_ID = 'markdown';
export const OFMARKDOWN_LANGUAGE_ID = 'ofmarkdown';
export const DOCUMENT_MEMBERSHIP_METHOD = 'flavorGrenade/documentMembership';

export type DocumentMembershipReason =
    | 'obsidian-vault'
    | 'flavor-config-vault'
    | 'single-file'
    | 'not-indexed';

export interface DocumentMembershipResult {
    isOfMarkdown: boolean;
    indexed: boolean;
    vaultRoot?: string;
    reason: DocumentMembershipReason;
}

interface LanguageClientLike {
    sendRequest<T>(method: string, params: unknown): Thenable<T>;
}

interface LanguageModeApi {
    getOpenDocuments(): readonly TextDocument[];
    getVisibleEditors(): readonly TextEditor[];
    setTextDocumentLanguage(document: TextDocument, languageId: string): Thenable<TextDocument>;
    onDidOpenTextDocument(listener: (document: TextDocument) => void): Disposable;
    onDidChangeVisibleTextEditors(listener: (editors: readonly TextEditor[]) => void): Disposable;
    onDidChangeWorkspaceFolders(listener: () => void): Disposable;
}

type StatFn = typeof stat;

export function isManagedLanguage(languageId: string): boolean {
    return languageId === MARKDOWN_LANGUAGE_ID || languageId === OFMARKDOWN_LANGUAGE_ID;
}

export function isPromotableMarkdownDocument(document: Pick<TextDocument, 'languageId' | 'uri'>): boolean {
    return document.uri.scheme === 'file' && document.languageId === MARKDOWN_LANGUAGE_ID;
}

export function shouldPreserveLanguage(document: Pick<TextDocument, 'languageId' | 'uri'>): boolean {
    return document.uri.scheme !== 'file' || !isManagedLanguage(document.languageId);
}

export async function hasOfMarkdownMarkerAncestor(
    filePath: string,
    statFn: StatFn = stat,
): Promise<boolean> {
    let current = dirname(filePath);

    while (true) {
        if (
            await markerExists(join(current, '.obsidian'), 'directory', statFn) ||
            await markerExists(join(current, '.flavor-grenade.toml'), 'file', statFn)
        ) {
            return true;
        }

        const parent = dirname(current);
        if (parent === current) {
            return false;
        }
        current = parent;
    }
}

export const hasObsidianAncestor = hasOfMarkdownMarkerAncestor;

export class LanguageModeController {
    private readonly inFlight = new Set<string>();

    constructor(
        private readonly client: LanguageClientLike,
        private readonly api: LanguageModeApi,
    ) {}

    start(): Disposable[] {
        return [
            this.api.onDidOpenTextDocument((document) => {
                void this.tryPromote(document);
            }),
            this.api.onDidChangeVisibleTextEditors(() => {
                void this.refreshAll();
            }),
            this.api.onDidChangeWorkspaceFolders(() => {
                void this.refreshAll();
            }),
        ];
    }

    async refreshAll(): Promise<void> {
        const documents = new Map<string, TextDocument>();
        for (const document of this.api.getOpenDocuments()) {
            documents.set(document.uri.toString(), document);
        }
        for (const editor of this.api.getVisibleEditors()) {
            documents.set(editor.document.uri.toString(), editor.document);
        }

        await Promise.all([...documents.values()].map((document) => this.tryPromote(document)));
    }

    async maybePromote(document: TextDocument): Promise<boolean> {
        if (!isManagedFileDocument(document)) {
            return false;
        }

        const uri = document.uri.toString();
        if (this.inFlight.has(uri)) {
            return false;
        }

        this.inFlight.add(uri);
        try {
            const current = this.findCurrentDocument(uri) ?? document;
            if (!isManagedFileDocument(current)) {
                return false;
            }
            return await this.applyMembershipLanguage(current);
        } finally {
            this.inFlight.delete(uri);
        }
    }

    private async applyMembershipLanguage(document: TextDocument): Promise<boolean> {
        const hasMarker = document.uri.fsPath
            ? await hasOfMarkdownMarkerAncestor(document.uri.fsPath)
            : false;

        if (hasMarker) {
            if (document.languageId === MARKDOWN_LANGUAGE_ID) {
                await this.api.setTextDocumentLanguage(document, OFMARKDOWN_LANGUAGE_ID);
                return true;
            }
            return false;
        }

        const serverMembership = await this.getServerOfMarkdownMembership(document);
        if (serverMembership === true && document.languageId === MARKDOWN_LANGUAGE_ID) {
            await this.api.setTextDocumentLanguage(document, OFMARKDOWN_LANGUAGE_ID);
            return true;
        }

        if (serverMembership === false && document.languageId === OFMARKDOWN_LANGUAGE_ID) {
            await this.api.setTextDocumentLanguage(document, MARKDOWN_LANGUAGE_ID);
            return true;
        }

        return false;
    }

    private async getServerOfMarkdownMembership(document: TextDocument): Promise<boolean | undefined> {
        try {
            const result = await this.client.sendRequest<DocumentMembershipResult>(
                DOCUMENT_MEMBERSHIP_METHOD,
                { uri: document.uri.toString() },
            );
            return result.isOfMarkdown;
        } catch {
            return undefined;
        }
    }

    private findCurrentDocument(uri: string): TextDocument | undefined {
        return this.api.getOpenDocuments().find((document) => document.uri.toString() === uri);
    }

    private async tryPromote(document: TextDocument): Promise<boolean> {
        try {
            return await this.maybePromote(document);
        } catch {
            return false;
        }
    }
}

function isManagedFileDocument(document: Pick<TextDocument, 'languageId' | 'uri'>): boolean {
    return document.uri.scheme === 'file' && isManagedLanguage(document.languageId);
}

async function markerExists(
    markerPath: string,
    expectedKind: 'directory' | 'file',
    statFn: StatFn,
): Promise<boolean> {
    try {
        const marker = await statFn(markerPath);
        return expectedKind === 'directory' ? marker.isDirectory() : marker.isFile();
    } catch {
        return false;
    }
}
