import type { MarkdownFlavorId } from './markdown-flavor-contract.js';

/** Disposition for flavor syntax that is local, host-owned, or unsupported. */
export type BoundaryDisposition =
  | 'local'
  | 'non-local-host'
  | 'conversion-bound'
  | 'renderer-bound'
  | 'bibliography-bound'
  | 'execution-bound'
  | 'unsupported';

/** Boundary classification plus the human-readable reason for the decision. */
export interface BoundaryClassification {
  disposition: BoundaryDisposition;
  reason: string;
}

/**
 * Classify flavor-specific syntax that should not become a local vault target.
 *
 * The classifier keeps platform references, bibliography references, renderer
 * constructs, and executable chunks out of vault diagnostics and local rename
 * planning unless a later feature explicitly implements that host behavior.
 */
export function classifyMarkdownBoundaryReference(
  flavor: MarkdownFlavorId,
  text: string,
): BoundaryClassification {
  if ((flavor === 'gfm' || flavor === 'glfm') && /^#\d+\b/.test(text)) {
    return { disposition: 'non-local-host', reason: 'platform issue or merge-request reference' };
  }
  if (
    flavor === 'glfm' &&
    /^(?:!\d+\b|&\d+\b|@[A-Za-z0-9][A-Za-z0-9._-]*\b|[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)+#\d+\b)/.test(
      text,
    )
  ) {
    return { disposition: 'non-local-host', reason: 'GitLab platform reference' };
  }
  if (
    flavor === 'pandoc' &&
    /(?:\[@[-A-Za-z0-9_:]+\]|(?<![A-Za-z0-9_])-?@[A-Za-z0-9][A-Za-z0-9_:.-]*)/.test(text)
  ) {
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
