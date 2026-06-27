import { getParam } from '../../src/cms/http';
import { getPublishedPostBySlug } from '../../src/cms/posts';
import type { Env, PostRecord } from '../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const slug = safeDecodeURIComponent(getParam(params, 'slug'));
  const post = await getPublishedPostBySlug(env, slug);
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  return htmlResponse(renderPost(post, new URL(request.url).origin));
};

function renderPost(post: PostRecord, origin: string): string {
  const headings = extractHeadings(post.content_html);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(post.title)} | Agent4All Blog</title>
  <meta name="description" content="${escapeAttribute(post.excerpt)}">
  <link rel="canonical" href="${escapeAttribute(origin)}/blog/${encodeURIComponent(post.slug)}">
  <link rel="stylesheet" href="/theme.css">
</head>
<body>
  <a class="skip-link" href="#article-content">Skip to article</a>
  <div class="site-shell">
    <header class="site-header">
      <a href="/" class="site-brand">Agent4All Blog</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="/blog">Blog</a>
        <a href="/admin">CMS</a>
      </nav>
    </header>
    <main class="article-main">
      <div class="article-layout">
        <aside class="article-aside" aria-label="Article navigation">
          <div class="reading-rail" aria-hidden="true"><span class="rail-mark"></span></div>
          <nav>
            <a class="admin-link" href="/blog">All posts</a>
            <p class="toc-label">On this page</p>
            ${headings.length ? `<ol class="toc-list">${headings.map((heading) => `<li>${escapeHtml(heading)}</li>`).join('')}</ol>` : '<p class="toc-list">Article</p>'}
          </nav>
        </aside>
        <article id="article-content">
          <header class="article-header">
            <p class="article-meta">
              <time datetime="${escapeAttribute(post.published_at || '')}">${formatDate(post.published_at)}</time>
              ${escapeHtml(post.category || 'Product note')}
            </p>
            <h1 class="article-title">${escapeHtml(post.title)}</h1>
            <p class="article-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="article-author">
              <span class="author-mark">A4</span>
              <span>${escapeHtml(post.author_name || 'Agent4All Engineering')}</span>
            </div>
          </header>
          ${post.cover_image_key ? `<img class="cover" src="/media/${escapeAttribute(post.cover_image_key)}" alt="">` : ''}
          <div class="content">${post.content_html}</div>
          <footer class="article-footer">
            <a href="/blog">&lt;- All posts</a>
            <a href="/admin">Open CMS -&gt;</a>
          </footer>
        </article>
      </div>
    </main>
  </div>
</body>
</html>`;
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}

function formatDate(value: string | null): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

function extractHeadings(html: string): string[] {
  return Array.from(html.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/g))
    .map((match) => stripHtml(match[1]).trim())
    .filter(Boolean)
    .slice(0, 6);
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
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

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
