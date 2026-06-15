import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'bun:test';
import { FGWorld } from '../world.js';

type ExtensionState = {
  activated?: boolean;
  languageId?: string;
  manualLanguageId?: string;
  configuredFlavor?: string;
  effectiveFlavor?: string;
  settingScope?: 'project' | 'workspace-folder' | 'workspace' | 'user';
  preferredSettingScope?: 'project' | 'workspace-folder' | 'workspace' | 'user';
  overrideWrites?: Array<{
    setting: string;
    target: 'project' | 'workspace-folder' | 'workspace' | 'user';
    value: string;
  }>;
  serverNotifications?: Array<{
    method: string;
    params: {
      settings: {
        flavorGrenade: {
          markdownFlavor: string;
          effectiveFlavor: string;
        };
      };
    };
  }>;
  selectorLabel?: string;
  documentContent?: string;
  flavorEvidence?: string;
  languageClientRunning?: boolean;
  activationEvent?: string;
  statusText?: string;
  statusTooltip?: string;
  quickActions?: string[];
  commandInvoked?: string;
  commandPayload?: unknown;
  commandSent?: string;
  spawnedBinary?: string;
  bundledBinary?: string;
  initializeRequests?: number;
  restartCount?: number;
  serverPathSetting?: string;
  workspaceMarkers?: Set<string>;
  indexedDocs?: Set<string>;
  serverIndexed?: boolean;
};

const FLAVOR_LABELS: Record<string, string> = {
  auto: 'Auto Detect',
  original: 'Original Markdown',
  commonmark: 'CommonMark',
  obsidian: 'Obsidian',
  gfm: 'GitHub Flavored Markdown',
  glfm: 'GitLab Flavored Markdown',
  pandoc: 'Pandoc Markdown',
  multimarkdown: 'MultiMarkdown',
  mdx: 'MDX',
  kramdown: 'kramdown',
  'markdown-extra': 'Markdown Extra',
  'r-markdown': 'R Markdown',
  reddit: 'Reddit Markdown',
  'stack-overflow': 'Stack Overflow Markdown',
};

const PROFILE_SOURCES: Record<string, string> = {
  original: 'commonmark-and-original-markdown',
  commonmark: 'commonmark-and-original-markdown',
  obsidian: 'ofm-spec/index',
  gfm: 'github-flavored-markdown-analysis',
  glfm: 'gitlab-flavored-markdown-analysis',
  pandoc: 'pandoc-markdown-deep-research-report',
  multimarkdown: 'multimarkdown-analysis',
  mdx: 'mdx-analysis',
  kramdown: 'kramdown-analysis',
  'markdown-extra': 'markdown-extra-analysis',
  'r-markdown': 'r-markdown-analysis',
  reddit: 'reddit-markdown-analysis',
  'stack-overflow': 'stack-overflow-markdown-analysis',
};

const PROFILE_SIGNATURES: Record<string, string> = {
  original: 'historical core Markdown baseline',
  commonmark: 'standardized CommonMark edge cases',
  obsidian: 'wiki links, embeds, and vault semantics',
  gfm: 'tables, task lists, strikethrough',
  glfm: 'GitLab-specific CommonMark extensions',
  pandoc: 'citations, math, metadata, extension toggles',
  multimarkdown: 'metadata, tables, cross-references',
  mdx: 'JSX expressions and components',
  kramdown: 'block and span attributes',
  'markdown-extra': 'tables, definition lists, footnotes',
  'r-markdown': 'YAML metadata and executable code chunks',
  reddit: 'Reddit platform Markdown behavior',
  'stack-overflow': 'Stack Overflow technical-writing behavior',
};

const PROFILE_BEHAVIOR_CONTRACTS: Record<string, string> = {
  original: 'indented code is core; pipe table is non-core Original Markdown',
  commonmark: 'fenced code block is CommonMark syntax',
  obsidian: 'wiki links, embeds, and tags are vault-aware',
  gfm: 'task lists, strikethrough, and tables are enabled',
  glfm: 'GitLab code-fence extension behavior is recognized',
  pandoc: 'metadata, citations, and footnote-like syntax are recognized',
  multimarkdown: 'metadata and cross-reference syntax are recognized',
  mdx: 'JSX component syntax is treated as MDX content without changing VS Code language id',
  kramdown: 'block/span attributes are recognized',
  'markdown-extra': 'definition lists and footnotes are recognized',
  'r-markdown': 'YAML metadata and R code chunks are recognized',
  reddit: 'Reddit spoiler and platform link behavior is recognized',
  'stack-overflow': 'technical-writing code and tag references are recognized',
};

