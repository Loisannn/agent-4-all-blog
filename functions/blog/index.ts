import { listPublishedPosts } from '../../src/cms/posts';
import type { Env, PostRecord } from '../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const posts = await listPublishedPosts(env);
  const origin = new URL(request.url).origin;

  return htmlResponse(renderBlogIndex(posts, origin));
};

function renderBlogIndex(posts: PostRecord[], origin: string): string {
  const items = posts.map((post) => `
    <article class="journal-entry">
      <div class="entry-meta">
        <time datetime="${escapeAttribute(post.published_at || '')}">${formatDate(post.published_at)}</time>
        <span class="entry-kicker">Product note</span>
      </div>
      <div>
        <h2><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
        <p>${escapeHtml(post.excerpt)}</p>
      </div>
      <a class="entry-arrow" href="/blog/${encodeURIComponent(post.slug)}" aria-label="Read ${escapeAttribute(post.title)}">-&gt;</a>
    </article>
  `).join('');

  return pageShell('Agent4All Blog', origin, `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-shell">
      <header class="site-header">
        <a href="/" class="site-brand">Agent4All Blog</a>
        <nav class="site-nav" aria-label="Primary">
          <a href="/blog" aria-current="page">Blog</a>
          <a href="/admin">CMS</a>
        </nav>
      </header>
      <main id="main-content" class="journal-main">
        <section class="journal-hero" aria-labelledby="journal-title">
            <h1 id="journal-title" class="journal-title">Agent4All Blog</h1>
        </section>
        <section class="journal-frame" aria-label="Latest posts">
          <div class="margin-rail" aria-hidden="true"><span class="rail-mark"></span></div>
          <div class="journal-list">${items || '<p class="empty-public">No published posts yet. Publish a draft from the CMS and it will appear here.</p>'}</div>
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
