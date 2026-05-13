import type { MarkdownFlavorId } from './markdown-flavor-contract.js';

export type BoundaryDisposition =
  | 'local'
  | 'non-local-host'
  | 'conversion-bound'
  | 'renderer-bound'
  | 'bibliography-bound'
  | 'execution-bound'
  | 'unsupported';

export interface BoundaryClassification {
  disposition: BoundaryDisposition;
  reason: string;
}

export function classifyMarkdownBoundaryReference(
  flavor: MarkdownFlavorId,
  text: string,
): BoundaryClassification {
  if ((flavor === 'gfm' || flavor === 'glfm') && /^#\d+\b/.test(text)) {
    return { disposition: 'non-local-host', reason: 'platform issue or merge-request reference' };
  }
  if (flavor === 'pandoc' && /\[@[-A-Za-z0-9_:]+\]/.test(text)) {
    return {
      disposition: 'bibliography-bound',
      reason: 'citation key requires bibliography context',
    };
  }
  if (flavor === 'multimarkdown' && /\[[^\]]+\]\[\]/.test(text)) {
    return { disposition: 'conversion-bound', reason: 'export-oriented cross reference' };
  }
  if (flavor === 'mdx' && /<\/?[A-Z][A-Za-z0-9]*(\s|\/|>)/.test(text)) {
    return { disposition: 'renderer-bound', reason: 'JSX component requires MDX project context' };
  }
  if (flavor === 'r-markdown' && /```\{r\b/.test(text)) {
    return { disposition: 'execution-bound', reason: 'R chunk is executable context' };
  }
  if (flavor === 'reddit' && /(^|\s)(r\/|u\/)[A-Za-z0-9_-]+/.test(text)) {
    return { disposition: 'non-local-host', reason: 'Reddit platform reference' };
  }
  if (flavor === 'stack-overflow' && /\[(tag|user|question|answer):[^\]]+\]/.test(text)) {
    return { disposition: 'non-local-host', reason: 'Stack Exchange platform reference' };
  }
  return { disposition: 'local', reason: 'local Markdown syntax or no known boundary' };
}