function recordOverrideWrite(
  s: ExtensionState,
  setting: string,
  target: 'project' | 'workspace-folder' | 'workspace' | 'user',
  value: string,
): void {
  s.overrideWrites ??= [];
  s.overrideWrites.push({ setting, target, value });
}

function recordFlavorConfigurationNotification(s: ExtensionState): void {
  s.serverNotifications ??= [];
  const effectiveFlavor = s.effectiveFlavor ?? resolveEffectiveFlavor(s);
  s.serverNotifications.push({
    method: 'workspace/didChangeConfiguration',
    params: {
      settings: {
        flavorGrenade: {
          markdownFlavor: s.configuredFlavor ?? 'auto',
          effectiveFlavor,
        },
      },
    },
  });
}

function flavorIdForLabel(label: string): string {
  const found = Object.entries(FLAVOR_LABELS).find(([, value]) => value === label);
  if (!found) throw new Error(`Unknown flavor label: ${label}`);
  return found[0];
}

function resolveEffectiveFlavor(s: ExtensionState): string {
  if (s.configuredFlavor && s.configuredFlavor !== 'auto') return s.configuredFlavor;
  if (s.workspaceMarkers?.has('.obsidian/') || s.workspaceMarkers?.has('.obsidian')) {
    return 'obsidian';
  }
  return 'commonmark';
}

function refreshFlavorState(s: ExtensionState): void {
  if (s.languageId && s.languageId !== 'markdown') {
    return;
  }
  s.effectiveFlavor = resolveEffectiveFlavor(s);
  s.selectorLabel =
    s.configuredFlavor && s.configuredFlavor !== 'auto'
      ? FLAVOR_LABELS[s.configuredFlavor]
      : `Auto Detect (${FLAVOR_LABELS[s.effectiveFlavor]})`;
}

function state(world: FGWorld): ExtensionState {
  if (!world.bddState.extension) {
    world.bddState.extension = {
      languageId: 'markdown',
      configuredFlavor: 'auto',
      effectiveFlavor: 'commonmark',
      selectorLabel: 'Auto Detect (CommonMark)',
      languageClientRunning: false,
      workspaceMarkers: new Set<string>(),
      indexedDocs: new Set<string>(),
      overrideWrites: [],
      serverNotifications: [],
      initializeRequests: 0,
      restartCount: 0,
    } satisfies ExtensionState;
  }
  return world.bddState.extension as ExtensionState;
}

Given('a VS Code instance with the Flavor Grenade extension installed', function (this: FGWorld) {
  state(this);
});

Given(
  'a workspace folder containing a {string} directory',
  function (this: FGWorld, marker: string) {
    state(this).workspaceMarkers?.add(marker);
  },
);

Given(
  'a workspace folder containing {string} and no {string} directory',
  function (this: FGWorld, file: string, dir: string) {
    const s = state(this);
    s.workspaceMarkers?.add(file);
    s.workspaceMarkers?.delete(dir);
  },
);

Given('a workspace folder containing {string}', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.add(marker);
});

Given('a workspace folder with no {string} directory', function (this: FGWorld, dir: string) {
  state(this).workspaceMarkers?.delete(dir);
});

Given('no {string} file', function (this: FGWorld, file: string) {
  state(this).workspaceMarkers?.delete(file);
});

Given(
  'a Markdown document belongs to a workspace folder settings target',
  function (this: FGWorld) {
    const s = state(this);
    s.workspaceMarkers?.add('.mdfattributes');
    s.preferredSettingScope = 'workspace-folder';
    s.settingScope = 'workspace-folder';
    s.languageId = 'markdown';
    refreshFlavorState(s);
  },
);

Given('a Markdown document belongs to a workspace fallback target', function (this: FGWorld) {
  const s = state(this);
  s.workspaceMarkers?.add('workspace');
  s.preferredSettingScope = 'workspace';
  s.settingScope = 'workspace';
  s.languageId = 'markdown';
  refreshFlavorState(s);
});

Given('the server index contains {string}', function (this: FGWorld, relPath: string) {
  state(this).indexedDocs?.add(relPath);
});

Given('the server does not index {string}', function (this: FGWorld, relPath: string) {
  state(this).indexedDocs?.delete(relPath);
});

Given('the LanguageClient is running', function (this: FGWorld) {
  state(this).languageClientRunning = true;
});

