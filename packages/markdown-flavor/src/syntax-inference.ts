import type { MarkdownFlavorId } from './flavors.js';

const MAX_SYNTAX_SAMPLE_BYTES = 64 * 1024;

/** Infer a Markdown flavor only from strong, low-ambiguity syntax evidence. */
export function inferMarkdownFlavorFromSyntax(
  text: string | undefined,
): MarkdownFlavorId | undefined {
  if (!text) {
    return undefined;
  }
  const sample = text.slice(0, MAX_SYNTAX_SAMPLE_BYTES);

  if (hasMdxEvidence(sample)) {
    return 'mdx';
  }
  if (hasRMarkdownEvidence(sample)) {
    return 'r-markdown';
  }
  if (hasStackOverflowEvidence(sample)) {
    return 'stack-overflow';
  }
  if (hasRedditEvidence(sample)) {
    return 'reddit';
  }
  if (hasGlfmEvidence(sample)) {
    return 'glfm';
  }
  if (hasMultiMarkdownEvidence(sample)) {
    return 'multimarkdown';
  }
  if (hasPandocEvidence(sample)) {
    return 'pandoc';
  }
  if (hasKramdownEvidence(sample)) {
    return 'kramdown';
  }
  if (hasMarkdownExtraEvidence(sample)) {
    return 'markdown-extra';
  }

  return undefined;
}

function hasMdxEvidence(text: string): boolean {
  return (
    /(^|\n)\s*(import|export)\s+[\s\S]*?\n/.test(text) &&
    /<[A-Z][A-Za-z0-9]*(?:\s|>|\/>)/.test(text)
  );
}

function hasRMarkdownEvidence(text: string): boolean {
  return /(^|\n)```\{[a-zA-Z]+(?:\s+[^}]*)?\}/.test(text) || /`r\s+[^`]+`/.test(text);
}

function hasStackOverflowEvidence(text: string): boolean {
  return (
    /\[(?:meta-)?tag:[^\]]+\]/.test(text) ||
    /<!--\s*language(?:-all)?:\s*[^-]+-->/.test(text) ||
    /(^|\n)```\s+lang-[\w-]+/.test(text)
  );
}

function hasRedditEvidence(text: string): boolean {
  return />![\s\S]*?!<|(\s|^)\^\([^)]+\)/.test(text) && /\b[ru]\/[A-Za-z0-9_]+\b/.test(text);
}

function hasGlfmEvidence(text: string): boolean {
  return (
    /\[\[_TOC_\]\]/.test(text) ||
    /(^|\n)\s*[-*]\s+\[~\]\s+/.test(text) ||
    /(^|\s)(?:[#!&]\d+|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#\d+)(?=\s|[.,;)]|$)/.test(text)
  );
}

function hasPandocEvidence(text: string): boolean {
  return (
    /(^|\n)%\s+\S/.test(text) ||
    /(^|\s)\[@[A-Za-z][\w:-]*(?:[,;\]\s])/.test(text) ||
    /(^|\s)@[A-Za-z][\w:-]*(?=\s|[.,;)\]])/.test(text) ||
    /(^|\n):::\s*\{[^}]+\}/.test(text)
  );
}

function hasMultiMarkdownEvidence(text: string): boolean {
  return (
    /^(Title|Author|Date|Keywords):\s+\S/m.test(text) &&
    (/(^|\n)#[^\n]+\[[A-Za-z][\w:-]+\]/.test(text) ||
      /\[#[-\w:]+\]:/.test(text) ||
      /\[[^\]]+\]\[\]/.test(text))
  );
}

function hasKramdownEvidence(text: string): boolean {
  return /(^|\n)\s*\{:\s*[.#][^}]+\}/.test(text) || /(^|\n)#{1,6}[^\n]+\{#[^}]+\}/.test(text);
}

function hasMarkdownExtraEvidence(text: string): boolean {
  return /^\*\[[^\]]+\]:\s+\S/m.test(text) && /(^|\n)\s*\{#[^}]+\}/.test(text);
}
