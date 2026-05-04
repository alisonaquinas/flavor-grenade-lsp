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

export async function hasObsidianAncestor(filePath: string, statFn: StatFn = stat): Promise<boolean> {
    let current = dirname(filePath);

    while (true) {
        try {
            const marker = await statFn(join(current, '.obsidian'));
            if (marker.isDirectory()) {
                return true;
            }
        } catch {
            // Continue walking toward the filesystem root.
        }

        const parent = dirname(current);
        if (parent === current) {
            return false;
        }
        current = parent;
    }
}

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
        if (!isPromotableMarkdownDocument(document)) {
            return false;
        }

        const uri = document.uri.toString();
        if (this.inFlight.has(uri)) {
            return false;
        }

        this.inFlight.add(uri);
        try {
            const isOfMarkdown = await this.isOfMarkdown(document);
            if (!isOfMarkdown) {
                return false;
            }

            const current = this.findCurrentDocument(uri) ?? document;
            if (!isPromotableMarkdownDocument(current)) {
                return false;
            }
            await this.api.setTextDocumentLanguage(current, OFMARKDOWN_LANGUAGE_ID);
            return true;
        } finally {
            this.inFlight.delete(uri);
        }
    }

    private async isOfMarkdown(document: TextDocument): Promise<boolean> {
        if (document.uri.fsPath && await hasObsidianAncestor(document.uri.fsPath)) {
            return true;
        }

        try {
            const result = await this.client.sendRequest<DocumentMembershipResult>(
                DOCUMENT_MEMBERSHIP_METHOD,
                { uri: document.uri.toString() },
            );
            return result.isOfMarkdown;
        } catch {
            return false;
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