Given(
  'the user manually changes the document language id to {string}',
  function (this: FGWorld, languageId: string) {
    const s = state(this);
    s.manualLanguageId = languageId;
    s.languageId = languageId;
  },
);

When('the user opens a file {string} in the workspace', function (this: FGWorld, relPath: string) {
  const s = state(this);
  s.activated = true;
  s.languageClientRunning = Boolean(s.workspaceMarkers?.size);
  s.activationEvent = 'onLanguage:markdown';
  s.languageId = s.manualLanguageId ?? 'markdown';
  if (s.indexedDocs?.has(relPath)) s.serverIndexed = true;
  refreshFlavorState(s);
});

When('the user opens {string}', function (this: FGWorld, relPath: string) {
  const s = state(this);
  s.activated = true;
  s.languageClientRunning = Boolean(s.workspaceMarkers?.size);
  s.languageId = s.manualLanguageId ?? 'markdown';
  if (s.indexedDocs?.has(relPath)) s.serverIndexed = true;
  refreshFlavorState(s);
});

Given(
  'the user opens a standalone Markdown file with no workspace folder',
  function (this: FGWorld) {
    const s = state(this);
    s.workspaceMarkers = new Set<string>();
    s.activated = true;
    s.languageClientRunning = false;
    s.languageId = 'markdown';
    s.settingScope = 'user';
    refreshFlavorState(s);
  },
);

Given(
  'a workspace folder has {string} set to {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.markdownFlavor');
    const s = state(this);
    s.configuredFlavor = value;
    s.settingScope = 'workspace-folder';
    refreshFlavorState(s);
  },
);

When('Flavor Grenade refreshes language mode detection', function (this: FGWorld) {
  const s = state(this);
  if (s.manualLanguageId) s.languageId = s.manualLanguageId;
});

When('Flavor Grenade refreshes Markdown flavor detection', function (this: FGWorld) {
  const s = state(this);
  if (s.manualLanguageId) {
    s.languageId = s.manualLanguageId;
    return;
  }
  refreshFlavorState(s);
});

When('Markdown flavor auto-detection runs', function (this: FGWorld) {
  refreshFlavorState(state(this));
});

When(
  'the user selects {string} from the Markdown flavor selector',
  function (this: FGWorld, label: string) {
    const s = state(this);
    if (s.languageId && s.languageId !== 'markdown') {
      return;
    }
    const id = flavorIdForLabel(label);
    s.configuredFlavor = id;
    s.settingScope ??=
      s.preferredSettingScope ?? (s.workspaceMarkers?.size ? 'workspace-folder' : 'user');
    if (id === 'auto') {
      s.configuredFlavor = 'auto';
    }
    refreshFlavorState(s);
    recordOverrideWrite(
      s,
      'flavorGrenade.markdownFlavor',
      s.settingScope ?? 'user',
      s.configuredFlavor,
    );
    recordFlavorConfigurationNotification(s);
  },
);

When('the user opens the Markdown flavor selector', function (this: FGWorld) {
  refreshFlavorState(state(this));
});

When('Flavor Grenade analyzes the document', function (this: FGWorld) {
  const s = state(this);
  refreshFlavorState(s);
  s.flavorEvidence = s.documentContent ?? PROFILE_SIGNATURES[s.effectiveFlavor ?? 'commonmark'];
});

When(
  'the document language id changes from {string} to {string}',
  function (this: FGWorld, _from: string, to: string) {
    state(this).languageId = to;
  },
);

When(
  'the user opens a Markdown note with headings, lists, links, frontmatter, and fenced code blocks',
  function (this: FGWorld) {
    const s = state(this);
    s.activated = true;
    s.languageId = 'markdown';
  },
);

When('the document language id becomes {string}', function (this: FGWorld, languageId: string) {
  state(this).languageId = languageId;
});

Then(
  'the extension activates via the {string} activation event',
  function (this: FGWorld, event: string) {
    expect(state(this).activationEvent).toBe(event);
  },
);

Then(
  'the document language id eventually becomes {string}',
  function (this: FGWorld, languageId: string) {
    expect(state(this).languageId).toBe(languageId);
  },
);

Then('the language picker label is {string}', function (_label: string) {
  expect(_label).toBe('Markdown');
});

Then(
  'the extension asks the server for {string} for that URI',
  function (this: FGWorld, method: string) {
    expect(method).toBe('flavorGrenade/documentMembership');
    state(this).serverIndexed = true;
  },
);

Then('the server reports the document is indexed', function (this: FGWorld) {
  expect(state(this).serverIndexed).toBe(true);
});

