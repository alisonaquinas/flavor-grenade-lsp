import { Injectable } from '@nestjs/common';

export type LinkStyle = 'file-stem' | 'title-slug' | 'file-path-stem';

export interface ServerSettingsSnapshot {
  linkStyle: LinkStyle;
  completionCandidates: number;
  diagnosticsSuppress: string[];
}

interface InitializationOptions {
  linkStyle?: unknown;
  completionCandidates?: unknown;
  diagnosticsSuppress?: unknown;
}

const DEFAULT_SETTINGS: ServerSettingsSnapshot = {
  linkStyle: 'file-stem',
  completionCandidates: 50,
  diagnosticsSuppress: [],
};

@Injectable()
export class ServerSettings {
  private settings: ServerSettingsSnapshot = { ...DEFAULT_SETTINGS };

  applyInitializationOptions(options: unknown): void {
    const opts = options as InitializationOptions | null | undefined;
    this.settings = {
      linkStyle: normalizeLinkStyle(opts?.linkStyle),
      completionCandidates: normalizeCompletionCandidates(opts?.completionCandidates),
      diagnosticsSuppress: normalizeDiagnosticsSuppress(opts?.diagnosticsSuppress),
    };
  }

  snapshot(): ServerSettingsSnapshot {
    return {
      linkStyle: this.settings.linkStyle,
      completionCandidates: this.settings.completionCandidates,
      diagnosticsSuppress: [...this.settings.diagnosticsSuppress],
    };
  }
}

function normalizeLinkStyle(value: unknown): LinkStyle {
  if (value === 'file-stem' || value === 'title-slug' || value === 'file-path-stem') {
    return value;
  }
  if (value === 'relative-path') {
    return 'file-path-stem';
  }
  return DEFAULT_SETTINGS.linkStyle;
}

function normalizeCompletionCandidates(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.completionCandidates;
  }
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : DEFAULT_SETTINGS.completionCandidates;
}

function normalizeDiagnosticsSuppress(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}
