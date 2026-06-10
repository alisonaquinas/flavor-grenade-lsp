import { stat } from 'node:fs/promises';
import type { Disposable, TextDocument, TextEditor } from 'vscode';
import {
    buildMarkdownFlavorConfigurationNotification,
    resolveMarkdownFlavor,
    type MarkdownFlavorResolution,
} from './markdown-flavor.js';
import { findMarkdownFlavorEvidence } from './markdown-flavor-evidence.js';

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
    sendNotification?(method: string, params?: unknown): Thenable<void> | void;
}

interface LanguageModeApi {
    getOpenDocuments(): readonly TextDocument[];
    getVisibleEditors(): readonly TextEditor[];
    setTextDocumentLanguage(document: TextDocument, languageId: string): Thenable<TextDocument>;
    getMdfConfigMaxBytes?(document: TextDocument): unknown;
    getWorkspaceFolderPath?(document: TextDocument): string | undefined;
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
    const evidence = await findMarkdownFlavorEvidence(filePath, { statFn });
    return evidence.hasObsidianMarker || evidence.hasFlavorConfigMarker;
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
            await this.applyMembershipFlavor(current);
            return false;
        } finally {
            this.inFlight.delete(uri);
        }
    }

    private async applyMembershipFlavor(document: TextDocument): Promise<void> {
        const resolution = await this.resolveMarkdownFlavorForDocument(document);
        this.notifyFlavor(document, resolution);
    }

    async resolveMarkdownFlavorForDocument(document: TextDocument): Promise<MarkdownFlavorResolution> {
        if (!isManagedFileDocument(document)) {
            return resolveMarkdownFlavor({ document, selected: 'auto' });
        }

        const evidence = document.uri.fsPath
            ? await findMarkdownFlavorEvidence(document.uri.fsPath, {
                  searchBoundary: this.api.getWorkspaceFolderPath?.(document),
                  mdfConfigMaxBytes: this.api.getMdfConfigMaxBytes?.(document),
              })
            : undefined;
        if (evidence?.hasObsidianMarker || evidence?.hasFlavorConfigMarker) {
            return resolveMarkdownFlavor({
                document,
                hasObsidianMarker: evidence.hasObsidianMarker,
                ignored: evidence.ignored,
                mdfAttributesFlavor: evidence.mdfAttributesFlavor,
                mdfAttributesStructuredProfiles: evidence.mdfAttributesStructuredProfiles,
                selected: 'auto',
                structuredProfileSelection: 'auto',
                syntaxText: document.getText?.(),
            });
        }

        const serverMembership = await this.getServerOfMarkdownMembership(document);
        return resolveMarkdownFlavor({
            document,
            hasObsidianMarker: serverMembership?.reason === 'obsidian-vault',
            selected: 'auto',
            structuredProfileSelection: 'auto',
            syntaxText: document.getText?.(),
        });
    }

    private async getServerOfMarkdownMembership(
        document: TextDocument,
    ): Promise<DocumentMembershipResult | undefined> {
        try {
            const result = await this.client.sendRequest<DocumentMembershipResult>(
                DOCUMENT_MEMBERSHIP_METHOD,
                { uri: document.uri.toString() },
            );
            return result;
        } catch {
            return undefined;
        }
    }

    private findCurrentDocument(uri: string): TextDocument | undefined {
        return this.api.getOpenDocuments().find((document) => document.uri.toString() === uri);
    }

    private notifyFlavor(document: TextDocument, resolution: MarkdownFlavorResolution): void {
        if (!this.client.sendNotification) {
            return;
        }

        const notification = buildMarkdownFlavorConfigurationNotification({
            states: [{ document, resolution }],
        });
        if (!notification) {
            return;
        }
        void this.client.sendNotification(notification.method, notification.params);
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
    return document.uri.scheme === 'file' && document.languageId === MARKDOWN_LANGUAGE_ID;
}
