import { describe, expect, it } from '@jest/globals';
import { inferMarkdownFlavorFromSyntax } from '../src/index.js';

describe('inferMarkdownFlavorFromSyntax', () => {
  it('infers MDX from import/export plus component syntax', () => {
    expect(inferMarkdownFlavorFromSyntax("import Chart from './Chart'\n\n<Chart />")).toBe('mdx');
  });

  it('infers R Markdown from executable chunk syntax', () => {
    expect(inferMarkdownFlavorFromSyntax('```{r echo=FALSE}\nsummary(cars)\n```')).toBe(
      'r-markdown',
    );
  });

  it('returns undefined when evidence is too weak', () => {
    expect(inferMarkdownFlavorFromSyntax('# Plain Markdown\n\n- item')).toBeUndefined();
  });
});
