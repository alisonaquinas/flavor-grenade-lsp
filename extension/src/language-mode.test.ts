import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, afterEach } from 'node:test';
import {
    DOCUMENT_MEMBERSHIP_METHOD,
    LanguageModeController,
    OFMARKDOWN_LANGUAGE_ID,
    hasObsidianAncestor,
    isPromotableMarkdownDocument,
    shouldPreserveLanguage,
} from './language-mode.js';

interface FakeDocument {
    uri: {
        scheme: string;
        fsPath: string;
        toString(): string;
    };
    languageId: string;
}

const tempDirs: string[] = [];

afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function document(fsPath: string, languageId = 'markdown'): FakeDocument {
    const uriString = `file:///${fsPath.replaceAll('\\', '/')}`;
    return {
        uri: {
            scheme: 'file',
            fsPath,
            toString: () => uriString,
        },
        languageId,
    };
}

function controllerFor(options: {
    documents: FakeDocument[];
    membership?: boolean;
    setLanguage?: (document: FakeDocument, languageId: string) => Promise<FakeDocument>;
}): { controller: LanguageModeController; requests: unknown[]; promoted: string[] } {
    const requests: unknown[] = [];
    const promoted: string[] = [];

    const controller = new LanguageModeController(
        {
            sendRequest: (method, params) => {
                requests.push({ method, params });
                return Promise.resolve({
                    isOfMarkdown: options.membership ?? false,
                    indexed: options.membership ?? false,
                    reason: options.membership ? 'flavor-config-vault' : 'not-indexed',
                }) as never;
            },
        },
        {
            getOpenDocuments: () => options.documents as never,
            getVisibleEditors: () => [],
            setTextDocumentLanguage: async (doc, languageId) => {
                if (options.setLanguage) {
                    const result = await options.setLanguage(doc as unknown as FakeDocument, languageId);
                    promoted.push(languageId);
                    return result as never;
                }
                promoted.push(languageId);
                return { ...doc, languageId } as never;
            },
            onDidOpenTextDocument: () => ({ dispose: () => undefined }),
            onDidChangeVisibleTextEditors: () => ({ dispose: () => undefined }),
            onDidChangeWorkspaceFolders: () => ({ dispose: () => undefined }),
        },
    );

    return { controller, requests, promoted };
}

describe('language mode helpers', () => {
    it('recognizes promotable Markdown file documents', () => {
        const doc = document(join('vault', 'note.md'));

        assert.equal(isPromotableMarkdownDocument(doc as never), true);
    });

    it('preserves manual non-Markdown language selections', () => {
        const doc = document(join('vault', 'note.md'), 'plaintext');

        assert.equal(shouldPreserveLanguage(doc as never), true);
    });

    it('detects an .obsidian ancestor', async () => {
        const root = await mkdtemp(join(tmpdir(), 'fg-ofmarkdown-'));
        tempDirs.push(root);
        await mkdir(join(root, '.obsidian'));
        const note = join(root, 'notes', 'welcome.md');

        assert.equal(await hasObsidianAncestor(note), true);
    });
});

describe('LanguageModeController', () => {
    it('promotes Markdown when server membership is positive', async () => {
        const doc = document(join('vault', 'note.md'));
        const { controller, requests, promoted } = controllerFor({
            documents: [doc],
            membership: true,
        });

        assert.equal(await controller.maybePromote(doc as never), true);
        assert.deepEqual(promoted, [OFMARKDOWN_LANGUAGE_ID]);
        assert.equal((requests[0] as { method: string }).method, DOCUMENT_MEMBERSHIP_METHOD);
    });

    it('keeps generic Markdown when server membership is negative', async () => {
        const doc = document(join('notes', 'readme.md'));
        const { controller, promoted } = controllerFor({
            documents: [doc],
            membership: false,
        });

        assert.equal(await controller.maybePromote(doc as never), false);
        assert.deepEqual(promoted, []);
    });

    it('does not ask the server when an Obsidian ancestor is present', async () => {
        const root = await mkdtemp(join(tmpdir(), 'fg-ofmarkdown-'));
        tempDirs.push(root);
        await mkdir(join(root, '.obsidian'));
        const doc = document(join(root, 'note.md'));
        const { controller, requests, promoted } = controllerFor({ documents: [doc] });

        assert.equal(await controller.maybePromote(doc as never), true);
        assert.deepEqual(promoted, [OFMARKDOWN_LANGUAGE_ID]);
        assert.deepEqual(requests, []);
    });

    it('ignores documents already in manual non-Markdown modes', async () => {
        const doc = document(join('vault', 'note.md'), 'plaintext');
        const { controller, requests, promoted } = controllerFor({
            documents: [doc],
            membership: true,
        });

        assert.equal(await controller.maybePromote(doc as never), false);
        assert.deepEqual(promoted, []);
        assert.deepEqual(requests, []);
    });

    it('suppresses duplicate promotion while an assignment is in flight', async () => {
        const doc = document(join('vault', 'note.md'));
        let finish!: () => void;
        const assignment = new Promise<void>((resolve) => {
            finish = resolve;
        });
        const { controller, promoted } = controllerFor({
            documents: [doc],
            membership: true,
            setLanguage: async (current) => {
                await assignment;
                return { ...current, languageId: OFMARKDOWN_LANGUAGE_ID };
            },
        });

        const first = controller.maybePromote(doc as never);
        const second = controller.maybePromote(doc as never);
        finish();

        assert.equal(await first, true);
        assert.equal(await second, false);
        assert.deepEqual(promoted, [OFMARKDOWN_LANGUAGE_ID]);
    });

    it('refreshAll continues when one language assignment rejects', async () => {
        const failing = document(join('vault', 'bad.md'));
        const succeeding = document(join('vault', 'good.md'));
        const { controller, promoted } = controllerFor({
            documents: [failing, succeeding],
            membership: true,
            setLanguage: async (current) => {
                if (current === failing) {
                    throw new Error('document closed');
                }
                return { ...current, languageId: OFMARKDOWN_LANGUAGE_ID };
            },
        });

        await assert.doesNotReject(() => controller.refreshAll());
        assert.deepEqual(promoted, [OFMARKDOWN_LANGUAGE_ID]);
    });
});