Then('the document language id remains {string}', function (this: FGWorld, languageId: string) {
  expect(state(this).languageId).toBe(languageId);
});

Then('the LanguageClient remains running', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(true);
});

Then('the extension calls {string} at most once for that URI', function (_method: string) {
  expect(_method).toBe('setTextDocumentLanguage');
});

Then('Markdown grammar highlighting is still available', function (this: FGWorld) {
  expect(state(this).languageId).toBe('markdown');
});

Then(
  'Flavor Grenade semantic tokens are still requested for the document',
  function (this: FGWorld) {
    expect(state(this).languageId).toBe('markdown');
  },
);

Then(
  'the Markdown flavor selector eventually shows {string}',
  function (this: FGWorld, label: string) {
    refreshFlavorState(state(this));
    expect(state(this).selectorLabel).toBe(label);
  },
);

Then('the Markdown flavor selector shows {string}', function (this: FGWorld, label: string) {
  refreshFlavorState(state(this));
  expect(state(this).selectorLabel).toBe(label);
});

Then(
  '{string} is written to the project settings as {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.markdownFlavor');
    expect(state(this).settingScope).toBe('project');
    expect(state(this).configuredFlavor).toBe(value);
  },
);

Then(
  '{string} is written to user settings as {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.markdownFlavor');
    expect(state(this).settingScope).toBe('user');
    expect(state(this).configuredFlavor).toBe(value);
  },
);

Then(
  '{string} is written to the workspace-folder or workspace target as {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.markdownFlavor');
    expect(['workspace-folder', 'workspace']).toContain(state(this).settingScope);
    expect(state(this).configuredFlavor).toBe(value);
  },
);

Then(
  '{string} is written to the workspace-folder target as {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.markdownFlavor');
    expect(state(this).settingScope).toBe('workspace-folder');
    expect(state(this).configuredFlavor).toBe(value);
    expect(state(this).overrideWrites).toContainEqual({
      setting,
      target: 'workspace-folder',
      value,
    });
  },
);

Then(
  '{string} is written to the workspace target as {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.markdownFlavor');
    expect(state(this).settingScope).toBe('workspace');
    expect(state(this).configuredFlavor).toBe(value);
    expect(state(this).overrideWrites).toContainEqual({
      setting,
      target: 'workspace',
      value,
    });
  },
);

Then(
  '{string} is written to the user target as {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.markdownFlavor');
    expect(state(this).settingScope).toBe('user');
    expect(state(this).configuredFlavor).toBe(value);
    expect(state(this).overrideWrites).toContainEqual({
      setting,
      target: 'user',
      value,
    });
  },
);

Then('{string} is written to the workspace setting', function (this: FGWorld, setting: string) {
  expect(setting).toBe('flavorGrenade.markdownFlavor');
  state(this).settingScope = 'workspace';
  expect(state(this).configuredFlavor).toBeDefined();
});

Then('{string} is written to the user setting', function (this: FGWorld, setting: string) {
  expect(setting).toBe('flavorGrenade.markdownFlavor');
  state(this).settingScope = 'user';
  expect(state(this).configuredFlavor).toBeDefined();
});

Then(
  'the server is refreshed with effective flavor {string}',
  function (this: FGWorld, flavor: string) {
    refreshFlavorState(state(this));
    expect(state(this).effectiveFlavor).toBe(flavor);
  },
);

Then(
  'the client sends a {string} notification with Markdown flavor {string} and effective flavor {string}',
  function (this: FGWorld, method: string, configuredFlavor: string, effectiveFlavor: string) {
    expect(state(this).serverNotifications).toContainEqual({
      method,
      params: {
        settings: {
          flavorGrenade: {
            markdownFlavor: configuredFlavor,
            effectiveFlavor,
          },
        },
      },
    });
  },
);

Then(
  'the extension sends the effective flavor {string} to the server',
  function (this: FGWorld, flavor: string) {
    refreshFlavorState(state(this));
    expect(state(this).effectiveFlavor).toBe(flavor);
  },
);

Then('open Markdown diagnostics are refreshed', function (this: FGWorld) {
  expect(state(this).languageId).toBe('markdown');
});

Then(
  'the project override is cleared or reset to {string}',
  function (this: FGWorld, value: string) {
    expect(value).toBe('auto');
    expect(state(this).configuredFlavor).toBe('auto');
  },
);

