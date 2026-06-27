import { listPublishedPosts, type PublishedPostsFilter } from '../../src/cms/posts';
import type { Env, PostRecord } from '../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const filter: PublishedPostsFilter = {};

  const q = url.searchParams.get('q')?.trim();
  if (q) filter.q = q;

  const dateFrom = url.searchParams.get('from');
  if (dateFrom) filter.dateFrom = dateFrom;

  const posts = await listPublishedPosts(env, filter);
  const origin = url.origin;

  return htmlResponse(renderBlogIndex(posts, origin, filter));
};

function renderBlogIndex(posts: PostRecord[], origin: string, filter: PublishedPostsFilter): string {
  const items = posts.map((post) => `
    <article class="journal-entry">
      <div class="entry-meta">
        <time datetime="${escapeAttribute(post.published_at || '')}">${formatDate(post.published_at)}</time>
        ${post.cover_image_key ? `<a class="entry-cover" href="/blog/${encodeURIComponent(post.slug)}" aria-hidden="true" tabindex="-1"><img src="/media/${escapeAttribute(post.cover_image_key)}" alt="" loading="lazy" /></a>` : ''}
      </div>
      <div>
        <h2><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
        ${post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : ''}
      </div>
      <a class="entry-arrow" href="/blog/${encodeURIComponent(post.slug)}" aria-label="Read ${escapeAttribute(post.title)}">-&gt;</a>
    </article>
  `).join('');

  const searchValue = escapeAttribute(filter.q || '');
  const dateFromValue = escapeAttribute(filter.dateFrom || '');
  const hasFilter = !!(filter.q || filter.dateFrom);

  return pageShell('Agent4All Blog', origin, `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-shell">
      <header class="site-header">
        <span class="site-brand">Agent4All Blog</span>
        <nav class="site-nav" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/blog" aria-current="page">Blogs</a>
        </nav>
      </header>
      <main id="main-content" class="journal-main">
        <form class="blog-search" action="/blog" method="get" aria-label="Search posts">
          <input type="search" name="q" placeholder="搜索文章…" value="${searchValue}" />
          <input type="date" name="from" value="${dateFromValue}" aria-label="From date" />
          <button type="submit" class="btn-primary">查找</button>
          ${hasFilter ? `<a href="/blog" class="button">清除</a>` : ''}
        </form>
        <section class="journal-frame" aria-label="Latest posts">
          <div class="margin-rail" aria-hidden="true"><span class="rail-mark"></span></div>
          <div class="journal-list">${items || '<p class="empty-public">No published posts found. Publish a draft from the CMS and it will appear here.</p>'}</div>
        </section>
      </main>
    </div>
  `);
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}

function pageShell(title: string, origin: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeAttribute(origin)}/blog">
  <link rel="stylesheet" href="/theme.css">
</head>
<body>${body}</body>
</html>`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] || char);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
