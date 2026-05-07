import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, it, afterEach } from 'node:test';
import {
    DOCUMENT_MEMBERSHIP_METHOD,
    LanguageModeController,
    OFMARKDOWN_LANGUAGE_ID,
    hasOfMarkdownMarkerAncestor,
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
    it('contributes OFMarkdown without taking over generic Markdown files', async () => {
        const manifest = JSON.parse(await readFile(resolve('package.json'), 'utf8')) as {
            activationEvents?: string[];
            contributes?: {
                languages?: Array<{
                    id?: string;
                    aliases?: string[];
                    extensions?: string[];
                    filenames?: string[];
                    firstLine?: string;
                    configuration?: string;
                }>;
                grammars?: Array<{ language?: string; scopeName?: string; path?: string }>;
            };
        };

        const language = manifest.contributes?.languages?.find(
            (entry) => entry.id === OFMARKDOWN_LANGUAGE_ID,
        );
        assert.ok(language);
        assert.deepEqual(language.aliases, ['OFMarkdown', 'Obsidian Flavored Markdown']);
        assert.equal(language.configuration, './language-configuration.json');
        assert.equal(language.extensions, undefined);
        assert.equal(language.filenames, undefined);
        assert.equal(language.firstLine, undefined);
        assert.ok(manifest.activationEvents?.includes(`onLanguage:${OFMARKDOWN_LANGUAGE_ID}`));

        assert.deepEqual(manifest.contributes?.grammars?.[0], {
            language: OFMARKDOWN_LANGUAGE_ID,
            scopeName: 'text.html.markdown.ofmarkdown',
            path: './syntaxes/ofmarkdown.tmLanguage.json',
        });
    });

    it('bridges OFMarkdown to baseline Markdown grammar and editor behavior', async () => {
        const grammar = JSON.parse(
            await readFile(resolve('syntaxes', 'ofmarkdown.tmLanguage.json'), 'utf8'),
        ) as { scopeName?: string; patterns?: Array<{ include?: string }> };
        const languageConfig = JSON.parse(await readFile(resolve('language-configuration.json'), 'utf8')) as {
            comments?: { blockComment?: string[] };
            brackets?: string[][];
            autoClosingPairs?: Array<{ open?: string; close?: string }>;
        };

        assert.equal(grammar.scopeName, 'text.html.markdown.ofmarkdown');
        assert.deepEqual(grammar.patterns, [{ include: 'text.html.markdown' }]);
        assert.deepEqual(languageConfig.comments?.blockComment, ['<!--', '-->']);
        assert.ok(languageConfig.brackets?.some(([open, close]) => open === '[' && close === ']'));
        assert.ok(
            languageConfig.autoClosingPairs?.some(({ open, close }) => open === '`' && close === '`'),
        );
    });

    it('recognizes promotable Markdown file documents', () => {
        const doc = document(join('vault', 'note.md'));

        assert.equal(isPromotableMarkdownDocument(doc as never), true);
    });

    it('preserves manual non-Markdown language selections', () => {
        const doc = document(join('vault', 'note.md'), 'plaintext');

        assert.equal(shouldPreserveLanguage(doc as never), true);
    });

    it('detects OFMarkdown marker ancestors', async () => {
        const root = await mkdtemp(join(tmpdir(), 'fg-ofmarkdown-'));
        tempDirs.push(root);
        await mkdir(join(root, '.obsidian'));
        const note = join(root, 'notes', 'welcome.md');

        assert.equal(await hasOfMarkdownMarkerAncestor(note), true);
    });

    it('detects a .flavor-grenade.toml ancestor', async () => {
        const root = await mkdtemp(join(tmpdir(), 'fg-ofmarkdown-'));
        tempDirs.push(root);
        await mkdir(join(root, 'notes'));
        await writeFile(join(root, '.flavor-grenade.toml'), '');
        const note = join(root, 'notes', 'welcome.md');

        assert.equal(await hasOfMarkdownMarkerAncestor(note), true);
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

    it('does not ask the server when an OFMarkdown marker ancestor is present', async () => {
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
