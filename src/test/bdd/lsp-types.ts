/**
 * Minimal LSP and custom flavorGrenade protocol types for BDD step-definition
 * assertions.  These mirror the standard LSP shapes without pulling in the full
 * vscode-languageserver-protocol package into the test layer.
 */

export interface LspPosition {
  line: number;
  character: number;
}

export interface LspRange {
  start: LspPosition;
  end: LspPosition;
}

export interface LspLocation {
  uri: string;
  range: LspRange;
}

export interface LspLocationLink {
  originSelectionRange?: LspRange;
  targetUri: string;
  targetRange: LspRange;
  targetSelectionRange: LspRange;
}

export interface LspRelatedInformation {
  location: LspLocation;
  message: string;
}

export interface LspDiagnostic {
  code: string;
  severity: number;
  message: string;
  range: LspRange;
  relatedInformation?: LspRelatedInformation[];
  [key: string]: unknown;
}

export interface LspCompletionItem {
  label: string;
  kind: number;
}

export interface LspCompletionList {
  items: LspCompletionItem[];
  isIncomplete: boolean;
}

export interface LspTextEdit {
  newText: string;
  range: LspRange;
}

export interface LspRenameFileOperation {
  kind: 'rename';
  oldUri: string;
  newUri: string;
}

export interface LspTextDocumentEdit {
  textDocument: { uri: string };
  edits: LspTextEdit[];
}

export type LspDocumentChange = LspRenameFileOperation | LspTextDocumentEdit;

export interface LspWorkspaceEdit {
  changes?: Record<string, LspTextEdit[]>;
  documentChanges?: LspDocumentChange[];
}

export interface LspPrepareRenameResult {
  range: LspRange;
  placeholder: string;
  error?: { message: string };
  message?: string;
}

export interface LspCodeActionCommand {
  command: string;
  arguments?: unknown[];
}

export interface LspCodeAction {
  title: string;
  kind?: string;
  command?: LspCodeActionCommand;
  [key: string]: unknown;
}

// flavorGrenade custom protocol types

export interface FgBlockAnchor {
  id: string;
  range: LspRange;
}

export interface FgCallout {
  type: string;
  foldable?: string;
  depth?: number;
  title?: string;
}

export interface FgTag {
  tag: string;
  range: LspRange;
}

export interface FgHeading {
  text: string;
  range: LspRange;
}

export interface FgDocIndex {
  blockAnchors: FgBlockAnchor[];
  callouts: FgCallout[];
  headings: FgHeading[];
  tags: FgTag[];
  wikiLinks: unknown[];
  embeds: unknown[];
}

export interface FgQueryDocResult {
  index: FgDocIndex;
  frontmatter: Record<string, unknown> | null;
  frontmatterParseError: boolean;
}

export interface LspCodeLensCommand {
  title: string;
  command: string;
  arguments?: unknown[];
}

export interface LspCodeLens {
  range: LspRange;
  command?: LspCodeLensCommand;
}

export interface LspCompletionItemWithInsert extends LspCompletionItem {
  insertText?: string;
}

export interface FgQueryIndexResult {
  docIds: string[];
  mode: string;
  vaultRoot: string | null;
}
