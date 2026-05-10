export type CommonloomSeverity = 'error' | 'warning' | 'info';

export type CommonloomDiagnosticCode = 'NO_MANIFESTS';

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
