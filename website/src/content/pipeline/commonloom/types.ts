export interface CommonloomSourcePosition {
  line?: number;
  column?: number;
}

export interface CommonloomHeading extends CommonloomSourcePosition {
  id: string;
  label: string;
  level: number;
}

export const commonloomLinkKinds = [
  'external',
  'internal',
  'same-document',
  'wiki-link',
  'unsupported',
] as const;

export type CommonloomLinkKind = (typeof commonloomLinkKinds)[number];

export interface CommonloomLinkReference extends CommonloomSourcePosition {
  rawTarget: string;
  resolvedTarget?: string;
  kind: CommonloomLinkKind;
  sourcePath?: string;
}

export interface CommonloomImageReference extends CommonloomSourcePosition {
  rawTarget: string;
  altText: string;
  resolvedPath?: string;
  sourcePath?: string;
}

export interface CommonloomSourceTrace {
  markdownPath: string;
  manifestPath?: string;
  contentHash: string;
  headings: CommonloomHeading[];
  links: CommonloomLinkReference[];
  images: CommonloomImageReference[];
}

export const commonloomSeverities = ['error', 'warning', 'info'] as const;

export type CommonloomSeverity = (typeof commonloomSeverities)[number];

export const commonloomDiagnosticCodes = [
  'NO_MANIFESTS',
  'COPY_NOT_FOUND',
  'FRONTMATTER_INVALID',
  'MARKDOWN_INVALID',
  'HTML_UNSAFE',
  'LINK_UNRESOLVED',
  'MANIFEST_INVALID',
  'MEDIA_UNRESOLVED',
  'MEDIA_ALT_MISSING',
  'PATH_OUTSIDE_ROOT',
] as const;

export type CommonloomDiagnosticCode = (typeof commonloomDiagnosticCodes)[number];

export interface CommonloomDiagnostic {
  code: CommonloomDiagnosticCode;
  severity: CommonloomSeverity;
  message: string;
  sourcePath?: string;
  line?: number;
  column?: number;
}

export const commonloomOutputModes = ['typescript', 'check-only'] as const;

export type CommonloomOutputMode = (typeof commonloomOutputModes)[number];

export interface CommonloomManifestEntry<AdapterData = unknown> {
  id: string;
  sourcePath: string;
  outputName?: string;
  data?: AdapterData;
}

export interface CommonloomHtmlPolicy {
  allowInlineHtml: boolean;
}

export interface CommonloomLinkResolverInput extends CommonloomSourcePosition {
  rawTarget: string;
  sourcePath?: string;
}

export interface CommonloomLinkResolution {
  kind: CommonloomLinkKind;
  resolvedTarget?: string;
  diagnostic?: CommonloomDiagnostic;
}

export interface CommonloomLinkPolicy {
  resolveLink(
    input: CommonloomLinkResolverInput,
  ): CommonloomLinkResolution | Promise<CommonloomLinkResolution>;
}

export interface CommonloomOutputConfig {
  mode: CommonloomOutputMode;
  generatedModuleName?: string;
}

export interface CommonloomConfig {
  copyRoot: string;
  mediaRoot: string;
  generatedRoot: string;
  manifests?: CommonloomManifestEntry[];
  html?: CommonloomHtmlPolicy;
  output?: CommonloomOutputConfig;
  links?: CommonloomLinkPolicy;
}

export interface CommonloomCompiledDocument<Frontmatter = unknown, AdapterData = unknown> {
  manifest: CommonloomManifestEntry<AdapterData>;
  frontmatter: Frontmatter;
  bodyHtml: string;
  sourceTrace: CommonloomSourceTrace;
  diagnostics: CommonloomDiagnostic[];
}

export interface CommonloomResult {
  diagnostics: CommonloomDiagnostic[];
  documents?: CommonloomCompiledDocument[];
}
