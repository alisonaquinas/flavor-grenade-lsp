export interface CommonloomSourcePosition {
  line?: number;
  column?: number;
}

export interface CommonloomHeading extends CommonloomSourcePosition {
  id: string;
  label: string;
  level: number;
}

export interface CommonloomLinkReference extends CommonloomSourcePosition {
  rawTarget: string;
  resolvedTarget?: string;
  kind: 'external' | 'public-route' | 'same-document' | 'wiki-link' | 'unsupported';
}

export interface CommonloomImageReference extends CommonloomSourcePosition {
  rawTarget: string;
  altText: string;
  resolvedPath?: string;
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

export interface CommonloomConfig {
  copyRoot: string;
  mediaRoot: string;
  generatedRoot: string;
}

export interface CommonloomResult {
  diagnostics: CommonloomDiagnostic[];
}
