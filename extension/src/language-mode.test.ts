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
    memberships?: Record<string, boolean>;
    failMembership?: boolean;
    setLanguage?: (document: FakeDocument, languageId: string) => Promise<FakeDocument>;
}): {
    controller: LanguageModeController;
    notifications: unknown[];
    promoted: string[];
    requests: unknown[];
} {
    const requests: unknown[] = [];
    const notifications: unknown[] = [];
    const promoted: string[] = [];

    const controller = new LanguageModeController(
        {
            sendRequest: (method, params) => {
                requests.push({ method, params });
                if (options.failMembership) {
                    return Promise.reject(new Error('membership unavailable')) as never;
                }
                const uri = (params as { uri?: string }).uri ?? '';
                const membership = options.memberships?.[uri] ?? options.membership ?? false;
                return Promise.resolve({
                    isOfMarkdown: membership,
                    indexed: membership,
                    reason: membership ? 'flavor-config-vault' : 'not-indexed',
                }) as never;
            },
            sendNotification: (method, params) => {
                notifications.push({ method, params });
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

    return { controller, requests, promoted, notifications };
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

    it('detects a Flavor Grenade project config ancestor', async () => {
        const root = await mkdtemp(join(tmpdir(), 'fg-ofmarkdown-'));
        tempDirs.push(root);
        await mkdir(join(root, 'notes'));
        await writeFile(join(root, '.flavor-grenade.jsonc'), '// marker\n{}\n');
        const note = join(root, 'notes', 'welcome.md');

        assert.equal(await hasOfMarkdownMarkerAncestor(note), true);
    });

    it('uses project flavor config as local effective flavor evidence', async () => {
        const root = await mkdtemp(join(tmpdir(), 'fg-ofmarkdown-'));
        tempDirs.push(root);
        await mkdir(join(root, 'notes'));
        await writeFile(join(root, '.flavor-grenade.toml'), 'core.markdown.flavor = "gfm"\n');
        const doc = document(join(root, 'notes', 'welcome.md'));
        const { controller, notifications } = controllerFor({ documents: [doc] });

        await controller.maybePromote(doc as never);

        assert.deepEqual(notifications, [
            {
                method: 'workspace/didChangeConfiguration',
                params: {
                    settings: {
                        flavorGrenade: {
                            markdownFlavor: 'auto',
                            markdownStructuredProfiles: 'auto',
                            markdownFlavorResources: {
                                [doc.uri.toString()]: {
                                    selected: 'auto',
                                    effective: 'gfm',
                                    source: 'project-config',
                                    structuredProfiles: [],
                                    structuredProfileSource: 'structured-profile-inference',
                                },
                            },
                        },
                    },
                },
            },
        ]);
    });
});

describe('LanguageModeController', () => {
    it('preserves Markdown language id when server membership is positive', async () => {
        const doc = document(join('vault', 'note.md'));
        const { controller, requests, promoted } = controllerFor({
            documents: [doc],
            membership: true,
        });

        assert.equal(await controller.maybePromote(doc as never), false);
        assert.deepEqual(promoted, []);
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

    it('keeps Markdown language id when an OFMarkdown marker ancestor is present', async () => {
        const root = await mkdtemp(join(tmpdir(), 'fg-ofmarkdown-'));
        tempDirs.push(root);
        await mkdir(join(root, '.obsidian'));
        const doc = document(join(root, 'note.md'));
        const { controller, requests, promoted } = controllerFor({ documents: [doc] });

        assert.equal(await controller.maybePromote(doc as never), false);
        assert.deepEqual(promoted, []);
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

    it('does not call setTextDocumentLanguage during refresh', async () => {
        const doc = document(join('vault', 'note.md'));
        const { controller, promoted } = controllerFor({
            documents: [doc],
            membership: true,
        });

        await controller.refreshAll();
        assert.deepEqual(promoted, []);
    });

    it('refreshAll checks both markdown and ofmarkdown documents', async () => {
        const markdown = document(join('vault', 'new.md'));
        const plaintext = document(join('old', 'stale.md'), 'plaintext');
        const { controller, requests } = controllerFor({
            documents: [markdown, plaintext],
            memberships: {
                [markdown.uri.toString()]: true,
                [plaintext.uri.toString()]: true,
            },
        });

        await controller.refreshAll();

        assert.deepEqual(
            requests
                .map((request) => (request as { params: { uri: string } }).params.uri)
                .sort(),
            [markdown.uri.toString()],
        );
    });
});