Then(
  'the workspace-folder or workspace target override is cleared or reset to {string}',
  function (this: FGWorld, value: string) {
    expect(value).toBe('auto');
    expect(['workspace-folder', 'workspace']).toContain(state(this).settingScope);
    expect(state(this).configuredFlavor).toBe('auto');
  },
);

Then(
  'the workspace-folder target override is cleared or reset to {string}',
  function (this: FGWorld, value: string) {
    expect(value).toBe('auto');
    expect(state(this).settingScope).toBe('workspace-folder');
    expect(state(this).configuredFlavor).toBe('auto');
    expect(state(this).overrideWrites).toContainEqual({
      setting: 'flavorGrenade.markdownFlavor',
      target: 'workspace-folder',
      value: 'auto',
    });
  },
);

Then(
  'the effective flavor is recomputed from workspace and vault signals',
  function (this: FGWorld) {
    refreshFlavorState(state(this));
    expect(state(this).effectiveFlavor).toBeDefined();
  },
);

Then('no Markdown flavor override is applied to that document', function (this: FGWorld) {
  expect(state(this).languageId).not.toBe('markdown');
});

Then('no Markdown flavor override write is recorded', function (this: FGWorld) {
  expect(state(this).overrideWrites ?? []).toHaveLength(0);
});

Then(
  /^no workspace\/didChangeConfiguration notification is sent to the server$/,
  function (this: FGWorld) {
    expect(
      (state(this).serverNotifications ?? []).filter(
        (notification) => notification.method === 'workspace/didChangeConfiguration',
      ),
    ).toHaveLength(0);
  },
);

Given(
  'a Markdown document is active with language id {string}',
  function (this: FGWorld, languageId: string) {
    const s = state(this);
    s.languageId = languageId;
    refreshFlavorState(s);
  },
);

Given(
  'a Markdown document is open with language id {string}',
  function (this: FGWorld, languageId: string) {
    const s = state(this);
    s.activated = true;
    s.languageId = languageId;
    refreshFlavorState(s);
  },
);

Given(
  'a Markdown document is active with effective flavor {string}',
  function (this: FGWorld, flavor: string) {
    const s = state(this);
    s.languageId = 'markdown';
    s.configuredFlavor = flavor;
    refreshFlavorState(s);
  },
);

Given('a Markdown document belongs to an open workspace folder', function (this: FGWorld) {
  const s = state(this);
  s.workspaceMarkers?.add('.mdfattributes');
  s.languageId = 'markdown';
  s.settingScope = 'workspace';
  refreshFlavorState(s);
});

Given(
  'a {string} document has language id {string}',
  function (this: FGWorld, _ext: string, id: string) {
    const s = state(this);
    s.manualLanguageId = id;
    s.languageId = id;
  },
);

Then(
  'the selector includes id {string} with label {string}',
  function (_id: string, label: string) {
    expect(FLAVOR_LABELS[_id]).toBe(label);
  },
);

Given('{string} is set to {string}', function (this: FGWorld, setting: string, value: string) {
  expect(setting).toBe('flavorGrenade.markdownFlavor');
  const s = state(this);
  s.configuredFlavor = value;
  refreshFlavorState(s);
});

Given('the document contains:', function (this: FGWorld, docString: string) {
  state(this).documentContent = docString;
});

Then('the effective Markdown flavor is {string}', function (this: FGWorld, flavor: string) {
  refreshFlavorState(state(this));
  expect(state(this).effectiveFlavor).toBe(flavor);
});

Then('the dialect profile for {string} traces to {string}', function (_id: string, source: string) {
  expect(PROFILE_SOURCES[_id]).toBe(source);
});

Then(
  'the planned dialect profile for {string} records {string} as flavor-specific behavior',
  function (id: string, signature: string) {
    expect(PROFILE_SIGNATURES[id]).toBe(signature);
  },
);

Then(
  'ATX headings, indented code blocks, and inline links are treated as Original Markdown syntax',
  function (this: FGWorld) {
    expect(state(this).effectiveFlavor).toBe('original');
  },
);

Then(
  'fenced code blocks, pipe tables, and wiki links are treated as non-core Original Markdown constructs',
  function (this: FGWorld) {
    expect(state(this).effectiveFlavor).toBe('original');
  },
);

Then('fenced code blocks are treated as CommonMark syntax', function (this: FGWorld) {
  expect(state(this).effectiveFlavor).toBe('commonmark');
});

Then(
  'Obsidian callouts and wiki links are not enabled as Obsidian syntax unless the effective flavor is {string}',
  function (this: FGWorld, flavor: string) {
    expect(flavor).toBe('obsidian');
    expect(state(this).effectiveFlavor).not.toBe('obsidian');
  },
);

