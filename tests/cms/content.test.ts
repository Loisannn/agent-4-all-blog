import { describe, expect, it } from 'vitest';
import { createExcerpt, renderMarkdown, slugify } from '../../src/cms/content';

describe('content helpers', () => {
  it('creates ASCII-only url-safe slugs', () => {
    expect(slugify(' 第一篇 AI CMS! ')).toBe('ai-cms');
    expect(slugify('')).toBe('post-0');
  });

  it('renders markdown and removes unsafe html', () => {
    const html = renderMarkdown('# Hello\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))');

    expect(html).toContain('<h1>Hello</h1>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:');
  });

  it('keeps markdown images for R2 media paths', () => {
    const html = renderMarkdown('![Cover](/media/uploads/cover.webp)');

    expect(html).toContain('<img');
    expect(html).toContain('src="/media/uploads/cover.webp"');
    expect(html).toContain('alt="Cover"');
  });

  it('returns empty string when no explicit excerpt is supplied', () => {
    expect(createExcerpt('## Title\n\nThis is **body** copy.', '')).toBe('');
    expect(createExcerpt('Ignored', ' Custom excerpt ')).toBe('Custom excerpt');
  });
});
