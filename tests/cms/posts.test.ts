import { describe, expect, it } from 'vitest';
import { preparePostPayload } from '../../src/cms/posts';

describe('post payload preparation', () => {
  it('normalizes a draft post without a publish timestamp', () => {
    const payload = preparePostPayload({
      title: 'Hello CMS',
      content_markdown: '# Hello',
      status: 'draft',
    }, undefined, '2026-06-22T00:00:00.000Z');

    expect(payload.slug).toBe('hello-cms');
    expect(payload.status).toBe('draft');
    expect(payload.published_at).toBeNull();
    expect(payload.content_html).toContain('<h1>Hello</h1>');
  });

  it('sets a publish timestamp when publishing for the first time', () => {
    const payload = preparePostPayload({
      title: 'Hello CMS',
      content_markdown: 'Body',
      status: 'published',
    }, undefined, '2026-06-22T00:00:00.000Z');

    expect(payload.published_at).toBe('2026-06-22T00:00:00.000Z');
  });

  it('preserves an existing publish timestamp while editing a published post', () => {
    const payload = preparePostPayload({
      title: 'Updated',
      content_markdown: 'Body',
      status: 'published',
    }, { published_at: '2026-06-01T00:00:00.000Z' }, '2026-06-22T00:00:00.000Z');

    expect(payload.published_at).toBe('2026-06-01T00:00:00.000Z');
  });
});