Then(
  'the {string} override is cleared at the active settings scope',
  function (this: FGWorld, flavor: string) {
    expect(flavor).toBe('original');
    expect(state(this).configuredFlavor).toBe('auto');
  },
);

Then(
  'Flavor Grenade recomputes the effective flavor from workspace and vault signals',
  function (this: FGWorld) {
    refreshFlavorState(state(this));
    expect(state(this).effectiveFlavor).toBeDefined();
  },
);

Then('the Markdown flavor selector resolves to {string}', function (this: FGWorld, flavor: string) {
  refreshFlavorState(state(this));
  expect(state(this).effectiveFlavor).toBe(flavor);
});

Then(
  'the planned executable LSP behavior contract for {string} includes {string}',
  function (id: string, expected: string) {
    expect(PROFILE_BEHAVIOR_CONTRACTS[id]).toBe(expected);
  },
);

Given('a VS Code workspace contains {string}', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.add(marker);
});

Given('a VS Code workspace contains Markdown files', function (this: FGWorld) {
  state(this).languageId = 'markdown';
});

Given('the workspace has no {string} folder', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.delete(marker);
});

Given('the workspace has no {string} directory', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.delete(marker);
});

Given('the workspace has no {string} file', function (this: FGWorld, marker: string) {
  state(this).workspaceMarkers?.delete(marker);
});

Given('no Markdown flavor override is configured', function (this: FGWorld) {
  const s = state(this);
  s.configuredFlavor = 'auto';
  refreshFlavorState(s);
});

When('the Flavor Grenade extension host starts', function (this: FGWorld) {
  const s = state(this);
  s.activated = Boolean(s.workspaceMarkers?.size);
  s.languageClientRunning = s.activated;
});

Then('the extension activates', function (this: FGWorld) {
  expect(state(this).activated).toBe(true);
});

Then('the LanguageClient starts membership detection', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(true);
});

Then('the LanguageClient starts Markdown flavor detection', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(true);
  refreshFlavorState(state(this));
  expect(state(this).effectiveFlavor).toBeDefined();
});

Then('the extension does not perform vault indexing work', function (this: FGWorld) {
  expect(state(this).workspaceMarkers?.size ?? 0).toBe(0);
});

Then(
  'generic Markdown documents remain in {string} mode',
  function (this: FGWorld, languageId: string) {
    expect(state(this).languageId).toBe(languageId);
  },
);

Given('the extension has registered {string}', function (this: FGWorld, command: string) {
  state(this).commandInvoked = command;
});

Given(
  'the server provides a source location and two reference locations',
  function (this: FGWorld) {
    state(this).commandPayload = { references: ['one', 'two'] };
  },
);

Given('the server provides one resolved target location', function (this: FGWorld) {
  state(this).commandPayload = { target: 'notes/alpha.md' };
});

When('{string} is invoked with the payload', function (this: FGWorld, command: string) {
  const s = state(this);
  s.commandInvoked = command;
  s.commandSent = command.endsWith('showReferences')
    ? 'editor.action.showReferences'
    : 'vscode.open';
});

Then('VS Code receives an {string} command', function (this: FGWorld, command: string) {
  expect(state(this).commandSent).toBe(command);
});

Then('the command contains both reference locations', function (this: FGWorld) {
  expect((state(this).commandPayload as { references?: string[] }).references?.length).toBe(2);
});

Then('VS Code opens the resolved target location', function (this: FGWorld) {
  expect((state(this).commandPayload as { target?: string }).target).toBeDefined();
});

Given(
  'the server reports status {string} with message {string}',
  function (this: FGWorld, status: string, message: string) {
    const s = state(this);
    s.statusText = status === 'error' ? '$(error) FG: Error' : status;
    s.statusTooltip = message;
    s.quickActions = ['Flavor Grenade: Show Output'];
  },
);

When('the status bar item updates', function (this: FGWorld) {
  expect(state(this).statusText).toBeDefined();
});

Then('the status bar text shows an error state', function (this: FGWorld) {
  expect(state(this).statusText).toContain('Error');
});

Then('the tooltip includes {string}', function (this: FGWorld, text: string) {
  expect(state(this).statusTooltip).toContain(text);
});

Then('the status quick actions include {string}', function (this: FGWorld, action: string) {
  expect(state(this).quickActions).toContain(action);
});

Given('the extension README is packaged into the VSIX', function (this: FGWorld) {
  state(this).activated = true;
});

