import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import {
    COMMAND_BRIDGE_IDS,
    createCommandBridgeHandlers,
    type CommandBridgeApi,
} from './command-bridges.js';

interface ExtensionPackage {
    activationEvents?: string[];
    contributes?: {
        commands?: Array<{ command: string; title: string }>;
    };
}

interface RecordedCommand {
    command: string;
    args: unknown[];
}

function locationPayload(uri = 'file:///vault/target.md') {
    return {
        uri,
        range: {
            start: { line: 1, character: 2 },
            end: { line: 1, character: 8 },
        },
    };
}

function fakeApi() {
    const commands: RecordedCommand[] = [];
    const shownDocuments: unknown[] = [];
    const errors: string[] = [];
    const clipboard: string[] = [];

    const api: CommandBridgeApi = {
        createLocation: (uri, range) => ({ uri, range, kind: 'location' }),
        createPosition: (line, character) => ({ line, character, kind: 'position' }),
        createRange: (start, end) => ({ start, end, kind: 'range' }),
        executeCommand: async (command, ...args) => {
            commands.push({ command, args });
            return undefined;
        },
        parseUri: (value) => ({ value, kind: 'uri' }),
        showErrorMessage: async (message) => {
            errors.push(message);
            return undefined;
        },
        showTextDocument: async (uri, options) => {
            shownDocuments.push({ uri, options });
            return undefined;
        },
        writeClipboard: async (text) => {
            clipboard.push(text);
        },
    };

    return { api, clipboard, commands, errors, shownDocuments };
}

async function readExtensionPackage(): Promise<ExtensionPackage> {
    return JSON.parse(await readFile(resolve('package.json'), 'utf8')) as ExtensionPackage;
}

describe('command bridge manifest', () => {
    it('contributes and activates every command bridge', async () => {
        const manifest = await readExtensionPackage();
        const contributed = new Set(manifest.contributes?.commands?.map((command) => command.command));
        const activationEvents = new Set(manifest.activationEvents);

        for (const commandId of COMMAND_BRIDGE_IDS) {
            assert.equal(contributed.has(commandId), true, `${commandId} is contributed`);
            assert.equal(activationEvents.has(`onCommand:${commandId}`), true, `${commandId} activates`);
        }
    });
});

describe('native reference and link bridges', () => {
    it('invokes editor.action.showReferences for valid reference payloads', async () => {
        const { api, commands, errors } = fakeApi();
        const handlers = createCommandBridgeHandlers(api);

        assert.equal(await handlers.showReferences({
            locations: [locationPayload()],
            position: { line: 3, character: 4 },
            uri: 'file:///vault/source.md',
        }), true);

        assert.equal(errors.length, 0);
        assert.equal(commands.length, 1);
        assert.equal(commands[0]?.command, 'editor.action.showReferences');
        assert.equal((commands[0]?.args[0] as { value: string }).value, 'file:///vault/source.md');
    });

    it('opens valid link and embed targets with native document navigation', async () => {
        const { api, shownDocuments } = fakeApi();
        const handlers = createCommandBridgeHandlers(api);

        assert.equal(await handlers.followLink({ target: locationPayload('file:///vault/link.md') }), true);
        assert.equal(await handlers.openEmbedTarget({ target: locationPayload('file:///vault/embed.png') }), true);

        assert.deepEqual(
            shownDocuments.map((entry) => (entry as { uri: { value: string } }).uri.value),
            ['file:///vault/link.md', 'file:///vault/embed.png'],
        );
    });
});

describe('payload validation', () => {
    it('rejects malformed payloads without native API calls', async () => {
        const { api, commands, errors, shownDocuments } = fakeApi();
        const handlers = createCommandBridgeHandlers(api);

        assert.equal(await handlers.showReferences({ locations: ['bad'] }), false);
        assert.equal(await handlers.followLink({ target: { uri: 42 } }), false);

        assert.equal(commands.length, 0);
        assert.equal(shownDocuments.length, 0);
        assert.equal(errors.length, 2);
    });
});

describe('OFMarkdown graph command bridges', () => {
    it('bridges backlinks, outlinks, vault reveal, and diagnostic copy actions', async () => {
        const { api, clipboard, commands, errors } = fakeApi();
        const handlers = createCommandBridgeHandlers(api);

        assert.equal(await handlers.showBacklinks({
            locations: [locationPayload('file:///vault/backlink.md')],
            position: { line: 0, character: 0 },
            uri: 'file:///vault/source.md',
        }), true);
        assert.equal(await handlers.showOutlinks({
            locations: [locationPayload('file:///vault/outlink.md')],
            position: { line: 0, character: 0 },
            uri: 'file:///vault/source.md',
        }), true);
        assert.equal(await handlers.revealVaultRoot({ uri: 'file:///vault' }), true);
        assert.equal(await handlers.copyDiagnosticInfo({ text: 'FG001 BrokenLink' }), true);

        assert.deepEqual(commands.map((call) => call.command), [
            'editor.action.showReferences',
            'editor.action.showReferences',
            'revealInExplorer',
        ]);
        assert.deepEqual(clipboard, ['FG001 BrokenLink']);
        assert.equal(errors.length, 0);
    });
});
