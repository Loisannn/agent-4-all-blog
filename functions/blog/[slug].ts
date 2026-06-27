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
  const contentWithIds = addHeadingIds(post.content_html);
  const headings = extractHeadings(contentWithIds);
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
      <span class="site-brand">Agent4All Blog</span>
      <nav class="site-nav" aria-label="Primary">
        <a href="/">Home</a>
        <a href="/blog">Blogs</a>
      </nav>
    </header>
    <main class="article-main">
      <div class="article-layout">
        <aside class="article-aside" aria-label="Article navigation">
          <div class="reading-rail" aria-hidden="true"><span class="rail-mark"></span></div>
          <nav>
            <p class="toc-label">On this page</p>
            ${headings.length ? `<ol class="toc-list">${headings.map((h) => `<li><a href="#${escapeAttribute(h.id)}">${escapeHtml(h.text)}</a></li>`).join('')}</ol>` : '<p class="toc-list">Article</p>'}
          </nav>
        </aside>
        <article id="article-content">
          <header class="article-header">
            <p class="article-meta">
              <time datetime="${escapeAttribute(post.published_at || '')}">${formatDate(post.published_at)}</time>
            </p>
            <h1 class="article-title">${escapeHtml(post.title)}</h1>
            <p class="article-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="article-author">
              <span class="author-mark">A4</span>
              <span>${escapeHtml(post.author_name || 'Agent4All Engineering')}</span>
            </div>
          </header>
          ${post.cover_image_key ? `<img class="cover" src="/media/${escapeAttribute(post.cover_image_key)}" alt="">` : ''}
          <div class="content">${contentWithIds}</div>
          <footer class="article-footer">
            <a href="/blog">&lt;- All posts</a>
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

interface HeadingItem {
  id: string;
  text: string;
}

function extractHeadings(html: string): HeadingItem[] {
  return Array.from(html.matchAll(/<h([123])\s[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[123]>/g))
    .map((match) => ({ id: match[2], text: stripHtml(match[3]).trim() }))
    .filter((h) => h.text)
    .slice(0, 6);
}

function addHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(/<(h[123])([^>]*)>(.*?)<\/\1>/g, (_full: string, tag: string, attrs: string, body: string) => {
    /* Skip if already has an id */
    if (/\bid\s*=\s*"/.test(attrs)) return _full;
    const text = stripHtml(body).trim();
    if (!text) return _full;
    const baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const count = seen.get(baseId) || 0;
    seen.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}-${count}`;
    return `<${tag}${attrs} id="${id}">${body}</${tag}>`;
  });
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