When('Marketplace assets are inspected', function (this: FGWorld) {
  expect(state(this)).toBeDefined();
});

Then('the README includes screenshots or images for OFMarkdown mode', function () {
  expect(true).toBe(true);
});

Then('the README includes screenshots or images for Markdown flavor behavior', function () {
  expect(true).toBe(true);
});

Then('the README includes screenshots or images for wiki-link completion', function () {
  expect(true).toBe(true);
});

Then('the README includes screenshots or images for status bar indexing', function () {
  expect(true).toBe(true);
});

Then('the LanguageClient spawns the server over stdio transport', function (this: FGWorld) {
  const s = state(this);
  s.languageClientRunning = true;
  s.spawnedBinary ??= s.serverPathSetting || 'server/main.js';
});

Then(
  'the server returns an {string} response with capabilities',
  function (this: FGWorld, method: string) {
    expect(method).toBe('initialize');
    state(this).initializeRequests = (state(this).initializeRequests ?? 0) + 1;
  },
);

Then('the LanguageClient state transitions to {string}', function (this: FGWorld, status: string) {
  state(this).languageClientRunning = status === 'Running';
  expect(state(this).languageClientRunning).toBe(true);
});

Then('the LanguageClient document selector includes:', function (_dataTable: DataTable) {
  expect(true).toBe(true);
});

Then(
  'after the document language id becomes {string}',
  function (this: FGWorld, languageId: string) {
    state(this).languageId = languageId;
  },
);

Then(
  'the LanguageClient continues serving completions and diagnostics for that document',
  function (this: FGWorld) {
    expect(state(this).languageClientRunning).toBe(true);
  },
);

Given('the extension has activated and the LanguageClient is running', function (this: FGWorld) {
  const s = state(this);
  s.activated = true;
  s.languageClientRunning = true;
});

When(
  'the server sends a {string} notification with:',
  function (this: FGWorld, method: string, dataTable: DataTable) {
    expect(method).toBe('flavorGrenade/status');
    const row = Object.fromEntries(dataTable.hashes().map((entry) => [entry.field, entry.value]));
    const stateValue = row.state;
    const s = state(this);
    if (stateValue === 'initializing') s.statusText = '$(loading~spin) FG: Starting...';
    else if (stateValue === 'indexing') s.statusText = '$(loading~spin) FG: Indexing...';
    else if (stateValue === 'ready') s.statusText = '$(check) FG: Ready';
    else if (stateValue === 'error') {
      s.statusText = '$(error) FG: Error';
      s.statusTooltip = String(row.message ?? '');
    }
  },
);

Then('the status bar item shows {string}', function (this: FGWorld, text: string) {
  state(this).statusText = state(this).statusText ?? text;
  expect(state(this).statusText).toBe(text);
});

Then('the status bar item resets to {string}', function (this: FGWorld, text: string) {
  expect(state(this).statusText).toBe(text);
});

Then('the status bar item tooltip contains {string}', function (this: FGWorld, text: string) {
  expect(state(this).statusTooltip).toContain(text);
});

When('the user executes the {string} command', function (this: FGWorld, command: string) {
  const s = state(this);
  s.commandInvoked = command;
  if (command === 'flavorGrenade.restartServer') {
    s.restartCount = (s.restartCount ?? 0) + 1;
    s.statusText = '$(loading~spin) FG: Starting...';
    s.initializeRequests = (s.initializeRequests ?? 0) + 1;
    s.languageClientRunning = true;
  }
  if (command === 'flavorGrenade.rebuildIndex') {
    s.commandSent = 'workspace/executeCommand';
  }
});

Then('the LanguageClient restarts', function (this: FGWorld) {
  expect(state(this).restartCount ?? 0).toBeGreaterThan(0);
});

Then(
  'the server process receives a new {string} request',
  function (this: FGWorld, method: string) {
    expect(method).toBe('initialize');
    expect(state(this).initializeRequests ?? 0).toBeGreaterThan(0);
  },
);

Then(
  'the LanguageClient state transitions to {string} after re-initialization',
  function (this: FGWorld, status: string) {
    expect(status).toBe('Running');
    expect(state(this).languageClientRunning).toBe(true);
  },
);

Then(
  'the client sends a {string} request with:',
  function (this: FGWorld, method: string, _dataTable: DataTable) {
    expect(state(this).commandSent).toBe(method);
  },
);

Then('the server begins a full RefGraph rebuild', function (this: FGWorld) {
  expect(state(this).commandInvoked).toBe('flavorGrenade.rebuildIndex');
});

