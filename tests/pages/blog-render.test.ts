import { describe, expect, it } from 'vitest';
import { onRequestGet as renderBlogIndex } from '../../functions/blog/index';
import { onRequestGet as renderPost } from '../../functions/blog/[slug]';
import type { Env, PostRecord } from '../../src/cms/types';

const posts: PostRecord[] = [
  {
    id: 1,
    slug: 'agent-os-runtime',
    title: 'The Agent OS: a runtime for reliable, observable agents',
    excerpt: 'A lightweight runtime that standardizes tooling, memory, and guardrails.',
    content_markdown: '## Why we built it',
    content_html: '<h2>Why we built it</h2><p>Agents need durable production primitives.</p>',
    cover_image_key: null,
    status: 'published',
    published_at: '2026-06-21T00:00:00.000Z',
    created_at: '2026-06-20T00:00:00.000Z',
    updated_at: '2026-06-21T00:00:00.000Z',
    created_by: 'editor@example.com',
    updated_by: 'editor@example.com',
  },
];

describe('public blog rendering', () => {
  it('renders the blog index as a linear Agent4All Blog journal', async () => {
    const response = await renderBlogIndex({
      env: envWithPosts(posts),
      request: new Request('https://example.com/blog'),
    } as unknown as EventContext<Env, string, Record<string, unknown>>);

    const html = await response.text();

    expect(html).toContain('Agent4All Blog');
    expect(html).toContain('class="journal-list"');
    expect(html).toContain('href="/blog/agent-os-runtime"');
    expect(html).toContain('The Agent OS: a runtime for reliable, observable agents');
  });

  it('renders post detail with the Agent4All Blog shell and reading rail', async () => {
    const response = await renderPost({
      env: envWithPosts(posts),
      params: { slug: 'agent-os-runtime' },
      request: new Request('https://example.com/blog/agent-os-runtime'),
    } as unknown as EventContext<Env, string, Record<string, unknown>>);

    const html = await response.text();

    expect(html).toContain('Agent4All Blog');
    expect(html).toContain('class="reading-rail"');
    expect(html).toContain('Why we built it');
    expect(html).toContain('Agents need durable production primitives.');
  });
});

function envWithPosts(records: PostRecord[]): Env {
  return {
    DB: {
      prepare: () => ({
        bind: (...binds: unknown[]) => ({
          all: async () => ({ results: records }),
          first: async () => records.find((post) => post.slug === binds[0]) || null,
        }),
      }),
    },
    MEDIA_BUCKET: {} as R2Bucket,
  } as unknown as Env;
}