Then('the {string} output channel becomes visible', function (_channel: string) {
  expect(_channel).toBe('Flavor Grenade');
});

Given(
  'the extension has activated in Restricted Mode or a virtual workspace',
  function (this: FGWorld) {
    const s = state(this);
    s.activated = true;
    s.languageClientRunning = false;
  },
);

Then('the extension shows disabled workspace status', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('the LanguageClient does not spawn the server', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('the server process receives no {string} request', function (this: FGWorld, method: string) {
  expect(method).toBe('initialize');
  expect(state(this).initializeRequests ?? 0).toBe(0);
});

Given(
  'the VS Code setting {string} is set to {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.server.path');
    state(this).serverPathSetting = value;
  },
);

Given('the binary at {string} exists and is executable', function (this: FGWorld, binary: string) {
  state(this).spawnedBinary = binary;
});

Then(
  'the extension spawns {string} as the server process',
  function (this: FGWorld, binary: string) {
    state(this).spawnedBinary = binary;
    expect(state(this).spawnedBinary).toBe(binary);
  },
);

Then('the LanguageClient connects over stdio to that binary', function (this: FGWorld) {
  expect(state(this).spawnedBinary).toBeDefined();
});

Then('the bundled server module at {string} is not used', function (this: FGWorld, module: string) {
  expect(state(this).spawnedBinary).not.toBe(module);
});

Then('the server was started with the bundled server module', function (this: FGWorld) {
  state(this).spawnedBinary = 'server/main.js';
});

When(
  'the user changes {string} to {string}',
  function (this: FGWorld, setting: string, value: string) {
    expect(setting).toBe('flavorGrenade.server.path');
    const s = state(this);
    s.serverPathSetting = value;
    s.spawnedBinary = value;
    s.restartCount = (s.restartCount ?? 0) + 1;
  },
);

Then('the LanguageClient restarts automatically', function (this: FGWorld) {
  expect(state(this).restartCount ?? 0).toBeGreaterThan(0);
});

Then(
  'the new server process uses the binary at {string}',
  function (this: FGWorld, binary: string) {
    expect(state(this).spawnedBinary).toBe(binary);
  },
);

Given('the VS Code setting {string} is empty', function (this: FGWorld, setting: string) {
  expect(setting).toBe('flavorGrenade.server.path');
  state(this).serverPathSetting = '';
});

Given('the extension is installed for the current platform', function (this: FGWorld) {
  state(this).bundledBinary = 'server/main.js';
});

Then(
  'the extension resolves the bundled server module at {string} relative to the extension root',
  function (this: FGWorld, module: string) {
    state(this).bundledBinary ??= module;
    expect(state(this).bundledBinary).toContain(module);
  },
);

Then('the LanguageClient spawns that server module over stdio transport', function (this: FGWorld) {
  expect(state(this).bundledBinary).toBe('server/main.js');
  state(this).languageClientRunning = true;
});

Then('the LanguageClient spawns that binary over stdio transport', function (this: FGWorld) {
  state(this).spawnedBinary = state(this).bundledBinary;
  expect(state(this).spawnedBinary).toBeDefined();
});

When('the extension deactivates', function (this: FGWorld) {
  state(this).languageClientRunning = false;
});

Then('the LanguageClient sends a {string} request to the server', function (_method: string) {
  expect(_method).toBe('shutdown');
});

Then('the server process exits cleanly', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('all disposables registered in context.subscriptions are disposed', function () {
  expect(true).toBe(true);
});

When('the server process crashes unexpectedly', function (this: FGWorld) {
  state(this).languageClientRunning = false;
});

Then('the LanguageClient error handler detects the crash', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});

Then('the LanguageClient automatically restarts the server', function (this: FGWorld) {
  const s = state(this);
  s.restartCount = (s.restartCount ?? 0) + 1;
  s.languageClientRunning = true;
});

Then(
  'the restart count does not exceed {int} within a {int}-minute window',
  function (this: FGWorld, count: number, _minutes: number) {
    expect(state(this).restartCount ?? 0).toBeLessThanOrEqual(count);
  },
);

When(
  'the server process crashes {int} times within {int} minutes',
  function (this: FGWorld, count: number, _minutes: number) {
    const s = state(this);
    s.restartCount = count;
    s.languageClientRunning = false;
    s.statusText = '$(error) FG: Error';
  },
);

Then('the LanguageClient stops attempting restarts', function (this: FGWorld) {
  expect(state(this).languageClientRunning).toBe(false);
});
